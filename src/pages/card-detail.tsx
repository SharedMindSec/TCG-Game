import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { useGetCard, getGetCardQueryKey, useAddToCollection, useGetMe } from "@workspace/api-client-react";
import { getRarityColor, getRarityBorder } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Swords, Heart, Zap, Sparkles, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getDisplayStats } from "@/lib/card-stats";

export default function CardDetail() {
  const [, params] = useRoute("/cards/:id");
  const cardId = parseInt(params?.id || "0", 10);
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);
  
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: card, isLoading } = useGetCard(cardId, {
    query: {
      queryKey: getGetCardQueryKey(cardId),
      enabled: !!cardId
    }
  });

  const addToCollection = useAddToCollection();

  const handleAdd = (foil: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add cards to your collection.",
        variant: "destructive"
      });
      return;
    }
    
    addToCollection.mutate(
      { cardId, data: { quantity: 1, foil } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Collection",
            description: `${card?.name} (${foil ? 'Foil' : 'Normal'}) has been added.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add card to collection.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Skeleton className="aspect-[3/4] rounded-2xl w-full max-w-md mx-auto" />
            <div className="space-y-6 pt-8">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!card) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif text-destructive">Card not found</h1>
        </div>
      </Layout>
    );
  }

  const rarityColor = getRarityColor(card.rarity);
  const rarityBorder = getRarityBorder(card.rarity);
  const isLegendary = card.rarity.toLowerCase() === 'legendary';
  const stats = getDisplayStats(card);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto items-start">
          
          {/* Left Column - Card Image */}
          <div className="flex justify-center md:justify-end">
            <div className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isLegendary ? 'card-legendary-border' : rarityBorder} ${isLegendary ? 'foil-effect' : ''}`}>
              <div className="relative aspect-[3/4] bg-muted w-full">
                <img 
                  src={imgError || !card.imageUrl ? '/card-placeholder.png' : card.imageUrl} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Card Details */}
          <div className="space-y-8 bg-card/50 p-8 rounded-3xl border border-border backdrop-blur-sm">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-black mb-2">{card.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium uppercase tracking-wider">
                <span className={`px-3 py-1 rounded-full bg-background border border-border ${rarityColor}`}>
                  {card.rarity}
                </span>
                <span className="px-3 py-1 rounded-full bg-background border border-border text-muted-foreground">
                  {card.type}
                </span>
                <span className="px-3 py-1 rounded-full bg-background border border-border text-primary flex items-center gap-1">
                  Cost: {stats.cost} <Zap className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 py-6 border-y border-border/50">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                  <Swords className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black">{stats.attack}</span>
                <span className="text-xs text-muted-foreground uppercase">Attack</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black">{stats.defense}</span>
                <span className="text-xs text-muted-foreground uppercase">Defense</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black">{stats.hp}</span>
                <span className="text-xs text-muted-foreground uppercase">HP</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Description</h3>
              <p className="text-lg leading-relaxed">{card.description}</p>
            </div>

            {card.abilities && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Abilities</h3>
                <p className="text-lg text-primary leading-relaxed">{card.abilities}</p>
              </div>
            )}

            {card.flavorText && (
              <blockquote className="italic text-muted-foreground border-l-2 border-primary/50 pl-4 py-1">
                "{card.flavorText}"
              </blockquote>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-4">
              <div><span className="font-semibold text-foreground">Set:</span> {card.set}</div>
              <div><span className="font-semibold text-foreground">Artist:</span> {card.artist || 'Unknown'}</div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 text-base h-14"
                onClick={() => handleAdd(false)}
                disabled={addToCollection.isPending}
              >
                {addToCollection.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                Add Normal
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 text-base h-14 border-primary/50 text-primary hover:bg-primary/10"
                onClick={() => handleAdd(true)}
                disabled={addToCollection.isPending}
              >
                {addToCollection.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Add Foil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
