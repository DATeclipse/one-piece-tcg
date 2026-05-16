import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getCard, updateCard } from "../api/client";
import type { Card } from "../types";

const ART_STYLES = ["standard", "manga", "full_art", "alt_art"] as const;
const RARITIES = ["C", "UC", "R", "SR", "SEC", "L", "SP", "TR", "P", "PR"] as const;

function TagButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? color : "var(--color-card-bg)",
        border: `1px solid ${active ? color : "var(--color-border)"}`,
        color: active ? "#fff" : "var(--color-muted)",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  const onError = useCallback(() => setBroken(true), []);

  if (broken) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-muted)",
          background: "var(--color-card-bg)",
          fontSize: "11px",
        }}
      >
        Image failed
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", display: "block" }}
      loading="lazy"
      onError={onError}
    />
  );
}

function parseVariantId(id: string): { baseId: string; altIndex: number } | null {
  const match = id.match(/^(.+)_r(\d+)$/);
  if (!match) return null;
  return { baseId: match[1], altIndex: parseInt(match[2], 10) - 1 };
}

function CardTagger({
  card: initialCard,
  displayId,
  imageOverride,
}: {
  card: Card;
  displayId?: string;
  imageOverride?: string;
}) {
  const [card, setCard] = useState(initialCard);
  const displayImage = imageOverride ?? card.card_image;

  const mutation = useMutation({
    mutationFn: (updates: { rarity?: string; art_style?: string }) =>
      updateCard(card.card_set_id, updates),
    onSuccess: (updated) => setCard(updated),
  });

  const handleRarity = (r: string) => {
    mutation.mutate({ rarity: r });
  };

  const handleArtStyle = (style: string) => {
    mutation.mutate({ art_style: style });
  };

  return (
    <div
      style={{
        background: "var(--color-panel)",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        opacity: mutation.isPending ? 0.7 : 1,
      }}
    >
      {displayImage ? (
        <CardImage src={displayImage} alt={card.card_name} />
      ) : (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-muted)",
            background: "var(--color-card-bg)",
          }}
        >
          No image
        </div>
      )}
      <div style={{ padding: "8px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "var(--color-light)",
            fontWeight: 600,
            marginBottom: "2px",
          }}
        >
          {displayId ?? card.card_set_id}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "var(--color-muted)",
            marginBottom: "6px",
          }}
        >
          {card.card_name} · {card.rarity} · {card.art_style}
        </div>
        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginBottom: "4px" }}>
          {RARITIES.map((r) => (
            <TagButton
              key={r}
              label={r}
              active={card.rarity === r}
              color={r === "SP" ? "#e040fb" : r === "TR" ? "#00bcd4" : "#555"}
              onClick={() => handleRarity(r)}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
          {ART_STYLES.map((s) => (
            <TagButton
              key={s}
              label={s.replace("_", " ")}
              active={card.art_style === s}
              color={
                s === "manga"
                  ? "#ff9800"
                  : s === "full_art"
                    ? "#4caf50"
                    : s === "alt_art"
                      ? "#7c4dff"
                      : "#666"
              }
              onClick={() => handleArtStyle(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DevTagger() {
  const [input, setInput] = useState("");
  const [cardIds, setCardIds] = useState<string[]>([]);

  const handleLoad = () => {
    const ids = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setCardIds(ids);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--color-light)",
          marginBottom: "16px",
        }}
      >
        Dev Card Tagger
      </h1>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste card_set_ids (one per line or comma-separated)"
          rows={5}
          style={{
            flex: 1,
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            color: "var(--color-light)",
            padding: "10px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            resize: "vertical",
          }}
        />
        <button
          onClick={handleLoad}
          style={{
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0 24px",
            fontWeight: 700,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Load
        </button>
      </div>

      {cardIds.length > 0 && (
        <div style={{ marginBottom: "12px", color: "var(--color-muted)", fontSize: "13px" }}>
          {cardIds.length} cards loaded
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {cardIds.map((id) => (
          <CardLoader key={id} cardSetId={id} />
        ))}
      </div>
    </div>
  );
}

function CardLoader({ cardSetId }: { cardSetId: string }) {
  const variant = parseVariantId(cardSetId);
  const fetchId = variant ? variant.baseId : cardSetId;

  const { data: card, isLoading, error } = useQuery({
    queryKey: ["card", fetchId],
    queryFn: () => getCard(fetchId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div
        style={{
          background: "var(--color-panel)",
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
          color: "var(--color-muted)",
          fontSize: "12px",
          border: "1px solid var(--color-border)",
        }}
      >
        Loading {cardSetId}...
      </div>
    );
  }

  if (error || !card) {
    return (
      <div
        style={{
          background: "var(--color-error-bg)",
          borderRadius: "8px",
          padding: "12px",
          color: "var(--color-error-text)",
          fontSize: "11px",
          border: "1px solid var(--color-bad)",
        }}
      >
        {cardSetId}: not found
      </div>
    );
  }

  const imageOverride = variant ? card.alt_images[variant.altIndex] : undefined;

  return (
    <CardTagger
      card={card}
      displayId={variant ? cardSetId : undefined}
      imageOverride={imageOverride}
    />
  );
}
