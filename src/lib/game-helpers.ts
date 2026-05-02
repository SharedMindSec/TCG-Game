import type { Card } from "@workspace/api-client-react";
import type { RewardEntry } from "@/hooks/use-game-state";

export type BattleVisualState = {
  player: {
    leader: Card;
    bench: Card[];
    hand: Card[];
    hpLeft: number;
    title?: string;
  };
  enemy: {
    leader: Card;
    bench: Card[];
    hand: Card[];
    hpLeft: number;
    title?: string;
  };
};

export function rewardEntry(partial: Omit<RewardEntry, "id" | "at">): RewardEntry {
  return {
    ...partial,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
}

export function rarityWeight(rarity: string): number {
  switch (rarity) {
    case "Legendary":
      return 2;
    case "Epic":
      return 6;
    case "Rare":
      return 14;
    case "Uncommon":
      return 24;
    default:
      return 54;
  }
}

export function pickWeightedCards(cards: Card[], count: number): Card[] {
  if (cards.length === 0) return [];
  const bucket = cards.flatMap(card => Array.from({ length: rarityWeight(card.rarity) }, () => card));
  const picks: Card[] = [];

  while (picks.length < count && bucket.length > 0) {
    const picked = bucket[Math.floor(Math.random() * bucket.length)];
    picks.push(picked);
  }

  return picks;
}

export function pickUniqueCards(cards: Card[], count: number, excludeIds: number[] = []): Card[] {
  const pool = cards.filter(card => !excludeIds.includes(card.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getCardPower(card: Card): number {
  return (card.attack ?? 0) * 1.35 + (card.defense ?? 0) * 1.1 + (card.hp ?? 0) + (card.cost ?? 0) * 0.5;
}

export function buildBattleVisual(cards: Card[], options?: {
  playerBias?: number;
  enemyBias?: number;
  enemyTitle?: string;
  playerTitle?: string;
}): BattleVisualState | null {
  if (cards.length < 8) return null;

  const playerTeam = pickUniqueCards(cards, 5);
  const enemyTeam = pickUniqueCards(cards, 5, playerTeam.map(card => card.id));

  if (playerTeam.length < 5 || enemyTeam.length < 5) return null;

  const playerLead = playerTeam[0];
  const enemyLead = enemyTeam[0];
  const playerBias = options?.playerBias ?? 0;
  const enemyBias = options?.enemyBias ?? 0;
  const playerShield = (playerLead.defense ?? 0) + Math.floor(playerBias / 4);
  const enemyShield = (enemyLead.defense ?? 0) + Math.floor(enemyBias / 4);
  const playerDamageTaken = Math.max(1, Math.floor((enemyLead.attack ?? 0) * 0.85 + enemyBias / 6 - playerShield * 0.35));
  const enemyDamageTaken = Math.max(1, Math.floor((playerLead.attack ?? 0) * 0.95 + playerBias / 6 - enemyShield * 0.35));

  return {
    player: {
      leader: playerLead,
      bench: playerTeam.slice(1, 3),
      hand: playerTeam.slice(3, 5),
      hpLeft: Math.max(1, (playerLead.hp ?? 0) - playerDamageTaken),
      title: options?.playerTitle ?? "Active",
    },
    enemy: {
      leader: enemyLead,
      bench: enemyTeam.slice(1, 3),
      hand: enemyTeam.slice(3, 5),
      hpLeft: Math.max(1, (enemyLead.hp ?? 0) - enemyDamageTaken),
      title: options?.enemyTitle ?? "Active",
    },
  };
}

export async function syncCardReward(cardId: number, quantity = 1, foil = false): Promise<void> {
  const response = await fetch(`/api/collection/${cardId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, foil }),
  });

  if (!response.ok) {
    throw new Error("Collection sync failed");
  }
}

export function seededBattlers(ladderScore: number, playerName: string) {
  return [
    { name: playerName || "You", score: ladderScore, wins: Math.max(1, Math.floor(ladderScore / 18)), losses: Math.max(0, Math.floor(ladderScore / 28)) },
    { name: "Kai Voidhand", score: 742, wins: 39, losses: 8 },
    { name: "Pixel Warden", score: 691, wins: 36, losses: 9 },
    { name: "Queen Static", score: 638, wins: 34, losses: 11 },
    { name: "Riot Archivist", score: 588, wins: 31, losses: 12 },
    { name: "Ash Circuit", score: 541, wins: 29, losses: 13 },
  ].sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function seededTournamentBoard(points: number, playerName: string) {
  return [
    { name: playerName || "You", points, events: Math.max(1, Math.ceil(points / 40)) },
    { name: "Magi Rook", points: 420, events: 7 },
    { name: "Sable Drive", points: 380, events: 6 },
    { name: "The Jester Code", points: 340, events: 6 },
    { name: "Velvet Hex", points: 290, events: 5 },
    { name: "Mono Fox", points: 260, events: 5 },
  ].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
