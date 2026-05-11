import { useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useDeck, useDeckList } from "../hooks/useDecks";
import type { Card } from "../types";

const TYPE_ORDER = ["Character", "Event", "Stage"];

export default function DeckView() {
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { data: decks = [], isLoading: decksLoading } = useDeckList();
  const { data: deck, isLoading: deckLoading } = useDeck(selectedDeckId);

  const totalCards = deck?.cards.reduce((sum, dc) => sum + dc.quantity, 0) ?? 0;

  const groupedCards = TYPE_ORDER.map((type) => ({
    type,
    entries: (deck?.cards ?? []).filter((dc) => dc.card.card_type === type),
  })).filter((g) => g.entries.length > 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select
          value={selectedDeckId ?? ""}
          onChange={(e) => setSelectedDeckId(e.target.value ? Number(e.target.value) : null)}
          className="p-1.5"
        >
          <option value="">Select a deck...</option>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.leader_name})
            </option>
          ))}
        </select>
        {decksLoading && <span className="text-muted-dim text-sm">Loading...</span>}
      </div>

      {!selectedDeckId && (
        <div className="text-muted-dim text-sm">Select a saved deck to view its cards.</div>
      )}

      {deckLoading && <div className="text-muted-dim">Loading deck...</div>}

      {deck && (
        <>
          <div className="bg-panel rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-4 items-start">
            <div className="w-32 shrink-0">
              {deck.leader.card_image ? (
                <img
                  src={deck.leader.card_image}
                  alt={deck.leader.card_name}
                  className="w-full rounded-lg cursor-pointer hover:scale-[1.03] transition-transform duration-100"
                  onClick={() => setSelectedCard(deck.leader)}
                />
              ) : (
                <div
                  className="w-full aspect-[0.716] bg-card-placeholder rounded-lg flex items-center justify-center text-muted-dim text-xs cursor-pointer"
                  onClick={() => setSelectedCard(deck.leader)}
                >
                  {deck.leader.card_name}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-accent text-2xl font-bold font-serif m-0">
                {deck.name}
              </h2>
              <div className="text-light mt-1">{deck.leader.card_name}</div>
              <div className="text-muted-dim text-sm">
                {deck.leader.card_color.join("/")} | Life: {deck.leader.life}
              </div>
              {deck.leader.types?.length > 0 && (
                <div className="text-muted-dim text-sm">
                  {deck.leader.types.join(", ")}
                </div>
              )}
              <div className={`text-sm mt-2 ${totalCards === 50 ? "text-valid" : "text-warning"}`}>
                {totalCards}/50 cards
              </div>
            </div>
          </div>

          {groupedCards.map(({ type, entries }) => (
            <div key={type} className="mb-6">
              <h3 className="text-accent text-xl font-bold font-serif tracking-wide mb-2">
                {type} ({entries.reduce((sum, e) => sum + e.quantity, 0)})
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 md:gap-3">
                {entries.map((dc) => (
                  <CardItem
                    key={dc.card.card_set_id}
                    card={dc.card}
                    onClick={() => setSelectedCard(dc.card)}
                    deckCount={dc.quantity}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
