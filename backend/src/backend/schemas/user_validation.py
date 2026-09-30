import enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RoleEnum(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    CHEF = "CHEF"
    MANAGER = "MANAGER"
    WAITER = "WAITER"

class CreateUser(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=20)
    role: RoleEnum
    password: str = Field(min_length=8, max_length=64)

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class UpdateUser(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=20)
    role: Optional[RoleEnum] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=64)

class EditUser(BaseModel):
    name: str = Field(min_length=2, max_length=20)
    role: RoleEnum
    password: str = Field(min_length=8, max_length=64)

class DeleteUser(BaseModel):
    id: str = Field(description="The unique identifier/UUID of the user to delete")
