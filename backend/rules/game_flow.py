"""
Game flow rules extracted from ONE PIECE CARD GAME Comprehensive Rules v1.2.0
Section 1: Game Overview
Section 3: Game Areas
Section 5-2: Pre-Game Preparations
Section 6: Game Progression
Section 7: Card Attacks and Battles
Section 8: Activating and Resolving Effects
Section 9: Rule Processing
Section 11: Other

These are read-only reference data. Do not modify.
"""

GAME_FLOW = {
    "source": "ONE PIECE CARD GAME Comprehensive Rules v1.2.0 (2026-01-16)",
    "game_overview": {
        "source": "Section 1",
        "rules": {
            "1-1-1": "Fundamentally, this game is intended to be played by two players, head-to-head. These rules do not currently support play by three or more players.",
            "1-2-1": "The game ends when either player loses the game. When a player's opponent loses the game, the player who has not lost wins the game.",
        },
        "defeat_conditions": {
            "source": "Section 1-2-1-1",
            "conditions": [
                {
                    "rule": "1-2-1-1-1",
                    "text": "When you have 0 Life cards and your Leader takes damage.",
                },
                {
                    "rule": "1-2-1-1-2",
                    "text": "When you have 0 cards in your deck.",
                },
            ],
        },
        "fundamental_principles": {
            "source": "Section 1-3",
            "rules": {
                "1-3-1": "When card text contradicts the Comprehensive Rules, the card text takes precedence over the Comprehensive Rules.",
                "1-3-2": "If a player is required to perform an impossible action for any reason, that action is not carried out. Likewise, if an effect requires the player to carry out multiple actions, some of which are impossible, the player performs as many of the actions as possible.",
                "1-3-3": "If a card's effect requires a player to carry out an action while a currently active effect prohibits that action, the prohibiting effect always takes precedence.",
                "1-3-4": "If both players are required to make choices simultaneously for any reason, the player whose turn it is makes the choices first. After that player has made their choices, the other player makes their choices.",
                "1-3-7": "Unless otherwise specified, card effects are carried out in the order described on the card.",
                "1-3-8": "If card effects require a player to rest a card and set it as active simultaneously, the effect requiring the player to rest the card always takes precedence.",
            },
        },
    },
    "game_areas": {
        "source": "Section 3",
        "areas": {
            "deck": {
                "rule": "3-2",
                "visibility": "secret",
                "description": "Each player places their deck here at the start of the game. Cards are placed face-down in a stack.",
            },
            "don_deck": {
                "rule": "3-3",
                "visibility": "open",
                "description": "Each player places their DON!! deck here at the start of the game. Cards are placed face-down in a stack, but both players can freely view contents.",
            },
            "hand": {
                "rule": "3-4",
                "visibility": "secret",
                "description": "Where each player places the cards they draw from their deck. A player can freely view their own hand.",
            },
            "trash": {
                "rule": "3-5",
                "visibility": "open",
                "description": "K.O.'d Characters and activated Events are placed here. Cards are placed face-up.",
            },
            "leader_area": {
                "rule": "3-6",
                "visibility": "open",
                "description": "Each player places their Leader card face-up here at the start of the game.",
                "notes": {
                    "3-6-3": "A card placed in the Leader area which is treated as a Leader card cannot be moved from the Leader area by card effects or rules.",
                },
            },
            "character_area": {
                "rule": "3-7",
                "visibility": "open",
                "max_cards": 5,
                "description": "Where each player places their Character cards. Cards are placed face-up.",
                "notes": {
                    "3-7-4": "Played cards cannot attack on the turn in which they are played unless otherwise specified.",
                    "3-7-6": "Up to 5 Character cards can be placed in the Character area.",
                    "3-7-6-1": "If there are 5 Character cards and a player wants to play a new one, they must trash 1 existing Character first.",
                },
            },
            "stage_area": {
                "rule": "3-8",
                "visibility": "open",
                "max_cards": 1,
                "description": "Where each player places their Stage cards. Cards are placed face-up.",
                "notes": {
                    "3-8-5": "Up to 1 Stage card can be placed in the Stage area.",
                    "3-8-5-1": "If there is 1 Stage card and a player wants to play a new one, they must trash the existing Stage first.",
                },
            },
            "cost_area": {
                "rule": "3-9",
                "visibility": "open",
                "description": "DON!! cards are placed in this area.",
            },
            "life_area": {
                "rule": "3-10",
                "visibility": "secret",
                "description": "Life cards for a player's Leader are placed here. Cards are placed face-down in a stack.",
            },
        },
        "field_areas": {
            "rule": "3-1-2",
            "text": "The Leader area, Character area, Stage area, and cost area are sometimes collectively referred to as 'the field'.",
        },
    },
    "pre_game": {
        "source": "Section 5-2",
        "steps": [
            {"rule": "5-2-1-1", "text": "Each player presents the deck they're going to use. This deck must meet the deck construction rules specified in 5-1-2."},
            {"rule": "5-2-1-2", "text": "Each player thoroughly shuffles their deck. Then, each player places their deck face-down in their deck area."},
            {"rule": "5-2-1-3", "text": "Each player places their Leader card face-up in their Leader area."},
            {"rule": "5-2-1-4", "text": "The players decide, by Rock-Paper-Scissors or some other means, which player will decide whether they want to go first or second."},
            {"rule": "5-2-1-5", "text": "Once determined, that player declares whether they will go first or second."},
            {"rule": "5-2-1-6", "text": "Each player draws 5 cards from their deck as their opening hand. Then, beginning with the player going first, each player may redraw their hand once."},
            {"rule": "5-2-1-6-1", "text": "The player returns all of the cards in their hand to their deck, reshuffles, and then redraws 5 cards."},
            {"rule": "5-2-1-7", "text": "Each player places a number of cards from the top of their deck equal to the Life value of their Leader face-down in their Life area such that the card at the top of their deck is at the bottom in their Life area."},
            {"rule": "5-2-1-8", "text": "The first player begins the game and starts their turn."},
        ],
    },
    "turn_flow": {
        "source": "Section 6",
        "phases": [
            {
                "name": "Refresh Phase",
                "rule": "6-2",
                "steps": [
                    {"rule": "6-2-1", "text": 'Currently applied effects that last "until the start of your next turn" end.'},
                    {"rule": "6-2-2", "text": "Your own and your opponent's effects that read \"at the start of your/your opponent's turn\" activate."},
                    {"rule": "6-2-3", "text": "Return all DON!! cards given to cards in your Leader area and Character area to your cost area and rest them."},
                    {"rule": "6-2-4", "text": "Set all rested cards placed in your Leader area, Character area, Stage area, and cost area as active."},
                ],
            },
            {
                "name": "Draw Phase",
                "rule": "6-3",
                "steps": [
                    {"rule": "6-3-1", "text": "The turn player draws 1 card from their deck. Note that the player going first does not draw a card on their first turn."},
                ],
            },
            {
                "name": "DON!! Phase",
                "rule": "6-4",
                "steps": [
                    {"rule": "6-4-1", "text": "Place 2 DON!! cards from the DON!! deck face-up in the cost area. Note that the player going first places only 1 DON!! card face-up in their cost area on their first turn."},
                    {"rule": "6-4-2", "text": "If there is only 1 card in the DON!! deck, place 1 DON!! card face-up in the cost area."},
                    {"rule": "6-4-3", "text": "If there are 0 cards in the DON!! deck, do not place a DON!! card in the cost area."},
                ],
            },
            {
                "name": "Main Phase",
                "rule": "6-5",
                "steps": [
                    {"rule": "6-5-1", "text": "Your own and your opponent's effects that read \"at the start of the Main Phase\" activate."},
                    {"rule": "6-5-2", "text": "You may perform the following Main Phase actions: Play a Card (6-5-3), Activate a Card's Effect (6-5-4), Give DON!! Cards (6-5-5), and Battle (6-5-6). You can perform these actions in any order and as many times as you wish."},
                ],
                "actions": {
                    "play_a_card": {
                        "rule": "6-5-3",
                        "text": "You can pay the cost and play a Character card or Stage card, or activate an Event card marked with [Main] from your hand.",
                    },
                    "activate_effect": {
                        "rule": "6-5-4",
                        "text": "The turn player can activate effects marked with [Main] or [Activate: Main].",
                    },
                    "give_don": {
                        "rule": "6-5-5",
                        "subrules": {
                            "6-5-5-1": 'Place 1 active DON!! card from your cost area underneath your Leader or a Character card. This is called "giving".',
                            "6-5-5-2": "Leader cards and Character cards gain 1000 power during your turn for each DON!! card given to them.",
                            "6-5-5-3": "Giving can be performed as many times as you wish to the extent possible.",
                        },
                    },
                    "battle": {
                        "rule": "6-5-6",
                        "subrules": {
                            "6-5-6-1": "Neither player can battle on their first turn.",
                            "6-5-6-2": 'For more information on battles, see "7. Card Attacks and Battles".',
                        },
                    },
                },
            },
            {
                "name": "End Phase",
                "rule": "6-6",
                "steps": [
                    {"rule": "6-6-1-1", "text": 'Auto effects that read "[End of Your Turn]" and "[End of Your Opponent\'s Turn]" are activated.'},
                    {"rule": "6-6-1-2", "text": "After all processing, remaining effects are processed: (1) turn player's continuous effects due at end of turn, (2) non-turn player's continuous effects due at end of turn."},
                    {"rule": "6-6-1-3", "text": "Turn player's effects that last \"during this turn\" become invalid, then non-turn player's."},
                    {"rule": "6-6-1-4", "text": "The turn ends, the non-turn player becomes the new turn player, and the game proceeds to the Refresh Phase of the next turn."},
                ],
            },
        ],
    },
    "battle": {
        "source": "Section 7",
        "description": "During the Main Phase, the turn player can rest an active Leader or Character to attack an opponent's Leader or rested Character.",
        "steps": [
            {
                "name": "Attack Step",
                "rule": "7-1-1",
                "subrules": {
                    "7-1-1-1": "The turn player declares their attack by resting their active Leader card or 1 active Character card.",
                    "7-1-1-2": "The turn player selects the target: the opponent's Leader card or 1 of their rested Character cards.",
                    "7-1-1-3": "Effects that read [When Attacking], \"when you attack\", [On Your Opponent's Attack] or \"When Attacked\" activate.",
                },
            },
            {
                "name": "Block Step",
                "rule": "7-1-2",
                "subrules": {
                    "7-1-2-1": "The player being attacked can activate the [Blocker] effect of their card only once during that battle.",
                    "7-1-2-2": "When a [Blocker] is activated, effects that read [On Block] or \"when you block\" activate.",
                },
            },
            {
                "name": "Counter Step",
                "rule": "7-1-3",
                "subrules": {
                    "7-1-3-1": 'Effects of the player being attacked that read "when attacked" activate.',
                    "7-1-3-2-1": "Activate [(Symbol) Counter]: Trash a Character card with [(Symbol) Counter] from hand to increase power of Leader or 1 Character by the counter value during that battle.",
                    "7-1-3-2-2": "Activate an Event card: Pay the cost of an Event card with [Counter] in hand, then trash it to activate the [Counter] effect.",
                },
            },
            {
                "name": "Damage Step",
                "rule": "7-1-4",
                "subrules": {
                    "7-1-4-1": "Compare power of attacking and attacked card. If attacking power >= attacked power, the battle is won.",
                    "7-1-4-1-1": "If attacked card is a Leader: 1 damage is dealt to that Leader.",
                    "7-1-4-1-2": "If attacked card is a Character: That Character card is K.O.'d.",
                    "7-1-4-2": "If attacking power < attacked power, the attacking card loses the battle and nothing happens.",
                },
            },
            {
                "name": "End of Battle",
                "rule": "7-1-5",
                "subrules": {
                    "7-1-5-1": "The battle ends.",
                    "7-1-5-2": "Effects that read \"at the end of the/this battle\" or \"if this ... battles\" activate.",
                    "7-1-5-5": "The battle ends and the game returns to 6-5-2.",
                },
            },
        ],
    },
    "effects": {
        "source": "Section 8",
        "categories": {
            "auto": {
                "rule": "8-1-3-1",
                "text": "Auto effects always activate once automatically when the activation event described in the text occurs during the game.",
                "examples": "[On Play], [When Attacking], [On Block], [On K.O.], [End of Your Turn], [End of Your Opponent's Turn]",
            },
            "activate": {
                "rule": "8-1-3-2",
                "text": "Activate effects can be declared and activated by the turn player during their Main Phase.",
                "examples": "[Activate: Main], [Main]",
            },
            "permanent": {
                "rule": "8-1-3-3",
                "text": "Permanent effects constantly affect gameplay in some way while they are valid.",
                "notes": {
                    "8-1-3-3-3": 'Some permanent effects read "according to/under the rules". In this case, the effect is valid and continues to affect gameplay even when the card is in a secret area.',
                },
            },
            "replacement": {
                "rule": "8-1-3-4",
                "text": 'Replacement effects are those effects that are denoted by the word "instead".',
            },
        },
        "duration": {
            "one_shot": {
                "rule": "8-1-4-1",
                "text": "One-shot effects refer to effects that affect the game at the moment they are resolved and complete their processing immediately.",
            },
            "continuous": {
                "rule": "8-1-4-2",
                "text": "Continuous effects refer to effects that continue to affect the game for a specified duration.",
            },
        },
    },
    "rule_processing": {
        "source": "Section 9",
        "rules": {
            "9-1-1": "Rule processing refers to processing that is automatically carried out according to the rules when specific events have occurred or are occurring during the game.",
            "9-1-2": "Rule processing is immediately resolved when the corresponding event occurs, even if other actions are in the process of being carried out.",
            "9-2-1": "At the point when rule processing begins, if any player fulfills any of the defeat conditions, all of those players lose the game.",
        },
    },
    "infinite_loops": {
        "source": "Section 11-1",
        "rules": {
            "11-1-1-1": "If neither player can stop an infinite loop, the game ends in a draw.",
            "11-1-1-2": "If only one player can stop the infinite loop, that player declares how many times they wish to carry out the loop action.",
            "11-1-1-3": "If both players can stop the infinite loop, the turn player first decides how many times, then the non-turn player. Carry out the loop the fewer of these two times.",
        },
    },
}
