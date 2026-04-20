from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory placeholders for rapid MVP scaffolding.
fake_users: dict[str, dict[str, str]] = {}


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    if payload.email in fake_users:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    fake_users[payload.email] = {
        "name": payload.name,
        "password_hash": hash_password(payload.password)
    }
    token = create_access_token(payload.email)
    return AuthResponse(access_token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = fake_users.get(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(payload.email)
    return AuthResponse(access_token=token)
