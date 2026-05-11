import { useCollectionCounts } from "../hooks/useCollection";
import type { Card } from "../types";

interface DeckEntry {
  card: Card;
  quantity: number;
}

interface Props {
  leader: Card | null;
  entries: DeckEntry[];
  onRemoveLeader: () => void;
  onChangeQuantity: (cardSetId: string, delta: number) => void;
  onSave: () => void;
  onValidate: () => void;
  deckName: string;
  onDeckNameChange: (name: string) => void;
  validation: { valid: boolean; errors: string[]; warnings: string[] } | null;
  saving: boolean;
}

export default function DeckPanel({
  leader,
  entries,
  onRemoveLeader,
  onChangeQuantity,
  onSave,
  onValidate,
  deckName,
  onDeckNameChange,
  validation,
  saving,
}: Props) {
  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  const { data: counts = {} } = useCollectionCounts();

  const totalMissing = entries.reduce((sum, e) => {
    const owned = counts[e.card.card_set_id] ?? 0;
    return sum + Math.max(0, e.quantity - owned);
  }, 0);

  return (
    <div className="bg-panel rounded-lg p-4 flex flex-col gap-3 md:max-h-[calc(100vh-6rem)] overflow-auto">
      <h3 className="m-0 text-accent">Deck</h3>

      <input
        type="text"
        placeholder="Deck name..."
        value={deckName}
        onChange={(e) => onDeckNameChange(e.target.value)}
        className="p-1.5 w-full"
      />

      <div className="border-b border-border pb-2">
        <div className="text-[0.8rem] text-muted mb-1">Leader</div>
        {leader ? (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-light text-[0.85rem]">{leader.card_name}</div>
              <div className="text-muted-dim text-[0.7rem]">
                {leader.card_color.join("/")} | Life: {leader.life}
              </div>
              {leader.types?.length > 0 && (
                <div className="text-muted-dim text-[0.7rem]">
                  {leader.types.join(", ")}
                </div>
              )}
            </div>
            <button onClick={onRemoveLeader} className="text-[0.7rem]">
              Remove
            </button>
          </div>
        ) : (
          <div className="text-muted-darker text-[0.8rem]">Click a Leader card to select</div>
        )}
      </div>

      <div className={`text-[0.85rem] ${totalCards === 50 ? "text-valid" : "text-warning"}`}>
        Cards: {totalCards}/50
      </div>

      <div className="text-muted-dim text-[0.7rem]">10 DON!! cards auto-included</div>

      <div className="flex-1 overflow-auto">
        {entries.map((entry) => {
          const owned = counts[entry.card.card_set_id] ?? 0;
          const need = Math.max(0, entry.quantity - owned);
          return (
            <div
              key={entry.card.card_set_id}
              className="flex justify-between items-center py-1 border-b border-border-subtle"
            >
              <div className="flex-1 min-w-0">
                <div className="text-light-dim text-[0.75rem] whitespace-nowrap overflow-hidden text-ellipsis">
                  {entry.card.card_name}
                </div>
                <div className="text-muted-dark text-[0.65rem]">
                  {entry.card.card_type} | Cost: {entry.card.card_cost ?? "-"}
                  <span className={`ml-1 ${need > 0 ? "text-warning" : "text-valid"}`}>
                    Own {owned}/{entry.quantity}
                  </span>
                  {need > 0 && (
                    <span className="text-warning ml-1">— Need {need}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onChangeQuantity(entry.card.card_set_id, -1)}
                  className="px-1.5 py-0 text-[0.8rem]"
                >
                  -
                </button>
                <span className="text-light text-[0.85rem] min-w-4 text-center">
                  {entry.quantity}
                </span>
                <button
                  onClick={() => onChangeQuantity(entry.card.card_set_id, 1)}
                  className="px-1.5 py-0 text-[0.8rem]"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > 0 && (
        <div className={`text-[0.75rem] ${totalMissing > 0 ? "text-warning" : "text-valid"}`}>
          {totalMissing > 0 ? `Missing ${totalMissing} cards from collection` : "All cards owned"}
        </div>
      )}

      {validation && (
        <div className={`rounded p-2 text-[0.75rem] ${validation.valid ? "bg-valid-bg" : "bg-error-bg"}`}>
          {validation.valid ? (
            <div className="text-valid">Deck is valid!</div>
          ) : (
            validation.errors.map((err, i) => (
              <div key={i} className="text-error-text">{err}</div>
            ))
          )}
          {validation.warnings.map((w, i) => (
            <div key={i} className="text-warning-text">{w}</div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onValidate} className="flex-1">
          Validate
        </button>
        <button onClick={onSave} disabled={saving || !leader || !deckName} className="flex-1">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
