from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas import ItemRead, PairResponse
from app.services.pairing import get_random_pair

router = APIRouter(prefix="/api", tags=["pairs"])


@router.get("/pair", response_model=PairResponse)
def read_pair(session: Session = Depends(get_session)) -> PairResponse:
    item_a, item_b = get_random_pair(session)
    return PairResponse(
        item_a=ItemRead.model_validate(item_a),
        item_b=ItemRead.model_validate(item_b),
    )
