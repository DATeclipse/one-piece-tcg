# Architecture

Two-tier app: React SPA → FastAPI REST API → SQLite. No auth.

## Backend (`backend/`)

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, startup sync, static mount |
| `models.py` | SQLAlchemy ORM: `Card`, `Deck`, `DeckCard`, `MetaDeck`, `Collection`. Enums: `CardType`, `Rarity`, `DataSource` |
| `schemas.py` | Pydantic response/request models |
| `sync.py` | Upserts card data from `data/cards.json` by `card_set_id` |
| `validation.py` | Deck rules. `parse_leader_overrides()` extracts cost/type restrictions from Leader card text |
| `export_cards.py` | Dumps DB → `data/cards.json` seed |
| `map_alt_art.py` | Maps `_r\d+` variant images to `alt_images` JSON field |
| `import_variants.py` | Imports `_p\d+` variant images as separate Card rows |
| `ocr.py` | Maps `card_set_id` → local card PNG path |

### Routers (`backend/routers/`)
- `cards.py` — search/filter/paginate. Params: `name`, `color`, `card_type`, `cost_min/max`, `set_id`, `rarity`, `search`, `page`, `page_size`
- `decks.py` — CRUD + validate (`POST /api/decks/validate`)
- `collections.py` — per-card owned quantity
- `meta.py` — tournament meta decks
- `sync.py` — manual `POST /api/sync`

All endpoints prefixed `/api`.

## Frontend (`frontend/src/`)

**Stack**: React 19, Vite 8, TypeScript, Tailwind CSS v4, React Query v5

### Pages
| Page | Description |
|------|-------------|
| `CardSearch.tsx` | Card library with search, color/type/rarity/set filters, alt art expansion |
| `DeckBuilder.tsx` | Card search + deck editing panel (`.builder-grid` layout) |
| `DeckView.tsx` | Two-column deck browser with type-grouped cards |
| `CollectionPage.tsx` | Collection tracker with inline +/− controls |
| `MetaStrategy.tsx` | Deck comparison with mana curve + stat tiles |
| `TournamentMeta.tsx` | Tournament results with leader popularity |

### Components
- `CardItem.tsx` — `.tcg` card with `COLOR_HEX` map, badges (rarity, collection, deck, ALT)
- `CardDetailModal.tsx` — Full card detail with collection controls
- `CardGrid.tsx` — Responsive grid wrapper
- `DeckPanel.tsx` — Deck sidebar with mini-list, mana curve, color swatches
- `ManaCurve.tsx` — Shared cost distribution chart

### Hooks
- `useCards.ts` — `useCardSearch`, `useSets`, `useLeaders`
- `useDecks.ts` — deck CRUD mutations
- `useCollection.ts` — `useCollectionCounts`, `useUpdateCollection`

### Styling
- Tailwind v4 via `@tailwindcss/vite` plugin (no config file)
- Theme tokens in `index.css` `@theme` block
- Custom CSS classes: `.tcg`, `.cs-hero`, `.col-hero`, `.builder-grid`, `.deck-layout`, `.tlist`

## Key Patterns

- **Leader overrides**: `validation.py:parse_leader_overrides()` regex extracts cost caps, type restrictions, DON!! size from Leader card text
- **Dynamic borders**: `CardItem.tsx` sets `--card-color` CSS var from `COLOR_HEX[card.card_color[0]]`
- **Data verification**: Card model has `verified` bool + `data_source` enum. `/ocr-verify` skill cross-references card images
- **Local images**: `cards/` dir organized by set. `_p\d+.png` = variant printings, `_r\d+.png` = alt art
- **Debounced search**: `filters` → 150ms timeout → `debouncedFilters` → `useCardSearch`
