from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user_schema import TokenResponse, UserLoginRequest, UserSignupRequest, UserPublic


router = APIRouter()


_users_by_email: dict[str, User] = {}


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignupRequest) -> UserPublic:
    email = payload.email.lower()
    if email in _users_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
        )

    user = User.create(email=email, hashed_password=hash_password(payload.password))
    _users_by_email[email] = user

    return UserPublic(email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest) -> TokenResponse:
    email = payload.email.lower()
    user = _users_by_email.get(email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)
