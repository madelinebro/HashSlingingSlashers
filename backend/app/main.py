#update backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from config import settings  # not used yet

from backend.routes.database import engine, Base

# Import submodules directly
import backend.routes.auth as auth
import backend.routes.accounts as accounts
import backend.routes.transactions as transactions
import backend.routes.budgets as budgets

app = FastAPI(title="Financial Management API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create tables if they don't exist
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])

@app.get("/")
def root():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
