import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { LiveMatchBoard } from "@/components/live-match-board";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { gameApi, type DeckSummary, type MatchResponse } from "@/lib/game-api";
import { Bot, Shield, Swords } from "lucide-react";

const difficulties = [
  { id: "easy", title: "Street Duelist", text: "Lower-pressure opening to test new decks." },
  { id: "medium", title: "Signal Captain", text: "Balanced AI pressure for standard runs." },
  { id: "hard", title: "Void Marshal", text: "Stronger unit curve and harder punish windows." },
] as const;

export default function NpcBattles() {
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { toast } = useToast();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]["id"]>("medium");
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const loadDecks = async () => {
    const data = await gameApi.listDecks();
    setDecks(data.decks);
    const active = data.decks.find((deck) => deck.isActive) ?? data.decks[0];
    if (active) setSelectedDeckId(active.id);
  };

  useEffect(() => {
    if (!user) return;
    void loadDecks().catch((error) => {
      toast({ title: "Could not load decks", description: error instanceof Error ? error.message : "Decks failed to load.", variant: "destructive" });
    });
  }, [user]);

  useEffect(() => {
    if (!match || match.status !== "active") return;
    const timer = window.setInterval(async () => {
      try {
        const latest = await gameApi.getMatch(match.id);
        if ("state" in latest) setMatch(latest as MatchResponse);
      } catch {
        // ignore poll errors while the user is on the page
      }
    }, 2200);
    return () => window.clearInterval(timer);
  }, [match]);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? null, [decks, selectedDeckId]);

  const startBattle = async () => {
    setIsBusy(true);
    try {
      const started = await gameApi.startNpcBattle({ deckId: selectedDeckId, difficulty });
      setMatch(started);
      toast({ title: "Battle started", description: `You are now facing the ${difficulties.find((entry) => entry.id === difficulty)?.title}.` });
    } catch (error) {
      toast({ title: "Could not start battle", description: error instanceof Error ? error.message : "NPC battle failed to start.", variant: "destructive" });
    } finally {
      setIsBusy(false);
    }
  };

  const sendAction = async (payload: { action: string; card_instance_id?: string; attacker_id?: string; target_side?: string | null; target_id?: string | null }) => {
    if (!match) return;
    setIsBusy(true);
    try {
      const next = await gameApi.actOnMatch(match.id, payload);
      setMatch(next);
    } catch (error) {
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "Could not resolve that action.", variant: "destructive" });
    } finally {
      setIsBusy(false);
    }
  };

  if (userLoading) {
    return <Layout><div className="container mx-auto px-4 py-16 text-muted-foreground">Loading NPC battles…</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto border-border/60 bg-card/80">
            <CardHeader>
              <Badge className="w-fit bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">NPC Battles</Badge>
              <CardTitle className="text-3xl mt-4">Sign in to use real decks in PvE.</CardTitle>
              <CardDescription>The NPC page now runs on the live battle engine, so you need an account and an active deck first.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild><Link href="/login">Create account</Link></Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">NPC Battles</Badge>
            <h1 className="text-4xl font-serif font-bold mb-3">Battle AI opponents with your saved deck.</h1>
            <p className="text-muted-foreground max-w-3xl text-lg">This page now uses the live turn engine, card graphics, deck lists, and clickable actions instead of a fake result preview.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full xl:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Deck</div><div className="font-black text-lg mt-2 truncate">{selectedDeck?.name ?? "None"}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Mode</div><div className="font-black text-lg mt-2">PvE</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Engine</div><div className="font-black text-lg mt-2 flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> Live</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Choose your fight</CardTitle>
              <CardDescription>Select the active deck and AI difficulty before launching the duel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {decks.map((deck) => (
                  <button key={deck.id} onClick={() => setSelectedDeckId(deck.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedDeckId === deck.id ? "border-primary bg-primary/10" : "border-border/60 bg-background/35 hover:border-primary/30"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{deck.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{deck.cardCount} cards {deck.isActive ? "• active" : ""}</div>
                      </div>
                      <Badge variant="secondary">Deck #{deck.id}</Badge>
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                {difficulties.map((entry) => (
                  <button key={entry.id} onClick={() => setDifficulty(entry.id)} className={`w-full rounded-2xl border p-4 text-left transition ${difficulty === entry.id ? "border-primary bg-primary/10" : "border-border/60 bg-background/35 hover:border-primary/30"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{entry.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{entry.text}</div>
                      </div>
                      <Shield className="w-5 h-5 text-primary shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={startBattle} disabled={isBusy || !selectedDeckId}><Swords className="w-4 h-4 mr-2" /> Start battle</Button>
                <Button variant="outline" asChild><Link href="/decks">Open deck builder</Link></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Battle status</CardTitle>
              <CardDescription>{match ? "The live board below is interactive." : "Start a duel to load the live board."}</CardDescription>
            </CardHeader>
            <CardContent>
              {match ? (
                <LiveMatchBoard match={match} viewerId={String(user.id)} onAction={sendAction} isActing={isBusy} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">No match is running yet. Pick a deck, choose a difficulty, and start the duel.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
