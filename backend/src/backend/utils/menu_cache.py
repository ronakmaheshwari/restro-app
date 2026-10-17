from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.menu import Menu as DBMenu, Menu_status
import json
import logging
from backend.core.config import settings
from sqlalchemy import select
from backend.core.database import SessionLocal
from backend.core.redis import r
from backend.schemas.menu_validation import DishQuery
import hashlib

MENU_VERSION_KEY = "menu:version"
MENU_CACHE_TTL = settings.cache_ttl
logger = logging.getLogger(__name__)


def menu_cache_key_helper(q: DishQuery, version: int) -> str:
    query = json.dumps(q.model_dump(mode="json"), sort_keys=True)
    hash = hashlib.sha1(query.encode()).hexdigest()[:16]
    return f"menu:v{version}:{hash}"


async def get_menu_version() -> int:
    version = await r.get(MENU_VERSION_KEY)
    if version is None:
        await r.set(MENU_VERSION_KEY, 1, nx=True)
        version = await r.get(MENU_VERSION_KEY)
    return int(version)


async def invalidate_menu_cache() -> None:
    try:
        await r.incr(MENU_VERSION_KEY)
        logger.info(
            f"Menu cache invalidated (version bumped): {MENU_VERSION_KEY}")
    except Exception as error:
        logger.exception(f"Failed to invalidate cache: {error}")


def build_menu_item_query(q: DishQuery):
    stmt = select(DBMenu)
    if q.name:
        stmt = stmt.where(DBMenu.name.ilike(f"%{q.name}%"))
    if q.description:
        stmt = stmt.where(DBMenu.description.ilike(f"%{q.description}%"))
    if q.price is not None:
        stmt = stmt.where(DBMenu.price == q.price)
    if q.status:
        stmt = stmt.where(DBMenu.status == Menu_status(q.status.value))
    if q.isDeleted is not None:
        stmt = stmt.where(DBMenu.is_deleted == q.isDeleted)
    if q.min_price is not None:
        stmt = stmt.where(DBMenu.price >= q.min_price)
    if q.max_price is not None:
        stmt = stmt.where(DBMenu.price <= q.max_price)
    if q.isDeleted is None:
        stmt = stmt.where(DBMenu.is_deleted == False)

    offset = (q.page - 1) * q.limit
    stmt = stmt.limit(q.limit).offset(offset)

    sort_clm = {"name": DBMenu.name, "price": DBMenu.price}[q.sortBy]
    return stmt.order_by(sort_clm.asc() if q.sortOrder == "asc" else sort_clm.desc())

def serialize_menu(rows) -> list[dict]:
    return [
        {
            "id": str(dish.id),
            "name": dish.name,
            "description": dish.description,
            "price": dish.price,
            "status": dish.status.value if dish.status else None,
            "is_deleted": dish.is_deleted,
            "admin_id": str(dish.admin_id) if dish.admin_id else None,
            "created_at": dish.created_at.isoformat() if dish.created_at else None,
            "updated_at": dish.updated_at.isoformat() if dish.updated_at else None,
        }
        for dish in rows
    ]

async def refresh_menu_items():
    try:
        q = DishQuery()
        async with SessionLocal() as db:
            result = await db.execute(build_menu_item_query(q))
            all_menu = result.scalars().all()

            version = await get_menu_version()
            await r.set(
                menu_cache_key_helper(q,version),
                json.dumps(serialize_menu(all_menu)),
                ex=MENU_CACHE_TTL
            )
        logger.info("Menu cache refreshed: %s records", len(all_menu))
    except Exception as error:
        logger.exception(f"Failed to refresh menu cache: {error}")


async def delete_menu_items():
    try:
        await r.delete(MENU_CACHE_KEY)
        logger.info("Menu cache cleared")
    except Exception as error:
        logger.exception(f"Failed to delete menu cache: {error}")
