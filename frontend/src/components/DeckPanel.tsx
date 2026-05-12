import ManaCurve from "./ManaCurve";
import { useCollectionCounts } from "../hooks/useCollection";
import type { Card } from "../types";

const COLOR_HEX: Record<string, string> = {
  Red: "#e63946", Blue: "#3a7ad9", Green: "#3aaa64",
  Purple: "#8b5cf6", Black: "#5b6470", Yellow: "#e6b53a",
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
  validation: { valid: boolean; errors: string[]; warnings: string[] } | null;
  saving: boolean;
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

  const totalMissing = entries.reduce((sum, e) => {
    const owned = counts[e.card.card_set_id] ?? 0;
    return sum + Math.max(0, e.quantity - owned);
  }, 0);

  const costCurve: Record<number, number> = {};
  for (const e of entries) {
    const c = e.card.card_cost ?? 0;
    costCurve[c] = (costCurve[c] ?? 0) + e.quantity;
  }

  const leaderColor = leader ? COLOR_HEX[leader.card_color[0]] ?? "#444" : "#444";
  const countClass = totalCards === 50 ? "good" : totalCards >= 40 ? "warn" : "bad";

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
      <div style={{ background: "var(--color-bg-2)", borderRadius: 10, padding: 10, borderLeft: `4px solid ${leaderColor}`, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--color-muted-dim)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>LEADER</div>
        {leader ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "var(--color-light)", fontSize: 14, fontWeight: 700 }}>{leader.card_name}</div>
              <div style={{ color: "var(--color-muted)", fontSize: 12 }}>
                {leader.card_color.join("/")} · Life: {leader.life}
              </div>
            </div>
            <button onClick={onRemoveLeader} style={{ fontSize: 12 }}>Remove</button>
          </div>
        ) : (
          <div style={{ color: "var(--color-muted-dim)", fontSize: 13 }}>Select a Leader card</div>
        )}
      </div>

      {/* Count */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span className={`deck-count ${countClass}`}>{totalCards}</span>
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>/ 50 cards</span>
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
                {need > 0 && <span style={{ color: "var(--color-warn)", fontSize: 10, marginLeft: 4 }}>−{need}</span>}
              </div>
              <div className="qty">
                <button onClick={() => onChangeQuantity(entry.card.card_set_id, -1)}>−</button>
                <span style={{ minWidth: 16, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--color-light)" }}>
                  {entry.quantity}
                </span>
                <button onClick={() => onChangeQuantity(entry.card.card_set_id, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mana curve */}
      {entries.length > 0 && <ManaCurve costs={costCurve} />}

      {/* Footer */}
      <div style={{ fontSize: 11, color: "var(--color-muted-dim)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
        10 DON!! auto-included
      </div>

      {entries.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 4, color: totalMissing > 0 ? "var(--color-warn)" : "var(--color-good)" }}>
          {totalMissing > 0 ? `Missing ${totalMissing} cards` : "All cards owned ✓"}
        </div>
      )}

      {validation && (
        <div style={{
          borderRadius: 8,
          padding: 8,
          fontSize: 12,
          marginTop: 8,
          background: validation.valid ? "rgba(76,209,133,.12)" : "rgba(255,90,107,.12)",
        }}>
          {validation.valid ? (
            <div style={{ color: "var(--color-good)" }}>Deck is valid!</div>
          ) : (
            validation.errors.map((err, i) => <div key={i} style={{ color: "var(--color-bad)" }}>{err}</div>)
          )}
          {validation.warnings.map((w, i) => <div key={i} style={{ color: "var(--color-warn)" }}>{w}</div>)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onValidate} style={{ flex: 1 }}>Validate</button>
        <button onClick={onSave} disabled={saving || !leader || !deckName} className="btn primary" style={{ flex: 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
