import type { Card } from "../types";
import CardItem from "./CardItem";

interface Props {
  cards: Card[];
  onCardClick: (card: Card) => void;
  deckCounts: Map<string, number>;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CardGrid({
  cards,
  onCardClick,
  deckCounts,
  total,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 md:gap-3">
        {cards.map((card) => (
          <CardItem
            key={card.card_set_id}
            card={card}
            onClick={() => onCardClick(card)}
            deckCount={deckCounts.get(card.card_set_id)}
          />
        ))}
      </div>
      {cards.length === 0 && (
        <div className="text-center text-muted-dim py-8">
          No cards found
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Prev
          </button>
          <span className="text-light-muted leading-8">
            Page {page} of {totalPages} ({total} cards)
          </span>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
