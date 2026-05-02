import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListCards, getListCardsQueryKey } from "@workspace/api-client-react";
import { CardItem } from "@/components/card-item";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function Cards() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("all");
  const [type, setType] = useState("all");
  
  const { data, isLoading } = useListCards({
    page,
    limit: 20,
    search: search || undefined,
    rarity: rarity !== "all" ? rarity : undefined,
    type: type !== "all" ? type : undefined,
  }, {
    query: {
      queryKey: getListCardsQueryKey({
        page, limit: 20, search: search || undefined, rarity: rarity !== "all" ? rarity : undefined, type: type !== "all" ? type : undefined
      })
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">Card Database</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search cards..." 
              className="pl-10 h-10 bg-card border-border"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={rarity} onValueChange={(v) => { setRarity(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-border h-10">
              <SelectValue placeholder="Rarity" />
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
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-border h-10">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Creature">Creature</SelectItem>
              <SelectItem value="Spell">Spell</SelectItem>
              <SelectItem value="Artifact">Artifact</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && !data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : data?.cards.length === 0 ? (
          <div className="text-center py-24 bg-card/50 rounded-xl border border-border">
            <h3 className="text-xl font-medium text-muted-foreground">No cards found matching your criteria.</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data?.cards.map(card => (
                <CardItem key={card.id} card={card} foil={card.rarity.toLowerCase() === 'legendary'} />
              ))}
            </div>
            
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-medium">Page {page} of {data.totalPages}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
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
