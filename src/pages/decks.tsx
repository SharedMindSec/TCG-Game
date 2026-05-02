import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useGetMe, useGetMyCollection } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { gameApi, type DeckSummary } from "@/lib/game-api";
import { getDisplayStats } from "@/lib/card-stats";
import { Crown, Plus, Save, Search, Sparkles, Swords, Trash2 } from "lucide-react";

const DEFAULT_DECK_NAME = "My Battle Deck";

export default function DeckBuilder() {
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { data: collection, isLoading: collectionLoading, refetch: refetchCollection } = useGetMyCollection({ page: 1, limit: 120 });
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [deckSize, setDeckSize] = useState(20);
  const [maxCopies, setMaxCopies] = useState(3);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [deckName, setDeckName] = useState(DEFAULT_DECK_NAME);
  const [draftCounts, setDraftCounts] = useState<Record<number, number>>({});

  const loadDecks = async () => {
    try {
      const data = await gameApi.listDecks();
      setDecks(data.decks);
      setDeckSize(data.deckSize);
      setMaxCopies(data.maxCopies);
      const active = data.decks.find((deck) => deck.isActive) ?? data.decks[0] ?? null;
      if (active) {
        setSelectedDeckId(active.id);
        setDeckName(active.name);
        setDraftCounts(Object.fromEntries(active.entries.map((entry) => [entry.cardId, entry.quantity])));
      }
    } catch (error) {
      toast({ title: "Could not load decks", description: error instanceof Error ? error.message : "Decks failed to load.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) {
      void loadDecks();
      void refetchCollection();
    }
  }, [user]);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? null, [decks, selectedDeckId]);
  const ownedEntries = collection?.entries ?? [];
  const ownedMap = useMemo(() => new Map(ownedEntries.map((entry) => [entry.cardId, entry.quantity])), [ownedEntries]);
  const deckCount = useMemo(() => Object.values(draftCounts).reduce((sum, count) => Number(sum) + Number(count), 0), [draftCounts]);

  const filteredCollection = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = [...ownedEntries];
    if (!term) return items;
    return items.filter((entry) => `${entry.card.name} ${entry.card.type} ${entry.card.rarity}`.toLowerCase().includes(term));
  }, [ownedEntries, search]);

  const deckCards = useMemo(() => {
    const byId = new Map(ownedEntries.map((entry) => [entry.cardId, entry.card]));
    return Object.entries(draftCounts)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([cardId, quantity]) => ({
        cardId: Number(cardId),
        quantity,
        card: byId.get(Number(cardId)),
      }))
      .filter((entry) => !!entry.card)
      .sort((a, b) => Number(a.card?.cost ?? 0) - Number(b.card?.cost ?? 0) || String(a.card?.name ?? "").localeCompare(String(b.card?.name ?? "")));
  }, [draftCounts, ownedEntries]);

  const selectDeck = (deck: DeckSummary) => {
    setSelectedDeckId(deck.id);
    setDeckName(deck.name);
    setDraftCounts(Object.fromEntries(deck.entries.map((entry) => [entry.cardId, entry.quantity])));
  };

  const adjustCard = (cardId: number, delta: number) => {
    const owned = ownedMap.get(cardId) ?? 0;
    const current = draftCounts[cardId] ?? 0;
    const next = Math.max(0, Math.min(maxCopies, current + delta, owned));
    const totalIfApplied = deckCount - current + next;
    if (delta > 0 && totalIfApplied > deckSize) {
      toast({ title: "Deck full", description: `Decks cap at ${deckSize} cards.`, variant: "destructive" });
      return;
    }
    setDraftCounts((prev) => {
      const nextState = { ...prev };
      if (next <= 0) delete nextState[cardId];
      else nextState[cardId] = next;
      return nextState;
    });
  };

  const saveDeck = async () => {
    setIsSaving(true);
    try {
      const entries = Object.entries(draftCounts).map(([cardId, quantity]) => ({ cardId: Number(cardId), quantity }));
      const result = await gameApi.saveDeck({
        deckId: selectedDeckId,
        name: deckName || DEFAULT_DECK_NAME,
        entries,
        makeActive: true,
      });
      setDecks(result.decks);
      const saved = result.decks.find((deck) => deck.id === result.deckId) ?? result.decks[0];
      if (saved) selectDeck(saved);
      toast({ title: "Deck saved", description: `${deckName || DEFAULT_DECK_NAME} is ready for battle.` });
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Could not save the deck.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const activateDeck = async (deckId: number) => {
    try {
      const result = await gameApi.activateDeck(deckId);
      setDecks(result.decks);
      const active = result.decks.find((deck) => deck.id === deckId);
      if (active) selectDeck(active);
      toast({ title: "Active deck updated", description: "This deck will be used for NPC and PvP battles." });
    } catch (error) {
      toast({ title: "Could not activate deck", description: error instanceof Error ? error.message : "Activation failed.", variant: "destructive" });
    }
  };

  const startFreshDeck = () => {
    setSelectedDeckId(null);
    setDeckName(`Deck ${decks.length + 1}`);
    setDraftCounts({});
  };

  if (userLoading) {
    return <Layout><div className="container mx-auto px-4 py-16 text-muted-foreground">Loading deck builder…</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto border-border/60 bg-card/80">
            <CardHeader>
              <Badge className="w-fit bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">Deck Builder</Badge>
              <CardTitle className="text-3xl mt-4">Create an account to build decks.</CardTitle>
              <CardDescription>The battle system now uses real saved decks, so sign in first and the app will also grant a starter collection.</CardDescription>
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
      <div className="container mx-auto px-4 py-10 sm:py-12 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge className="mb-4 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">Deck Builder</Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">Build decks with real card art and save them for battle.</h1>
            <p className="text-muted-foreground max-w-3xl text-lg">Your deck builder now drives live NPC matches and hosted PvP rooms. Pick your list, tune your curve, and set an active deck.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Deck Size</div><div className="font-black text-2xl mt-2">{deckCount}/{deckSize}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Active</div><div className="font-black text-lg mt-2 truncate">{selectedDeck?.name ?? "New deck"}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Saved Decks</div><div className="font-black text-2xl mt-2">{decks.length}</div></CardContent></Card>
            <Card className="bg-card/70 border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Max Copies</div><div className="font-black text-2xl mt-2">{maxCopies}</div></CardContent></Card>
          </div>
        </div>

        <div className="grid xl:grid-cols-[0.86fr_1.14fr] gap-6">
          <Card className="border-border/60 bg-card/80 order-1">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Saved decks</CardTitle>
                  <CardDescription>Switch between lists or start a clean build.</CardDescription>
                </div>
                <Button variant="outline" onClick={startFreshDeck}><Plus className="w-4 h-4 mr-2" /> New</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {decks.map((deck) => (
                  <button key={deck.id} onClick={() => selectDeck(deck)} className={`w-full rounded-2xl border p-4 text-left transition ${deck.id === selectedDeckId ? "border-primary bg-primary/10" : "border-border/60 bg-background/35 hover:border-primary/30"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold flex items-center gap-2">{deck.name} {deck.isActive ? <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10">Active</Badge> : null}</div>
                        <div className="text-xs text-muted-foreground mt-1">{deck.cardCount}/{deckSize} cards</div>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); void activateDeck(deck.id); }}>
                        <Crown className="w-4 h-4 mr-2" /> Use
                      </Button>
                    </div>
                  </button>
                ))}
              </div>

              <Card className="border-border/60 bg-background/35">
                <CardHeader>
                  <CardTitle className="text-lg">Edit current deck</CardTitle>
                  <CardDescription>Name it, save it, and then take it into battle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder="Deck name" />
                  <div className="flex gap-3 flex-wrap">
                    <Button onClick={saveDeck} disabled={isSaving || deckCount !== deckSize} className="w-full sm:w-auto"><Save className="w-4 h-4 mr-2" /> Save Deck</Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/npc-battles"><Swords className="w-4 h-4 mr-2" /> Battle NPC</Link></Button>
                  </div>
                  <div className="text-xs text-muted-foreground">A valid deck needs exactly {deckSize} cards. The active deck powers NPC and PvP matches.</div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/35">
                <CardHeader>
                  <CardTitle className="text-lg">Deck list</CardTitle>
                  <CardDescription>Visual list of what is currently slotted into the deck.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
                  {deckCards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">Your deck is empty. Add cards from the collection on the right.</div>
                  ) : deckCards.map((entry) => (
                    <div key={entry.cardId} className="rounded-2xl border border-border/60 bg-background/35 p-3 flex items-center gap-3">
                      <img src={entry.card?.imageUrl || "/card-placeholder.png"} alt={entry.card?.name} className="w-16 h-20 rounded-xl object-cover border border-border/60" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{entry.card?.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{entry.card?.type} • {entry.card?.rarity}</div>
                        <div className="text-xs text-muted-foreground mt-1">{entry.card ? (() => { const stats = getDisplayStats(entry.card); return `Cost ${stats.cost} • ${stats.attack}/${stats.hp}`; })() : 'Stats unavailable'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">x{entry.quantity}</Badge>
                        <Button size="icon" variant="outline" onClick={() => adjustCard(entry.cardId, -1)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 order-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle>Collection cards</CardTitle>
                  <CardDescription>Add cards with the art preview and clear deck counts.</CardDescription>
                </div>
                <div className="relative w-full md:w-[280px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, type, rarity" className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {collectionLoading ? (
                <div className="text-muted-foreground">Loading collection…</div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[980px] overflow-y-auto pr-1">
                  {filteredCollection.map((entry) => {
                    const inDeck = draftCounts[entry.cardId] ?? 0;
                    const owned = entry.quantity;
                    const canAdd = inDeck < Math.min(owned, maxCopies) && deckCount < deckSize;
                    return (
                      <div key={entry.id} className="rounded-[22px] overflow-hidden border border-border/60 bg-background/35 shadow-[0_12px_40px_rgba(0,0,0,0.18)] flex gap-3 p-3 sm:block sm:p-0">
                        <div className="relative w-24 sm:w-auto shrink-0 rounded-2xl overflow-hidden bg-muted sm:rounded-none sm:aspect-[3/4]">
                          <img src={entry.card.imageUrl || "/card-placeholder.png"} alt={entry.card.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col sm:flex-row gap-1 sm:gap-2 items-end">
                            <Badge className="bg-background/85 text-foreground border border-border/60 hover:bg-background/85 text-[10px] sm:text-xs">Owned x{owned}</Badge>
                            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary/90 text-[10px] sm:text-xs">Deck x{inDeck}</Badge>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2.5 sm:px-4 py-2.5 sm:py-3">
                            <div className="text-white font-semibold truncate text-sm sm:text-lg">{entry.card.name}</div>
                            <div className="text-white/80 text-[10px] sm:text-xs uppercase tracking-[0.18em] mt-1 line-clamp-2">{entry.card.type} • {entry.card.rarity}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 p-0 sm:p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
                            <div className="flex items-center gap-1 text-primary"><Sparkles className="w-4 h-4" /> Cost {getDisplayStats(entry.card).cost}</div>
                            <div className="text-muted-foreground text-right">ATK {getDisplayStats(entry.card).attack} • HP {getDisplayStats(entry.card).hp}</div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-2 min-h-[48px] sm:min-h-[40px]">{entry.card.abilities || entry.card.description || "No rules text listed."}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="w-full" disabled={inDeck <= 0} onClick={() => adjustCard(entry.cardId, -1)}>- Remove</Button>
                            <Button className="w-full" disabled={!canAdd} onClick={() => adjustCard(entry.cardId, 1)}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="md:hidden fixed inset-x-0 z-40 px-3" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}>
        <div className="rounded-2xl border border-border/60 bg-background/92 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.32)] px-3 py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Deck progress</div>
            <div className="font-semibold truncate">{deckName || DEFAULT_DECK_NAME}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{deckCount}/{deckSize} cards • {Math.max(deckSize - deckCount, 0)} left</div>
          </div>
          <Button onClick={saveDeck} disabled={isSaving || deckCount !== deckSize} size="sm" className="shrink-0">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>
    </Layout>
  );
}
