import type { RawSubHeader, RawPlayerRecord, RawGameStartRecord, RawGameSettings } from "../binary/types";
import type { ReplayMetadata, PlayerInfo } from "./types";
import { decodeEncodedString } from "../binary/game-start";

/**
 * Map race flag byte to race name.
 * 0x01=Human, 0x02=Orc, 0x04=NE, 0x08=UD, 0x20=Random, 0x40=Selectable
 */
function raceFromFlags(flags: number): PlayerInfo["race"] {
  if (flags & 0x01) return "human";
  if (flags & 0x02) return "orc";
  if (flags & 0x04) return "night_elf";
  if (flags & 0x08) return "undead";
  if (flags & 0x20) return "random";
  return "unknown";
}

/**
 * Extract the map path from the encoded settings string.
 * The encoded string format is: speed_byte + visibility_byte + ... + null + map_path + null + creator + null
 * But after decoding, the first section is settings bytes, then null-separated strings.
 */
function extractMapPath(decodedString: string): string {
  // The decoded stat string has null-separated fields.
  // The map path is in one of these fields, possibly prefixed with
  // non-ASCII bytes (like 0xFF padding). We search for the path pattern.
  const match = decodedString.match(
    /([A-Za-z0-9_()[\]{}. \\/-]+\.w3[xm])/i
  );
  if (match) return match[1];

  // Fallback: look for backslash-containing segment
  const parts = decodedString.split("\0").filter((s) => s.length > 0);
  for (const part of parts) {
    if (part.includes("\\")) return part;
  }

  return parts[0] || "Unknown";
}

/**
 * Extract a human-readable map name from the map path.
 * e.g., "Maps\\FrozenThrone\\(2)ConcealedHill.w3x" → "(2)ConcealedHill"
 */
function mapNameFromPath(mapPath: string): string {
  const parts = mapPath.split("\\");
  let filename = parts[parts.length - 1];
  filename = filename.replace(/\.w3[xm]$/i, "");

  // W3Champions maps use format like "5185_w3c_251104_0950_MapName"
  // Extract just the map name after the numeric prefixes
  const w3cMatch = filename.match(/^\d+_w3c_\d+_\d+_(.+)$/);
  if (w3cMatch) return w3cMatch[1];

  // Standard maps may have player count prefix like "(2)ConcealedHill"
  return filename;
}

export function extractMetadata(
  subHeader: RawSubHeader,
  hostPlayer: RawPlayerRecord,
  additionalPlayers: RawPlayerRecord[],
  gameSettings: RawGameSettings,
  gameStart: RawGameStartRecord
): ReplayMetadata {
  // Version identifier is stored as a DWORD, so "W3XP" may appear as "PX3W"
  const isExpansion =
    subHeader.version === 1 &&
    (subHeader.versionIdentifier === "W3XP" ||
      subHeader.versionIdentifier === "PX3W");

  const gameVersion =
    subHeader.version === 1 ? subHeader.versionNumber : subHeader.buildNumber;

  // Decode the encoded stat string to extract map path
  const decodedStatString = decodeEncodedString(gameSettings.encodedString);
  const mapPath = extractMapPath(decodedStatString);
  const mapName = mapNameFromPath(mapPath);

  // Build player info by matching player records with slot records.
  // Filter out observers (team 24 in Reforged) and referees.
  const allPlayerRecords = [hostPlayer, ...additionalPlayers];
  const players: PlayerInfo[] = [];

  for (const slot of gameStart.slots) {
    if (slot.slotStatus !== 2) continue; // only used slots

    const playerRecord = allPlayerRecords.find(
      (p) => p.playerId === slot.playerId
    );

    const player: PlayerInfo = {
      id: slot.playerId,
      name: playerRecord?.playerName ?? `Player ${slot.playerId}`,
      race: raceFromFlags(slot.raceFlags),
      teamNumber: slot.teamNumber,
      color: slot.color,
      isComputer: slot.isComputer,
      handicap: slot.handicap,
      slot: slot.playerId,
    };

    players.push(player);
  }

  // Separate actual players from observers.
  // In Reforged replays, observers typically have team=24 and race=random/unknown.
  // Real players have team 0 or 1 in 1v1.
  const realPlayers = players.filter(
    (p) => p.teamNumber < 12 && p.race !== "unknown"
  );
  const finalPlayers = realPlayers.length >= 2 ? realPlayers : players;

  return {
    gameVersion,
    buildNumber: subHeader.buildNumber,
    isExpansion,
    durationMs: subHeader.durationMs,
    isMultiplayer: (subHeader.flags & 0x8000) !== 0,
    mapName,
    mapPath,
    gameName: gameSettings.gameName,
    players: finalPlayers,
    randomSeed: gameStart.randomSeed,
  };
}
