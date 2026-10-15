"""Seed users + menu with idempotent upserts.

Usage:
    uv run python -m backend.seed            # seed, skip existing
    uv run python -m backend.seed --reset    # wipe menu/users/orders, then seed
    uv run seed                              # same, via pyproject script
"""

import argparse
import asyncio

from sqlalchemy import delete, select
from backend.core.database import SessionLocal, create_tables
from backend.models.menu import Menu, Menu_status
from backend.models.order import Order, OrderItem
from backend.models.user import Role, Status, User
from backend.utils.auth.hash import hash_password

SEED_USERS = [
    {"email": "admin@example.com", "name": "Admin", "role": Role.ADMIN, "password": "Admin123!"},
    {"email": "manager@example.com", "name": "Manager", "role": Role.MANAGER, "password": "Manager123!"},
    {"email": "chef@example.com", "name": "Chef", "role": Role.CHEF, "password": "Chef12345!"},
    {"email": "waiter@example.com", "name": "Waiter", "role": Role.WAITER, "password": "Waiter123!"},
    {"email": "user@example.com", "name": "User", "role": Role.USER, "password": "User12345!"},
]

SEED_MENU = [
    {"name": "Margherita Pizza", "description": "Classic cheese pizza with fresh basil and tomato sauce", "price": 249, "status": Menu_status.ACTIVE},
    {"name": "Paneer Butter Masala", "description": "Cottage cheese in rich tomato butter gravy", "price": 279, "status": Menu_status.ACTIVE},
    {"name": "Dal Makhani", "description": "Slow cooked black lentils with cream and butter", "price": 199, "status": Menu_status.ACTIVE},
    {"name": "Chicken Biryani", "description": "Fragrant basmati rice with spiced chicken and saffron", "price": 299, "status": Menu_status.ACTIVE},
    {"name": "Veg Biryani", "description": "Fragrant basmati rice with mixed vegetables and saffron", "price": 229, "status": Menu_status.ACTIVE},
    {"name": "Masala Dosa", "description": "Crispy dosa with spiced potato filling, sambar and chutney", "price": 149, "status": Menu_status.ACTIVE},
    {"name": "Chole Bhature", "description": "Spicy chickpea curry with fluffy bhature", "price": 179, "status": Menu_status.ACTIVE},
    {"name": "Butter Chicken", "description": "Tandoori chicken in creamy tomato gravy", "price": 329, "status": Menu_status.ACTIVE},
    {"name": "Palak Paneer", "description": "Cottage cheese in fresh spinach gravy", "price": 249, "status": Menu_status.ACTIVE},
    {"name": "Hakka Noodles", "description": "Stir fried noodles with vegetables in schezwan sauce", "price": 189, "status": Menu_status.ACTIVE},
    {"name": "Manchow Soup", "description": "Hot and spicy vegetable soup with crispy noodles", "price": 129, "status": Menu_status.ACTIVE},
    {"name": "Gulab Jamun", "description": "Soft milk dumplings in sugar syrup, 4 pieces", "price": 99, "status": Menu_status.ACTIVE},
    {"name": "Cold Coffee", "description": "Blended iced coffee with cream", "price": 149, "status": Menu_status.ACTIVE},
    {"name": "Mango Lassi", "description": "Fresh mango yogurt drink", "price": 119, "status": Menu_status.ACTIVE},
    {"name": "Garlic Naan", "description": "Tandoor baked flatbread with garlic and butter", "price": 59, "status": Menu_status.ACTIVE},
]


async def seed_users(session) -> dict[str, User]:
    users_by_email: dict[str, User] = {}
    for data in SEED_USERS:
        existing = await session.scalar(select(User).where(User.email == data["email"]))
        if existing:
            print(f"skip user {data['email']} (exists)")
            users_by_email[data["email"]] = existing
            continue
        user = User(
            email=data["email"],
            name=data["name"],
            role=data["role"],
            user_status=Status.ACTIVE,
            password=hash_password(data["password"]),
        )
        session.add(user)
        await session.flush()
        print(f"created user {data['email']} / {data['role'].value}")
        users_by_email[data["email"]] = user
    return users_by_email


async def seed_menu(session, admin_id: str | None) -> None:
    for data in SEED_MENU:
        existing = await session.scalar(select(Menu).where(Menu.name == data["name"]))
        if existing:
            print(f"skip dish {data['name']} (exists)")
            continue
        dish = Menu(
            name=data["name"],
            description=data["description"],
            price=data["price"],
            status=data["status"],
            is_deleted=False,
            admin_id=admin_id,
        )
        session.add(dish)
        print(f"created dish {data['name']} @ {data['price']}")


async def async_main(reset: bool = False) -> None:
    await create_tables()
    async with SessionLocal() as session:
        if reset:
            print("reset: clearing order_items, orders, menu, users...")
            await session.execute(delete(OrderItem))
            await session.execute(delete(Order))
            await session.execute(delete(Menu))
            await session.execute(delete(User))
            await session.flush()

        users = await seed_users(session)
        admin = users.get("admin@example.com")
        await seed_menu(session, admin_id=admin.id if admin else None)

        await session.commit()

    print("seeding done.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed users and menu")
    parser.add_argument("--reset", action="store_true", help="wipe seeded tables before seeding")
    args = parser.parse_args()
    asyncio.run(async_main(reset=args.reset))


if __name__ == "__main__":
    main()
