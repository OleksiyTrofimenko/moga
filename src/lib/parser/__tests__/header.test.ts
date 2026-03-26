import { describe, it, expect } from "vitest";
import { BinaryReader } from "../binary/reader";
import { parseHeader, ReplayParseError } from "../binary/header";

function buildValidHeader(version: 0 | 1 = 1): Buffer {
  const sig = Buffer.from("Warcraft III recorded game\x1A\0");
  const headerFields = Buffer.alloc(20);
  headerFields.writeUInt32LE(0x44, 0); // headerSize = 68 bytes
  headerFields.writeUInt32LE(10000, 4); // compressedSize
  headerFields.writeUInt32LE(version, 8); // headerVersion
  headerFields.writeUInt32LE(20000, 12); // decompressedSize
  headerFields.writeUInt32LE(5, 16); // numBlocks

  let subHeader: Buffer;
  if (version === 1) {
    subHeader = Buffer.alloc(20);
    subHeader.write("W3XP", 0, 4, "utf8"); // versionIdentifier
    subHeader.writeUInt32LE(31, 4); // versionNumber (1.31)
    subHeader.writeUInt16LE(6072, 8); // buildNumber
    subHeader.writeUInt16LE(0x8000, 10); // flags (multiplayer)
    subHeader.writeUInt32LE(600000, 12); // durationMs (10 minutes)
    subHeader.writeUInt32LE(0x12345678, 16); // checksum
  } else {
    subHeader = Buffer.alloc(14);
    subHeader.writeUInt16LE(0, 0); // unknown
    subHeader.writeUInt16LE(6034, 2); // buildNumber
    subHeader.writeUInt16LE(0x8000, 4); // flags
    subHeader.writeUInt32LE(300000, 6); // durationMs
    subHeader.writeUInt32LE(0xaabbccdd, 10); // checksum
  }

  return Buffer.concat([sig, headerFields, subHeader]);
}

describe("parseHeader", () => {
  it("parses a valid V1 header", () => {
    const buf = buildValidHeader(1);
    const reader = new BinaryReader(buf);
    const { header, subHeader } = parseHeader(reader);

    expect(header.headerSize).toBe(0x44);
    expect(header.compressedSize).toBe(10000);
    expect(header.decompressedSize).toBe(20000);
    expect(header.numBlocks).toBe(5);
    expect(header.headerVersion).toBe(1);

    expect(subHeader.version).toBe(1);
    if (subHeader.version === 1) {
      expect(subHeader.versionIdentifier).toBe("W3XP");
      expect(subHeader.versionNumber).toBe(31);
      expect(subHeader.buildNumber).toBe(6072);
      expect(subHeader.durationMs).toBe(600000);
      expect(subHeader.flags).toBe(0x8000);
    }
  });

  it("parses a valid V0 header", () => {
    const buf = buildValidHeader(0);
    const reader = new BinaryReader(buf);
    const { header, subHeader } = parseHeader(reader);

    expect(header.headerVersion).toBe(0);
    expect(subHeader.version).toBe(0);
    if (subHeader.version === 0) {
      expect(subHeader.buildNumber).toBe(6034);
      expect(subHeader.durationMs).toBe(300000);
    }
  });

  it("throws on invalid signature", () => {
    const buf = Buffer.alloc(68);
    buf.write("Not a valid replay file\0", 0);
    const reader = new BinaryReader(buf);

    expect(() => parseHeader(reader)).toThrow(ReplayParseError);
  });
});
