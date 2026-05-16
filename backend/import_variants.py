"""Import _p* variant images as separate Card entries, cloning base card data."""
import os
import re
from database import SessionLocal, engine, Base
from models import Card

Base.metadata.create_all(engine)

CARDS_ROOT = os.path.join(os.path.dirname(__file__), "..", "cards")
PATTERN = re.compile(r"^(.+?)_(p\d+)\.png$")


def find_p_variants():
    """Find all _p* variant images and map to base card IDs."""
    variants = []
    for dirpath, _, filenames in os.walk(CARDS_ROOT):
        for fname in filenames:
            m = PATTERN.match(fname)
            if m:
                base_id = m.group(1)
                suffix = m.group(2)
                variant_id = f"{base_id}_{suffix}"
                rel_dir = os.path.relpath(dirpath, CARDS_ROOT)
                image_path = f"/static/cards/{rel_dir}/{fname}"
                variants.append((base_id, variant_id, image_path, rel_dir))
    return variants


def main():
    variants = find_p_variants()
    print(f"Found {len(variants)} _p* variant images")

    db = SessionLocal()
    inserted = 0
    skipped = 0
    missing = 0

    for base_id, variant_id, image_path, rel_dir in sorted(variants, key=lambda x: x[1]):
        existing = db.query(Card).filter(Card.card_set_id == variant_id).first()
        if existing:
            skipped += 1
            continue

        base_card = db.query(Card).filter(Card.card_set_id == base_id).first()
        if not base_card:
            missing += 1
            print(f"  No base card for: {variant_id} (base={base_id})")
            continue

        variant = Card(
            card_set_id=variant_id,
            card_name=base_card.card_name,
            card_color=base_card.card_color,
            card_type=base_card.card_type,
            card_cost=base_card.card_cost,
            card_power=base_card.card_power,
            life=base_card.life,
            card_text=base_card.card_text,
            types=base_card.types,
            rarity=base_card.rarity,
            counter_amount=base_card.counter_amount,
            attribute=base_card.attribute,
            card_image=image_path,
            alt_images=[],
            set_id=base_card.set_id,
            set_name=base_card.set_name,
            market_price=None,
            data_source="ocr",
            verified=False,
        )
        db.add(variant)
        inserted += 1

    db.commit()
    db.close()
    print(f"Inserted {inserted}, skipped {skipped} (exist), {missing} base cards not found.")


if __name__ == "__main__":
    main()
