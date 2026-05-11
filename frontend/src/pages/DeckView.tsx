import { useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useDeck, useDeckList } from "../hooks/useDecks";
import { useCollectionCounts } from "../hooks/useCollection";
import { useMetaDeck, useMetaDeckList } from "../hooks/useMeta";
import type { Card, DeckCard as DeckCardType, DeckSummary, MetaDeckSummary } from "../types";

const TYPE_ORDER = ["Character", "Event", "Stage"];

interface DeckSelection {
  type: "user" | "meta";
  id: number;
}

export default function DeckView() {
  const [expanded, setExpanded] = useState<DeckSelection | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { data: decks = [], isLoading: decksLoading } = useDeckList();
  const { data: metaDecks = [] } = useMetaDeckList();
  const { data: collectionData = {} } = useCollectionCounts();
  const collectionCounts = new Map<string, number>(Object.entries(collectionData));

  const toggle = (sel: DeckSelection) => {
    if (expanded?.type === sel.type && expanded?.id === sel.id) {
      setExpanded(null);
    } else {
      setExpanded(sel);
    }
  };

  return (
    <div>
      {decksLoading && <div className="text-muted-dim">Loading...</div>}

      {!decksLoading && decks.length === 0 && metaDecks.length === 0 && (
        <div className="text-muted-dim text-sm">No saved decks yet. Build one in Deck Builder or save from Tournaments.</div>
      )}

      {decks.length > 0 && (
        <>
          <h3 className="text-accent text-xl font-bold font-serif tracking-wide mb-3">Your Decks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {decks.map((d) => (
              <DeckPreviewCard
                key={`user-${d.id}`}
                name={d.name}
                leaderName={d.leader_name}
                leaderImage={d.leader_image}
                cardCount={d.card_count}
                subtitle={`Updated ${new Date(d.updated_at).toLocaleDateString()}`}
                isExpanded={expanded?.type === "user" && expanded?.id === d.id}
                onClick={() => toggle({ type: "user", id: d.id })}
              />
            ))}
          </div>
          {expanded?.type === "user" && (
            <ExpandedDeck selection={expanded} selectedCard={selectedCard} onCardClick={setSelectedCard} collectionCounts={collectionCounts} />
          )}
        </>
      )}

      {metaDecks.length > 0 && (
        <>
          <h3 className="text-accent text-xl font-bold font-serif tracking-wide mb-3">Meta Decks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metaDecks.map((d) => (
              <DeckPreviewCard
                key={`meta-${d.id}`}
                name={d.name}
                leaderName={d.leader_name}
                leaderImage={d.leader_image}
                cardCount={d.card_count}
                subtitle={d.tournament_name ? `${d.tournament_name} · #${d.placing}` : undefined}
                isExpanded={expanded?.type === "meta" && expanded?.id === d.id}
                onClick={() => toggle({ type: "meta", id: d.id })}
              />
            ))}
          </div>
          {expanded?.type === "meta" && (
            <ExpandedDeck selection={expanded} selectedCard={selectedCard} onCardClick={setSelectedCard} collectionCounts={collectionCounts} />
          )}
        </>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}

function DeckPreviewCard({
  name,
  leaderName,
  leaderImage,
  cardCount,
  subtitle,
  isExpanded,
  onClick,
}: {
  name: string;
  leaderName: string;
  leaderImage: string | null;
  cardCount: number;
  subtitle?: string;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-panel rounded-lg p-3 flex gap-3 items-start text-left w-full bg-transparent! cursor-pointer transition-all duration-100 ${isExpanded ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-accent/50"}`}
    >
      <div className="w-20 shrink-0">
        {leaderImage ? (
          <img src={leaderImage} alt={leaderName} className="w-full rounded-lg" loading="lazy" />
        ) : (
          <div className="w-full aspect-[0.716] bg-card-placeholder rounded-lg flex items-center justify-center text-muted-dim text-[0.6rem]">
            {leaderName}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-accent font-bold font-serif text-sm truncate">{name}</div>
        <div className="text-light text-xs mt-0.5">{leaderName}</div>
        <div className={`text-xs mt-1 ${cardCount === 50 ? "text-valid" : "text-warning"}`}>
          {cardCount}/50 cards
        </div>
        {subtitle && <div className="text-muted-dim text-[0.65rem] mt-1 truncate">{subtitle}</div>}
      </div>
      <span className="text-muted text-xs shrink-0">{isExpanded ? "▲" : "▼"}</span>
    </button>
  );
}

function ExpandedDeck({
  selection,
  selectedCard,
  onCardClick,
  collectionCounts,
}: {
  selection: DeckSelection;
  selectedCard: Card | null;
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
  const activeDeck = selection.type === "user" ? userDeck : metaDeck;

  if (isLoading) return <div className="text-muted-dim mb-6">Loading deck...</div>;
  if (!activeDeck) return null;

  const groupedCards = TYPE_ORDER.map((type) => ({
    type,
    entries: activeDeck.cards.filter((dc) => dc.card.card_type === type),
  })).filter((g) => g.entries.length > 0);

  return (
    <div className="bg-panel rounded-lg p-4 mb-6 -mt-2">
      <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
        <div className="w-28 shrink-0">
          {activeDeck.leader.card_image ? (
            <img
              src={activeDeck.leader.card_image}
              alt={activeDeck.leader.card_name}
              className="w-full rounded-lg cursor-pointer hover:scale-[1.03] transition-transform duration-100"
              onClick={() => onCardClick(activeDeck.leader)}
            />
          ) : (
            <div
              className="w-full aspect-[0.716] bg-card-placeholder rounded-lg flex items-center justify-center text-muted-dim text-xs cursor-pointer"
              onClick={() => onCardClick(activeDeck.leader)}
            >
              {activeDeck.leader.card_name}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-accent text-xl font-bold font-serif m-0">{activeDeck.name}</h2>
          <div className="text-light text-sm mt-1">{activeDeck.leader.card_name}</div>
          <div className="text-muted-dim text-xs">
            {activeDeck.leader.card_color.join("/")} | Life: {activeDeck.leader.life}
          </div>
          {activeDeck.leader.types?.length > 0 && (
            <div className="text-muted-dim text-xs">{activeDeck.leader.types.join(", ")}</div>
          )}
        </div>
      </div>

      {groupedCards.map(({ type, entries }) => (
        <div key={type} className="mb-4">
          <h4 className="text-accent text-lg font-bold font-serif tracking-wide mb-2">
            {type} ({entries.reduce((sum, e) => sum + e.quantity, 0)})
          </h4>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
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
