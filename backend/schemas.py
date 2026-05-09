from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CardOut(BaseModel):
    card_set_id: str
    card_name: str
    card_color: List[str]
    card_type: str
    card_cost: Optional[int]
    card_power: Optional[int]
    life: Optional[int]
    card_text: Optional[str]
    types: List[str]
    rarity: str
    counter_amount: Optional[int]
    attribute: Optional[str]
    card_image: Optional[str]
    set_id: str
    set_name: str
    market_price: Optional[float]

    class Config:
        from_attributes = True


class PaginatedCards(BaseModel):
    items: List[CardOut]
    total: int
    page: int
    page_size: int


class DeckCardIn(BaseModel):
    card_set_id: str
    quantity: int


class DeckCreate(BaseModel):
    name: str
    leader_card_set_id: str
    cards: List[DeckCardIn]


class DeckUpdate(BaseModel):
    name: Optional[str]
    leader_card_set_id: Optional[str]
    cards: Optional[List[DeckCardIn]]


class DeckCardOut(BaseModel):
    card: CardOut
    quantity: int

    class Config:
        from_attributes = True


class DeckOut(BaseModel):
    id: int
    name: str
    leader: CardOut
    cards: List[DeckCardOut]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeckSummary(BaseModel):
    id: int
    name: str
    leader_card_set_id: str
    leader_name: str
    card_count: int
    created_at: datetime
    updated_at: datetime


class ValidationResult(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str] = []


class SyncResult(BaseModel):
    cards_synced: int
