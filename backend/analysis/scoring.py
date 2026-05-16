from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from models import Card
from .archetype import Archetype, detect_leader_archetype
from .effects import CardKeywords, parse_card_keywords


ARCHETYPE_WEIGHTS: Dict[Archetype, Dict[str, int]] = {
    Archetype.AGGRO: {
        "rush": 15,
        "double_attack": 10,
        "blocker": 3,
        "removal": 5,
        "counter": 5,
        "curve": 15,
        "draw": 8,
        "tribal": 10,
        "don_accel": 5,
        "bounce": 4,
        "power_boost": 20,
    },
    Archetype.CONTROL: {
        "rush": 3,
        "double_attack": 2,
        "blocker": 18,
        "removal": 20,
        "counter": 15,
        "curve": 10,
        "draw": 10,
        "tribal": 5,
        "don_accel": 3,
        "bounce": 4,
        "power_boost": 10,
    },
    Archetype.MIDRANGE: {
        "rush": 8,
        "double_attack": 5,
        "blocker": 10,
        "removal": 10,
        "counter": 10,
        "curve": 10,
        "draw": 10,
        "tribal": 17,
        "don_accel": 8,
        "bounce": 4,
        "power_boost": 8,
    },
    Archetype.TEMPO: {
        "rush": 10,
        "double_attack": 5,
        "blocker": 5,
        "removal": 10,
        "counter": 8,
        "curve": 10,
        "draw": 15,
        "tribal": 7,
        "don_accel": 12,
        "bounce": 13,
        "power_boost": 5,
    },
}

AXIS_IDEALS: Dict[Archetype, Dict[str, float]] = {
    Archetype.AGGRO: {
        "rush": 8,
        "double_attack": 3,
        "blocker": 4,
        "removal": 4,
        "counter": 40000,
        "curve": 2.8,
        "draw": 6,
        "tribal": 0.7,
        "don_accel": 4,
        "bounce": 2,
        "power_boost": 10,
    },
    Archetype.CONTROL: {
        "rush": 2,
        "double_attack": 1,
        "blocker": 8,
        "removal": 8,
        "counter": 60000,
        "curve": 4.0,
        "draw": 8,
        "tribal": 0.5,
        "don_accel": 3,
        "bounce": 3,
        "power_boost": 6,
    },
    Archetype.MIDRANGE: {
        "rush": 5,
        "double_attack": 2,
        "blocker": 6,
        "removal": 6,
        "counter": 50000,
        "curve": 3.5,
        "draw": 7,
        "tribal": 0.8,
        "don_accel": 5,
        "bounce": 3,
        "power_boost": 8,
    },
    Archetype.TEMPO: {
        "rush": 6,
        "double_attack": 2,
        "blocker": 4,
        "removal": 5,
        "counter": 45000,
        "curve": 3.0,
        "draw": 10,
        "tribal": 0.6,
        "don_accel": 6,
        "bounce": 6,
        "power_boost": 5,
    },
}


@dataclass
class AxisScore:
    name: str
    have: float
    ideal: float
    score: float


@dataclass
class DeckScore:
    grade: str
    value: int
    archetype: str
    axes: List[AxisScore]


def _grade_from_value(value: int) -> str:
    if value >= 90:
        return "S"
    if value >= 75:
        return "A"
    if value >= 60:
        return "B"
    if value >= 45:
        return "C"
    return "D"


def _compute_axis_score(have: float, ideal: float, is_curve: bool = False) -> float:
    if ideal == 0:
        return 1.0
    if is_curve:
        # Curve: closer to ideal = better. Penalize deviation in either direction.
        deviation = abs(have - ideal) / ideal
        return max(0.0, 1.0 - deviation)
    return min(1.0, have / ideal)


def _get_leader_referenced_types(leader: Card) -> List[str]:
    kw = parse_card_keywords(leader.card_text)
    return kw.referenced_types


def score_deck(leader: Card, cards: List[Tuple[Card, int]]) -> DeckScore:
    primary, secondary = detect_leader_archetype(leader)

    # Aggregate deck stats
    total_cards = sum(qty for _, qty in cards)
    total_rush = 0
    total_double_attack = 0
    total_blocker = 0
    total_ko = 0
    total_counter = 0
    total_cost = 0
    total_draw = 0
    total_don_accel = 0
    total_bounce = 0
    total_power_boost = 0
    total_tribal = 0

    leader_types = _get_leader_referenced_types(leader)

    for card, qty in cards:
        kw = parse_card_keywords(card.card_text)

        total_rush += qty if kw.rush else 0
        total_double_attack += qty if kw.double_attack else 0
        total_blocker += qty if kw.blocker else 0
        total_ko += kw.ko_effects * qty
        total_counter += (card.counter_amount or 0) * qty
        total_cost += (card.card_cost or 0) * qty
        total_draw += kw.draw_count * qty
        total_don_accel += kw.don_accel_effects * qty
        total_bounce += kw.bounce_effects * qty
        total_power_boost += kw.power_boost_effects * qty

        # Tribal: card's types overlap with leader's referenced types
        if leader_types and card.types:
            if any(lt in card.types for lt in leader_types):
                total_tribal += qty

    avg_cost = total_cost / total_cards if total_cards > 0 else 0
    tribal_pct = total_tribal / total_cards if total_cards > 0 and leader_types else 0.7

    # Build axis values
    have_values = {
        "rush": total_rush,
        "double_attack": total_double_attack,
        "blocker": total_blocker,
        "removal": total_ko,
        "counter": total_counter,
        "curve": avg_cost,
        "draw": total_draw,
        "tribal": tribal_pct,
        "don_accel": total_don_accel,
        "bounce": total_bounce,
        "power_boost": total_power_boost,
    }

    # Blend primary (70%) and secondary (30%) weights
    blended_weights: Dict[str, float] = {}
    primary_weights = ARCHETYPE_WEIGHTS[primary]
    secondary_weights = ARCHETYPE_WEIGHTS[secondary] if secondary else primary_weights

    for axis in primary_weights:
        blended_weights[axis] = primary_weights[axis] * 0.7 + secondary_weights[axis] * 0.3

    # Blend ideals similarly
    primary_ideals = AXIS_IDEALS[primary]
    secondary_ideals = AXIS_IDEALS[secondary] if secondary else primary_ideals

    blended_ideals: Dict[str, float] = {}
    for axis in primary_ideals:
        blended_ideals[axis] = primary_ideals[axis] * 0.7 + secondary_ideals[axis] * 0.3

    # No tribal axis weight if leader references no types
    if not leader_types:
        blended_weights["tribal"] = 0

    # Score each axis
    axes: List[AxisScore] = []
    total_weighted_score = 0.0
    total_weight = sum(blended_weights.values())

    for axis, weight in blended_weights.items():
        if weight == 0:
            continue
        have = have_values[axis]
        ideal = blended_ideals[axis]
        is_curve = axis == "curve"
        raw_score = _compute_axis_score(have, ideal, is_curve)
        total_weighted_score += raw_score * weight

        axes.append(AxisScore(
            name=axis,
            have=round(have, 2),
            ideal=round(ideal, 2),
            score=round(raw_score, 2),
        ))

    value = int(round((total_weighted_score / total_weight) * 100)) if total_weight > 0 else 0
    grade = _grade_from_value(value)

    archetype_str = primary.value
    if secondary:
        archetype_str += f"/{secondary.value}"

    return DeckScore(
        grade=grade,
        value=value,
        archetype=archetype_str,
        axes=sorted(axes, key=lambda a: -a.score),
    )
