/**
 * Extracts build orders from normalized events.
 * Pure function — walks events once, creates chronological BuildOrderEntry per player.
 */

import type { NormalizedEvent, ReplayMetadata } from "@/lib/parser/domain/types";
import type { DefinitionsCache } from "../definitions-cache";
import type {
  BuildOrderEntry,
  PlayerBuildOrder,
  BuildOrderAction,
  GamePhase,
} from "../types";
import { WORKER_IDS, STARTING_STATE } from "../constants";

/** Simple time-based phase classification for build order context */
function phaseFromTime(ms: number): GamePhase {
  const min = ms / 60000;
  if (min < 2) return "opening";
  if (min < 6) return "early";
  if (min < 12) return "early_mid";
  if (min < 18) return "mid";
  if (min < 22) return "mid_late";
  return "late";
}

interface PlayerTrackingState {
  supply: number;
  maxSupply: number;
  workerCount: number;
}

export function extractBuildOrders(
  events: NormalizedEvent[],
  metadata: ReplayMetadata,
  defs: DefinitionsCache
): PlayerBuildOrder[] {
  const players = metadata.players.slice(0, 2);
  if (players.length < 2) return [];

  // Initialize per-player tracking
  const tracking = new Map<number, PlayerTrackingState>();
  for (const p of players) {
    const start = STARTING_STATE[p.race] ?? STARTING_STATE.human;
    tracking.set(p.id, {
      supply: start.supply,
      maxSupply: start.maxSupply,
      workerCount: start.workers,
    });
  }

  const entriesByPlayer = new Map<number, BuildOrderEntry[]>();
  for (const p of players) {
    entriesByPlayer.set(p.id, []);
  }

  // Track cancelled items to mark them
  const cancelledEntries: { playerId: number; gameId: string; timestampMs: number }[] = [];

  // Sort events by time
  const sorted = [...events]
    .filter(
      (e) =>
        e.type === "UNIT_TRAINED" ||
        e.type === "BUILDING_STARTED" ||
        e.type === "HERO_TRAINED" ||
        e.type === "UPGRADE_STARTED" ||
        e.type === "ITEM_USED" ||
        e.type === "BUILD_CANCELLED"
    )
    .sort((a, b) => a.timestampMs - b.timestampMs);

  for (const event of sorted) {
    const state = tracking.get(event.playerId);
    if (!state) continue;

    const gameId =
      (event.payload.itemId as string) ??
      (event.payload.gameId as string) ??
      "";
    if (!gameId) continue;

    if (event.type === "BUILD_CANCELLED") {
      cancelledEntries.push({
        playerId: event.playerId,
        gameId,
        timestampMs: event.timestampMs,
      });
      // Undo supply tracking for cancelled units
      const unitDef = defs.units.get(gameId);
      if (unitDef) {
        state.supply -= unitDef.supply;
        if (WORKER_IDS.has(gameId)) state.workerCount--;
      }
      continue;
    }

    let action: BuildOrderAction;
    let name = "";
    let goldCost = 0;
    let lumberCost = 0;

    switch (event.type) {
      case "UNIT_TRAINED": {
        action = "unit";
        const def = defs.units.get(gameId);
        name = def?.name ?? (event.payload.name as string) ?? gameId;
        goldCost = def?.goldCost ?? 0;
        lumberCost = def?.lumberCost ?? 0;
        state.supply += def?.supply ?? 0;
        if (WORKER_IDS.has(gameId)) state.workerCount++;
        break;
      }
      case "BUILDING_STARTED": {
        action = "building";
        const def = defs.buildings.get(gameId);
        name = def?.name ?? (event.payload.name as string) ?? gameId;
        goldCost = def?.goldCost ?? 0;
        lumberCost = def?.lumberCost ?? 0;
        break;
      }
      case "HERO_TRAINED": {
        action = "hero";
        const def = defs.heroes.get(gameId);
        name = def?.name ?? (event.payload.name as string) ?? gameId;
        // Heroes don't have a simple gold cost in the def — first train is free, revives cost gold
        goldCost = 0;
        lumberCost = 0;
        state.supply += 5; // Heroes cost 5 supply
        break;
      }
      case "UPGRADE_STARTED": {
        action = "upgrade";
        const def = defs.upgrades.get(gameId);
        name = def?.name ?? (event.payload.name as string) ?? gameId;
        const level = (event.payload.level as number) ?? 1;
        const goldCosts = def?.goldCost ?? [];
        const lumberCosts = def?.lumberCost ?? [];
        goldCost =
          goldCosts[Math.min(level - 1, goldCosts.length - 1)] ?? 0;
        lumberCost =
          lumberCosts[Math.min(level - 1, lumberCosts.length - 1)] ?? 0;
        break;
      }
      case "ITEM_USED": {
        action = "item";
        const def = defs.items.get(gameId);
        if (!def) continue; // Skip unknown items
        name = def.name;
        goldCost = def.goldCost ?? 0;
        lumberCost = 0;
        break;
      }
      default:
        continue;
    }

    const entries = entriesByPlayer.get(event.playerId);
    entries?.push({
      timestampMs: event.timestampMs,
      playerId: event.playerId,
      action,
      gameId,
      name,
      supplyAtTime: Math.max(0, state.supply),
      maxSupplyAtTime: state.maxSupply,
      workerCount: Math.max(0, state.workerCount),
      goldCost,
      lumberCost,
      gamePhase: phaseFromTime(event.timestampMs),
      isCancelled: false,
    });
  }

  // Mark cancelled entries
  for (const cancel of cancelledEntries) {
    const entries = entriesByPlayer.get(cancel.playerId);
    if (!entries) continue;
    // Find the last non-cancelled entry with matching gameId before cancellation time
    for (let i = entries.length - 1; i >= 0; i--) {
      if (
        entries[i].gameId === cancel.gameId &&
        !entries[i].isCancelled &&
        entries[i].timestampMs <= cancel.timestampMs
      ) {
        entries[i].isCancelled = true;
        break;
      }
    }
  }

  return players.map((p) => ({
    playerId: p.id,
    playerName: p.name,
    race: p.race,
    entries: entriesByPlayer.get(p.id) ?? [],
  }));
}
