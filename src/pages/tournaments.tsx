import { useMemo, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameState } from "@/hooks/use-game-state";
import { rewardEntry, seededTournamentBoard } from "@/lib/game-helpers";
import { Crown, Medal, Ticket, TimerReset, Trophy } from "lucide-react";

const events = [
  { id: "night-cup", title: "Night Cup", entryTickets: 1, entryCredits: 0, rewardMin: 35, rewardMax: 80, field: 8, text: "Fast single-elimination nightly bracket." },
  { id: "weekend-open", title: "Weekend Open", entryTickets: 1, entryCredits: 250, rewardMin: 70, rewardMax: 140, field: 16, text: "Bigger field and better payouts for ranked grinders." },
  { id: "mythic-major", title: "Mythic Major", entryTickets: 2, entryCredits: 500, rewardMin: 120, rewardMax: 220, field: 32, text: "Top-end event with the largest point swing." },
];

export default function Tournaments() {
  const { state, actions } = useGameState();
  const { data: user } = useGetMe({ query: { retry: false } });
  const { toast } = useToast();
  const [report, setReport] = useState<string[]>([
    "Choose an event and spend tickets to enter.",
    "Tournament points feed the leaderboard and long-term progression.",
  ]);

  const board = useMemo(() => seededTournamentBoard(state.tournamentPoints, user?.username ?? "You"), [state.tournamentPoints, user?.username]);

  const enterEvent = (event: typeof events[number]) => {
    const allowed = actions.spend({ tournamentTickets: event.entryTickets, credits: event.entryCredits });
    if (!allowed) {
      toast({ title: "Entry failed", description: "You do not have enough tickets or credits.", variant: "destructive" });
      return;
    }

    const placement = Math.ceil(Math.random() * event.field);
    const points = Math.max(event.rewardMin, event.rewardMax - placement * 5);
    const payout = 180 + Math.max(0, event.field - placement) * 18;

    actions.addCredits(payout);
    actions.recordTournament(points, [
      rewardEntry({ kind: "trophy", label: `${event.title} placement`, amount: points }),
      rewardEntry({ kind: "currency", label: `${event.title} credits`, amount: payout }),
    ]);

    setReport([
      `You entered ${event.title}.`,
      `Final placement: ${placement} / ${event.field}.`,
      `Tournament rewards: ${points} points and ${payout} credits.`,
    ]);

    toast({ title: "Tournament complete", description: `${event.title}: +${points} points` });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Tournaments</Badge>
            <h1 className="text-4xl font-serif font-bold mb-3">Tournament play and event progression.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">This folds competitive events into the current site so players have a reason to keep collecting and battling.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tickets</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Ticket className="w-5 h-5 text-emerald-400" />{state.tournamentTickets}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Points</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />{state.tournamentPoints}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Season</div><div className="font-black text-2xl mt-2 flex items-center gap-2"><TimerReset className="w-5 h-5 text-cyan-400" />S1</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="space-y-6">
            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>Event list</CardTitle>
                <CardDescription>Simple event cards that can later point to fully wired brackets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-border/60 bg-background/35 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2"><Crown className="w-4 h-4 text-primary" />{event.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{event.text}</div>
                      </div>
                      <Badge variant="secondary">{event.field} players</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span>{event.entryTickets} ticket{event.entryTickets > 1 ? "s" : ""}</span>
                      <span>{event.entryCredits} credits</span>
                      <span>{event.rewardMin}-{event.rewardMax} points</span>
                    </div>
                    <Button onClick={() => enterEvent(event)} className="w-full">Enter {event.title}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>Last event report</CardTitle>
                <CardDescription>Readable post-event summary block.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.map((line, index) => (
                  <div key={`${line}-${index}`} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm leading-6">{line}</div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Tournament leaderboard</CardTitle>
              <CardDescription>Event-focused board that sits beside the existing collector leaderboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {board.map((entry) => (
                <div key={entry.rank + entry.name} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">#{entry.rank}</div>
                    <div>
                      <div className="font-semibold">{entry.name}</div>
                      <div className="text-xs text-muted-foreground">{entry.events} events entered</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold"><Medal className="w-4 h-4" />{entry.points}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
