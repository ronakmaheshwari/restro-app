import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.menu import Menu


class BillStatus(str, enum.Enum):
    PAID = "PAID"
    UNPAID = "UNPAID"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )

    total_amount: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    bill_status: Mapped[BillStatus] = mapped_column(
        SAEnum(BillStatus),
        default=BillStatus.UNPAID,
    )

    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus),
        default=OrderStatus.PENDING,
    )

    user: Mapped["User"] = relationship(
        back_populates="orders"
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(Base, UUIDMixin):
    __tablename__ = "order_items"

    order_id: Mapped[str] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE")
    )

    menu_id: Mapped[str] = mapped_column(
        ForeignKey("menu.id", ondelete="CASCADE")
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    price: Mapped[int] = mapped_column(
        Integer,
    )

    order: Mapped["Order"] = relationship(
        back_populates="items"
    )

    menu: Mapped["Menu"] = relationship(
        back_populates="order_items"
    )