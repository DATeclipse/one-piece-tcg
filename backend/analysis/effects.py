import re
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class CardKeywords:
    rush: bool = False
    double_attack: bool = False
    blocker: bool = False
    banish: bool = False
    has_trigger: bool = False

    draw_count: int = 0
    ko_effects: int = 0
    power_boost_effects: int = 0
    rest_effects: int = 0
    play_effects: int = 0
    bounce_effects: int = 0
    search_effects: int = 0
    don_accel_effects: int = 0
    counter_event: bool = False

    referenced_types: List[str] = field(default_factory=list)


def parse_card_keywords(card_text: Optional[str]) -> CardKeywords:
    if not card_text:
        return CardKeywords()

    kw = CardKeywords()
    text = card_text

    # Keywords
    kw.rush = "[Rush]" in text or "(Rush)" in text
    kw.double_attack = "[Double Attack]" in text or "(Double Attack)" in text
    kw.blocker = "[Blocker]" in text or "(Blocker)" in text
    kw.banish = "[Banish]" in text or "(Banish)" in text
    kw.has_trigger = "[Trigger]" in text

    # Draw effects
    for m in re.finditer(r"[Dd]raw (\d+) cards?", text):
        kw.draw_count += int(m.group(1))
    if re.search(r"[Dd]raw a card", text):
        kw.draw_count += 1

    # K.O. effects
    kw.ko_effects = len(re.findall(r"K\.O\.", text))

    # Power boost
    kw.power_boost_effects = len(re.findall(r"gains? \+\d+ power", text, re.IGNORECASE))
    kw.power_boost_effects += len(re.findall(r"give .{3,40}\+?\d+ power", text, re.IGNORECASE))

    # Rest opponent
    kw.rest_effects = len(re.findall(r"[Rr]est up to \d+", text))

    # Play from hand/deck
    kw.play_effects = len(re.findall(r"[Pp]lay up to \d+", text))
    kw.play_effects += len(re.findall(r"[Pp]lay .{3,30} card", text))

    # Bounce (return to hand)
    kw.bounce_effects = len(re.findall(r"[Rr]eturn .{3,40} to .{3,20}hand", text))

    # Search/look
    kw.search_effects = len(re.findall(r"[Ll]ook at \d+ cards?", text))

    # DON!! acceleration
    kw.don_accel_effects = len(re.findall(r"[Aa]dd up to \d+ DON", text))
    kw.don_accel_effects += len(re.findall(r"set .{3,30}as active", text, re.IGNORECASE))

    # Counter event
    kw.counter_event = bool(re.search(r"\[Counter\]", text))

    # Referenced types (quoted types in card text)
    for m in re.finditer(r'"([^"]+)" type', text):
        type_name = m.group(1)
        if type_name not in kw.referenced_types:
            kw.referenced_types.append(type_name)

    # Also catch [TypeName] patterns that reference affiliations
    for m in re.finditer(r"\[([A-Z][a-z]+(?:\.[A-Z]\.?[a-z]*)*)\]", text):
        candidate = m.group(1)
        if candidate not in (
            "Rush", "Blocker", "Banish", "Trigger", "Counter", "Main",
            "Once Per Turn", "Double Attack", "On Play", "On Block",
        ):
            if candidate not in kw.referenced_types:
                kw.referenced_types.append(candidate)

    return kw
