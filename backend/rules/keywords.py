"""
Keyword effects and keywords extracted from ONE PIECE CARD GAME Comprehensive Rules v1.2.0
Section 10: Keyword Effects and Keywords

These are read-only reference data. Do not modify.
"""

KEYWORD_EFFECTS = {
    "source": "ONE PIECE CARD GAME Comprehensive Rules v1.2.0, Section 10-1",
    "items": {
        "Rush": {
            "rule": "10-1-1",
            "text": "[Rush] is a keyword effect that allows a Character card to attack during the same turn in which it is played.",
        },
        "Double Attack": {
            "rule": "10-1-2",
            "text": "[Double Attack] is a keyword effect that, when damage is dealt to the opponent Leader's Life by an attack from a card that has this effect, causes 2 damage to be dealt to the Leader's Life instead of 1.",
        },
        "Banish": {
            "rule": "10-1-3",
            "text": "[Banish] is a keyword effect that, when damage is dealt to the opponent Leader's Life by an attack from a card that has this effect, causes a card in the opponent's Life area to be trashed instead of being added to their hand. At this time, the [Trigger] is not activated.",
        },
        "Blocker": {
            "rule": "10-1-4",
            "text": "[Blocker] is a keyword effect with an activation timing that is fulfilled when one of your other cards is being attacked, allowing you to activate it by resting this card during the Block Step. The [Blocker] card takes the place of the card being attacked.",
        },
        "Trigger": {
            "rule": "10-1-5",
            "subrules": {
                "10-1-5-1": "[Trigger] is a keyword effect that, on taking damage when there is a card in your Life area with [Trigger], allows you to reveal that card and activate its [Trigger], instead of adding the card to your hand.",
                "10-1-5-2": "You can also choose not to activate the [Trigger]. In such a case, add the card to your hand without revealing it.",
                "10-1-5-3": "If you take damage and activate a [Trigger], the card whose [Trigger] is being activated itself does not belong in any area while that [Trigger] is being activated. After finishing processing that activated [Trigger] effect, trash that card unless otherwise specified.",
            },
        },
        "Rush: Character": {
            "rule": "10-1-6",
            "text": "[Rush: Character] is a keyword effect that allows a Character card to attack the opponent's Character cards on the turn the [Rush: Character] card was played.",
        },
        "Unblockable": {
            "rule": "10-1-7",
            "text": "[Unblockable] is a keyword effect that prevents the opponent from activating [Blocker] when attacked by a card with this effect. In other words, this card cannot be blocked by the opponent.",
        },
    },
}

