# Exhibit Vote — Project Handoff

This document describes the current state of the **exhibit_vote** repository for an AI agent (or developer) continuing work. It covers product intent, architectural decisions, what was scaffolded, how to run the app, and recommended next steps.

---

## Product intent

**Exhibit Vote** is a webapp for pairwise preference voting:

1. Users see **two random exhibits** side by side.
2. They **click/tap** one to vote for it (swipe UX is planned but not implemented).
3. The vote is **persisted** (`winner` beat `loser`).
4. A separate **stats page** shows rankings derived from all votes.

Target context: MoMath-style museum exhibits, but the data model is generic (`Item` with name, description, optional image).

The scaffold prioritizes clarity and a standard split-stack layout over advanced features.

---

## What existed before scaffolding

The repo started as a minimal Python project:

- Root `pyproject.toml` with empty dependencies
- Root `main.py` printing `"Hello from exhibit-vote!"`
- Empty `README.md`
- Python 3.10 (`.python-version`)

All of that was replaced/restructured during scaffolding.

---

## What was built

### High-level layout

Monorepo with two independent apps:

```
exhibit_vote/
├── backend/          # FastAPI JSON API + SQLite
├── frontend/         # React + TypeScript + Vite SPA
├── docs/             # This handoff doc
├── pyproject.toml    # uv workspace root (members: ["backend"])
├── README.md         # Human-facing quick start
└── .gitignore
```

### Backend (`backend/`)

| Area     | Files                     | Purpose                                                    |
| -------- | ------------------------- | ---------------------------------------------------------- |
| Entry    | `app/main.py`             | FastAPI app, CORS, router registration, DB init on startup |
| DB       | `app/database.py`         | SQLite engine at `backend/data/exhibit_vote.db`            |
| Models   | `app/models.py`           | `Item`, `Vote` SQLModel tables                             |
| Schemas  | `app/schemas.py`          | Pydantic request/response types for API                    |
| Routers  | `app/routers/pairs.py`    | `GET /api/pair`                                            |
|          | `app/routers/votes.py`    | `POST /api/vote`                                           |
|          | `app/routers/stats.py`    | `GET /api/stats`                                           |
| Services | `app/services/pairing.py` | Random pair selection                                      |
|          | `app/services/stats.py`   | Win/loss/win-rate aggregation                              |
| Seed     | `scripts/seed_items.py`   | Inserts 6 sample MoMath-style exhibits (idempotent)        |
| Config   | `pyproject.toml`          | `fastapi`, `uvicorn[standard]`, `sqlmodel`                 |

**Removed:** root `main.py` (no longer used).

### Frontend (`frontend/`)

Created with `npm create vite@latest frontend -- --template react-ts`.

| Area       | Files                               | Purpose                                     |
| ---------- | ----------------------------------- | ------------------------------------------- |
| API        | `src/api/client.ts`                 | `fetch` wrappers for all endpoints          |
| Types      | `src/types/index.ts`                | TypeScript mirrors of backend schemas       |
| Pages      | `src/pages/VotePage.tsx`            | Load pair → vote → load next pair           |
|            | `src/pages/StatsPage.tsx`           | Load and display rankings                   |
| Components | `src/components/ItemCard.tsx`       | Clickable exhibit card                      |
|            | `src/components/PairComparison.tsx` | Two cards + "or" divider                    |
|            | `src/components/StatsTable.tsx`     | Rankings table                              |
| Routing    | `src/App.tsx`                       | React Router: `/` vote, `/stats` stats      |
| Styles     | `src/App.css`, `src/index.css`      | Basic responsive layout                     |
| Config     | `vite.config.ts`                    | Dev proxy: `/api` → `http://localhost:8000` |
| Env        | `.env.example`                      | Documents `VITE_API_URL` for production     |

**Dependencies added:** `react-router-dom` (v7). Default Vite template deps otherwise unchanged (React 19, Vite 8, TypeScript 6).

### Other files

- `.gitignore` — ignores `.venv`, `backend/data/*.db`, `frontend/node_modules`, `frontend/dist`, `.env`
- `backend/data/.gitkeep` — keeps data directory in git; DB file itself is gitignored
- `README.md` — setup and run instructions for humans

### Verified during scaffolding

- `uv sync` in `backend/` installs Python deps
- `uv run python -m scripts.seed_items` seeds 6 items
- `npm run build` in `frontend/` succeeds (TypeScript + Vite production build)

---

## Architectural decisions

### 1. Split backend + React frontend from day one

**Decision:** JSON-only FastAPI backend; React SPA in `frontend/`.

**Rationale:** User requested React-first scaffolding. Avoids migrating away from server-rendered templates later. Clear separation: backend owns data/logic; frontend owns UI.

**Implication:** CORS is configured for local Vite (`localhost:5173`). Production will need either CORS updates or same-origin deployment.

### 2. FastAPI + SQLite + SQLModel

**Decision:** Python stack aligned with existing repo; SQLite for zero-config local DB.

**Rationale:** Beginner-friendly, single-file database, no separate DB server. SQLModel pairs naturally with FastAPI.

