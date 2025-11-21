"""
Profile API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from .database import get_db, User

router = APIRouter()

def get_current_user():
    return 1


class ProfileUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    phone_number: str | None = None


@router.get("/", summary="Get user profile")
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """Get current user's profile information"""
    
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.put("/", summary="Update user profile")
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """Update current user's profile"""
    
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile.username:
        user.username = profile.username
    if profile.email:
        user.email = profile.email
    if profile.phone_number:
        user.phone_number = profile.phone_number
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Profile updated successfully",
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email
    }


@router.get("/settings", summary="Get user settings")
def get_settings(
    user_id: int = Depends(get_current_user)
):
    """Get user preferences and settings"""
    return {
        "notifications_enabled": True,
        "theme": "light",
        "language": "en"
    }

