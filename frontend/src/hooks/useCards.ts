import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { getCard, getColors, getSets, searchCards, updateCard } from "../api/client";
import type { Card, SearchFilters } from "../types";
import { queryClient } from "../lib/queryClient";

export function useCardSearch(filters: SearchFilters, page: number, enabled = true) {
  return useQuery({
    queryKey: ["cards", filters, page],
    queryFn: () => searchCards(filters, page),
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 60_000,
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

export function useCardById(cardSetId: string) {
  return useQuery({
    queryKey: ["card", cardSetId],
    queryFn: () => getCard(cardSetId),
    staleTime: 60_000,
  });
}

export function useUpdateCard() {
  return useMutation({
    mutationFn: ({ cardSetId, updates }: { cardSetId: string; updates: { rarity?: string; art_style?: string } }) =>
      updateCard(cardSetId, updates),
    onSuccess: (card) => {
      queryClient.setQueryData(["card", card.card_set_id], card);
    },
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
        { ...filters, types_contains: leaderType, colors: leader!.card_color.join(","), exclude_type: "Leader", color: "" },
        1,
        100
      ),
    placeholderData: keepPreviousData,
    enabled: !!leader && !!leaderType,
    staleTime: 60_000,
  });

  const colorQuery = useQuery({
    queryKey: ["cards", "byColor", leader?.card_color, filters, colorPage],
    queryFn: () =>
      searchCards(
        { ...filters, colors: leader!.card_color.join(","), exclude_type: "Leader", color: "" },
        colorPage,
        50
      ),
    placeholderData: keepPreviousData,
    enabled: !!leader,
    staleTime: 60_000,
  });

  return { typeResults: typeQuery.data, colorResults: colorQuery.data, isLoading: typeQuery.isLoading || colorQuery.isLoading };
}
