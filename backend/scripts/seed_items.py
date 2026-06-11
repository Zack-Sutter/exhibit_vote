"""Seed the database with MoMath exhibit items from images/momath_icons."""

import argparse
import re
from pathlib import Path

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import Item, Vote
from app.paths import ICONS_DIR

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

# Filenames that do not already match the exhibit display name.
NAME_OVERRIDES: dict[str, str] = {
    "47a_SplittingImage": "Splitting Image",
    "47b_4GonConclusion": "4-Gon Conclusion",
    "47c_SeaSwarm": "Sea Swarm",
    "47d_PachelballsCannon": "Pachelballs Cannon",
    "47e_MandalaMath": "Mandala Math",
    "47f_PythagoJam": "Pythago Jam",
    "52_EllipticalHoleInOne": "Elliptical Hole in One",
}


def _camel_to_words(value: str) -> str:
    spaced = re.sub(r"([a-z])([A-Z])", r"\1 \2", value)
    spaced = re.sub(r"([A-Za-z])(\d)", r"\1 \2", spaced)
    return re.sub(r"\s+", " ", spaced).strip()


def name_from_icon_path(path: Path) -> str:
    stem = path.stem
    if stem in NAME_OVERRIDES:
        return NAME_OVERRIDES[stem]

    match = re.match(r"^\d+[a-z]?_(.+)$", stem)
    if match:
        return _camel_to_words(match.group(1))

    return stem


def image_url_for_icon(path: Path) -> str:
    return f"/images/momath_icons/{path.name}"


def discover_exhibits(icons_dir: Path) -> list[Item]:
    if not icons_dir.is_dir():
        raise FileNotFoundError(f"Icons directory not found: {icons_dir}")

    items: list[Item] = []
    for path in sorted(icons_dir.iterdir()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        items.append(
            Item(
                name=name_from_icon_path(path),
                description="",
                image_url=image_url_for_icon(path),
            )
        )
    return items


def clear_items_and_votes(session: Session) -> None:
    for vote in session.exec(select(Vote)).all():
        session.delete(vote)
    for item in session.exec(select(Item)).all():
        session.delete(item)
    session.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed exhibit items from momath icons.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing votes and items, then re-seed from icons.",
    )
    args = parser.parse_args()

    exhibits = discover_exhibits(ICONS_DIR)
    if not exhibits:
        raise SystemExit(f"No icon images found in {ICONS_DIR}")

    create_db_and_tables()
    with Session(engine) as session:
        existing = session.exec(select(Item)).first()
        if existing is not None and not args.force:
            count = len(session.exec(select(Item)).all())
            print(
                f"Database already has {count} item(s). Skipping seed. "
                "Use --force to replace with icon data."
            )
            return

        if existing is not None:
            clear_items_and_votes(session)

        for item in exhibits:
            session.add(item)
        session.commit()
        print(f"Seeded {len(exhibits)} items from {ICONS_DIR}.")


if __name__ == "__main__":
    main()
