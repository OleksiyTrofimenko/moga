/**
 * Parses war3mapUnits.doo binary data and groups neutral hostile units into camps.
 */

export interface PreplacedUnit {
  typeId: string;
  posX: number;
  posY: number;
  playerId: number;
  goldAmount: number;
  itemDrops: string[];
}

export interface ExtractedCamp {
  creeps: { gameId: string; count: number }[];
  position: { x: number; y: number };
  itemDrops: string[];
}

/**
 * Parse war3mapUnits.doo binary (W3do format v7/v8).
 * Returns all preplaced units.
 *
 * V8 format (subversion 11) includes hero stat fields (str/agi/int) after
 * heroLevel for every unit record, and randomFlag=0 uses 4 bytes
 * (3 level bytes + 1 itemClass byte).
 */
export function parseUnitsDoo(data: Buffer): PreplacedUnit[] {
  let o = 0;
  const r4 = () => {
    const s = data.toString("ascii", o, o + 4);
    o += 4;
    return s;
  };
  const u32 = () => {
    const v = data.readUInt32LE(o);
    o += 4;
    return v;
  };
  const i32 = () => {
    const v = data.readInt32LE(o);
    o += 4;
    return v;
  };
  const f32 = () => {
    o += 4;
  };
  const f32v = () => {
    const v = data.readFloatLE(o);
    o += 4;
    return v;
  };

  const magic = r4();
  if (magic !== "W3do") {
    throw new Error(`Invalid war3mapUnits.doo magic: ${magic}`);
  }

  const version = u32();
  u32(); // subversion
  const numUnits = u32();

  const units: PreplacedUnit[] = [];

  for (let i = 0; i < numUnits && o < data.length - 20; i++) {
    try {
      const typeId = r4();
      u32(); // variation
      const posX = f32v();
      const posY = f32v();
      f32(); // posZ
      f32(); // rotation
      f32();
      f32();
      f32(); // scale

      if (version >= 8) r4(); // skinId

      o += 1; // flags
      const playerId = u32();
      o += 2; // unknown

      i32(); // hp %
      i32(); // mp %
      if (version >= 7) i32(); // mapItemTablePtr

      const dropSetCount = u32();
      const itemDrops: string[] = [];
      for (let s = 0; s < dropSetCount; s++) {
        const numItems = u32();
        for (let j = 0; j < numItems; j++) {
          const itemId = r4();
          u32(); // chance
          if (itemId && itemId !== "\0\0\0\0") {
            itemDrops.push(itemId);
          }
        }
      }

      const goldAmount = u32();
      f32(); // targetAcquisition
      u32(); // heroLevel

      // v8: hero stat fields (always present, 0 for non-heroes)
      if (version >= 8) {
        u32(); // heroStrength
        u32(); // heroAgility
        u32(); // heroIntelligence
      }

      const invCount = u32();
      for (let j = 0; j < invCount; j++) {
        u32(); // slot
        r4(); // itemId
      }

      const abilCount = u32();
      for (let j = 0; j < abilCount; j++) {
        r4(); // abilityId
        u32(); // autocast
        u32(); // level
      }

      const randomFlag = i32();
      if (randomFlag === 0) {
        // Random from level/class: 3 level bytes + 1 class byte = 4 bytes
        u32();
      } else if (randomFlag === 1) {
        // Random from group
        u32(); // groupId
        u32(); // position
      } else if (randomFlag === 2) {
        // Random from custom table
        const count = u32();
        for (let j = 0; j < count; j++) {
          u32(); // chance
          r4(); // unitId
        }
      }
      // randomFlag === -1 or other: no additional random data

      u32(); // customColor
      u32(); // waygate
      u32(); // creationNumber

      units.push({ typeId, posX, posY, playerId, goldAmount, itemDrops });
    } catch {
      break;
    }
  }

  return units;
}

/**
 * Neutral hostile player IDs used in WC3 maps.
 * Standard WC3: 12, Reforged: 24
 */
const NEUTRAL_HOSTILE_PLAYER_IDS = new Set([12, 24]);

/**
 * Distance threshold for grouping creeps into camps.
 * Units within this range of each other belong to the same camp.
 */
const CAMP_GROUP_DISTANCE = 500;

/**
 * Group nearby neutral hostile units into camps by spatial proximity.
 */
export function groupIntoCamps(units: PreplacedUnit[]): ExtractedCamp[] {
  const creeps = units.filter((u) => NEUTRAL_HOSTILE_PLAYER_IDS.has(u.playerId));

  if (creeps.length === 0) return [];

  const camps: {
    units: PreplacedUnit[];
    centerX: number;
    centerY: number;
  }[] = [];

  for (const creep of creeps) {
    let bestCamp: (typeof camps)[number] | null = null;
    let bestDist = Infinity;

    for (const camp of camps) {
      const dx = creep.posX - camp.centerX;
      const dy = creep.posY - camp.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestCamp = camp;
      }
    }

    if (bestCamp && bestDist <= CAMP_GROUP_DISTANCE) {
      bestCamp.units.push(creep);
      bestCamp.centerX =
        bestCamp.units.reduce((s, u) => s + u.posX, 0) /
        bestCamp.units.length;
      bestCamp.centerY =
        bestCamp.units.reduce((s, u) => s + u.posY, 0) /
        bestCamp.units.length;
    } else {
      camps.push({
        units: [creep],
        centerX: creep.posX,
        centerY: creep.posY,
      });
    }
  }

  return camps.map((camp) => {
    const creepCounts = new Map<string, number>();
    for (const u of camp.units) {
      creepCounts.set(u.typeId, (creepCounts.get(u.typeId) ?? 0) + 1);
    }

    const itemDrops = camp.units.flatMap((u) => u.itemDrops);

    return {
      creeps: Array.from(creepCounts.entries()).map(([gameId, count]) => ({
        gameId,
        count,
      })),
      position: { x: camp.centerX, y: camp.centerY },
      itemDrops,
    };
  });
}
