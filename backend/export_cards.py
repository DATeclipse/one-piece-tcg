"""One-time script to export all cards from SQLite to a JSON seed file."""

import json
import logging

from typing import Optional

from config import LOCAL_CARDS_DIR
from database import Base, SessionLocal, engine
from models import Card
from ocr import card_id_to_image_path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EXPORT_FIELDS = [
    "card_set_id", "card_name", "card_color", "card_type", "card_cost",
    "card_power", "life", "card_text", "types", "rarity", "counter_amount",
    "attribute", "card_image", "set_id", "set_name", "market_price",
]

OUTPUT_PATH = "data/cards.json"


def resolve_image_url(card_set_id: str) -> Optional[str]:
    path = card_id_to_image_path(card_set_id, LOCAL_CARDS_DIR)
    if path is None:
        return None
    rel = path.relative_to(LOCAL_CARDS_DIR)
    return f"/static/cards/{rel}"


def export_cards():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        cards = db.query(Card).order_by(Card.card_set_id).all()
        result = []
        resolved = 0
        missing = []
        for card in cards:
            entry = {}
            for field in EXPORT_FIELDS:
                value = getattr(card, field)
                if hasattr(value, "value"):
                    value = value.value
                entry[field] = value
            image_url = resolve_image_url(card.card_set_id)
            entry["card_image"] = image_url
            if image_url:
                resolved += 1
            else:
                missing.append(card.card_set_id)
            result.append(entry)

        with open(OUTPUT_PATH, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        logger.info(f"Exported {len(result)} cards to {OUTPUT_PATH}")
        logger.info(f"Resolved {resolved}/{len(result)} card images to local paths")
        if missing:
            logger.info(f"Missing images ({len(missing)}): {missing[:10]}{'...' if len(missing) > 10 else ''}")
    finally:
        db.close()


if __name__ == "__main__":
    export_cards()
