import { useEffect, useMemo, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import CardSearchBar from "../components/CardSearchBar";
import { useCardSearch, useSets } from "../hooks/useCards";
import { useCollectionCounts, useUpdateCollection } from "../hooks/useCollection";
import type { Card, SearchFilters } from "../types";

const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];

const COLOR_HEX: Record<string, string> = {
  Red: "#e63946", Blue: "#3a7ad9", Green: "#3aaa64",
  Purple: "#8b5cf6", Black: "#5b6470", Yellow: "#e6b53a",
};

const EMPTY_FILTERS: SearchFilters = {
  name: "",
  color: "",
  card_type: "",
  cost_min: "",
  cost_max: "",
  set_id: "",
  rarity: "",
  art_style: "",
};

export default function CollectionPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { data: sets = [] } = useSets();
  const updateCollection = useUpdateCollection();

  useEffect(() => {
    const t = setTimeout(() => {
      const colorStr = activeColors.size === 1 ? [...activeColors][0] : "";
      setDebouncedFilters({
        ...filters,
        search: filters.name,
        name: "",
        color: colorStr,
        in_collection: true,
      });
      setPage(1);
    }, 150);
    return () => clearTimeout(t);
  }, [filters, activeColors]);

  const { data } = useCardSearch(debouncedFilters, page);
  const { data: collectionData = {} } = useCollectionCounts();
  const collectionCounts = useMemo(
    () => new Map<string, number>(Object.entries(collectionData)),
    [collectionData],
  );

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
    return COLORS.map(c => ({ color: c, count: counts[c] ?? 0 })).filter(d => d.count > 0);
  }, [items, collectionCounts]);

  const maxColorCount = Math.max(...colorDist.map(d => d.count), 1);

  const toggleColor = (c: string) => {
    setActiveColors(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setActiveColors(new Set());
  };

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
                background: `linear-gradient(135deg, ${COLOR_HEX[color]}, ${COLOR_HEX[color]}88)`,
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
