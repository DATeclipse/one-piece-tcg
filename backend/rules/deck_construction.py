"""
Deck construction rules extracted from ONE PIECE CARD GAME Comprehensive Rules v1.2.0
Section 5-1: Preparing Leader Cards, Decks, and DON!! Decks
Section 2: Card Information (referenced fields)

These are read-only reference data. Do not modify to match app behavior —
the app's validation.py should conform to these rules, not the other way around.
"""

DECK_CONSTRUCTION_RULES = {
    "source": "ONE PIECE CARD GAME Comprehensive Rules v1.2.0 (2026-01-16)",
    "sections": {
        "5-1-1": {
            "text": "Each player prepares a Leader card, deck, and DON!! deck from their cards before the game begins.",
        },
        "5-1-2": {
            "text": "Each player needs exactly 1 Leader card, a 50-card deck, and a 10-card DON!! deck to play.",
            "components": {
                "leader": {
                    "count": 1,
                    "card_category": "Leader",
                    "rule": "5-1-2",
                },
                "deck": {
                    "count": 50,
                    "card_categories": ["Character", "Event", "Stage"],
                    "rule": "5-1-2-1",
                },
                "don_deck": {
                    "count": 10,
                    "card_category": "DON!!",
                    "rule": "5-1-2",
                },
            },
        },
        "5-1-2-1": {
            "text": "A deck is a bundle of cards made up of Character cards, Event cards, and Stage cards.",
        },
        "5-1-2-2": {
            "text": "Only cards of a color included on the Leader card can be included in a deck. Cards of a color not included on the Leader card cannot be added to the deck.",
            "enforcement": "color_match",
            "logic": "any_overlap",
            "note": "A card is legal if any of its colors matches any of the Leader's colors (rule 2-3-5: multi-color cards are treated as a card of every color they possess).",
        },
        "5-1-2-3": {
            "text": "A deck can contain no more than 4 cards with the same card number.",
            "max_copies_per_card_number": 4,
        },
        "5-1-2-4": {
            "text": "Effects related to deck construction rules are treated as permanent effects (see 8-1-3-4-3.) which replace the deck construction rules above.",
            "note": "Some Leader cards have 'Under the rules of this game' text that modifies deck construction constraints.",
        },
        "5-1-2-4-1": {
            "text": "Effects related to deck construction are those specifying that the deck can contain a specified number of cards of a certain category, or that the deck cannot contain a specified number of cards of a certain category.",
        },
        "5-1-2-4-2": {
            "text": "Effects related to deck construction are valid during deck construction.",
        },
    },
    "card_categories": {
        "source": "Section 2-2",
        "categories": ["Leader", "Character", "Event", "Stage", "DON!!"],
        "rules": {
            "2-2-1": "This specifies the card's category.",
            "2-2-2": "There are five card categories: Leader card, Character card, Event card, Stage card, and DON!! card.",
        },
    },
    "colors": {
        "source": "Section 2-3",
        "values": ["Red", "Green", "Blue", "Purple", "Black", "Yellow"],
        "rules": {
            "2-3-1": "This specifies the card's colors. It may be referenced in card text.",
            "2-3-3": "There are six colors: red, green, blue, purple, black, and yellow.",
            "2-3-4": "Some cards have multiple colors, such as red and blue, or green and purple.",
            "2-3-5": "Cards with multiple colors, such as red and green, are treated as a card of every color they possess.",
            "2-3-6": 'Cards with multiple colors are sometimes referred to as "multicolor" in card text.',
        },
    },
    "card_fields": {
        "cost": {
            "source": "Section 2-7",
            "rules": {
                "2-7-1": "This specifies the cost needed to play the card from your hand.",
                "2-7-5": "Only Character cards, Event cards and Stage cards have costs.",
            },
        },
        "power": {
            "source": "Section 2-6",
            "rules": {
                "2-6-1": "This specifies the card's strength in battles.",
                "2-6-2": "Only Leader cards and Character cards have power.",
            },
        },
        "life": {
            "source": "Section 2-9",
            "rules": {
                "2-9-1": "This specifies the Life value of a Leader card.",
                "2-9-3": "Only Leader cards have Life.",
            },
        },
        "counter": {
            "source": "Section 2-10",
            "rules": {
                "2-10-1": "This specifies the power increase to a Character card's power that can be activated during the Counter Step.",
                "2-10-2": "Only Character cards have (Symbol) Counter.",
            },
        },
        "attribute": {
            "source": "Section 2-5",
            "values": ["Slash", "Strike", "Ranged", "Special", "Wisdom", "?"],
            "rules": {
                "2-5-1": "This specifies the card's attribute. It may be referenced in card text.",
                "2-5-5": "Only Leader cards and Character cards have attributes.",
            },
        },
        "type": {
            "source": "Section 2-4",
            "rules": {
                "2-4-1": "This specifies the card's types. It may be referenced in card text.",
                "2-4-2": "Some cards may have multiple types. Where a card has multiple types, each type will be separated by a slash (/).",
            },
        },
        "card_number": {
            "source": "Section 2-14",
            "rules": {
                "2-14-1": "This is referenced during game preparation.",
                "2-14-2": "When preparing for a game, there should be no more than 4 cards with the same card number in your deck.",
            },
        },
        "rarity": {
            "source": "Section 2-13",
            "rules": {
                "2-13-1": "This specifies the card's rarity. It does not affect gameplay.",
            },
        },
    },
    "tournament_supplement": {
        "source": "Tournament Rules Manual",
        "rules": {
            "legal_deck": "Players must bring a tournament legal deck, sleeved in opaque sleeves, to constructed events.",
            "no_side_deck": "No side decks are permitted.",
            "no_more_than_four": "No more than four copies of the same card can be included in a deck.",
        },
    },
}
