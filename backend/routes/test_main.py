from fastapi import FastAPI

from backend.routes.transactions import router as transactions_router
from backend.routes.budgets import router as budgets_router  # ⬅️ new
from backend.routes.database import Base, engine

app = FastAPI(title="BloomFi Transactions API Test")


@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database connected and tables ready.")
    except Exception as e:
        print("❌ Database connection failed:", e)


@app.get("/")
def root():
    return {"message": "Transactions & Budgets routes are working!"}


# transaction endpoints
app.include_router(transactions_router, prefix="/transactions", tags=["transactions"])

# budget endpoints
app.include_router(budgets_router, prefix="/budgets", tags=["budgets"])
