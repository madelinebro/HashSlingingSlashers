"""
Dashboard API Routes
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import get_db, Account, Transaction

router = APIRouter()

def get_current_user():
    return 1

def format_currency(amount: float) -> str:
    return f"${amount:,.2f}"

@router.get("/", summary="Get dashboard overview")
def get_dashboard(
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user)
):
    """Get account summary and recent transactions"""
    
    total_balance = (
        db.query(func.coalesce(func.sum(Account.balance), 0.0))
        .filter(Account.user_id == user_id)
        .scalar()
        or 0.0
    )

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(5)
        .all()
    )

    tx_list = [
        {
            "description": tx.description or "Unknown",
            "amount": float(tx.amount),
            "formatted_amount": f"{'+' if tx.transaction_type == 'Deposit' else '-'}{format_currency(abs(float(tx.amount)))}",
            "category": tx.category or "Uncategorized",
            "timestamp": tx.transaction_date.isoformat() if tx.transaction_date else None,
        }
        for tx in transactions
    ]

    return {
        "total_balance": round(float(total_balance), 2),
        "formatted_balance": format_currency(total_balance),
        "recent_transactions": tx_list,
    }

@router.post("/transfer", summary="Transfer money between accounts")
def transfer_money(
    from_account: int,
    to_account: int,
    amount: float,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    """Transfer money between user's accounts"""
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if from_account == to_account:
        raise HTTPException(status_code=400, detail="Cannot transfer to same account")

    from_acc = db.query(Account).filter(
        Account.accountnumber == from_account, 
        Account.user_id == user_id
    ).first()
    to_acc = db.query(Account).filter(
        Account.accountnumber == to_account, 
        Account.user_id == user_id
    ).first()

    if not from_acc or not to_acc:
        raise HTTPException(status_code=404, detail="Account not found")
    if float(from_acc.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    from_acc.balance = float(from_acc.balance) - amount
    to_acc.balance = float(to_acc.balance) + amount
    db.commit()

    return {
        "message": "Transfer completed",
        "from_balance": round(float(from_acc.balance), 2),
        "to_balance": round(float(to_acc.balance), 2),
    }
