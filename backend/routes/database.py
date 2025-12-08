# pyright: reportIncompatibleMethodOverride=false
# pyright: reportArgumentType=false

# -------------------------------------------------------------
#  DATABASE CONNECTION & MODELS
#  Purpose:
#    • Define the PostgreSQL connection (SQLAlchemy ORM)
#    • Create reusable session dependency (get_db)
#    • Define data models for users, accounts, and transactions
#
#  Models:
#    1. User → represents a single registered user
#    2. Account → represents a user’s financial account
#    3. Transaction → represents deposits, withdrawals, or transfers
#
#  Relationships:
#    • One User → Many Accounts
#    • One Account → Many Transactions
# -------------------------------------------------------------
from sqlalchemy import (
    create_engine, Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, DECIMAL
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("CONNECTION")

if DB_URL is None:
    raise ValueError("DATABASE_URL is not set in the environment")

engine = create_engine(DB_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# -------------------------------------------------------------
#  DEPENDENCY: DATABASE SESSION
# -------------------------------------------------------------
# This helper provides a clean session for each request
# and automatically closes the connection afterward.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
#  MODELS
# -----------------------------

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="user")
    budgets = relationship("Budget", back_populates="user")   # ⬅️ add this line


class Account(Base):
    __tablename__ = "accounts"

    accountnumber = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    account_type = Column(String(20), nullable=False)
    balance = Column(Numeric(15, 2), default=0.00)
    account_display_number = Column(String(20))

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[int] = mapped_column(primary_key=True)
    accountnumber: Mapped[int] = mapped_column(ForeignKey("accounts.accountnumber", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    transaction_date: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(String(70))
    category: Mapped[str | None] = mapped_column(String(50))
    state: Mapped[str | None] = mapped_column(String(20))

    account: Mapped["Account"] = relationship("Account", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    period = Column(String(20), nullable=False, default="monthly")  # e.g. 'weekly', 'monthly', 'yearly'
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="budgets")


