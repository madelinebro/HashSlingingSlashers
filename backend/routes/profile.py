"""
Profile API Routes
- View and update the current user's profile
- Simple dummy auth (get_current_user) for now
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .database import get_db, User


router = APIRouter()


# -------------------------------------------------------------
#  TEMP AUTH (replace with real auth / JWT later)
# -------------------------------------------------------------
def get_current_user() -> int:
    """Return a hardcoded user_id for testing (simulates logged-in user)."""
    return 1


# -------------------------------------------------------------
#  Pydantic models
# -------------------------------------------------------------
class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        # Pydantic v2 style (replacement for orm_mode=True)
        from_attributes = True


# -------------------------------------------------------------
#  GET /profile
#  Return current user's profile
# -------------------------------------------------------------
@router.get(
    "/",
    response_model=ProfileResponse,
    summary="Get user profile",
    description="Fetch the current authenticated user's profile information.",
)
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return ProfileResponse.model_validate(user)


# -------------------------------------------------------------
#  PUT /profile
#  Update current user's profile
# -------------------------------------------------------------
@router.put(
    "/",
    response_model=ProfileResponse,
    summary="Update user profile",
    description="Update the current user's profile fields (partial update allowed).",
)
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Partial update: only update fields that were actually sent
    if profile.username is not None:
        user.username = profile.username # type: ignore
    if profile.email is not None:
        user.email = profile.email # type: ignore
    if profile.phone_number is not None:
        user.phone_number = profile.phone_number # type: ignore

    db.commit()
    db.refresh(user)

    return ProfileResponse.model_validate(user)


# -------------------------------------------------------------
#  GET /profile/settings
#  Stub endpoint for user settings / preferences
# -------------------------------------------------------------
@router.get(
    "/settings",
    summary="Get user settings",
    description="Return user settings / preferences (stubbed for now).",
)
def get_settings(
    user_id: int = Depends(get_current_user),
):
    # You can later wire this to a real settings table if needed
    return {
        "user_id": user_id,
        "notifications_enabled": True,
        "theme": "light",
        "language": "en",
    }
