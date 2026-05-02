import { useEffect, useMemo, useState } from "react";

export type RewardEntry = {
  id: string;
  kind: "card" | "currency" | "trophy";
  label: string;
  amount?: number;
  rarity?: string;
  at: string;
};

export type GameState = {
  credits: number;
  crystals: number;
  tournamentTickets: number;
  exploreRuns: number;
  npcWins: number;
  npcLosses: number;
  pvpWins: number;
  pvpLosses: number;
  tournamentPoints: number;
  rankPoints: number;
  packsOpened: number;
  recentRewards: RewardEntry[];
};

const STORAGE_KEY = "bdc-tcg-web-game-state";

const defaultState: GameState = {
  credits: 1600,
  crystals: 120,
  tournamentTickets: 2,
  exploreRuns: 0,
  npcWins: 0,
  npcLosses: 0,
  pvpWins: 0,
  pvpLosses: 0,
  tournamentPoints: 0,
  rankPoints: 0,
  packsOpened: 0,
  recentRewards: [],
};

function loadInitialState(): GameState {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      ...defaultState,
      ...parsed,
      recentRewards: Array.isArray(parsed.recentRewards) ? parsed.recentRewards : [],
    };
  } catch {
    return defaultState;
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(() => {
    return {
      addCredits(amount: number) {
        setState(prev => ({ ...prev, credits: Math.max(0, prev.credits + amount) }));
      },
      addCrystals(amount: number) {
        setState(prev => ({ ...prev, crystals: Math.max(0, prev.crystals + amount) }));
      },
      addTickets(amount: number) {
        setState(prev => ({ ...prev, tournamentTickets: Math.max(0, prev.tournamentTickets + amount) }));
      },
      spend(cost: { credits?: number; crystals?: number; tournamentTickets?: number }) {
        let success = false;
        setState(prev => {
          const nextCredits = prev.credits - (cost.credits ?? 0);
          const nextCrystals = prev.crystals - (cost.crystals ?? 0);
          const nextTickets = prev.tournamentTickets - (cost.tournamentTickets ?? 0);

          if (nextCredits < 0 || nextCrystals < 0 || nextTickets < 0) {
            success = false;
            return prev;
          }

          success = true;
          return {
            ...prev,
            credits: nextCredits,
            crystals: nextCrystals,
            tournamentTickets: nextTickets,
          };
        });
        return success;
      },
      recordExplore(rewards?: RewardEntry[]) {
        setState(prev => ({
          ...prev,
          exploreRuns: prev.exploreRuns + 1,
          recentRewards: [...(rewards ?? []), ...prev.recentRewards].slice(0, 12),
        }));
      },
      recordNpcBattle(won: boolean, rewards?: RewardEntry[]) {
        setState(prev => ({
          ...prev,
          npcWins: prev.npcWins + (won ? 1 : 0),
          npcLosses: prev.npcLosses + (won ? 0 : 1),
          recentRewards: [...(rewards ?? []), ...prev.recentRewards].slice(0, 12),
        }));
      },
      recordPvp(won: boolean, rewards?: RewardEntry[]) {
        setState(prev => ({
          ...prev,
          pvpWins: prev.pvpWins + (won ? 1 : 0),
          pvpLosses: prev.pvpLosses + (won ? 0 : 1),
          recentRewards: [...(rewards ?? []), ...prev.recentRewards].slice(0, 12),
        }));
      },
      recordTournament(points: number, rewards?: RewardEntry[]) {
        setState(prev => ({
          ...prev,
          tournamentPoints: Math.max(0, prev.tournamentPoints + points),
          recentRewards: [...(rewards ?? []), ...prev.recentRewards].slice(0, 12),
        }));
      },
      addRankPoints(points: number) {
        setState(prev => ({ ...prev, rankPoints: Math.max(0, prev.rankPoints + points) }));
      },
      recordPackOpen(rewards?: RewardEntry[]) {
        setState(prev => ({
          ...prev,
          packsOpened: prev.packsOpened + 1,
          recentRewards: [...(rewards ?? []), ...prev.recentRewards].slice(0, 12),
        }));
      },
      addReward(reward: RewardEntry) {
        setState(prev => ({ ...prev, recentRewards: [reward, ...prev.recentRewards].slice(0, 12) }));
      },
      resetProgress() {
        setState(defaultState);
      },
    };
  }, []);

  const derived = useMemo(() => {
    const totalBattles = state.npcWins + state.npcLosses + state.pvpWins + state.pvpLosses;
    const totalWins = state.npcWins + state.pvpWins;
    const winRate = totalBattles > 0 ? (totalWins / totalBattles) * 100 : 0;
    const ladderScore = state.rankPoints + state.pvpWins * 18 + state.npcWins * 10;

    let rankLabel = "Bronze";
    if (ladderScore >= 600) rankLabel = "Mythic";
    else if (ladderScore >= 350) rankLabel = "Diamond";
    else if (ladderScore >= 220) rankLabel = "Platinum";
    else if (ladderScore >= 120) rankLabel = "Gold";
    else if (ladderScore >= 50) rankLabel = "Silver";

    return {
      totalBattles,
      totalWins,
      winRate,
      ladderScore,
      rankLabel,
    };
  }, [state]);

  return { state, actions, derived };
}
