# -------------------------------------------------------------
#  APPLICATION ENTRYPOINT
#  Purpose:
#    - Create and configure the FastAPI app
#    - Enable CORS for the frontend
#    - Initialize the database on startup
#    - Mount feature routers (auth, dashboard, profile, user settings, budgets, transactions)
#    - Provide health and root endpoints
#
#  Notes for the team:
#    - If running behind a reverse proxy (nginx, fly.io, etc.), keep HTTPS termination
#      so Secure cookies (CSRF) work as intended.
#    - CORS settings here are intentionally explicit and easy to adjust per env.
# -------------------------------------------------------------

from typing import List, Optional
import os

from fastapi import FastAPI
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware

from .routes.database import Base, engine

# -------------------------------------------------------------
# Routers
# We import routers with defensive aliasing to avoid a naming clash:
# -------------------------------------------------------------

# Auth (register/login/logout)
from .login import router as auth_router

# Dashboard (overview + transfers)
from .dashboard import router as dashboard_router

# Profile (view/update profile + settings JSON + logout)
from .profile import router as profile_router

# User Settings API (edit profile + change password)
# Prefer: file named `user_settings.py` import cleanly.
_user_settings_router = None
try:
    from .user_settings import router as user_settings_router  # if file is user_settings.py
    _user_settings_router = user_settings_router
except Exception:
    # Fallback: if the team put the user settings API in `settings.py`
    try:
        from .settings import router as user_settings_router  # type: ignore[assignment]
        _user_settings_router = user_settings_router
    except Exception:
        _user_settings_router = None

# budgets & transactions
try:
    from .routes.budgets import router as budgets_router
except Exception:
    budgets_router = None  # not critical for boot

try:
    from .routes.transactions import router as transactions_router
except Exception:
    transactions_router = None


# -------------------------------------------------------------
# App factory
# -------------------------------------------------------------

def create_app() -> FastAPI:
    app = FastAPI(
        title="BloomFi API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # -----------------------------
    # CORS
    # -----------------------------
    # Frontend origin(s). Multiple origins supported (comma-separated).
    default_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    allowed_origins: List[str] = [
        o.strip() for o in os.getenv("ALLOWED_ORIGINS", default_origin).split(",") if o.strip()
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,  # needed for CSRF cookie
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # -----------------------------
    # Startup: create tables (dev)
    # In production, use Alembic migrations instead of create_all.
    # -----------------------------
    @app.on_event("startup")
    def _on_startup() -> None:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception:
            # In Docker Compose, DB might not be ready at the first tick;
            # container restarts or orchestration health checks will cover it.
            pass

    # -----------------------------
    # Health & Root
    # -----------------------------
    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/")
    def root() -> RedirectResponse:
        # Redirect to interactive API docs to help QA and PMs during demos
        return RedirectResponse(url="/docs")

    # -----------------------------
    # Mount routers
    # -----------------------------
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
    app.include_router(profile_router, prefix="/profile", tags=["profile"])

    # Mount user settings API if present (supports either module name)
    if _user_settings_router is not None:
        app.include_router(_user_settings_router, prefix="/settings", tags=["settings"])

    if budgets_router is not None:
        app.include_router(budgets_router, prefix="/budgets", tags=["budgets"])

    if transactions_router is not None:
        app.include_router(transactions_router, prefix="/transactions", tags=["transactions"])

    return app


# -------------------------------------------------------------
# Uvicorn entrypoint
# -------------------------------------------------------------

app = create_app()

