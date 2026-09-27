import enum
from models.base import Base, TimestampMixin, UUIDMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum as SAEnum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.menu import Menu
    from models.order import Order

class Status(str, enum.Enum):
    ACTIVE = "ACTIVE"
    UNVERIFIED = "UNVERIFIED"
    INACTIVE = "INACTIVE"
    DELETED = "DELETED"

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    CHEF = "CHEF"
    MANAGER = "MANAGER"
    WAITER = "WAITER"

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index= True)
    name: Mapped[str] = mapped_column(String)
    user_status: Mapped[Status] = mapped_column(SAEnum(Status), default=Status.ACTIVE)
    role: Mapped[Role] = mapped_column(SAEnum(Role), default=Role.USER)
    menu: Mapped["Menu | None"] = relationship (
        back_populates="admin"
    )
    orders: Mapped[list["Order"]] = relationship (
        back_populates="user"
    )