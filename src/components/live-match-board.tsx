import { type ReactNode, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AttackerOption, MatchResponse, PlayableCard, TargetOption, VisibleBoardUnit } from "@/lib/game-api";
import { ChevronDown, Crown, Eye, Gift, Heart, ScrollText, Shield, Swords, Target, Trophy, Zap } from "lucide-react";

function artFor(path?: string | null) {
  return path && path.length > 0 ? path : "/card-placeholder.png";
}

function StatPill({ icon, value, tone = "" }: { icon: ReactNode; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-full border border-border/60 bg-background/85 px-2.5 py-1 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 ${tone}`}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

function DetailStat({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/45 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

type InspectorPayload = {
  title: string;
  subtitle?: string;
  image: string;
  attack?: number | null;
  health?: number | null;
  maxHealth?: number | null;
  cost?: number | null;
  text?: string;
  keywords?: string[];
  statusText?: string;
  actionLabel?: string;
  disabledReason?: string | null;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  targetOptions?: TargetOption[];
  onTargetSelect?: (target: TargetOption) => void;
};

function CardInspector({
  open,
  onOpenChange,
  payload,
  isMobile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: InspectorPayload | null;
  isMobile: boolean;
}) {
  if (!payload) return null;

  const content = (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-[24px] overflow-hidden border border-border/60 bg-muted mx-auto w-full max-w-[260px]">
          <img src={payload.image} alt={payload.title} className="w-full aspect-[3/4] object-cover" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {payload.cost !== undefined && payload.cost !== null ? <DetailStat label="Cost" value={payload.cost} tone="text-primary" /> : null}
            {payload.attack !== undefined && payload.attack !== null ? <DetailStat label="ATK" value={payload.attack} tone="text-rose-300" /> : null}
            {payload.health !== undefined && payload.health !== null ? <DetailStat label="HP" value={payload.maxHealth ? `${payload.health}/${payload.maxHealth}` : payload.health} tone="text-emerald-300" /> : null}
            {payload.statusText ? <DetailStat label="State" value={payload.statusText} /> : null}
          </div>

          {payload.keywords?.length ? (
            <div className="flex flex-wrap gap-2">
              {payload.keywords.map((keyword) => (
                <Badge key={keyword} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">{keyword}</Badge>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {payload.text || "No extra rules text on this card."}
          </div>

          {payload.targetOptions && payload.targetOptions.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Targets</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {payload.targetOptions.map((target) => (
                  <Button
                    key={`${target.side}-${target.target_id}`}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      payload.onTargetSelect?.(target);
                      onOpenChange(false);
                    }}
                  >
                    {target.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {payload.actionLabel ? (
            <Button
              className="w-full h-11"
              onClick={() => {
                payload.onPrimary?.();
                onOpenChange(false);
              }}
              disabled={payload.primaryDisabled}
            >
              {payload.actionLabel}
            </Button>
          ) : null}

          {payload.disabledReason ? <div className="text-sm text-muted-foreground">{payload.disabledReason}</div> : null}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] bg-background border-border/60">
          <DrawerHeader className="text-left px-4 pb-2">
            <DrawerTitle>{payload.title}</DrawerTitle>
            <DrawerDescription>{payload.subtitle || "Card detail"}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-5 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border/60 bg-background/98">
        <DialogHeader>
          <DialogTitle>{payload.title}</DialogTitle>
          <DialogDescription>{payload.subtitle || "Card detail"}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

function UnitCard({
  unit,
  selected,
  onClick,
  disabled,
  compact,
}: {
  unit: VisibleBoardUnit;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const hasGuard = unit.keywords?.includes("guard");
  const hasPierce = unit.keywords?.includes("pierce");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || (!compact && disabled)}
      className={`w-full ${compact ? "min-w-0" : "sm:w-[148px] lg:w-[168px]"} shrink-0 snap-start rounded-2xl overflow-hidden border text-left transition ${selected ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]" : "border-border/60 bg-card/90 hover:border-primary/35"} ${disabled ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img src={artFor(unit.art_path)} alt={unit.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-2">
          <Badge className={`px-2 py-0.5 text-[10px] ${unit.can_attack ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-zinc-900/80 text-zinc-200 border-zinc-700/60"} hover:bg-inherit`}>
            {unit.can_attack ? "Ready" : "Spent"}
          </Badge>
          {(hasGuard || hasPierce) ? (
            <div className="flex gap-1 flex-wrap justify-end">
              {hasGuard ? <Badge className="px-1.5 py-0.5 text-[10px] bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/15">Guard</Badge> : null}
              {hasPierce ? <Badge className="px-1.5 py-0.5 text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/15">Pierce</Badge> : null}
            </div>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent px-2.5 py-2">
          <div className="text-white text-sm font-semibold truncate">{unit.name}</div>
        </div>
      </div>
      <div className="p-2.5 bg-card/95 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl bg-background/60 px-2 py-1.5 flex items-center gap-1.5 font-semibold"><Swords className="w-3.5 h-3.5 text-rose-300" /> {unit.attack}</div>
          <div className="rounded-xl bg-background/60 px-2 py-1.5 flex items-center gap-1.5 font-semibold"><Heart className="w-3.5 h-3.5 text-emerald-300" /> {unit.health}/{unit.max_health}</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground line-clamp-2 min-h-[28px]">{unit.keywords?.length ? unit.keywords.join(" • ") : "Unit"}</div>
      </div>
    </button>
  );
}

function HandCard({
  card,
  selected,
  disabled,
  onClick,
  compact,
}: {
  card: PlayableCard;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || (!compact && disabled)}
      className={`w-full ${compact ? "min-w-0" : "sm:w-[154px] lg:w-[172px]"} shrink-0 snap-start rounded-2xl overflow-hidden border text-left transition ${selected ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]" : "border-border/60 bg-card/85 hover:border-primary/35"} ${disabled ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img src={artFor(card.art_path)} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-2">
          <Badge className="px-2 py-0.5 text-[10px] bg-background/85 text-primary border border-primary/20 hover:bg-background/85">
            {card.cost}<Zap className="w-3 h-3 ml-1" />
          </Badge>
          <Badge className={`px-2 py-0.5 text-[10px] ${card.can_play ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-zinc-900/80 text-zinc-200 border-zinc-700/60"} hover:bg-inherit`}>
            {card.can_play ? "Play" : "Locked"}
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent px-2.5 py-2">
          <div className="text-white text-sm font-semibold truncate">{card.name}</div>
          <div className="text-white/75 text-[10px] uppercase tracking-[0.16em] truncate mt-0.5">{card.card_type}</div>
        </div>
      </div>
      <div className="p-2.5 bg-card/95 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-xl bg-background/60 px-2 py-1.5 flex items-center gap-1.5 font-semibold"><Zap className="w-3.5 h-3.5 text-primary" /> {card.cost}</div>
          <div className="rounded-xl bg-background/60 px-2 py-1.5 flex items-center gap-1.5 font-semibold"><Swords className="w-3.5 h-3.5 text-rose-300" /> {card.attack ?? 0}</div>
          <div className="rounded-xl bg-background/60 px-2 py-1.5 flex items-center gap-1.5 font-semibold"><Heart className="w-3.5 h-3.5 text-emerald-300" /> {card.health ?? 0}</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground line-clamp-2 min-h-[28px]">{card.keywords?.length ? card.keywords.join(" • ") : "No keyword"}</div>
        <div className="text-[11px] text-muted-foreground leading-5 line-clamp-2 min-h-[36px]">{card.can_play ? (card.text || "Ready to play.") : (card.disabled_reason || "Cannot play right now.")}</div>
      </div>
    </button>
  );
}

function HiddenHand({ count, compact }: { count: number; compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground flex items-center justify-between">
        <span>Enemy hand</span>
        <Badge variant="secondary">{count} hidden</Badge>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-[56px] sm:w-[64px] rounded-xl border border-border/60 bg-gradient-to-br from-zinc-900 to-zinc-800 aspect-[3/4] shrink-0 snap-start" />
      ))}
    </div>
  );
}

