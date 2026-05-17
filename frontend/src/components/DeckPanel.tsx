import { useState } from "react";
import ManaCurve from "./ManaCurve";
import { useCollectionCounts } from "../hooks/useCollection";
import type { Card, DeckScore } from "../types";

const COLOR_HEX: Record<string, string> = {
  Red: "#e63946",
  Blue: "#3a7ad9",
  Green: "#3aaa64",
  Purple: "#8b5cf6",
  Black: "#5b6470",
  Yellow: "#e6b53a",
};

interface DeckEntry {
  card: Card;
  quantity: number;
}

interface Props {
  leader: Card | null;
  entries: DeckEntry[];
  onRemoveLeader: () => void;
  onChangeQuantity: (cardSetId: string, delta: number) => void;
  onSave: () => void;
  onValidate: () => void;
  deckName: string;
  onDeckNameChange: (name: string) => void;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score?: DeckScore | null;
  } | null;
  saving: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  S: "#ffd700",
  A: "#4cd185",
  B: "#3a7ad9",
  C: "#8b8b8b",
  D: "#e63946",
};

function DeckScorePanel({ score }: { score: DeckScore }) {
  const [expanded, setExpanded] = useState(false);
  const color = GRADE_COLORS[score.grade] ?? "#888";

  return (
    <div
      style={{
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        marginTop: 8,
        background: "var(--color-bg-2)",
        border: `1px solid ${color}33`,
        cursor: "pointer",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            background: color,
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            width: 28,
            height: 28,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {score.grade}
        </span>
        <div>
          <div style={{ color: "var(--color-light)", fontWeight: 700 }}>
            {score.value}/100
          </div>
          <div style={{ color: "var(--color-muted)", fontSize: 10 }}>
            {score.archetype}
          </div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            color: "var(--color-muted)",
            fontSize: 10,
          }}
        >
          {expanded ? "▲" : "▼"}
        </span>
      </div>
      {expanded && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {score.axes.map((axis) => (
            <div
              key={axis.name}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{ width: 80, color: "var(--color-muted)", fontSize: 10 }}
              >
                {axis.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "var(--color-card-bg)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${axis.score * 100}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--color-light)",
                  width: 70,
                  textAlign: "right",
                }}
              >
                {axis.name === "counter"
                  ? `${(axis.have / 1000).toFixed(0)}k/${(axis.ideal / 1000).toFixed(0)}k`
                  : axis.name === "tribal"
                    ? `${(axis.have * 100).toFixed(0)}%/${(axis.ideal * 100).toFixed(0)}%`
                    : `${axis.have}/${axis.ideal}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeckPanel({
  leader,
  entries,
  onRemoveLeader,
  onChangeQuantity,
  onSave,
  onValidate,
  deckName,
  onDeckNameChange,
  validation,
  saving,
}: Props) {
  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  const { data: counts = {} } = useCollectionCounts();

  const costCurve: Record<number, number> = {};
  for (const e of entries) {
    const c = e.card.card_cost ?? 0;
    costCurve[c] = (costCurve[c] ?? 0) + e.quantity;
  }

  const leaderColor = leader
    ? (COLOR_HEX[leader.card_color[0]] ?? "#444")
    : "#444";
  const countClass =
    totalCards === 50 ? "good" : totalCards >= 40 ? "warn" : "bad";

  return (
    <div className="builder-side">
      <input
        type="text"
        placeholder="Deck name..."
        value={deckName}
        onChange={(e) => onDeckNameChange(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      {/* Leader */}
      <div
        style={{
          background: "var(--color-bg-2)",
          borderRadius: 10,
          padding: 10,
          borderLeft: `4px solid ${leaderColor}`,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--color-muted-dim)",
            fontFamily: "var(--font-mono)",
            marginBottom: 4,
          }}
        >
          LEADER
        </div>
        {leader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--color-light)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {leader.card_name}
              </div>
              <div style={{ color: "var(--color-muted)", fontSize: 12 }}>
                {leader.card_color.join("/")} · Life: {leader.life}
              </div>
            </div>
            <button onClick={onRemoveLeader} style={{ fontSize: 12 }}>
              Remove
            </button>
          </div>
        ) : (
          <div style={{ color: "var(--color-muted-dim)", fontSize: 13 }}>
            Select a Leader card
          </div>
        )}
      </div>

      {/* Count */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span className={`deck-count ${countClass}`}>{totalCards}</span>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
          / 50 cards
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          marginBottom: 8,
          color: totalCards === 50 ? "var(--color-good)" : "var(--color-muted)",
        }}
      >
        {totalCards === 50 ? "Complete ✓" : `${50 - totalCards} remaining`}
      </div>

      {/* Mini list */}
      <div className="mini-list">
        {entries.map((entry) => {
          const owned = counts[entry.card.card_set_id] ?? 0;
          const need = Math.max(0, entry.quantity - owned);
          const swatch = COLOR_HEX[entry.card.card_color[0]] ?? "#444";
          return (
            <div key={entry.card.card_set_id} className="mini-row">
              <div className="swatch" style={{ background: swatch }} />
              <div className="mini-name">
                {entry.card.card_name}
                {need > 0 && (
                  <span
                    style={{
                      color: "var(--color-warn)",
                      fontSize: 10,
                      marginLeft: 4,
                    }}
                  >
                    −{need}
                  </span>
                )}
              </div>
              <div className="qty">
                <button
                  onClick={() => onChangeQuantity(entry.card.card_set_id, -1)}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: 16,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-light)",
                  }}
                >
                  {entry.quantity}
                </span>
                <button
                  onClick={() => onChangeQuantity(entry.card.card_set_id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mana curve */}
      {entries.length > 0 && <ManaCurve costs={costCurve} />}

      {/* Footer */}
      <div
        style={{
          fontSize: 11,
          color: "var(--color-muted-dim)",
          marginTop: 8,
          fontFamily: "var(--font-mono)",
        }}
      >
        10 DON!! auto-included
      </div>

      {validation && (
        <div
          style={{
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
            marginTop: 8,
            background: validation.valid
              ? "rgba(76,209,133,.12)"
              : "rgba(255,90,107,.12)",
          }}
        >
          {validation.valid ? (
            <div style={{ color: "var(--color-good)" }}>Deck is valid!</div>
          ) : (
            validation.errors.map((err, i) => (
              <div key={i} style={{ color: "var(--color-bad)" }}>
                {err}
              </div>
            ))
          )}
          {validation.warnings.map((w, i) => (
            <div key={i} style={{ color: "var(--color-warn)" }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {validation?.score && <DeckScorePanel score={validation.score} />}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onValidate} style={{ flex: 1 }}>
          Validate
        </button>
        <button
          onClick={onSave}
          disabled={saving || !leader || !deckName}
          className="btn primary"
          style={{ flex: 1 }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
