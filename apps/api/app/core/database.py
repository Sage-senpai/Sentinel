"""Async SQLAlchemy database engine and session factory."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = None
async_session = None

if settings.database_url:
    engine = create_async_engine(
        settings.database_url,
        echo=settings.debug,
        pool_size=10,
        max_overflow=20,
    )
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Dependency — yields an async database session, or None if DB not configured."""
    if async_session is None:
        yield None
        return
    async with async_session() as session:
        yield session
