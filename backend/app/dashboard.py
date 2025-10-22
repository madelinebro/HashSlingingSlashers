# -------------------------------------------------------------
#  DASHBOARD MODULE
#  Purpose:
#    This file powers the user's banking dashboard.
#    It handles:
#       Displaying total account balance
#       Listing recent transactions
#       Enabling money transfers between accounts
#
#  Endpoints:
#    GET  /dashboard       Summary + recent transactions
#    POST /transfer        Move money between accounts
#
#  Security:
#    - Requires a valid JWT (Authorization: Bearer <token>)
#    - CSRF not required for GET requests
#    - CSRF validation enforced for POST /transfer
# -------------------------------------------------------------

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
import secrets

from .routes.database import get_db, Account, Transaction
from .authorize import get_current_user
from .login import validate_csrf

router = APIRouter()


# =============================================================
# Helper: Format money values
# =============================================================
def format_currency(amount: float) -> str:
    """Formats currency consistently for display on the frontend."""
    return f"${amount:,.2f}"


# =============================================================
# Endpoint: Dashboard Overview
# =============================================================
@router.get(
    "/dashboard",
    summary="Return account summary and recent transactions",
)
def get_dashboard(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    """
    This endpoint powers the main dashboard view.
    It gathers:
      1) The user's total available balance (sum across accounts)
      2) Their 5 most recent transactions
    """
    # Step 1: Aggregate the total balance across all user accounts
    total_balance = (
        db.query(func.coalesce(func.sum(Account.balance), 0.0))
        .filter(Account.user_id == user_id)
        .scalar()
        or 0.0
    )

    # Step 2: Retrieve the most recent 5 transactions
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    # Step 3: Shape transactions for the frontend
    tx_list = [
        {
            "description": tx.note or "Unknown",
            "amount": float(tx.amount),
            "formatted_amount": f"{'+' if tx.amount > 0 else '-'}{format_currency(abs(tx.amount))}",
            "category": tx.category or "Uncategorized",
            "timestamp": tx.created_at.isoformat(),
        }
        for tx in transactions
    ]

    # Step 4: Return payload matching dashboard layout
    return {
        "total_balance": round(float(total_balance), 2),
        "formatted_balance": format_currency(total_balance),
        "recent_transactions": tx_list,
        "message": "Dashboard data retrieved successfully.",
    }


# =============================================================
# Endpoint: Transfer Money
# =============================================================
@router.post(
    "/transfer",
    summary="Transfer money between user accounts (CSRF-protected)",
)
def transfer_money(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    """
    Handles money transfer between two user-owned accounts.

    Steps:
      1. Validate CSRF token (required for state changes).
      2. Extract form data from request.
      3. Verify both accounts belong to the authenticated user.
      4. Ensure sufficient funds in the source account.
      5. Execute transfer atomically and log both transactions.
      6. Return updated balances.
    """
    # Step 1: Validate CSRF token from cookie/header
    validate_csrf(request)

    form_data = await request.json()
    from_id = form_data.get("from_account")
    to_id = form_data.get("to_account")
    amount = Decimal(form_data.get("amount", 0))

    # Step 2: Validate inputs
    if not all([from_id, to_id, amount]):
        raise HTTPException(status_code=400, detail="Missing transfer fields.")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if from_id == to_id:
        raise HTTPException(status_code=400, detail="Cannot transfer within the same account.")

    # Step 3: Fetch accounts and confirm ownership
    from_acc = db.query(Account).filter(Account.id == from_id, Account.user_id == user_id).first()
    to_acc = db.query(Account).filter(Account.id == to_id, Account.user_id == user_id).first()

    if not from_acc or not to_acc:
        raise HTTPException(status_code=403, detail="Unauthorized account access.")

    # Step 4: Check sufficient funds
    if from_acc.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for transfer.")

    # Step 5: Perform transfer
    from_acc.balance -= amount
    to_acc.balance += amount

    # Log transactions for both accounts
    debit_tx = Transaction(
        user_id=user_id,
        account_id=from_acc.id,
        amount=-amount,
        note=f"Transfer to {to_acc.name}",
        category="Transfer",
        created_at=datetime.utcnow(),
    )
    credit_tx = Transaction(
        user_id=user_id,
        account_id=to_acc.id,
        amount=amount,
        note=f"Transfer from {from_acc.name}",
        category="Transfer",
        created_at=datetime.utcnow(),
    )

    db.add_all([debit_tx, credit_tx])
    db.commit()

    # Step 6: Return result
    return {
        "message": "Transfer completed successfully.",
        "from_account_balance": round(float(from_acc.balance), 2),
        "to_account_balance": round(float(to_acc.balance), 2),
    }
