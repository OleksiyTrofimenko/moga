# WC3 Helper

Warcraft III replay analyzer with full game state reconstruction and interactive timeline.

Upload `.w3g` replay files → parse the binary format → reconstruct army compositions every 3 seconds → score matchups → explore the game through an interactive timeline UI.

## Features

- **Replay parsing** — reads `.w3g` binary format, extracts all player actions
- **Game state reconstruction** — snapshots every 3 seconds with unit/building/hero counts, supply, economy estimates
- **Army comparison scoring** — weighted army value with matchup and tempo modifiers
- **Key moment detection** — identifies fights, expansions, tech switches, hero kills
- **Game phase classification** — early/mid/late game segmentation
- **Build order extraction** — per-player build order from actions
- **Interactive timeline** — scrub through the entire game, inspect any point in time
- **Player profiles** — aggregate stats across replays
- **Map browser** — map info with creep camp data
- **Re-analysis** — re-run the engine on all stored replays when scoring logic changes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Testing | Vitest |

## Quick Start

```bash
# Clone and install
git clone <repo-url> && cd wc3-helper
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your settings

# Set up database
createdb wc3_helper
npm run db:migrate
npm run db:seed
npm run db:seed-maps

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://localhost:5432/wc3_helper
STORAGE_PATH=./storage/replays
MAX_REPLAY_SIZE_MB=20
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `STORAGE_PATH` | No | `./storage/replays` | Where uploaded replay files are stored |
| `MAX_REPLAY_SIZE_MB` | No | `20` | Maximum upload size in MB |

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/replays/            #   Upload, analysis, reanalyze endpoints
│   ├── api/players/            #   Player lookup
│   ├── replays/[id]/           #   Replay detail page
│   ├── players/[name]/         #   Player profile page
│   └── maps/[slug]/            #   Map detail page
├── lib/
│   ├── parser/                 # Phase 1: Binary .w3g parser
│   │   ├── binary/             #   Low-level decoders (header, blocks, actions)
│   │   └── domain/             #   Normalize raw actions → domain events
│   ├── engine/                 # Phase 2: Game state engine
│   │   ├── state/              #   Tracker classes (units, buildings, heroes, economy)
│   │   ├── scoring/            #   Army comparison scoring
│   │   └── analytics/          #   Phase classification, key moments, engagements
│   ├── db/
│   │   ├── schema/             #   Drizzle table definitions
│   │   └── seed/               #   Game definition seeds, reanalyze script
│   ├── map/                    # Map data utilities
│   ├── storage/                # File storage adapter
│   └── players/                # Player aggregation logic
├── components/
│   ├── ui/                     # Shared UI primitives
│   ├── replays/                # Replay list/card components
│   ├── replay-analysis/        # Analysis page components
│   │   ├── panels/             #   Detail panels (army, economy, build order)
│   │   └── timeline/           #   Interactive timeline scrubber
│   └── players/                # Player profile components
```

## Architecture

```
.w3g file → Parser → NormalizedEvents → Engine → GameSnapshots → PostgreSQL → UI Timeline
```

### Phase 1: Parser (`src/lib/parser/`)

Reads the `.w3g` binary format — header, decompressed data blocks, and the timeslot action stream. Extracts raw player actions and normalizes them into domain events (`UNIT_TRAINED`, `BUILDING_STARTED`, `HERO_TRAINED`, `ITEM_USED`, etc.). No game logic lives here — the parser is pure extraction.

### Phase 2: Engine (`src/lib/engine/`)

Takes normalized events plus game metadata (race, map) and reconstructs the full game state over time. Tracker classes manage individual concerns (units, buildings, heroes, economy, supply, upgrades) and are composed into a per-player state object. The snapshot generator walks events chronologically, emitting a `GameSnapshot` every 3 seconds. The scoring module computes a deterministic army comparison with matchup and tempo modifiers. Analytics detect key moments, classify game phases, and identify engagements.

### Phase 3: API + UI (`src/app/`, `src/components/`)

Next.js App Router serves the web interface. The upload API route parses the replay, runs the engine, and stores everything in PostgreSQL. The replay detail page loads snapshots and renders an interactive timeline — click any point to see the reconstructed game state at that moment.

## Database Workflow

### Initial Setup

```bash
# Option A: Local PostgreSQL
createdb wc3_helper

# Option B: Docker
docker run -d --name wc3-pg -p 5432:5432 \
  -e POSTGRES_DB=wc3_helper \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  postgres:16
```

### Migrations

Schema is defined in `src/lib/db/schema/`. After modifying schema files:

