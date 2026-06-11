from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas import StatEntry
from app.services.stats import compute_stats

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=list[StatEntry])
def read_stats(session: Session = Depends(get_session)) -> list[StatEntry]:
    return compute_stats(session)
