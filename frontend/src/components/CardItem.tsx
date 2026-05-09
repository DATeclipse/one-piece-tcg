import type { Card } from "../types";

interface Props {
  card: Card;
  onClick?: () => void;
  deckCount?: number;
}

const COLOR_CLASS_MAP: Record<string, string> = {
  Red: "border-card-red",
  Blue: "border-card-blue",
  Green: "border-card-green",
  Purple: "border-card-purple",
  Black: "border-card-black",
  Yellow: "border-card-yellow",
};

export default function CardItem({ card, onClick, deckCount }: Props) {
  const borderClass = COLOR_CLASS_MAP[card.card_color[0]] || "border-muted-darker";

  return (
    <div
      onClick={onClick}
      className={`border-2 ${borderClass} rounded-lg overflow-hidden ${onClick ? "cursor-pointer" : "cursor-default"} relative bg-card-bg hover:scale-[1.03] transition-transform duration-100`}
    >
      {card.card_image ? (
        <img
          src={card.card_image}
          alt={card.card_name}
          className="w-full block"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[0.716] bg-card-placeholder flex items-center justify-center text-muted-dim text-[0.7rem] p-2 text-center">
          {card.card_name}
        </div>
      )}
      {deckCount !== undefined && deckCount > 0 && (
        <div className="absolute top-1 right-1 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
          {deckCount}
        </div>
      )}
      <div className="px-2 py-1 text-[0.7rem] text-light-muted">
        <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
          {card.card_name}
        </div>
        <div className="text-muted">
          {card.card_type}
          {card.card_cost !== null && ` | Cost: ${card.card_cost}`}
          {card.card_power !== null && ` | ${card.card_power}`}
        </div>
      </div>
    </div>
  );
}
