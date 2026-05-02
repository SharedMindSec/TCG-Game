import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetMyCollection, getGetMyCollectionQueryKey, useGetCollectionStats } from "@workspace/api-client-react";
import { CardItem } from "@/components/card-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, PieChart, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Collection() {
  const [page, setPage] = useState(1);
  const [rarity, setRarity] = useState("all");
  
  const { data: stats, isLoading: statsLoading } = useGetCollectionStats();
  const { data: collection, isLoading: collectionLoading } = useGetMyCollection({
    page,
    limit: 20,
    rarity: rarity !== "all" ? rarity : undefined
  }, {
    query: {
      queryKey: getGetMyCollectionQueryKey({
        page, limit: 20, rarity: rarity !== "all" ? rarity : undefined
      })
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">My Collection</h1>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <PieChart className="w-5 h-5" />
              <h3 className="font-semibold uppercase text-sm tracking-wider">Completion</h3>
            </div>
            {statsLoading ? <Skeleton className="h-8 w-24 mb-3" /> : (
              <div className="text-3xl font-black mb-3">{stats?.completionPercent.toFixed(1)}%</div>
            )}
            <Progress value={stats?.completionPercent ?? 0} className="h-2" />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="font-semibold uppercase text-sm tracking-wider text-muted-foreground mb-2">Total Cards</h3>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-black text-primary">{stats?.totalCards}</div>
            )}
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="font-semibold uppercase text-sm tracking-wider text-muted-foreground mb-2">Unique Cards</h3>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-black">{stats?.uniqueCards}</div>
            )}
          </div>

          <div className="bg-card p-6 rounded-xl border border-border bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-center gap-3 mb-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold uppercase text-sm tracking-wider">Foil Cards</h3>
            </div>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-black text-primary">{stats?.foilCards}</div>
            )}
          </div>
        </div>

        {/* Collection Grid */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold">Cards</h2>
          <Select value={rarity} onValueChange={(v) => { setRarity(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="Common">Common</SelectItem>
              <SelectItem value="Uncommon">Uncommon</SelectItem>
              <SelectItem value="Rare">Rare</SelectItem>
              <SelectItem value="Epic">Epic</SelectItem>
              <SelectItem value="Legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {collectionLoading && !collection ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : collection?.entries.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-xl border border-border">
            <h3 className="text-xl font-medium text-muted-foreground mb-4">Your collection is empty</h3>
            <Button asChild>
              <a href="/cards">Browse Cards to Add</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {collection?.entries.map(entry => (
                <CardItem 
                  key={entry.id} 
                  card={entry.card} 
                  foil={entry.foil} 
                  quantity={entry.quantity} 
                />
              ))}
            </div>
            
            {collection && collection.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-medium">Page {page} of {collection.totalPages}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(collection.totalPages, p + 1))}
                  disabled={page === collection.totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
