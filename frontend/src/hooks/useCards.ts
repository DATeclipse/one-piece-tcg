import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getColors, getSets, searchCards } from "../api/client";
import type { SearchFilters } from "../types";

export function useCardSearch(filters: SearchFilters, page: number) {
  return useQuery({
    queryKey: ["cards", filters, page],
    queryFn: () => searchCards(filters, page),
    placeholderData: keepPreviousData,
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
