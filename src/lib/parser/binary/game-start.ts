import { BinaryReader } from "./reader";
import type { RawSlotRecord, RawGameSettings, RawGameStartRecord } from "./types";

/**
 * Decode the encoded settings/stat string from the replay.
 *
 * The encoding works in 8-byte groups: first byte is a mask,
 * next 7 bytes are data. For each data byte, if the corresponding
 * mask bit is 0, subtract 1 from the byte; if 1, keep as-is.
 *
 * The decoded result contains null-separated fields:
 *   settings_bytes \0 map_path \0 creator_name \0
 */
export function decodeEncodedString(raw: string): string {
  const encoded = Buffer.from(raw, "binary");
  const decoded: number[] = [];
  let mask = 0;

  for (let i = 0; i < encoded.length; i++) {
    if (i % 8 === 0) {
      mask = encoded[i];
    } else {
      const bit = (mask >> (i % 8)) & 1;
      if (bit === 0) {
        decoded.push(encoded[i] - 1);
      } else {
        decoded.push(encoded[i]);
      }
    }
  }

  return Buffer.from(decoded).toString("utf8");
}

/**
 * Parse game settings from the decompressed data.
 * Located after the host player record.
 *
 * Format: GameName\0 \0 EncodedStatString\0 PlayerCount(4) GameType(4) LanguageId(4)
 *
 * Note: There is a null byte separator between the game name and the
 * encoded stat string in the w3g format.
 */
export function parseGameSettings(reader: BinaryReader): RawGameSettings {
  const gameName = reader.readString();

  // The spec places a null byte between game name and the encoded stat string.
  // readString() already consumed game name's null terminator.
  // The next byte is another null (separator) — readString() returns "".
  // The third readString() gets the actual encoded stat string.
  // Read encoded stat string using latin1 to preserve all byte values.
  // The encoded string uses a nibble scheme with high-byte values that
  // would be corrupted by UTF-8 decoding.
  let encodedString = reader.readStringRaw();
  if (encodedString === "") {
    encodedString = reader.readStringRaw();
  }

  const playerCount = reader.readUInt32LE();
  const gameType = reader.readUInt32LE();
  const languageId = reader.readUInt32LE();

  return {
    gameName,
    encodedString,
    playerCount,
    gameType,
    languageId,
  };
}

/**
 * Parse a slot record (one per player slot).
 */
export function parseSlotRecord(reader: BinaryReader): RawSlotRecord {
  const playerId = reader.readUInt8();
  const downloadPercent = reader.readUInt8();
  const slotStatus = reader.readUInt8();
  const isComputer = reader.readUInt8() === 1;
  const teamNumber = reader.readUInt8();
  const color = reader.readUInt8();
  const raceFlags = reader.readUInt8();
  const aiStrength = reader.readUInt8();
  const handicap = reader.readUInt8();

  return {
    playerId,
    downloadPercent,
    slotStatus,
    isComputer,
    teamNumber,
    color,
    raceFlags,
    aiStrength,
    handicap,
  };
}

/**
 * Parse the game start record (record id 0x19).
 * Contains all slot records + random seed + game config.
 */
export function parseGameStartRecord(reader: BinaryReader): RawGameStartRecord {
  const slotByteCount = reader.readUInt16LE();
  const slotCount = reader.readUInt8();

  const slots: RawSlotRecord[] = [];
  for (let i = 0; i < slotCount; i++) {
    slots.push(parseSlotRecord(reader));
  }

  const randomSeed = reader.readUInt32LE();
  const selectMode = reader.readUInt8();
  const startSpotCount = reader.readUInt8();

  return {
    slotCount,
    slots,
    randomSeed,
    selectMode,
    startSpotCount,
  };
}
