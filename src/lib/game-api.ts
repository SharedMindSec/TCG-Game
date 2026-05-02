export type DeckCardSummary = {
  id: number;
  name: string;
  imageUrl: string;
  rarity: string;
  type: string;
  attack: number | null;
  defense: number | null;
  hp: number | null;
  cost: number | null;
  abilities?: string | null;
  description?: string | null;
};

export type DeckSummary = {
  id: number;
  name: string;
  isActive: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  entries: Array<{
    cardId: number;
    quantity: number;
    card: DeckCardSummary;
  }>;
};

export type DeckListResponse = {
  deckSize: number;
  maxCopies: number;
  decks: DeckSummary[];
};

export type TargetOption = {
  side: string;
  target_id: string | null;
  label: string;
};

export type PlayableCard = {
  instance_id: string;
  name: string;
  cost: number;
  card_type: string;
  can_play: boolean;
  disabled_reason?: string | null;
  target_options: TargetOption[];
  text?: string;
  art_path?: string;
  attack?: number;
  health?: number;
  keywords?: string[];
};

export type AttackerOption = {
  unit_id: string;
  name: string;
  attack: number;
  health: number;
  can_attack: boolean;
  target_options: TargetOption[];
  keywords?: string[];
};

export type VisibleBoardUnit = {
  unit_id: string;
  name: string;
  attack: number;
  health: number;
  max_health: number;
  keywords: string[];
  can_attack: boolean;
  art_path: string;
};

export type VisibleHandCard = {
  instance_id: string;
  name: string;
  card_type: string;
  cost: number;
  power?: number;
  health?: number;
  text?: string;
  art_path?: string;
};

export type VisibleSide = {
  discord_id: string;
  display_name: string;
  hp: number;
  energy: number;
  max_energy: number;
  deck: { count: number };
  hand: VisibleHandCard[] | [{ count: number }];
  discard: { count: number };
  board: VisibleBoardUnit[];
  location: VisibleHandCard | null;
};

export type MatchReward = {
  title: string;
  summary: string;
  reason: string;
  cards: Array<{
    name: string;
    art_path: string;
    rarity?: string | null;
  }>;
  persisted?: boolean;
};

export type VisibleMatchState = {
  match_id: number;
  kind: string;
  round: number;
  turn_number: number;
  status: "active" | "finished";
  winner_discord_id: string | null;
  active_player_discord_id: string;
  player_one: VisibleSide;
  player_two: VisibleSide;
  available_actions: {
    can_act: boolean;
    playable_cards: PlayableCard[];
    attackers: AttackerOption[];
    can_end_turn: boolean;
  };
  log_tail?: string[];
  reward?: MatchReward | null;
  end_reason?: string | null;
};

export type MatchResponse = {
  id: number;
  kind: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  state: VisibleMatchState;
};

export type WaitingRoomResponse = {
  id: number;
  kind: string;
  status: "waiting";
  waitingRoom: {
    joinCode: string;
    deckName: string;
  };
};

export type OpenRoom = {
  id: number;
  joinCode: string;
  host: string;
  deckName: string;
  createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload as T;
}

export const gameApi = {
  listDecks: () => request<DeckListResponse>("/api/decks"),
  saveDeck: (payload: { deckId?: number | null; name: string; entries: Array<{ cardId: number; quantity: number }>; makeActive?: boolean }) => request<{ deckId: number; decks: DeckSummary[] }>("/api/decks/save", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  activateDeck: (deckId: number) => request<{ ok: boolean; decks: DeckSummary[] }>(`/api/decks/${deckId}/activate`, {
    method: "POST",
  }),
  startNpcBattle: (payload: { deckId?: number; difficulty?: string }) => request<MatchResponse>("/api/battle/npc/start", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  listOpenRooms: () => request<{ rooms: OpenRoom[] }>("/api/battle/pvp/open"),
  hostPvp: (payload: { deckId?: number }) => request<{ id: number; joinCode: string; deckName: string; message: string }>("/api/battle/pvp/host", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  joinPvp: (payload: { joinCode: string; deckId?: number }) => request<{ id: number; state: VisibleMatchState }>("/api/battle/pvp/join", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getMatch: (matchId: number) => request<MatchResponse | WaitingRoomResponse>(`/api/battle/matches/${matchId}`),
  actOnMatch: (matchId: number, payload: { action: string; card_instance_id?: string; target_side?: string | null; target_id?: string | null; attacker_id?: string }) => request<MatchResponse>(`/api/battle/matches/${matchId}/action`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
};
