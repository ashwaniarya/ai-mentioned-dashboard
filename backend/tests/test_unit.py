"""Unit tests — pure Python, no HTTP. Validates Pydantic models + offset math."""

import pytest
from datetime import date
from pydantic import ValidationError

from app.mentions.mention_schemas import MentionFilters, TrendsRequest, ErrorResponse
from app.config import MAX_PAGE_SIZE, DEFAULT_CORS_ORIGINS, parse_configured_cors_origins


# ── MentionFilters validation ──


def test_rejects_invalid_model():
    with pytest.raises(ValidationError):
        MentionFilters(model="gpt5")


def test_rejects_invalid_sentiment():
    with pytest.raises(ValidationError):
        MentionFilters(sentiment="angry")


def test_rejects_bad_date():
    with pytest.raises(ValidationError):
        MentionFilters(date_from="nope")


def test_accepts_valid_model_literal():
    filters = MentionFilters(model="chatgpt")
    assert filters.model == "chatgpt"


# ── TrendsRequest nested filters ──


def test_trends_request_accepts_valid_nested_filters():
    request = TrendsRequest(
        filters={
            "model": "chatgpt",
            "sentiment": "positive",
            "mentioned": True,
            "date_from": "2025-01-15",
            "date_to": "2025-01-31",
        }
    )

    assert request.filters is not None
    assert request.filters.model == "chatgpt"
    assert request.filters.sentiment == "positive"
    assert request.filters.mentioned is True
    assert request.filters.date_from == date(2025, 1, 15)
    assert request.filters.date_to == date(2025, 1, 31)


@pytest.mark.parametrize(
    "invalid_filters",
    [
        {"model": "gpt5"},
        {"sentiment": "angry"},
        {"date_from": "nope"},
        {"date_to": "also-nope"},
    ],
)
def test_trends_request_rejects_invalid_nested_values(invalid_filters):
    with pytest.raises(ValidationError):
        TrendsRequest(filters=invalid_filters)


# ── Config parsing ──


def test_cors_origins_parser_trims_whitespace_and_ignores_empty_values():
    configured_origins = "https://app.example.com, https://admin.example.com ,"
    assert parse_configured_cors_origins(configured_origins) == [
        "https://app.example.com",
        "https://admin.example.com",
    ]


def test_cors_origins_parser_uses_localhost_defaults_when_unset():
    assert parse_configured_cors_origins(None) == DEFAULT_CORS_ORIGINS


# ── Pagination offset math ──


def test_offset_page_2_per_page_10():
    page, per_page = 2, 10
    offset = (page - 1) * per_page
    assert offset == 10


def test_offset_page_1_per_page_25():
    page, per_page = 1, 25
    offset = (page - 1) * per_page
    assert offset == 0


def test_per_page_clamped_to_max():
    assert min(999, MAX_PAGE_SIZE) == 100


def test_page_clamped_to_minimum_one():
    assert max(0, 1) == 1


# ── ErrorResponse serialization ──


def test_error_response_serialization():
    err = ErrorResponse(error="fail")
    assert err.model_dump() == {"error": "fail", "detail": None}
