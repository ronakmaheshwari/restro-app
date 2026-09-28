from pydantic import BaseModel
import enum

class RoleEnum(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    CHEF = "CHEF"
    MANAGER = "MANAGER"
    WAITER = "WAITER"

class create_user(BaseModel):
    email: str
    name: str
    role: RoleEnum
    password: str

class login_user_data(BaseModel):
    email: str
    password: str

class update_user_data(BaseModel):
    name: str | None = None
    role: RoleEnum | None = None
    password: str | None = None

class edit_user(BaseModel):
    name: str
    role: RoleEnum
    password: str

class delete_user(BaseModel):
    id: str