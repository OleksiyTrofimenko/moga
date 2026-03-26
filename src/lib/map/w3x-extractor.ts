/**
 * Extracts files from .w3x map archives (MPQ format with W3X header).
 * W3X files have a 512-byte "HM3W" header before the MPQ data.
 */

import * as fs from "fs";
import * as fsp from "fs/promises";

// Wrapper that adds an offset to all file handle reads
class OffsetFileHandle {
  constructor(
    private fh: fsp.FileHandle,
    private offset: number
  ) {}

  async read(
    buffer: Buffer,
    bufOffset: number,
    length: number,
    position: number | null
  ) {
    return this.fh.read(
      buffer,
      bufOffset,
      length,
      position !== null && position !== undefined
        ? position + this.offset
        : null
    );
  }

  async close() {
    return this.fh.close();
  }
}

/**
 * Find the MPQ header offset within a W3X file.
 * W3X files start with "HM3W" and have MPQ data starting at offset 512.
 */
function findMpqOffset(filePath: string): number {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(2048);
  fs.readSync(fd, buf, 0, 2048, 0);
  fs.closeSync(fd);

  for (let i = 0; i < buf.length - 4; i++) {
    if (
      buf[i] === 0x4d &&
      buf[i + 1] === 0x50 &&
      buf[i + 2] === 0x51 &&
      buf[i + 3] === 0x1a
    ) {
      return i;
    }
  }

  throw new Error(`No MPQ header found in ${filePath}`);
}

/**
 * Extract a file from a .w3x archive.
 */
export async function extractFile(
  w3xPath: string,
  innerPath: string
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MPQ } = require("@clearvisiongg/nodempq/mpq/mpq");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readHeader } = require("@clearvisiongg/nodempq/mpq/header");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readHashTable } = require("@clearvisiongg/nodempq/mpq/hash");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readBlockTable } = require("@clearvisiongg/nodempq/mpq/block");

  const mpqOffset = findMpqOffset(w3xPath);

  const fh = await fsp.open(w3xPath, "r");
  const wrapped = new OffsetFileHandle(fh, mpqOffset);

  const mpq = new MPQ(w3xPath, wrapped);
  try {
    await readHeader(wrapped, mpq.header);
    await readHashTable(mpq);
    await readBlockTable(mpq);

    if (!mpq.contains(innerPath)) {
      throw new Error(`File "${innerPath}" not found in ${w3xPath}`);
    }

    const data: Buffer = await mpq.readFile(innerPath);
    return data;
  } finally {
    await mpq.close();
  }
}

/**
 * Check if a file exists within a .w3x archive.
 */
export async function containsFile(
  w3xPath: string,
  innerPath: string
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MPQ } = require("@clearvisiongg/nodempq/mpq/mpq");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readHeader } = require("@clearvisiongg/nodempq/mpq/header");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readHashTable } = require("@clearvisiongg/nodempq/mpq/hash");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readBlockTable } = require("@clearvisiongg/nodempq/mpq/block");

  const mpqOffset = findMpqOffset(w3xPath);
  const fh = await fsp.open(w3xPath, "r");
  const wrapped = new OffsetFileHandle(fh, mpqOffset);

  const mpq = new MPQ(w3xPath, wrapped);
  try {
    await readHeader(wrapped, mpq.header);
    await readHashTable(mpq);
    await readBlockTable(mpq);
    return mpq.contains(innerPath);
  } finally {
    await mpq.close();
  }
}