KEYWORDS = {
    "source": "ONE PIECE CARD GAME Comprehensive Rules v1.2.0, Section 10-2",
    "items": {
        "K.O.": {
            "rule": "10-2-1",
            "subrules": {
                "10-2-1-1": '"K.O." is a keyword that refers to a Character card being trashed on losing a battle, or a Character card being trashed due to a card\'s effect.',
                "10-2-1-2": 'As an instruction, "K.O." means to place a Character card from the Character area into the owner of that card\'s trash.',
                "10-2-1-3": "[On K.O.] and effects that read \"cannot be K.O.'d\" or similar are only valid when the card is K.O.'d by an effect or due to the result of a battle. If a Character card is trashed due to some other method, it is not treated as \"K.O.'d\".",
            },
        },
        "Activate: Main": {
            "rule": "10-2-2",
            "text": "[Activate: Main] is a keyword indicating an effect can be activated during the Main Phase, except when in battle.",
        },
        "Main": {
            "rule": "10-2-3",
            "subrules": {
                "10-2-3-1": "[Main] is a keyword exclusively found on Event cards that can only be used during the Main Phase, except in battle. It indicates that an effect can be activated by using an Event card during the Main Phase, except in battle.",
                "10-2-3-1-1": "As an exception, [Trigger] and other effects may also allow [Main] to be activated in certain situations.",
            },
        },
        "Counter": {
            "rule": "10-2-4",
            "subrules": {
                "10-2-4-1": "[Counter] is a keyword exclusively found on Event cards that can only be used during your opponent's Counter Step. It indicates that an effect can be activated by using an Event card during the Counter Step.",
                "10-2-4-1-1": "As an exception, [Trigger] and other effects may also allow [Counter] to be activated in certain situations.",
                "10-2-4-1-2": '[Counter] cannot be activated by effects unless the effect indicates "activate [Counter]".',
            },
        },
        "When Attacking": {
            "rule": "10-2-5",
            "text": "[When Attacking] is a keyword indicating that the activation timing is fulfilled and an effect activates when you declare an attack during your Attack Step (see 7-1-1.).",
        },
        "On Play": {
            "rule": "10-2-6",
            "text": "[On Play] is a keyword indicating that the activation timing is fulfilled and an effect activates when the card is played.",
        },
        "End of Your Turn": {
            "rule": "10-2-7",
            "text": "[End of Your Turn] is a keyword indicating that the activation timing is fulfilled and an effect activates at the End Phase of your turn (see 6-6-1-1.).",
        },
        "End of Your Opponent's Turn": {
            "rule": "10-2-8",
            "text": "[End of Your Opponent's Turn] is a keyword indicating that the activation timing is fulfilled and an effect activates at the End Phase of your opponent's turn.",
        },
        "DON!! xX": {
            "rule": "10-2-9",
            "text": "[DON!! xX] is a keyword indicating a condition that is satisfied when this card originally has no or less than X number of DON!! cards and is given DON!! cards such that the number of DON!! cards given to it is X or higher.",
        },
        "DON!! −X": {
            "rule": "10-2-10",
            "text": '"DON!! −X" is a keyword indicating a condition requiring you to select a total number of DON!! cards equal to the value of X from your Leader area, Character area, and cost area, and return them to your DON!! deck.',
        },
        "Your Turn": {
            "rule": "10-2-11",
            "text": "[Your Turn] is a keyword indicating a condition that is satisfied during your turn.",
        },
        "Opponent's Turn": {
            "rule": "10-2-12",
            "text": "[Opponent's Turn] is a keyword indicating a condition that is satisfied during your opponent's turn.",
        },
        "Once Per Turn": {
            "rule": "10-2-13",
            "subrules": {
                "10-2-13-1": "[Once Per Turn] is a keyword indicating an effect can only be activated and resolved once during that turn.",
                "10-2-13-2": "Where there are multiple cards with the same effect, [Once Per Turn] effects can be activated and resolved once for each card.",
                "10-2-13-3": "After a [Once Per Turn] effect has been resolved once, it cannot be activated again, even if the conditions can be met during that turn. In addition, that card's activation cost cannot be paid again during that turn.",
                "10-2-13-4": "If a card is moved to another area after its [Once Per Turn] effect has been resolved once, if the card once again appears on the field, the [Once Per Turn] effect can be activated again because it is treated as a different card. (See 3-1-6.)",
                "10-2-13-5": "If a [Once Per Turn] effect is activated and you become unable to pay the activation cost while in the process of paying that activation cost, you may not activate the [Once Per Turn] effect again even if the effect following that activation cost did not resolve as result (see 8-3-1-3.).",
            },
        },
        "Trash": {
            "rule": "10-2-14",
            "text": '"Trash" is a keyword indicating that a card is to be selected from the hand and placed in the trash.',
        },
        "On Block": {
            "rule": "10-2-15",
            "text": "[On Block] is a keyword indicating that the activation timing is fulfilled and an effect activates during the Block Step when you have activated your [Blocker] (see 7-1-2-2.).",
        },
        "On Your Opponent's Attack": {
            "rule": "10-2-16",
            "text": "[On Your Opponent's Attack] is a keyword indicating that the activation timing is fulfilled when your opponent has declared an attack during their Attack Step (see 7-1-1.), and an effect activates after your opponent's [When Attacking] and other Attack Step effects, if any, have been activated (see 7-1-1-3.).",
        },
        "On K.O.": {
            "rule": "10-2-17",
            "subrules": {
                "10-2-17-1": "[On K.O.] is a keyword indicating that when the card is K.O.'d on the field, the activation timing is fulfilled and you should check whether the activation conditions have been met. If all the conditions have been met, the effect is activated on the field. After that, the Character card with the activated [On K.O.] effect is trashed, and the [On K.O.] effect is resolved while the card is in the trash.",
                "10-2-17-2": "[On K.O.] is different from other auto effects because the Character card moves areas between the effect is activated and resolved.",
            },
        },
    },
}
