import { useMemo, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useFullCollection, useUpdateCollection } from "../hooks/useCollection";
import type { Card } from "../types";

const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];
const TYPES = ["Leader", "Character", "Event", "Stage"];

const COLOR_HEX: Record<string, string> = {
  Red: "#e63946", Blue: "#3a7ad9", Green: "#3aaa64",
  Purple: "#8b5cf6", Black: "#5b6470", Yellow: "#e6b53a",
};

export default function CollectionPage() {
  const { data: collection = [], isLoading } = useFullCollection();
  const updateCollection = useUpdateCollection();
  const [search, setSearch] = useState("");
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const totalUnique = collection.length;
  const totalCopies = collection.reduce((sum, item) => sum + item.quantity, 0);

  const colorDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of collection) {
      for (const c of item.card.card_color) {
        counts[c] = (counts[c] ?? 0) + item.quantity;
      }
    }
    return COLORS.map(c => ({ color: c, count: counts[c] ?? 0 })).filter(d => d.count > 0);
  }, [collection]);

  const maxColorCount = Math.max(...colorDist.map(d => d.count), 1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return collection.filter((item) => {
      if (q && !item.card.card_name.toLowerCase().includes(q) && !item.card.types.some(t => t.toLowerCase().includes(q))) return false;
      if (activeColors.size > 0 && !item.card.card_color.some(c => activeColors.has(c))) return false;
      if (typeFilter && item.card.card_type !== typeFilter) return false;
      return true;
    });
  }, [collection, search, activeColors, typeFilter]);

  const toggleColor = (c: string) => {
    setActiveColors(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const adjustQty = (cardSetId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    updateCollection.mutate({ card_set_id: cardSetId, quantity: newQty });
  };

  return (
    <div>
      {/* Hero */}
      <div className="col-hero">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.12em", color: "var(--color-accent)" }}>
          ★ MY COLLECTION ★
        </div>
        <div className="giant-pct">{totalUnique.toLocaleString()}</div>
        <div style={{ color: "var(--color-muted)", fontSize: 14 }}>
          {totalUnique} unique cards · {totalCopies} total copies
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Unique Cards</div>
          <div className="stat-value">{totalUnique}</div>
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
          <div className="stat-label">Avg Per Card</div>
          <div className="stat-value">{totalUnique > 0 ? (totalCopies / totalUnique).toFixed(1) : "0"}</div>
        </div>
      </div>

      {/* Color Distribution */}
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

      {/* Filters */}
      <div className="pill-row" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        {COLORS.map(c => (
          <button key={c} className={`dpill${activeColors.has(c) ? " on" : ""}`} onClick={() => toggleColor(c)}>
            {c}
          </button>
        ))}
        <select className="dpill" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Collection Grid */}
      {isLoading ? (
        <div style={{ color: "var(--color-muted-dim)", padding: 32, textAlign: "center" }}>Loading collection...</div>
      ) : filtered.length > 0 ? (
        <div className="coll-grid">
          {filtered.map((item, i) => (
            <div key={item.card.card_set_id} className="coll-tile" style={{ animationDelay: `${Math.min(i, 30) * 20}ms` }}>
              <CardItem
                card={item.card}
                onClick={() => setSelectedCard(item.card)}
                collectionCount={item.quantity}
              />
              <div className="coll-controls">
                <button className="qbtn minus" onClick={() => adjustQty(item.card.card_set_id, item.quantity, -1)}>−</button>
                <span className="coll-qty">{item.quantity}</span>
                <button className="qbtn plus" onClick={() => adjustQty(item.card.card_set_id, item.quantity, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48 }}>📦</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-muted)", marginTop: 12 }}>
            {collection.length === 0 ? "NO CARDS YET" : "NO MATCHES"}
          </div>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
