import { useState } from "react";
import { useDeckList, useDeleteDeck } from "../hooks/useDecks";
import { useMetaDeckList } from "../hooks/useMeta";

interface Props {
  onLoad: (deckId: number) => void;
  onLoadMeta?: (metaDeckId: number) => void;
}

export default function DeckList({ onLoad, onLoadMeta }: Props) {
  const [tab, setTab] = useState<"my" | "meta">("my");
  const { data: decks = [], isLoading, error } = useDeckList();
  const { data: metaDecks = [], isLoading: metaLoading } = useMetaDeckList();
  const deleteMutation = useDeleteDeck();

  const hasContent = decks.length > 0 || metaDecks.length > 0;
  if (isLoading && metaLoading) return <div className="text-muted-dim mb-4">Loading decks...</div>;
  if (error) return <div className="text-error-text mb-4">Error: {(error as Error).message}</div>;
  if (!hasContent) return null;

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setTab("my")}
          style={{
            background: tab === "my" ? "var(--color-accent)" : "var(--color-card-bg)",
            color: tab === "my" ? "#fff" : "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          My Decks ({decks.length})
        </button>
        <button
          onClick={() => setTab("meta")}
          style={{
            background: tab === "meta" ? "var(--color-accent)" : "var(--color-card-bg)",
            color: tab === "meta" ? "#fff" : "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Meta Decks ({metaDecks.length})
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tab === "my" ? (
          decks.map((d) => (
            <div key={d.id} className="bg-panel rounded-md px-3 py-2 flex items-center gap-3">
              <div>
                <div className="text-light text-[0.85rem] font-bold">{d.name}</div>
                <div className="text-muted-dim text-[0.7rem]">
                  {d.leader_name} | {d.card_count}/50
                </div>
              </div>
              <button onClick={() => onLoad(d.id)} className="text-[0.7rem]">Load</button>
              <button
                onClick={() => deleteMutation.mutate(d.id)}
                disabled={deleteMutation.isPending}
                className="text-[0.7rem]"
              >
                {deleteMutation.isPending ? "..." : "Delete"}
              </button>
            </div>
          ))
        ) : (
          metaDecks.map((d) => (
            <div key={d.id} className="bg-panel rounded-md px-3 py-2 flex items-center gap-3">
              <div>
                <div className="text-light text-[0.85rem] font-bold">{d.name}</div>
                <div className="text-muted-dim text-[0.7rem]">
                  {d.leader_name}
                  {d.placing && ` · #${d.placing}`}
                  {d.player_name && ` · ${d.player_name}`}
                </div>
              </div>
              {onLoadMeta && (
                <button onClick={() => onLoadMeta(d.id)} className="text-[0.7rem]">Copy</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
