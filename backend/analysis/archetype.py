import enum
import re
from typing import Optional, Tuple

from models import Card


class Archetype(str, enum.Enum):
    AGGRO = "aggro"
    CONTROL = "control"
    MIDRANGE = "midrange"
    TEMPO = "tempo"


def detect_leader_archetype(leader: Card) -> Tuple[Archetype, Optional[Archetype]]:
    if leader.archetype:
        primary = Archetype(leader.archetype)
        secondary = Archetype(leader.archetype_secondary) if leader.archetype_secondary else None
        return primary, secondary

    text = leader.card_text or ""
    life = leader.life or 4

    scores = {
        Archetype.AGGRO: 0.0,
        Archetype.CONTROL: 0.0,
        Archetype.MIDRANGE: 0.0,
        Archetype.TEMPO: 0.0,
    }

    # Aggro signals
    if "[When Attacking]" in text:
        scores[Archetype.AGGRO] += 3
    if re.search(r"gains? \+\d+ power", text, re.IGNORECASE):
        scores[Archetype.AGGRO] += 2
    if "Double Attack" in text:
        scores[Archetype.AGGRO] += 3
    if "Rush" in text:
        scores[Archetype.AGGRO] += 2
    if re.search(r"\[DON!! x[12]\].*power", text):
        scores[Archetype.AGGRO] += 2

    # Control signals
    if "K.O." in text:
        scores[Archetype.CONTROL] += 3
    if re.search(r"would be K\.O", text):
        scores[Archetype.CONTROL] += 2
    if "Blocker" in text:
        scores[Archetype.CONTROL] += 2
    if life >= 5:
        scores[Archetype.CONTROL] += 2
    if life >= 6:
        scores[Archetype.CONTROL] += 2
    if re.search(r"trash \d+ card.{0,20}instead", text, re.IGNORECASE):
        scores[Archetype.CONTROL] += 2

    # Midrange signals
    if re.search(r'"[^"]+" type', text):
        scores[Archetype.MIDRANGE] += 3
    if "[On Play]" in text:
        scores[Archetype.MIDRANGE] += 1
    if re.search(r"give .{3,30}DON!!", text, re.IGNORECASE):
        scores[Archetype.MIDRANGE] += 2
    if re.search(r"all of your .{3,40}gain", text, re.IGNORECASE):
        scores[Archetype.MIDRANGE] += 2

    # Tempo signals
    if re.search(r"return .{3,40}to .{3,20}hand", text, re.IGNORECASE):
        scores[Archetype.TEMPO] += 3
    if re.search(r"[Aa]dd up to \d+ DON", text):
        scores[Archetype.TEMPO] += 2
    if re.search(r"set .{3,30}as active", text, re.IGNORECASE):
        scores[Archetype.TEMPO] += 2
    if re.search(r"[Pp]lay .{3,40}from .{3,20}hand", text):
        scores[Archetype.TEMPO] += 2
    if "[End of Your Turn]" in text:
        scores[Archetype.TEMPO] += 1

    sorted_archetypes = sorted(scores.items(), key=lambda x: -x[1])
    primary = sorted_archetypes[0][0]
    secondary_score = sorted_archetypes[1][1]

    secondary = sorted_archetypes[1][0] if secondary_score >= 2 else None

    return primary, secondary