**Implication:** Fine for museum/kiosk scale. Migrate to PostgreSQL if concurrent writes or hosted multi-instance deployment becomes necessary. The API layer should not need major changes for that swap (only `database.py` connection string and possibly migration tooling).

### 3. Head-to-head vote records (not aggregate counters)

**Decision:** Each vote is a row: `winner_id`, `loser_id`, `created_at`.

**Rationale:** Preserves full history; stats are computed at read time. Enables future analytics (time trends, Elo, etc.).

**Alternative not chosen:** Incrementing `wins`/`losses` columns on `Item` directly (simpler reads, loses audit trail).

### 4. Random pair selection with `random.sample`

**Decision:** `GET /api/pair` returns two distinct random items from all items.

**Not implemented:** Avoiding repeat pairs, weighting by under-voted items, or ensuring coverage. Pure uniform random for v1.

### 5. Stats computed on read

**Decision:** `GET /api/stats` iterates all votes and items each request.

**Rationale:** Simple for small datasets. No caching or materialized views.

**Sort order:** `win_rate` desc, then `wins` desc, then `name` asc.

**Win rate:** `wins / (wins + losses)`; `0.0` if no votes.

### 6. Click-to-vote first, swipe later

**Decision:** `ItemCard` is a `<button>` with `onClick`. No touch/swipe library.

**Rationale:** Ship working flow before animation complexity. Swipe was discussed as a follow-up (`react-tinder-card` or similar).

### 7. Vite dev proxy + optional `VITE_API_URL`

**Decision:** Local dev uses empty `API_BASE` and Vite proxies `/api` to port 8000.

**Production:** Set `VITE_API_URL` to full API origin before `npm run build`.

### 8. uv workspace

**Decision:** Root `pyproject.toml` declares `[tool.uv.workspace]` with `members = ["backend"]`.

**Rationale:** Keeps backend deps isolated in `backend/pyproject.toml` while allowing workspace-level tooling later.

### 9. No authentication

**Decision:** Public voting; no user accounts, sessions, or rate limiting.

**Rationale:** Museum kiosk / casual voting use case. Add later if abuse becomes a concern.

### 10. No tests yet

**Decision:** Scaffold only; no pytest, no frontend tests.

**Note:** FastAPI `TestClient` was not used during scaffold (would need `httpx` dev dependency).

---

## Data model

### `Item` table

| Column        | Type        | Notes                                               |
| ------------- | ----------- | --------------------------------------------------- |
| `id`          | int PK      | Auto-increment                                      |
| `name`        | str         | Required                                            |
| `description` | str         | Default `""`                                        |
| `image_url`   | str \| null | Optional; frontend shows letter placeholder if null |

### `Vote` table

| Column       | Type               | Notes                               |
| ------------ | ------------------ | ----------------------------------- |
| `id`         | int PK             | Auto-increment                      |
| `winner_id`  | int FK → `item.id` |                                     |
| `loser_id`   | int FK → `item.id` |                                     |
| `created_at` | datetime           | UTC via `datetime.utcnow` at insert |

### Seed data

`backend/scripts/seed_items.py` defines 6 placeholder exhibits (MoMath-inspired names). Script **skips** if any item already exists. To re-seed from scratch, delete `backend/data/exhibit_vote.db` and run the script again.

---

## API contract

Base URL (local): `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

| Method | Path          | Request body              | Response                                 | Errors                                  |
| ------ | ------------- | ------------------------- | ---------------------------------------- | --------------------------------------- |
| `GET`  | `/api/health` | —                         | `{ "status": "ok" }`                     | —                                       |
| `GET`  | `/api/pair`   | —                         | `{ item_a: ItemRead, item_b: ItemRead }` | `400` if fewer than 2 items             |
| `POST` | `/api/vote`   | `{ winner_id, loser_id }` | `VoteResponse`                           | `400` if same id; `404` if item missing |
| `GET`  | `/api/stats`  | —                         | `StatEntry[]`                            | —                                       |

### Type shapes (shared backend/frontend)

```typescript
// ItemRead / Item
{ id: number, name: string, description: string, image_url: string | null }

// PairResponse
{ item_a: Item, item_b: Item }

// VoteCreate
{ winner_id: number, loser_id: number }

