/**
 * Detects fights via action density spikes and hero death/revive detection.
 */

import type { EngagementWindow } from "../types";
import type { NormalizedEvent } from "@/lib/parser/domain/types";

const BUCKET_SIZE_MS = 5000; // 5 second buckets
const MIN_ACTIONS_PER_BUCKET = 8; // Both players need to be active
const MERGE_GAP_MS = 10000; // Merge fights within 10 seconds
const MIN_ENGAGEMENT_DURATION_MS = 3000;

interface ActionBucket {
  startMs: number;
  players: Set<number>;
  actionCount: number;
}

/**
 * Detect engagement windows from event stream.
 */
export function detectEngagements(events: NormalizedEvent[]): EngagementWindow[] {
  // Build action density buckets
  const buckets = new Map<number, ActionBucket>();

  const actionTypes = new Set([
    "ABILITY_USED",
    "ITEM_USED",
    "SELECTION_CHANGED",
    "HOTKEY_ASSIGNED",
  ]);

  for (const event of events) {
    if (!actionTypes.has(event.type)) continue;

    const bucketKey = Math.floor(event.timestampMs / BUCKET_SIZE_MS);
    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      bucket = {
        startMs: bucketKey * BUCKET_SIZE_MS,
        players: new Set(),
        actionCount: 0,
      };
      buckets.set(bucketKey, bucket);
    }
    bucket.players.add(event.playerId);
    bucket.actionCount++;
  }

  // Find buckets where both players are highly active
  const hotBuckets: ActionBucket[] = [];
  for (const bucket of buckets.values()) {
    if (bucket.players.size >= 2 && bucket.actionCount >= MIN_ACTIONS_PER_BUCKET) {
      hotBuckets.push(bucket);
    }
  }

  if (hotBuckets.length === 0) return [];

  // Sort by time and merge nearby buckets into engagement windows
  hotBuckets.sort((a, b) => a.startMs - b.startMs);

  const windows: EngagementWindow[] = [];
  let current: EngagementWindow = {
    startMs: hotBuckets[0].startMs,
    endMs: hotBuckets[0].startMs + BUCKET_SIZE_MS,
    intensity: hotBuckets[0].actionCount,
    involvedPlayers: [...hotBuckets[0].players],
    heroDeaths: [],
  };

  for (let i = 1; i < hotBuckets.length; i++) {
    const bucket = hotBuckets[i];
    if (bucket.startMs - current.endMs <= MERGE_GAP_MS) {
      // Merge
      current.endMs = bucket.startMs + BUCKET_SIZE_MS;
      current.intensity = Math.max(current.intensity, bucket.actionCount);
      for (const p of bucket.players) {
        if (!current.involvedPlayers.includes(p)) {
          current.involvedPlayers.push(p);
        }
      }
    } else {
      if (current.endMs - current.startMs >= MIN_ENGAGEMENT_DURATION_MS) {
        windows.push(current);
      }
      current = {
        startMs: bucket.startMs,
        endMs: bucket.startMs + BUCKET_SIZE_MS,
        intensity: bucket.actionCount,
        involvedPlayers: [...bucket.players],
        heroDeaths: [],
      };
    }
  }

  if (current.endMs - current.startMs >= MIN_ENGAGEMENT_DURATION_MS) {
    windows.push(current);
  }

  // Add hero death info from HERO_TRAINED events (revives imply prior death)
  const heroRevives = events.filter((e) => e.type === "HERO_TRAINED");
  const seenHeroes = new Set<string>();
  for (const event of heroRevives) {
    const heroKey = `${event.playerId}-${event.payload.itemId ?? event.payload.gameId}`;
    if (seenHeroes.has(heroKey)) {
      // This is a revive — find the closest engagement window before this
      for (let i = windows.length - 1; i >= 0; i--) {
        if (windows[i].endMs <= event.timestampMs && event.timestampMs - windows[i].endMs <= 60000) {
          windows[i].heroDeaths.push((event.payload.itemId ?? event.payload.gameId) as string);
          break;
        }
      }
    }
    seenHeroes.add(heroKey);
  }

  return windows;
}
