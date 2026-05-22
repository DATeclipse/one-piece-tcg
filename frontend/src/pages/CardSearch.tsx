import { useCallback, useMemo, useState } from "react";
import CardDetailModal from "../components/CardDetailModal";
import CardItem from "../components/CardItem";
import CardSearchBar from "../components/CardSearchBar";
import { useCardSearch, useSets } from "../hooks/useCards";
import { useCardFilters } from "../hooks/useCardFilters";
import { useCollectionCountsMap } from "../hooks/useCollection";
import type { Card } from "../types";

function rarityClass(r: string) {
  const key = r.toLowerCase();
  const map: Record<string, string> = {
    c: "r-c", uc: "r-uc", r: "r-r", sr: "r-sr", sec: "r-sec",
    l: "r-l", sp: "r-sp", spr: "r-spr", p: "r-p", tr: "r-tr",
  };
  return map[key] ?? "r-c";
}

function isRareOrAbove(r: string) {
  return ["R", "SR", "SEC", "L", "SP", "SPR", "TR"].includes(r);
}

export default function CardSearch() {
  const { filters, setFilters, debouncedFilters, activeColors, toggleColor, clearAll, page, setPage } = useCardFilters();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data } = useCardSearch(debouncedFilters, page);
  const { data: collectionCounts } = useCollectionCountsMap();
  const { data: sets = [] } = useSets();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.page_size ?? 20));

  const displayItems = useMemo(() =>
    items.flatMap(card => {
      const base = [{ card, altIndex: 0 }];
      return base.concat(
        (card.alt_images ?? []).map((img, i) => ({
          card: { ...card, card_image: img },
          altIndex: i + 1,
        }))
      );
    }),
    [items],
  );

  const rareCount = useMemo(() => items.filter(c => isRareOrAbove(c.rarity)).length, [items]);

  const selectedCard = selectedIndex !== null ? displayItems[selectedIndex]?.card ?? null : null;
  const onPrev = useCallback(() => setSelectedIndex(i => i !== null && i > 0 ? i - 1 : i), []);
  const onNext = useCallback(() => setSelectedIndex(i => i !== null && i < displayItems.length - 1 ? i + 1 : i), [displayItems.length]);
  const onClose = useCallback(() => setSelectedIndex(null), []);

  return (
    <div>
      <div className="cs-hero">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.12em", color: "var(--color-accent)" }}>
          ★ CARD LIBRARY ★
        </div>
        <div className="cs-counter">{total.toLocaleString()}</div>
        <div style={{ color: "var(--color-muted)", fontSize: 14 }}>
          of {total.toLocaleString()} cards · {rareCount} rare or above
        </div>

        <CardSearchBar
          filters={filters}
          onFiltersChange={setFilters}
          activeColors={activeColors}
          onToggleColor={toggleColor}
          onClear={clearAll}
          sets={sets}
        />
      </div>

      {/* Card Grid */}
      {items.length > 0 ? (
        <div className="cs-grid">
          {displayItems.map(({ card, altIndex }, i) => (
            <div
              key={`${card.card_set_id}_${altIndex}`}
              className="cs-card-wrap"
              style={{ animationDelay: `${Math.min(i, 30) * 25}ms` }}
            >
              {isRareOrAbove(card.rarity) && (
                <span className={`rarity-tag ${rarityClass(card.rarity)}`}>
                  {card.rarity}
                </span>
              )}
              <CardItem
                card={card}
                onClick={() => setSelectedIndex(i)}
                collectionCount={collectionCounts.get(card.card_set_id)}
                isAltArt={altIndex > 0}
              />
            </div>
          ))}
        </div>
      ) : data ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48 }}>🏴‍☠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-muted)", marginTop: 12 }}>
            NO CARDS FOUND
          </div>
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ color: "var(--color-muted)", lineHeight: "36px", fontSize: 14 }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={onClose}
          onPrev={selectedIndex! > 0 ? onPrev : undefined}
          onNext={selectedIndex! < displayItems.length - 1 ? onNext : undefined}
        />
      )}
    </div>
  );
}