// StatEntry
{ id: number, name: string, wins: number, losses: number, win_rate: number }
```

`win_rate` is a float 0–1 (frontend multiplies by 100 for display).

---

## Frontend data flow

### Vote page (`/`)

1. `VotePage` mounts → `getPair()` → `GET /api/pair`
2. Renders `PairComparison` with two `ItemCard`s
3. User clicks card → `submitVote({ winner_id, loser_id })` → `POST /api/vote`
4. On success → `loadPair()` again
5. Loading/error/submitting states handled with local `useState`

### Stats page (`/stats`)

1. `StatsPage` mounts → `getStats()` → `GET /api/stats`
2. Renders `StatsTable` with rank, name, wins, losses, win %

### Navigation

`App.tsx` uses `BrowserRouter` + `NavLink` for Vote / Stats tabs.

---

## How to run (local)

**Terminal 1 — backend:**

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

**First-time DB setup:**

```bash
cd backend
uv run python -m scripts.seed_items
```

Tables are also auto-created on API startup via `create_db_and_tables()` in `main.py` startup hook.

---

## What is NOT implemented

Use this as a checklist of known gaps:

- [ ] Swipe gestures (mobile/tinder-style UX)
- [ ] Real exhibit data and images
- [ ] Admin UI or API to CRUD items
- [ ] Vote deduplication / one-vote-per-session
- [ ] Rate limiting or bot protection
- [ ] Authentication
- [ ] Charts on stats page (Chart.js, etc.)
- [ ] Elo or Bradley–Terry ranking algorithms
- [ ] Pairing logic improvements (avoid immediate repeats, balance exposure)
- [ ] Database migrations (Alembic) — schema changes are manual recreate for now
- [ ] Automated tests (backend or frontend)
- [ ] CI/CD pipeline
- [ ] Production deployment config
- [ ] OpenAPI → TypeScript codegen (types are manually duplicated)
- [ ] `datetime.utcnow` deprecation (Python 3.12+ prefers timezone-aware UTC)

---

## Recommended next steps (prioritized)

### Phase 1 — Make it real

1. **Replace seed data** in `backend/scripts/seed_items.py` with actual MoMath exhibits; add `image_url` values (local `/public` assets or CDN URLs).
2. **Improve vote UX** — loading transitions, disabled state polish, maybe a brief "vote recorded" animation before next pair.
3. **Stats polish** — bar chart, highlight top 3, show total vote count.

### Phase 2 — Exhibit management

4. **Admin endpoints** — `POST /api/items`, `PUT /api/items/{id}`, `DELETE /api/items/{id}` (protect behind auth or local-only).
5. **Bulk import** — CSV/JSON script for exhibit list.

### Phase 3 — Better voting mechanics

6. **Swipe UI** — integrate `react-tinder-card` or custom touch handlers in `PairComparison`.
7. **Smarter pairing** — track recent pairs client-side or server-side to reduce repeats.
8. **Optional Elo ratings** — new service computing ratings from vote history.

### Phase 4 — Production readiness

9. **PostgreSQL** — swap SQLite when deploying multi-instance.
10. **Deploy** — e.g. frontend on Vercel/Netlify, API on Railway/Render; set `VITE_API_URL`.
11. **Tests** — pytest for pairing, vote validation, stats; Vitest/RTL for key frontend flows.
12. **CORS** — update `allow_origins` in `main.py` for production frontend URL.

---

## Conventions for future work

### Backend

- Keep routers thin; put logic in `app/services/`.
- Add new API routes under `app/routers/` with `prefix="/api"`.
- Add Pydantic schemas in `app/schemas.py`; mirror types in `frontend/src/types/index.ts`.
- Run API from `backend/` directory so `app` package resolves correctly.

### Frontend

- All HTTP calls go through `src/api/client.ts` — do not scatter raw `fetch` in components.
- Page components own data fetching; presentational components receive props.
- Use React Router for new top-level pages; add `NavLink` in `App.tsx`.

### Scope discipline

- Match existing style: minimal abstractions, no over-engineering.
- Do not add features beyond what is requested without discussion.
- Prefer small, focused diffs.

---

## File map (quick reference)

```
backend/
  app/
    main.py
    database.py
    models.py
    schemas.py
    routers/
      pairs.py      → GET  /api/pair
      votes.py      → POST /api/vote
      stats.py      → GET  /api/stats
    services/
      pairing.py
      stats.py
  scripts/
    seed_items.py
  data/
    exhibit_vote.db   (gitignored, created at runtime)
  pyproject.toml

frontend/
  src/
    api/client.ts
    types/index.ts
    pages/VotePage.tsx
    pages/StatsPage.tsx
    components/ItemCard.tsx
    components/PairComparison.tsx
    components/StatsTable.tsx
    App.tsx
    main.tsx
  vite.config.ts
  .env.example
  package.json
```

---

## Known technical notes

1. **FastAPI startup event** uses `@app.on_event("startup")` (older pattern). Newer FastAPI prefers lifespan context manager; fine to migrate when touching `main.py`.

2. **SQLite `check_same_thread=False`** in `database.py` — required for FastAPI dependency-injected sessions across threads.

3. **Frontend `submitVote` return type** is `Promise<void>` but API returns `VoteResponse`. Client discards body; could type properly if response is needed later.

4. **Error display** — API errors are shown as raw response text in the UI. FastAPI JSON error bodies are not parsed for friendly messages.

5. **Virtualenv location** — `uv sync` from repo root creates `.venv` at root; `uv sync` from `backend/` uses backend context. Both work; be consistent about which directory you run `uv run` from (README uses `cd backend`).

---

## Summary for a new agent

You are continuing a **working scaffold** of a pairwise voting app. Backend and frontend run independently and communicate via REST. Core vote loop and stats page exist with click-based UX and placeholder exhibit data. The highest-value work is usually: real content/images, UX polish, swipe gestures, admin/item management, then production deployment and tests. Read `README.md` for commands; use this doc for architecture and intent.
