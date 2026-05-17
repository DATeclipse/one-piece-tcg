import { useState } from "react";
import { colorHex } from "../constants/colors";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useDeck, useDeckList } from "../hooks/useDecks";
import { useCollectionCountsMap } from "../hooks/useCollection";
import { useMetaDeck, useMetaDeckList } from "../hooks/useMeta";
import type { Card } from "../types";

const TYPE_ORDER = ["Character", "Event", "Stage"];

interface DeckSelection {
  type: "user" | "meta";
  id: number;
}

export default function DeckView() {
  const [selected, setSelected] = useState<DeckSelection | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { data: decks = [], isLoading: decksLoading } = useDeckList();
  const { data: metaDecks = [] } = useMetaDeckList();
  const { data: collectionCounts } = useCollectionCountsMap();

  const allDecks = [
    ...decks.map(d => ({ ...d, selType: "user" as const })),
    ...metaDecks.map(d => ({ ...d, selType: "meta" as const, updated_at: "", tournament_name: (d as any).tournament_name })),
  ];

  return (
    <div>
      {decksLoading && <div style={{ color: "var(--color-muted-dim)" }}>Loading...</div>}

      {!decksLoading && allDecks.length === 0 && (
        <div style={{ color: "var(--color-muted-dim)", fontSize: 14 }}>
          No saved decks yet. Build one in Deck Builder or save from Tournaments.
        </div>
      )}

      {allDecks.length > 0 && (
        <div className="deck-layout">
          {/* Sidebar */}
          <div className="deck-sidebar">
            {decks.length > 0 && (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--color-accent)", letterSpacing: "0.06em", marginBottom: 4 }}>
                  YOUR DECKS
                </div>
                {decks.map(d => (
                  <div
                    key={`user-${d.id}`}
                    className={`deck-row${selected?.type === "user" && selected?.id === d.id ? " selected" : ""}`}
                    onClick={() => setSelected({ type: "user", id: d.id })}
                  >
                    <div className="deck-thumb">
                      {d.leader_image && <img src={d.leader_image} alt={d.leader_name} />}
                    </div>
                    <div className="deck-info">
                      <div className="deck-title">{d.name}</div>
                      <div className="deck-sub">{d.leader_name}</div>
                      <div className="deck-count-sm">{d.card_count}/50 cards</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {metaDecks.length > 0 && (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--color-accent)", letterSpacing: "0.06em", marginTop: 12, marginBottom: 4 }}>
                  META DECKS
                </div>
                {metaDecks.map(d => (
                  <div
                    key={`meta-${d.id}`}
                    className={`deck-row${selected?.type === "meta" && selected?.id === d.id ? " selected" : ""}`}
                    onClick={() => setSelected({ type: "meta", id: d.id })}
                  >
                    <div className="deck-thumb">
                      {d.leader_image && <img src={d.leader_image} alt={d.leader_name} />}
                    </div>
                    <div className="deck-info">
                      <div className="deck-title">{d.name}</div>
                      <div className="deck-sub">{d.leader_name}</div>
                      {d.player_name && <div className="deck-count-sm">{d.player_name} · #{d.placing}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Detail */}
          <div>
            {selected ? (
              <DeckDetail selection={selected} onCardClick={setSelectedCard} collectionCounts={collectionCounts} />
            ) : (
              <div style={{ color: "var(--color-muted-dim)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
                Select a deck to view details
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}

function DeckDetail({
  selection,
  onCardClick,
  collectionCounts,
}: {
  selection: DeckSelection;
  onCardClick: (card: Card) => void;
  collectionCounts: Map<string, number>;
}) {
  const { data: userDeck, isLoading: userLoading } = useDeck(
    selection.type === "user" ? selection.id : null
  );
  const { data: metaDeck, isLoading: metaLoading } = useMetaDeck(
    selection.type === "meta" ? selection.id : null
  );

  const isLoading = userLoading || metaLoading;
  const deck = selection.type === "user" ? userDeck : metaDeck;

  if (isLoading) return <div style={{ color: "var(--color-muted-dim)" }}>Loading deck...</div>;
  if (!deck) return null;

  const leaderColor = colorHex(deck.leader.card_color[0]);

  const groupedCards = TYPE_ORDER.map((type) => ({
    type,
    entries: deck.cards
      .filter((dc) => dc.card.card_type === type)
      .sort((a, b) => (a.card.card_cost ?? 0) - (b.card.card_cost ?? 0)),
  })).filter((g) => g.entries.length > 0);

  return (
    <div>
      {/* Hero */}
      <div
        className="deck-detail-hero"
        style={{ background: `linear-gradient(120deg, var(--color-panel), color-mix(in oklab, ${leaderColor} 25%, var(--color-panel)))` }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 120, flexShrink: 0 }}>
            {deck.leader.card_image ? (
              <img
                src={deck.leader.card_image}
                alt={deck.leader.card_name}
                style={{ width: "100%", borderRadius: 10, cursor: "pointer" }}
                onClick={() => onCardClick(deck.leader)}
              />
            ) : (
              <div
                style={{ width: "100%", aspectRatio: "0.716", background: "var(--color-card-bg)", borderRadius: 10, display: "grid", placeItems: "center", color: "var(--color-muted-dim)", fontSize: 12, cursor: "pointer" }}
                onClick={() => onCardClick(deck.leader)}
              >
                {deck.leader.card_name}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--color-light)", letterSpacing: "0.02em" }}>
              {deck.name}
            </div>
            <div style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 4 }}>
              {deck.leader.card_name} · {deck.leader.card_color.join("/")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: deck.cards.reduce((s, c) => s + c.quantity, 0) === 50 ? "rgba(76,209,133,.15)" : "rgba(255,181,71,.15)",
                color: deck.cards.reduce((s, c) => s + c.quantity, 0) === 50 ? "var(--color-good)" : "var(--color-warn)",
              }}>
                {deck.cards.reduce((s, c) => s + c.quantity, 0)}/50 cards
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Type sections */}
      {groupedCards.map(({ type, entries }) => (
        <div key={type}>
          <div className="band">
            <h2>{type} ({entries.reduce((s, e) => s + e.quantity, 0)})</h2>
            <div className="band-line" />
          </div>
          <div className="cs-grid">
            {entries.map((dc) => (
              <CardItem
                key={dc.card.card_set_id}
                card={dc.card}
                onClick={() => onCardClick(dc.card)}
                deckCount={dc.quantity}
                collectionCount={collectionCounts.get(dc.card.card_set_id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
