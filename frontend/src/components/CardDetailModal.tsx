import { useEffect } from "react";
import { useCollectionCounts, useUpdateCollection } from "../hooks/useCollection";
import type { Card } from "../types";

interface Props {
  card: Card;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function CardDetailModal({ card, onClose, onPrev, onNext }: Props) {
  const { data: counts = {} } = useCollectionCounts();
  const updateMutation = useUpdateCollection();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); onPrev?.(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onNext?.(); }
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, onClose]);

  const owned = counts[card.card_set_id] ?? 0;

  const handleUpdate = (delta: number) => {
    const newQty = Math.max(0, owned + delta);
    updateMutation.mutate({ card_set_id: card.card_set_id, quantity: newQty });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 bg-panel/80 text-light text-2xl rounded-full w-10 h-10 flex items-center justify-center border border-border hover:bg-card-bg"
        >
          &#8249;
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 bg-panel/80 text-light text-2xl rounded-full w-10 h-10 flex items-center justify-center border border-border hover:bg-card-bg"
        >
          &#8250;
        </button>
      )}
      <div
        className="bg-panel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto flex flex-col md:flex-row gap-4 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-transparent! text-light text-xl px-2 py-0 z-10"
        >
          &times;
        </button>

        <div className="md:w-1/2 shrink-0">
          {card.card_image ? (
            <img
              src={card.card_image}
              alt={card.card_name}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="w-full aspect-[0.716] bg-card-placeholder rounded-lg flex items-center justify-center text-muted-dim text-lg">
              {card.card_name}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-accent text-xl font-bold font-serif m-0">
            {card.card_name}
          </h2>

          <div className="text-muted-dim text-xs">
            {card.card_set_id} | {card.rarity}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-light">
            <span>{card.card_type}</span>
            <span>{card.card_color.join("/")}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-light-dim">
            {card.card_cost !== null && <span>Cost: {card.card_cost}</span>}
            {card.card_power !== null && <span>Power: {card.card_power}</span>}
            {card.counter_amount !== null && <span>Counter: +{card.counter_amount}</span>}
            {card.life !== null && <span>Life: {card.life}</span>}
          </div>

          {card.types?.length > 0 && (
            <div className="text-muted">
              {card.types.join(", ")}
            </div>
          )}

          {card.attribute && (
            <div className="text-muted-dim text-xs">
              Attribute: {card.attribute}
            </div>
          )}

          {card.card_text && (
            <div className="bg-card-bg rounded p-3 text-light-muted text-[0.8rem] leading-relaxed whitespace-pre-line mt-1">
              {card.card_text}
            </div>
          )}

          <div className="bg-card-bg rounded p-3 mt-2">
            <div className="text-muted-dim text-xs mb-1">Collection</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUpdate(-1)}
                disabled={owned === 0 || updateMutation.isPending}
                className="px-2 py-0.5 text-sm"
              >
                -
              </button>
              <span className={`text-sm font-bold ${owned > 0 ? "text-valid" : "text-muted-dim"}`}>
                {owned} owned
              </span>
              <button
                onClick={() => handleUpdate(1)}
                disabled={updateMutation.isPending}
                className="px-2 py-0.5 text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
