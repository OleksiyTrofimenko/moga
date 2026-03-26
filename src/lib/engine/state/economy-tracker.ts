/**
 * Estimates gold/lumber based on income over time minus spending from events.
 */

import {
  GOLD_PER_SECOND_PER_WORKER,
  LUMBER_RATES,
  STARTING_STATE,
} from "../constants";
import type { EconomySnapshot, UpkeepBracket } from "../types";

export class EconomyTracker {
  private gold: number;
  private lumber: number;
  private totalGoldSpent = 0;
  private totalLumberSpent = 0;
  private _workerCount: number;
  private _miningWorkers: number;
  private _lumberWorkers: number;
  private race: string;
  private lastTickMs = -1;

  constructor(race: string) {
    this.race = race;
    const start = STARTING_STATE[race];
    this.gold = start?.gold ?? 500;
    this.lumber = start?.lumber ?? 150;
    this._workerCount = start?.workers ?? 5;
    // Default split: 3 mining, 2 lumber (for most races at game start)
    this._miningWorkers = Math.ceil(this._workerCount * 0.6);
    this._lumberWorkers = this._workerCount - this._miningWorkers;
  }

  get workerCount(): number {
    return this._workerCount;
  }

  get miningWorkers(): number {
    return this._miningWorkers;
  }

  get lumberWorkers(): number {
    return this._lumberWorkers;
  }

  addWorker(): void {
    this._workerCount++;
    this._rebalanceWorkers();
  }

  removeWorker(): void {
    if (this._workerCount > 0) {
      this._workerCount--;
      this._rebalanceWorkers();
    }
  }

  private _rebalanceWorkers(): void {
    // Heuristic: ~60% mining, ~40% lumber
    this._miningWorkers = Math.ceil(this._workerCount * 0.6);
    this._lumberWorkers = this._workerCount - this._miningWorkers;
  }

  spend(gold: number, lumber: number): void {
    this.gold -= gold;
    this.lumber -= lumber;
    this.totalGoldSpent += gold;
    this.totalLumberSpent += lumber;
  }

  /**
   * Advance economy by elapsed time, accounting for income.
   */
  tick(timestampMs: number, upkeepBracket: UpkeepBracket): void {
    if (this.lastTickMs < 0) {
      this.lastTickMs = timestampMs;
      return;
    }

    const elapsedSec = (timestampMs - this.lastTickMs) / 1000;
    if (elapsedSec <= 0) return;

    // Gold income (affected by upkeep)
    const taxRate =
      upkeepBracket === "high" ? 0.6 : upkeepBracket === "low" ? 0.3 : 0;
    const goldPerSec =
      this._miningWorkers * GOLD_PER_SECOND_PER_WORKER * (1 - taxRate);
    this.gold += goldPerSec * elapsedSec;

    // Lumber income
    const lumberRate = LUMBER_RATES[this.race] ?? 1.25;
    const lumberPerSec = this._lumberWorkers * lumberRate;
    this.lumber += lumberPerSec * elapsedSec;

    this.lastTickMs = timestampMs;
  }

  snapshot(): EconomySnapshot {
    return {
      goldEstimate: Math.max(0, Math.round(this.gold)),
      lumberEstimate: Math.max(0, Math.round(this.lumber)),
      goldIncome:
        this._miningWorkers * GOLD_PER_SECOND_PER_WORKER,
      lumberIncome:
        this._lumberWorkers * (LUMBER_RATES[this.race] ?? 1.25),
      workerCount: this._workerCount,
      miningWorkers: this._miningWorkers,
      lumberWorkers: this._lumberWorkers,
      upkeepBracket: "none", // Filled in by PlayerState from SupplyTracker
      totalGoldSpent: Math.round(this.totalGoldSpent),
      totalLumberSpent: Math.round(this.totalLumberSpent),
      isEstimated: true,
    };
  }
}
