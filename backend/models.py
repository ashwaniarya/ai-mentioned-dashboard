from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, date


# Request models

class MentionFilters(BaseModel):
    model: Optional[Literal["chatgpt", "claude", "gemini", "perplexity"]] = None
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    mentioned: Optional[bool] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class MentionsRequest(BaseModel):
    page: int = 1
    per_page: int = 25
    filters: Optional[MentionFilters] = None


class TrendsRequest(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    group_by: Literal["day", "week"] = "day"


# Response models

class Mention(BaseModel):
    id: str
    query_text: str
    model: str
    mentioned: bool
    position: Optional[int] = None
    sentiment: Optional[str] = None
    citation_url: Optional[str] = None
    created_at: datetime


class MentionsResponse(BaseModel):
    data: list[Mention]
    total: int
    page: int
    per_page: int


class TrendPoint(BaseModel):
    date: str
    total: int
    mentioned: int


class TrendsResponse(BaseModel):
    data: list[TrendPoint]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
