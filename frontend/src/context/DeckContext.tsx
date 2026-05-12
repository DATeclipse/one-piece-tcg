import { createContext, useContext, useState, type ReactNode } from "react";
import type { Card, ValidationResult } from "../types";

interface DeckEntry {
  card: Card;
  quantity: number;
}

interface DeckContextValue {
  leader: Card | null;
  setLeader: (leader: Card | null) => void;
  deckCards: Map<string, DeckEntry>;
  setDeckCards: React.Dispatch<React.SetStateAction<Map<string, DeckEntry>>>;
  deckName: string;
  setDeckName: (name: string) => void;
  deckId: number | null;
  setDeckId: (id: number | null) => void;
  validation: ValidationResult | null;
  setValidation: (v: ValidationResult | null) => void;
}

const DeckContext = createContext<DeckContextValue | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [leader, setLeader] = useState<Card | null>(null);
  const [deckCards, setDeckCards] = useState<Map<string, DeckEntry>>(new Map());
  const [deckName, setDeckName] = useState("");
  const [deckId, setDeckId] = useState<number | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  return (
    <DeckContext.Provider
      value={{
        leader,
        setLeader,
        deckCards,
        setDeckCards,
        deckName,
        setDeckName,
        deckId,
        setDeckId,
        validation,
        setValidation,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

export function useDeckState() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeckState must be used within DeckProvider");
  return ctx;
}
