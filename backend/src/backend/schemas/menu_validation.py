import enum
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class MenuEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


def validate_no_html(text: Optional[str]) -> Optional[str]:
    if text and ("<script>" in text or "<html>" in text):
        raise ValueError(
            'Description must be plain text and cannot contain HTML tags.')
    return text


class DishQuery(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=10, le=100000)
    min_price: Optional[int] = Field(default=None)
    max_price: Optional[int] = Field(default=None)
    status: Optional[MenuEnum] = None
    isDeleted: Optional[bool] = None
    sortBy: Literal["name", "price"] = "name"
    sortOrder: Literal["asc", "desc"] = "asc"
    limit: int = Field(default=10)
    page: int = Field(default=1)

class AddDish(BaseModel):
    name: str = Field(min_length=1)
    description: str
    price: int = Field(ge=10, le=100000, default=10)
    status: MenuEnum

    @field_validator('description')
    @classmethod
    def check_html_tags(cls, text: str) -> str:
        return validate_no_html(text)


class EditDish(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=10, le=100000)
    status: Optional[MenuEnum] = None

    @field_validator('description')
    @classmethod
    def check_html_tags(cls, text: Optional[str]) -> Optional[str]:
        return validate_no_html(text)
