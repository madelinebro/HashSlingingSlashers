# -------------------------------------------------------------
#  USER SETTINGS MODULE
#  Purpose:
#    Centralize authenticated user settings actions:
#      • Edit profile fields (full_name, email, mobile, username, picture_url)
#      • Change password (verify current, enforce strength, update hash)
#
#  Endpoints:
#    GET   /settings/profile          Read profile snapshot
#    PATCH /settings/profile          Update profile fields (CSRF required)
#    POST  /settings/change-password  Change password (CSRF required)
#
#  Security:
#    - All routes require a valid JWT (Authorization: Bearer <token>)
#    - State-changing routes require CSRF (X-CSRF-Token header matches cookie)
#
#  Data model expectations (User):
#    id, email, password_hash, created_at,
#    full_name, mobile, username, picture_url
# -------------------------------------------------------------

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.hash import bcrypt

from .routes.database import get_db, User
from .authorize import get_current_user, validate_csrf

router = APIRouter()


# =============================================================
# Helpers (normalization & validation)
# =============================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()

def normalize_mobile(mobile: str) -> str:
    # Keep digits only; frontend can format on display
    return "".join(ch for ch in mobile if ch.isdigit())

def validate_username_rules(username: str) -> None:
    # 3–30 chars, letters/numbers/underscore/dot
    import re
    if not re.fullmatch(r"[A-Za-z0-9._]{3,30}", username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3–30 characters: letters, numbers, dot, underscore only.",
        )

def validate_password_strength(pw: str) -> None:
    # Minimal, readable policy: 8+ chars, 1 number, 1 letter
    import re
    if len(pw) < 8 or not re.search(r"[A-Za-z]", pw) or not re.search(r"\d", pw):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include letters and numbers.",
        )


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

class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def _strength(cls, v: str) -> str:
        validate_password_strength(v)
        return v


# =============================================================
# GET /settings/profile — read profile snapshot
# =============================================================

@router.get(
    "/profile",
    response_model=ProfileOut,
    summary="Return the current user's profile snapshot",
)
def get_profile_settings(
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
# PATCH /settings/profile — edit profile fields (CSRF required)
# =============================================================

@router.patch(
    "/profile",
    response_model=ProfileOut,
    summary="Update profile fields (email, full_name, mobile, username, picture_url)",
)
def patch_profile_settings(
    payload: ProfilePatch,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # CSRF for state-changing operation
    validate_csrf(request)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Email change (normalize + simple conflict check)
    if payload.email is not None:
        new_email = normalize_email(payload.email)
        if new_email != user.email:
            exists = db.query(User).filter(User.email == new_email).first()
            if exists:
                raise HTTPException(status_code=409, detail="Email already in use")
            user.email = new_email

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.mobile is not None:
        user.mobile = payload.mobile  # already normalized

    if payload.username is not None:
        # conflict = db.query(User).filter(User.username == payload.username, User.id != user_id).first()
        # if conflict:
        #     raise HTTPException(status_code=409, detail="Username already in use")
        user.username = payload.username

    if payload.picture_url is not None:
        user.picture_url = payload.picture_url

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Handles rare race condition with unique constraints
        raise HTTPException(status_code=409, detail="Profile update conflict")
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
# POST /settings/change-password — change password (CSRF required)
# =============================================================

@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password (verify current, enforce strength, save bcrypt hash)",
)
def change_password(
    payload: ChangePasswordIn,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # CSRF for state-changing operation
    validate_csrf(request)

    # Fetch user and verify current password
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.verify(payload.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Prevent setting the same password again
    if bcrypt.verify(payload.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different from the current password")

    # Hash and save new password
    user.password_hash = bcrypt.hash(payload.new_password)
    db.add(user)
    db.commit()

    return {"message": "Password changed successfully"}
