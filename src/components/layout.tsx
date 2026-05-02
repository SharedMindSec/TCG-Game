import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Compass, Home, Layers3, Loader2, Menu, Swords, Trophy, User, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const logout = useLogout();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
        window.location.reload();
      }
    });
  };

  const mobileNavLinks = useMemo(() => ([
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/npc-battles", label: "Battle", icon: Swords },
    { href: "/decks", label: "Decks", icon: Layers3 },
    { href: user ? "/profile" : "/login", label: user ? "Profile" : "Login", icon: user ? User : UserPlus },
  ]), [user]);

  const mainLinks = [
    { href: "/play", label: "Play" },
    { href: "/explore", label: "Explore" },
    { href: "/npc-battles", label: "NPC" },
    { href: "/pvp-arena", label: "PvP" },
    { href: "/decks", label: "Decks" },
    { href: "/shop", label: "Shop" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/cards", label: "Cards" },
    { href: "/sets", label: "Sets" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  const compactMobileNav = location === "/npc-battles" || location === "/pvp-arena";

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      <nav className="border-b border-border/50 bg-background/88 backdrop-blur-md sticky top-0 z-50 supports-[backdrop-filter]:bg-background/72">
        <div className="container mx-auto px-3 sm:px-4 min-h-16 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-serif text-lg sm:text-xl font-bold text-primary flex items-center gap-2 tracking-[0.18em] sm:tracking-widest shrink-0">
            BDC TCG
          </Link>

          <div className="hidden xl:flex items-center gap-5 text-sm min-w-0">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`font-medium transition-colors ${location === link.href ? "text-primary" : "hover:text-primary"}`}>
                {link.label}
              </Link>
            ))}
            {user && <Link href="/collection" className={`font-medium transition-colors ${location === "/collection" ? "text-primary" : "hover:text-primary"}`}>My Collection</Link>}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <div className="flex items-center gap-3 min-w-0">
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors truncate max-w-[140px]">
                  {user.username}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
                Create Account
              </Link>
            )}
          </div>

          <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/60" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 px-3 pb-4 pt-3 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${location === link.href ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background/35 hover:border-primary/40 hover:text-primary"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link href="/collection" className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${location === "/collection" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background/35 hover:border-primary/40 hover:text-primary"}`} onClick={() => setMobileOpen(false)}>
                  My Collection
                </Link>
              )}
            </div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-background/35 p-3">
              {user ? (
                <div className="space-y-3">
                  <Link href="/profile" className="block text-sm font-medium hover:text-primary" onClick={() => setMobileOpen(false)}>
                    Signed in as {user.username}
                  </Link>
                  <Button variant="outline" className="w-full" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground h-11 text-sm font-medium">
                    <UserPlus className="w-4 h-4 mr-2" /> Create
                  </Link>
                  <Link href="/play" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-border h-11 text-sm font-medium">
                    <Swords className="w-4 h-4 mr-2" /> Play
                  </Link>
                </div>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-2 pt-3"><Trophy className="w-4 h-4" /> Mobile navigation now uses a quick-action bar plus this full menu.</div>
            </div>
          </div>
        )}
      </nav>

      <main className={`flex-1 ${compactMobileNav ? "pb-20" : "pb-24"} md:pb-0`}>
        {children}
      </main>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className={`grid ${compactMobileNav ? "grid-cols-4" : "grid-cols-5"} gap-1 px-2 py-2`}>
          {(compactMobileNav ? mobileNavLinks.filter((link) => link.href !== "/") : mobileNavLinks).map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
