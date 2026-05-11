import { useState } from "react";
import type { Card, ValidationResult } from "../types";
import DeckPanel from "./DeckPanel";

interface Props {
  leader: Card | null;
  entries: { card: Card; quantity: number }[];
  onRemoveLeader: () => void;
  onChangeQuantity: (cardSetId: string, delta: number) => void;
  onSave: () => void;
  onValidate: () => void;
  deckName: string;
  onDeckNameChange: (name: string) => void;
  validation: ValidationResult | null;
  saving: boolean;
}

export default function MobileDeckSheet({
  leader,
  entries,
  ...props
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <div className="md:hidden">
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-panel rounded-t-xl transition-transform duration-300 ${
          expanded ? "translate-y-0" : "translate-y-[calc(100%-64px)]"
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 flex items-center justify-center bg-transparent!"
        >
          <div className="w-10 h-1 bg-muted rounded-full" />
        </button>
        <div
          className="px-4 pb-2 flex justify-between items-center text-sm cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-light font-bold">
            {leader?.card_name ?? "No Leader"}
          </span>
          <span
            className={`font-bold ${totalCards === 50 ? "text-valid" : "text-warning"}`}
          >
            {totalCards}/50
          </span>
        </div>
        <div className="px-4 pb-4 max-h-[60vh] overflow-auto">
          <DeckPanel
            leader={leader}
            entries={entries}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}
