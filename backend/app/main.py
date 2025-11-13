# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import config first (no dependencies)
from config import settings

# Import database (depends on config only)
from routes.database import engine, Base

# Import routes in dependency order
from routes import auth          # auth has no dependencies on other routes
from routes import accounts       # accounts depends on auth
from routes import transactions   # transactions depends on auth
from routes import budgets        # budgets depends on auth

app = FastAPI(title="Financial Management API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
