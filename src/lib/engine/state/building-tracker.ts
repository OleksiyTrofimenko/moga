/**
 * Tracks buildings: started → in-progress → completed (based on build time).
 * Detects tier from town hall gameIds.
 */

import { TIER_BUILDINGS, NE_WISP_CONSUMED_BUILDINGS } from "../constants";
import type { BuildingState } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

interface BuildingInProgress {
  gameId: string;
  startMs: number;
  completionMs: number;
}

export class BuildingTracker {
  private completed: Map<string, number> = new Map(); // gameId → count
  private inProgress: BuildingInProgress[] = [];
  private _tier = 1;
  private defs: DefinitionsCache;
  private race: string;
  /** Callback for NE wisp consumption */
  private onWispConsumed?: () => void;

  constructor(defs: DefinitionsCache, race: string, onWispConsumed?: () => void) {
    this.defs = defs;
    this.race = race;
    this.onWispConsumed = onWispConsumed;

    // Start with a town hall
    const startingTH = this._getStartingTownHall();
    if (startingTH) {
      this.completed.set(startingTH, 1);
    }
  }

  get tier(): number {
    return this._tier;
  }

  private _getStartingTownHall(): string | null {
    const map: Record<string, string> = {
      human: "htow",
      orc: "ogre",
      night_elf: "etol",
      undead: "unpl",
    };
    return map[this.race] ?? null;
  }

  startBuilding(gameId: string, timestampMs: number): void {
    const def = this.defs.buildings.get(gameId);
    const buildTimeMs = (def?.buildTime ?? 60) * 1000;

    this.inProgress.push({
      gameId,
      startMs: timestampMs,
      completionMs: timestampMs + buildTimeMs,
    });

    // NE wisp consumed on building start
    if (this.race === "night_elf" && NE_WISP_CONSUMED_BUILDINGS.has(gameId)) {
      this.onWispConsumed?.();
    }

    // Check if this is a tier upgrade (town hall upgrades appear as BUILDING_STARTED)
    const tierLevel = TIER_BUILDINGS[gameId];
    if (tierLevel && tierLevel > this._tier) {
      // Remove old town hall, the upgrade replaces it
      const oldTH = this.getCurrentTownHall();
      if (oldTH) {
        const count = this.completed.get(oldTH) ?? 0;
        if (count > 1) {
          this.completed.set(oldTH, count - 1);
        } else {
          this.completed.delete(oldTH);
        }
      }
    }
  }

  getCurrentTownHall(): string | null {
    // Find the current tier town hall
    for (const [gameId] of this.completed) {
      if (TIER_BUILDINGS[gameId] !== undefined) {
        return gameId;
      }
    }
    return null;
  }

  /**
   * Advance time: complete buildings whose build time has elapsed.
   */
  tick(timestampMs: number): string[] {
    const newlyCompleted: string[] = [];
    const remaining: BuildingInProgress[] = [];

    for (const building of this.inProgress) {
      if (timestampMs >= building.completionMs) {
        const count = this.completed.get(building.gameId) ?? 0;
        this.completed.set(building.gameId, count + 1);
        newlyCompleted.push(building.gameId);

        // Update tier
        const tierLevel = TIER_BUILDINGS[building.gameId];
        if (tierLevel && tierLevel > this._tier) {
          this._tier = tierLevel;
        }
      } else {
        remaining.push(building);
      }
    }

    this.inProgress = remaining;
    return newlyCompleted;
  }

  cancelBuilding(gameId: string): void {
    const idx = this.inProgress.findIndex((b) => b.gameId === gameId);
    if (idx !== -1) {
      this.inProgress.splice(idx, 1);
    }
  }

  getBuildings(): BuildingState[] {
    const result: BuildingState[] = [];
    const allIds = new Set([
      ...this.completed.keys(),
      ...this.inProgress.map((b) => b.gameId),
    ]);

    for (const gameId of allIds) {
      const completedCount = this.completed.get(gameId) ?? 0;
      const inProgressCount = this.inProgress.filter(
        (b) => b.gameId === gameId
      ).length;
      const def = this.defs.buildings.get(gameId);
      result.push({
        gameId,
        name: def?.name ?? gameId,
        count: completedCount + inProgressCount,
        inProgressCount,
      });
    }

    return result;
  }

  getCompletedCount(gameId: string): number {
    return this.completed.get(gameId) ?? 0;
  }

  /** Count of supply-providing buildings that are completed */
  getSupplyBuildingCount(): number {
    let count = 0;
    for (const [, c] of this.completed) {
      count += c;
    }
    return count;
  }

  /** Check if an expansion exists (more than 1 town hall completed) */
  hasExpansion(): boolean {
    let townHallCount = 0;
    for (const [gameId, count] of this.completed) {
      if (TIER_BUILDINGS[gameId] !== undefined) {
        townHallCount += count;
      }
    }
    return townHallCount > 1;
  }
}
