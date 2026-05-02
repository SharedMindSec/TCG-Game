import { useMemo, useState } from "react";
import { useGetMe, useListCards } from "@workspace/api-client-react";
import type { Card as GameCard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { CardItem } from "@/components/card-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameState } from "@/hooks/use-game-state";
import { pickWeightedCards, rewardEntry, syncCardReward } from "@/lib/game-helpers";
import { AlertTriangle, Coins, Compass, Gem, Mountain, ShieldAlert, Sparkles, Swords, Trees, Trophy } from "lucide-react";

const regions = [
  { id: "golden-ward", title: "Golden Ward", icon: Trees, flavor: "Safer routes with lighter hazards and decent scout rewards.", bonusCredits: 110 },
  { id: "signal-hollows", title: "Signal Hollows", icon: Mountain, flavor: "Balanced runs where ambushes and big finds both happen often.", bonusCredits: 150 },
  { id: "rift-bazaar", title: "Rift Bazaar", icon: Sparkles, flavor: "High-risk paths with more battles, tricks, and swingy outcomes.", bonusCredits: 180 },
];

type RunIntensity = "scout" | "hunt" | "elite";
type EncounterKind = "treasure" | "battle" | "challenge" | "pitfall";

type EncounterResult = {
  kind: EncounterKind;
  title: string;
  log: string[];
  creditsDelta: number;
  crystalsDelta: number;
  rewardCards: GameCard[];
  badgeText: string;
};

const encounterMeta: Record<EncounterKind, { label: string; icon: typeof Trophy }> = {
  treasure: { label: "Treasure", icon: Trophy },
  battle: { label: "Battle", icon: Swords },
  challenge: { label: "Challenge", icon: Sparkles },
  pitfall: { label: "Pitfall", icon: AlertTriangle },
};

function weightedEncounter(intensity: RunIntensity): EncounterKind {
  const table = intensity === "elite"
    ? ["battle", "battle", "pitfall", "pitfall", "treasure", "challenge"]
    : intensity === "hunt"
      ? ["battle", "battle", "treasure", "challenge", "pitfall", "treasure"]
      : ["treasure", "treasure", "challenge", "pitfall", "battle", "treasure"];
  return table[Math.floor(Math.random() * table.length)] as EncounterKind;
}

function buildEncounter(kind: EncounterKind, intensity: RunIntensity, region: typeof regions[number], cards: GameCard[]): EncounterResult {
  const baseCredits = region.bonusCredits + (intensity === "elite" ? 90 : intensity === "hunt" ? 40 : 0);
  const baseCrystals = intensity === "elite" ? 5 : intensity === "hunt" ? 3 : 1;

  if (kind === "pitfall") {
    const creditsLoss = Math.max(30, Math.floor(baseCredits * (0.35 + Math.random() * 0.25)));
    const crystalsLoss = Math.random() > 0.58 ? Math.max(1, Math.floor(baseCrystals * (1 + Math.random()))) : 0;
    return {
      kind,
      title: "Hazard trigger",
      badgeText: "Penalty",
      creditsDelta: -creditsLoss,
      crystalsDelta: -crystalsLoss,
      rewardCards: [],
      log: [
        `You pushed into ${region.title} and hit a trap route instead of a reward lane.`,
        crystalsLoss > 0 ? `You lost ${creditsLoss} credits and ${crystalsLoss} crystals escaping the mess.` : `You lost ${creditsLoss} credits stabilizing the run.`,
        "No reward cards were secured this time.",
      ],
    };
  }

  if (kind === "challenge") {
    const passed = Math.random() < (intensity === "elite" ? 0.45 : intensity === "hunt" ? 0.58 : 0.72);
    const credits = passed ? baseCredits + Math.floor(Math.random() * 80) : 0;
    const crystals = passed ? baseCrystals + Math.floor(Math.random() * 4) : 0;
    const rewardCards = passed && Math.random() > 0.45 ? pickWeightedCards(cards, 1) : [];
    return {
      kind,
      title: passed ? "Challenge cleared" : "Challenge failed",
      badgeText: passed ? "Passed" : "Failed",
      creditsDelta: credits,
      crystalsDelta: crystals,
      rewardCards,
      log: [
        `A route challenge appeared in ${region.title}.`,
        passed ? "You solved it cleanly and earned the payout." : "You missed the challenge window and walked away empty-handed.",
        passed ? `Challenge payout: ${credits} credits${crystals ? ` and ${crystals} crystals` : ""}.` : "No reward payout from the failed challenge.",
        rewardCards.length > 0 ? `Bonus card found: ${rewardCards.map((card) => card.name).join(", ")}.` : "No bonus card came from the challenge.",
      ],
    };
  }

  if (kind === "battle") {
    const won = Math.random() < (intensity === "elite" ? 0.55 : intensity === "hunt" ? 0.68 : 0.8);
    const credits = won ? baseCredits + Math.floor(Math.random() * 100) : -Math.max(20, Math.floor(baseCredits * 0.2));
    const crystals = won ? baseCrystals + Math.floor(Math.random() * 5) : 0;
    const rewardCards = won ? pickWeightedCards(cards, intensity === "elite" && Math.random() > 0.4 ? 2 : 1) : [];
    return {
      kind,
      title: won ? "Skirmish won" : "Skirmish lost",
      badgeText: won ? "Victory" : "Defeat",
      creditsDelta: credits,
      crystalsDelta: crystals,
      rewardCards,
      log: [
        `A hostile battler confronted you in ${region.title}.`,
        won ? "You won the skirmish and looted the field." : "You lost the skirmish and had to retreat.",
        won ? `Battle payout: ${credits} credits${crystals ? ` and ${crystals} crystals` : ""}.` : `Retreat cost: ${Math.abs(credits)} credits.`,
        rewardCards.length > 0 ? `Recovered ${rewardCards.length} battle card${rewardCards.length > 1 ? "s" : ""}: ${rewardCards.map((card) => card.name).join(", ")}.` : "No card reward from this skirmish.",
      ],
    };
  }

  const credits = baseCredits + Math.floor(Math.random() * 120);
  const crystals = baseCrystals + Math.floor(Math.random() * 5);
  const rewardCards = pickWeightedCards(cards, intensity === "elite" ? 2 : Math.random() > 0.45 ? 1 : 0);
  return {
    kind,
    title: "Supply cache",
    badgeText: "Reward",
    creditsDelta: credits,
    crystalsDelta: crystals,
    rewardCards,
    log: [
      `You found a live cache path in ${region.title}.`,
      `Cache payout: ${credits} credits and ${crystals} crystals.`,
      rewardCards.length > 0 ? `Recovered ${rewardCards.length} card${rewardCards.length > 1 ? "s" : ""}: ${rewardCards.map((card) => card.name).join(", ")}.` : "This cache only paid out currency.",
    ],
  };
}

export default function Explore() {
  const { data } = useListCards({ limit: 160 });
  const { data: user } = useGetMe({ query: { retry: false } });
  const { state, actions } = useGameState();
  const { toast } = useToast();
  const [activeRegion, setActiveRegion] = useState(regions[0]);
  const [lastCards, setLastCards] = useState<GameCard[]>([]);
  const [lastEncounter, setLastEncounter] = useState<EncounterResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const reportIcon = useMemo(() => {
    const kind = lastEncounter?.kind ?? "challenge";
    return encounterMeta[kind].icon;
  }, [lastEncounter]);

  const runExplore = async (intensity: RunIntensity) => {
    const cards = data?.cards ?? [];
    if (cards.length === 0) return;

    setIsRunning(true);
    const kind = weightedEncounter(intensity);
    const encounter = buildEncounter(kind, intensity, activeRegion, cards);

    if (encounter.creditsDelta !== 0) actions.addCredits(encounter.creditsDelta);
    if (encounter.crystalsDelta !== 0) actions.addCrystals(encounter.crystalsDelta);

    const rewardLog = [
      rewardEntry({ kind: "currency", label: `${activeRegion.title} credits`, amount: encounter.creditsDelta }),
      ...(encounter.crystalsDelta !== 0 ? [rewardEntry({ kind: "currency", label: `${activeRegion.title} crystals`, amount: encounter.crystalsDelta })] : []),
      ...encounter.rewardCards.map((card) => rewardEntry({ kind: "card", label: card.name, rarity: card.rarity })),
    ];
    actions.recordExplore(rewardLog);

    if (user && encounter.rewardCards.length > 0) {
      await Promise.allSettled(encounter.rewardCards.map((card) => syncCardReward(card.id)));
    }

    setLastCards(encounter.rewardCards);
    setLastEncounter(encounter);
    setIsRunning(false);

    const deltaText = [
      encounter.creditsDelta !== 0 ? `${encounter.creditsDelta > 0 ? "+" : ""}${encounter.creditsDelta} credits` : null,
      encounter.crystalsDelta !== 0 ? `${encounter.crystalsDelta > 0 ? "+" : ""}${encounter.crystalsDelta} crystals` : null,
    ].filter(Boolean).join(", ");

    toast({ title: encounter.title, description: deltaText || "No payout this run." });
  };

  const ReportIcon = reportIcon;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Explore</Badge>
            <h1 className="text-4xl font-serif font-bold mb-3">Exploration now has hazards, battles, and challenges.</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">Not every run should be a reward shower. Routes can now pay out, ambush you, fail a challenge, or dump you into a skirmish.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Credits</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Coins className="w-5 h-5 text-primary" />{state.credits}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Crystals</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Gem className="w-5 h-5 text-cyan-400" />{state.crystals}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Runs</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Compass className="w-5 h-5 text-emerald-400" />{state.exploreRuns}</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Select a region</CardTitle>
              <CardDescription>Each route leans into a different risk profile while keeping the same site look.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {regions.map((region) => {
                const Icon = region.icon;
                const active = activeRegion.id === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(245,158,11,0.08)]" : "border-border/60 bg-background/30 hover:border-primary/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2"><Icon className="w-5 h-5 text-primary" /><span className="font-semibold text-lg">{region.title}</span></div>
                        <p className="text-sm text-muted-foreground leading-6">{region.flavor}</p>
                      </div>
                      <Badge variant="secondary">+{region.bonusCredits} base</Badge>
                    </div>
                  </button>
                );
              })}

              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <Button disabled={isRunning} onClick={() => runExplore("scout")} variant="outline" className="h-12">Scout Route</Button>
                <Button disabled={isRunning} onClick={() => runExplore("hunt")} variant="outline" className="h-12 border-primary/40">Treasure Hunt</Button>
                <Button disabled={isRunning} onClick={() => runExplore("elite")} className="h-12">Elite Sweep</Button>
              </div>

              <div className="grid md:grid-cols-4 gap-3 pt-2 text-sm">
                {Object.entries(encounterMeta).map(([key, meta]) => {
                  const Icon = meta.icon;
                  return <div key={key} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 flex items-center gap-2 text-muted-foreground"><Icon className="w-4 h-4 text-primary" /> {meta.label}</div>;
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Last run report</CardTitle>
              <CardDescription>Exploration can now go well, go badly, or throw a fight at you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background/35 p-4 space-y-4">
                {lastEncounter ? (
                  <>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"><ReportIcon className="w-5 h-5 text-primary" /></div>
                        <div>
                          <div className="font-semibold">{lastEncounter.title}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{encounterMeta[lastEncounter.kind].label}</div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">{lastEncounter.badgeText}</Badge>
                    </div>
                    <div className="space-y-3">
                      {lastEncounter.log.map((line, index) => (
                        <div key={`${line}-${index}`} className="flex items-start gap-3 text-sm leading-6">
                          {lastEncounter.kind === "pitfall" ? <ShieldAlert className="w-4 h-4 text-amber-400 mt-1 shrink-0" /> : <Swords className="w-4 h-4 text-primary mt-1 shrink-0" />}
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Pick a region and run it. The first report will show here.</div>
                )}
              </div>

              {lastCards.length > 0 && (
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recovered cards</div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {lastCards.map((card) => <CardItem key={`${card.id}-${card.name}`} card={card} />)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
