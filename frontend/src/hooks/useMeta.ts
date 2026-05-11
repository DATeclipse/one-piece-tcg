import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMetaDeck, getLeaderStats, getMetaDeck, getMetaTournaments, listMetaDecks, saveMetaDeck } from "../api/client";

export function useMetaTournaments(limit = 5) {
  return useQuery({
    queryKey: ["meta", "tournaments", limit],
    queryFn: () => getMetaTournaments(limit),
    staleTime: 5 * 60_000,
  });
}

export function useLeaderStats(count = 10) {
  return useQuery({
    queryKey: ["meta", "leaderStats", count],
    queryFn: () => getLeaderStats(count),
    staleTime: 5 * 60_000,
  });
}

export function useMetaDeckList() {
  return useQuery({
    queryKey: ["metaDecks"],
    queryFn: listMetaDecks,
  });
}

export function useMetaDeck(id: number | null) {
  return useQuery({
    queryKey: ["metaDeck", id],
    queryFn: () => getMetaDeck(id!),
    enabled: id !== null,
  });
}

export function useSaveMetaDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveMetaDeck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metaDecks"] }),
  });
}

export function useDeleteMetaDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMetaDeck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metaDecks"] }),
  });
}
