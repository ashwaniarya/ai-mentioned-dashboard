from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import MAX_PAGE_SIZE
from app.database import get_database_session
from app.exceptions import AppApiException
from app.mentions.mention_filter_builder import build_mention_filters
from app.mentions.mention_record import MentionRecord
from app.mentions.mention_schemas import (
    MentionsRequest,
    MentionsResponse,
    Mention,
    TrendsRequest,
    TrendsResponse,
    TrendPoint,
)

mention_router = APIRouter()


@mention_router.post("/mentions", response_model=MentionsResponse)
async def list_mentions(
    request: MentionsRequest,
    session: AsyncSession = Depends(get_database_session),
):
    page = max(1, request.page)
    per_page = max(1, min(request.per_page, MAX_PAGE_SIZE))

    try:
        base_query = select(MentionRecord)
        base_query = build_mention_filters(base_query, request.filters)

        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await session.execute(count_query)
        total = total_result.scalar() or 0

        offset = (page - 1) * per_page
        data_query = base_query.order_by(MentionRecord.created_at.desc()).limit(per_page).offset(offset)
        rows_result = await session.execute(data_query)
        rows = rows_result.scalars().all()

        mentions = [
            Mention(
                id=row.id,
                query_text=row.query_text,
                model=row.model,
                mentioned=bool(row.mentioned),
                position=row.position,
                sentiment=row.sentiment,
                citation_url=row.citation_url,
                created_at=row.created_at,
            )
            for row in rows
        ]

        return MentionsResponse(data=mentions, total=total, page=page, per_page=per_page)

    except SQLAlchemyError:
        raise AppApiException(
            503,
            "Database unavailable",
            detail="list_mentions query failed",
        )
    except Exception:
        raise AppApiException(500, "Mentions query failed")


@mention_router.post("/mentions/trends", response_model=TrendsResponse)
async def mention_trends(
    request: TrendsRequest,
    session: AsyncSession = Depends(get_database_session),
):
    try:
        filtered_mentions = build_mention_filters(
            select(
                MentionRecord.created_at.label("created_at"),
                MentionRecord.mentioned.label("mentioned"),
            ),
            request.filters,
        ).subquery()

        if request.group_by == "week":
            date_column = func.strftime("%Y-W%W", filtered_mentions.c.created_at)
        else:
            date_column = func.date(filtered_mentions.c.created_at)

        query = (
            select(
                date_column.label("date"),
                func.count().label("total"),
                func.sum(case((filtered_mentions.c.mentioned == True, 1), else_=0)).label(
                    "mentioned"
                ),
            )
            .select_from(filtered_mentions)
            .group_by(date_column)
            .order_by(date_column.asc())
        )

        result = await session.execute(query)
        rows = result.all()

        trend_points = [
            TrendPoint(date=row.date, total=row.total, mentioned=int(row.mentioned or 0))
            for row in rows
        ]

        return TrendsResponse(data=trend_points)

    except SQLAlchemyError:
        raise AppApiException(
            503,
            "Database unavailable",
            detail="mention_trends query failed",
        )
    except Exception:
        raise AppApiException(500, "Trends query failed")
