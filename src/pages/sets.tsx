import { Layout } from "@/components/layout";
import { useListSets } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Sets() {
  const { data: sets, isLoading } = useListSets();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Expansions & Sets</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Explore the history of the game through its major releases and expansions.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <Skeleton className="h-16 w-16 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : sets?.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No sets available yet.
            </div>
          ) : (
            sets?.map(set => (
              <div key={set.id} className="bg-card hover:bg-card/80 transition-colors rounded-2xl p-6 border border-border group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/50 group-hover:border-primary/50 transition-colors">
                    {set.logoUrl ? (
                      <img src={set.logoUrl} alt={set.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">{set.name}</h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-2 h-10">
                  {set.description || "No description available."}
                </p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                  <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4 text-primary" />
                    {set.cardCount} Cards
                  </div>
                  {set.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {format(new Date(set.releaseDate), "MMM yyyy")}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
