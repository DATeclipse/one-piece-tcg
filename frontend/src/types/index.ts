export interface Card {
  card_set_id: string;
  card_name: string;
  card_color: string[];
  card_type: "Leader" | "Character" | "Event" | "Stage";
  card_cost: number | null;
  card_power: number | null;
  life: number | null;
  card_text: string | null;
  types: string[];
  rarity: string;
  counter_amount: number | null;
  attribute: string | null;
  card_image: string | null;
  set_id: string;
  set_name: string;
  market_price: number | null;
}

export interface PaginatedCards {
  items: Card[];
  total: number;
  page: number;
  page_size: number;
}

export interface DeckCard {
  card: Card;
  quantity: number;
}

export interface DeckCardIn {
  card_set_id: string;
  quantity: number;
}

export interface Deck {
  id: number;
  name: string;
  leader: Card;
  cards: DeckCard[];
  created_at: string;
  updated_at: string;
}

export interface DeckSummary {
  id: number;
  name: string;
  leader_card_set_id: string;
  leader_name: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SearchFilters {
  name: string;
  color: string;
  card_type: string;
  cost_min: string;
  cost_max: string;
  set_id: string;
  rarity?: string;
  types_contains?: string;
  exclude_type?: string;
  colors?: string;
}
