import { Link } from "wouter";
import { useGetFeaturedCards, useGetCardStats } from "@workspace/api-client-react";
import { CardItem } from "@/components/card-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Compass, Crown, Shield, ShoppingBag, Swords, Trophy } from "lucide-react";

const gameModes = [
  { title: "Explore", href: "/explore", icon: Compass, text: "Run regions for card rewards, credits, and crystals." },
  { title: "NPC Battles", href: "/npc-battles", icon: Shield, text: "Fight AI bosses and build PvE progression." },
  { title: "PvP Arena", href: "/pvp-arena", icon: Swords, text: "Queue duels and climb battler standings." },
  { title: "Shop", href: "/shop", icon: ShoppingBag, text: "Spend earned currencies on packs and tickets." },
  { title: "Tournaments", href: "/tournaments", icon: Crown, text: "Enter events and chase seasonal points." },
  { title: "Leaderboards", href: "/leaderboard", icon: Trophy, text: "Track collectors, battlers, and tournament players." },
];

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useGetFeaturedCards();
  const { data: stats, isLoading: statsLoading } = useGetCardStats();

  return (
    <Layout>
      <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Hero Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center">
          <Badge className="mb-6 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Collection + gameplay</Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-200 to-orange-500 drop-shadow-lg">
            Collect. Explore. Battle.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10">
            Keep the current premium BDC TCG look, but turn the site into a fuller game loop with exploration, NPC fights, PvP, shop currency, tournaments, and account-based progression.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/play" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Enter the Game Hub
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 text-lg">
              Create Account
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full border-y border-border/50 py-8 bg-background/50 backdrop-blur-sm">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : stats ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-1">{stats.totalCards}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-1">{stats.totalSets}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-1">6</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Game Modes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-1">3</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Leaderboards</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background relative border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Gameplay systems</h2>
            <p className="text-muted-foreground max-w-2xl">The collector portal now has clear entry points for the systems you wanted added.</p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {gameModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Link key={mode.title} href={mode.href} className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur p-6 hover:border-primary/40 transition group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">{mode.title}</h3>
                  <p className="text-muted-foreground leading-6">{mode.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Legendary Showcase</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))
            ) : featured?.map(card => (
              <CardItem key={card.id} card={card} foil={card.rarity.toLowerCase() === 'legendary'} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
