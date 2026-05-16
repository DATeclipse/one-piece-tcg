import type {
  Card,
  Deck,
  DeckCardIn,
  DeckSummary,
  LeaderStat,
  MetaDeckCreate,
  MetaDeckOut,
  MetaDeckSummary,
  MetaTournament,
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
  if (filters.rarity) params.set("rarity", filters.rarity);
  if (filters.types_contains) params.set("types_contains", filters.types_contains);
  if (filters.exclude_type) params.set("exclude_type", filters.exclude_type);
  if (filters.colors) params.set("colors", filters.colors);
  if (filters.search) params.set("search", filters.search);
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

export function getMetaTournaments(limit = 5): Promise<MetaTournament[]> {
  return request(`/meta/tournaments?limit=${limit}`);
}

export function getLeaderStats(count = 10): Promise<LeaderStat[]> {
  return request(`/meta/leader-stats?tournament_count=${count}`);
}

export function saveMetaDeck(payload: MetaDeckCreate): Promise<MetaDeckOut> {
  return request("/meta/decks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listMetaDecks(): Promise<MetaDeckSummary[]> {
  return request("/meta/decks");
}

export function getMetaDeck(id: number): Promise<MetaDeckOut> {
  return request(`/meta/decks/${id}`);
}

export function deleteMetaDeck(id: number): Promise<void> {
  return request(`/meta/decks/${id}`, { method: "DELETE" });
}

export function getCollectionCounts(): Promise<Record<string, number>> {
  return request("/collections/counts");
}

export function getFullCollection(): Promise<{ card: Card; quantity: number }[]> {
  return request("/collections/full");
}

export function updateCollectionItem(
  card_set_id: string,
  quantity: number
): Promise<void> {
  return request(`/collections/${card_set_id}`, {
    method: "PUT",
    body: JSON.stringify({ card_set_id, quantity }),
  });
}

export function getCard(cardSetId: string): Promise<Card> {
  return request(`/cards/${encodeURIComponent(cardSetId)}`);
}

export function updateCard(
  cardSetId: string,
  updates: { rarity?: string; art_style?: string }
): Promise<Card> {
  return request(`/cards/${encodeURIComponent(cardSetId)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
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
