import type { RawTimeSlot, RawAction } from "../binary/types";
import type { TimeSlotParseResult } from "../binary/timeslot";
import type { NormalizedEvent, NormalizedEventType, ReplayMetadata } from "./types";
import { GAME_ID_MAP } from "./game-id-map";

/**
 * Classify an action's item ID into a domain event type.
 * Returns null if the item ID is not in our mapping (logged as unknown).
 */
function classifyAction(
  action: RawAction
): { type: NormalizedEventType; name: string } | null {
  if (!action.itemId) return null;

  const entry = GAME_ID_MAP[action.itemId];
  if (!entry) return null;

  switch (entry.category) {
    case "unit":
      return { type: "UNIT_TRAINED", name: entry.name };
    case "building":
      return { type: "BUILDING_STARTED", name: entry.name };
    case "hero":
      return { type: "HERO_TRAINED", name: entry.name };
    case "upgrade":
      return { type: "UPGRADE_STARTED", name: entry.name };
    case "ability":
      return { type: "ABILITY_USED", name: entry.name };
    case "item":
      return { type: "ITEM_USED", name: entry.name };
    default:
      return null;
  }
}

/**
 * Check if an item ID looks like a game entity ID vs a numeric command.
 * Numeric commands have the pattern XX XX 0D 00.
 */
function isEntityId(itemId: string): boolean {
  // Entity IDs are readable ASCII (letters)
  // Command IDs have byte patterns like \x03\x00\r\x00
  return /^[A-Za-z0-9]{4}$/.test(itemId);
}

export interface NormalizerResult {
  events: NormalizedEvent[];
  unknownActionIds: Record<number, number>;
  unknownItemIds: Record<string, number>;
}

/**
 * Transform raw timeslots + chat/leave events into normalized domain events.
 */
export function normalizeReplay(
  parseResult: TimeSlotParseResult,
  metadata: ReplayMetadata
): NormalizerResult {
  let events: NormalizedEvent[] = [];
  const unknownActionIds: Record<number, number> = {};
  const unknownItemIds: Record<string, number> = {};

  // GAME_START event
  events.push({
    type: "GAME_START",
    timestampMs: 0,
    playerId: 0,
    payload: {
      mapName: metadata.mapName,
      gameName: metadata.gameName,
      playerCount: metadata.players.length,
    },
    isInferred: false,
  });

  // PLAYER_INFO events
  for (const player of metadata.players) {
    events.push({
      type: "PLAYER_INFO",
      timestampMs: 0,
      playerId: player.id,
      payload: {
        name: player.name,
        race: player.race,
        teamNumber: player.teamNumber,
        color: player.color,
      },
      isInferred: false,
    });
  }

  // Process timeslots
  let currentTimeMs = 0;

  for (const timeSlot of parseResult.timeSlots) {
    currentTimeMs += timeSlot.timeIncrementMs;

    for (const cmdBlock of timeSlot.commandData) {
      // Collect Reforged action item IDs to deduplicate with classic actions.
      // Reforged replays send both 0x7A + 0x10 for the same command.
      const reforgedItemIds = new Set<string>();
      for (const action of cmdBlock.actions) {
        if (
          (action.actionId === 0x7a ||
            action.actionId === 0x7b ||
            action.actionId === 0x7c) &&
          action.itemId
        ) {
          reforgedItemIds.add(action.itemId);
        }
      }

      for (const action of cmdBlock.actions) {
        // Skip classic actions that duplicate a Reforged action
        if (
          reforgedItemIds.size > 0 &&
          (action.actionId === 0x10 ||
            action.actionId === 0x11 ||
            action.actionId === 0x12) &&
          action.itemId &&
          reforgedItemIds.has(action.itemId)
        ) {
          continue;
        }

        const event = processAction(
          action,
          currentTimeMs,
          cmdBlock.playerId,
          unknownActionIds,
          unknownItemIds
        );
        if (event) {
          events.push(event);
        }
      }
    }
  }

  // Chat messages
  for (const chat of parseResult.chatMessages) {
    events.push({
      type: "CHAT_MESSAGE",
      timestampMs: 0, // chat messages don't have exact timestamps in the block
      playerId: chat.playerId,
      payload: { message: chat.message, flags: chat.flags },
      isInferred: false,
    });
  }

  // Player leave events
  for (const leave of parseResult.leaveEvents) {
    events.push({
      type: "PLAYER_LEFT",
      timestampMs: metadata.durationMs, // approximate: end of game
      playerId: leave.playerId,
      payload: {
        reason: leave.reason,
        result: leave.result,
      },
      isInferred: false,
    });
  }

  // Deduplicate: In Reforged replays, building commands fire twice:
  // first as 0x7A (Reforged ability), then 0x11 (classic placement) ~100-1000ms later.
  // Keep the 0x7A (earlier one) and drop the 0x11 duplicate.
  const buildEventTypes = new Set([
    "UNIT_TRAINED", "BUILDING_STARTED", "HERO_TRAINED", "UPGRADE_STARTED",
  ]);
  const recentBuildKeys = new Map<string, number>(); // key → timestampMs
  const deduped: NormalizedEvent[] = [];

  for (const event of events) {
    if (buildEventTypes.has(event.type)) {
      const itemId = (event.payload as Record<string, unknown>).itemId ?? "";
      const key = `${event.type}:${event.playerId}:${itemId}`;
      const prevTime = recentBuildKeys.get(key);

      if (prevTime !== undefined && event.timestampMs - prevTime < 2000) {
        // Duplicate within 2-second window — skip
        continue;
      }
      recentBuildKeys.set(key, event.timestampMs);
    }
    deduped.push(event);
  }
  events = deduped;

  // GAME_END event
  events.push({
    type: "GAME_END",
    timestampMs: metadata.durationMs,
    playerId: 0,
    payload: { durationMs: metadata.durationMs },
    isInferred: false,
  });

  return { events, unknownActionIds, unknownItemIds };
}

