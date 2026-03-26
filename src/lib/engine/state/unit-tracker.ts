/**
 * Tracks units from UNIT_TRAINED events and accounts for deaths.
 *
 * Deaths are tracked from:
 * - BUILD_CANCELLED events (cancelled unit training)
 * - Inferred deaths during engagement windows (proportional army loss heuristic)
 * - Hero re-training events (hero death detection, handled by HeroTracker)
 */

import { WORKER_IDS } from "../constants";
import type { UnitCount, ProductionEntry, LossEntry } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

export class UnitTracker {
  private counts: Map<string, number> = new Map(); // gameId → alive count
  private totalTrained: Map<string, number> = new Map(); // gameId → total trained
  private totalLost: Map<string, number> = new Map(); // gameId → total lost
  private defs: DefinitionsCache;
  /** Whether any deaths have been recorded (used for uncertainty flags) */
  hasDeathData = false;

  constructor(defs: DefinitionsCache, initialWorkers: { gameId: string; count: number }[]) {
    this.defs = defs;
    for (const { gameId, count } of initialWorkers) {
      this.counts.set(gameId, count);
      this.totalTrained.set(gameId, count);
    }
  }

  addUnit(gameId: string): void {
    const current = this.counts.get(gameId) ?? 0;
    this.counts.set(gameId, current + 1);
    const trained = this.totalTrained.get(gameId) ?? 0;
    this.totalTrained.set(gameId, trained + 1);
  }

  removeUnit(gameId: string): void {
    const current = this.counts.get(gameId) ?? 0;
    if (current > 0) {
      this.counts.set(gameId, current - 1);
      const lost = this.totalLost.get(gameId) ?? 0;
      this.totalLost.set(gameId, lost + 1);
      this.hasDeathData = true;
    }
  }

  /**
   * Cancel a unit in training — effectively removes a queued unit.
   * The BUILD_CANCELLED event fires when a player cancels production.
   */
  cancelUnit(gameId: string): void {
    const current = this.counts.get(gameId) ?? 0;
    if (current > 0) {
      this.counts.set(gameId, current - 1);
      // Also decrement total trained since it was cancelled, not lost
      const trained = this.totalTrained.get(gameId) ?? 0;
      if (trained > 0) {
        this.totalTrained.set(gameId, trained - 1);
      }
    }
  }

  /**
   * Apply estimated losses during an engagement window.
   * Uses a proportional loss model based on army score ratio.
   * @param lossRatio 0-1 fraction of army lost (e.g., 0.3 = 30% of units lost)
   */
  applyEngagementLosses(lossRatio: number): void {
    if (lossRatio <= 0) return;
    const ratio = Math.min(lossRatio, 0.8); // Cap at 80% loss

    for (const [gameId, count] of this.counts) {
      if (count <= 0) continue;
      // Don't kill workers in engagements (they're usually at base)
      if (WORKER_IDS.has(gameId)) continue;

      const losses = Math.round(count * ratio);
      if (losses > 0) {
        this.counts.set(gameId, count - losses);
        const lost = this.totalLost.get(gameId) ?? 0;
        this.totalLost.set(gameId, lost + losses);
        this.hasDeathData = true;
      }
    }
  }

  getCount(gameId: string): number {
    return this.counts.get(gameId) ?? 0;
  }

  getWorkerCount(): number {
    let count = 0;
    for (const id of WORKER_IDS) {
      count += this.counts.get(id) ?? 0;
    }
    return count;
  }

  /** Get total supply used by all units (excluding heroes) */
  getTotalSupply(): number {
    let total = 0;
    for (const [gameId, count] of this.counts) {
      const def = this.defs.units.get(gameId);
      if (def) {
        total += def.supply * count;
      }
    }
    return total;
  }

  getUnits(): UnitCount[] {
    const result: UnitCount[] = [];
    for (const [gameId, count] of this.counts) {
      if (count <= 0) continue;
      const def = this.defs.units.get(gameId);
      result.push({
        gameId,
        name: def?.name ?? gameId,
        count,
        supply: (def?.supply ?? 0) * count,
        goldCost: def?.goldCost ?? 0,
        lumberCost: def?.lumberCost ?? 0,
        isEstimated: !this.hasDeathData,
      });
    }
    return result;
  }

  /** Get summary of all units produced */
  getProductionSummary(): ProductionEntry[] {
    const result: ProductionEntry[] = [];
    for (const [gameId, count] of this.totalTrained) {
      if (count <= 0) continue;
      const def = this.defs.units.get(gameId);
      result.push({
        gameId,
        name: def?.name ?? gameId,
        count,
        totalGold: (def?.goldCost ?? 0) * count,
        totalLumber: (def?.lumberCost ?? 0) * count,
      });
    }
    return result;
  }

  /** Get summary of all units lost */
  getLossSummary(): LossEntry[] {
    const result: LossEntry[] = [];
    for (const [gameId, count] of this.totalLost) {
      if (count <= 0) continue;
      const def = this.defs.units.get(gameId);
      result.push({
        gameId,
        name: def?.name ?? gameId,
        count,
      });
    }
    return result;
  }
}
