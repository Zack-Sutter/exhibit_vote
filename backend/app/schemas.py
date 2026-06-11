from pydantic import BaseModel


class ItemRead(BaseModel):
    id: int
    name: str
    description: str
    image_url: str | None

    model_config = {"from_attributes": True}


class PairResponse(BaseModel):
    item_a: ItemRead
    item_b: ItemRead


class VoteCreate(BaseModel):
    winner_id: int
    loser_id: int


class VoteResponse(BaseModel):
    id: int
    winner_id: int
    loser_id: int

    model_config = {"from_attributes": True}


class StatEntry(BaseModel):
    id: int
    name: str
    wins: int
    losses: int
    win_rate: float
