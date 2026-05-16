import type { SearchFilters } from "../types";

const TYPES = ["Character", "Event", "Stage", "Leader"];
const RARITIES = ["C", "UC", "R", "SR", "SEC", "L", "SP", "P", "TR"];
const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];
const ART_STYLES = ["standard", "manga", "full_art", "alt_art"];

interface CardSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (fn: (prev: SearchFilters) => SearchFilters) => void;
  activeColors: Set<string>;
  onToggleColor: (color: string) => void;
  onClear: () => void;
  sets: { set_id: string; set_name: string }[];
}

export default function CardSearchBar({
  filters,
  onFiltersChange,
  activeColors,
  onToggleColor,
  onClear,
  sets,
}: CardSearchBarProps) {
  const hasFilters =
    filters.name || filters.card_type || filters.cost_min || filters.cost_max ||
    filters.set_id || filters.rarity || filters.art_style || activeColors.size > 0;

  return (
    <>
      <div className="cs-search">
        <input
          type="text"
          placeholder="Search cards by name, type, or set..."
          value={filters.name}
          onChange={e => onFiltersChange(f => ({ ...f, name: e.target.value }))}
        />
        <span className="search-icon">&#128269;</span>
      </div>

      <div className="pill-row">
        {COLORS.map(c => (
          <button
            key={c}
            className={`dpill${activeColors.has(c) ? " on" : ""}`}
            onClick={() => onToggleColor(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="pill-row">
        <select
          className="dpill"
          value={filters.card_type}
          onChange={e => onFiltersChange(f => ({ ...f, card_type: e.target.value }))}
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          className="dpill"
          value={filters.rarity ?? ""}
          onChange={e => onFiltersChange(f => ({ ...f, rarity: e.target.value }))}
        >
          <option value="">All Rarities</option>
          {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          className="dpill"
          value={filters.art_style ?? ""}
          onChange={e => onFiltersChange(f => ({ ...f, art_style: e.target.value }))}
        >
          <option value="">All Art Styles</option>
          {ART_STYLES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>

        <select
          className="dpill"
          value={filters.set_id}
          onChange={e => onFiltersChange(f => ({ ...f, set_id: e.target.value }))}
        >
          <option value="">All Sets</option>
          {sets.map(s => <option key={s.set_id} value={s.set_id}>{s.set_id}</option>)}
        </select>

        <input
          type="number"
          className="dpill"
          placeholder="Cost min"
          value={filters.cost_min}
          onChange={e => onFiltersChange(f => ({ ...f, cost_min: e.target.value }))}
          style={{ width: 90 }}
        />
        <input
          type="number"
          className="dpill"
          placeholder="Cost max"
          value={filters.cost_max}
          onChange={e => onFiltersChange(f => ({ ...f, cost_max: e.target.value }))}
          style={{ width: 90 }}
        />

        {hasFilters && (
          <button className="dpill" onClick={onClear} style={{ color: "var(--color-accent)" }}>
            &#10005; Clear
          </button>
        )}
      </div>
    </>
  );
}
