from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    organization: Optional[str] = None
    role: UserRole = UserRole.DATA_SCIENTIST

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
