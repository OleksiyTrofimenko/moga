/**
 * High-level orchestrator: parses a .w3x map file and returns structured data.
 */

import { extractFile } from "./w3x-extractor";
import { parseUnitsDoo, groupIntoCamps, type ExtractedCamp } from "./camp-extractor";

export interface ParsedMapData {
  mapName: string;
  playerCount: number;
  camps: ExtractedCamp[];
}

/**
 * Parse a .w3x map file and extract camp data.
 */
export async function parseMap(w3xPath: string): Promise<ParsedMapData> {
  // Extract and parse units
  const unitsDoo = await extractFile(w3xPath, "war3mapUnits.doo");
  const units = parseUnitsDoo(unitsDoo);

  // Count start locations (sloc) as player count
  const startLocations = units.filter((u) => u.typeId === "sloc");
  const playerCount = startLocations.length || 2;

  // Group neutral hostile units into camps
  const camps = groupIntoCamps(units);

  // Try to extract map name from war3map.w3i
  let mapName = "";
  try {
    const w3i = await extractFile(w3xPath, "war3map.w3i");
    mapName = parseW3iMapName(w3i);
  } catch {
    // Fall back to filename
  }

  return {
    mapName,
    playerCount,
    camps,
  };
}

/**
 * Parse map name from war3map.w3i binary.
 * The format has the map name as a null-terminated string at a specific offset.
 */
function parseW3iMapName(data: Buffer): string {
  let o = 0;

  const u32 = () => {
    const v = data.readUInt32LE(o);
    o += 4;
    return v;
  };

  const fileFormat = u32(); // file format version

  // Skip saves count
  u32();

  // Skip editor version
  u32();

  // Map name: null-terminated string
  if (fileFormat >= 28) {
    // v28+ (Reforged): skip game version fields
    u32(); // game version major
    u32(); // game version minor
    u32(); // game version patch
    u32(); // game version build
  }

  // Read null-terminated string for map name
  const nameStart = o;
  while (o < data.length && data[o] !== 0) o++;
  return data.toString("utf8", nameStart, o);
}
