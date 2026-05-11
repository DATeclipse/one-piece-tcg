# One Piece TCG Deck Builder

A web app for building and validating One Piece Trading Card Game decks. Browse 2,400+ cards, build decks with rule enforcement, and save/load your creations.

## Features

- **Card Search** — Filter by name, color, type, cost range, and set with paginated results
- **Deck Builder** — Select a Leader, add cards with quantity controls, auto-filter by Leader colors
- **Rule Validation** — Enforces official deck construction rules (50 cards, 4-copy max, color matching, Leader-specific restrictions)
- **Save/Load** — Persist decks to SQLite, load and edit saved decks
- **4,372 Card Images** — Local PNGs organized by set with color-coded borders

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload          # http://localhost:8000
```

On first startup, the database auto-populates from `data/cards.json` (2,422 cards).

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Both servers must be running — Vite proxies `/api` and `/static` to the backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Query v5 |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| Card Data | Local JSON seed (no external API dependency) |

## Deck Rules

Based on the [Official Comprehensive Rules v1.2.0](rules/rule_comprehensive.pdf):

- 1 Leader card + exactly 50 deck cards + 10 DON!! cards (auto-included)
- Maximum 4 copies of any card
- All deck cards must share at least one color with the Leader
- Some Leaders have special restrictions parsed from card text (e.g., cost limits, DON!! deck size changes)

## API

All endpoints under `/api`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cards` | GET | Search/filter cards (params: name, color, card_type, cost_min, cost_max, set_id, page) |
| `/api/cards/leaders` | GET | List all Leader cards |
| `/api/cards/colors` | GET | List unique colors |
| `/api/cards/sets` | GET | List all sets |
| `/api/decks` | GET/POST | List or create decks |
| `/api/decks/{id}` | GET/PUT/DELETE | Get, update, or delete a deck |
| `/api/decks/validate` | POST | Validate deck against rules |

## Project Structure

```
one-piece-tcg/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy ORM (Card, Deck, DeckCard)
│   ├── sync.py              # JSON seed → SQLite loader
│   ├── validation.py        # Deck rule enforcement
│   ├── data/cards.json      # Card data seed (2,422 cards)
│   └── routers/             # API route handlers
├── frontend/src/
│   ├── pages/DeckBuilder.tsx # Main deck building page
│   ├── components/          # CardGrid, DeckPanel, SearchFilters, etc.
│   ├── hooks/               # React Query hooks (useCards, useDecks)
│   └── api/client.ts        # Fetch wrapper
├── cards/                   # 4,372 card PNGs by set
└── rules/                   # Official rule PDFs
```

## License

This project is for personal/educational use. One Piece TCG is a product of Bandai.
