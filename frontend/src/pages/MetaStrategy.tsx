import { useState } from "react";
import { colorHex } from "../constants/colors";
import ManaCurve from "../components/ManaCurve";
import { useDeck, useDeckList } from "../hooks/useDecks";
import { useDeleteMetaDeck, useMetaDeck, useMetaDeckList } from "../hooks/useMeta";
import type { DeckCard } from "../types";

interface DeckStats {
  totalCards: number;
  avgCost: string;
  totalCounter: number;
  totalPower: number;
  costCurve: Record<number, number>;
  typeCounts: Record<string, number>;
  colorCounts: Record<string, number>;
}

function computeStats(cards: DeckCard[]): DeckStats {
  const nonLeader = cards.filter((dc) => dc.card.card_type !== "Leader");
  const totalCards = nonLeader.reduce((sum, dc) => sum + dc.quantity, 0);

  const costCurve: Record<number, number> = {};
  let totalCost = 0;
  let costCount = 0;
  let totalCounter = 0;
  let totalPower = 0;

  for (const dc of nonLeader) {
    if (dc.card.card_cost !== null) {
      costCurve[dc.card.card_cost] = (costCurve[dc.card.card_cost] ?? 0) + dc.quantity;
      totalCost += dc.card.card_cost * dc.quantity;
      costCount += dc.quantity;
    }
    if (dc.card.counter_amount !== null) totalCounter += dc.card.counter_amount * dc.quantity;
    if (dc.card.card_power !== null) totalPower += dc.card.card_power * dc.quantity;
  }

  const typeCounts: Record<string, number> = {};
  for (const dc of nonLeader) typeCounts[dc.card.card_type] = (typeCounts[dc.card.card_type] ?? 0) + dc.quantity;

  const colorCounts: Record<string, number> = {};
  for (const dc of nonLeader) for (const c of dc.card.card_color) colorCounts[c] = (colorCounts[c] ?? 0) + dc.quantity;

  return {
    totalCards,
    avgCost: costCount > 0 ? (totalCost / costCount).toFixed(1) : "—",
    totalCounter,
    totalPower,
    costCurve,
    typeCounts,
    colorCounts,
  };
}

export default function MetaStrategy() {
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedMetaId, setSelectedMetaId] = useState<number | null>(null);

  const { data: decks = [] } = useDeckList();
  const { data: deck } = useDeck(selectedDeckId);
  const { data: metaDecks = [] } = useMetaDeckList();
  const { data: metaDeck } = useMetaDeck(selectedMetaId);
  const deleteMutation = useDeleteMetaDeck();

  const deckStats = deck ? computeStats(deck.cards) : null;
  const metaStats = metaDeck ? computeStats(metaDeck.cards) : null;
  const comparing = deckStats && metaStats;

  const allColors = new Set<string>();
  if (deckStats) Object.keys(deckStats.colorCounts).forEach(c => allColors.add(c));
  if (metaStats) Object.keys(metaStats.colorCounts).forEach(c => allColors.add(c));

  const globalMaxType = Math.max(
    ...Object.values(deckStats?.typeCounts ?? {}),
    ...Object.values(metaStats?.typeCounts ?? {}),
    1
  );
  const globalMaxColor = Math.max(
    ...Object.values(deckStats?.colorCounts ?? {}),
    ...Object.values(metaStats?.colorCounts ?? {}),
    1
  );

  return (
    <div>
      {/* Saved meta decks */}
      {metaDecks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>
            SAVED META DECKS
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {metaDecks.map(md => (
              <div key={md.id} className="stat" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-light)" }}>{md.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{md.leader_name} · {md.card_count} cards</div>
                </div>
                <button onClick={() => deleteMutation.mutate(md.id)} disabled={deleteMutation.isPending} style={{ fontSize: 11, color: "var(--color-bad)" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deck pickers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, marginBottom: 24, alignItems: "end" }}>
        <div>
          <div className="stat-label" style={{ marginBottom: 6 }}>YOUR DECK</div>
          <select
            value={selectedDeckId ?? ""}
            onChange={e => setSelectedDeckId(e.target.value ? Number(e.target.value) : null)}
            style={{ width: "100%" }}
          >
            <option value="">Select deck...</option>
            {decks.map(d => <option key={d.id} value={d.id}>{d.name} ({d.leader_name})</option>)}
          </select>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-muted-dim)", paddingBottom: 8 }}>VS</div>
        <div>
          <div className="stat-label" style={{ marginBottom: 6 }}>META DECK</div>
          <select
            value={selectedMetaId ?? ""}
            onChange={e => setSelectedMetaId(e.target.value ? Number(e.target.value) : null)}
            style={{ width: "100%" }}
          >
            <option value="">Select meta deck...</option>
            {metaDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {!deckStats && !metaStats && (
        <div style={{ color: "var(--color-muted-dim)", fontSize: 14 }}>
          Select a deck to see analysis. Save meta decks from Tournaments to compare.
        </div>
      )}

      {(deckStats || metaStats) && (
        <>
          {/* Stat comparison */}
          <div className="compare-grid">
            <StatTile label="Cards" left={deckStats} right={metaStats} render={s => `${s.totalCards}/50`} />
            <StatTile label="Avg Cost" left={deckStats} right={metaStats} render={s => s.avgCost} />
            <StatTile label="Counter" left={deckStats} right={metaStats} render={s => s.totalCounter.toLocaleString()} />
            <StatTile label="Total Power" left={deckStats} right={metaStats} render={s => (s.totalPower / 1000).toFixed(0) + "K"} />
          </div>

          {/* Mana Curve */}
          <div className="band">
            <h2>MANA CURVE</h2>
            <div className="band-line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: comparing ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 24 }}>
            {deckStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>YOUR DECK</div>}
                <ManaCurve costs={deckStats.costCurve} />
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>META DECK</div>}
                <ManaCurve costs={metaStats.costCurve} />
              </div>
            )}
          </div>

          {/* Type Breakdown */}
          <div className="band">
            <h2>TYPE BREAKDOWN</h2>
            <div className="band-line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: comparing ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 24 }}>
            {deckStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>YOUR DECK</div>}
                {["Character", "Event", "Stage"].map(type => {
                  const count = deckStats.typeCounts[type] ?? 0;
                  const pct = deckStats.totalCards > 0 ? Math.round((count / deckStats.totalCards) * 100) : 0;
                  return (
                    <div key={type} className="bar-row">
                      <span className="bar-label">{type}</span>
                      <div className="bar-wrap"><div className="bar-fill" style={{ width: `${(count / globalMaxType) * 100}%` }} /></div>
                      <span className="bar-val">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>META DECK</div>}
                {["Character", "Event", "Stage"].map(type => {
                  const count = metaStats.typeCounts[type] ?? 0;
                  const pct = metaStats.totalCards > 0 ? Math.round((count / metaStats.totalCards) * 100) : 0;
                  return (
                    <div key={type} className="bar-row">
                      <span className="bar-label">{type}</span>
                      <div className="bar-wrap"><div className="bar-fill" style={{ width: `${(count / globalMaxType) * 100}%` }} /></div>
                      <span className="bar-val">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color Distribution */}
          <div className="band">
            <h2>COLOR DISTRIBUTION</h2>
            <div className="band-line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: comparing ? "1fr 1fr" : "1fr", gap: 20 }}>
            {deckStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>YOUR DECK</div>}
                {Array.from(allColors).sort((a, b) => (deckStats.colorCounts[b] ?? 0) - (deckStats.colorCounts[a] ?? 0)).map(color => {
                  const count = deckStats.colorCounts[color] ?? 0;
                  return (
                    <div key={color} className="bar-row">
                      <span className="bar-label">{color}</span>
                      <div className="bar-wrap">
                        <div className="bar-fill" style={{ width: `${(count / globalMaxColor) * 100}%`, background: colorHex(color) }} />
                      </div>
                      <span className="bar-val">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>META DECK</div>}
                {Array.from(allColors).sort((a, b) => (metaStats.colorCounts[b] ?? 0) - (metaStats.colorCounts[a] ?? 0)).map(color => {
                  const count = metaStats.colorCounts[color] ?? 0;
                  return (
                    <div key={color} className="bar-row">
                      <span className="bar-label">{color}</span>
                      <div className="bar-wrap">
                        <div className="bar-fill" style={{ width: `${(count / globalMaxColor) * 100}%`, background: colorHex(color) }} />
                      </div>
                      <span className="bar-val">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, left, right, render }: {
  label: string;
  left: DeckStats | null;
  right: DeckStats | null;
  render: (s: DeckStats) => string;
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        {left && <span className="stat-value">{render(left)}</span>}
        {left && right && <span style={{ color: "var(--color-muted-dim)", fontSize: 14 }}>vs</span>}
        {right && <span className="stat-value">{render(right)}</span>}
      </div>
    </div>
  );
}
