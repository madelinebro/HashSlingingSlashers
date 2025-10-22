# -------------------------------------------------------------
#  AUTHORIZATION & TOKEN UTILITIES
#  Purpose:
#    Central place for:
#      • Creating and verifying JWT access tokens
#      • Extracting the current user from Authorization headers
#      • Lightweight CSRF helpers (double-submit cookie pattern)
#
#  Exposed functions:
#    create_access_token(sub: str, extra: dict | None = None) -> str
#    get_current_user(token: HTTPAuthorizationCredentials) -> int
#    generate_csrf_token() -> str
#    set_csrf_cookie(response: Response, token: str) -> None
#    validate_csrf(request: Request) -> None
#
#  Dependencies:
#    - settings.JWT_SECRET, settings.JWT_ALG, settings.ACCESS_TTL
#    - FastAPI's HTTPBearer for extracting the Bearer token
# -------------------------------------------------------------

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import secrets

from .settings import settings

# Security scheme for "Authorization: Bearer <token>" extraction.
# HTTPBearer accepts either missing/invalid tokens (auto_error=False)
# or raises 403 immediately (auto_error=True). Using False lets us
# return a clean 401 message below.
_bearer_scheme = HTTPBearer(auto_error=False)


# =============================================================
# JWT Helpers
# =============================================================

def _utcnow() -> datetime:
    """UTC 'now' helper with tz awareness."""
    return datetime.now(timezone.utc)


def create_access_token(sub: str, extra: Optional[Dict[str, Any]] = None) -> str:
    """
    Create a signed JWT that carries:
      - 'sub': the subject (user id as string)
      - 'iat': issued-at (UTC)
      - 'exp': expiration based on ACCESS_TTL seconds
    Additional custom claims can be provided via `extra`.
    """
    now = _utcnow()
    payload: Dict[str, Any] = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.ACCESS_TTL)).timestamp()),
    }
    if extra:
        payload.update(extra)

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
    return token


def _decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT.
    Raises HTTP 401 on failure (invalid signature, expired, malformed).
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        # Any decoding error (including expiration) maps to Unauthorized.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> int:
    """
    Extract the current user's id from the Authorization header.
    Expected header:  Authorization: Bearer <access_token>
    Returns the integer user id from the 'sub' claim.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    claims = _decode_access_token(credentials.credentials)

    # Defensive: ensure 'sub' is present and can be parsed.
    sub = claims.get("sub")
    try:
        return int(sub)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )


# =============================================================
# CSRF Helpers (double-submit cookie)
# =============================================================

def generate_csrf_token() -> str:
    """
    Create a high-entropy CSRF token appropriate for cookies and headers.
    32 bytes → 64 hex chars (~256 bits).
    """
    return secrets.token_hex(32)


def set_csrf_cookie(response: Response, token: str) -> None:
    """
    Attach the CSRF token as a cookie. Frontend will also send this token
    back in the 'X-CSRF-Token' header for state-changing requests.
    Notes for production:
      - secure=True requires HTTPS; keep enabled in production
      - samesite='Strict' reduces cross-site sends; adjust if needed
      - httponly=False lets the frontend read the cookie if desired.
        Some teams keep it HttpOnly and instead read the token from the
        JSON login response; both approaches are compatible.
    """
    response.set_cookie(
        key="csrf_token",
        value=token,
        max_age=settings.ACCESS_TTL,  # align with access token lifetime
        secure=True,                  # keep True behind HTTPS
        httponly=False,               # set True if frontend only uses JSON echo
        samesite="Strict",
        path="/",
    )


def validate_csrf(request: Request) -> None:
    """
    Enforce the double-submit rule: header must match cookie.
    - Header: X-CSRF-Token
    - Cookie: csrf_token
    Raise 403 on any mismatch or missing token.
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

