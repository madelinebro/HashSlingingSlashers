# -------------------------------------------------------------
#  AUTHENTICATION MODULE
#  This file handles user registration, login, and logout.
#  It also includes a lightweight CSRF protection system using
#  the double-submit cookie pattern.
#
#  Overview:
#    • /auth/register  – create a new user and return a JWT
#    • /auth/login     – verify credentials, set CSRF cookie,
#                         and return JWT + CSRF token
#    • /auth/logout    – verify CSRF header/cookie and clear token
#
#  CSRF workflow:
#    1. When a user logs in, the server generates a random CSRF token.
#    2. The token is stored as a cookie and also sent in the JSON body.
#    3. The frontend includes this token in the "X-CSRF-Token" header
#       on any future state-changing requests.
#    4. The backend checks that the header and cookie match before
#       allowing the action to proceed.
# -------------------------------------------------------------

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import secrets

# Imports for JWT creation and database session management
from .authorize import create_access_token
from .routes.database import get_db, User

router = APIRouter()


# =============================================================
# Request / Response Models
# =============================================================

class UserCreate(BaseModel):
    """Expected payload for both registration and login."""
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    """Structure of the response containing both tokens."""
    access_token: str
    token_type: str = "bearer"
    csrf_token: str | None = None


# =============================================================
# Helper Functions
# =============================================================

def normalize_email(email: str) -> str:
    """Lowercase and trim whitespace to keep emails consistent."""
    return email.strip().lower()


def set_csrf_cookie(response: Response, token: str) -> None:
    """
    Attach the CSRF token to the response as a cookie.
    The cookie is secure and same-site restricted to mitigate
    cross-origin attacks.
    """
    response.set_cookie(
        key="csrf_token",
        value=token,
        max_age=60 * 60 * 8,  # Valid for ~8 hours
        secure=True,          # Use HTTPS in production
        httponly=False,       # Frontend may read token from JSON instead
        samesite="Strict",    # Restricts cross-site sending
        path="/",
    )


def validate_csrf(request: Request) -> None:
    """
    Validate that the X-CSRF-Token header matches the csrf_token cookie.
    If either is missing or mismatched, raise a 403 error.
    """
    header_token = request.headers.get("X-CSRF-Token")
    cookie_token = request.cookies.get("csrf_token")

    if not header_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token header missing",
        )

    if not cookie_token or header_token != cookie_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF validation failed",
        )


# =============================================================
# Registration Endpoint
# =============================================================

@router.post(
    "/register",
    response_model=TokenOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and return an access token",
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Handles new user registration.

    Steps:
      1. Normalize the email for consistent storage.
      2. Check if the email already exists to prevent duplicates.
      3. Hash the password using bcrypt before saving.
      4. Commit the new record to the database.
      5. Create and return a JWT access token.
    """
    email = normalize_email(payload.email)

    # Check for an existing user before inserting
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_pw = bcrypt.hash(payload.password)
    user = User(email=email, password_hash=hashed_pw)
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")

    db.refresh(user)
    token = create_access_token(sub=str(user.id))

    # Registration doesn’t create a CSRF cookie; that happens on login.
    return {"access_token": token, "token_type": "bearer", "csrf_token": None}


# =============================================================
# Login Endpoint (Generates CSRF Token)
# =============================================================

@router.post(
    "/login",
    response_model=TokenOut,
    summary="Authenticate user and return JWT + CSRF token",
)
def login(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    """
    Authenticates an existing user and establishes a CSRF token.

    Steps:
      1. Normalize email and look up the user.
      2. Verify the password against the stored hash.
      3. Create a JWT for authentication.
      4. Generate a random CSRF token and set it as a cookie.
      5. Return both tokens to the frontend.
    """
    email = normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).first()

    if not user or not bcrypt.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(sub=str(user.id))
    csrf_token = secrets.token_hex(32)
    set_csrf_cookie(response, csrf_token)

    return {"access_token": access_token, "token_type": "bearer", "csrf_token": csrf_token}


# =============================================================
# Logout Endpoint (Requires CSRF Validation)
# =============================================================

@router.post(
    "/logout",
    summary="Logout and clear CSRF cookie",
    status_code=status.HTTP_200_OK,
)
def logout(request: Request, response: Response):
    """
    Example of a protected endpoint that requires CSRF validation.
    The function checks the X-CSRF-Token header and cookie for a match
    before proceeding. If valid, it clears the cookie to invalidate the session.
    """
    validate_csrf(request)
    response.delete_cookie("csrf_token", path="/")
    return {"message": "Logout successful"}


# =============================================================
# Integration Notes
# =============================================================
# To connect these routes, include the router in app/main.py:
#
#   from .login import router as auth_router
#   app.include_router(auth_router, prefix="/auth", tags=["auth"])
#
# This setup exposes:
#   POST /auth/register
#   POST /auth/login
#   POST /auth/logout
#
# The frontend should:
#   • Store the JWT and CSRF token after login.
#   • Send JWT in Authorization header for authenticated requests.
#   • Send CSRF token in X-CSRF-Token header for POST/PUT/DELETE calls.
