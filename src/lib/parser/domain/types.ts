/**
 * Domain-level event types produced by normalizing raw replay actions.
 *
 * Phase 1: Only events directly derivable from the action stream.
 * Events like UNIT_DEATH, HERO_LEVEL_UP, FIGHT_WINDOW require game-state
 * reconstruction (Phase 2) and will have isInferred=true when added.
 */

export type NormalizedEventType =
  | "GAME_START"
  | "PLAYER_INFO"
  | "UNIT_TRAINED"
  | "BUILDING_STARTED"
  | "HERO_TRAINED"
  | "UPGRADE_STARTED"
  | "ABILITY_USED"
  | "ITEM_USED"
  | "BUILD_CANCELLED"
  | "SELECTION_CHANGED"
  | "HOTKEY_ASSIGNED"
  | "CHAT_MESSAGE"
  | "PLAYER_LEFT"
  | "MINIMAP_PING"
  | "GAME_END"
  | "UNKNOWN_ACTION";

export interface NormalizedEvent {
  type: NormalizedEventType;
  timestampMs: number;
  playerId: number;
  payload: Record<string, unknown>;
  isInferred: boolean;
  rawActionId?: number;
}

export interface ReplayMetadata {
  gameVersion: number;
  buildNumber: number;
  isExpansion: boolean; // W3XP vs WAR3
  durationMs: number;
  isMultiplayer: boolean;
  mapName: string;
  mapPath: string;
  gameName: string;
  players: PlayerInfo[];
  randomSeed: number;
}

export interface PlayerInfo {
  id: number;
  name: string;
  race: "human" | "orc" | "night_elf" | "undead" | "random" | "unknown";
  teamNumber: number;
  color: number;
  isComputer: boolean;
  handicap: number;
  slot: number;
}

export interface ReplayParseResult {
  metadata: ReplayMetadata;
  events: NormalizedEvent[];
  diagnostics: ParserDiagnostics;
}

export interface ParserDiagnostics {
  totalBlocks: number;
  totalTimeSlots: number;
  totalActions: number;
  unknownActionIds: Record<number, number>; // actionId -> count
  unknownItemIds: Record<string, number>; // itemId -> count
  errors: string[];
  parseTimeMs: number;
}
