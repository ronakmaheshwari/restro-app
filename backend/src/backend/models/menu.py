import enum
from sqlalchemy import String, Integer, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base, UUIDMixin, TimestampMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User
    from models.order import OrderItem
    
class Menu_status(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class Menu(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menu"
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer)
    is_deleted: Mapped[bool] = mapped_column(default=False)
    status: Mapped[Menu_status] = mapped_column(SAEnum(Menu_status), default=Menu_status.ACTIVE)
    admin_id: Mapped[str | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )
    admin: Mapped["User | None"] = relationship(back_populates="menu")
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="menu"
    )