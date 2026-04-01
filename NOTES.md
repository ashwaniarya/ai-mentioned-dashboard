# Notes

## Trade-offs & Decisions

- **SQLAlchemy async instead of raw aiosqlite** — Adds a dependency but gives type-safe query building, avoids SQL string concatenation for dynamic filters. All aggregations still execute in SQL, not Python.
- **SQLite retained** — Kept the provided SQLite DB as-is. No migration to Postgres. Simple to run: `python seed_db.py` creates the DB.
- **Railway deployment keeps the seeded SQLite file in git** — To keep deployment simple for the task, `backend/mentions.db` is committed and shipped with the backend service. I am intentionally not using a Railway volume for this assignment, even though a volume would be the better long-term persistence option.
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

### Backend

- Add rate limiting on the API
- Add API response caching (ETags or Cache-Control)
- **Folder structure** — Current backend is 5 flat files in `backend/`. Split into `routes/`, `services/`, `schemas/`, `db/` layers.
- **PostgreSQL + proper ORM** — Replace SQLite/aiosqlite with PostgreSQL. Use Alembic for migrations. Replace raw `func.strftime` week-grouping with native `DATE_TRUNC`. Add indexes on `created_at`, `model`, `sentiment`.
- **API contract** — Auto-generate frontend TS types from the FastAPI OpenAPI spec (e.g. `openapi-typescript`). Currently `backend/app/mentions/mention_schemas.py` and `frontend/models/index.ts` are manually kept in sync with loose `string` types on the FE side.
- **Proper error logging** — Add structured logging (e.g. Python `logging` / `structlog`). Currently `main.py` catches exceptions but only returns them as HTTP responses — no server-side log trail for debugging or monitoring.

### Frontend

- Add E2E tests with Playwright
- **Global state management (Zustand)** — Replace prop-threading of filter state from `dashboard-page-client.tsx` down to table/chart with a Zustand store. Each component subscribes to the slice it needs.

### UI/UX

- Add sorting — click column headers to sort by that field
- Add dark mode toggle
- Add a summary stats row above the table (total mentions, mention rate %, top model)
- **Mention Trend Chart improvements** — Current chart (`trend-chart.tsx`) is a basic Recharts AreaChart with default legend/tooltip. Improvements:
  - Brush component for date-range zoom/scrub
  - Mention-rate % line overlay (mentioned/total) on a secondary Y-axis
  - Custom styled tooltip showing total, mentioned, rate %
  - Responsive height breakpoints for mobile

## Time Spent

~4–5 hours
