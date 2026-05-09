from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

DATABASE_URL = f"sqlite:///{BASE_DIR / 'one_piece_tcg.db'}"
OPTCG_BASE_URL = "https://optcgapi.com/api"
LOCAL_CARDS_DIR = PROJECT_DIR / "cards"
