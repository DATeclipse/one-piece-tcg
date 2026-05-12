import { useEffect, useState } from "react";
import { getDeck } from "../api/client";
import CardGrid from "../components/CardGrid";
import DeckList from "../components/DeckList";
import DeckPanel from "../components/DeckPanel";
import MobileDeckSheet from "../components/MobileDeckSheet";
import SearchFilters from "../components/SearchFilters";
import { useDeckState } from "../context/DeckContext";
import { useCardSearch, useLeaderCardSearch } from "../hooks/useCards";
import { useCollectionCounts } from "../hooks/useCollection";
import { useCreateDeck, useUpdateDeck, useValidateDeck } from "../hooks/useDecks";
import type { Card, SearchFilters as Filters } from "../types";

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

  const { leader, setLeader, deckCards, setDeckCards, deckName, setDeckName, deckId, setDeckId, validation, setValidation } = useDeckState();
  const [error, setError] = useState("");
  const [loadingDeck, setLoadingDeck] = useState(false);

  const leaderFilters = { ...debouncedFilters, card_type: "Leader" };
  const { data: leaderResults, isLoading: leadersLoading } = useCardSearch(leaderFilters, page, !leader);
  const { typeResults, colorResults, isLoading: sectionsLoading } = useLeaderCardSearch(leader, debouncedFilters, page);
  const isLoading = leader ? sectionsLoading : leadersLoading;
  const createMutation = useCreateDeck();
  const updateMutation = useUpdateDeck();
  const validateMutation = useValidateDeck();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 150);
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
      const total = Array.from(prev.values()).reduce((sum, e) => sum + e.quantity, 0);
      if (total >= 50) return prev;
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
      const existing = prev.get(cardSetId);
      if (!existing) return prev;
      if (delta > 0) {
        const total = Array.from(prev.values()).reduce((sum, e) => sum + e.quantity, 0);
        if (total >= 50) return prev;
      }
      const next = new Map(prev);
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

  const { data: collectionData = {} } = useCollectionCounts();
  const deckCounts = new Map<string, number>();
  deckCards.forEach((v, k) => deckCounts.set(k, v.quantity));
  const collectionCounts = new Map<string, number>(Object.entries(collectionData));

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
      <div className="builder-grid pb-20 md:pb-0">
        <div className="min-w-0">
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            leaderColors={leader?.card_color}
            leaderSelected={!!leader}
          />
          {!leader && (
            <div className="text-accent text-sm mb-2">Select a Leader to start building your deck</div>
          )}
          {isLoading && <div className="text-muted-dim">Loading...</div>}
          {!leader ? (
            <CardGrid
              cards={leaderResults?.items ?? []}
              onCardClick={handleCardClick}
              deckCounts={deckCounts}
              collectionCounts={collectionCounts}
              total={leaderResults?.total ?? 0}
              page={page}
              pageSize={leaderResults?.page_size ?? 50}
              onPageChange={setPage}
            />
          ) : (
            <>
              <h4 className="text-accent text-2xl font-bold mt-4 mb-2 font-serif tracking-wide">
                Cards by Type — {leader.types?.[0] ?? "Unknown"} ({typeResults?.total ?? 0})
              </h4>
              <CardGrid
                cards={typeResults?.items ?? []}
                onCardClick={handleCardClick}
                deckCounts={deckCounts}
                collectionCounts={collectionCounts}
                total={0}
                page={1}
                pageSize={100}
                onPageChange={() => {}}
              />
              <h4 className="text-accent text-2xl font-bold mt-6 mb-2 font-serif tracking-wide">
                Cards by Color — {leader.card_color.join("/")} ({colorResults?.total ?? 0})
              </h4>
              <CardGrid
                cards={colorResults?.items ?? []}
                onCardClick={handleCardClick}
                deckCounts={deckCounts}
                collectionCounts={collectionCounts}
                total={colorResults?.total ?? 0}
                page={page}
                pageSize={colorResults?.page_size ?? 50}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        <div className="hidden md:block">
          <div className="flex justify-end mb-2">
            <button onClick={handleNewDeck} style={{ fontSize: 12 }}>
              New Deck
            </button>
          </div>
          <DeckPanel
            leader={leader}
            entries={Array.from(deckCards.values())}
            onRemoveLeader={() => {
              setLeader(null);
              setValidation(null);
              setFilters((f) => ({ ...f, card_type: "" }));
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
      <MobileDeckSheet
        leader={leader}
        entries={Array.from(deckCards.values())}
        onRemoveLeader={() => {
          setLeader(null);
          setValidation(null);
          setFilters((f) => ({ ...f, card_type: "" }));
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
  );
}
