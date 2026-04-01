"""Smoke tests and unit tests for the Brand Mentions API."""

import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


# ── Smoke Tests ──


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_mentions_no_filters(client):
    response = await client.post("/mentions", json={"page": 1, "per_page": 25})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 10000
    assert len(body["data"]) == 25
    assert body["page"] == 1
    assert body["per_page"] == 25


@pytest.mark.asyncio
async def test_mentions_filter_by_model(client):
    response = await client.post(
        "/mentions", json={"page": 1, "per_page": 5, "filters": {"model": "claude"}}
    )
    assert response.status_code == 200
    body = response.json()
    assert all(m["model"] == "claude" for m in body["data"])
    assert body["total"] > 0


@pytest.mark.asyncio
async def test_mentions_filter_by_sentiment(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"sentiment": "negative"}},
    )
    assert response.status_code == 200
    body = response.json()
    assert all(m["sentiment"] == "negative" for m in body["data"])


@pytest.mark.asyncio
async def test_mentions_filter_by_mentioned(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"mentioned": True}},
    )
    assert response.status_code == 200
    body = response.json()
    assert all(m["mentioned"] is True for m in body["data"])


@pytest.mark.asyncio
async def test_mentions_filter_by_date_range(client):
    response = await client.post(
        "/mentions",
        json={
            "page": 1,
            "per_page": 5,
            "filters": {"date_from": "2025-02-01", "date_to": "2025-02-28"},
        },
    )
    assert response.status_code == 200
    body = response.json()
    for m in body["data"]:
        assert "2025-02" in m["created_at"]


@pytest.mark.asyncio
async def test_mentions_combined_filters(client):
    response = await client.post(
        "/mentions",
        json={
            "page": 1,
            "per_page": 5,
            "filters": {"model": "chatgpt", "sentiment": "positive", "mentioned": True},
        },
    )
    assert response.status_code == 200
    body = response.json()
    for m in body["data"]:
        assert m["model"] == "chatgpt"
        assert m["sentiment"] == "positive"
        assert m["mentioned"] is True


@pytest.mark.asyncio
async def test_mentions_empty_result(client):
    response = await client.post(
        "/mentions",
        json={
            "page": 1,
            "per_page": 5,
            "filters": {"date_from": "2099-01-01", "date_to": "2099-12-31"},
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"] == []
    assert body["total"] == 0


@pytest.mark.asyncio
async def test_mentions_invalid_model_returns_422(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"model": "nonexistent"}},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_mentions_invalid_date_returns_422(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"date_from": "not-a-date"}},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_mentions_page_zero_clamped(client):
    response = await client.post("/mentions", json={"page": 0, "per_page": 5})
    assert response.status_code == 200
    body = response.json()
    assert body["page"] == 1


@pytest.mark.asyncio
async def test_mentions_per_page_clamped_to_max(client):
    response = await client.post("/mentions", json={"page": 1, "per_page": 999})
    assert response.status_code == 200
    body = response.json()
    assert body["per_page"] == 100


@pytest.mark.asyncio
async def test_trends_day_grouping(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2025-03-01", "date_to": "2025-03-05", "group_by": "day"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 5
    for point in body["data"]:
        assert "2025-03-0" in point["date"]
        assert point["total"] > 0
        assert point["mentioned"] >= 0


@pytest.mark.asyncio
async def test_trends_week_grouping(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2025-03-01", "date_to": "2025-03-15", "group_by": "week"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) > 0
    for point in body["data"]:
        assert "W" in point["date"]


@pytest.mark.asyncio
async def test_trends_future_dates_empty(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2099-01-01", "date_to": "2099-12-31", "group_by": "day"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"] == []


@pytest.mark.asyncio
async def test_trends_invalid_group_by_returns_422(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2025-01-01", "date_to": "2025-03-01", "group_by": "month"},
    )
    assert response.status_code == 422


# ── Unit Tests ──


@pytest.mark.asyncio
async def test_pagination_offset_math(client):
    """Page 2, per_page 10 should return different data than page 1."""
    r1 = await client.post("/mentions", json={"page": 1, "per_page": 10})
    r2 = await client.post("/mentions", json={"page": 2, "per_page": 10})
    ids_page1 = {m["id"] for m in r1.json()["data"]}
    ids_page2 = {m["id"] for m in r2.json()["data"]}
    assert ids_page1.isdisjoint(ids_page2), "Pages should have no overlapping IDs"


@pytest.mark.asyncio
async def test_trends_no_date_filter(client):
    """Trends without date filters returns all available data."""
    response = await client.post(
        "/mentions/trends", json={"group_by": "day"}
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) > 0
