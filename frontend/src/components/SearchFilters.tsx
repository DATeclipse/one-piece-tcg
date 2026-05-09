import { useColors, useSets } from "../hooks/useCards";
import type { SearchFilters as Filters } from "../types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  leaderColors?: string[];
}

export default function SearchFilters({ filters, onChange, leaderColors }: Props) {
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
        className="p-1.5 min-w-[200px]"
      />
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
      <select value={filters.set_id} onChange={(e) => update("set_id", e.target.value)}>
        <option value="">All Sets</option>
        {sets.map((s) => (
          <option key={s.set_id} value={s.set_id}>{s.set_id} - {s.set_name}</option>
        ))}
      </select>
    </div>
  );
}
