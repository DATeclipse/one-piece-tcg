import { useEffect, useMemo, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useCardSearch, useSets } from "../hooks/useCards";
import { useCollectionCounts } from "../hooks/useCollection";
import type { Card, SearchFilters } from "../types";

const EMPTY_FILTERS: SearchFilters = {
  name: "",
  color: "",
  card_type: "",
  cost_min: "",
  cost_max: "",
  set_id: "",
  rarity: "",
  types_contains: "",
};

const TYPES = ["Character", "Event", "Stage", "Leader"];
const RARITIES = ["C", "UC", "R", "SR", "SEC", "L", "SP", "P", "TR"];
const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];

function rarityClass(r: string) {
  const key = r.toLowerCase();
  const map: Record<string, string> = {
    c: "r-c", uc: "r-uc", r: "r-r", sr: "r-sr", sec: "r-sec",
    l: "r-l", sp: "r-sp", spr: "r-spr", p: "r-p", tr: "r-tr",
  };
  return map[key] ?? "r-c";
}

function isRareOrAbove(r: string) {
  return ["R", "SR", "SEC", "L", "SP", "SPR", "TR"].includes(r);
}

export default function CardSearch() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      const colorStr = activeColors.size === 1 ? [...activeColors][0] : "";
      setDebouncedFilters({
        ...filters,
        search: filters.name,
        name: "",
        types_contains: "",
        color: colorStr,
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
  const { data: sets = [] } = useSets();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.page_size ?? 20));

  const displayItems = useMemo(() =>
    items.flatMap(card => {
      const base = [{ card, altIndex: 0 }];
      return base.concat(
        (card.alt_images ?? []).map((img, i) => ({
          card: { ...card, card_image: img },
          altIndex: i + 1,
        }))
      );
    }),
    [items],
  );

  const rareCount = useMemo(() => items.filter(c => isRareOrAbove(c.rarity)).length, [items]);

  const toggleColor = (c: string) => {
    setActiveColors(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const hasFilters = filters.name || filters.card_type || filters.cost_min || filters.cost_max
    || filters.set_id || filters.rarity || activeColors.size > 0;

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setActiveColors(new Set());
  };

  return (
    <div>
      {/* Hero */}
      <div className="cs-hero">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.12em", color: "var(--color-accent)" }}>
          ★ CARD LIBRARY ★
        </div>
        <div className="cs-counter">{total.toLocaleString()}</div>
        <div style={{ color: "var(--color-muted)", fontSize: 14 }}>
          of {total.toLocaleString()} cards · {rareCount} rare or above
        </div>

        {/* Search */}
        <div className="cs-search">
          <input
            type="text"
            placeholder="Search cards by name, type, or set..."
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Color pills */}
        <div className="pill-row">
          {COLORS.map(c => (
            <button
              key={c}
              className={`dpill${activeColors.has(c) ? " on" : ""}`}
              onClick={() => toggleColor(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="pill-row">
          <select
            className="dpill"
            value={filters.card_type}
            onChange={e => setFilters(f => ({ ...f, card_type: e.target.value }))}
          >
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            className="dpill"
            value={filters.rarity ?? ""}
            onChange={e => setFilters(f => ({ ...f, rarity: e.target.value }))}
          >
            <option value="">All Rarities</option>
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            className="dpill"
            value={filters.set_id}
            onChange={e => setFilters(f => ({ ...f, set_id: e.target.value }))}
          >
            <option value="">All Sets</option>
            {sets.map(s => <option key={s.set_id} value={s.set_id}>{s.set_id}</option>)}
          </select>

          <input
            type="number"
            className="dpill"
            placeholder="Cost min"
            value={filters.cost_min}
            onChange={e => setFilters(f => ({ ...f, cost_min: e.target.value }))}
            style={{ width: 90 }}
          />
          <input
            type="number"
            className="dpill"
            placeholder="Cost max"
            value={filters.cost_max}
            onChange={e => setFilters(f => ({ ...f, cost_max: e.target.value }))}
            style={{ width: 90 }}
          />

          {hasFilters && (
            <button className="dpill" onClick={clearAll} style={{ color: "var(--color-accent)" }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Card Grid */}
      {items.length > 0 ? (
        <div className="cs-grid">
          {displayItems.map(({ card, altIndex }, i) => (
            <div
              key={`${card.card_set_id}_${altIndex}`}
              className="cs-card-wrap"
              style={{ animationDelay: `${Math.min(i, 30) * 25}ms` }}
            >
              {isRareOrAbove(card.rarity) && (
                <span className={`rarity-tag ${rarityClass(card.rarity)}`}>
                  {card.rarity}
                </span>
              )}
              <CardItem
                card={card}
                onClick={() => setSelectedCard(card)}
                collectionCount={collectionCounts.get(card.card_set_id)}
                isAltArt={altIndex > 0}
              />
            </div>
          ))}
        </div>
      ) : data ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48 }}>🏴‍☠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-muted)", marginTop: 12 }}>
            NO CARDS FOUND
          </div>
        </div>
      ) : null}

      {/* Pagination */}
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
