from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case

from database import MentionRecord, get_database_session, lifespan
from models import (
    MentionsRequest, MentionsResponse, Mention,
    TrendsRequest, TrendsResponse, TrendPoint,
    ErrorResponse,
)
from config import CORS_ORIGINS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

app = FastAPI(title="Brand Mentions API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_mention_filters(query, filters):
    """Apply optional filters to a SQLAlchemy query on MentionRecord."""
    if filters is None:
        return query
    if filters.model is not None:
        query = query.where(MentionRecord.model == filters.model)
    if filters.sentiment is not None:
        query = query.where(MentionRecord.sentiment == filters.sentiment)
    if filters.mentioned is not None:
        query = query.where(MentionRecord.mentioned == filters.mentioned)
    if filters.date_from is not None:
        query = query.where(MentionRecord.created_at >= filters.date_from.isoformat())
    if filters.date_to is not None:
        query = query.where(MentionRecord.created_at <= filters.date_to.isoformat() + " 23:59:59")
    return query


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/mentions", response_model=MentionsResponse)
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


@app.post("/mentions/trends", response_model=TrendsResponse)
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
