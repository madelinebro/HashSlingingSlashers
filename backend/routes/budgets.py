"""
Budget Routes
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .database import get_db, Budget  # ⬅️ import Budget from database

router = APIRouter()


# --------------------------------------------------
# Pydantic Models
# --------------------------------------------------
class BudgetCreate(BaseModel):
    category: str
    amount: float = Field(..., gt=0)
    period: str = "monthly"  # 'weekly', 'monthly', 'yearly'


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    period: Optional[str] = None


class BudgetResponse(BaseModel):
    budget_id: int
    user_id: int
    category: str
    amount: float
    period: str
    created_at: datetime

    class Config:
        orm_mode = True


# --------------------------------------------------
# Temporary auth (replace with real JWT later)
# --------------------------------------------------
def get_current_user() -> int:
    # TODO: plug this into your real auth
    return 1


def _to_budget_response(budget: Budget) -> BudgetResponse:
    return BudgetResponse(
        budget_id=budget.budget_id,
        user_id=budget.user_id,
        category=budget.category,
        amount=float(budget.amount),
        period=budget.period,
        created_at=budget.created_at,
    )


# --------------------------------------------------
# Routes
# --------------------------------------------------

@router.get(
    "/",
    response_model=List[BudgetResponse],
    summary="Get all budgets for current user",
)
def get_budgets(
    period: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    """
    Get all budgets for the current user.

    Optional query param:
      - `period`: filter by 'weekly', 'monthly', 'yearly'
    """
    query = db.query(Budget).filter(Budget.user_id == user_id)

    if period:
        query = query.filter(Budget.period == period)

    budgets = query.order_by(Budget.created_at.desc()).all()
    return [_to_budget_response(b) for b in budgets]


@router.get(
    "/{budget_id}",
    response_model=BudgetResponse,
    summary="Get a single budget by ID",
)
def get_budget_by_id(
    budget_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.budget_id == budget_id, Budget.user_id == user_id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    return _to_budget_response(budget)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=BudgetResponse,
    summary="Create a new budget",
)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    new_budget = Budget(
        user_id=user_id,
        category=budget.category,
        amount=budget.amount,
        period=budget.period,
        created_at=datetime.utcnow(),
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return _to_budget_response(new_budget)


@router.put(
    "/{budget_id}",
    response_model=BudgetResponse,
    summary="Update an existing budget",
)
def update_budget(
    budget_id: int,
    updates: BudgetUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.budget_id == budget_id, Budget.user_id == user_id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    if updates.category is not None:
        budget.category = updates.category
    if updates.amount is not None:
        budget.amount = updates.amount
    if updates.period is not None:
        budget.period = updates.period

    db.commit()
    db.refresh(budget)

    return _to_budget_response(budget)


@router.delete(
    "/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a budget",
)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.budget_id == budget_id, Budget.user_id == user_id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    db.delete(budget)
    db.commit()
    return

