from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import MAX_PAGE_SIZE
from app.database import get_database_session
from app.mentions.mention_filter_builder import build_mention_filters
from app.mentions.mention_record import MentionRecord
from app.mentions.mention_schemas import (
    MentionsRequest,
    MentionsResponse,
    Mention,
    TrendsRequest,
    TrendsResponse,
    TrendPoint,
    ErrorResponse,
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

    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(error="Database error", detail=str(exc)).model_dump(),
        )


@mention_router.post("/mentions/trends", response_model=TrendsResponse)
async def mention_trends(
    request: TrendsRequest,
    session: AsyncSession = Depends(get_database_session),
):
    try:
        if request.group_by == "week":
            date_column = func.strftime("%Y-W%W", MentionRecord.created_at)
        else:
            date_column = func.date(MentionRecord.created_at)

        query = (
            select(
                date_column.label("date"),
                func.count().label("total"),
                func.sum(case((MentionRecord.mentioned == True, 1), else_=0)).label("mentioned"),
            )
            .group_by(date_column)
            .order_by(date_column.asc())
        )

        if request.date_from is not None:
            query = query.where(MentionRecord.created_at >= request.date_from.isoformat())
        if request.date_to is not None:
            query = query.where(MentionRecord.created_at <= request.date_to.isoformat() + " 23:59:59")

        result = await session.execute(query)
        rows = result.all()

        trend_points = [
            TrendPoint(date=row.date, total=row.total, mentioned=int(row.mentioned or 0))
            for row in rows
        ]

        return TrendsResponse(data=trend_points)

    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(error="Database error", detail=str(exc)).model_dump(),
        )
