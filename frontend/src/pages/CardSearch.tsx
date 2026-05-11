import { useEffect, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardGrid from "../components/CardGrid";
import SearchFiltersComponent from "../components/SearchFilters";
import { useCardSearch } from "../hooks/useCards";
import { useCollectionCounts } from "../hooks/useCollection";
import type { Card, SearchFilters } from "../types";

const EMPTY_FILTERS: SearchFilters = {
  name: "",
  color: "",
  card_type: "",
  cost_min: "",
  cost_max: "",
  set_id: "",
  rarity: "",
  types_contains: "",
};

export default function CardSearch() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters({ ...filters, search: filters.name, name: "", types_contains: "" });
      setPage(1);
    }, 150);
    return () => clearTimeout(t);
  }, [filters]);

  const { data } = useCardSearch(debouncedFilters, page);
  const { data: collectionData = {} } = useCollectionCounts();
  const ownedCounts = new Map<string, number>(Object.entries(collectionData));

  return (
    <div>
      <SearchFiltersComponent filters={filters} onChange={setFilters} />

      {data && (
        <CardGrid
          cards={data.items}
          onCardClick={setSelectedCard}
          deckCounts={new Map()}
          collectionCounts={ownedCounts}
          total={data.total}
          page={data.page}
          pageSize={data.page_size}
          onPageChange={setPage}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
