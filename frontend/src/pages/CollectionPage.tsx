import { useMemo, useState } from "react";
import { COLOR_NAMES, colorHex } from "../constants/colors";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import CardSearchBar from "../components/CardSearchBar";
import { useCardSearch, useSets } from "../hooks/useCards";
import { useCardFilters } from "../hooks/useCardFilters";
import { useCollectionCountsMap, useUpdateCollection } from "../hooks/useCollection";
import type { Card } from "../types";

const COLLECTION_EXTRA = { in_collection: true } as const;

export default function CollectionPage() {
  const { filters, setFilters, debouncedFilters, activeColors, toggleColor, clearAll, page, setPage } = useCardFilters({ extraFilters: COLLECTION_EXTRA });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { data: sets = [] } = useSets();
  const updateCollection = useUpdateCollection();

  const { data } = useCardSearch(debouncedFilters, page);
  const { data: collectionCounts } = useCollectionCountsMap();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.page_size ?? 50));

  const totalCopies = useMemo(
    () => Array.from(collectionCounts.values()).reduce((s, v) => s + v, 0),
    [collectionCounts],
  );

  const colorDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [id, qty] of collectionCounts) {
      const card = items.find(c => c.card_set_id === id);
      if (card) {
        for (const c of card.card_color) {
          counts[c] = (counts[c] ?? 0) + qty;
        }
      }
    }
    return COLOR_NAMES.map(c => ({ color: c, count: counts[c] ?? 0 })).filter(d => d.count > 0);
  }, [items, collectionCounts]);

  const maxColorCount = Math.max(...colorDist.map(d => d.count), 1);

  const adjustQty = (cardSetId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    updateCollection.mutate({ card_set_id: cardSetId, quantity: newQty });
  };

  return (
    <div>
      <div className="col-hero">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.12em", color: "var(--color-accent)" }}>
          ★ MY COLLECTION ★
        </div>
        <div className="giant-pct">{collectionCounts.size.toLocaleString()}</div>
        <div style={{ color: "var(--color-muted)", fontSize: 14 }}>
          {collectionCounts.size} unique cards · {totalCopies} total copies
        </div>

        <CardSearchBar
          filters={filters}
          onFiltersChange={setFilters}
          activeColors={activeColors}
          onToggleColor={toggleColor}
          onClear={clearAll}
          sets={sets}
        />
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Unique Cards</div>
          <div className="stat-value">{collectionCounts.size}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Copies</div>
          <div className="stat-value">{totalCopies}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Colors</div>
          <div className="stat-value">{colorDist.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Showing</div>
          <div className="stat-value">{total}</div>
        </div>
      </div>

      {colorDist.length > 0 && (
        <div className="combo-row">
          {colorDist.map(({ color, count }) => (
            <div
              key={color}
              className="combo-tile"
              style={{
                background: `linear-gradient(135deg, ${colorHex(color)}, ${colorHex(color)}88)`,
                width: Math.max(80, (count / maxColorCount) * 160),
              }}
            >
              <span className="combo-count">{count}</span>
              <span className="combo-label">{color}</span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <div className="coll-grid">
          {items.map((card, i) => {
            const qty = collectionCounts.get(card.card_set_id) ?? 0;
            return (
              <div key={card.card_set_id} className="coll-tile" style={{ animationDelay: `${Math.min(i, 30) * 20}ms` }}>
                <CardItem
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  collectionCount={qty}
                />
                <div className="coll-controls">
                  <button className="qbtn minus" onClick={() => adjustQty(card.card_set_id, qty, -1)}>&#8722;</button>
                  <span className="coll-qty">{qty}</span>
                  <button className="qbtn plus" onClick={() => adjustQty(card.card_set_id, qty, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : data ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48 }}>&#128230;</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-muted)", marginTop: 12 }}>
            {collectionCounts.size === 0 ? "NO CARDS YET" : "NO MATCHES"}
          </div>
        </div>
      ) : null}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ color: "var(--color-muted)", lineHeight: "36px", fontSize: 14 }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
