export type CardLikeStats = {
  attack?: number | null;
  defense?: number | null;
  hp?: number | null;
  cost?: number | null;
  type?: string | null;
};

function normalizeType(type?: string | null): "unit" | "tactic" | "location" {
  const value = (type ?? "").toLowerCase();
  if (value.includes("spell") || value.includes("tactic") || value.includes("event") || value.includes("action")) return "tactic";
  if (value.includes("location") || value.includes("field") || value.includes("arena") || value.includes("zone")) return "location";
  return "unit";
}

export function getDisplayStats(card: CardLikeStats) {
  const cardType = normalizeType(card.type);
  const cost = Math.max(0, card.cost ?? 1);
  const attack = Math.max(1, card.attack ?? (cardType === "location" ? Math.ceil(cost * 0.8) : Math.ceil(cost * 1.5)));
  const hp = Math.max(1, card.hp ?? card.defense ?? (cardType === "location" ? cost + 6 : cost + 4));
  const defense = Math.max(1, card.defense ?? Math.ceil(hp / 2));
  return { attack, defense, hp, cost, cardType };
}
