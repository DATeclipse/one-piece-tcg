import type { Card } from "../types";

interface Props {
  card: Card;
  onClick?: () => void;
  deckCount?: number;
  collectionCount?: number;
}

const COLOR_HEX: Record<string, [string, string]> = {
  Red: ["#e63946", "rgba(230,57,70,.55)"],
  Blue: ["#3a7ad9", "rgba(58,122,217,.55)"],
  Green: ["#3aaa64", "rgba(58,170,100,.55)"],
  Purple: ["#8b5cf6", "rgba(139,92,246,.55)"],
  Black: ["#5b6470", "rgba(91,100,112,.55)"],
  Yellow: ["#e6b53a", "rgba(230,181,58,.55)"],
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CardItem({
  card,
  onClick,
  deckCount,
  collectionCount,
}: Props) {
  const [hex, glow] = COLOR_HEX[card.card_color[0]] ?? ["#444", "transparent"];
  const collectionBg =
    deckCount && collectionCount !== undefined && collectionCount < deckCount
      ? "var(--color-warn)"
      : "var(--color-good)";

  return (
    <div
      className="tcg"
      style={
        { "--card-color": hex, "--card-glow": glow } as React.CSSProperties
      }
      onClick={onClick}
    >
      {card.card_image ? (
        <img
          className="art-img"
          src={card.card_image}
          alt={card.card_name}
          loading="lazy"
        />
      ) : (
        <div className="art">
          <span className="silhouette">{initials(card.card_name)}</span>
        </div>
      )}

      <div className="rarity-badge">{card.rarity}</div>

      {collectionCount !== undefined && collectionCount > 0 && (
        <div className="collection-badge" style={{ background: collectionBg }}>
          {collectionCount}
        </div>
      )}

      {deckCount !== undefined && deckCount > 0 && (
        <div className="deck-badge">{deckCount}</div>
      )}

      <div className="card-footer">
        <div className="card-name">{card.card_name}</div>
        <div className="card-meta">
          {card.card_type}
          {card.card_cost !== null &&
            card.card_cost !== undefined &&
            ` · ${card.card_cost}`}
          {card.card_power !== null &&
            card.card_power !== undefined &&
            ` · ${card.card_power}`}
        </div>
      </div>
    </div>
  );
}
