# -------------------------------------------------------------
# DATABASE CONNECTION & MODELS
# -------------------------------------------------------------
from sqlalchemy import (
    create_engine, Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, DECIMAL
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv
import os

# -------------------------------------------------------------
# LOAD ENV VARIABLES
# -------------------------------------------------------------
load_dotenv()  # loads variables from .env file

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------------------------------------------
# DEPENDENCY: DATABASE SESSION
# -------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# MODELS
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
    budgets = relationship("Budget", back_populates="user")

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
    transaction_id = Column(Integer, primary_key=True)
    accountnumber = Column(Integer, ForeignKey("accounts.accountnumber", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    transaction_date = Column(TIMESTAMP, default=datetime.utcnow)
    transaction_type = Column(String(20), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    description = Column(String(70))
    category = Column(String(50))
    state = Column(String(20))

    account = relationship("Account", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"
    budget_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    period = Column(String(20), nullable=False, default="monthly")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="budgets")


