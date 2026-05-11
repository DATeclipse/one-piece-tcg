import { useState } from "react";

interface Term {
  name: string;
  definition: string;
}

interface Category {
  title: string;
  terms: Term[];
}

const GLOSSARY: Category[] = [
  {
    title: "Card Types",
    terms: [
      { name: "Leader", definition: "The centerpiece card of your deck. Determines which colors you can play, your starting Life total, and provides a unique ability." },
      { name: "Character", definition: "Combat units played from your hand by paying DON!! cost. Can attack, be attacked, and have abilities." },
      { name: "Event", definition: "One-time-use cards played for a DON!! cost. Resolve their effect and go to Trash. Some have [Counter] and can be played during the opponent's turn." },
      { name: "Stage", definition: "Permanent field cards providing ongoing passive effects. Maximum 1 Stage card on the field at a time." },
      { name: "DON!!", definition: "Resource cards in a separate 10-card deck. Automatically drawn each turn. Used to pay costs and can be attached to characters for +1000 Power each." },
    ],
  },
  {
    title: "Card Attributes",
    terms: [
      { name: "Power", definition: "A card's attack and defense value. Compared during the Damage Step to determine battle outcomes." },
      { name: "Cost", definition: "The number of DON!! cards that must be rested to play a card from your hand." },
      { name: "Counter", definition: "A defensive value (+1000 or +2000) on some Character cards. Discard from hand during the Counter Step to boost your defending card's Power." },
      { name: "Life", definition: "Cards placed face-down at the start of the game (determined by Leader). When you take damage, you lose one Life card to your hand." },
      { name: "Color", definition: "The color identity of a card (Red, Green, Blue, Purple, Black, Yellow). Deck cards must share at least one color with your Leader." },
      { name: "Attribute", definition: "A card's character type (Slash, Strike, Ranged, Wisdom, Special). Some effects reference these." },
      { name: "Type / Subtype", definition: "Character affiliations like \"Straw Hat Crew\" or \"Navy.\" Used for synergy and searching effects." },
    ],
  },
  {
    title: "Game Zones",
    terms: [
      { name: "Leader Zone", definition: "Where your Leader card is placed face-up at the start of the game." },
      { name: "Character Zone", definition: "The area in front of your Leader where Character cards are placed. Maximum of 5 Characters." },
      { name: "Stage Zone", definition: "The area beside your Leader for your Stage card. Maximum of 1 Stage." },
      { name: "Cost Area", definition: "Where your active (unattached) DON!! cards sit, available to be spent or attached." },
      { name: "DON!! Deck", definition: "The separate 10-card deck of DON!! cards you draw from each turn." },
      { name: "Life Area", definition: "Face-down cards representing your remaining life. When all are gone, the next successful attack ends the game." },
      { name: "Trash", definition: "The discard pile. Defeated Characters, used Events, and discarded cards go here." },
      { name: "Hand", definition: "Cards you hold privately. Drawn from your deck and from Life damage." },
      { name: "Deck", definition: "Your 50-card main deck you draw from each turn." },
      { name: "Field", definition: "All cards currently in play on your side (Leader, Characters, Stage, Cost Area, attached DON!!)." },
    ],
  },
  {
    title: "Keyword Effects",
    terms: [
      { name: "Rush", definition: "Allows a Character to attack the same turn it is played. Normally Characters cannot attack the turn they enter play." },
      { name: "Blocker", definition: "When one of your other cards is attacked, you may rest a card with Blocker to redirect the attack to it instead." },
      { name: "Double Attack", definition: "When this card's attack deals damage to the opponent's Leader, it deals 2 Life damage instead of 1." },
      { name: "Banish", definition: "When this card's attack deals damage to the opponent's Leader, the Life card goes to Trash instead of their hand, and its Trigger does not activate." },
      { name: "Trigger", definition: "An effect on a card that activates for free when that card is removed from your Life area as damage." },
      { name: "Unblockable", definition: "Prevents the opponent from activating Blocker when this card attacks." },
    ],
  },
  {
    title: "Timing Keywords",
    terms: [
      { name: "[On Play]", definition: "Effect activates when the card is played from hand to the field." },
      { name: "[When Attacking]", definition: "Effect activates when you declare an attack with this card." },
      { name: "[On K.O.]", definition: "Effect activates when this Character is K.O.'d (defeated in battle or by an effect)." },
      { name: "[On Block]", definition: "Effect activates when this card's Blocker ability is used to intercept an attack." },
      { name: "[Counter]", definition: "Found on Event cards; indicates the Event can be played during the opponent's Counter Step as a defensive response." },
      { name: "[Activate: Main]", definition: "An ability you can choose to activate during your Main Phase. Often has a cost." },
      { name: "[Once Per Turn]", definition: "The effect can only be activated once per turn per card. Resets at the start of the next turn." },
      { name: "[DON!! x1] / [DON!! x2]", definition: "Continuous effect only active when the specified number of DON!! cards (or more) are attached to this card." },
      { name: "[DON!! -1] / [DON!! -2]", definition: "A cost requiring you to return DON!! cards from your field back to your DON!! Deck." },
      { name: "[Your Turn] / [Opponent's Turn]", definition: "Condition indicating the effect is only active during the specified player's turn." },
      { name: "[End of Your Turn]", definition: "Effect activates during your End Phase." },
    ],
  },
  {
    title: "Card States & Actions",
    terms: [
      { name: "Active", definition: "A card in its upright position, ready to be used. Characters must be Active to attack." },
      { name: "Rested", definition: "A card turned sideways. Indicates it has been used this turn (attacked, blocked, or paid a cost)." },
      { name: "Attach", definition: "Moving a DON!! card from your Cost Area onto a Character or Leader, granting +1000 Power per attached DON!!." },
      { name: "Rest", definition: "The act of turning a card sideways. Used to pay costs, declare attacks, or activate Blocker." },
      { name: "Refresh", definition: "The first phase of each turn. All your rested cards return to Active, and attached DON!! return to the Cost Area." },
      { name: "K.O.", definition: "When a Character is defeated in battle or removed by a card effect, it is K.O.'d and sent to Trash." },
      { name: "Play", definition: "Placing a card from your hand onto the field by paying its DON!! cost." },
      { name: "Mulligan", definition: "At the start of the game, you may shuffle your opening 5-card hand back into the deck and draw 5 new cards. One-time only." },
    ],
  },
  {
    title: "Turn Phases",
    terms: [
      { name: "Refresh Phase", definition: "All rested cards become Active; attached DON!! return to Cost Area." },
      { name: "Draw Phase", definition: "Draw 1 card from your deck. Skipped by Player 1 on their first turn." },
      { name: "DON!! Phase", definition: "Draw 2 DON!! cards from your DON!! Deck to your Cost Area. Only 1 on Player 1's first turn. Capped at 10 total." },
      { name: "Main Phase", definition: "Play Characters, Events, and Stages; attach DON!!; activate abilities; declare attacks." },
      { name: "End Phase", definition: "\"During this turn\" effects expire. Turn passes to your opponent." },
    ],
  },
  {
    title: "Battle Steps",
    terms: [
      { name: "Attack Step", definition: "Declare an attack by resting your Active Character/Leader. You may target the opponent's Leader or any Rested Character." },
      { name: "Block Step", definition: "The defender may rest a Blocker to redirect the attack to that Blocker instead." },
      { name: "Counter Step", definition: "The defender may discard Character cards with Counter values and/or play Counter Events to boost the defending card's Power." },
      { name: "Damage Step", definition: "Compare attacker's Power to defender's Power. If attacker's Power is equal or greater, the attack succeeds. Ties favor the attacker." },
    ],
  },
  {
    title: "Deck Building",
    terms: [
      { name: "Main Deck", definition: "Your 50-card deck of Characters, Events, and Stages. Must be exactly 50 cards." },
      { name: "DON!! Deck", definition: "A separate deck of exactly 10 identical DON!! cards. Some Leaders modify this count." },
      { name: "4-Copy Limit", definition: "Maximum of 4 copies of any card with the same card number in your main deck." },
      { name: "Color Restriction", definition: "All cards in your main deck must share at least one color with your Leader card." },
      { name: "Card Set ID", definition: "The unique identifier for each card (e.g., \"OP01-077\"). Used across all systems to identify specific cards." },
    ],
  },
  {
    title: "Set Abbreviations",
    terms: [
      { name: "OP", definition: "Booster Pack sets (e.g., OP01, OP02). The main expansion releases." },
      { name: "ST", definition: "Starter Deck sets (e.g., ST-01, ST-10). Pre-built beginner-friendly decks." },
      { name: "EB", definition: "Extra Booster sets (e.g., EB-01). Smaller supplemental booster releases." },
      { name: "PRB", definition: "Premium Booster sets. Special reprint and new card releases." },
      { name: "P", definition: "Promotional cards (e.g., P-001). Given out at events, tournaments, or as special inclusions." },
    ],
  },
  {
    title: "Community Slang",
    terms: [
      { name: "Swing", definition: "Slang for attack. \"Swing 7k at Leader\" means attacking the Leader with 7000 Power." },
      { name: "Pop", definition: "Removing/K.O.'ing a Character using a card effect (not battle). \"Pop their 5-cost\" means using an effect to K.O. a 5-cost Character." },
      { name: "Bounce", definition: "Returning a card from the field to its owner's hand. Does not trigger [On K.O.] effects." },
      { name: "Bottom-deck", definition: "Placing a card on the bottom of a player's deck. Effectively removes it without triggering K.O. effects." },
      { name: "Brick", definition: "A hand full of unplayable or unhelpful cards (e.g., too expensive, no Counter value)." },
      { name: "Go Wide", definition: "A strategy that floods the board with many smaller Characters to overwhelm with multiple attacks per turn." },
      { name: "Go Tall", definition: "A strategy that stacks DON!! and buffs onto one or two large Characters for massive single attacks." },
      { name: "Ramp", definition: "Playing cards or using effects that accelerate your resource development, letting you deploy expensive cards earlier." },
      { name: "Tempo", definition: "The pace and momentum of your plays. Good tempo means efficiently using your DON!! each turn to maintain pressure." },
      { name: "Curve", definition: "The distribution of card costs in your deck. \"Playing on curve\" means spending all DON!! efficiently each turn." },
      { name: "Searcher", definition: "A low-cost card whose effect lets you find a specific card from your deck." },
      { name: "2k Counter", definition: "A Character card held in hand specifically for its +2000 Counter value, used for defense." },
      { name: "Restand", definition: "Setting a Rested card back to Active during the Main Phase, allowing it to attack again. Rare and powerful." },
      { name: "Lethal", definition: "A game state where you have enough attacks to deplete your opponent's remaining Life and deliver the finishing blow." },
      { name: "Board State", definition: "The current layout of Characters and resources on both sides of the field." },
      { name: "Aggro", definition: "A deck archetype focused on fast, aggressive play to end the game quickly." },
      { name: "Control", definition: "A deck archetype focused on slowing the game down, removing threats, and winning through long-term value." },
      { name: "Midrange", definition: "A deck archetype balancing early aggression with late-game power, adapting based on the matchup." },
      { name: "Combo", definition: "A combination of cards that produce a synergistic effect much stronger than the sum of their parts." },
      { name: "Meta", definition: "The current competitive landscape — which decks and strategies are most popular and successful." },
      { name: "Tier List", definition: "A ranking of deck archetypes by competitive viability (Tier 0, Tier 1, Tier 2, etc.)." },
      { name: "Mirror Match", definition: "A game where both players are using the same Leader or deck archetype." },
      { name: "Matchup", definition: "How a specific deck performs against another specific deck. \"Good matchup\" means favorable odds." },
      { name: "Tech Card", definition: "A card included specifically to counter popular strategies in the current meta." },
      { name: "Staple", definition: "A card so strong or versatile that it appears in almost every deck of its color." },
      { name: "Vanilla", definition: "A card with no effect text — just stats. Sometimes has good Counter values." },
    ],
  },
  {
    title: "Victory Conditions",
    terms: [
      { name: "Knockout Win", definition: "The standard win condition: reduce your opponent's Life to 0, then land a successful attack on their Leader." },
      { name: "Deck Out", definition: "Win by forcing your opponent to draw when they have no cards left in their deck." },
      { name: "Sudden Death", definition: "Taking damage when you have 0 Life cards remaining. This ends the game — you lose." },
    ],
  },
];

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const query = search.toLowerCase();

  const filtered = GLOSSARY.map((cat) => ({
    ...cat,
    terms: cat.terms.filter(
      (t) =>
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query)
    ),
  })).filter((cat) => cat.terms.length > 0);

  const toggle = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <input
        type="text"
        placeholder="Search terms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 w-full mb-4"
      />

      {filtered.length === 0 && (
        <div className="text-muted-dim text-sm">No terms match your search.</div>
      )}

      {filtered.map((cat) => {
        const isCollapsed = collapsed.has(cat.title);
        return (
          <div key={cat.title} className="mb-4">
            <button
              onClick={() => toggle(cat.title)}
              className="w-full bg-transparent! text-left flex justify-between items-center px-3 py-2 bg-panel rounded-lg"
            >
              <h3 className="text-accent text-lg font-bold font-serif tracking-wide m-0">
                {cat.title}
                <span className="text-muted-dim text-xs font-normal ml-2">({cat.terms.length})</span>
              </h3>
              <span className="text-muted">{isCollapsed ? "▼" : "▲"}</span>
            </button>
            {!isCollapsed && (
              <div className="mt-1 flex flex-col gap-1 px-1">
                {cat.terms.map((t) => (
                  <div key={t.name} className="py-1.5 border-b border-border-subtle last:border-0">
                    <span className="text-light font-bold text-sm">{t.name}</span>
                    <span className="text-muted-dim text-sm"> — {t.definition}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
