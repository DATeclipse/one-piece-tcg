import { useEffect, useRef, useState } from "react";
import type { SearchFilters } from "../types";

const TYPES = ["Character", "Event", "Stage", "Leader"];
const RARITIES = ["C", "UC", "R", "SR", "SEC", "L", "SP", "P", "TR"];
const COLORS = ["Red", "Blue", "Green", "Purple", "Black", "Yellow"];
const ART_STYLES = ["standard", "manga", "full_art", "alt_art"];

function FilterDropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const label = selected ? selected.label : placeholder;

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        className={`filter-dropdown-trigger${value ? " active" : ""}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {label}
        <span className="dd-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          <button
            className={!value ? "selected" : ""}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              className={value === o.value ? "selected" : ""}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <FilterDropdown
          value={filters.card_type}
          options={TYPES.map(t => ({ value: t, label: t }))}
          placeholder="All Types"
          onChange={v => onFiltersChange(f => ({ ...f, card_type: v }))}
        />

        <FilterDropdown
          value={filters.rarity ?? ""}
          options={RARITIES.map(r => ({ value: r, label: r }))}
          placeholder="All Rarities"
          onChange={v => onFiltersChange(f => ({ ...f, rarity: v }))}
        />

        <FilterDropdown
          value={filters.art_style ?? ""}
          options={ART_STYLES.map(s => ({ value: s, label: s.replace("_", " ") }))}
          placeholder="All Art Styles"
          onChange={v => onFiltersChange(f => ({ ...f, art_style: v }))}
        />

        <FilterDropdown
          value={filters.set_id}
          options={sets.map(s => ({ value: s.set_id, label: s.set_id }))}
          placeholder="All Sets"
          onChange={v => onFiltersChange(f => ({ ...f, set_id: v }))}
        />

        <div className="cost-group">
          <label>Cost</label>
          <input
            type="number"
            placeholder="min"
            value={filters.cost_min}
            onChange={e => onFiltersChange(f => ({ ...f, cost_min: e.target.value }))}
          />
          <span className="cost-sep">–</span>
          <input
            type="number"
            placeholder="max"
            value={filters.cost_max}
            onChange={e => onFiltersChange(f => ({ ...f, cost_max: e.target.value }))}
          />
        </div>

        {hasFilters && (
          <button className="dpill" onClick={onClear} style={{ color: "var(--color-accent)" }}>
            &#10005; Clear
          </button>
        )}
      </div>
    </>
  );
}
