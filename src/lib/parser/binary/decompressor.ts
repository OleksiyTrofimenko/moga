import * as zlib from "zlib";
import { BinaryReader } from "./reader";
import type { RawReplayHeader } from "./types";
import { ReplayParseError } from "./header";

/**
 * Decompress all compressed data blocks from a .w3g replay.
 *
 * Classic format (header version 0): 2+2+4 = 8-byte block header
 *   - WORD:  compressed data size (including 8-byte header)
 *   - WORD:  decompressed data size
 *   - DWORD: checksum
 *
 * Reforged format (header version 1): 4+4+4 = 12-byte block header
 *   - DWORD: compressed data size (including 12-byte header)
 *   - DWORD: decompressed data size
 *   - DWORD: checksum
 */
export function decompressBlocks(
  buffer: Buffer,
  header: RawReplayHeader
): Buffer {
  const reader = new BinaryReader(buffer);
  const chunks: Buffer[] = [];
  const isReforged = header.headerVersion === 1;
  const blockHeaderSize = isReforged ? 12 : 8;

  for (let i = 0; i < header.numBlocks; i++) {
    if (reader.remaining() < blockHeaderSize) {
      break;
    }

    let compressedSize: number;
    let decompressedSize: number;

    if (isReforged) {
      compressedSize = reader.readUInt32LE();
      decompressedSize = reader.readUInt32LE();
      reader.skip(4); // checksum
    } else {
      compressedSize = reader.readUInt16LE();
      decompressedSize = reader.readUInt16LE();
      reader.skip(4); // checksum
    }

    // Classic format: compressedSize includes the 8-byte block header
    // Reforged format: compressedSize is the raw compressed data size (excludes header)
    const dataSize = isReforged ? compressedSize : compressedSize - blockHeaderSize;

    if (dataSize <= 0 || reader.remaining() < dataSize) {
      throw new ReplayParseError(
        `Block ${i}: expected ${dataSize} compressed bytes but only ${reader.remaining()} remain`
      );
    }

    const compressedData = reader.readBytes(dataSize);

    try {
      const decompressed = zlib.inflateSync(compressedData, {
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      });
      chunks.push(decompressed.subarray(0, decompressedSize));
    } catch {
      try {
        const decompressed = zlib.inflateRawSync(compressedData, {
          finishFlush: zlib.constants.Z_SYNC_FLUSH,
        });
        chunks.push(decompressed.subarray(0, decompressedSize));
      } catch {
        throw new ReplayParseError(
          `Block ${i}: decompression failed`
        );
      }
    }
  }

  return Buffer.concat(chunks);
}
