from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Card, Deck, DeckCard
from schemas import (
    DeckCardOut,
    DeckCreate,
    DeckOut,
    DeckSummary,
    DeckUpdate,
    ValidationResult,
)
from validation import validate_deck

router = APIRouter(prefix="/api/decks", tags=["decks"])


def _build_deck_out(deck: Deck) -> DeckOut:
    return DeckOut(
        id=deck.id,
        name=deck.name,
        leader=deck.leader,
        cards=[
            DeckCardOut(card=dc.card, quantity=dc.quantity) for dc in deck.cards
        ],
        created_at=deck.created_at,
        updated_at=deck.updated_at,
    )


@router.get("", response_model=List[DeckSummary])
def list_decks(db: Session = Depends(get_db)):
    decks = db.query(Deck).order_by(Deck.updated_at.desc()).all()
    result = []
    for d in decks:
        card_count = sum(dc.quantity for dc in d.cards)
        result.append(
            DeckSummary(
                id=d.id,
                name=d.name,
                leader_card_set_id=d.leader_card_set_id,
                leader_name=d.leader.card_name if d.leader else "Unknown",
                card_count=card_count,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
        )
    return result


@router.get("/{deck_id}", response_model=DeckOut)
def get_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter_by(id=deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return _build_deck_out(deck)


@router.post("", response_model=DeckOut)
def create_deck(payload: DeckCreate, db: Session = Depends(get_db)):
    leader = db.query(Card).filter_by(card_set_id=payload.leader_card_set_id).first()
    if not leader:
        raise HTTPException(status_code=400, detail="Leader card not found")

    deck = Deck(name=payload.name, leader_card_set_id=payload.leader_card_set_id)
    db.add(deck)
    db.flush()

    for entry in payload.cards:
        card = db.query(Card).filter_by(card_set_id=entry.card_set_id).first()
        if not card:
            raise HTTPException(
                status_code=400, detail=f"Card '{entry.card_set_id}' not found"
            )
        db.add(
            DeckCard(
                deck_id=deck.id,
                card_set_id=entry.card_set_id,
                quantity=entry.quantity,
            )
        )

    db.commit()
    db.refresh(deck)
    return _build_deck_out(deck)


@router.put("/{deck_id}", response_model=DeckOut)
def update_deck(deck_id: int, payload: DeckUpdate, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter_by(id=deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if payload.name is not None:
        deck.name = payload.name
    if payload.leader_card_set_id is not None:
        leader = db.query(Card).filter_by(card_set_id=payload.leader_card_set_id).first()
        if not leader:
            raise HTTPException(status_code=400, detail="Leader card not found")
        deck.leader_card_set_id = payload.leader_card_set_id

    if payload.cards is not None:
        db.query(DeckCard).filter_by(deck_id=deck.id).delete()
        for entry in payload.cards:
            card = db.query(Card).filter_by(card_set_id=entry.card_set_id).first()
            if not card:
                raise HTTPException(
                    status_code=400,
                    detail=f"Card '{entry.card_set_id}' not found",
                )
            db.add(
                DeckCard(
                    deck_id=deck.id,
                    card_set_id=entry.card_set_id,
                    quantity=entry.quantity,
                )
            )

    db.commit()
    db.refresh(deck)
    return _build_deck_out(deck)


@router.delete("/{deck_id}")
def delete_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(Deck).filter_by(id=deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return {"detail": "Deck deleted"}


@router.post("/validate", response_model=ValidationResult)
def validate_deck_endpoint(payload: DeckCreate, db: Session = Depends(get_db)):
    return validate_deck(payload.leader_card_set_id, payload.cards, db)
