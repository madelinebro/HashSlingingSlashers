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
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from .database import get_db, Transaction, Account

## -------------------------------------------------------------
#  TEMPORARY AUTH (replace later with JWT authentication)
def get_current_user():
    """Return a hardcoded user_id for testing (simulates logged-in user)."""
    return 1

router = APIRouter()

# -------------------------------------------------------------
#  GET /transactions
#  Return all transactions for the authenticated user
#  Optional filters: start_date and end_date (YYYY-MM-DD)
@router.get(
    "/",
    summary="Get all transactions for the current user (optional date filter)",
    description="Return all transactions that belong to the authenticated user, optionally filtered by a date range."
)
def get_transactions(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
   
    start_date: str | None = Query(None, description="Filter transactions after this date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Filter transactions before this date (YYYY-MM-DD)"),
):
    # Build base query — all transactions for this user
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    

    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.transaction_date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")

    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Transaction.transaction_date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")
        
     # Execute query — newest first
    transactions = query.order_by(Transaction.transaction_date.desc()).all()

    if not transactions:
        return []

    return [
        {
            "transaction_id": tx.transaction_id,
            "user_id": tx.user_id,
            "accountnumber": tx.accountnumber,
            "transaction_type": tx.transaction_type,
            "amount": float(tx.amount),
            "description": tx.description,
            "category": tx.category,
            "state": tx.state,
            "transaction_date": tx.transaction_date.isoformat(),
        }
        for tx in transactions
    ]


@router.get(
    "/{transaction_id}",
    summary="Get a single transaction by ID",
    description="Return details for a specific transaction owned by the authenticated user."
)
def get_transaction_by_id(
    transaction_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
   
):
    # Query the transaction with a join to verify user ownership
    tx = (
        db.query(Transaction)
        .join(Account, Transaction.accountnumber == Account.accountnumber)
        .filter(Account.user_id == user_id, Transaction.transaction_id == transaction_id)
        .first()
    )

    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    return {
        "transaction_id": tx.transaction_id,
        "user_id": tx.user_id,
        "accountnumber": tx.accountnumber,
        "transaction_type": tx.transaction_type,
        "amount": float(tx.amount),
        "description": tx.description,
        "category": tx.category,
        "state": tx.state,
        "transaction_date": tx.transaction_date.isoformat(),
    }
