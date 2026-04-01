# Frontend

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS v4
- Recharts (area chart for trends)
- TanStack Table (mentions table)
- shadcn/ui (Table, Select, Badge, Skeleton, Card)
- SWR (data fetching, caching, deduplication)
- Sonner (toast notifications)
- Lucide (icons)
- tw-animate-css (animations)

## State Management
- SWR for all server data — caching, deduplication, and revalidation out of the box. No client-side global store needed for a single dashboard page.

## Folder Structure (frontend)

```
frontend/
├── app/
│   ├── layout.tsx                   # root layout, Toaster provider
│   ├── page.tsx                     # dashboard route (/), Suspense boundary
│   ├── dashboard-page-client.tsx    # client shell — filters, URL sync, data wiring
│   └── globals.css                  # Tailwind v4 import + theme tokens
├── components/
│   ├── dashboard-header.tsx         # title + subtitle
│   ├── mentions-table.tsx           # TanStack Table, pagination, per-page selector
│   ├── trend-chart.tsx              # Recharts AreaChart for mention trends
│   └── ui/                          # shadcn primitives (badge, button, card, input, select, skeleton, table)
├── config/
│   ├── index.ts                     # API_BASE_URL, DEFAULT_PAGE_SIZE, SWR / debounce intervals
│   └── mention-filter-labels.ts     # human-readable labels for model, sentiment, date presets
├── models/
│   └── index.ts                     # TS types aligned with API contract (requests, responses, entities)
├── services/
│   └── brand-mentions-api-service.ts # POST helpers + SWR hooks for /mentions and /mentions/trends
├── lib/
│   ├── utils.ts                     # cn() helper (clsx + tailwind-merge)
│   ├── use-debounced-value.ts       # generic debounce hook
│   ├── validation.ts                # shared validation helpers
│   ├── mention-filters-url.ts       # read/write filter state ↔ URL search params
│   └── filters/
│       ├── mention-filter-control.tsx            # filter bar UI (date, model, sentiment, mentioned, reset)
│       ├── mention-filter-label-helpers.ts       # label lookup utilities
│       └── mention-filter-default-date-range.ts  # default From/To date calculation
├── __tests__/                       # Vitest suite (10 files — api, validation, debounce, filters, table, chart, badge)
├── vitest.config.ts
└── tsconfig.json                    # path aliases: @/config, @/models, @/services, @/lib/...
```

Import aliases: `@/config`, `@/models`, `@/services`, `@/lib/...` (see `tsconfig.json` paths).

# Backend

## Tech Stack
- FastAPI (async Python web framework)
- SQLAlchemy async + aiosqlite (type-safe query building, all aggregations in SQL)
- Pydantic (request/response validation with Literal types for strict filter values)
- uvicorn (ASGI server)

## Database
- SQLite (`backend/mentions.db`, seeded via `python seed_db.py` from `seed_data.sql`)

## Folder Structure (backend)

```
backend/
├── main.py            # uvicorn entry — `app = create_application()`
├── app/
│   ├── __init__.py    # create_application(): FastAPI, CORS, lifespan, GET /health, include mention router
│   ├── config.py      # DATABASE_PATH (backend/mentions.db), CORS_ORIGINS, pagination limits
│   ├── database.py    # async engine, session factory, Base, get_database_session, lifespan
│   └── mentions/
│       ├── mention_record.py          # SQLAlchemy MentionRecord ORM
│       ├── mention_schemas.py         # Pydantic request/response models
│       ├── mention_routes.py          # APIRouter — POST /mentions, POST /mentions/trends
│       └── mention_filter_builder.py  # build_mention_filters() for list queries
├── seed_db.py         # creates and seeds mentions.db from seed_data.sql
├── requirements.txt   # pinned deps — fastapi, sqlalchemy, aiosqlite, pydantic, pytest
└── tests/
    ├── conftest.py    # shared fixtures (AsyncClient against ASGI app)
    ├── test_smoke.py  # API integration tests (filters, pagination, 422, empty results)
    └── test_unit.py   # Pydantic validation + config unit tests
```

Run the API from `backend/` with `uvicorn main:app` (see `railway.toml`). Imports use the `app` package (`from app...`).
