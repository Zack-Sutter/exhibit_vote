from datetime import datetime

from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    image_url: str | None = None


class Vote(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    winner_id: int = Field(foreign_key="item.id")
    loser_id: int = Field(foreign_key="item.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
