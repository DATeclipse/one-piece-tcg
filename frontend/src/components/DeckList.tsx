import { useDeckList, useDeleteDeck } from "../hooks/useDecks";

interface Props {
  onLoad: (deckId: number) => void;
}

export default function DeckList({ onLoad }: Props) {
  const { data: decks = [], isLoading, error } = useDeckList();
  const deleteMutation = useDeleteDeck();

  if (isLoading) return <div className="text-muted-dim mb-4">Loading decks...</div>;
  if (error) return <div className="text-error-text mb-4">Error: {(error as Error).message}</div>;
  if (decks.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-accent m-0 mb-2">Saved Decks</h4>
      <div className="flex gap-2 flex-wrap">
        {decks.map((d) => (
          <div
            key={d.id}
            className="bg-panel rounded-md px-3 py-2 flex items-center gap-3"
          >
            <div>
              <div className="text-light text-[0.85rem] font-bold">{d.name}</div>
              <div className="text-muted-dim text-[0.7rem]">
                {d.leader_name} | {d.card_count}/50
              </div>
            </div>
            <button onClick={() => onLoad(d.id)} className="text-[0.7rem]">
              Load
            </button>
            <button
              onClick={() => deleteMutation.mutate(d.id)}
              disabled={deleteMutation.isPending}
              className="text-[0.7rem]"
            >
              {deleteMutation.isPending ? "..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
