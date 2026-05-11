import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getColors, getSets, searchCards } from "../api/client";
import type { Card, SearchFilters } from "../types";

export function useCardSearch(filters: SearchFilters, page: number, enabled = true) {
  return useQuery({
    queryKey: ["cards", filters, page],
    queryFn: () => searchCards(filters, page),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useColors() {
  return useQuery({
    queryKey: ["colors"],
    queryFn: getColors,
    staleTime: Infinity,
  });
}

export function useSets() {
  return useQuery({
    queryKey: ["sets"],
    queryFn: getSets,
    staleTime: Infinity,
  });
}

export function useLeaderCardSearch(
  leader: Card | null,
  filters: SearchFilters,
  colorPage: number
) {
  const leaderType = leader?.types?.[0] ?? "";

  const typeQuery = useQuery({
    queryKey: ["cards", "byType", leaderType, filters],
    queryFn: () =>
      searchCards(
        { ...filters, types_contains: leaderType, colors: leader!.card_color.join(","), exclude_type: "Leader", card_type: "", color: "" },
        1,
        100
      ),
    placeholderData: keepPreviousData,
    enabled: !!leader && !!leaderType,
  });

  const colorQuery = useQuery({
    queryKey: ["cards", "byColor", leader?.card_color, filters, colorPage],
    queryFn: () =>
      searchCards(
        { ...filters, colors: leader!.card_color.join(","), exclude_type: "Leader", card_type: "", color: "" },
        colorPage,
        50
      ),
    placeholderData: keepPreviousData,
    enabled: !!leader,
  });

  return { typeResults: typeQuery.data, colorResults: colorQuery.data, isLoading: typeQuery.isLoading || colorQuery.isLoading };
}
