from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

DATABASE_URL = f"sqlite:///{BASE_DIR / 'one_piece_tcg.db'}"
CARDS_JSON_PATH = BASE_DIR / "data" / "cards.json"
LOCAL_CARDS_DIR = PROJECT_DIR / "cards"
