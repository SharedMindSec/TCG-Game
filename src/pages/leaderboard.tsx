import { Layout } from "@/components/layout";
import { useGetLeaderboard, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Swords, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameState } from "@/hooks/use-game-state";
import { seededBattlers, seededTournamentBoard } from "@/lib/game-helpers";

function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1: return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    case 2: return <Medal className="w-6 h-6 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;
    case 3: return <Award className="w-6 h-6 text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
    default: return <span className="font-bold text-muted-foreground text-lg w-6 text-center">{rank}</span>;
  }
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const { data: user } = useGetMe({ query: { retry: false } });
  const { state, derived } = useGameState();
  const battlers = seededBattlers(derived.ladderScore, user?.username ?? "You");
  const tournaments = seededTournamentBoard(state.tournamentPoints, user?.username ?? "You");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Leaderboards</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Collectors, battlers, and tournament players now each have a place in the web app.</p>
        </div>

        <Tabs defaultValue="collectors">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto h-11 mb-8">
            <TabsTrigger value="collectors">Collectors</TabsTrigger>
            <TabsTrigger value="battlers">Battlers</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          </TabsList>

          <TabsContent value="collectors">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-6 md:col-span-7">Collector</div>
                <div className="col-span-2 text-right">Cards</div>
                <div className="col-span-2 text-right">Unique</div>
              </div>

              <div className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-2 md:col-span-1 flex justify-center"><Skeleton className="w-6 h-6 rounded-full" /></div>
                      <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <div className="col-span-2 flex justify-end"><Skeleton className="h-5 w-12" /></div>
                      <div className="col-span-2 flex justify-end"><Skeleton className="h-5 w-12" /></div>
                    </div>
                  ))
                ) : leaderboard?.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No collectors found.</div>
                ) : (
                  leaderboard?.map((entry) => (
                    <div key={entry.userId} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/20 ${entry.rank <= 3 ? 'bg-primary/5' : ''}`}>
                      <div className="col-span-2 md:col-span-1 flex justify-center items-center"><RankIcon rank={entry.rank} /></div>
                      <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                        <Avatar className={`w-10 h-10 border-2 ${entry.rank === 1 ? 'border-yellow-400' : entry.rank === 2 ? 'border-gray-300' : entry.rank === 3 ? 'border-amber-700' : 'border-transparent'}`}>
                          <AvatarImage src={entry.discordAvatarUrl || entry.avatarUrl || ''} />
                          <AvatarFallback className="bg-muted text-muted-foreground">{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={`font-bold ${entry.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>{entry.username}</span>
                          {entry.discordUsername && <span className="text-xs text-[#5865F2]">@{entry.discordUsername}</span>}
                        </div>
                      </div>
                      <div className="col-span-2 text-right font-black text-primary">{entry.cardCount.toLocaleString()}</div>
                      <div className="col-span-2 text-right font-medium text-muted-foreground">{entry.uniqueCards.toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="battlers">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-6">Battler</div>
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-2 text-right">Record</div>
              </div>
              <div className="divide-y divide-border/50">
                {battlers.map((entry) => (
                  <div key={entry.rank + entry.name} className={`grid grid-cols-12 gap-4 p-4 items-center ${entry.rank <= 3 ? 'bg-primary/5' : ''}`}>
                    <div className="col-span-2 md:col-span-1 flex justify-center items-center"><RankIcon rank={entry.rank} /></div>
                    <div className="col-span-6 flex items-center gap-3"><Swords className="w-4 h-4 text-primary" /><span className="font-semibold">{entry.name}</span></div>
                    <div className="col-span-2 text-right font-black text-primary">{entry.score}</div>
                    <div className="col-span-2 text-right text-sm text-muted-foreground">{entry.wins}-{entry.losses}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-6">Player</div>
                <div className="col-span-2 text-right">Points</div>
                <div className="col-span-2 text-right">Events</div>
              </div>
              <div className="divide-y divide-border/50">
                {tournaments.map((entry) => (
                  <div key={entry.rank + entry.name} className={`grid grid-cols-12 gap-4 p-4 items-center ${entry.rank <= 3 ? 'bg-primary/5' : ''}`}>
                    <div className="col-span-2 md:col-span-1 flex justify-center items-center"><RankIcon rank={entry.rank} /></div>
                    <div className="col-span-6 flex items-center gap-3"><Crown className="w-4 h-4 text-primary" /><span className="font-semibold">{entry.name}</span></div>
                    <div className="col-span-2 text-right font-black text-primary">{entry.points}</div>
                    <div className="col-span-2 text-right text-sm text-muted-foreground">{entry.events}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
