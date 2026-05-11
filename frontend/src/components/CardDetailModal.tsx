import type { Card } from "../types";

interface Props {
  card: Card;
  onClose: () => void;
}

export default function CardDetailModal({ card, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
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
        </div>
      </div>
    </div>
  );
}
