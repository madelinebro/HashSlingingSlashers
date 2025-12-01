# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

#from routes.database import engine, Base

import backend.routes.accounts as accounts
import backend.routes.transactions as transactions
import backend.routes.budgets as budgets
import backend.routes.dashboard as dashboard
import backend.routes.profile as profile
from backend.routes.database import engine, Base


app = FastAPI(title="BloomFi Financial Management API")

# -------------------------------------------------
# CORS CONFIG
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# STARTUP: CREATE TABLES
# -------------------------------------------------
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# -------------------------------------------------
# ROUTERS
# -------------------------------------------------

app.include_router(
    accounts.router,
    prefix="/api/accounts",
    tags=["Accounts"],
)

app.include_router(
    transactions.router,
    prefix="/api/transactions",
    tags=["Transactions"],
)

app.include_router(
    budgets.router,
    prefix="/api/budgets",
    tags=["Budgets"],
)

app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    profile.router,
    prefix="/api/profile",
    tags=["Profile"],
)

# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "healthy"}

# -------------------------------------------------
# DEV ENTRYPOINT (optional)
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
