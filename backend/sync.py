import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from config import OPTCG_BASE_URL
from database import SessionLocal, engine, Base
from models import Card, CardType, DataSource

logger = logging.getLogger(__name__)

ENDPOINTS = [
    "/allSetCards/",
    "/allSTCards/",
    "/promos/filtered/",
]


def _parse_int(value) -> int:
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def _parse_float(value) -> float:
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _parse_color(color_str: str) -> list:
    if not color_str:
        return []
    return color_str.split()


def _parse_types(sub_types_str: str) -> list:
    if not sub_types_str:
        return []
    return [t.strip() for t in sub_types_str.split("/") if t.strip()]


def _parse_card_type(type_str: str) -> str:
    if not type_str:
        return None
    normalized = type_str.strip()
    for ct in CardType:
        if ct.value.lower() == normalized.lower():
            return ct
    return None


def _map_card(raw: dict) -> dict:
    card_type = _parse_card_type(raw.get("card_type", ""))
    if card_type is None:
        return None

    card_set_id = raw.get("card_set_id", "")
    if not card_set_id:
        return None

    return dict(
        card_set_id=card_set_id,
        card_name=raw.get("card_name", ""),
        card_color=_parse_color(raw.get("card_color", "")),
        card_type=card_type,
        card_cost=_parse_int(raw.get("card_cost")),
        card_power=_parse_int(raw.get("card_power")),
        life=_parse_int(raw.get("life")),
        card_text=raw.get("card_text"),
        types=_parse_types(raw.get("sub_types", "")),
        rarity=raw.get("rarity", "C"),
        counter_amount=_parse_int(raw.get("counter_amount")),
        attribute=raw.get("attribute"),
        card_image=raw.get("card_image", ""),
        set_id=raw.get("set_id", ""),
        set_name=raw.get("set_name", ""),
        market_price=_parse_float(raw.get("market_price")),
        data_source=DataSource.OPTCG_API,
        verified=False,
        date_synced=datetime.now(timezone.utc),
    )


def sync_cards(db: Session) -> int:
    all_cards = {}

    with httpx.Client(timeout=60.0) as client:
        for endpoint in ENDPOINTS:
            url = f"{OPTCG_BASE_URL}{endpoint}"
            logger.info(f"Fetching {url}")
            try:
                resp = client.get(url)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                logger.error(f"Failed to fetch {url}: {e}")
                continue

            if isinstance(data, list):
                for raw in data:
                    card_set_id = raw.get("card_set_id", "")
                    if card_set_id and card_set_id not in all_cards:
                        all_cards[card_set_id] = raw

    logger.info(f"Fetched {len(all_cards)} unique cards from API")

    upserted = 0
    for card_set_id, raw in all_cards.items():
        mapped = _map_card(raw)
        if mapped is None:
            continue

        existing = db.query(Card).filter_by(card_set_id=card_set_id).first()
        if existing:
            for key, value in mapped.items():
                if key != "card_set_id":
                    setattr(existing, key, value)
        else:
            db.add(Card(**mapped))
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
