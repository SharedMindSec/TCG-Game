import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "#9ca3af";
    case "Uncommon":
      return "#4ade80";
    case "Rare":
      return "#60a5fa";
    case "Epic":
      return "#a855f7";
    case "Legendary":
      return "#f59e0b";
    default:
      return "#9ca3af";
  }
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "border-gray-400";
    case "Uncommon":
      return "border-green-400";
    case "Rare":
      return "border-blue-400";
    case "Epic":
      return "border-purple-500";
    case "Legendary":
      return "border-amber-400";
    default:
      return "border-gray-400";
  }
}

export function getRarityGlow(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "shadow-gray-400/20";
    case "Uncommon":
      return "shadow-green-400/40";
    case "Rare":
      return "shadow-blue-400/50";
    case "Epic":
      return "shadow-purple-500/60";
    case "Legendary":
      return "shadow-amber-400/70";
    default:
      return "shadow-gray-400/20";
  }
}

export function getRarityTextColor(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "text-gray-400";
    case "Uncommon":
      return "text-green-400";
    case "Rare":
      return "text-blue-400";
    case "Epic":
      return "text-purple-400";
    case "Legendary":
      return "text-amber-400";
    default:
      return "text-gray-400";
  }
}
