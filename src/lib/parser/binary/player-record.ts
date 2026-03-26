import { BinaryReader } from "./reader";
import type { RawPlayerRecord } from "./types";

/**
 * Parse a player record from the decompressed replay data.
 *
 * Record format:
 * - 1 byte: record id (0x00 for host, 0x16 for additional players)
 * - 1 byte: player id
 * - null-terminated: player name
 * - 1 byte: additional data size
 * - N bytes: additional data (runtime info for ladder games)
 */
export function parsePlayerRecord(reader: BinaryReader): RawPlayerRecord {
  const recordId = reader.readUInt8();
  const playerId = reader.readUInt8();
  const playerName = reader.readString();
  const additionalDataSize = reader.readUInt8();

  // Skip additional data (ladder runtime info)
  if (additionalDataSize > 0) {
    reader.skip(additionalDataSize);
  }

  return {
    recordId,
    playerId,
    playerName,
    additionalDataSize,
  };
}
