# Deploying on Railway

Two services from one GitHub repo: **backend** (FastAPI + SQLite) and **frontend** (Next.js). Config-as-code lives in [backend/railway.toml](../backend/railway.toml) and [frontend/railway.toml](../frontend/railway.toml).

## Service setup

| Service   | Root Directory (dashboard) | Build / start                         |
| --------- | -------------------------- | ------------------------------------- |
| Backend   | `backend`                  | From `railway.toml` (pip, uvicorn)    |
| Frontend  | `frontend`                 | From `railway.toml` (npm ci, next)    |

Create two Railway services, both connected to the same repo, each with the root directory above.

## Database (no seed during deploy)

`python seed_db.py` is **not** run on Railway. This repo ships a tracked [backend/mentions.db](../backend/mentions.db) (see `.gitignore` exception).

- After changing [seed_data.sql](../seed_data.sql), regenerate locally: `cd backend && python seed_db.py`, then commit the updated `mentions.db`.

**Alternative — volume:** mount a [Railway volume](https://docs.railway.com/reference/volumes) at the directory that contains `mentions.db` (same path as `DATABASE_PATH` in [backend/config.py](../backend/config.py)). Run `seed_db.py` once via Railway shell/CLI so the file exists on the volume; do not add seeding to build or start commands.

## Environment variables

### Backend

| Variable        | Required | Description |
| --------------- | -------- | ----------- |
| `PORT`          | Yes      | Injected by Railway; used by uvicorn. |
| `CORS_ORIGINS`  | Yes*     | Comma-separated browser origins allowed to call the API. Must include your frontend URL, e.g. `https://your-frontend.up.railway.app` or `https://your-frontend.up.railway.app,https://admin.example.com`. |

\*If unset, defaults in code are localhost only; production must set this to the real frontend origin(s).

Railway example:

```bash
CORS_ORIGINS=https://your-frontend.up.railway.app,https://staging-frontend.up.railway.app
```

### Frontend

| Variable                 | Required | Description |
| ------------------------ | -------- | ----------- |
| `PORT`                   | Yes      | Injected by Railway; used by `next start`. |
| `NEXT_PUBLIC_API_URL`    | Yes      | Public backend base URL (no trailing slash), e.g. `https://your-backend.up.railway.app`. Set **before** build; it is inlined at compile time. |

Deploy order: deploy backend first, copy its URL, set `NEXT_PUBLIC_API_URL` on the frontend service, then build/deploy frontend. Update backend `CORS_ORIGINS` to match the frontend URL.

## Smoke tests

**Production**

1. `curl -sS https://<backend-host>/health` → JSON with `"status":"ok"`.
2. Open the frontend URL; table and chart load; filters trigger API calls without CORS errors.

**Local (optional)**

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --host 127.0.0.1 --port 8000
curl -sS http://127.0.0.1:8000/health
```

```bash
# Frontend (separate terminal; point at local API)
cd frontend && NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run build && NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run start
```

**Unit tests (unchanged by Railway):** `cd frontend && npm test`.
