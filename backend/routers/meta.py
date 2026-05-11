from __future__ import annotations

import time
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Card, MetaDeck, MetaDeckCard
from schemas import MetaDeckCreate, MetaDeckOut, MetaDeckSummary

router = APIRouter(prefix="/api/meta", tags=["meta"])

LIMITLESS_BASE = "https://play.limitlesstcg.com/api"
CACHE: dict[str, tuple[float, Any]] = {}
CACHE_TTL = 1800  # 30 minutes


async def _fetch(path: str) -> Any:
    now = time.time()
    if path in CACHE:
        ts, data = CACHE[path]
        if now - ts < CACHE_TTL:
            return data
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{LIMITLESS_BASE}{path}")
        resp.raise_for_status()
        data = resp.json()
    CACHE[path] = (now, data)
    return data


def _build_leader_id(decklist: dict | None) -> str | None:
    if not decklist or "leader" not in decklist:
        return None
    leader = decklist["leader"]
    return f"{leader['set']}-{leader['number']}"


def _extract_top_decks(standings: list[dict], limit: int = 8) -> list[dict]:
    results = []
    for i, s in enumerate(standings[:limit]):
        decklist = s.get("decklist")
        deck_info = s.get("deck") or {}
        results.append({
            "placing": i + 1,
            "player": s.get("name", "Unknown"),
            "leader": deck_info.get("name", "Unknown"),
            "leader_id": _build_leader_id(decklist),
            "record": s.get("record"),
            "decklist": decklist,
        })
    return results


@router.get("/tournaments")
async def get_meta_tournaments(limit: int = Query(5, ge=1, le=20)):
    tournaments = await _fetch(f"/tournaments?game=OP&limit={limit * 10}")
    big = [t for t in tournaments if t.get("players", 0) >= 16][:limit]

    results = []
    for t in big:
        standings = await _fetch(f"/tournaments/{t['id']}/standings")
        results.append({
            "id": t["id"],
            "name": t["name"],
            "date": t["date"],
            "players": t["players"],
            "top_decks": _extract_top_decks(standings),
        })
    return results


@router.get("/leader-stats")
async def get_leader_stats(tournament_count: int = Query(10, ge=1, le=50)):
    tournaments = await _fetch(f"/tournaments?game=OP&limit={tournament_count * 10}")
    big = [t for t in tournaments if t.get("players", 0) >= 16][:tournament_count]

    stats: dict[str, dict] = {}
    for t in big:
        standings = await _fetch(f"/tournaments/{t['id']}/standings")
        for i, s in enumerate(standings[:8]):
            deck_info = s.get("deck") or {}
            leader_name = deck_info.get("name", "Unknown")
            leader_id = _build_leader_id(s.get("decklist")) or deck_info.get("id", "")
            key = leader_id or leader_name

            if key not in stats:
                stats[key] = {
                    "leader_name": leader_name,
                    "leader_id": leader_id,
                    "appearances": 0,
                    "wins": 0,
                }
            stats[key]["appearances"] += 1
            record = s.get("record") or {}
            stats[key]["wins"] += record.get("wins", 0)

    return sorted(stats.values(), key=lambda x: x["appearances"], reverse=True)


def _build_meta_deck_out(deck: MetaDeck) -> MetaDeckOut:
    return MetaDeckOut(
        id=deck.id,
        name=deck.name,
        leader=deck.leader,
        cards=[{"card": dc.card, "quantity": dc.quantity} for dc in deck.cards],
        tournament_name=deck.tournament_name,
        tournament_date=deck.tournament_date,
        player_name=deck.player_name,
        placing=deck.placing,
        created_at=deck.created_at,
    )


@router.post("/decks", response_model=MetaDeckOut)
def save_meta_deck(payload: MetaDeckCreate, db: Session = Depends(get_db)):
    leader = db.query(Card).filter_by(card_set_id=payload.leader_card_set_id).first()
    if not leader:
        raise HTTPException(status_code=400, detail="Leader card not found in local DB")

    deck = MetaDeck(
        name=payload.name,
        leader_card_set_id=payload.leader_card_set_id,
        tournament_name=payload.tournament_name,
        tournament_date=payload.tournament_date,
        player_name=payload.player_name,
        placing=payload.placing,
    )
    db.add(deck)
    db.flush()

    for entry in payload.cards:
        card = db.query(Card).filter_by(card_set_id=entry.card_set_id).first()
        if card:
            db.add(MetaDeckCard(
                meta_deck_id=deck.id,
                card_set_id=entry.card_set_id,
                quantity=entry.quantity,
            ))

    db.commit()
    db.refresh(deck)
    return _build_meta_deck_out(deck)


@router.get("/decks", response_model=list[MetaDeckSummary])
def list_meta_decks(db: Session = Depends(get_db)):
    decks = db.query(MetaDeck).order_by(MetaDeck.created_at.desc()).all()
    return [
        MetaDeckSummary(
            id=d.id,
            name=d.name,
            leader_card_set_id=d.leader_card_set_id,
            leader_name=d.leader.card_name if d.leader else "Unknown",
            tournament_name=d.tournament_name,
            player_name=d.player_name,
            placing=d.placing,
            card_count=sum(dc.quantity for dc in d.cards),
        )
        for d in decks
    ]


@router.get("/decks/{deck_id}", response_model=MetaDeckOut)
def get_meta_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(MetaDeck).filter_by(id=deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Meta deck not found")
    return _build_meta_deck_out(deck)


@router.delete("/decks/{deck_id}")
def delete_meta_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(MetaDeck).filter_by(id=deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Meta deck not found")
    db.delete(deck)
    db.commit()
    return {"detail": "Meta deck deleted"}
