import { type ReactNode, useState } from "react";
import type { Card as GameCard } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { getRarityBorder, getRarityTextColor, cn } from "@/lib/utils";
import { getDisplayStats } from "@/lib/card-stats";
import { Heart, Shield, Swords, Zap } from "lucide-react";

export interface BattleLane {
  leader: GameCard;
  bench: GameCard[];
  hand: GameCard[];
  hpLeft?: number;
  title?: string;
}

interface BattlePreviewBoardProps {
  playerLabel: string;
  enemyLabel: string;
  player: BattleLane;
  enemy: BattleLane;
  status?: string;
}

function BattleStatChip({ icon, value, tone }: { icon: ReactNode; value: number; tone: string }) {
  return (
    <div className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 bg-background/85 backdrop-blur-sm", tone)}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

function BattleCardFace({ card, role, hpLeft }: { card: GameCard; role: string; hpLeft?: number }) {
  const [imgError, setImgError] = useState(false);
  const rarityBorder = getRarityBorder(card.rarity);
  const rarityText = getRarityTextColor(card.rarity);
  const stats = getDisplayStats(card);

  return (
    <div className={cn("rounded-2xl overflow-hidden border bg-card/95 shadow-2xl", card.rarity.toLowerCase() === "legendary" ? "card-legendary-border" : rarityBorder)}>
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={imgError || !card.imageUrl ? "/card-placeholder.png" : card.imageUrl}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
          <Badge className="bg-background/85 text-foreground border border-border/70 hover:bg-background/85">{role}</Badge>
          <Badge className="bg-background/85 text-primary border border-primary/20 hover:bg-background/85">
            {stats.cost}
            <Zap className="w-3 h-3 ml-1" />
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
          <div className="font-serif font-bold text-xl text-white truncate">{card.name}</div>
          <div className={cn("text-xs font-semibold uppercase tracking-[0.24em] mt-1", rarityText)}>{card.rarity} • {card.type}</div>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between gap-2 bg-card/95 border-t border-border/60">
        <BattleStatChip icon={<Swords className="w-3.5 h-3.5" />} value={stats.attack} tone="text-destructive border-destructive/30" />
        <BattleStatChip icon={<Shield className="w-3.5 h-3.5" />} value={stats.defense} tone="text-blue-400 border-blue-400/30" />
        <BattleStatChip icon={<Heart className="w-3.5 h-3.5" />} value={hpLeft ?? stats.hp} tone="text-emerald-400 border-emerald-400/30" />
      </div>
    </div>
  );
}

function MiniBattleCard({ card, label }: { card: GameCard; label: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-border/60 bg-background/50 min-w-[92px] w-[92px] shrink-0">
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={imgError || !card.imageUrl ? "/card-placeholder.png" : card.imageUrl}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          {label}
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="text-xs font-semibold truncate">{card.name}</div>
      </div>
    </div>
  );
}

function LaneStrip({ title, cards }: { title: string; cards: GameCard[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase tracking-[0.24em]">{title}</div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {cards.map((card, index) => (
          <MiniBattleCard key={`${title}-${card.id}-${index}`} card={card} label={title === "Hand" ? `Hand ${index + 1}` : `Bench ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

export function BattlePreviewBoard({ playerLabel, enemyLabel, player, enemy, status }: BattlePreviewBoardProps) {
  return (
    <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-card/95 via-card/85 to-background/85 p-5 lg:p-6 space-y-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Live battle board</div>
          <div className="text-lg font-semibold mt-1">Card art is now shown on the actual battle screen.</div>
        </div>
        {status ? <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">{status}</Badge> : null}
      </div>

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-5 items-start">
        <div className="space-y-4 order-2 lg:order-1">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">{enemyLabel}</div>
            <BattleCardFace card={enemy.leader} role={enemy.title ?? "Active"} hpLeft={enemy.hpLeft} />
          </div>
          <LaneStrip title="Bench" cards={enemy.bench} />
          <LaneStrip title="Hand" cards={enemy.hand} />
        </div>

        <div className="order-1 lg:order-2 flex lg:h-full items-center justify-center pt-3 lg:pt-24">
          <div className="w-20 h-20 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            VS
          </div>
        </div>

        <div className="space-y-4 order-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">{playerLabel}</div>
            <BattleCardFace card={player.leader} role={player.title ?? "Active"} hpLeft={player.hpLeft} />
          </div>
          <LaneStrip title="Bench" cards={player.bench} />
          <LaneStrip title="Hand" cards={player.hand} />
        </div>
      </div>
    </div>
  );
}
