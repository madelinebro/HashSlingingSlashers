# -------------------------------------------------------------
#  AUTHENTICATION ROUTES
#  Purpose: Handle user login with hardcoded credentials
#  
#  Endpoints:
#    POST /api/auth/login
# -------------------------------------------------------------

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


# ------------------------------
# Pydantic Schemas
# ------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: int
    username: str


# -------------------------------------------------------------
# POST /auth/login – authenticate user
# -------------------------------------------------------------
@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Login with hardcoded credentials for testing.
    
    Hardcoded credentials:
    - Username: jeff
    - Password: HelloWorld
    """
    
    # Hardcoded credentials check
    VALID_USERNAME = "jeff"
    VALID_PASSWORD = "HelloWorld"
    
    if credentials.username == VALID_USERNAME and credentials.password == VALID_PASSWORD:
        return LoginResponse(
            success=True,
            message="Login successful",
            user_id=1,
            username="jeff"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )