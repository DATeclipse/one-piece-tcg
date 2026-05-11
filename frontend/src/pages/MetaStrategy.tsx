import { useState } from "react";
import { useDeck, useDeckList } from "../hooks/useDecks";
import { useDeleteMetaDeck, useMetaDeck, useMetaDeckList } from "../hooks/useMeta";
import type { DeckCard } from "../types";

const COLOR_BAR_MAP: Record<string, string> = {
  Red: "bg-card-red",
  Blue: "bg-card-blue",
  Green: "bg-card-green",
  Purple: "bg-card-purple",
  Black: "bg-card-black",
  Yellow: "bg-card-yellow",
};

interface DeckStats {
  totalCards: number;
  avgCost: string;
  totalCounter: number;
  costCurve: Map<number, number>;
  maxCostCount: number;
  typeCounts: Record<string, number>;
  maxTypeCount: number;
  colorCounts: Record<string, number>;
  maxColorCount: number;
}

function computeStats(cards: DeckCard[]): DeckStats {
  const nonLeader = cards.filter((dc) => dc.card.card_type !== "Leader");
  const totalCards = nonLeader.reduce((sum, dc) => sum + dc.quantity, 0);

  const costCurve = new Map<number, number>();
  let totalCost = 0;
  let costCount = 0;
  let totalCounter = 0;

  for (const dc of nonLeader) {
    if (dc.card.card_cost !== null) {
      costCurve.set(dc.card.card_cost, (costCurve.get(dc.card.card_cost) ?? 0) + dc.quantity);
      totalCost += dc.card.card_cost * dc.quantity;
      costCount += dc.quantity;
    }
    if (dc.card.counter_amount !== null) {
      totalCounter += dc.card.counter_amount * dc.quantity;
    }
  }

  const typeCounts: Record<string, number> = {};
  for (const dc of nonLeader) {
    typeCounts[dc.card.card_type] = (typeCounts[dc.card.card_type] ?? 0) + dc.quantity;
  }

  const colorCounts: Record<string, number> = {};
  for (const dc of nonLeader) {
    for (const color of dc.card.card_color) {
      colorCounts[color] = (colorCounts[color] ?? 0) + dc.quantity;
    }
  }

  return {
    totalCards,
    avgCost: costCount > 0 ? (totalCost / costCount).toFixed(1) : "—",
    totalCounter,
    costCurve,
    maxCostCount: Math.max(...Array.from(costCurve.values()), 1),
    typeCounts,
    maxTypeCount: Math.max(...Object.values(typeCounts), 1),
    colorCounts,
    maxColorCount: Math.max(...Object.values(colorCounts), 1),
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
  if (deckStats) Object.keys(deckStats.colorCounts).forEach((c) => allColors.add(c));
  if (metaStats) Object.keys(metaStats.colorCounts).forEach((c) => allColors.add(c));

  const globalMaxCost = Math.max(deckStats?.maxCostCount ?? 1, metaStats?.maxCostCount ?? 1);
  const globalMaxType = Math.max(deckStats?.maxTypeCount ?? 1, metaStats?.maxTypeCount ?? 1);
  const globalMaxColor = Math.max(deckStats?.maxColorCount ?? 1, metaStats?.maxColorCount ?? 1);

  return (
    <div>
      {metaDecks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-accent text-sm mb-2">Saved Meta Decks</h4>
          <div className="flex gap-2 flex-wrap">
            {metaDecks.map((md) => (
              <div key={md.id} className="bg-panel rounded-md px-3 py-2 flex items-center gap-3">
                <div>
                  <div className="text-light text-[0.85rem] font-bold">{md.name}</div>
                  <div className="text-muted-dim text-[0.7rem]">
                    {md.leader_name} | {md.card_count} cards
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(md.id)}
                  disabled={deleteMutation.isPending}
                  className="text-[0.7rem]"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="text-muted-dim text-xs block mb-1">Your Deck</label>
          <select
            value={selectedDeckId ?? ""}
            onChange={(e) => setSelectedDeckId(e.target.value ? Number(e.target.value) : null)}
            className="p-1.5 w-full"
          >
            <option value="">Select your deck...</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.leader_name})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-muted-dim text-xs block mb-1">Meta Deck (compare)</label>
          <select
            value={selectedMetaId ?? ""}
            onChange={(e) => setSelectedMetaId(e.target.value ? Number(e.target.value) : null)}
            className="p-1.5 w-full"
          >
            <option value="">Select meta deck...</option>
            {metaDecks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!deckStats && !metaStats && (
        <div className="text-muted-dim text-sm">Select a deck to see analysis. Save meta decks from Tournaments page to compare.</div>
      )}

      {(deckStats || metaStats) && (
        <>
          <div className={`grid ${comparing ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-6`}>
            {deckStats && (
              <StatCards label={comparing ? "Your Deck" : undefined} stats={deckStats} />
            )}
            {metaStats && (
              <StatCards label={comparing ? "Meta Deck" : undefined} stats={metaStats} />
            )}
          </div>

          <h3 className="text-accent text-lg font-bold font-serif tracking-wide mb-3">
            Mana Curve
          </h3>
          <div className={`grid ${comparing ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-6`}>
            {deckStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Your Deck</div>}
                <ManaCurve stats={deckStats} maxCount={globalMaxCost} color="bg-accent" />
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Meta Deck</div>}
                <ManaCurve stats={metaStats} maxCount={globalMaxCost} color="bg-card-purple" />
              </div>
            )}
          </div>

          <h3 className="text-accent text-lg font-bold font-serif tracking-wide mb-3">
            Type Breakdown
          </h3>
          <div className={`grid ${comparing ? "grid-cols-2" : "grid-cols-1"} gap-4 mb-6`}>
            {deckStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Your Deck</div>}
                <TypeBreakdown stats={deckStats} maxCount={globalMaxType} />
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Meta Deck</div>}
                <TypeBreakdown stats={metaStats} maxCount={globalMaxType} />
              </div>
            )}
          </div>

          <h3 className="text-accent text-lg font-bold font-serif tracking-wide mb-3">
            Color Distribution
          </h3>
          <div className={`grid ${comparing ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            {deckStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Your Deck</div>}
                <ColorDist stats={deckStats} allColors={allColors} maxCount={globalMaxColor} />
              </div>
            )}
            {metaStats && (
              <div>
                {comparing && <div className="text-muted-dim text-xs mb-1">Meta Deck</div>}
                <ColorDist stats={metaStats} allColors={allColors} maxCount={globalMaxColor} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCards({ label, stats }: { label?: string; stats: DeckStats }) {
  return (
    <div>
      {label && <div className="text-muted-dim text-xs mb-1">{label}</div>}
      <div className="flex gap-3 text-sm">
        <div className="bg-panel rounded px-3 py-2">
          <div className="text-muted-dim text-xs">Cards</div>
          <div className={stats.totalCards === 50 ? "text-valid font-bold" : "text-warning font-bold"}>
            {stats.totalCards}/50
          </div>
        </div>
        <div className="bg-panel rounded px-3 py-2">
          <div className="text-muted-dim text-xs">Avg Cost</div>
          <div className="text-light font-bold">{stats.avgCost}</div>
        </div>
        <div className="bg-panel rounded px-3 py-2">
          <div className="text-muted-dim text-xs">Counter</div>
          <div className="text-light font-bold">{stats.totalCounter.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function ManaCurve({ stats, maxCount, color }: { stats: DeckStats; maxCount: number; color: string }) {
  return (
    <div className="flex items-end gap-1.5 h-36">
      {Array.from({ length: 11 }, (_, cost) => {
        const count = stats.costCurve.get(cost) ?? 0;
        const height = maxCount > 0 ? (count / maxCount) * 130 : 0;
        return (
          <div key={cost} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs text-muted">{count || ""}</span>
            <div
              className={`w-full ${color} rounded-t min-h-0.5`}
              style={{ height: `${height}px` }}
            />
            <span className="text-xs text-muted-dim">{cost}</span>
          </div>
        );
      })}
    </div>
  );
}

function TypeBreakdown({ stats, maxCount }: { stats: DeckStats; maxCount: number }) {
  return (
    <div className="flex flex-col gap-2">
      {["Character", "Event", "Stage"].map((type) => {
        const count = stats.typeCounts[type] ?? 0;
        const pct = stats.totalCards > 0 ? Math.round((count / stats.totalCards) * 100) : 0;
        return (
          <div key={type} className="flex items-center gap-2">
            <span className="w-20 text-sm text-light">{type}</span>
            <div className="flex-1 flex items-center gap-2">
              <div
                className="bg-accent rounded h-5 min-w-0.5"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
              <span className="text-xs text-muted whitespace-nowrap">
                {count} ({pct}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ColorDist({ stats, allColors, maxCount }: { stats: DeckStats; allColors: Set<string>; maxCount: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from(allColors)
        .sort((a, b) => (stats.colorCounts[b] ?? 0) - (stats.colorCounts[a] ?? 0))
        .map((color) => {
          const count = stats.colorCounts[color] ?? 0;
          return (
            <div key={color} className="flex items-center gap-2">
              <span className="w-20 text-sm text-light">{color}</span>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className={`${COLOR_BAR_MAP[color] ?? "bg-accent"} rounded h-5 min-w-0.5`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
                <span className="text-xs text-muted">{count}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
