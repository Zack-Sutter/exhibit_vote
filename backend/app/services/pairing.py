import random

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models import Item


def get_random_pair(session: Session) -> tuple[Item, Item]:
    items = session.exec(select(Item)).all()
    if len(items) < 2:
        raise HTTPException(
            status_code=400,
            detail="Need at least 2 items in the database to create a pair.",
        )
    return tuple(random.sample(items, 2))
