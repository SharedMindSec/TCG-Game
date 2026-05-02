# Workspace

## Overview

LULS Gamer Legends: TCG — a Trading Card Game website with real card browsing, user collections, leaderboards, deck builder, NPC battles, PvP arena, and email/password auth.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter
- **Auth**: Session-based auth + email/password (bcrypt) + Discord OAuth2

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, cards, collections, gameplay, users)
│   └── tcg-website/        # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (includes seed.ts)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — user accounts with email/password + Discord OAuth fields
- `sessions` — session tokens for auth (httpOnly cookie-based)
- `card_sets` — TCG card sets (Base Set, Shadow Realm, Dragon's Fury, Celestial Ascent)
- `cards` — all TCG cards (name, imageUrl, rarity, type, set, attack, defense, hp, cost, artist, flavorText, abilities)
- `collections` — user card collections (userId, cardId, quantity, foil)
- `decks` — user decks (userId, name, isActive)
- `deck_cards` — cards in each deck (deckId, cardId, quantity)
- `matches` — game matches (npc/pvp, state JSON, winner)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts exec tsx ./src/seed.ts` — seed the database with card sets and cards

## Seeding

Run the seed script once after fresh DB setup:
```
DATABASE_URL="$DATABASE_URL" pnpm --filter @workspace/scripts exec tsx ./src/seed.ts
```

This inserts 4 card sets and 32 cards.

## Auth Flow

- Session tokens stored as httpOnly cookies (`session_token`)
- Email/password: `POST /api/auth/register`, `POST /api/auth/login`
- Discord OAuth2: `GET /api/auth/discord` → OAuth redirect → `GET /api/auth/discord/callback`
- `GET /api/auth/me` — returns current user or 401
- `POST /api/auth/logout` — clears session

## Discord OAuth Setup

To enable Discord login, set these env vars:
- `DISCORD_CLIENT_ID` — from Discord Developer Portal
- `DISCORD_CLIENT_SECRET` — from Discord Developer Portal
- Redirect URI in Discord app: `https://YOUR_DOMAIN/api/auth/discord/callback`

## Frontend Pages

- `/` — Hero with featured cards and live stats
- `/cards` — Card gallery with filter/search
- `/cards/:id` — Card detail page
- `/collection` — My collection (auth required)
- `/leaderboard` — Top collectors (tabbed: collections, battles, wins)
- `/sets` — Card sets
- `/profile` — User profile + Discord link/unlink + gameplay stats
- `/login` — Login with Discord OAuth or email/password
- `/play` — Game hub
- `/decks` — Deck builder with saved decks
- `/explore` — Exploration mode
- `/npc-battles` — NPC battles (uses active deck + battle engine)
- `/pvp-arena` — PvP room hosting + join codes
- `/shop` — In-game shop with session currencies
- `/tournaments` — Tournament page
- `/tutorial` — Starter tutorial

## Key API Routes

- `GET /api/cards` — list cards (rarity, type, set, search, page, limit params)
- `GET /api/cards/featured` — featured cards
- `GET /api/cards/stats` — total cards, sets, by rarity/type
- `GET /api/cards/:id` — card detail
- `GET /api/sets` — list card sets
- `GET /api/collection` — my collection (auth required)
- `GET /api/collection/stats` — my collection stats (auth required)
- `POST /api/collection/:cardId` — add card to collection (auth required)
- `GET /api/leaderboard` — top collectors
- `GET /api/users/:id` — user public profile
- `GET /api/users/:id/collection` — user's collection
- `GET /api/decks` — user decks (auth required)
- `POST /api/decks/save` — save a deck
- `POST /api/decks/:id/activate` — set active deck
- `POST /api/battle/npc/start` — start NPC battle
- `GET /api/battle/pvp/open` — open PvP rooms
- `POST /api/battle/pvp/host` — host PvP room
- `POST /api/battle/pvp/join` — join PvP room
- `GET /api/battle/matches/:id` — match state
- `POST /api/battle/matches/:id/action` — submit battle action
