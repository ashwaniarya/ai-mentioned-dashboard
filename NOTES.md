# Notes

## Trade-offs & Decisions

- **SQLAlchemy async instead of raw aiosqlite** — Adds a dependency but gives type-safe query building, avoids SQL string concatenation for dynamic filters. All aggregations still execute in SQL, not Python.
- **SQLite retained** — Kept the provided SQLite DB as-is. No migration to Postgres. Simple to run: `python seed_db.py` creates the DB.
- **Railway backend start command** — Current deploy uses `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2 --log-level info --proxy-headers --forwarded-allow-ips '*' --timeout-keep-alive 65 --timeout-graceful-shutdown 30 --no-server-header`. For a more production-grade Python server after moving to Postgres, add `gunicorn` to `backend/requirements.txt` and use this command: `gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --graceful-timeout 30 --keep-alive 65 --access-logfile - --forwarded-allow-ips='*'`.
- **Pydantic Literal types** — Hardened request models with `Literal["chatgpt", "claude", ...]` so invalid filter values are rejected at the request parsing layer (422) rather than silently returning empty results.
- **SWR over Redux** — Single dashboard page with server-driven data. SWR handles caching, deduplication, and revalidation. No need for client-side global store.
- **shadcn/ui** — Copy-paste component library gives polished UI out of the box (Table, Select, Badge, Skeleton, Card) without heavy dependencies.
- **Debounced filters** — `MENTION_FILTER_DEBOUNCE_INTERVAL_MS` in `frontend/config` prevents request storms when users change multiple filters quickly.

## Smoke tests (dashboard filters)

1. Open the dashboard, change several filters quickly: Network should show batched `/mentions` and `/mentions/trends` calls after the debounce window, not one per keystroke.
2. Set **From** after **To**: inline error appears; requests should not send both contradictory dates (dates omitted until fixed).
3. Scroll the page: header + filter bar stay sticky at the top.
- **No server components for data fetching** — The dashboard is fully client-rendered ("use client") since all data depends on user-controlled filter state. Server components would add complexity without benefit here.

## What I'd Improve With More Time

- Add sorting (click column headers to sort by that field)
- Add URL query parameter sync so filter state survives page refresh
- Add dark mode toggle
- Add more granular error messages (toast notifications)
- Add E2E tests with Playwright
- Add rate limiting on the API
- Add API response caching (ETags or Cache-Control)
- Deploy to Vercel (frontend) + Railway/Fly.io (backend)
- Add a summary stats row above the table (total mentions, mention rate %, top model)

## Time Spent

~3 hours
