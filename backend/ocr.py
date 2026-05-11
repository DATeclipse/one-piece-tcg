"""Utilities for OCR card image cross-referencing."""

import re
from pathlib import Path
from typing import Optional


def card_id_to_image_path(card_set_id: str, cards_dir: Path) -> Optional[Path]:
    """Map card_set_id like 'OP01-004' to image path like cards/OP-01/OP01-004.png"""
    set_code = card_set_id.split("-")[0]
    match = re.match(r"([A-Za-z]+)(\d+)", set_code)
    if not match:
        return None

    dir_name = f"{match.group(1)}-{match.group(2)}"
    filename = f"{card_set_id}.png"

    path = cards_dir / dir_name / filename
    if path.exists():
        return path

    for hybrid_dir in cards_dir.iterdir():
        if not hybrid_dir.is_dir():
            continue
        if "-" in hybrid_dir.name and dir_name in hybrid_dir.name:
            path = hybrid_dir / filename
            if path.exists():
                return path

    for special_dir in ["Promotion_card", "Other_Product_Card"]:
        path = cards_dir / special_dir / filename
        if path.exists():
            return path

    return None
