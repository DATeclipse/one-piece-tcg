# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Local JSON seed file (`backend/data/cards.json`) — 2,422 cards exported from database
- `export_cards.py` script to regenerate seed file from current DB
- `ocr.py` utility for mapping `card_set_id` to local card PNG paths
- `/ocr-verify` Claude Code skill for cross-referencing card images against DB using vision
- `CLAUDE.md` for Claude Code context and development guidance

### Changed
- `sync.py` rewritten to load from local JSON instead of external API
- `config.py` — `CARDS_JSON_PATH` replaces `OPTCG_BASE_URL`

### Removed
- `httpx` dependency — no more external API calls to `optcgapi.com`

## [1.0.0] - 2026-05-11

### Added
- **Backend** (FastAPI + SQLAlchemy + SQLite)
  - Card database with OPTCG API sync (2,422 cards across 50 sets)
  - Card search/filter API with pagination (name, color, type, cost, set)
  - Deck CRUD with validation (Leader + 50 cards, 4-copy max, color matching)
  - Leader override parsing for deck construction rules ("Under the rules of this game" text)
  - Structured game rules module (deck construction, keywords, game flow)
  - 4,372 local card PNG images organized by set
- **Frontend** (React + Vite + TypeScript)
  - Deck builder page with card search, filters, and pagination
  - Deck panel with leader slot, card list, quantity controls
  - Deck save/load/delete with React Query v5 cache management
  - Deck validation with error/warning display
  - Tailwind CSS v4 with custom theme tokens (zero inline styles)
  - Dark theme with card-color-coded borders
  - Meta Strategy placeholder page