```bash
npm run db:generate   # Generate migration SQL from schema changes
npm run db:migrate    # Apply pending migrations
```

### Seeding

```bash
npm run db:seed       # Load game definitions (units, heroes, buildings, items, upgrades, abilities)
npm run db:seed-maps  # Load map data with creep camp positions
```

Both seed commands are idempotent — safe to run multiple times.

### Re-analysis

After changing engine logic (scoring weights, new trackers, etc.):

```bash
npm run db:reanalyze  # Re-runs analysis on all existing replays
```

### Common Tasks

```bash
# Reset database completely
dropdb wc3_helper && createdb wc3_helper
npm run db:migrate && npm run db:seed && npm run db:seed-maps

# Explore database with Drizzle Studio
npx drizzle-kit studio
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:generate` | Generate Drizzle migration files from schema changes |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:seed` | Seed game definition tables |
| `npm run db:seed-maps` | Seed map and creep camp data |
| `npm run db:reanalyze` | Re-run analysis engine on all stored replays |

Run a single test file:
```bash
npx vitest run src/lib/engine/__tests__/army-score.test.ts
```

## Deployment

### Option A: Docker Compose (recommended for self-hosting)

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: wc3_helper
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://db:5432/wc3_helper
      STORAGE_PATH: /data/replays
    volumes:
      - replays:/data/replays
    depends_on:
      - db

volumes:
  pgdata:
  replays:
```

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm run db:seed-maps && node server.js"]
```

```bash
docker compose up -d
```

> **Note:** The Dockerfile assumes Next.js standalone output mode. Add `output: "standalone"` to `next.config.ts` if not already set.

### Option B: VPS with pm2

```bash
# On your server
sudo apt install postgresql
sudo -u postgres createdb wc3_helper

git clone <repo-url> && cd wc3-helper
npm ci && npm run build
npm run db:migrate && npm run db:seed && npm run db:seed-maps

# Run with pm2
npm install -g pm2
pm2 start npm --name wc3-helper -- start
pm2 save && pm2 startup
```

### Option C: Vercel + Managed PostgreSQL

Deploy to Vercel with a managed PostgreSQL provider (Neon, Supabase, etc.) for the database.

**Caveat:** Replay file storage uses the local filesystem (`STORAGE_PATH`). On Vercel, the filesystem is ephemeral — uploaded replays would be lost on redeploy. You would need to swap `src/lib/storage/` to use an object store (S3, Cloudflare R2, etc.) for production use on serverless platforms.

## Similar Tools & Patterns

| Tool | Focus | Difference from WC3 Helper |
|------|-------|---------------------------|
| **W3Champions** | Competitive ladder, ELO, win rates | API-driven matchmaking stats, no replay analysis |
| **wc3stats.com** | Replay hosting, player history, APM | Aggregate stats and chat logs, no in-game state reconstruction |

**WC3 Helper's niche:** full game state reconstruction with an interactive timeline. No other public tool reconstructs army compositions and economy at arbitrary points in the game.

**Patterns worth exploring:**
- APM tracking and visualization
- Heatmaps from map-click actions
- Shareable analysis links / export to image
- Replay comparison (same matchup, different games)

## Extension Guide

### Add a new tracker (e.g., spell usage)

1. Create a tracker class in `src/lib/engine/state/` — implement event handling + `.snapshot()`
2. Compose it into `PlayerState` (`src/lib/engine/state/player-state.ts`)
3. Extend the snapshot TypeScript types
4. Run `npm run db:reanalyze` to regenerate all snapshots

### Add a new UI panel

1. Create component in `src/components/replay-analysis/panels/`
2. Wire it into the replay analysis page at `src/app/replays/[id]/`

### Add a new API endpoint

Create a route file at `src/app/api/<resource>/route.ts` following Next.js App Router conventions.

### Add new game definitions

Add entries to the appropriate seed file in `src/lib/db/seed/`, then run `npm run db:seed`.

### Support a new replay format version

Extend the binary decoders in `src/lib/parser/binary/` to handle new header fields or action types.

## Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode for development
```

Engine tests cover scoring logic and tracker behavior. Parser tests validate binary decoding against known replay files. Integration tests use real `.w3g` fixtures from `wc3-replays/` and are skipped if the fixture file is missing.

## Known Limitations

- **Unit deaths are estimated** — the `.w3g` format does not record unit death events; the engine infers them from combat
- **Economy is modeled** — gold/lumber income is estimated from game rules, not read from the replay
- **1v1 only** — multi-player game support is not implemented
- **Local file storage** — replays are stored on disk, no cloud storage adapter yet

## License

TBD
