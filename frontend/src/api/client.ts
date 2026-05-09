import type {
  Card,
  Deck,
  DeckCardIn,
  DeckSummary,
  PaginatedCards,
  SearchFilters,
  ValidationResult,
} from "../types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export function searchCards(
  filters: Partial<SearchFilters>,
  page = 1,
  pageSize = 50
): Promise<PaginatedCards> {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.color) params.set("color", filters.color);
  if (filters.card_type) params.set("card_type", filters.card_type);
  if (filters.cost_min) params.set("cost_min", filters.cost_min);
  if (filters.cost_max) params.set("cost_max", filters.cost_max);
  if (filters.set_id) params.set("set_id", filters.set_id);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return request(`/cards?${params}`);
}

export function getLeaders(): Promise<Card[]> {
  return request("/cards/leaders");
}

export function getColors(): Promise<string[]> {
  return request("/cards/colors");
}

export function getSets(): Promise<{ set_id: string; set_name: string }[]> {
  return request("/cards/sets");
}

export function listDecks(): Promise<DeckSummary[]> {
  return request("/decks");
}

export function getDeck(id: number): Promise<Deck> {
  return request(`/decks/${id}`);
}

export function createDeck(payload: {
  name: string;
  leader_card_set_id: string;
  cards: DeckCardIn[];
}): Promise<Deck> {
  return request("/decks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDeck(
  id: number,
  payload: {
    name?: string;
    leader_card_set_id?: string;
    cards?: DeckCardIn[];
  }
): Promise<Deck> {
  return request(`/decks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDeck(id: number): Promise<void> {
  return request(`/decks/${id}`, { method: "DELETE" });
}

export function validateDeck(payload: {
  name: string;
  leader_card_set_id: string;
  cards: DeckCardIn[];
}): Promise<ValidationResult> {
  return request("/decks/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
