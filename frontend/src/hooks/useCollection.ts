import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCollectionCounts, getFullCollection, updateCollectionItem } from "../api/client";

export function useCollectionCounts() {
  return useQuery({
    queryKey: ["collection"],
    queryFn: getCollectionCounts,
    staleTime: 30_000,
  });
}

export function useFullCollection() {
  return useQuery({
    queryKey: ["collection", "full"],
    queryFn: getFullCollection,
    staleTime: 30_000,
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ card_set_id, quantity }: { card_set_id: string; quantity: number }) =>
      updateCollectionItem(card_set_id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collection"] }),
  });
}
