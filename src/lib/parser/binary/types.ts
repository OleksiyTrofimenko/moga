/**
 * Raw binary-level types produced by the low-level .w3g parser.
 * These have NO domain logic — just structured representations of bytes.
 */

export interface RawReplayHeader {
  signature: string;
  headerSize: number;
  compressedSize: number;
  headerVersion: number;
  decompressedSize: number;
  numBlocks: number;
}

export interface RawSubHeaderV0 {
  version: 0;
  unknown: number;
  buildNumber: number;
  flags: number; // 0x0000 = single, 0x8000 = multi
  durationMs: number;
  checksum: number;
}

export interface RawSubHeaderV1 {
  version: 1;
  versionIdentifier: string; // "WAR3" or "W3XP"
  versionNumber: number;
  buildNumber: number;
  flags: number;
  durationMs: number;
  checksum: number;
}

export type RawSubHeader = RawSubHeaderV0 | RawSubHeaderV1;

export interface RawPlayerRecord {
  recordId: number; // 0x00 = host, 0x16 = additional
  playerId: number;
  playerName: string;
  additionalDataSize: number;
}

export interface RawSlotRecord {
  playerId: number;
  downloadPercent: number;
  slotStatus: number; // 0=empty, 1=closed, 2=used
  isComputer: boolean;
  teamNumber: number;
  color: number;
  raceFlags: number; // 0x01=H, 0x02=O, 0x04=NE, 0x08=UD, 0x20=random
  aiStrength: number;
  handicap: number;
}

export interface RawGameSettings {
  gameName: string;
  encodedString: string;
  playerCount: number;
  gameType: number;
  languageId: number;
}

export interface RawGameStartRecord {
  slotCount: number;
  slots: RawSlotRecord[];
  randomSeed: number;
  selectMode: number; // 0x00=team&race, 0x01=team, 0x03=random, 0x04=auto
  startSpotCount: number;
}

export interface RawTimeSlot {
  blockId: number; // 0x1E or 0x1F
  timeIncrementMs: number;
  commandData: RawCommandBlock[];
}

export interface RawCommandBlock {
  playerId: number;
  actions: RawAction[];
}

export interface RawAction {
  actionId: number;
  abilityFlags?: number;
  itemId?: string; // 4-char game ID (reversed from bytes)
  unknownA?: number;
  unknownB?: number;
  targetX?: number;
  targetY?: number;
  targetObjectId1?: number;
  targetObjectId2?: number;
  itemObjectId1?: number;
  itemObjectId2?: number;
  targetX2?: number;
  targetY2?: number;
  selectMode?: number; // 0x01=select, 0x02=deselect
  unitCount?: number;
  units?: Array<{ objectId1: number; objectId2: number }>;
  groupNumber?: number;
  message?: string;
  speed?: number;
  gold?: number;
  lumber?: number;
  slotNumber?: number;
  rawBytes?: Buffer; // fallback for unknown actions
}
