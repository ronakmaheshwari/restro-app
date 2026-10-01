import enum
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class BillStatusEnum(str, enum.Enum):
    PAID = "PAID"
    UNPAID = "UNPAID"


class OrderStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class OrdersCart(BaseModel):
    menu_id: str = Field(min_length=2)
    quantity: int = Field(default=1, ge=1, le=50)

class OrderQuery(BaseModel):
    total: Optional[int] = Field(default=None, ge=10, le=100000)
    bill_status: Optional[BillStatusEnum] = None
    status: Optional[OrderStatusEnum] = None
    user_id: Optional[str] = Field(default=None)
    user_name: Optional[str] = Field(default=None)
    sortBy: Literal["user_name", "price", "total",
                    "quantity", "created_at"] = "created_at"
    sortOrder: Literal["asc", "desc"] = "asc"
    limit: int = Field(default=10)
    page: int = Field(default=1)

class AddOrder(BaseModel):
    orders: list[OrdersCart] = Field(min_length=1)
