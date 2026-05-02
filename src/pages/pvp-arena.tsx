import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { LiveMatchBoard } from "@/components/live-match-board";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { gameApi, type DeckSummary, type MatchResponse, type OpenRoom } from "@/lib/game-api";
import { Crown, Swords, Users } from "lucide-react";

export default function PvpArena() {
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { toast } = useToast();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | undefined>();
  const [rooms, setRooms] = useState<OpenRoom[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [hostCode, setHostCode] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hostedMatchId, setHostedMatchId] = useState<number | null>(null);

  const loadDecksAndRooms = async () => {
    const [deckResponse, roomResponse] = await Promise.all([gameApi.listDecks(), gameApi.listOpenRooms()]);
    setDecks(deckResponse.decks);
    setRooms(roomResponse.rooms);
    const active = deckResponse.decks.find((deck) => deck.isActive) ?? deckResponse.decks[0];
    if (active) setSelectedDeckId(active.id);
  };

  useEffect(() => {
    if (!user) return;
    void loadDecksAndRooms().catch((error) => {
      toast({ title: "Could not load arena", description: error instanceof Error ? error.message : "Arena data failed to load.", variant: "destructive" });
    });
  }, [user]);

  useEffect(() => {
    if (match?.status !== "active" && !hostedMatchId) return;
    const timer = window.setInterval(async () => {
      try {
        if (match?.status === "active") {
          const latest = await gameApi.getMatch(match.id);
          if ("state" in latest) setMatch(latest as MatchResponse);
        } else if (hostedMatchId) {
          const waiting = await gameApi.getMatch(hostedMatchId);
          if ("state" in waiting) {
            setMatch(waiting as MatchResponse);
            setHostedMatchId(null);
            setHostCode(null);
          }
        }
        const roomResponse = await gameApi.listOpenRooms();
        setRooms(roomResponse.rooms);
      } catch {
        // ignore polling issues
      }
    }, 2200);
    return () => window.clearInterval(timer);
  }, [match, hostedMatchId]);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? null, [decks, selectedDeckId]);

  const hostRoom = async () => {
    setIsBusy(true);
    try {
      const result = await gameApi.hostPvp({ deckId: selectedDeckId });
      setHostedMatchId(result.id);
      setHostCode(result.joinCode);
      toast({ title: "PvP room created", description: `Share code ${result.joinCode} so another player can join.` });
      const roomResponse = await gameApi.listOpenRooms();
      setRooms(roomResponse.rooms);
    } catch (error) {
      toast({ title: "Could not host room", description: error instanceof Error ? error.message : "PvP host failed.", variant: "destructive" });
    } finally {
      setIsBusy(false);
    }
  };

  const joinRoom = async (code: string) => {
    setIsBusy(true);
    try {
      const joined = await gameApi.joinPvp({ joinCode: code, deckId: selectedDeckId });
      const latest = await gameApi.getMatch(joined.id);
      if ("state" in latest) setMatch(latest as MatchResponse);
      setHostedMatchId(null);
      setHostCode(null);
      setJoinCode("");
      toast({ title: "Match joined", description: "The live PvP duel is ready." });
    } catch (error) {
      toast({ title: "Could not join room", description: error instanceof Error ? error.message : "Join failed.", variant: "destructive" });
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
    return <Layout><div className="container mx-auto px-4 py-16 text-muted-foreground">Loading PvP arena…</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto border-border/60 bg-card/80">
            <CardHeader>
              <Badge className="w-fit bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">PvP Arena</Badge>
              <CardTitle className="text-3xl mt-4">Sign in to host or join live PvP rooms.</CardTitle>
              <CardDescription>The arena now uses saved decks and a hosted room flow instead of fake matchup previews.</CardDescription>
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
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">PvP Arena</Badge>
            <h1 className="text-4xl font-serif font-bold mb-3">Host live PvP rooms and duel with saved decks.</h1>
            <p className="text-muted-foreground max-w-3xl text-lg">This arena now supports room hosting, join codes, server-backed turn state, and the same interactive battle board used by NPC fights.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full xl:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Deck</div><div className="font-black text-lg mt-2 truncate">{selectedDeck?.name ?? "None"}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Open Rooms</div><div className="font-black text-2xl mt-2">{rooms.length}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Mode</div><div className="font-black text-lg mt-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> PvP</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.94fr_1.06fr] gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Arena lobby</CardTitle>
              <CardDescription>Choose the deck you want to use, host a room, or join one with a code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="rounded-2xl border border-border/60 bg-background/35 p-4 space-y-4">
                <div>
                  <div className="font-semibold">Host a room</div>
                  <div className="text-sm text-muted-foreground mt-1">Create a private duel room and share the code.</div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={hostRoom} disabled={isBusy || !selectedDeckId}><Swords className="w-4 h-4 mr-2" /> Host PvP room</Button>
                  <Button variant="outline" asChild><Link href="/decks"><Crown className="w-4 h-4 mr-2" /> Open deck builder</Link></Button>
                </div>
                {hostCode ? <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">Room code: <span className="font-black tracking-[0.24em] text-primary">{hostCode}</span>. This page will auto-switch into the match when someone joins.</div> : null}
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/35 p-4 space-y-4">
                <div>
                  <div className="font-semibold">Join by code</div>
                  <div className="text-sm text-muted-foreground mt-1">Paste a room code from another player.</div>
                </div>
                <div className="flex gap-3">
                  <Input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
                  <Button onClick={() => joinRoom(joinCode)} disabled={isBusy || joinCode.trim().length < 6}>Join</Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold">Open hosted rooms</div>
                {rooms.length === 0 ? <div className="text-sm text-muted-foreground">No open rooms right now.</div> : rooms.map((room) => (
                  <div key={room.id} className="rounded-2xl border border-border/60 bg-background/35 p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{room.host}</div>
                      <div className="text-xs text-muted-foreground mt-1">{room.deckName} • Code {room.joinCode}</div>
                    </div>
                    <Button variant="outline" onClick={() => joinRoom(room.joinCode)} disabled={isBusy}>Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Match board</CardTitle>
              <CardDescription>{match ? "The duel is live and interactive." : hostedMatchId ? "Waiting for an opponent to join your room." : "Host or join a room to start the live PvP board."}</CardDescription>
            </CardHeader>
            <CardContent>
              {match ? (
                <LiveMatchBoard match={match} viewerId={String(user.id)} onAction={sendAction} isActing={isBusy} />
              ) : hostedMatchId ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">Waiting for another player. Share room code <span className="font-black tracking-[0.22em] text-primary">{hostCode}</span>.</div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">No live duel loaded yet. Host a room or join one from the lobby on the left.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
