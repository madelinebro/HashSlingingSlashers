# -------------------------------------------------------------
#  ACCOUNTS ROUTES
#  Purpose:
#    Manage user bank accounts (list, create, get by ID)
#
#  Endpoints:
#    GET /api/accounts
#    GET /api/accounts/{accountnumber}
#    POST /api/accounts
# -------------------------------------------------------------

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from .database import get_db, Account, User

router = APIRouter()


# TEMP AUTH (replace with JWT later)
def get_current_user():
    """Simulated authenticated user"""
    return 1


# ------------------------------
# Pydantic Schemas
# ------------------------------

class AccountCreate(BaseModel):
    account_type: str
    account_display_number: str | None = None


class AccountResponse(BaseModel):
    accountnumber: int
    user_id: int
    account_type: str
    balance: float
    account_display_number: str | None

    class Config:
        orm_mode = True


# -------------------------------------------------------------
# GET /accounts — list all accounts for current user
# -------------------------------------------------------------
@router.get("/", response_model=list[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    return accounts


# -------------------------------------------------------------
# GET /accounts/{accountnumber} — get one account
# -------------------------------------------------------------
@router.get("/{accountnumber}", response_model=AccountResponse)
def get_account(
    accountnumber: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    account = (
        db.query(Account)
        .filter(Account.accountnumber == accountnumber,
                Account.user_id == user_id)
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or does not belong to user"
        )

    return account


# -------------------------------------------------------------
# POST /accounts — create new account
# -------------------------------------------------------------
@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    # Verify user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User does not exist.")

    new_account = Account(
        user_id=user_id,
        account_type=data.account_type,
        balance=0.00,
        account_display_number=data.account_display_number or "***0000"
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return new_account
