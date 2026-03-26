/**
 * Loads all WC3 entity definitions from DB into in-memory Maps.
 * Called once per analysis run for fast lookups by gameId.
 */

import { db as defaultDb } from "@/lib/db";
import {
  unitDefinitions,
  heroDefinitions,
  buildingDefinitions,
  itemDefinitions,
  upgradeDefinitions,
  creepDefinitions,
  maps,
  mapCreepCamps,
  creepCamps,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type UnitDef = typeof unitDefinitions.$inferSelect;
export type HeroDef = typeof heroDefinitions.$inferSelect;
export type BuildingDef = typeof buildingDefinitions.$inferSelect;
export type ItemDef = typeof itemDefinitions.$inferSelect;
export type UpgradeDef = typeof upgradeDefinitions.$inferSelect;
export type CreepDef = typeof creepDefinitions.$inferSelect;

export interface HeroAbilityInfo {
  heroGameId: string;
  abilityGameId: string;
  abilityName: string;
  isUltimate: boolean;
}

export interface MapCampInfo {
  campId: number;
  label: string | null;
  posX: number | null;
  posY: number | null;
  camp: {
    name: string;
    level: number;
    creeps: { gameId: string; count: number }[];
    itemDropLevel: number;
    xpTotal: number;
    goldTotal: number;
  };
}

export interface DefinitionsCache {
  units: Map<string, UnitDef>;
  heroes: Map<string, HeroDef>;
  buildings: Map<string, BuildingDef>;
  items: Map<string, ItemDef>;
  upgrades: Map<string, UpgradeDef>;
  /** Reverse lookup: ability gameId → hero ability info */
  heroAbilityMap: Map<string, HeroAbilityInfo>;
  /** Creep definitions by gameId */
  creeps: Map<string, CreepDef>;
  /** Map camp data indexed by map slug */
  mapCampsBySlug: Map<string, MapCampInfo[]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadDefinitions(dbOverride?: any): Promise<DefinitionsCache> {
  const db = dbOverride ?? defaultDb;
  const [units, heroes, buildings, items, upgrades, creeps] = await Promise.all([
    db.select().from(unitDefinitions),
    db.select().from(heroDefinitions),
    db.select().from(buildingDefinitions),
    db.select().from(itemDefinitions),
    db.select().from(upgradeDefinitions),
    db.select().from(creepDefinitions),
  ]);

  // Build reverse lookup: ability gameId → hero info
  const heroAbilityMap = new Map<string, HeroAbilityInfo>();
  for (const hero of heroes) {
    const abilities = hero.abilities ?? [];
    for (const ability of abilities) {
      heroAbilityMap.set(ability.gameId, {
        heroGameId: hero.gameId,
        abilityGameId: ability.gameId,
        abilityName: ability.name,
        isUltimate: ability.isUltimate,
      });
    }
  }

  // Load map camp data
  const mapCampsBySlug = new Map<string, MapCampInfo[]>();
  try {
    const allMaps = await db.select().from(maps);
    for (const map of allMaps) {
      const campLinks = await db
        .select()
        .from(mapCreepCamps)
        .where(eq(mapCreepCamps.mapId, map.id));

      const campInfos: MapCampInfo[] = [];
      for (const link of campLinks) {
        const [camp] = await db
          .select()
          .from(creepCamps)
          .where(eq(creepCamps.id, link.campId));
        if (camp) {
          campInfos.push({
            campId: camp.id,
            label: link.label,
            posX: link.posX,
            posY: link.posY,
            camp: {
              name: camp.name,
              level: camp.level,
              creeps: camp.creeps,
              itemDropLevel: camp.itemDropLevel,
              xpTotal: camp.xpTotal,
              goldTotal: camp.goldTotal,
            },
          });
        }
      }
      mapCampsBySlug.set(map.slug, campInfos);
    }
  } catch {
    // Maps table may not exist yet
  }

  return {
    units: new Map(units.map((u: UnitDef) => [u.gameId, u])),
    heroes: new Map(heroes.map((h: HeroDef) => [h.gameId, h])),
    buildings: new Map(buildings.map((b: BuildingDef) => [b.gameId, b])),
    items: new Map(items.map((i: ItemDef) => [i.gameId, i])),
    upgrades: new Map(upgrades.map((u: UpgradeDef) => [u.gameId, u])),
    heroAbilityMap,
    creeps: new Map(creeps.map((c: CreepDef) => [c.gameId, c])),
    mapCampsBySlug,
  };
}
