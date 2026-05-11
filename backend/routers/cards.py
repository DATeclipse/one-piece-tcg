from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import Card, CardType
from schemas import CardOut, PaginatedCards

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("", response_model=PaginatedCards)
def list_cards(
    name: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    card_type: Optional[str] = Query(None),
    cost_min: Optional[int] = Query(None),
    cost_max: Optional[int] = Query(None),
    power_min: Optional[int] = Query(None),
    power_max: Optional[int] = Query(None),
    set_id: Optional[str] = Query(None),
    types: Optional[str] = Query(None, description="Filter by card type/affiliation"),
    types_contains: Optional[str] = Query(None, description="Substring match on types/affiliation"),
    exclude_type: Optional[str] = Query(None, description="Exclude cards of this card_type"),
    colors: Optional[str] = Query(None, description="Comma-separated colors, OR match"),
    rarity: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Search name OR types (OR match)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Card)

    if search:
        q = q.filter(or_(
            Card.card_name.ilike(f"%{search}%"),
            Card.types.like(f"%{search}%"),
        ))
    if name:
        q = q.filter(Card.card_name.ilike(f"%{name}%"))
    if color:
        q = q.filter(Card.card_color.like(f'%"{color}"%'))
    if card_type:
        q = q.filter(Card.card_type == card_type)
    if cost_min is not None:
        q = q.filter(Card.card_cost >= cost_min)
    if cost_max is not None:
        q = q.filter(Card.card_cost <= cost_max)
    if power_min is not None:
        q = q.filter(Card.card_power >= power_min)
    if power_max is not None:
        q = q.filter(Card.card_power <= power_max)
    if set_id:
        q = q.filter(Card.set_id == set_id)
    if types:
        q = q.filter(Card.types.like(f'%"{types}"%'))
    if types_contains:
        q = q.filter(Card.types.like(f'%{types_contains}%'))
    if exclude_type:
        q = q.filter(Card.card_type != exclude_type)
    if colors:
        color_list = [c.strip() for c in colors.split(",")]
        q = q.filter(or_(*[Card.card_color.like(f'%"{c}"%') for c in color_list]))
    if rarity:
        q = q.filter(Card.rarity == rarity)

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedCards(items=items, total=total, page=page, page_size=page_size)


@router.get("/leaders", response_model=List[CardOut])
def list_leaders(db: Session = Depends(get_db)):
    return db.query(Card).filter_by(card_type=CardType.LEADER).all()


@router.get("/colors", response_model=List[str])
def list_colors(db: Session = Depends(get_db)):
    rows = db.query(Card.card_color).distinct().all()
    colors = set()
    for (color_json,) in rows:
        if isinstance(color_json, list):
            colors.update(color_json)
    return sorted(colors)


@router.get("/sets")
def list_sets(db: Session = Depends(get_db)):
    rows = (
        db.query(Card.set_id, Card.set_name)
        .distinct()
        .order_by(Card.set_id)
        .all()
    )
    return [{"set_id": r[0], "set_name": r[1]} for r in rows]


@router.get("/{card_set_id}", response_model=CardOut)
def get_card(card_set_id: str, db: Session = Depends(get_db)):
    card = db.query(Card).filter_by(card_set_id=card_set_id).first()
    if not card:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Card not found")
    return card
