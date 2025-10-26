# -------------------------------------------------------------
#  PROFILE MODULE
#  Purpose:
#    Expose read/write endpoints for the authenticated user's profile
#    and user-specific settings. Includes a colocated logout route.
#
#  Endpoints:
#    GET    /profile               Return profile + selected fields
#    PATCH  /profile               Update profile fields (CSRF required)
#    GET    /profile/settings      Return settings JSON
#    PUT    /profile/settings      Merge & save settings JSON (CSRF required)
#    POST   /profile/logout        CSRF-protected logout (clear CSRF cookie)
#
#  AuthN/AuthZ:
#    - All routes require a valid JWT (Authorization: Bearer <token>)
#    - State-changing routes (PATCH/PUT/POST logout) also require CSRF
#
#  Data model expectations (User):
#    id, email, password_hash, created_at,
#    full_name, mobile, username, picture_url, settings_json (JSON/dict)
# -------------------------------------------------------------

from typing import Any, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .routes.database import get_db, User
from .authorize import get_current_user, validate_csrf

router = APIRouter()


# =============================================================
# Helpers
# =============================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()

def normalize_mobile(mobile: str) -> str:
    # Keep digits only; formatting belongs on the frontend
    return "".join(ch for ch in mobile if ch.isdigit())

def validate_username_rules(username: str) -> None:
    # Simple team-wide rule: 3–30 chars, letters/numbers/underscore/period
    import re
    if not re.fullmatch(r"[A-Za-z0-9._]{3,30}", username):
        raise HTTPException(status_code=400, detail="Username must be 3–30 chars: letters, numbers, dot, underscore only.")


# =============================================================
# Schemas
# =============================================================

class ProfileOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    username: Optional[str] = None
    picture_url: Optional[str] = None

class ProfilePatch(BaseModel):
    # All fields optional for PATCH
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    username: Optional[str] = None
    picture_url: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() or None if isinstance(v, str) else v

    @field_validator("mobile")
    @classmethod
    def _norm_mobile(cls, v: Optional[str]) -> Optional[str]:
        return normalize_mobile(v) if isinstance(v, str) else v

    @field_validator("username")
    @classmethod
    def _check_username(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            validate_username_rules(v)
        return v

class SettingsIn(BaseModel):
    # Free-form settings blob; we treat it as a shallow merge on PUT
    settings: Dict[str, Any]


# =============================================================
# Read: profile
# =============================================================

@router.get(
    "/",
    response_model=ProfileOut,
    summary="Return the current user's profile",
)
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ProfileOut(
        id=user.id,
        email=user.email,
        full_name=getattr(user, "full_name", None),
        mobile=getattr(user, "mobile", None),
        username=getattr(user, "username", None),
        picture_url=getattr(user, "picture_url", None),
    )


# =============================================================
# Write: profile (PATCH)
# =============================================================

@router.patch(
    "/",
    response_model=ProfileOut,
    summary="Update selected profile fields (email, full_name, mobile, username, picture_url)",
)
def update_profile(
    payload: ProfilePatch,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Enforce CSRF for state-changing operation
    validate_csrf(request)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email is not None:
        new_email = normalize_email(payload.email)
        if new_email != user.email:
            # Fast duplicate check; IntegrityError is still caught below
            if db.query(User).filter(User.email == new_email).first():
                raise HTTPException(status_code=409, detail="Email already in use")
            user.email = new_email

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.mobile is not None:
        user.mobile = payload.mobile  # already normalized by validator

    if payload.username is not None:
        # if db.query(User).filter(User.username == payload.username, User.id != user_id).first():
        #     raise HTTPException(status_code=409, detail="Username already in use")
        user.username = payload.username

    if payload.picture_url is not None:
        user.picture_url = payload.picture_url

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Covers races on unique email/username if DB has constraints
        raise HTTPException(status_code=409, detail="Profile update conflict (duplicate value)")
    db.refresh(user)

    return ProfileOut(
        id=user.id,
        email=user.email,
        full_name=getattr(user, "full_name", None),
        mobile=getattr(user, "mobile", None),
        username=getattr(user, "username", None),
        picture_url=getattr(user, "picture_url", None),
    )


# =============================================================
# Read: settings
# =============================================================

@router.get(
    "/settings",
    summary="Return the user's settings JSON blob",
)
def get_settings(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Provide a consistent object (never null) to the frontend
    return {"settings": getattr(user, "settings_json", {}) or {}}


# =============================================================
# Write: settings (merge)
# =============================================================

@router.put(
    "/settings",
    summary="Merge and save the user's settings JSON (CSRF required)",
)
def put_settings(
    payload: SettingsIn,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Enforce CSRF for state-changing operation
    validate_csrf(request)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current = getattr(user, "settings_json", {}) or {}
    if not isinstance(current, dict):
        current = {}

    # Shallow merge
    merged = {**current, **(payload.settings or {})}
    setattr(user, "settings_json", merged)

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"settings": merged}


# =============================================================
# Logout (colocated convenience route)
# =============================================================

@router.post(
    "/logout",
    summary="Logout (CSRF-protected) — clears CSRF cookie",
    status_code=status.HTTP_200_OK,
)
def logout(request: Request, response: Response):
    # Enforce CSRF: header X-CSRF-Token must match csrf_token cookie
    validate_csrf(request)
    # Clear CSRF cookie (stateless JWT cannot be revoked without a denylist)
    response.delete_cookie("csrf_token", path="/")
    return {"message": "Logout successful"}

