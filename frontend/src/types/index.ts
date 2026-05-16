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
  alt_images: string[];
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
  leader_image: string | null;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MetaDecklistCard {
  count: number;
  name: string;
  set: string;
  number: string;
}

export interface MetaDecklist {
  leader: { name: string; set: string; number: string };
  character: MetaDecklistCard[];
  event: MetaDecklistCard[];
  stage: MetaDecklistCard[];
}

export interface MetaDeckEntry {
  placing: number;
  player: string;
  leader: string;
  leader_id: string | null;
  record: { wins: number; losses: number; ties: number } | null;
  decklist: MetaDecklist | null;
}

export interface MetaTournament {
  id: string;
  name: string;
  date: string;
  players: number;
  top_decks: MetaDeckEntry[];
}

export interface LeaderStat {
  leader_name: string;
  leader_id: string;
  appearances: number;
  wins: number;
}

export interface MetaDeckCreate {
  name: string;
  leader_card_set_id: string;
  tournament_name?: string;
  tournament_date?: string;
  player_name?: string;
  placing?: number;
  cards: DeckCardIn[];
}

export interface MetaDeckSummary {
  id: number;
  name: string;
  leader_card_set_id: string;
  leader_name: string;
  leader_image: string | null;
  tournament_name: string | null;
  player_name: string | null;
  placing: number | null;
  card_count: number;
}

export interface MetaDeckOut {
  id: number;
  name: string;
  leader: Card;
  cards: DeckCard[];
  tournament_name: string | null;
  tournament_date: string | null;
  player_name: string | null;
  placing: number | null;
  created_at: string;
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
  search?: string;
}

export interface CollectionItem {
  card_set_id: string;
  quantity: number;
}
