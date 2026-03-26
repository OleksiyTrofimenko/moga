# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WC3 Helper — a Warcraft III replay analyzer. Parses .w3g binary replay files, reconstructs game state over time, scores army matchups, and presents an interactive timeline UI.

Full specification: `wacraft3-helper.md` (25KB) in the project root.

## Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run test:watch   # Vitest watch mode
npx vitest run src/lib/engine/__tests__/army-score.test.ts  # Single test file

npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply migrations to PostgreSQL
npm run db:seed      # Seed game definitions (units, heroes, buildings, items, upgrades)
npm run db:reanalyze # Re-run analysis engine on all existing replays
```

## Architecture (Three Phases)

### Phase 1: Parser (`src/lib/parser/`)
Binary .w3g parser. Reads header, decompresses blocks, walks timeslot stream, extracts actions. Normalizes raw actions into domain events (UNIT_TRAINED, BUILDING_STARTED, HERO_TRAINED, ITEM_USED, etc.). No game logic — pure extraction.

### Phase 2: Engine (`src/lib/engine/`)
Game intelligence. Takes normalized events + metadata, reconstructs game state via tracker classes:
- `snapshot-generator.ts` — main `analyzeReplay()` orchestrator, emits GameSnapshot every 3 seconds
- `state/player-state.ts` — composes all trackers (economy, units, buildings, heroes, upgrades, supply)
- `scoring/army-score.ts` — deterministic weighted army comparison with matchup/tempo modifiers
- `analytics/` — game phase classification, key moment detection, engagement detection

### Phase 3: API + UI (`src/app/`, `src/components/`)
Next.js App Router. Upload route parses + analyzes replay, stores everything in PostgreSQL. Detail page loads snapshots and renders interactive timeline with army comparison.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS 4 (dark theme: bg-zinc-950, border-zinc-800, text-zinc-100)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (config/env)
- **Testing**: Vitest
- **Path alias**: `@/*` → `./src/*`

## Database

Schema in `src/lib/db/schema/`. Key tables:
- `replays` — metadata (UUID PK, players, races, map, duration, parse/analysis status)
- `replayEvents` — normalized events (type, timestampMs, playerId, JSONB payload)
- `replaySnapshots` — game state at each 3s interval (JSONB player states + army comparison)
- `replayAnalyses` — summary (key moments, game phases)
- Definition tables: `unitDefinitions`, `heroDefinitions`, `buildingDefinitions`, `itemDefinitions`, `upgradeDefinitions`, `abilityDefinitions`, `creepDefinitions`, `creepCamps`

Cascade deletes: events/snapshots/analyses delete when replay is deleted.

## Key Conventions

- Game entity IDs are 4-char strings (e.g., "hpea" = Peasant, "htow" = Town Hall)
- Timestamps throughout the engine are in milliseconds (`timestampMs`)
- Event types use UPPER_SNAKE_CASE
- Tracker classes expose `.snapshot()` for immutable state capture
- `DefinitionsCache` lazy-loads WC3 game data from DB on first use
- Integration tests use real replay files from `wc3-replays/` (skipped if fixture missing)

## Data Flow

1. **Upload**: POST /api/replays → validate .w3g → save file to `./storage/replays/` → `parseReplay(buffer)` → insert replay + events
2. **Analysis**: `analyzeReplay(events, metadata, defs)` → walk events chronologically → snapshot every 3s → insert snapshots + analysis
3. **View**: GET /replays/[id] → fetch snapshots → interactive timeline → click timestamp to see reconstructed state
