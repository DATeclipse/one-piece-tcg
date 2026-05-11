import { useColors, useSets } from "../hooks/useCards";
import type { SearchFilters as Filters } from "../types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  leaderColors?: string[];
  leaderSelected?: boolean;
}

export default function SearchFilters({ filters, onChange, leaderColors, leaderSelected = false }: Props) {
  const { data: colors = [] } = useColors();
  const { data: sets = [] } = useSets();

  const availableColors = leaderColors?.length ? leaderColors : colors;

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.name}
        onChange={(e) => update("name", e.target.value)}
        className="p-1.5 w-full md:w-auto md:min-w-[200px]"
      />
      {!leaderSelected && (
        <>
          <select value={filters.color} onChange={(e) => update("color", e.target.value)}>
            <option value="">All Colors</option>
            {availableColors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={filters.card_type} onChange={(e) => update("card_type", e.target.value)}>
            <option value="">All Types</option>
            <option value="Character">Character</option>
            <option value="Event">Event</option>
            <option value="Stage">Stage</option>
            <option value="Leader">Leader</option>
          </select>
        </>
      )}
      <input
        type="number"
        placeholder="Cost min"
        value={filters.cost_min}
        onChange={(e) => update("cost_min", e.target.value)}
        className="w-20 p-1.5"
      />
      <input
        type="number"
        placeholder="Cost max"
        value={filters.cost_max}
        onChange={(e) => update("cost_max", e.target.value)}
        className="w-20 p-1.5"
      />
      <select value={filters.rarity ?? ""} onChange={(e) => update("rarity", e.target.value)}>
        <option value="">All Rarities</option>
        <option value="C">C</option>
        <option value="UC">UC</option>
        <option value="R">R</option>
        <option value="SR">SR</option>
        <option value="SEC">SEC</option>
        <option value="L">L</option>
        <option value="SP">SP</option>
        <option value="P">P</option>
        <option value="TR">TR</option>
      </select>
      <select value={filters.set_id} onChange={(e) => update("set_id", e.target.value)} className="w-full md:w-auto">
        <option value="">All Sets</option>
        {sets.map((s) => (
          <option key={s.set_id} value={s.set_id}>{s.set_id} - {s.set_name}</option>
        ))}
      </select>
    </div>
  );
}
