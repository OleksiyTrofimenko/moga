/**
 * Tracks UPGRADE_STARTED → infers completion based on research time.
 * Supports multi-level upgrades.
 */

import type { UpgradeState, UpgradeCompletionEntry } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

interface UpgradeInProgress {
  gameId: string;
  level: number; // The level being researched
  startMs: number;
  completionMs: number;
}

export class UpgradeTracker {
  private completed: Map<string, number> = new Map(); // gameId → current level
  private inProgress: UpgradeInProgress[] = [];
  private defs: DefinitionsCache;
  /** Stores completion timestamps: gameId → [timestampMs for each level] */
  private completionTimestamps: Map<string, number[]> = new Map();

  constructor(defs: DefinitionsCache) {
    this.defs = defs;
  }

  startUpgrade(gameId: string, timestampMs: number): void {
    const def = this.defs.upgrades.get(gameId);
    const currentLevel = this.completed.get(gameId) ?? 0;
    const nextLevel = currentLevel + 1;

    // Get research time for the next level
    const researchTimes = def?.researchTime ?? [60];
    const researchTimeSec = researchTimes[Math.min(nextLevel - 1, researchTimes.length - 1)] ?? 60;

    this.inProgress.push({
      gameId,
      level: nextLevel,
      startMs: timestampMs,
      completionMs: timestampMs + researchTimeSec * 1000,
    });
  }

  /**
   * Advance time: complete upgrades whose research time has elapsed.
   */
  tick(timestampMs: number): string[] {
    const newlyCompleted: string[] = [];
    const remaining: UpgradeInProgress[] = [];

    for (const upgrade of this.inProgress) {
      if (timestampMs >= upgrade.completionMs) {
        this.completed.set(upgrade.gameId, upgrade.level);
        newlyCompleted.push(upgrade.gameId);
        // Record completion timestamp
        const timestamps = this.completionTimestamps.get(upgrade.gameId) ?? [];
        timestamps.push(upgrade.completionMs);
        this.completionTimestamps.set(upgrade.gameId, timestamps);
      } else {
        remaining.push(upgrade);
      }
    }

    this.inProgress = remaining;
    return newlyCompleted;
  }

  getLevel(gameId: string): number {
    return this.completed.get(gameId) ?? 0;
  }

  getUpgrades(): UpgradeState[] {
    const allIds = new Set([
      ...this.completed.keys(),
      ...this.inProgress.map((u) => u.gameId),
    ]);

    const result: UpgradeState[] = [];
    for (const gameId of allIds) {
      const def = this.defs.upgrades.get(gameId);
      const currentLevel = this.completed.get(gameId) ?? 0;
      const isInProgress = this.inProgress.some((u) => u.gameId === gameId);

      result.push({
        gameId,
        name: def?.name ?? gameId,
        currentLevel,
        maxLevel: def?.levels ?? 1,
        inProgress: isInProgress,
      });
    }

    return result;
  }

  /** Get all completed upgrades with their levels */
  getCompletedUpgrades(): Map<string, number> {
    return new Map(this.completed);
  }

  /** Get chronological list of upgrade completions with timestamps */
  getCompletionTimeline(): UpgradeCompletionEntry[] {
    const entries: UpgradeCompletionEntry[] = [];
    for (const [gameId, timestamps] of this.completionTimestamps) {
      const def = this.defs.upgrades.get(gameId);
      for (let i = 0; i < timestamps.length; i++) {
        entries.push({
          gameId,
          name: def?.name ?? gameId,
          level: i + 1,
          completedAtMs: timestamps[i],
        });
      }
    }
    return entries.sort((a, b) => a.completedAtMs - b.completedAtMs);
  }
}
