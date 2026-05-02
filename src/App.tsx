import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Cards from "@/pages/cards";
import CardDetail from "@/pages/card-detail";
import Collection from "@/pages/collection";
import Leaderboard from "@/pages/leaderboard";
import Sets from "@/pages/sets";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import GameHub from "@/pages/game-hub";
import Explore from "@/pages/explore";
import NpcBattles from "@/pages/npc-battles";
import PvpArena from "@/pages/pvp-arena";
import Shop from "@/pages/shop";
import Tournaments from "@/pages/tournaments";
import DeckBuilder from "@/pages/decks";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cards" component={Cards} />
      <Route path="/cards/:id" component={CardDetail} />
      <Route path="/collection" component={Collection} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/sets" component={Sets} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/play" component={GameHub} />
      <Route path="/explore" component={Explore} />
      <Route path="/npc-battles" component={NpcBattles} />
      <Route path="/pvp-arena" component={PvpArena} />
      <Route path="/decks" component={DeckBuilder} />
      <Route path="/shop" component={Shop} />
      <Route path="/tournaments" component={Tournaments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
