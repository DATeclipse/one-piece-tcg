# Architecture

Two-tier app: React SPA → FastAPI REST API → SQLite. No auth. Single-user personal tool.

## Production Architecture

```
Browser (desktop/mobile)
    ↓ HTTPS
one-piece-tcg.fly.dev
    ↓
┌─────────────────────────────────┐
│  Fly.io VM (shared-cpu, 1GB)    │
│  Region: lhr (London)           │
│                                 │
│  uvicorn (FastAPI)              │
│  ├── /api/*        → routers    │
│  ├── /assets/*     → React SPA  │
│  ├── /static/cards → card imgs  │
│  └── /*            → index.html │
│                                 │
│  /data/ (persistent volume)     │
│  └── one_piece_tcg.db (SQLite)  │
│                                 │
│  /app/cards/ (baked into image) │
│  └── 4,372 WebP card images     │
└─────────────────────────────────┘
```

- **Auto-sleep**: Machine stops when idle, starts on first request (~2-3s cold start)
- **Persistent volume**: SQLite DB survives restarts and redeploys
- **Card images**: Baked into Docker image (~440MB WebP), not on the volume
- **SPA routing**: FastAPI serves `index.html` for all non-API, non-static paths

## Local Development Architecture

```
Browser
    ↓
Vite dev server (:5173)
├── React HMR
├── /api/*     → proxy to :8000
└── /static/*  → proxy to :8000
    ↓
FastAPI (:8000)
├── REST API
├── /static/cards → local cards/ dir
└── SQLite: backend/one_piece_tcg.db
```

## Backend (`backend/`)

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, startup sync, static mounts, SPA serving |
| `config.py` | Paths + `DB_PATH` env var for production volume |
| `database.py` | SQLAlchemy engine + session factory |
| `models.py` | ORM: `Card`, `Deck`, `DeckCard`, `MetaDeck`, `Collection`. Enums: `CardType`, `Rarity`, `DataSource` |
| `schemas.py` | Pydantic response/request models |
| `sync.py` | Upserts card data from `data/cards.json` by `card_set_id` |
| `validation.py` | Deck rules. `parse_leader_overrides()` extracts cost/type restrictions from Leader card text |
| `export_cards.py` | Dumps DB → `data/cards.json` seed |
| `map_alt_art.py` | Maps `_r\d+` variant images to `alt_images` JSON field |
| `import_variants.py` | Imports `_p\d+` variant images as separate Card rows |
| `ocr.py` | Maps `card_set_id` → local card WebP path (scans all set directories) |

### Routers (`backend/routers/`)
- `cards.py` — search/filter/paginate. Params: `name`, `color`, `card_type`, `cost_min/max`, `set_id`, `rarity`, `search`, `page`, `page_size`
- `decks.py` — CRUD + validate (`POST /api/decks/validate`)
- `collections.py` — per-card owned quantity
- `meta.py` — tournament meta decks
- `sync.py` — manual `POST /api/sync`

All endpoints prefixed `/api`.

## Frontend (`frontend/src/`)

**Stack**: React 19, Vite 8, TypeScript 6, Tailwind CSS v4, React Query v5

### Pages
| Page | Description |
|------|-------------|
| `CardSearch.tsx` | Card library with search, filters, alt art expansion, keyboard nav in modal |
| `DeckBuilder.tsx` | Card search + deck editing panel (`.builder-grid` layout) |
| `DeckView.tsx` | Two-column deck browser with type-grouped cards |
| `CollectionPage.tsx` | Collection tracker with inline +/− controls |
| `MetaStrategy.tsx` | Deck comparison with mana curve + stat tiles |
| `TournamentMeta.tsx` | Tournament results with leader popularity |
| `DevTagger.tsx` | Dev tool for tagging card rarity/art style |

### Components
- `Layout.tsx` — App shell with responsive nav (hamburger menu on mobile)
- `CardItem.tsx` — Card display with color glow, badges (rarity, collection, deck, ALT)
- `CardDetailModal.tsx` — Full card detail with collection controls, keyboard nav (←/→ cards, ↑/↓ collection count)
- `CardSearchBar.tsx` — Shared search/filter bar (name, color, type, set, rarity)
- `CardGrid.tsx` — Responsive grid wrapper with pagination
- `DeckPanel.tsx` — Deck sidebar with mini-list, mana curve, color swatches
- `MobileDeckSheet.tsx` — Mobile deck panel for DeckBuilder
- `ManaCurve.tsx` — Shared cost distribution chart

### Shared Code
- `constants/colors.ts` — Canonical `CARD_COLORS` map with hex + glow values
- `hooks/useCardFilters.ts` — Shared filter/debounce/toggle/pagination state
- `hooks/useCards.ts` — `useCardSearch`, `useSets`, `useLeaderCardSearch`
- `hooks/useDecks.ts` — Deck CRUD mutations + validation
- `hooks/useCollection.ts` — `useCollectionCounts`, `useCollectionCountsMap`, `useUpdateCollection`
- `hooks/useMeta.ts` — Meta deck hooks
- `context/DeckContext.tsx` — Deck builder state (leader, cards, name, validation)

### Styling
- Tailwind v4 via `@tailwindcss/vite` plugin (no config file)
- Theme tokens in `index.css` `@theme` block (CSS variables for colors, fonts)
- Layout classes use `@apply` directives
- Complex visual CSS kept raw: pseudo-elements, animations, gradients, `color-mix()`

## Card Images

- **Format**: WebP (converted from PNG, ~71% size reduction)
- **Location**: `cards/` organized by set directory (e.g. `cards/OP-01/`, `cards/ST-15/`)
- **Naming**: `{card_set_id}.webp` (e.g. `OP01-001.webp`, `OP01-001_p1.webp`)
- **Special directories**: `Promotion_card/`, `Other_Product_Card/`, hybrid dirs like `OP14-EB04/`
- **Note**: `_p` variant images may live in different set directories than their base card
- **Total**: 4,372 files, ~440MB

## Key Patterns

- **Leader overrides**: `validation.py:parse_leader_overrides()` regex extracts cost caps, type restrictions, DON!! size from Leader card text
- **Dynamic borders**: `CardItem.tsx` sets `--card-color` CSS var from `colorHex(card.card_color[0])`
- **Data verification**: Card model has `verified` bool + `data_source` enum
- **Debounced search**: `filters` → 150ms timeout → `debouncedFilters` → `useCardSearch`
- **Auto-seed**: Empty DB auto-imports from `data/cards.json` on startup
- **SPA serving**: In production, FastAPI serves built frontend; in dev, Vite proxies API calls
