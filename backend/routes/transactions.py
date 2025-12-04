# -------------------------------------------------------------
#  TRANSACTIONS ROUTES
#  Purpose:
#    Handles viewing user transaction history and individual records.
#    Connected directly to PostgreSQL via SQLAlchemy ORM models.
#
#  Endpoints:
#    GET /transactions
#       → Returns all transactions for the current authenticated user
#       → Supports optional start_date / end_date filters
#
#    GET /transactions/{transaction_id}
#       → Returns details for a single transaction
#
#  Notes:
#    - Uses a dummy get_current_user() for now (replace with JWT later)
# -------------------------------------------------------------
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import get_db, Transaction, Account


# -------------------------------------------------------------
#  TEMPORARY AUTH (replace later with JWT authentication)
# -------------------------------------------------------------
def get_current_user() -> int:
    """Return a hardcoded user_id for testing (simulates logged-in user)."""
    return 1


router = APIRouter()


# -------------------------------------------------------------
#  Pydantic response model
# -------------------------------------------------------------
class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    accountnumber: int
    transaction_type: str
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    transaction_date: datetime

    class Config:
        orm_mode = True


# -------------------------------------------------------------
#  GET /transactions
#  Return all transactions for the authenticated user
#  Optional filters: start_date and end_date (YYYY-MM-DD)
# -------------------------------------------------------------
@router.get(
    "/",
    response_model=List[TransactionResponse],
    summary="Get all transactions for the current user (optional date filter)",
    description="Return all transactions that belong to the authenticated user, optionally filtered by a date range.",
)
def get_transactions(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    start_date: Optional[str] = Query(
        None, description="Filter transactions on or after this date (YYYY-MM-DD)"
    ),
    end_date: Optional[str] = Query(
        None, description="Filter transactions on or before this date (YYYY-MM-DD)"
    ),
):
    # Base query — all transactions for this user
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    # Apply optional date filters
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.transaction_date >= start)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD.",
            )

    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Transaction.transaction_date <= end)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD.",
            )

    # Execute query — newest first
    transactions = query.order_by(Transaction.transaction_date.desc()).all()

    # Let FastAPI + Pydantic handle the conversion via orm_mode
    # But we still cast amount to float to avoid Decimal serialization issues
    responses: List[TransactionResponse] = []
    for tx in transactions:
        responses.append(
            TransactionResponse(
                transaction_id=tx.transaction_id,
                user_id=tx.user_id,
                accountnumber=tx.accountnumber,
                transaction_type=tx.transaction_type,
                amount=float(tx.amount),
                description=tx.description,
                category=tx.category,
                state=tx.state,
                transaction_date=tx.transaction_date,
            )
        )

    return responses


# -------------------------------------------------------------
#  GET /transactions/{transaction_id}
#  Return a single transaction
# -------------------------------------------------------------
@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Get a single transaction by ID",
    description="Return details for a specific transaction owned by the authenticated user.",
)
def get_transaction_by_id(
    transaction_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Ensure the transaction belongs to this user.
    # We can check via Transaction.user_id directly,
    # or join with Account if you want ownership via accounts.
    tx = (
        db.query(Transaction)
        .join(Account, Transaction.accountnumber == Account.accountnumber)
        .filter(Account.user_id == user_id, Transaction.transaction_id == transaction_id)
        .first()
    )

    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    return TransactionResponse(
        transaction_id=tx.transaction_id,
        user_id=tx.user_id,
        accountnumber=tx.accountnumber,
        transaction_type=tx.transaction_type,
        amount=float(tx.amount),
        description=tx.description,
        category=tx.category,
        state=tx.state,
        transaction_date=tx.transaction_date,
    )
