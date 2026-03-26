import { BinaryReader } from "./reader";
import type { RawReplayHeader, RawSubHeader } from "./types";

const EXPECTED_SIGNATURE = "Warcraft III recorded game\x1A\0";

export class ReplayParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReplayParseError";
  }
}

export function parseHeader(reader: BinaryReader): {
  header: RawReplayHeader;
  subHeader: RawSubHeader;
} {
  // Read and validate signature (28 bytes including null + 0x1A)
  const sigBytes = reader.readBytes(28);
  const signature = sigBytes.toString("utf8");

  if (signature !== EXPECTED_SIGNATURE) {
    throw new ReplayParseError(
      `Invalid replay signature. Expected "Warcraft III recorded game", got "${signature.replace(/[\x00-\x1F]/g, "")}"`
    );
  }

  const headerSize = reader.readUInt32LE();
  const compressedSize = reader.readUInt32LE();
  const headerVersion = reader.readUInt32LE();
  const decompressedSize = reader.readUInt32LE();
  const numBlocks = reader.readUInt32LE();

  const header: RawReplayHeader = {
    signature: signature.replace(/[\x00-\x1F]/g, ""),
    headerSize,
    compressedSize,
    headerVersion,
    decompressedSize,
    numBlocks,
  };

  let subHeader: RawSubHeader;

  if (headerVersion === 0) {
    // Pre-TFT format
    const unknown = reader.readUInt16LE();
    const buildNumber = reader.readUInt16LE();
    const flags = reader.readUInt16LE();
    const durationMs = reader.readUInt32LE();
    const checksum = reader.readUInt32LE();

    subHeader = {
      version: 0,
      unknown,
      buildNumber,
      flags,
      durationMs,
      checksum,
    };
  } else {
    // Version 1 (TFT and later)
    const versionIdentifier = reader.readBytes(4).toString("utf8");
    const versionNumber = reader.readUInt32LE();
    const buildNumber = reader.readUInt16LE();
    const flags = reader.readUInt16LE();
    const durationMs = reader.readUInt32LE();
    const checksum = reader.readUInt32LE();

    subHeader = {
      version: 1,
      versionIdentifier,
      versionNumber,
      buildNumber,
      flags,
      durationMs,
      checksum,
    };
  }

  return { header, subHeader };
}