function SideHeader({ title, hp, energy, deckCount, locationName, handCount, tone }: { title: string; hp: number; energy: string; deckCount: number; locationName?: string | null; handCount: number; tone?: string }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
        <div className="font-semibold text-base sm:text-lg mt-1 truncate">{locationName ? `${title} • ${locationName}` : title}</div>
      </div>
      <div className="flex gap-2 flex-wrap md:justify-end">
        <StatPill icon={<Crown className={`w-3.5 h-3.5 ${tone ?? "text-primary"}`} />} value={hp} />
        <StatPill icon={<Zap className="w-3.5 h-3.5 text-primary" />} value={energy} />
        <StatPill icon={<Shield className="w-3.5 h-3.5 text-blue-400" />} value={`Deck ${deckCount}`} />
        <StatPill icon={<Target className="w-3.5 h-3.5 text-zinc-300" />} value={`Hand ${handCount}`} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/35 px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm sm:text-base font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function RewardBanner({
  winnerText,
  reason,
  reward,
}: {
  winnerText: string;
  reason?: string | null;
  reward?: MatchResponse["state"]["reward"];
}) {
  return (
    <div className="rounded-[26px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/14 via-emerald-500/8 to-background/70 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <div className="font-semibold text-base sm:text-lg">{winnerText}</div>
          <div className="text-sm text-muted-foreground mt-1">{reason || reward?.summary || "Match complete."}</div>
        </div>
      </div>

      {reward?.cards?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2"><Gift className="w-4 h-4 text-primary" /> Prize cards</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reward.cards.map((card, index) => (
              <div key={`${card.name}-${index}`} className="rounded-2xl overflow-hidden border border-border/60 bg-card/80">
                <div className="aspect-[3/4] bg-muted">
                  <img src={artFor(card.art_path)} alt={card.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-1">{card.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-primary mt-1">{card.rarity || "Reward"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionPanel({
  isMobile,
  selectedAttacker,
  selectedPlayCard,
  attackTargets,
  playTargets,
  submitAttack,
  submitPlay,
  readyAttackers,
  playableCount,
  meHp,
  enemyHp,
  canAct,
  canEndTurn,
  isActing,
  finished,
  onEndTurn,
}: {
  isMobile: boolean;
  selectedAttacker: AttackerOption | null;
  selectedPlayCard: PlayableCard | null;
  attackTargets: TargetOption[];
  playTargets: TargetOption[];
  submitAttack: (target: TargetOption) => Promise<void>;
  submitPlay: (target?: TargetOption) => Promise<void>;
  readyAttackers: number;
  playableCount: number;
  meHp: number;
  enemyHp: number;
  canAct: boolean;
  canEndTurn: boolean;
  isActing?: boolean;
  finished: boolean;
  onEndTurn: () => void | Promise<void>;
}) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle>{isMobile ? "Turn actions" : "Attacks & turn controls"}</CardTitle>
        <CardDescription>Select one of your ready units, then tap an enemy unit or the enemy leader on the Board tab.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedAttacker ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="font-semibold">Attack with {selectedAttacker.name}</div>
            <div className="text-sm text-muted-foreground">Tap the enemy unit or leader on the Board tab, or use the quick targets below.</div>
            <div className="grid gap-2">
              {attackTargets.map((target) => (
                <Button key={`${target.side}-${target.target_id}`} variant="outline" className="justify-start" onClick={() => submitAttack(target)} disabled={isActing || !canAct}>
                  {target.label}
                </Button>
              ))}
            </div>
          </div>
        ) : selectedPlayCard ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="font-semibold">Play {selectedPlayCard.name}</div>
            {playTargets.length === 0 ? (
              <Button onClick={() => submitPlay()} className="w-full sm:w-auto" disabled={isActing || !canAct || !selectedPlayCard.can_play}>Play card</Button>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pick a target for this card.</div>
                <div className="grid gap-2">
                  {playTargets.map((target) => (
                    <Button key={`${target.side}-${target.target_id}`} variant="outline" className="justify-start" onClick={() => submitPlay(target)} disabled={isActing || !canAct || !selectedPlayCard.can_play}>
                      {target.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            {isMobile ? "Tap one of your ready units in Board, then tap the enemy unit or leader you want to hit." : "Select a ready unit from your board, then click the enemy target you want to attack."}
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-background/35 p-4 space-y-2 text-sm text-muted-foreground">
          <div>Leader HP: <span className="font-semibold text-foreground">You {meHp}</span> • <span className="font-semibold text-foreground">Enemy {enemyHp}</span></div>
          <div>Ready attackers: <span className="font-semibold text-foreground">{readyAttackers}</span></div>
          <div>Playable cards: <span className="font-semibold text-foreground">{playableCount}</span></div>
        </div>

        <Button className="w-full h-11" disabled={!canEndTurn || !canAct || !!isActing || finished} onClick={onEndTurn}>
          End turn
        </Button>
      </CardContent>
    </Card>
  );
}

function LogPanel({ lines, totalCount, showAllLog, setShowAllLog, isMobile }: { lines: string[]; totalCount: number; showAllLog: boolean; setShowAllLog: (value: boolean) => void; isMobile: boolean; }) {
  return (
    <Card className="border-border/60 bg-background/25">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Battle log</CardTitle>
            <CardDescription>Newest updates from the live engine.</CardDescription>
          </div>
          {isMobile && totalCount > 4 ? (
            <Button variant="outline" size="sm" onClick={() => setShowAllLog(!showAllLog)}>
              <ScrollText className="w-4 h-4 mr-2" /> {showAllLog ? "Less" : "More"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px] sm:h-[320px] pr-4">
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={`${line}-${index}`} className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 text-sm leading-6">{line}</div>
            ))}
          </div>
        </ScrollArea>
        {isMobile && totalCount > 4 && !showAllLog ? (
          <div className="pt-3 text-xs text-muted-foreground flex items-center gap-2"><ChevronDown className="w-4 h-4" /> Showing latest 4 updates.</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LiveMatchBoard({
  match,
  viewerId,
  onAction,
  isActing,
}: {
  match: MatchResponse;
  viewerId: string;
  onAction: (payload: { action: string; card_instance_id?: string; attacker_id?: string; target_side?: string | null; target_id?: string | null }) => Promise<void> | void;
  isActing?: boolean;
}) {
  const isMobile = useIsMobile();
  const state = match.state;
  const isPlayerOne = state.player_one.discord_id === viewerId;
  const me = isPlayerOne ? state.player_one : state.player_two;
  const enemy = isPlayerOne ? state.player_two : state.player_one;
  const playableCards = state.available_actions?.playable_cards ?? [];
  const attackers = state.available_actions?.attackers ?? [];
  const [selectedPlayCard, setSelectedPlayCard] = useState<PlayableCard | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<AttackerOption | null>(null);
  const [inspector, setInspector] = useState<InspectorPayload | null>(null);
  const [showAllLog, setShowAllLog] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<"hand" | "actions" | "log" | null>(null);

  const playTargets = selectedPlayCard?.target_options ?? [];
  const attackTargets = selectedAttacker?.target_options ?? [];
  const heroAttackTarget = useMemo(
    () => attackTargets.find((target) => target.side === "enemy" && target.target_id === null) ?? null,
    [attackTargets],
  );
  const enemyHandCount = Array.isArray(enemy.hand) && enemy.hand.length === 1 && "count" in enemy.hand[0] ? Number(enemy.hand[0].count ?? 0) : enemy.hand.length;
  const myHandCount = Array.isArray(me.hand) && me.hand.length === 1 && "count" in me.hand[0] ? Number(me.hand[0].count ?? 0) : me.hand.length;
  const readyAttackers = useMemo(() => attackers.filter((entry) => entry.can_attack).length, [attackers]);
  const latestLogLine = state.log_tail && state.log_tail.length > 0 ? state.log_tail[state.log_tail.length - 1] : null;
  const logLines = isMobile && !showAllLog ? (state.log_tail ?? []).slice(-4) : (state.log_tail ?? []);
  const mobileCardLayout = isMobile ? "grid grid-cols-2 gap-3" : "flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1";
  const canAct = !!state.available_actions?.can_act;
  const canEndTurn = !!state.available_actions?.can_end_turn;
  const winnerText = state.winner_discord_id === viewerId
    ? "You won the match."
    : state.winner_discord_id
      ? `${enemy.display_name} won the match.`
      : "The match ended in a draw.";
  const selectionSummary = selectedAttacker
    ? `Attacking with ${selectedAttacker.name}`
    : selectedPlayCard
      ? `Playing ${selectedPlayCard.name}`
      : canAct
        ? "Pick a card or attacker"
        : `Waiting on ${enemy.display_name}`;

  const submitPlay = async (target?: TargetOption) => {
    if (!selectedPlayCard) return;
    await onAction({
      action: "play_card",
      card_instance_id: selectedPlayCard.instance_id,
      target_side: target?.side ?? null,
      target_id: target?.target_id ?? null,
    });
    setSelectedPlayCard(null);
  };

  const submitAttack = async (target: TargetOption) => {
    if (!selectedAttacker) return;
    await onAction({
      action: "attack",
      attacker_id: selectedAttacker.unit_id,
      target_id: target.target_id ?? null,
      target_side: target.side,
    });
    setSelectedAttacker(null);
  };

  const openInspector = (payload: InspectorPayload) => setInspector(payload);

  const boardPanel = (
    <div className="space-y-4">
      <Card className="border-border/60 bg-background/25">
        <CardContent className="p-3 sm:p-4 space-y-4">
          <SideHeader
            title={enemy.display_name}
            hp={enemy.hp}
            energy={`${enemy.energy}/${enemy.max_energy}`}
            deckCount={enemy.deck.count}
            locationName={enemy.location?.name}
            handCount={enemyHandCount}
            tone="text-rose-400"
          />
          {enemy.board.length > 0 ? (
            <div className={mobileCardLayout}>
              {enemy.board.map((unit) => {
                const attackTarget = attackTargets.find((target) => target.side === "enemy" && target.target_id === unit.unit_id) ?? null;
                const openEnemyInspector = () => openInspector({
                  title: unit.name,
                  subtitle: `${enemy.display_name} field unit`,
                  image: artFor(unit.art_path),
                  attack: unit.attack,
                  health: unit.health,
                  maxHealth: unit.max_health,
                  keywords: unit.keywords,
                  statusText: unit.can_attack ? "Ready" : "Spent",
                  text: attackTarget
                    ? `Attack target ready. ${selectedAttacker?.name || "Selected unit"} can hit this card now.`
                    : (unit.keywords?.length ? `Keywords: ${unit.keywords.join(", ")}.` : "No special keywords."),
                  actionLabel: attackTarget ? `Attack ${unit.name}` : undefined,
                  primaryDisabled: !attackTarget || !canAct || !!isActing,
                  onPrimary: attackTarget ? () => submitAttack(attackTarget) : undefined,
                });
                return (
                  <UnitCard
                    key={unit.unit_id}
                    unit={unit}
                    compact={isMobile}
                    selected={!!attackTarget}
                    onClick={() => {
                      if (attackTarget && canAct && !isActing) {
                        void submitAttack(attackTarget);
                        return;
                      }
                      openEnemyInspector();
                    }}
                  />
                );
              })}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-border/60 p-4 sm:p-5 text-sm text-muted-foreground">Opponent board is empty. Push damage to their leader if you have a ready attacker.</div>}
          <button
            type="button"
            onClick={() => {
              if (heroAttackTarget && canAct && !isActing) {
                void submitAttack(heroAttackTarget);
                return;
              }
              openInspector({
                title: `${enemy.display_name} leader`,
                subtitle: "Enemy leader",
                image: "/card-placeholder.png",
                health: enemy.hp,
                text: heroAttackTarget
                  ? `${selectedAttacker?.name || "Your attacker"} can hit the enemy leader directly right now.`
                  : (enemy.board.length === 0
                    ? "If you select one of your ready units with attack power, you can hit enemy HP directly."
                    : "You need to clear the enemy board first unless your attacker has Pierce."),
                statusText: heroAttackTarget ? "Targetable" : "Protected",
                actionLabel: heroAttackTarget ? `Attack ${enemy.display_name}` : undefined,
                primaryDisabled: !heroAttackTarget || !canAct || !!isActing,
                onPrimary: heroAttackTarget ? () => submitAttack(heroAttackTarget) : undefined,
              });
            }}
            disabled={!heroAttackTarget && !isMobile}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${heroAttackTarget ? "border-primary/35 bg-primary/8 hover:border-primary/55" : "border-border/60 bg-background/35"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Enemy leader</div>
                <div className="mt-1 text-sm font-semibold">{enemy.display_name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/15">
                  <Heart className="w-3.5 h-3.5 mr-1" /> {enemy.hp}
                </Badge>
                {heroAttackTarget ? <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">Tap to attack</Badge> : null}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {heroAttackTarget
                ? `${selectedAttacker?.name || "Your selected attacker"} can hit enemy HP now.`
                : (enemy.board.length === 0
                  ? "Select any ready unit with attack power to hit enemy HP directly."
                  : "Enemy units are still protecting the leader." )}
            </div>
          </button>
          <HiddenHand count={enemyHandCount} compact={isMobile} />
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary flex items-center justify-center">Battlefield</div>

      <Card className="border-border/60 bg-background/25">
        <CardContent className="p-3 sm:p-4 space-y-4">
          <SideHeader
            title={me.display_name}
            hp={me.hp}
            energy={`${me.energy}/${me.max_energy}`}
            deckCount={me.deck.count}
            locationName={me.location?.name}
            handCount={myHandCount}
            tone="text-emerald-400"
          />
          {me.board.length > 0 ? (
            <div className={mobileCardLayout}>
              {me.board.map((unit) => {
                const attackerState = attackers.find((entry) => entry.unit_id === unit.unit_id) ?? null;
                const disabled = !attackerState?.can_attack || !canAct || isActing;
                return (
                  <UnitCard
                    key={unit.unit_id}
                    unit={unit}
                    compact={isMobile}
                    selected={selectedAttacker?.unit_id === unit.unit_id}
                    disabled={disabled}
                    onClick={() => {
                      if (!attackerState?.can_attack || !canAct || isActing) {
                        openInspector({
                          title: unit.name,
                          subtitle: "Your field unit",
                          image: artFor(unit.art_path),
                          attack: unit.attack,
                          health: unit.health,
                          maxHealth: unit.max_health,
                          keywords: unit.keywords,
                          statusText: unit.can_attack ? "Ready" : "Spent",
                          text: attackerState?.attack && attackerState.attack > 0
                            ? "This unit cannot attack right now."
                            : "This unit has no attack power right now.",
                        });
                        return;
                      }
                      setSelectedPlayCard(null);
                      setSelectedAttacker((current) => current?.unit_id === attackerState.unit_id ? null : attackerState);
                    }}
                  />
                );
              })}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-border/60 p-4 sm:p-5 text-sm text-muted-foreground">Your board is empty. Play a unit from your hand to start controlling the field.</div>}
        </CardContent>
      </Card>
    </div>
  );

  const handPanel = (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Your hand</CardTitle>
            <CardDescription>{isMobile ? "Tap a card for a full view, then finish the play from the Actions tab." : "Tap a card to preview it and queue the play."}</CardDescription>
          </div>
          {isMobile ? <Badge variant="outline"><Eye className="w-3.5 h-3.5 mr-1" /> Tap to inspect</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {playableCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">No hand actions right now. End the turn or wait for your next draw.</div>
        ) : (
          <div className={mobileCardLayout}>
            {playableCards.map((card) => (
              <HandCard
                key={card.instance_id}
                card={card}
                compact={isMobile}
                selected={selectedPlayCard?.instance_id === card.instance_id}
                disabled={!canAct || !!isActing}
                onClick={() => {
                  const toggle = () => {
                    if (!card.can_play || !canAct || !!isActing) return;
                    setSelectedAttacker(null);
                    setSelectedPlayCard((current) => current?.instance_id === card.instance_id ? null : card);
                  };

                  if (isMobile) {
                    openInspector({
                      title: card.name,
                      subtitle: `${card.card_type} • ${card.can_play ? "Ready" : "Locked"}`,
                      image: artFor(card.art_path),
                      cost: card.cost,
                      attack: card.attack ?? 0,
                      health: card.health ?? 0,
                      text: card.can_play ? (card.text || "Ready to play.") : (card.disabled_reason || "Cannot play right now."),
                      keywords: card.keywords,
                      actionLabel: card.can_play ? (selectedPlayCard?.instance_id === card.instance_id ? "Card selected" : "Select card") : undefined,
                      primaryDisabled: !card.can_play || !canAct || !!isActing,
                      onPrimary: toggle,
                    });
                    return;
                  }

                  toggle();
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const actionPanel = (
    <ActionPanel
      isMobile={isMobile}
      selectedAttacker={selectedAttacker}
      selectedPlayCard={selectedPlayCard}
      attackTargets={attackTargets}
      playTargets={playTargets}
      submitAttack={submitAttack}
      submitPlay={submitPlay}
      readyAttackers={readyAttackers}
      playableCount={playableCards.filter((entry) => entry.can_play).length}
      meHp={me.hp}
      enemyHp={enemy.hp}
      canAct={canAct}
      canEndTurn={canEndTurn}
      isActing={isActing}
      finished={state.status === "finished"}
      onEndTurn={() => onAction({ action: "end_turn" })}
    />
  );

  const logPanel = <LogPanel lines={logLines} totalCount={state.log_tail?.length ?? 0} showAllLog={showAllLog} setShowAllLog={setShowAllLog} isMobile={isMobile} />;

  return (
    <>
      <CardInspector open={!!inspector} onOpenChange={(open) => !open && setInspector(null)} payload={inspector} isMobile={isMobile} />
      <div className="space-y-5 sm:space-y-6">
        {state.status === "finished" ? <RewardBanner winnerText={winnerText} reason={state.end_reason} reward={state.reward} /> : null}

        <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-card/95 via-card/88 to-background/85 p-4 sm:p-5 lg:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] space-y-4 sm:space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Live match</div>
              <div className="text-base sm:text-lg font-semibold mt-1">Turn {state.turn_number} • Round {state.round}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">{match.kind.toUpperCase()}</Badge>
              <Badge variant="secondary">{state.status === "finished" ? "Finished" : canAct ? "Your turn" : `Waiting on ${enemy.display_name}`}</Badge>
              {!isMobile ? <Badge variant="outline">Win by dropping the enemy leader to 0 or leaving them with no deck, hand, or board.</Badge> : null}
            </div>
          </div>

          {isMobile ? (
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-2xl border border-border/60 bg-background/35 px-2.5 py-2 text-center">
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">HP</div>
                <div className="mt-1 text-sm font-semibold text-emerald-300">{me.hp}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/35 px-2.5 py-2 text-center">
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Enemy</div>
                <div className="mt-1 text-sm font-semibold text-rose-300">{enemy.hp}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/35 px-2.5 py-2 text-center">
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Energy</div>
                <div className="mt-1 text-sm font-semibold text-primary">{me.energy}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/35 px-2.5 py-2 text-center">
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Ready</div>
                <div className="mt-1 text-sm font-semibold text-sky-300">{readyAttackers}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <SummaryTile label="Your HP" value={String(me.hp)} accent="text-emerald-300" />
                <SummaryTile label="Enemy HP" value={String(enemy.hp)} accent="text-rose-300" />
                <SummaryTile label="Energy" value={`${me.energy}/${me.max_energy}`} accent="text-primary" />
                <SummaryTile label="Ready Units" value={String(readyAttackers)} accent="text-sky-300" />
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/35 p-3 sm:p-4 text-sm text-muted-foreground leading-6">
                Battle flow is tighter now: tap one of your ready units, then tap the exact enemy card you want to attack. If the enemy field is empty, any ready unit with attack power can hit enemy HP directly.
              </div>
            </>
          )}

          {isMobile ? (
            <div className="space-y-4 pb-28">
              <div className="rounded-2xl border border-border/60 bg-background/40 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Match flow</div>
                    <div className="mt-1 text-sm font-semibold leading-5">{selectionSummary}</div>
                  </div>
                  <Badge className="shrink-0 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
                    {match.kind.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{state.status === "finished" ? "Finished" : canAct ? "Your turn" : `Waiting on ${enemy.display_name}`}</Badge>
                  <Badge variant="outline">Field first</Badge>
                  <Badge variant="outline">Tap cards</Badge>
                </div>
              </div>

              {boardPanel}

              <Card className="border-border/60 bg-background/30">
                <CardContent className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Latest event</div>
                      <div className="mt-1 text-sm leading-5 text-foreground">{latestLogLine || "No battle events yet."}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setMobileDrawer("log")}>
                      <ScrollText className="w-4 h-4 mr-2" /> Log
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {state.status !== "finished" ? (
                <div className="sticky bottom-[5.25rem] z-30">
                  <div className="rounded-[24px] border border-primary/20 bg-background/92 backdrop-blur-xl shadow-[0_16px_44px_rgba(0,0,0,0.35)] p-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="h-11 justify-center" onClick={() => setMobileDrawer("hand")}>
                        <Eye className="w-4 h-4 mr-2" /> Hand
                      </Button>
                      <Button variant="outline" className="h-11 justify-center" onClick={() => setMobileDrawer("actions")}>
                        <Swords className="w-4 h-4 mr-2" /> Act
                      </Button>
                      <Button className="h-11" disabled={!canEndTurn || !canAct || !!isActing || state.status === "finished"} onClick={() => onAction({ action: "end_turn" })}>
                        End turn
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl border border-border/60 bg-background/45 px-2.5 py-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">HP</div>
                        <div className="mt-1 text-sm font-semibold text-emerald-300">{me.hp}</div>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/45 px-2.5 py-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Energy</div>
                        <div className="mt-1 text-sm font-semibold text-primary">{me.energy}/{me.max_energy}</div>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/45 px-2.5 py-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Ready</div>
                        <div className="mt-1 text-sm font-semibold text-sky-300">{readyAttackers}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <Drawer open={mobileDrawer === "hand"} onOpenChange={(open) => setMobileDrawer(open ? "hand" : null)}>
                <DrawerContent className="max-h-[92vh] bg-background border-border/60">
                  <DrawerHeader className="text-left px-4 pb-2">
                    <DrawerTitle>Your hand</DrawerTitle>
                    <DrawerDescription>Like other strong mobile card games, the board stays visible while hand management moves into a quick drawer.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-5 overflow-y-auto">{handPanel}</div>
                </DrawerContent>
              </Drawer>

              <Drawer open={mobileDrawer === "actions"} onOpenChange={(open) => setMobileDrawer(open ? "actions" : null)}>
                <DrawerContent className="max-h-[92vh] bg-background border-border/60">
                  <DrawerHeader className="text-left px-4 pb-2">
                    <DrawerTitle>Turn actions</DrawerTitle>
                    <DrawerDescription>Pick attackers, target enemies, or finish your turn without losing sight of the battlefield.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-5 overflow-y-auto">{actionPanel}</div>
                </DrawerContent>
              </Drawer>

              <Drawer open={mobileDrawer === "log"} onOpenChange={(open) => setMobileDrawer(open ? "log" : null)}>
                <DrawerContent className="max-h-[92vh] bg-background border-border/60">
                  <DrawerHeader className="text-left px-4 pb-2">
                    <DrawerTitle>Battle log</DrawerTitle>
                    <DrawerDescription>Recent actions and win flow.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-5 overflow-y-auto">{logPanel}</div>
                </DrawerContent>
              </Drawer>
            </div>
          ) : (
            <div className="grid xl:grid-cols-[1.18fr_0.82fr] gap-5">
              <div className="space-y-5">{boardPanel}{handPanel}</div>
              <div className="space-y-5">{actionPanel}{logPanel}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
