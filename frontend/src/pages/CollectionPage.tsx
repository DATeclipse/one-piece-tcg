import { useMemo, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import { useFullCollection } from "../hooks/useCollection";
import type { Card } from "../types";

export default function CollectionPage() {
  const { data: collection = [], isLoading } = useFullCollection();
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return collection.filter((item) => {
      if (q && !item.card.card_name.toLowerCase().includes(q) && !item.card.types.some((t) => t.toLowerCase().includes(q))) return false;
      if (colorFilter && !item.card.card_color.includes(colorFilter)) return false;
      if (typeFilter && item.card.card_type !== typeFilter) return false;
      return true;
    });
  }, [collection, search, colorFilter, typeFilter]);

  const totalUnique = collection.length;
  const totalCopies = collection.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <h2 className="text-accent text-2xl font-bold font-serif mb-3">My Collection</h2>
      <div className="text-light-muted text-sm mb-3">
        {totalUnique} unique cards &middot; {totalCopies} total copies
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-1.5 w-full md:w-auto md:min-w-[200px]"
        />
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
          <option value="">All Colors</option>
          {["Red", "Blue", "Green", "Purple", "Black", "Yellow"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {["Leader", "Character", "Event", "Stage"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {isLoading && <div className="text-muted-dim">Loading collection...</div>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 md:gap-3">
        {filtered.map((item) => (
          <div key={item.card.card_set_id} className="relative">
            <CardItem
              card={item.card}
              onClick={() => setSelectedCard(item.card)}
            />
            <div className="absolute top-1 right-1 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
              {item.quantity}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-muted-dim py-8">
          {collection.length === 0 ? "No cards in collection yet. Add cards from Card Search or Deck Builder." : "No cards match filters."}
        </div>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
