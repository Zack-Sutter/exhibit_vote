# Exhibit Vote

Pairwise voting webapp: users pick between two random exhibits, votes are stored in a database, and rankings are shown on a stats page.

## Project structure

```
exhibit_vote/
├── backend/          # FastAPI + SQLite API
└── frontend/         # React + TypeScript + Vite
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

## Backend setup

```bash
cd backend
uv sync
# or: pip install -e .
```

Seed sample exhibits:

```bash
cd backend
uv run python -m scripts.seed_items
```

Start the API server:

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

In local development, Vite proxies `/api` requests to the backend on port 8000.

## API endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/api/health` | Health check                   |
| GET    | `/api/pair`   | Two random items to compare    |
| POST   | `/api/vote`   | Record a vote (`winner_id`, `loser_id`) |
| GET    | `/api/stats`  | Win/loss stats for all items   |

## Production note

Set `VITE_API_URL` in the frontend to your deployed API URL before building:

```bash
cd frontend
npm run build
```
