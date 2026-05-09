from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import SyncResult
from sync import sync_cards

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("", response_model=SyncResult)
def trigger_sync(db: Session = Depends(get_db)):
    count = sync_cards(db)
    return SyncResult(cards_synced=count)
