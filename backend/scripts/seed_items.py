"""Seed the database with sample exhibit items."""

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import Item

SAMPLE_ITEMS = [
    Item(
        name="Hyper Hyperboloid",
        description="Spinning straight lines form a curved surface.",
    ),
    Item(
        name="Square-Wheeled Tricycle",
        description="Ride a tricycle with square wheels on a special track.",
    ),
    Item(
        name="Human Tree Exhibit",
        description="Duplicate yourself recursively to form a fractal tree.",
    ),
    Item(
        name="Harmony of the Spheres",
        description="Touch glowing spheres to create harmonic sounds.",
    ),
    Item(
        name="Tile Factory",
        description="Explore shapes that tile the plane in different ways.",
    ),
    Item(
        name="Motionscape",
        description="Walk patterns that reveal surprising mathematical curves.",
    ),
]


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        existing = session.exec(select(Item)).first()
        if existing is not None:
            print("Database already has items. Skipping seed.")
            return

        for item in SAMPLE_ITEMS:
            session.add(item)
        session.commit()
        print(f"Seeded {len(SAMPLE_ITEMS)} items.")


if __name__ == "__main__":
    main()
