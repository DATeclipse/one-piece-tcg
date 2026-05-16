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
    alt_images: list[str] = []
    set_id: str
    set_name: str
    market_price: Optional[float]
    art_style: str = "standard"

    class Config:
        from_attributes = True


class CardUpdate(BaseModel):
    rarity: Optional[str] = None
    art_style: Optional[str] = None


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
    leader_image: Optional[str]
    card_count: int
    created_at: datetime
    updated_at: datetime


class ValidationResult(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str] = []


class MetaDeckCreate(BaseModel):
    name: str
    leader_card_set_id: str
    tournament_name: Optional[str] = None
    tournament_date: Optional[str] = None
    player_name: Optional[str] = None
    placing: Optional[int] = None
    cards: List[DeckCardIn]


class MetaDeckOut(BaseModel):
    id: int
    name: str
    leader: CardOut
    cards: List[DeckCardOut]
    tournament_name: Optional[str]
    tournament_date: Optional[str]
    player_name: Optional[str]
    placing: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class MetaDeckSummary(BaseModel):
    id: int
    name: str
    leader_card_set_id: str
    leader_name: str
    leader_image: Optional[str]
    tournament_name: Optional[str]
    player_name: Optional[str]
    placing: Optional[int]
    card_count: int


class CollectionItemIn(BaseModel):
    card_set_id: str
    quantity: int


class CollectionItemOut(BaseModel):
    card_set_id: str
    quantity: int

    class Config:
        from_attributes = True


class CollectionFullOut(BaseModel):
    card: CardOut
    quantity: int

    class Config:
        from_attributes = True


class SyncResult(BaseModel):
    cards_synced: int
