import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/use-game-state";
import { useGetMe } from "@workspace/api-client-react";
import { Coins, Compass, Crown, Gem, Layers3, Shield, Swords, Ticket, Trophy } from "lucide-react";

const panels = [
  {
    title: "Deck Builder",
    href: "/decks",
    icon: Layers3,
    description: "Build intuitive saved decks with real card art, counts, and active-deck switching.",
    accent: "from-amber-500/20 to-primary/10",
  },
  {
    title: "Explore",
    href: "/explore",
    icon: Compass,
    description: "Scout regions, trigger card encounters, and farm credits, crystals, and rewards.",
    accent: "from-primary/25 to-orange-500/10",
  },
  {
    title: "NPC Battles",
    href: "/npc-battles",
    icon: Shield,
    description: "Fight themed AI bosses with your saved deck and clickable turn controls.",
    accent: "from-blue-500/20 to-cyan-500/10",
  },
  {
    title: "PvP Arena",
    href: "/pvp-arena",
    icon: Swords,
    description: "Host room codes, join live duels, and battle another player with the same board UI.",
    accent: "from-purple-500/20 to-fuchsia-500/10",
  },
  {
    title: "Tournament Play",
    href: "/tournaments",
    icon: Crown,
    description: "Spend tickets, enter cups, and chase weekly placements and event points.",
    accent: "from-emerald-500/20 to-primary/10",
  },
];

export default function GameHub() {
  const { state, derived } = useGameState();
  const { data: user } = useGetMe({ query: { retry: false } });

  return (
    <Layout>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="container mx-auto px-4 py-14 relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Game Hub</Badge>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Keep the same look. Add the real game loop.</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                This hub keeps the current BDC TCG style while opening paths into exploration, AI duels, PvP, shop flow, tournaments, and ladder progression.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/decks">Build a Deck</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/shop">Open the Shop</Link></Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mt-10">
            <Card className="bg-card/70 backdrop-blur border-border/60">
              <CardHeader className="pb-3"><CardDescription>Credits</CardDescription></CardHeader>
              <CardContent><div className="flex items-center gap-3 text-3xl font-black"><Coins className="w-7 h-7 text-primary" />{state.credits.toLocaleString()}</div></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur border-border/60">
              <CardHeader className="pb-3"><CardDescription>Crystals</CardDescription></CardHeader>
              <CardContent><div className="flex items-center gap-3 text-3xl font-black"><Gem className="w-7 h-7 text-cyan-400" />{state.crystals.toLocaleString()}</div></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur border-border/60">
              <CardHeader className="pb-3"><CardDescription>Tournament Tickets</CardDescription></CardHeader>
              <CardContent><div className="flex items-center gap-3 text-3xl font-black"><Ticket className="w-7 h-7 text-emerald-400" />{state.tournamentTickets}</div></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur border-border/60">
              <CardHeader className="pb-3"><CardDescription>Ladder Rank</CardDescription></CardHeader>
              <CardContent><div className="flex items-center gap-3 text-3xl font-black"><Trophy className="w-7 h-7 text-amber-400" />{derived.rankLabel}</div></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur border-border/60">
              <CardHeader className="pb-3"><CardDescription>Account</CardDescription></CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{user ? user.username : "Guest"}</div>
                <p className="text-sm text-muted-foreground mt-1">{user ? "Progress can sync to your profile and collection." : "Create an account to save progress and sync rewards."}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Card key={panel.title} className="relative overflow-hidden border-border/60 bg-card/80">
                <div className={`absolute inset-0 bg-gradient-to-br ${panel.accent}`} />
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-background/70 border border-border/60 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{panel.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">{panel.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button asChild variant="outline" className="w-full border-border/70 bg-background/40">
                    <Link href={panel.href}>Open {panel.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] mt-10">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Progress snapshot</CardTitle>
              <CardDescription>Quick numbers for the gameplay systems you wanted folded into the site.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border/60 p-4 bg-background/40">
                <div className="text-sm text-muted-foreground">Explore Runs</div>
                <div className="text-3xl font-black mt-2">{state.exploreRuns}</div>
              </div>
              <div className="rounded-2xl border border-border/60 p-4 bg-background/40">
                <div className="text-sm text-muted-foreground">NPC Record</div>
                <div className="text-3xl font-black mt-2">{state.npcWins}-{state.npcLosses}</div>
              </div>
              <div className="rounded-2xl border border-border/60 p-4 bg-background/40">
                <div className="text-sm text-muted-foreground">PvP Record</div>
                <div className="text-3xl font-black mt-2">{state.pvpWins}-{state.pvpLosses}</div>
              </div>
              <div className="rounded-2xl border border-border/60 p-4 bg-background/40">
                <div className="text-sm text-muted-foreground">Tournament Points</div>
                <div className="text-3xl font-black mt-2">{state.tournamentPoints}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Recent rewards</CardTitle>
              <CardDescription>Latest shop pulls, explore finds, and battle payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.recentRewards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground bg-background/30">
                  No rewards yet. Open a pack, explore a zone, or win a battle.
                </div>
              ) : state.recentRewards.map((reward) => (
                <div key={reward.id} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{reward.label}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{reward.kind}{reward.rarity ? ` • ${reward.rarity}` : ""}</div>
                  </div>
                  {reward.amount ? <Badge variant="secondary">+{reward.amount}</Badge> : <Badge variant="secondary">Unlocked</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
