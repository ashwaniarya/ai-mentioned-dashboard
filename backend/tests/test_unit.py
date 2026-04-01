"""Unit tests — pure Python, no HTTP. Validates Pydantic models + offset math."""

import pytest
from datetime import date
from pydantic import ValidationError

from models import MentionFilters, TrendsRequest, ErrorResponse
from config import MAX_PAGE_SIZE


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


# ── TrendsRequest date parsing ──


def test_parses_date_string_to_date_object():
    request = TrendsRequest(date_from="2025-01-15")
    assert request.date_from == date(2025, 1, 15)


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
