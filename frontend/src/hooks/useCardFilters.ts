import { useEffect, useState } from "react";
import type { SearchFilters } from "../types";

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

interface UseCardFiltersOptions {
  extraFilters?: Partial<SearchFilters>;
}

export function useCardFilters(options?: UseCardFiltersOptions) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      const colorStr = activeColors.size === 1 ? [...activeColors][0] : "";
      setDebouncedFilters({
        ...filters,
        search: filters.name,
        name: "",
        color: colorStr,
        ...options?.extraFilters,
      });
      setPage(1);
    }, 150);
    return () => clearTimeout(t);
  }, [filters, activeColors]);

  const toggleColor = (c: string) => {
    setActiveColors((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setActiveColors(new Set());
  };

  return { filters, setFilters, debouncedFilters, activeColors, toggleColor, clearAll, page, setPage };
}
