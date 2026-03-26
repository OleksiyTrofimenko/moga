/**
 * Infers creeping activity from replay events.
 * Watches for creep drop items and hero activity outside engagement windows.
 */

import type { NormalizedEvent } from "@/lib/parser/domain/types";
import type { CreepingWindow, EngagementWindow } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

interface ActiveCreepingSession {
  startMs: number;
  playerId: number;
  lastActivityMs: number;
  xpEstimate: number;
  itemsDropped: string[];
}

const CREEPING_TIMEOUT_MS = 15000; // 15s gap ends a creeping session
const XP_PER_ITEM_DROP_LEVEL: Record<number, number> = {
  1: 60,
  2: 100,
  3: 160,
  4: 240,
  5: 350,
  6: 500,
};

/**
 * Tracks creeping activity from events.
 * Uses item drops and ability usage as signals.
 */
export class CreepTracker {
  private activeSessions = new Map<number, ActiveCreepingSession>();
  private completedWindows: CreepingWindow[] = [];
  private engagementWindows: EngagementWindow[];
  private defs: DefinitionsCache;

  constructor(engagementWindows: EngagementWindow[], defs: DefinitionsCache) {
    this.engagementWindows = engagementWindows;
    this.defs = defs;
  }

  /**
   * Process a single event for creeping signals.
   */
  processEvent(event: NormalizedEvent): void {
    const ts = event.timestampMs;
    const pid = event.playerId;

    // Skip events during engagements
    if (this.isDuringEngagement(ts)) return;

    if (event.type === "ITEM_USED") {
      const payload = event.payload as Record<string, unknown>;
      const itemId = (payload.itemId ?? payload.gameId) as string | undefined;
      if (!itemId) return;

      const itemDef = this.defs.items.get(itemId);
      if (!itemDef) return;

      // Check if this is a creep drop item (powerup or charged category from drops)
      const dropsFrom = itemDef.dropsFrom ?? [];
      if (dropsFrom.length > 0 || itemDef.category === "powerup") {
        this.recordCreepActivity(pid, ts, itemId, itemDef.level ?? 1);
      }
    }

    if (event.type === "ABILITY_USED") {
      // Ability usage outside engagements is a signal of creeping
      const session = this.activeSessions.get(pid);
      if (session) {
        session.lastActivityMs = ts;
      }
    }
  }

  /**
   * Called periodically to close timed-out sessions.
   */
  tick(timestampMs: number): void {
    for (const [pid, session] of this.activeSessions.entries()) {
      if (timestampMs - session.lastActivityMs > CREEPING_TIMEOUT_MS) {
        this.closeSession(pid, session);
        this.activeSessions.delete(pid);
      }
    }
  }

  /**
   * Get all completed creeping windows.
   */
  getCreepingWindows(): CreepingWindow[] {
    // Close any remaining sessions
    for (const [pid, session] of this.activeSessions.entries()) {
      this.closeSession(pid, session);
    }
    this.activeSessions.clear();

    return this.completedWindows.sort((a, b) => a.startMs - b.startMs);
  }

  private recordCreepActivity(
    playerId: number,
    timestampMs: number,
    itemId: string,
    itemLevel: number
  ): void {
    let session = this.activeSessions.get(playerId);

    if (
      !session ||
      timestampMs - session.lastActivityMs > CREEPING_TIMEOUT_MS
    ) {
      // Close previous session if exists
      if (session) {
        this.closeSession(playerId, session);
      }

      session = {
        startMs: Math.max(0, timestampMs - 10000), // assume creeping started ~10s before first drop
        playerId,
        lastActivityMs: timestampMs,
        xpEstimate: 0,
        itemsDropped: [],
      };
      this.activeSessions.set(playerId, session);
    }

    session.lastActivityMs = timestampMs;
    session.itemsDropped.push(itemId);
    session.xpEstimate += XP_PER_ITEM_DROP_LEVEL[itemLevel] ?? 100;
  }

  private closeSession(
    _playerId: number,
    session: ActiveCreepingSession
  ): void {
    if (session.itemsDropped.length === 0) return;

    this.completedWindows.push({
      startMs: session.startMs,
      endMs: session.lastActivityMs,
      playerId: session.playerId,
      estimatedXpGained: session.xpEstimate,
      itemsDropped: session.itemsDropped,
    });
  }

  private isDuringEngagement(timestampMs: number): boolean {
    return this.engagementWindows.some(
      (w) => timestampMs >= w.startMs && timestampMs <= w.endMs
    );
  }
}
