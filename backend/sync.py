import json
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from config import CARDS_JSON_PATH
from database import Base, SessionLocal, engine
from models import Card, CardType, DataSource

logger = logging.getLogger(__name__)

CARD_TYPE_MAP = {ct.value.lower(): ct for ct in CardType}


def sync_cards(db: Session) -> int:
    with open(CARDS_JSON_PATH) as f:
        cards_data = json.load(f)

    logger.info(f"Loading {len(cards_data)} cards from {CARDS_JSON_PATH}")

    upserted = 0
    now = datetime.now(timezone.utc)

    for entry in cards_data:
        card_set_id = entry.get("card_set_id")
        if not card_set_id:
            continue

        card_type_str = entry.get("card_type", "")
        card_type = CARD_TYPE_MAP.get(card_type_str.lower())
        if card_type is None:
            continue

        fields = {
            "card_name": entry.get("card_name", ""),
            "card_color": entry.get("card_color", []),
            "card_type": card_type,
            "card_cost": entry.get("card_cost"),
            "card_power": entry.get("card_power"),
            "life": entry.get("life"),
            "card_text": entry.get("card_text"),
            "types": entry.get("types", []),
            "rarity": entry.get("rarity", "C"),
            "counter_amount": entry.get("counter_amount"),
            "attribute": entry.get("attribute"),
            "card_image": entry.get("card_image", ""),
            "set_id": entry.get("set_id", ""),
            "set_name": entry.get("set_name", ""),
            "market_price": entry.get("market_price"),
        }

        existing = db.query(Card).filter_by(card_set_id=card_set_id).first()
        if existing:
            for key, value in fields.items():
                setattr(existing, key, value)
            existing.date_synced = now
        else:
            db.add(Card(
                card_set_id=card_set_id,
                **fields,
                data_source=DataSource.OPTCG_API,
                verified=False,
                date_synced=now,
            ))
        upserted += 1

    db.commit()
    logger.info(f"Synced {upserted} cards to database")
    return upserted


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        count = sync_cards(db)
        print(f"Synced {count} cards")
    finally:
        db.close()
