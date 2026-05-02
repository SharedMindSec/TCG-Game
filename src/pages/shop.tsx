import { useState } from "react";
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
import { Coins, Gem, ShoppingBag, Star, Ticket } from "lucide-react";

export default function Shop() {
  const { data } = useListCards({ limit: 200 });
  const { data: user } = useGetMe({ query: { retry: false } });
  const { state, actions } = useGameState();
  const { toast } = useToast();
  const [openedCards, setOpenedCards] = useState<GameCard[]>([]);

  const openPack = async (type: "starter" | "champion" | "mythic") => {
    const pool = data?.cards ?? [];
    if (pool.length === 0) return;

    const cost = type === "starter" ? { credits: 450 } : type === "champion" ? { credits: 900, crystals: 20 } : { credits: 1400, crystals: 45 };
    const allowed = actions.spend(cost);

    if (!allowed) {
      toast({ title: "Not enough currency", description: "Farm more credits or crystals in explore and battles.", variant: "destructive" });
      return;
    }

    const count = type === "mythic" ? 5 : 4;
    const cards = pickWeightedCards(pool, count);
    setOpenedCards(cards);

    actions.recordPackOpen(cards.map(card => rewardEntry({ kind: "card", label: card.name, rarity: card.rarity })));

    if (user) {
      await Promise.allSettled(cards.map(card => syncCardReward(card.id)));
    }

    toast({ title: "Pack opened", description: `${cards.length} cards added${user ? " and synced" : " to your session rewards"}.` });
  };

  const buyTickets = () => {
    const allowed = actions.spend({ credits: 600, crystals: 15 });
    if (!allowed) {
      toast({ title: "Not enough currency", description: "You need 600 credits and 15 crystals.", variant: "destructive" });
      return;
    }

    actions.addTickets(2);
    actions.addReward(rewardEntry({ kind: "currency", label: "Tournament ticket bundle", amount: 2 }));
    toast({ title: "Tickets purchased", description: "+2 tournament tickets" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Shop</Badge>
            <h1 className="text-4xl font-serif font-bold mb-3">Buy cards with in-game currencies.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">The shop now fits the same visual identity while tying directly into explore rewards and tournament prep.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Credits</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Coins className="w-5 h-5 text-primary" />{state.credits}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Crystals</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Gem className="w-5 h-5 text-cyan-400" />{state.crystals}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tickets</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Ticket className="w-5 h-5 text-emerald-400" />{state.tournamentTickets}</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="space-y-6">
            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>Packs</CardTitle>
                <CardDescription>Open packs and feed cards into your collection loop.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-2xl border border-border/60 bg-background/35 p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg">Starter Cache</div>
                    <div className="text-sm text-muted-foreground mt-1">4 cards, best for early collection growth.</div>
                  </div>
                  <Button variant="outline" onClick={() => openPack("starter")}>450 credits</Button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/35 p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg">Champion Crate</div>
                    <div className="text-sm text-muted-foreground mt-1">4 cards with better premium odds.</div>
                  </div>
                  <Button variant="outline" onClick={() => openPack("champion")}>900 + 20 crystals</Button>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Mythic Vault</div>
                    <div className="text-sm text-muted-foreground mt-1">5 cards and the strongest shot at top rarity pulls.</div>
                  </div>
                  <Button onClick={() => openPack("mythic")}>1400 + 45 crystals</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>Event supplies</CardTitle>
                <CardDescription>Quick support purchase for tournament access.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-border/60 bg-background/35 p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /> Ticket bundle</div>
                    <div className="text-sm text-muted-foreground mt-1">Adds 2 tournament tickets for weekend cups.</div>
                  </div>
                  <Button variant="outline" onClick={buyTickets}>600 + 15 crystals</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Latest shop opening</CardTitle>
              <CardDescription>{user ? "Rewards can sync to the logged-in account collection." : "Create an account to save opened cards permanently."}</CardDescription>
            </CardHeader>
            <CardContent>
              {openedCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 bg-background/35 text-center text-muted-foreground">
                  Buy a pack to see the opening results here.
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {openedCards.map(card => <CardItem key={`${card.id}-${card.name}`} card={card} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
