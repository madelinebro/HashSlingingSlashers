"""
Budget Routes for Financial Management API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
from .database import get_db

router = APIRouter()


# Pydantic Models
class BudgetCreate(BaseModel):
    category: str
    amount: float = Field(..., gt=0)
    period: str = "monthly"  # monthly, weekly, yearly


class BudgetResponse(BaseModel):
    budget_id: int
    user_id: int
    category: str
    amount: float
    period: str
    created_at: datetime


# Temporary auth (replace with real JWT later)
def get_current_user():
    return 1


# Routes
@router.get("/", summary="Get all budgets")
def get_budgets(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """Get all budgets for the current user"""
    # TODO: Implement with Budget model from database
    return {"budgets": [], "message": "Budget feature coming soon"}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """Create a new budget"""
    # TODO: Implement with Budget model from database
    return {"message": "Budget creation coming soon"}
