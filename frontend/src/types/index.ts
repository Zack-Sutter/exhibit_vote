export interface Item {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
}

export interface PairResponse {
  item_a: Item;
  item_b: Item;
}

export interface VoteCreate {
  winner_id: number;
  loser_id: number;
}

export interface StatEntry {
  id: number;
  name: string;
  wins: number;
  losses: number;
  win_rate: number;
}
