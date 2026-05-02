import { Layout } from "@/components/layout";
import { useGetMe, useGetDiscordLinkUrl, useUnlinkDiscord } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SiDiscord } from "react-icons/si";
import { Calendar, Layers, ShieldCheck, Unlink, Swords, Trophy, Compass, Coins } from "lucide-react";
import { format } from "date-fns";
import { useGameState } from "@/hooks/use-game-state";

export default function Profile() {
  const { data: user, isLoading, refetch } = useGetMe({ query: { retry: false } });
  const { data: linkUrl } = useGetDiscordLinkUrl({ query: { enabled: !!user } });
  const unlinkDiscord = useUnlinkDiscord();
  const { toast } = useToast();
  const { state, derived } = useGameState();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-40 w-full rounded-3xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-serif mb-4">Authentication Required</h2>
          <Button asChild><a href="/login">Login to view profile</a></Button>
        </div>
      </Layout>
    );
  }

  const handleDiscordLink = () => {
    if (linkUrl?.url) {
      window.location.href = linkUrl.url;
    }
  };

  const handleDiscordUnlink = () => {
    unlinkDiscord.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Discord Unlinked", description: "Your Discord account has been disconnected." });
        refetch();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to unlink Discord account.", variant: "destructive" });
      }
    });
  };

  const isDiscordLinked = !!user.discordId;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Collector Profile</h1>

        <div className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 via-background to-background"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={user.discordAvatarUrl || user.avatarUrl || ''} />
              <AvatarFallback className="bg-primary/20 text-primary text-4xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-3xl font-black">{user.username}</h2>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full self-center md:self-auto flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {user.role}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground mt-6">
                <div className="flex items-center gap-2 justify-center md:justify-start"><Calendar className="w-4 h-4" /> Joined {format(new Date(user.createdAt), "MMMM yyyy")}</div>
                <div className="flex items-center gap-2 justify-center md:justify-start"><Layers className="w-4 h-4" /> Collection Active</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5"><div className="text-xs text-muted-foreground">Explore Runs</div><div className="text-3xl font-black mt-2 flex items-center gap-2"><Compass className="w-5 h-5 text-primary" />{state.exploreRuns}</div></div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5"><div className="text-xs text-muted-foreground">Battle Record</div><div className="text-3xl font-black mt-2 flex items-center gap-2"><Swords className="w-5 h-5 text-primary" />{state.npcWins + state.pvpWins}-{state.npcLosses + state.pvpLosses}</div></div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5"><div className="text-xs text-muted-foreground">Rank</div><div className="text-3xl font-black mt-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" />{derived.rankLabel}</div></div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5"><div className="text-xs text-muted-foreground">Credits</div><div className="text-3xl font-black mt-2 flex items-center gap-2"><Coins className="w-5 h-5 text-emerald-400" />{state.credits}</div></div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2"><SiDiscord className="text-[#5865F2]" /> Connections</h3>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]"><SiDiscord className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-semibold">Discord Account</h4>
                  <p className="text-sm text-muted-foreground">{isDiscordLinked ? `Connected as ${user.discordUsername}` : 'Not connected'}</p>
                </div>
              </div>

              {isDiscordLinked ? (
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={handleDiscordUnlink} disabled={unlinkDiscord.isPending}>
                  <Unlink className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              ) : (
                <Button onClick={handleDiscordLink} className="bg-[#5865F2] text-white hover:bg-[#4752C4]">Connect Discord</Button>
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-6">Recent game rewards</h3>
            <div className="space-y-3">
              {state.recentRewards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground bg-background/35">No recent rewards yet. Explore, battle, or visit the shop.</div>
              ) : state.recentRewards.map((reward) => (
                <div key={reward.id} className="rounded-xl border border-border/60 bg-background/35 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{reward.label}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{reward.kind}{reward.rarity ? ` • ${reward.rarity}` : ""}</div>
                  </div>
                  <div className="text-sm font-bold text-primary">{reward.amount ? `+${reward.amount}` : "Unlocked"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
