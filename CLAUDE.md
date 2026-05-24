# CLAUDE.md

## Commands

```bash
# Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload                    # :8000

# Frontend (requires Node 23 — see .nvmrc)
cd frontend && npm run dev                   # :5173, proxies /api + /static to :8000
npm run build                                # tsc -b && vite build
npx tsc --noEmit                             # type-check
```

Auto-syncs cards from `backend/data/cards.json` on empty DB. Re-export seed: `python export_cards.py`.

## Core Rules

- **Card identity**: `card_set_id` (e.g. `OP01-077`, `OP01-077_p2`) is the unique key across DB, API, and frontend
- **Deck structure**: Leader (1) + deck cards (exactly 50, max 4 copies) + DON!! (10, auto-included)
- **Color matching**: deck cards must share ≥1 color with Leader. `card_color` is JSON array
- **Variant cards**: `_p\d+` suffix = separate printing (may differ in rarity). `_r\d+` = alt art tracked in `alt_images`

## Skills

Always invoke at the start of every conversation:
- `/caveman` — terse, substance-only responses
- `/grill-with-docs` — interview-driven design with domain doc maintenance

## Gotchas

- SQLite DB at `backend/one_piece_tcg.db` — no migrations, uses `create_all()`
- `backend/data/cards.json` seed is ~2MB — don't cat it, query DB instead
- Both servers must run for full functionality (backend :8000 + frontend :5173)

## DB State

- 4,013 cards (2,505 base + 1,508 `_p` variants)
- Rarities: C(1286) UC(626) R(865) SR(615) SEC(120) L(289) P(125) PR(75) SP(4) TR(8)
- 328 cards have `alt_images` (`_r` variants)
- Card images in `cards/` as WebP by set dir (e.g. `cards/OP-01/`, `cards/Promotion_card/`)
- `_p` variant images may live in different set directories than their base card

## Deployment

Production: `one-piece-tcg.fly.dev` on Fly.io free tier. Deploy with `fly deploy`.
Upload local DB: see `DEPLOYMENT.md` for full instructions.

## Reference

See `ARCHITECTURE.md` for file map, patterns, API endpoints, and tech stack details.
See `DEPLOYMENT.md` for Fly.io deployment, DB management, and troubleshooting.
