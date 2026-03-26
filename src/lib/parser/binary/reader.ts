/**
 * Cursor-based binary buffer reader.
 * Zero domain knowledge — pure buffer manipulation.
 */
export class BinaryReader {
  private buffer: Buffer;
  private cursor: number;

  constructor(buffer: Buffer, offset = 0) {
    this.buffer = buffer;
    this.cursor = offset;
  }

  get offset(): number {
    return this.cursor;
  }

  get length(): number {
    return this.buffer.length;
  }

  remaining(): number {
    return this.buffer.length - this.cursor;
  }

  hasMore(): boolean {
    return this.cursor < this.buffer.length;
  }

  readUInt8(): number {
    const val = this.buffer.readUInt8(this.cursor);
    this.cursor += 1;
    return val;
  }

  readUInt16LE(): number {
    const val = this.buffer.readUInt16LE(this.cursor);
    this.cursor += 2;
    return val;
  }

  readUInt32LE(): number {
    const val = this.buffer.readUInt32LE(this.cursor);
    this.cursor += 4;
    return val;
  }

  readInt32LE(): number {
    const val = this.buffer.readInt32LE(this.cursor);
    this.cursor += 4;
    return val;
  }

  readFloat32LE(): number {
    const val = this.buffer.readFloatLE(this.cursor);
    this.cursor += 4;
    return val;
  }

  /** Read a null-terminated string using UTF-8 encoding. */
  readString(): string {
    const start = this.cursor;
    while (this.cursor < this.buffer.length && this.buffer[this.cursor] !== 0) {
      this.cursor++;
    }
    const str = this.buffer.toString("utf8", start, this.cursor);
    if (this.cursor < this.buffer.length) {
      this.cursor++; // skip null terminator
    }
    return str;
  }

  /** Read a null-terminated string preserving raw byte values (latin1).
   *  Use this for encoded/binary strings where high bytes must survive round-trip. */
  readStringRaw(): string {
    const start = this.cursor;
    while (this.cursor < this.buffer.length && this.buffer[this.cursor] !== 0) {
      this.cursor++;
    }
    const str = this.buffer.toString("latin1", start, this.cursor);
    if (this.cursor < this.buffer.length) {
      this.cursor++; // skip null terminator
    }
    return str;
  }

  /** Read exactly n bytes as a Buffer. */
  readBytes(n: number): Buffer {
    const slice = this.buffer.subarray(this.cursor, this.cursor + n);
    this.cursor += n;
    return slice;
  }

  /** Read a 4-byte item/ability ID as ASCII string.
   *  WC3 stores these as little-endian DWORDs, so the bytes
   *  appear in reverse order. We reverse them to get the
   *  canonical game ID (e.g., bytes [6F,6F,66,68] → "hfoo").
   */
  readItemId(): string {
    const bytes = this.readBytes(4);
    return String.fromCharCode(bytes[3], bytes[2], bytes[1], bytes[0]);
  }

  skip(n: number): void {
    this.cursor += n;
  }

  /** Create a sub-reader for a bounded section. */
  fork(length: number): BinaryReader {
    const sub = new BinaryReader(
      this.buffer.subarray(this.cursor, this.cursor + length)
    );
    this.cursor += length;
    return sub;
  }

  /** Peek at the next byte without advancing. */
  peek(): number {
    return this.buffer.readUInt8(this.cursor);
  }

  /** Peek at a uint16 LE at offset +n from cursor without advancing. */
  peekUInt16LE(offset = 0): number {
    return this.buffer.readUInt16LE(this.cursor + offset);
  }

  /** Peek at a uint8 at offset +n from cursor without advancing. */
  peekUInt8(offset = 0): number {
    return this.buffer.readUInt8(this.cursor + offset);
  }
}
