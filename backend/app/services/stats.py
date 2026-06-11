from sqlmodel import Session, select

from app.models import Item, Vote
from app.schemas import StatEntry


def compute_stats(session: Session) -> list[StatEntry]:
    items = session.exec(select(Item)).all()
    votes = session.exec(select(Vote)).all()

    wins: dict[int, int] = {item.id: 0 for item in items}
    losses: dict[int, int] = {item.id: 0 for item in items}

    for vote in votes:
        if vote.winner_id in wins:
            wins[vote.winner_id] += 1
        if vote.loser_id in losses:
            losses[vote.loser_id] += 1

    stats: list[StatEntry] = []
    for item in items:
        item_wins = wins.get(item.id, 0)
        item_losses = losses.get(item.id, 0)
        total = item_wins + item_losses
        win_rate = item_wins / total if total > 0 else 0.0
        stats.append(
            StatEntry(
                id=item.id,
                name=item.name,
                wins=item_wins,
                losses=item_losses,
                win_rate=round(win_rate, 3),
            )
        )

    stats.sort(key=lambda entry: (-entry.win_rate, -entry.wins, entry.name))
    return stats
