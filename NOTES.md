# Notes

## Trade-offs & Decisions

- **SQLAlchemy async instead of raw aiosqlite** — Adds a dependency but gives type-safe query building, avoids SQL string concatenation for dynamic filters. All aggregations still execute in SQL, not Python.
- **SQLite retained** — Kept the provided SQLite DB as-is. No migration to Postgres. Simple to run: `python seed_db.py` creates the DB.
- **Railway deployment keeps the seeded SQLite file in git** — To keep deployment simple for the task, `backend/mentions.db` is committed and shipped with the backend service. I am intentionally not using a Railway volume for this assignment, even though a volume would be the better long-term persistence option.
- **Railway backend start command** — Current deploy uses `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2 --log-level info --proxy-headers --forwarded-allow-ips '*' --timeout-keep-alive 65 --timeout-graceful-shutdown 30 --no-server-header`. For a more production-grade Python server after moving to Postgres, add `gunicorn` to `backend/requirements.txt` and use this command: `gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --graceful-timeout 30 --keep-alive 65 --access-logfile - --forwarded-allow-ips='*'`.
- **Pydantic Literal types** — Hardened request models with `Literal["chatgpt", "claude", ...]` so invalid filter values are rejected at the request parsing layer (422) rather than silently returning empty results.
- **SWR over Redux** — Single dashboard page with client-side API fetching inside an App Router page shell. SWR handles caching, deduplication, and revalidation. No need for client-side global store.
- **shadcn/ui** — Copy-paste component library gives polished UI out of the box (Table, Select, Badge, Skeleton, Card) without heavy dependencies.
- **Frontend page is intentionally not over-abstracted yet** — The dashboard page keeps the behavior close to where it is used, which makes AI-assisted changes easier right now because the main flow is visible in one place. As the page grows, this is still easy to refactor into reusable artifacts like hooks, smaller components, or other abstractions when the seams become clear.
- **Canonical trends API contract** — I changed `/mentions/trends` from a date-only body to `{ group_by, filters }`. That is a deliberate breaking change for this assignment. The reason is semantic consistency: `/mentions` and `/mentions/trends` belong to the same resource family, so they should speak the same filter language instead of forcing the chart into a second mini-contract.
- **Debounced filter-driven refetches** — `MENTION_FILTER_DEBOUNCE_INTERVAL_MS` in `frontend/config` prevents request storms when users change multiple filters quickly. The dashboard fans out settled filter state into separate component-level requests rather than true HTTP batching: both `/mentions` and `/mentions/trends` now react to the same normalized filter slice.
- **API call race conditions avoided for now** — For this assignment, I avoided race conditions on frontend API calls for now by keeping the fetch flow simple and driven by the latest settled filter state. If the interaction surface grows, this can be hardened further with request cancellation, stale-response guards, or a centralized request coordination layer.
- **Routes call the DB directly (no controller/service layer)** — For this small assignment, `mention_routes.py` runs the SQLAlchemy queries inline. In a larger API, a controller (or service) should sit between the HTTP route and persistence: the route handles request/response wiring; the controller owns the DB calls and returns data the route maps to Pydantic responses. That extraction is a short refactor when the surface area grows (e.g. move list/trends logic into `mentions_service.py` and pass `AsyncSession` in).

## Backend error handling

**Goal:** One JSON shape for every failure the dashboard cares about — `{ "error": string, "detail"?: string }` (`ErrorResponse`) — so the frontend can parse errors consistently (including 422 validation, which FastAPI would otherwise return as a different `detail` array shape).

**How it fits together:**

- **Global handlers** in `app/__init__.py` turn exceptions into that shape: `RequestValidationError` → 422 with a readable `detail` string; `AppApiException` → whatever status and messages the route attached.
- **Per-route `try` / `except`** stays in the route on purpose. When something breaks, the first place you open in the codebase is the handler for that path (`list_mentions` vs `mention_trends`). Each block decides *what* went wrong (e.g. `SQLAlchemyError` vs a generic bug) and **raises `AppApiException`** with route-specific text (`detail` like `list_mentions query failed`). That keeps **localization of behaviour**: the route owns the story of that endpoint; the global layer only serializes and logs.

**Why not put everything in one giant global catch?** A single catch-all hides *which* route or branch failed unless you add a lot of context plumbing. Letting each route raise its own `AppApiException` keeps **readability for debugging**: stack traces and log lines still point at the route file, and the `error` / `detail` fields tell you which operation failed without reading a shared mega-handler.

**Pros:** Consistent API contract for the client; clear HTTP semantics (503 for DB layer, 500 for unexpected code paths in that route); easy to extend new routes the same way. **Cons:** Every new route should repeat the same `except` pattern until you extract a shared helper or service layer.

**Client request ID (planned):** Later, the frontend should send a per-request id on every API call (standard header such as `X-Request-ID` or a team convention). The backend should read it, attach it to logs and error handling, and optionally return it on responses so a single id ties the browser Network panel to server logs. Not implemented in this task.

## What I'd Improve With More Time

I believe in pragmatic iteration. We can do many things, but keeping things simple is important. Hence, these are a few things we can do next.

### Backend

- Add rate limiting on the API
- Add API response caching (ETags or Cache-Control)
- **Folder structure** — Current backend is intentionally small and keeps most API code in `backend/app/mentions/`. With more time, I would split route, service, and data-access concerns more explicitly.
- **PostgreSQL + migrations + query improvements** — Replace SQLite with PostgreSQL while keeping SQLAlchemy. Use Alembic for migrations. Replace SQLite-specific `func.strftime` week-grouping with native `DATE_TRUNC`. Add indexes on `created_at`, `model`, `sentiment`.
- **API contract** — Auto-generate frontend TS types from the FastAPI OpenAPI spec (e.g. `openapi-typescript`). Currently `backend/app/mentions/mention_schemas.py` and `frontend/models/index.ts` are manually kept in sync with loose `string` types on the FE side.
- **Structured error logging + client request id** — `AppApiException` is logged in the global handler; next step is a client-supplied request id header on each call, logged on success and failure, plus structured logs (e.g. `structlog`) for cross-service traces.

### Frontend

- **Global state management (Zustand): Important if we add any new page** — Replace prop-threading of filter state from `dashboard-page-client.tsx` down to the table/chart with a Zustand store. Each component subscribes to the slice it needs.

### UI/UX

- Add sorting — click column headers to sort by that field
- Add dark mode toggle
- Add a summary stats row above the table (total mentions, mention rate %, top model)
- **Mention Trend Chart improvements** — The current chart (`trend-chart.tsx`) is a basic Recharts AreaChart with the default legend and tooltip. One improvement would be to give users an option to load data focused on a specific time period.


## Time Spent

~4–5 hours
