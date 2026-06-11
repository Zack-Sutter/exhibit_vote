from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import pairs, stats, votes

app = FastAPI(title="Exhibit Vote API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pairs.router)
app.include_router(votes.router)
app.include_router(stats.router)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
