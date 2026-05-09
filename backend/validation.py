import re
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from models import Card, CardType
from schemas import DeckCardIn, ValidationResult


def parse_leader_overrides(card_text: Optional[str]) -> dict:
    """Parse 'Under the rules of this game' Leader effects into structured overrides."""
    overrides = {}
    if not card_text:
        return overrides

    prefix = "Under the rules of this game"
    if prefix.lower() not in card_text.lower():
        return overrides

    text_lower = card_text.lower()

    # "cannot include cards with a cost of X or more"
    m = re.search(r"cannot include cards with a cost of (\d+) or more", text_lower)
    if m:
        overrides["max_card_cost"] = int(m.group(1)) - 1

    # "cannot include Events with a cost of X or more"
    m = re.search(
        r"cannot include events with a cost of (\d+) or more", text_lower
    )
    if m:
        overrides["max_event_cost"] = int(m.group(1)) - 1

    # "your DON!! deck consists of X cards"
    m = re.search(r"don!! deck consists of (\d+) cards", text_lower)
    if m:
        overrides["don_deck_size"] = int(m.group(1))

    return overrides


def validate_deck(
    leader_card_set_id: str,
    cards: List[DeckCardIn],
    db: Session,
) -> ValidationResult:
    errors = []
    warnings = []

    leader = db.query(Card).filter_by(card_set_id=leader_card_set_id).first()
    if not leader:
        errors.append(f"Leader card '{leader_card_set_id}' not found")
        return ValidationResult(valid=False, errors=errors, warnings=warnings)

    if leader.card_type != CardType.LEADER:
        errors.append(f"'{leader.card_name}' is not a Leader card")

    leader_colors = set(leader.card_color) if leader.card_color else set()

    overrides = parse_leader_overrides(leader.card_text)
    if overrides:
        warnings.append(
            f"Leader has deck construction overrides: {overrides}"
        )

    # Rule 5-1-2-1: exactly 50 non-leader cards
    total = sum(c.quantity for c in cards)
    if total != 50:
        errors.append(f"Deck must have exactly 50 cards (currently {total})")

    for entry in cards:
        card = db.query(Card).filter_by(card_set_id=entry.card_set_id).first()
        if not card:
            errors.append(f"Card '{entry.card_set_id}' not found")
            continue

        # Rule 5-1-2: no Leaders in the deck portion
        if card.card_type == CardType.LEADER:
            errors.append(
                f"Cannot include Leader card '{card.card_name}' in deck"
            )
            continue

        # Rule 5-1-2-3: max 4 copies per card number
        if entry.quantity > 4:
            errors.append(
                f"Max 4 copies of '{card.card_name}' (have {entry.quantity})"
            )
        if entry.quantity < 1:
            errors.append(
                f"Invalid quantity for '{card.card_name}'"
            )

        # Rule 5-1-2-2: color must match leader
        card_colors = set(card.card_color) if card.card_color else set()
        if not card_colors.intersection(leader_colors):
            errors.append(
                f"'{card.card_name}' ({', '.join(card_colors)}) doesn't match "
                f"leader's color(s) ({', '.join(leader_colors)})"
            )

        # Leader override: max card cost
        if "max_card_cost" in overrides and card.card_cost is not None:
            if card.card_cost > overrides["max_card_cost"]:
                errors.append(
                    f"'{card.card_name}' has cost {card.card_cost}, but leader "
                    f"restricts to cost {overrides['max_card_cost']} or less"
                )

        # Leader override: max event cost
        if (
            "max_event_cost" in overrides
            and card.card_type == CardType.EVENT
            and card.card_cost is not None
        ):
            if card.card_cost > overrides["max_event_cost"]:
                errors.append(
                    f"Event '{card.card_name}' has cost {card.card_cost}, but leader "
                    f"restricts Events to cost {overrides['max_event_cost']} or less"
                )

    return ValidationResult(
        valid=len(errors) == 0, errors=errors, warnings=warnings
    )
