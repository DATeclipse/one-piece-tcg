# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (FastAPI)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload          # runs on :8000
```
On first startup, if the cards table is empty, it auto-syncs from the local JSON seed file (`backend/data/cards.json`). Manual sync: `POST /api/sync`. To regenerate the seed file from the current DB: `python export_cards.py`.

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev                        # runs on :5173 (or next available port)
npm run build                      # tsc -b && vite build
npm run lint                       # eslint
npx tsc --noEmit                   # type-check without emitting
```
Vite proxies `/api` and `/static` to `localhost:8000` — both servers must be running for full functionality.

## Architecture

Two-tier app: React SPA talks to FastAPI backend over REST. SQLite database, no auth.

### Backend (`backend/`)
- **main.py** — FastAPI app, CORS, startup card sync, static file mount
- **models.py** — SQLAlchemy ORM: `Card`, `Deck`, `DeckCard` with enums `CardType`, `Rarity`, `DataSource`
- **sync.py** — Loads card data from local JSON seed (`data/cards.json`), upserts into SQLite by `card_set_id`
- **export_cards.py** — One-time script to dump all DB cards to `data/cards.json` seed file
- **ocr.py** — Utility for mapping `card_set_id` to local card PNG paths in `cards/` directory
- **validation.py** — Deck rule enforcement. Parses Leader "Under the rules of this game" text for cost/type restrictions and DON!! deck size overrides
- **routers/** — `cards.py` (search/filter/paginate), `decks.py` (CRUD + validate), `sync.py` (manual trigger)
- **rules/** — Structured game rules extracted from official Comprehensive Rules v1.2.0 (deck construction, keywords, game flow). Referenced by validation, not currently served via API.

### Frontend (`frontend/src/`)
- **Tailwind CSS v4** — zero inline styles. Theme tokens defined via `@theme` in `index.css`, global element styles in `@layer base`. No `tailwind.config.js` — uses `@tailwindcss/vite` plugin.
- **React Query v5** — all server state managed through hooks in `hooks/useCards.ts` and `hooks/useDecks.ts`. Mutations invalidate `["decks"]` cache key. `api/client.ts` is a thin fetch wrapper called by the hooks.
- **Pages**: `DeckBuilder.tsx` (main page — card search + deck editing), `MetaStrategy.tsx` (placeholder)
- **DeckBuilder state**: Local useState for UI state (filters, leader, deckCards map, deckName, deckId, validation). Server state (card search results, deck list, save/delete) handled by React Query. Debounced search: `filters` → 300ms timeout → `debouncedFilters` → `useCardSearch` with `keepPreviousData`.

## Key Patterns

- **Card identity**: `card_set_id` (e.g., "OP01-077") is the unique key across the entire stack — DB, API, and frontend Map keys
- **Color matching**: Cards in a deck must share at least one color with the Leader. `card_color` is stored as a JSON array (e.g., `["Blue", "Purple"]`) to support multi-color cards
- **Leader overrides**: Some Leaders modify deck construction rules via card text. `validation.py:parse_leader_overrides()` extracts these with regex. Known patterns: max cost, max event cost, DON!! deck size
- **Deck structure**: Leader (1) + deck cards (exactly 50, max 4 copies each) + DON!! (10, auto-included, not user-managed)
- **Dynamic border colors**: `CardItem.tsx` uses `COLOR_CLASS_MAP` mapping color names to Tailwind border classes (e.g., `"Red"` → `"border-card-red"`). The theme tokens must exist in `index.css` `@theme` for these to work.
- **Data verification**: Card model has `verified` (bool) and `data_source` (enum) fields. Use `/ocr-verify` skill to cross-reference card images against DB records and mark cards as verified.
- **Local card images**: 4,372 PNGs in `cards/` organized by set (e.g., `cards/OP-01/OP01-001.png`). `_p1.png` variants are alternate art.

## API

All endpoints prefixed with `/api`. Card search supports query params: `name`, `color`, `card_type`, `cost_min`, `cost_max`, `set_id`, `page`, `page_size`. Deck validation available at `POST /api/decks/validate` (same payload as create/update).
