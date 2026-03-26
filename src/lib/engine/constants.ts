/**
 * WC3 game constants used by the simulation engine.
 */

import type { UpkeepBracket } from "./types";

// =====================
// STARTING STATE PER RACE
// =====================
export interface RaceStartingState {
  workers: number;
  gold: number;
  lumber: number;
  supply: number;
  maxSupply: number;
  workerGameId: string;
  townHallGameId: string;
}

export const STARTING_STATE: Record<string, RaceStartingState> = {
  human: {
    workers: 5,
    gold: 500,
    lumber: 150,
    supply: 5,
    maxSupply: 12,
    workerGameId: "hpea",
    townHallGameId: "htow",
  },
  orc: {
    workers: 5,
    gold: 500,
    lumber: 150,
    supply: 5,
    maxSupply: 11,
    workerGameId: "opeo",
    townHallGameId: "ogre",
  },
  night_elf: {
    workers: 5,
    gold: 500,
    lumber: 150,
    supply: 5,
    maxSupply: 10,
    workerGameId: "ewsp",
    townHallGameId: "etol",
  },
  undead: {
    workers: 3,
    gold: 500,
    lumber: 150,
    supply: 3,
    maxSupply: 10,
    workerGameId: "uaco",
    townHallGameId: "unpl",
  },
};

// =====================
// SUPPLY BUILDINGS
// =====================
/** Map of building gameId → supply provided */
export const SUPPLY_BUILDINGS: Record<string, number> = {
  // Human
  hhou: 6, // Farm
  htow: 12, // Town Hall
  hkee: 12, // Keep
  hcas: 12, // Castle
  // Orc
  otrb: 3, // Orc Burrow (provides 3 each, start with 1)
  ogre: 11, // Great Hall
  ostr: 11, // Stronghold
  ofrt: 11, // Fortress
  // Night Elf
  emow: 10, // Moon Well
  etol: 10, // Tree of Life
  etoa: 10, // Tree of Ages
  etoe: 10, // Tree of Eternity
  // Undead
  uzig: 10, // Ziggurat
  uzg1: 10, // Spirit Tower (upgraded zig, still provides supply)
  uzg2: 10, // Nerubian Tower
  unpl: 10, // Necropolis
  unp1: 10, // Halls of the Dead
  unp2: 10, // Black Citadel
};

// =====================
// TIER BUILDINGS (town halls)
// =====================
export const TIER_BUILDINGS: Record<string, number> = {
  // Human
  htow: 1, // Town Hall
  hkee: 2, // Keep
  hcas: 3, // Castle
  // Orc
  ogre: 1, // Great Hall
  ostr: 2, // Stronghold
  ofrt: 3, // Fortress
  // Night Elf
  etol: 1, // Tree of Life
  etoa: 2, // Tree of Ages
  etoe: 3, // Tree of Eternity
  // Undead
  unpl: 1, // Necropolis
  unp1: 2, // Halls of the Dead
  unp2: 3, // Black Citadel
};

// =====================
// WORKER IDS
// =====================
export const WORKER_IDS = new Set(["hpea", "opeo", "ewsp", "uaco"]);

// Ghoul is undead lumber harvester
export const LUMBER_HARVESTER_IDS: Record<string, Set<string>> = {
  human: new Set(["hpea"]),
  orc: new Set(["opeo"]),
  night_elf: new Set(["ewsp"]),
  undead: new Set(["ugho"]),
};

// =====================
// UPKEEP THRESHOLDS
// =====================
export const UPKEEP_THRESHOLDS: { bracket: UpkeepBracket; minSupply: number; taxRate: number }[] = [
  { bracket: "none", minSupply: 0, taxRate: 0 },
  { bracket: "low", minSupply: 51, taxRate: 0.3 },
  { bracket: "high", minSupply: 81, taxRate: 0.6 },
];

export const MAX_SUPPLY = 100;

// =====================
// ECONOMY RATES
// =====================
/** Gold per trip per worker (standard mine, 10 gold per trip, ~5 sec round trip) */
export const GOLD_PER_SECOND_PER_WORKER = 2.0;
/** Lumber per trip for most races (10 lumber, ~8 sec round trip) */
export const LUMBER_PER_SECOND_HUMAN = 1.25;
export const LUMBER_PER_SECOND_ORC = 1.25;
/** Night elf wisps harvest continuously: ~0.8 lumber/sec */
export const LUMBER_PER_SECOND_NE = 0.8;
/** Undead ghouls carry 20 per trip, ~8 sec round trip */
export const LUMBER_PER_SECOND_UD = 2.5;

export const LUMBER_RATES: Record<string, number> = {
  human: LUMBER_PER_SECOND_HUMAN,
  orc: LUMBER_PER_SECOND_ORC,
  night_elf: LUMBER_PER_SECOND_NE,
  undead: LUMBER_PER_SECOND_UD,
};

// =====================
// HERO XP TABLE
// =====================
/** XP required to reach each level. Index 0 = level 1 (0 XP needed) */
export const HERO_XP_TABLE = [
  0,    // Level 1
  200,  // Level 2
  500,  // Level 3
  900,  // Level 4
  1400, // Level 5
  2000, // Level 6
  2700, // Level 7
  3500, // Level 8
  4400, // Level 9
  5400, // Level 10
];

/** Estimated hero XP gain per second from creeping (rough average) */
export const HERO_XP_PER_SECOND_CREEPING = 3.0;

// =====================
// HERO SCORING
// =====================
/** Non-linear hero value by level */
export const HERO_LEVEL_SCORE: number[] = [
  0,    // Level 0 (shouldn't happen)
  300,  // Level 1
  550,  // Level 2
  850,  // Level 3
  1100, // Level 4
  1400, // Level 5
  1800, // Level 6
  2250, // Level 7
  2750, // Level 8
  3300, // Level 9
  3900, // Level 10
];

// =====================
// ITEM CATEGORY MULTIPLIERS
// =====================
export const ITEM_CATEGORY_MULTIPLIER: Record<string, number> = {
  permanent: 1.2,
  charged: 0.8,
  powerup: 0.5,
  artifact: 1.5,
  purchasable: 1.0,
};

// =====================
// NIGHT ELF WISP CONSUMPTION BUILDINGS
// =====================
/** NE buildings that consume the wisp during construction */
export const NE_WISP_CONSUMED_BUILDINGS = new Set([
  "etol", "etoa", "etoe", "eaom", "eaow", "eaoe",
  "eate", "edob", "emow", "eden", "etrp", "edos",
]);

// =====================
// SNAPSHOT INTERVAL
// =====================
export const SNAPSHOT_INTERVAL_MS = 3000;
