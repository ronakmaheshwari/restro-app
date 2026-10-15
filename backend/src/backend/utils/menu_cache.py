from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.menu import Menu as DBMenu
import json
import logging
from backend.core.config import settings
from sqlalchemy import select
from backend.core.database import SessionLocal
from backend.core.redis import r

MENU_CACHE_KEY = "menu:all"
MENU_CACHE_TTL = settings.cache_ttl
logger = logging.getLogger(__name__)

async def refresh_menu_items():
    try:
        async with SessionLocal() as db:
            result = await db.execute(select(DBMenu))
            all_menu = result.scalars().all()

            menu_data = [
                {
                    column.name: getattr(menu, column.name)
                    for column in DBMenu.__table__.columns
                }
                for menu in all_menu
            ]

            payload = json.dumps(menu_data,default=str)
            await r.set(MENU_CACHE_KEY, payload, ex=MENU_CACHE_TTL)
        logger.info("Menu cache refreshed: %s records", len(menu_data))
    except Exception as error:
        logger.exception(f"Failed to refresh menu cache: {error}")

async def delete_menu_items():
    try:
        await r.delete(MENU_CACHE_KEY)
        logger.info("Menu cache cleared")
    except Exception as error:
        logger.exception(f"Failed to delete menu cache: {error}")