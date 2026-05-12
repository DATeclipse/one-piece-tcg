"""Map alternate art card images (_r1/_r2) to existing DB entries."""
import json
import os
import re
from database import SessionLocal, engine, Base
from models import Card

Base.metadata.create_all(engine)

CARDS_ROOT = os.path.join(os.path.dirname(__file__), "..", "cards")

def find_alt_art_images():
    """Find all _r1/_r2 variant images and map to base card IDs."""
    variants = {}  # base_id -> [image_paths]
    pattern = re.compile(r"^(.+?)_r(\d+)\.png$")

    for dirpath, _, filenames in os.walk(CARDS_ROOT):
        for fname in filenames:
            m = pattern.match(fname)
            if m:
                base_id = m.group(1)
                rel_dir = os.path.relpath(dirpath, CARDS_ROOT)
                image_path = f"/static/cards/{rel_dir}/{fname}"
                variants.setdefault(base_id, []).append(image_path)

    return variants

def main():
    variants = find_alt_art_images()
    print(f"Found {sum(len(v) for v in variants.values())} alt art images for {len(variants)} cards")

    db = SessionLocal()
    updated = 0
    missing = 0

    for base_id, images in sorted(variants.items()):
        card = db.query(Card).filter(Card.card_set_id == base_id).first()
        if card:
            existing = card.alt_images if card.alt_images else []
            merged = list(set(existing + images))
            merged.sort()
            card.alt_images = merged
            updated += 1
        else:
            missing += 1
            print(f"  No DB entry for base card: {base_id}")

    db.commit()
    db.close()
    print(f"Updated {updated} cards with alt art. {missing} base cards not found in DB.")

if __name__ == "__main__":
    main()
