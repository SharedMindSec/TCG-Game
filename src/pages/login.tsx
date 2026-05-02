import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

async function authRequest(path: string, payload: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error((typeof data?.error === "string" && data.error) || "Authentication failed");
  }

  return data;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, refetch } = useGetMe({ query: { retry: false } });
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/play");
    }
  }, [user, isLoading, setLocation]);

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await authRequest("/api/auth/login", { email: loginEmail, password: loginPassword });
      await refetch();
      toast({ title: "Signed in", description: "Welcome back to BDC TCG." });
      setLocation("/play");
    } catch (error) {
      toast({ title: "Login failed", description: error instanceof Error ? error.message : "Unable to sign in.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (registerPassword !== registerConfirm) {
      toast({ title: "Password mismatch", description: "Your passwords need to match.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await authRequest("/api/auth/register", {
        username: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      await refetch();
      toast({ title: "Account created", description: "Your profile is ready and signed in." });
      setLocation("/play");
    } catch (error) {
      toast({ title: "Registration failed", description: error instanceof Error ? error.message : "Unable to create account.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 z-0">
        <img src="/login-bg.png" alt="Mystical Portal" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="z-10 w-full max-w-5xl grid lg:grid-cols-[0.85fr_1.15fr] rounded-3xl border border-border/50 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-md">
        <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-border/50 bg-background/35">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-black tracking-widest text-primary mb-3">BDC TCG</h1>
            <p className="text-muted-foreground leading-7">
              Account creation now lives directly in the web app, so players can move from collection into explore, shop, PvE, PvP, and tournaments.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="font-semibold mb-1">What the account unlocks</div>
              <div className="text-sm text-muted-foreground leading-6">Saved session login, profile identity, synced collection rewards, and a stronger base for later real matchmaking.</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="font-semibold mb-1">Discord still supported</div>
              <div className="text-sm text-muted-foreground leading-6">Players can continue using Discord for identity, but email/password sign-up is now available too.</div>
            </div>
            <Button
              className="w-full h-14 text-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold shadow-[0_0_15px_rgba(88,101,242,0.3)]"
              onClick={handleDiscordLogin}
            >
              <SiDiscord className="w-6 h-6 mr-3" />
              Continue with Discord
            </Button>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8 h-11">
              <TabsTrigger value="create">Create Account</TabsTrigger>
              <TabsTrigger value="login">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium" htmlFor="username">Username</label>
                  <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="username" placeholder="Collector name" required value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium" htmlFor="register-email">Email</label>
                  <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="register-email" placeholder="you@example.com" required type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium" htmlFor="register-password">Password</label>
                    <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="register-password" required type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium" htmlFor="register-confirm">Confirm</label>
                    <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="register-confirm" required type="password" value={registerConfirm} onChange={(e) => setRegisterConfirm(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full h-11 font-bold" type="submit" disabled={isSubmitting}>Create My Account</Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="email" placeholder="m@example.com" required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  <input className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" id="password" required type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                <Button className="w-full h-11 font-bold" type="submit" disabled={isSubmitting}>Sign In</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed mt-8">
            By continuing, you are setting up your collector profile and gameplay identity for the upgraded web app.
          </p>
        </div>
      </div>
    </div>
  );
}
