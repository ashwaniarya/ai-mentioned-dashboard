from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlalchemy import String, Boolean, Integer, DateTime
from datetime import datetime
from typing import Optional, AsyncGenerator

from config import DATABASE_URL


class Base(DeclarativeBase):
    pass


class MentionRecord(Base):
    __tablename__ = "mentions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    query_text: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    mentioned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    citation_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


@asynccontextmanager
async def lifespan(app):
    yield
    await engine.dispose()
