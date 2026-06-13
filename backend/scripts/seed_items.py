"""Seed the database with MoMath exhibit items from a fixed manifest."""

import argparse
import json
import re
from pathlib import Path

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import Item, Vote

MANIFEST_PATH = Path(__file__).resolve().parent / "exhibit_manifest.json"

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


def name_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    if stem in NAME_OVERRIDES:
        return NAME_OVERRIDES[stem]

    match = re.match(r"^\d+[a-z]?_(.+)$", stem)
    if match:
        return _camel_to_words(match.group(1))

    return stem


def image_url_for_filename(filename: str) -> str:
    return f"/images/momath_icons/{filename}"


def load_exhibits_from_manifest(manifest_path: Path) -> list[Item]:
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    filenames = data.get("icons", [])
    if not filenames:
        raise ValueError(f"No icons listed in {manifest_path}")

    return [
        Item(
            name=name_from_filename(filename),
            description="",
            image_url=image_url_for_filename(filename),
        )
        for filename in filenames
    ]


def clear_items_and_votes(session: Session) -> None:
    for vote in session.exec(select(Vote)).all():
        session.delete(vote)
    for item in session.exec(select(Item)).all():
        session.delete(item)
    session.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed exhibit items from manifest.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing votes and items, then re-seed from manifest.",
    )
    args = parser.parse_args()

    if not MANIFEST_PATH.is_file():
        raise SystemExit(f"Manifest not found: {MANIFEST_PATH}")

    exhibits = load_exhibits_from_manifest(MANIFEST_PATH)

    create_db_and_tables()
    with Session(engine) as session:
        existing = session.exec(select(Item)).first()
        if existing is not None and not args.force:
            count = len(session.exec(select(Item)).all())
            print(
                f"Database already has {count} item(s). Skipping seed. "
                "Use --force to replace with manifest data."
            )
            return

        if existing is not None:
            clear_items_and_votes(session)

        for item in exhibits:
            session.add(item)
        session.commit()
        print(f"Seeded {len(exhibits)} items from {MANIFEST_PATH.name}.")


if __name__ == "__main__":
    main()