function processAction(
  action: RawAction,
  timestampMs: number,
  playerId: number,
  unknownActionIds: Record<number, number>,
  unknownItemIds: Record<string, number>
): NormalizedEvent | null {
  switch (action.actionId) {
    // Ability actions (0x10-0x12 classic, 0x7a-0x7c Reforged)
    case 0x10:
    case 0x11:
    case 0x12:
    case 0x7a:
    case 0x7b:
    case 0x7c: {
      if (!action.itemId) return null;

      // Skip numeric commands (right-click, attack, move, etc.)
      if (!isEntityId(action.itemId)) return null;

      const classified = classifyAction(action);
      if (classified) {
        return {
          type: classified.type,
          timestampMs,
          playerId,
          payload: {
            itemId: action.itemId,
            name: classified.name,
            targetX: action.targetX,
            targetY: action.targetY,
          },
          isInferred: false,
          rawActionId: action.actionId,
        };
      }

      // Unknown entity ID — track it
      unknownItemIds[action.itemId] =
        (unknownItemIds[action.itemId] || 0) + 1;

      return {
        type: "ABILITY_USED",
        timestampMs,
        playerId,
        payload: {
          itemId: action.itemId,
          targetX: action.targetX,
          targetY: action.targetY,
        },
        isInferred: false,
        rawActionId: action.actionId,
      };
    }

    // Give/drop item (0x13)
    // The itemId field here is an ability ID (e.g., "give item" command),
    // NOT the actual item's game type. Only emit ITEM_USED if itemId is
    // a known item in our mapping; otherwise skip (binary garbage).
    case 0x13: {
      if (!action.itemId || !isEntityId(action.itemId)) return null;

      const entry = GAME_ID_MAP[action.itemId];
      if (!entry || entry.category !== "item") return null;

      return {
        type: "ITEM_USED",
        timestampMs,
        playerId,
        payload: {
          itemId: action.itemId,
          name: entry.name,
          targetX: action.targetX,
          targetY: action.targetY,
        },
        isInferred: false,
        rawActionId: action.actionId,
      };
    }

    // Build queue cancel
    case 0x1e: {
      return {
        type: "BUILD_CANCELLED",
        timestampMs,
        playerId,
        payload: {
          itemId: action.itemId,
          slotNumber: action.slotNumber,
        },
        isInferred: false,
        rawActionId: action.actionId,
      };
    }

    // Selection change
    case 0x16: {
      // Skip selection events for now (too noisy for the event stream)
      // They'll be useful in Phase 2 for army tracking
      return null;
    }

    // Hotkey assignment
    case 0x17: {
      return null; // Skip for now
    }

    // Minimap ping
    case 0x68: {
      return {
        type: "MINIMAP_PING",
        timestampMs,
        playerId,
        payload: {
          x: action.targetX,
          y: action.targetY,
        },
        isInferred: false,
        rawActionId: action.actionId,
      };
    }

    default: {
      // Track unknown action IDs
      if (action.rawBytes) {
        unknownActionIds[action.actionId] =
          (unknownActionIds[action.actionId] || 0) + 1;
      }
      return null;
    }
  }
}
