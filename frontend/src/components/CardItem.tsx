import { colorGlow, colorHex } from "../constants/colors";
import type { Card } from "../types";

interface Props {
  card: Card;
  onClick?: () => void;
  deckCount?: number;
  collectionCount?: number;
  isAltArt?: boolean;
}

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
  isAltArt,
}: Props) {
  const hex = colorHex(card.card_color[0]);
  const glow = colorGlow(card.card_color[0]);
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

      {isAltArt && <div className="alt-badge">ALT</div>}

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
