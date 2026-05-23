import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

DB_PATH = os.environ.get("DB_PATH", str(BASE_DIR / "one_piece_tcg.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"
CARDS_JSON_PATH = BASE_DIR / "data" / "cards.json"
LOCAL_CARDS_DIR = PROJECT_DIR / "cards"
