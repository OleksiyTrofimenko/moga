import { describe, it, expect } from "vitest";
import { BinaryReader } from "../binary/reader";

describe("BinaryReader", () => {
  it("reads uint8", () => {
    const buf = Buffer.from([0xff, 0x00, 0x42]);
    const reader = new BinaryReader(buf);
    expect(reader.readUInt8()).toBe(255);
    expect(reader.readUInt8()).toBe(0);
    expect(reader.readUInt8()).toBe(66);
  });

  it("reads uint16 little-endian", () => {
    const buf = Buffer.alloc(4);
    buf.writeUInt16LE(1234, 0);
    buf.writeUInt16LE(65535, 2);
    const reader = new BinaryReader(buf);
    expect(reader.readUInt16LE()).toBe(1234);
    expect(reader.readUInt16LE()).toBe(65535);
  });

  it("reads uint32 little-endian", () => {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(0xdeadbeef, 0);
    const reader = new BinaryReader(buf);
    expect(reader.readUInt32LE()).toBe(0xdeadbeef);
  });

  it("reads null-terminated strings", () => {
    const buf = Buffer.from("hello\0world\0");
    const reader = new BinaryReader(buf);
    expect(reader.readString()).toBe("hello");
    expect(reader.readString()).toBe("world");
  });

  it("reads item IDs (4-char ASCII, reversed from LE dword)", () => {
    // WC3 stores "hfoo" as little-endian DWORD: bytes [o, o, f, h] = [0x6F, 0x6F, 0x66, 0x68]
    const buf = Buffer.from([0x6f, 0x6f, 0x66, 0x68]);
    const reader = new BinaryReader(buf);
    expect(reader.readItemId()).toBe("hfoo");
  });

  it("tracks offset correctly", () => {
    const buf = Buffer.alloc(10);
    const reader = new BinaryReader(buf);
    expect(reader.offset).toBe(0);
    reader.readUInt8();
    expect(reader.offset).toBe(1);
    reader.skip(3);
    expect(reader.offset).toBe(4);
    reader.readUInt16LE();
    expect(reader.offset).toBe(6);
  });

  it("reports remaining bytes", () => {
    const buf = Buffer.alloc(10);
    const reader = new BinaryReader(buf);
    expect(reader.remaining()).toBe(10);
    reader.skip(7);
    expect(reader.remaining()).toBe(3);
  });

  it("forks into sub-reader", () => {
    const buf = Buffer.from([1, 2, 3, 4, 5, 6]);
    const reader = new BinaryReader(buf);
    reader.readUInt8(); // skip 1
    const sub = reader.fork(3); // takes bytes [2,3,4]
    expect(reader.offset).toBe(4); // main reader advanced past forked section
    expect(sub.readUInt8()).toBe(2);
    expect(sub.readUInt8()).toBe(3);
    expect(sub.readUInt8()).toBe(4);
    expect(sub.remaining()).toBe(0);
  });

  it("peeks without advancing", () => {
    const buf = Buffer.from([0x42, 0x43]);
    const reader = new BinaryReader(buf);
    expect(reader.peek()).toBe(0x42);
    expect(reader.offset).toBe(0);
    reader.readUInt8();
    expect(reader.peek()).toBe(0x43);
  });
});
