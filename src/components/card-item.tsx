import { Link } from "wouter";
import { Card as CardType } from "@workspace/api-client-react";
import { getRarityColor, getRarityBorder } from "@/lib/utils";
import { Shield, Swords, Heart, Zap } from "lucide-react";
import { getDisplayStats } from "@/lib/card-stats";
import { useState } from "react";

interface CardItemProps {
  card: CardType;
  foil?: boolean;
  quantity?: number;
}

export function CardItem({ card, foil, quantity }: CardItemProps) {
  const [imgError, setImgError] = useState(false);
  
  const rarityBorder = getRarityBorder(card.rarity);
  const rarityColor = getRarityColor(card.rarity);
  const stats = getDisplayStats(card);

  return (
    <Link href={`/cards/${card.id}`} className="block">
      <div className={`relative group cursor-pointer transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] ${foil ? 'foil-effect' : ''} h-full`}>
        <div className={`rounded-xl overflow-hidden border-2 bg-card flex flex-col h-full ${card.rarity.toLowerCase() === 'legendary' ? 'card-legendary-border' : rarityBorder}`}>
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img 
              src={imgError || !card.imageUrl ? '/card-placeholder.png' : card.imageUrl} 
              alt={card.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[11px] sm:text-xs font-bold border border-border">
              {stats.cost} <Zap className="w-3 h-3 inline text-primary ml-1" />
            </div>
            {quantity !== undefined && (
              <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold shadow-lg">
                x{quantity}
              </div>
            )}
          </div>
          
          <div className="p-2.5 sm:p-3 flex flex-col flex-1 bg-card relative z-10">
            <h3 className="font-serif font-bold text-base sm:text-lg leading-tight truncate">{card.name}</h3>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>{card.type}</span>
              <span className={`font-semibold ${rarityColor}`}>{card.rarity}</span>
            </div>
            
            <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between text-xs sm:text-sm font-medium border-t border-border/50 gap-2">
              <div className="flex items-center gap-1 text-destructive">
                <Swords className="w-4 h-4" /> {stats.attack}
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <Shield className="w-4 h-4" /> {stats.defense}
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <Heart className="w-4 h-4" /> {stats.hp}
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow effect under the card */}
        <div className={`absolute inset-0 -z-10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${card.rarity.toLowerCase() === 'legendary' ? 'bg-amber-500' : 'bg-current'} rounded-xl`} />
      </div>
    </Link>
  );
}
