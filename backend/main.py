import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import LOCAL_CARDS_DIR
from database import Base, SessionLocal, engine
from models import Card
from routers import cards, collections, decks, meta, sync
from sync import sync_cards

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="One Piece TCG Deck Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards.router)
app.include_router(collections.router)
app.include_router(decks.router)
app.include_router(sync.router)
app.include_router(meta.router)

if LOCAL_CARDS_DIR.exists():
    app.mount("/static/cards", StaticFiles(directory=str(LOCAL_CARDS_DIR)), name="cards")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        count = db.query(Card).count()
        if count == 0:
            logger.info("No cards in database, running initial sync...")
            synced = sync_cards(db)
            logger.info(f"Initial sync complete: {synced} cards")
        else:
            logger.info(f"Database has {count} cards, skipping sync")
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
