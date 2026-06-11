from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import Item, Vote
from app.schemas import VoteCreate, VoteResponse

router = APIRouter(prefix="/api", tags=["votes"])


@router.post("/vote", response_model=VoteResponse)
def create_vote(
    vote_in: VoteCreate, session: Session = Depends(get_session)
) -> VoteResponse:
    if vote_in.winner_id == vote_in.loser_id:
        raise HTTPException(status_code=400, detail="Winner and loser must differ.")

    for item_id in (vote_in.winner_id, vote_in.loser_id):
        if session.get(Item, item_id) is None:
            raise HTTPException(status_code=404, detail="One or both items not found.")

    vote = Vote(winner_id=vote_in.winner_id, loser_id=vote_in.loser_id)
    session.add(vote)
    session.commit()
    session.refresh(vote)
    return VoteResponse.model_validate(vote)
