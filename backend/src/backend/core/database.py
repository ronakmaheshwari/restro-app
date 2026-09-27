from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

engine = create_async_engine (
    settings.database_url,
    echo = settings.db_echo,
    pool_pre_ping = True
)

SessionLocal = async_sessionmaker(
    bind= engine,
    expire_on_commit= False,
    autoflush= False
)

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            session.close_all()