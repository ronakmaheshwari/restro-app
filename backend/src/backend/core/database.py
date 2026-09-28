from sqlalchemy import text
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.core.config import settings

engine = create_async_engine (
    settings.database_url,
    echo = settings.db_echo,
    pool_pre_ping = True
)

async def ensure_database_exists() -> None:
    """Create the target database if it does not exist (Postgres)."""
    url = make_url(settings.database_url)
    database = url.database
    if not database:
        return

    # connect to maintenance db `postgres` instead of target db
    admin_url = url.set(database="postgres")
    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")

    async with admin_engine.connect() as conn:
        # check existence to keep it idempotent & avoid error noise
        exists = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
            {"dbname": database},
        )
        if exists.scalar() is None:
            # must be outside transaction -> AUTOCOMMIT + exec_driver_sql
            await conn.exec_driver_sql(f'CREATE DATABASE "{database}"')

    await admin_engine.dispose()


async def create_tables() -> None:
    """Fallback for dev/test without alembic: create tables directly."""
    from backend.models.base import Base
    import backend.models.user  # noqa: F401
    import backend.models.menu  # noqa: F401
    import backend.models.order  # noqa: F401

    # ensure DB exists before create_all
    await ensure_database_exists()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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