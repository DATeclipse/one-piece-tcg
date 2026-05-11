"""One-time script to export all cards from SQLite to a JSON seed file."""

import json
import logging

from database import Base, SessionLocal, engine
from models import Card

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EXPORT_FIELDS = [
    "card_set_id", "card_name", "card_color", "card_type", "card_cost",
    "card_power", "life", "card_text", "types", "rarity", "counter_amount",
    "attribute", "card_image", "set_id", "set_name", "market_price",
]

OUTPUT_PATH = "data/cards.json"


def export_cards():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        cards = db.query(Card).order_by(Card.card_set_id).all()
        result = []
        for card in cards:
            entry = {}
            for field in EXPORT_FIELDS:
                value = getattr(card, field)
                if hasattr(value, "value"):
                    value = value.value
                entry[field] = value
            result.append(entry)

        with open(OUTPUT_PATH, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        logger.info(f"Exported {len(result)} cards to {OUTPUT_PATH}")
    finally:
        db.close()


if __name__ == "__main__":
    export_cards()
