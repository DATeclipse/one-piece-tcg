import { useEffect, useState } from "react";
import { getDeck } from "../api/client";
import CardGrid from "../components/CardGrid";
import DeckList from "../components/DeckList";
import DeckPanel from "../components/DeckPanel";
import SearchFilters from "../components/SearchFilters";
import { useCardSearch } from "../hooks/useCards";
import { useCreateDeck, useUpdateDeck, useValidateDeck } from "../hooks/useDecks";
import type { Card, SearchFilters as Filters, ValidationResult } from "../types";

const EMPTY_FILTERS: Filters = {
  name: "",
  color: "",
  card_type: "",
  cost_min: "",
  cost_max: "",
  set_id: "",
};

export default function DeckBuilder() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [leader, setLeader] = useState<Card | null>(null);
  const [deckCards, setDeckCards] = useState<Map<string, { card: Card; quantity: number }>>(
    new Map()
  );
  const [deckName, setDeckName] = useState("");
  const [deckId, setDeckId] = useState<number | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");
  const [loadingDeck, setLoadingDeck] = useState(false);

  const { data: results, isLoading } = useCardSearch(debouncedFilters, page);
  const createMutation = useCreateDeck();
  const updateMutation = useUpdateDeck();
  const validateMutation = useValidateDeck();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const handleCardClick = (card: Card) => {
    if (card.card_type === "Leader") {
      setLeader(card);
      setValidation(null);
      return;
    }
    if (!leader) return;

    setDeckCards((prev) => {
      const next = new Map(prev);
      const existing = next.get(card.card_set_id);
      if (existing) {
        if (existing.quantity < 4) {
          next.set(card.card_set_id, { ...existing, quantity: existing.quantity + 1 });
        }
      } else {
        next.set(card.card_set_id, { card, quantity: 1 });
      }
      return next;
    });
    setValidation(null);
  };

  const handleChangeQuantity = (cardSetId: string, delta: number) => {
    setDeckCards((prev) => {
      const next = new Map(prev);
      const existing = next.get(cardSetId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        next.delete(cardSetId);
      } else if (newQty <= 4) {
        next.set(cardSetId, { ...existing, quantity: newQty });
      }
      return next;
    });
    setValidation(null);
  };

  const deckCounts = new Map<string, number>();
  deckCards.forEach((v, k) => deckCounts.set(k, v.quantity));

  const getDeckPayload = () => ({
    name: deckName,
    leader_card_set_id: leader?.card_set_id || "",
    cards: Array.from(deckCards.values()).map((e) => ({
      card_set_id: e.card.card_set_id,
      quantity: e.quantity,
    })),
  });

  const handleValidate = async () => {
    if (!leader) return;
    setError("");
    try {
      const result = await validateMutation.mutateAsync(getDeckPayload());
      setValidation(result);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSave = async () => {
    if (!leader || !deckName) return;
    setError("");
    try {
      const payload = getDeckPayload();
      if (deckId) {
        await updateMutation.mutateAsync({ id: deckId, payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        setDeckId(created.id);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleLoad = async (id: number) => {
    setLoadingDeck(true);
    setError("");
    try {
      const deck = await getDeck(id);
      setDeckId(deck.id);
      setDeckName(deck.name);
      setLeader(deck.leader);
      const entries = new Map<string, { card: Card; quantity: number }>();
      deck.cards.forEach((dc) => {
        entries.set(dc.card.card_set_id, { card: dc.card, quantity: dc.quantity });
      });
      setDeckCards(entries);
      setValidation(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingDeck(false);
    }
  };

  const handleNewDeck = () => {
    setDeckId(null);
    setDeckName("");
    setLeader(null);
    setDeckCards(new Map());
    setValidation(null);
  };

  const saving = createMutation.isPending || updateMutation.isPending;
  const items = results?.items ?? [];
  const total = results?.total ?? 0;
  const pageSize = results?.page_size ?? 50;

  return (
    <div>
      {error && (
        <div className="bg-error-bg text-error-text px-4 py-2 rounded mb-3 flex justify-between items-center text-sm">
          <span>{error}</span>
          <button onClick={() => setError("")} className="bg-transparent! text-error-text text-base px-1">
            x
          </button>
        </div>
      )}
      <DeckList onLoad={handleLoad} />

      {loadingDeck && <div className="text-muted-dim mb-2">Loading deck...</div>}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            leaderColors={leader?.card_color}
          />
          {isLoading && <div className="text-muted-dim">Loading...</div>}
          <CardGrid
            cards={items}
            onCardClick={handleCardClick}
            deckCounts={deckCounts}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        <div className="w-80 shrink-0">
          <div className="flex justify-end mb-2">
            <button onClick={handleNewDeck} className="text-[0.75rem]">
              New Deck
            </button>
          </div>
          <DeckPanel
            leader={leader}
            entries={Array.from(deckCards.values())}
            onRemoveLeader={() => {
              setLeader(null);
              setValidation(null);
            }}
            onChangeQuantity={handleChangeQuantity}
            onSave={handleSave}
            onValidate={handleValidate}
            deckName={deckName}
            onDeckNameChange={setDeckName}
            validation={validation}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
