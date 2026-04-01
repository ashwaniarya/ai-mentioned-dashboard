"""Smoke tests — hits the FastAPI app via httpx AsyncClient (no live server)."""

import pytest


# ── Health ──


@pytest.mark.asyncio
async def test_health_returns_ok(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ── POST /mentions — happy paths ──


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
        "/mentions", json={"page": 1, "per_page": 5, "filters": {"model": "chatgpt"}}
    )
    body = response.json()
    assert response.status_code == 200
    assert all(m["model"] == "chatgpt" for m in body["data"])
    assert body["total"] > 0


@pytest.mark.asyncio
async def test_mentions_filter_by_sentiment(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"sentiment": "positive"}},
    )
    body = response.json()
    assert response.status_code == 200
    assert all(m["sentiment"] == "positive" for m in body["data"])


@pytest.mark.asyncio
async def test_mentions_filter_by_mentioned(client):
    response = await client.post(
        "/mentions",
        json={"page": 1, "per_page": 5, "filters": {"mentioned": True}},
    )
    body = response.json()
    assert response.status_code == 200
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
    body = response.json()
    assert response.status_code == 200
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
    body = response.json()
    assert response.status_code == 200
    for m in body["data"]:
        assert m["model"] == "chatgpt"
        assert m["sentiment"] == "positive"
        assert m["mentioned"] is True


# ── POST /mentions — pagination edge cases ──


@pytest.mark.asyncio
async def test_mentions_pagination_page_2(client):
    r1 = await client.post("/mentions", json={"page": 1, "per_page": 10})
    r2 = await client.post("/mentions", json={"page": 2, "per_page": 10})
    ids_page1 = {m["id"] for m in r1.json()["data"]}
    ids_page2 = {m["id"] for m in r2.json()["data"]}
    assert ids_page1.isdisjoint(ids_page2), "Pages must have no overlapping IDs"


@pytest.mark.asyncio
async def test_mentions_page_zero_clamped_to_one(client):
    response = await client.post("/mentions", json={"page": 0, "per_page": 5})
    assert response.status_code == 200
    assert response.json()["page"] == 1


@pytest.mark.asyncio
async def test_mentions_per_page_clamped_to_max(client):
    response = await client.post("/mentions", json={"page": 1, "per_page": 999})
    assert response.status_code == 200
    assert response.json()["per_page"] == 100


# ── POST /mentions — validation errors ──


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
        json={"page": 1, "per_page": 5, "filters": {"date_from": "bad-date"}},
    )
    assert response.status_code == 422


# ── POST /mentions — empty result ──


@pytest.mark.asyncio
async def test_mentions_future_dates_return_empty(client):
    response = await client.post(
        "/mentions",
        json={
            "page": 1,
            "per_page": 5,
            "filters": {"date_from": "2099-01-01", "date_to": "2099-12-31"},
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["data"] == []
    assert body["total"] == 0


# ── POST /mentions/trends ──


@pytest.mark.asyncio
async def test_trends_day_grouping(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2025-03-01", "date_to": "2025-03-05", "group_by": "day"},
    )
    body = response.json()
    assert response.status_code == 200
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
    body = response.json()
    assert response.status_code == 200
    assert len(body["data"]) > 0
    for point in body["data"]:
        assert "W" in point["date"]


@pytest.mark.asyncio
async def test_trends_no_date_filter(client):
    response = await client.post("/mentions/trends", json={"group_by": "day"})
    assert response.status_code == 200
    assert len(response.json()["data"]) > 0


@pytest.mark.asyncio
async def test_trends_future_dates_return_empty(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2099-01-01", "date_to": "2099-12-31", "group_by": "day"},
    )
    assert response.status_code == 200
    assert response.json()["data"] == []


@pytest.mark.asyncio
async def test_trends_invalid_group_by_returns_422(client):
    response = await client.post(
        "/mentions/trends",
        json={"date_from": "2025-01-01", "date_to": "2025-03-01", "group_by": "month"},
    )
    assert response.status_code == 422
