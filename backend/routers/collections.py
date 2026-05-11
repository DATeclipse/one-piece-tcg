from typing import Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Collection
from schemas import CollectionFullOut, CollectionItemIn, CollectionItemOut

router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.get("", response_model=List[CollectionItemOut])
def list_collection(db: Session = Depends(get_db)):
    return db.query(Collection).all()


@router.get("/full", response_model=List[CollectionFullOut])
def list_full_collection(db: Session = Depends(get_db)):
    items = db.query(Collection).all()
    return [CollectionFullOut(card=item.card, quantity=item.quantity) for item in items]


@router.get("/counts")
def get_collection_counts(db: Session = Depends(get_db)) -> Dict[str, int]:
    items = db.query(Collection).all()
    return {item.card_set_id: item.quantity for item in items}


@router.put("/{card_set_id}", response_model=CollectionItemOut)
def update_collection_item(card_set_id: str, payload: CollectionItemIn, db: Session = Depends(get_db)):
    item = db.query(Collection).filter_by(card_set_id=card_set_id).first()
    if payload.quantity <= 0:
        if item:
            db.delete(item)
            db.commit()
        return CollectionItemOut(card_set_id=card_set_id, quantity=0)

    if item:
        item.quantity = payload.quantity
    else:
        item = Collection(card_set_id=card_set_id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    return CollectionItemOut(card_set_id=card_set_id, quantity=payload.quantity)


@router.post("/bulk", response_model=List[CollectionItemOut])
def bulk_update(items: List[CollectionItemIn], db: Session = Depends(get_db)):
    results = []
    for entry in items:
        item = db.query(Collection).filter_by(card_set_id=entry.card_set_id).first()
        if entry.quantity <= 0:
            if item:
                db.delete(item)
            results.append(CollectionItemOut(card_set_id=entry.card_set_id, quantity=0))
        else:
            if item:
                item.quantity = entry.quantity
            else:
                item = Collection(card_set_id=entry.card_set_id, quantity=entry.quantity)
                db.add(item)
            results.append(CollectionItemOut(card_set_id=entry.card_set_id, quantity=entry.quantity))
    db.commit()
    return results
