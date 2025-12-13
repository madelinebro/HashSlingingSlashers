from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.profile import router as profile_router
from backend.routes.accounts import router as accounts_router
from backend.routes.budgets import router as budgets_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.transactions import router as transactions_router

app = FastAPI(title="BloomFi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router, prefix="/api/profile", tags=["profile"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["accounts"])
app.include_router(budgets_router, prefix="/api/budgets", tags=["budgets"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["transactions"])
