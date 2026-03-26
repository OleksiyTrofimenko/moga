import { BinaryReader } from "./binary/reader";
import { parseHeader, ReplayParseError } from "./binary/header";
import { decompressBlocks } from "./binary/decompressor";
import { parsePlayerRecord } from "./binary/player-record";
import { parseGameSettings, parseGameStartRecord } from "./binary/game-start";
import { parseReplayBody } from "./binary/timeslot";
import { extractMetadata } from "./domain/metadata-extractor";
import { normalizeReplay } from "./domain/normalizer";
import type { RawPlayerRecord, RawSubHeader } from "./binary/types";
import type { ReplayParseResult, ParserDiagnostics } from "./domain/types";

export { ReplayParseError } from "./binary/header";

/**
 * Full replay parse pipeline:
 * 1. Parse header + subheader
 * 2. Decompress data blocks
 * 3. Parse host player, game settings, additional players
 * 4. Parse game start record (slots)
 * 5. Parse timeslot stream (actions)
 * 6. Extract metadata
 * 7. Normalize actions into domain events
 */
export function parseReplay(buffer: Buffer): ReplayParseResult {
  const startTime = performance.now();
  const errors: string[] = [];

  // Step 1: Parse header
  const headerReader = new BinaryReader(buffer);
  const { header, subHeader } = parseHeader(headerReader);

  // Step 2: Decompress data blocks
  const compressedData = buffer.subarray(header.headerSize);
  const decompressed = decompressBlocks(compressedData, header);

  // Step 3: Parse decompressed data stream
  const dataReader = new BinaryReader(decompressed);

  // Skip unknown dword at start of decompressed data
  dataReader.skip(4);

  // Host player record
  const hostPlayer = parsePlayerRecord(dataReader);

  // Game settings
  const gameSettings = parseGameSettings(dataReader);

  // Additional player records (record id 0x16)
  // Scan byte-by-byte, skipping Reforged metadata blocks between records
  const additionalPlayers: RawPlayerRecord[] = [];
  while (dataReader.hasMore()) {
    const nextByte = dataReader.peek();
    if (nextByte === 0x16) {
      additionalPlayers.push(parsePlayerRecord(dataReader));
    } else if (nextByte === 0x19) {
      // Check if this is a REAL game start record by peeking ahead.
      // Valid game start: 0x19 + slotByteCount(uint16) + slotCount(uint8)
      // where slotCount is 2-24 and slotByteCount ≈ slotCount * 9.
      if (dataReader.remaining() >= 4) {
        const slotByteCount = dataReader.peekUInt16LE(1);
        const slotCount = dataReader.peekUInt8(3);
        const expectedBytes = slotCount * 9;

        if (
          slotCount >= 2 &&
          slotCount <= 24 &&
          slotByteCount >= expectedBytes - 10 &&
          slotByteCount <= expectedBytes + 50
        ) {
          break; // Real game start record found
        } else {
          dataReader.skip(1); // Spurious 0x19 in Reforged metadata
        }
      } else {
        break;
      }
    } else {
      dataReader.skip(1);
    }
  }

  // Step 4: Game start record
  if (!dataReader.hasMore()) {
    throw new ReplayParseError("Reached end of data before game start record");
  }

  const gameStartRecordId = dataReader.readUInt8();
  if (gameStartRecordId !== 0x19) {
    errors.push(
      `Expected game start record (0x19), got 0x${gameStartRecordId.toString(16)}`
    );
  }
  const gameStart = parseGameStartRecord(dataReader);

  // Determine game version for version-dependent parsing
  const gameVersion = getGameVersion(subHeader);

  // Step 5: Parse timeslot stream
  const parseResult = parseReplayBody(dataReader, gameVersion);

  // Step 6: Extract metadata
  const metadata = extractMetadata(
    subHeader,
    hostPlayer,
    additionalPlayers,
    gameSettings,
    gameStart
  );

  // Step 7: Normalize
  const { events, unknownActionIds, unknownItemIds } = normalizeReplay(
    parseResult,
    metadata
  );

  // Count totals
  let totalActions = 0;
  for (const ts of parseResult.timeSlots) {
    for (const cmd of ts.commandData) {
      totalActions += cmd.actions.length;
    }
  }

  const parseTimeMs = performance.now() - startTime;

  const diagnostics: ParserDiagnostics = {
    totalBlocks: header.numBlocks,
    totalTimeSlots: parseResult.timeSlots.length,
    totalActions,
    unknownActionIds,
    unknownItemIds,
    errors,
    parseTimeMs,
  };

  return { metadata, events, diagnostics };
}

function getGameVersion(subHeader: RawSubHeader): number {
  if (subHeader.version === 1) {
    return subHeader.versionNumber;
  }
  if (subHeader.buildNumber < 6031) return 7;
  if (subHeader.buildNumber < 6034) return 13;
  return 14;
}
