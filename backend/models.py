import enum
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class CardType(str, enum.Enum):
    LEADER = "Leader"
    CHARACTER = "Character"
    EVENT = "Event"
    STAGE = "Stage"


class Rarity(str, enum.Enum):
    C = "C"
    UC = "UC"
    R = "R"
    SR = "SR"
    SEC = "SEC"
    L = "L"
    SP = "SP"
    P = "P"
    TR = "TR"


class DataSource(str, enum.Enum):
    OPTCG_API = "optcg_api"
    OCR = "ocr"
    MANUAL = "manual"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    card_set_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    card_name: Mapped[str] = mapped_column(String)
    card_color: Mapped[list] = mapped_column(JSON)
    card_type: Mapped[CardType] = mapped_column(Enum(CardType))
    card_cost: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    card_power: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    life: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    card_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    types: Mapped[list] = mapped_column(JSON, default=list)
    rarity: Mapped[str] = mapped_column(String)
    counter_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    attribute: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    card_image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    set_id: Mapped[str] = mapped_column(String)
    set_name: Mapped[str] = mapped_column(String)
    market_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    data_source: Mapped[DataSource] = mapped_column(
        Enum(DataSource), default=DataSource.OPTCG_API
    )
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    date_synced: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    leader_card_set_id: Mapped[str] = mapped_column(
        String, ForeignKey("cards.card_set_id")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    leader: Mapped[Card] = relationship("Card", foreign_keys=[leader_card_set_id])
    cards: Mapped[List["DeckCard"]] = relationship(
        "DeckCard", back_populates="deck", cascade="all, delete-orphan"
    )


class DeckCard(Base):
    __tablename__ = "deck_cards"
    __table_args__ = (UniqueConstraint("deck_id", "card_set_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    deck_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("decks.id", ondelete="CASCADE")
    )
    card_set_id: Mapped[str] = mapped_column(
        String, ForeignKey("cards.card_set_id")
    )
    quantity: Mapped[int] = mapped_column(Integer)

    deck: Mapped[Deck] = relationship("Deck", back_populates="cards")
    card: Mapped[Card] = relationship("Card")


class MetaDeck(Base):
    __tablename__ = "meta_decks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    leader_card_set_id: Mapped[str] = mapped_column(
        String, ForeignKey("cards.card_set_id")
    )
    tournament_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tournament_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    player_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    placing: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    leader: Mapped[Card] = relationship("Card", foreign_keys=[leader_card_set_id])
    cards: Mapped[List["MetaDeckCard"]] = relationship(
        "MetaDeckCard", back_populates="deck", cascade="all, delete-orphan"
    )


class MetaDeckCard(Base):
    __tablename__ = "meta_deck_cards"
    __table_args__ = (UniqueConstraint("meta_deck_id", "card_set_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meta_deck_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("meta_decks.id", ondelete="CASCADE")
    )
    card_set_id: Mapped[str] = mapped_column(
        String, ForeignKey("cards.card_set_id")
    )
    quantity: Mapped[int] = mapped_column(Integer)

    deck: Mapped[MetaDeck] = relationship("MetaDeck", back_populates="cards")
    card: Mapped[Card] = relationship("Card")


class Collection(Base):
    __tablename__ = "collections"

    card_set_id: Mapped[str] = mapped_column(
        String, ForeignKey("cards.card_set_id"), primary_key=True
    )
    quantity: Mapped[int] = mapped_column(Integer, default=0)

    card: Mapped[Card] = relationship("Card")
