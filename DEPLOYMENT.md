# Deployment

Hosted on **Fly.io** free tier. Single Docker container serving both the FastAPI backend and React frontend.

## Prerequisites

- [flyctl](https://fly.io/docs/flyctl/install/) installed (`brew install flyctl`)
- Authenticated: `fly auth login`
- Node 23 (for building frontend)

## How It Works

The `Dockerfile` does a two-stage build:

1. **Stage 1 (Node)**: Installs frontend dependencies and builds the React app (`npm run build`)
2. **Stage 2 (Python)**: Installs backend dependencies, copies backend code, card images, and built frontend

In production, FastAPI serves:
- `/api/*` — REST API endpoints
- `/static/cards/*` — Card images (WebP, baked into Docker image)
- `/assets/*` — Frontend JS/CSS bundles
- `/*` — SPA fallback to `index.html`

## Deploy

```bash
fly deploy
```

This builds the Docker image remotely and deploys it. Takes ~3-5 minutes.

## Infrastructure

| Component | Details |
|-----------|---------|
| **App** | `one-piece-tcg.fly.dev` |
| **Region** | `lhr` (London) |
| **VM** | shared-cpu-1x, 1GB RAM |
| **Volume** | 1GB persistent disk at `/data` |
| **Database** | SQLite at `/data/one_piece_tcg.db` |
| **Auto-sleep** | Stops after idle, starts on request (~2-3s cold start) |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `backend/one_piece_tcg.db` | SQLite database path. Set to `/data/one_piece_tcg.db` on Fly.io |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins. Set to `*` on Fly.io |

### Key Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Two-stage build (Node + Python) |
| `fly.toml` | Fly.io config (region, volume, auto-sleep) |
| `.dockerignore` | Excludes node_modules, venv, .git, .db files |

## Database Management

### Upload local DB to production

Use this to sync your local collection, decks, and card data to production:

```bash
# Start the machine if stopped
fly machine list -a one-piece-tcg          # get machine ID
fly machine start <MACHINE_ID> -a one-piece-tcg

# Delete old DB and upload new one
fly ssh console -a one-piece-tcg -C "rm /data/one_piece_tcg.db"
fly sftp shell -a one-piece-tcg
put backend/one_piece_tcg.db /data/one_piece_tcg.db
exit

# Restart to pick up new DB
fly machine restart <MACHINE_ID> -a one-piece-tcg
```

### Auto-seeding

If the DB is empty on startup, the app auto-imports all cards from `backend/data/cards.json`. Collection and deck data are NOT included in the seed — only card definitions.

### Re-export seed data

After modifying card data locally (e.g. image paths, rarity tags):

```bash
cd backend && source venv/bin/activate
python export_cards.py
```

## Common Operations

### Check app status
```bash
fly status -a one-piece-tcg
```

### View logs
```bash
fly logs -a one-piece-tcg --no-tail
```

### SSH into container
```bash
fly ssh console -a one-piece-tcg
```

### Restart app
```bash
fly machine restart <MACHINE_ID> -a one-piece-tcg
```

### Run SQL on remote DB
```bash
fly ssh console -a one-piece-tcg -C "python -c \"
import sqlite3
c = sqlite3.connect('/data/one_piece_tcg.db')
print(c.execute('SELECT COUNT(*) FROM cards').fetchone())
\""
```

## Card Images

- **Format**: WebP (~440MB total, converted from 1.5GB PNG)
- **Location in container**: `/app/cards/` (baked into Docker image, NOT on volume)
- **Served at**: `/static/cards/{set-dir}/{card_set_id}.webp`
- Images are part of the Docker image — updating them requires a `fly deploy`

## Costs

Fly.io free tier includes:
- 3 shared-cpu VMs
- 1GB persistent volume
- Auto-sleep saves hours when idle

No credit card charges expected for single-user personal use.

## Troubleshooting

### App won't start
Check logs: `fly logs -a one-piece-tcg --no-tail`
Common causes: missing Python dependency in `requirements.txt`, DB corruption

### Images not loading
1. Check DB paths: `card_image` should be `/static/cards/{dir}/{id}.webp`
2. Check files exist: `fly ssh console -a one-piece-tcg -C "ls /app/cards/{dir}/"`
3. If DB has `.png` paths, run the update:
   ```bash
   fly ssh console -a one-piece-tcg -C "python -c \"
   import sqlite3
   c = sqlite3.connect('/data/one_piece_tcg.db')
   c.execute(\\\"UPDATE cards SET card_image=REPLACE(card_image,'.png','.webp') WHERE card_image LIKE '%.png'\\\")
   c.commit()
   print('updated:', c.total_changes)
   \""
   ```

### Machine stopped
Normal — auto-sleep is enabled. Visit the URL to wake it, or manually start:
```bash
fly machine start <MACHINE_ID> -a one-piece-tcg
```
