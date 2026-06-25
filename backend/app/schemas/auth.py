from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    risk_profile: str = "moderate"


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    risk_profile: str

    model_config = {"from_attributes": True}
