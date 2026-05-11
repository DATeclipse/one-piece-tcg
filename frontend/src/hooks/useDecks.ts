import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDeck, deleteDeck, getDeck, listDecks, updateDeck, validateDeck } from "../api/client";

export function useDeck(id: number | null) {
  return useQuery({
    queryKey: ["deck", id],
    queryFn: () => getDeck(id!),
    enabled: id !== null,
  });
}

export function useDeckList() {
  return useQuery({
    queryKey: ["decks"],
    queryFn: listDecks,
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDeck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}

export function useUpdateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateDeck>[1] }) =>
      updateDeck(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}

export function useValidateDeck() {
  return useMutation({ mutationFn: validateDeck });
}
