/**
 * Seed maps + creep definitions from parsed .w3x files.
 * Reads all maps from wc3-maps/, extracts camp data, and populates the DB.
 *
 * Usage: npx tsx src/lib/db/seed/seed-maps.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import * as schema from "@/lib/db/schema";
import {
  creepDefinitions,
  creepCamps,
  maps,
  mapCreepCamps,
} from "@/lib/db/schema";

dotenv.config({ path: ".env.local" });
import { parseMap } from "@/lib/map/parse-map";
import { CREEP_DATA } from "@/lib/map/creep-data";
import {
  extractMapNameFromFilename,
  generateSlug,
} from "@/lib/map/map-resolver";
import type { CreepCampMember } from "@/lib/db/schema/creeps";

const MAPS_DIR = path.join(process.cwd(), "wc3-maps");

async function seedMaps() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Cleaning old map data...\n");

  // Delete old data in dependency order
  await db.delete(mapCreepCamps);
  await db.delete(creepCamps);
  await db.delete(maps);
  await db.delete(creepDefinitions);

  console.log("Seeding maps and creep definitions...\n");

  // Read all .w3x files
  const files = fs.readdirSync(MAPS_DIR).filter((f) => f.endsWith(".w3x"));
  console.log(`Found ${files.length} map files\n`);

  // Collect all unique creep gameIds across all maps
  const allCreepIds = new Set<string>();

  // Parse all maps first
  const parsedMaps: {
    filename: string;
    name: string;
    slug: string;
    data: Awaited<ReturnType<typeof parseMap>>;
  }[] = [];

  for (const file of files) {
    const filePath = path.join(MAPS_DIR, file);
    console.log(`Parsing ${file}...`);

    try {
      const data = await parseMap(filePath);
      const name = extractMapNameFromFilename(file);
      const slug = generateSlug(name);

      for (const camp of data.camps) {
        for (const creep of camp.creeps) {
          allCreepIds.add(creep.gameId);
        }
      }

      parsedMaps.push({ filename: file, name, slug, data });
      console.log(
        `  → ${name} (${slug}): ${data.camps.length} camps, ${data.playerCount} players`
      );
    } catch (err) {
      console.error(`  Failed to parse ${file}:`, err);
    }
  }

  // 1. Seed creep definitions
  console.log(`\nSeeding ${allCreepIds.size} unique creep definitions...`);
  for (const gameId of allCreepIds) {
    const stats = CREEP_DATA[gameId];
    if (!stats) {
      console.log(`  Warning: no stats for creep ${gameId}, using defaults`);
      await db
        .insert(creepDefinitions)
        .values({
          gameId,
          name: gameId,
          level: 1,
          hp: 100,
          armor: 0,
          armorType: "medium",
          damageMin: 5,
          damageMax: 8,
          attackType: "normal",
          xpBounty: 25,
          goldBounty: 10,
          tags: [],
        })
        .onConflictDoNothing();
      continue;
    }

    await db
      .insert(creepDefinitions)
      .values({
        gameId,
        name: stats.name,
        level: stats.level,
        hp: stats.hp,
        mana: stats.mana || null,
        armor: stats.armor,
        armorType: stats.armorType,
        damageMin: stats.damageMin,
        damageMax: stats.damageMax,
        attackType: stats.attackType,
        abilities: stats.abilities,
        xpBounty: stats.xpBounty,
        goldBounty: stats.goldBounty,
        tags: stats.tags,
      })
      .onConflictDoNothing();
  }

  // 2. Seed maps, creep camps, and map-camp links
  for (const parsed of parsedMaps) {
    console.log(`\nSeeding map: ${parsed.name} (${parsed.slug})`);

    // Generate aliases from filename variations
    const aliases = [
      parsed.filename.replace(/\.w3x$/i, ""),
      parsed.name,
      parsed.name.replace(/\s+/g, ""),
      parsed.data.mapName || parsed.name,
    ].filter(Boolean);

    // Insert map
    const [mapRow] = await db
      .insert(maps)
      .values({
        slug: parsed.slug,
        name: parsed.name,
        playerCount: parsed.data.playerCount,
        w3xFileName: parsed.filename,
        aliases: [...new Set(aliases)],
      })
      .onConflictDoNothing()
      .returning();

    if (!mapRow) {
      console.log(`  Map ${parsed.slug} already exists, skipping`);
      continue;
    }

    // Insert camps and link to map
    for (let i = 0; i < parsed.data.camps.length; i++) {
      const camp = parsed.data.camps[i];

      // Calculate camp level and totals from creep stats
      let totalXp = 0;
      let totalGold = 0;
      let maxCreepLevel = 0;

      for (const creep of camp.creeps) {
        const stats = CREEP_DATA[creep.gameId];
        if (stats) {
          totalXp += stats.xpBounty * creep.count;
          totalGold += stats.goldBounty * creep.count;
          maxCreepLevel = Math.max(maxCreepLevel, stats.level);
        }
      }

      // Determine item drop level from drops
      let itemDropLevel = 0;
      for (const drop of camp.itemDrops) {
        // Parse item drop IDs like "YiI2" where last char indicates level
        const levelChar = drop[drop.length - 1];
        const level = parseInt(levelChar) || 0;
        itemDropLevel = Math.max(itemDropLevel, level);
      }

      // Generate camp name (truncate to 100 chars for DB)
      let creepNames = camp.creeps
        .map((c) => {
          const stats = CREEP_DATA[c.gameId];
          return stats ? stats.name : c.gameId;
        })
        .join(", ");
      if (creepNames.length > 100) {
        creepNames = creepNames.slice(0, 97) + "...";
      }

      const campCreeps: CreepCampMember[] = camp.creeps;

      // Insert creep camp
      const [campRow] = await db
        .insert(creepCamps)
        .values({
          name: creepNames,
          level: maxCreepLevel,
          creeps: campCreeps,
          itemDropLevel,
          xpTotal: totalXp,
          goldTotal: totalGold,
        })
        .returning();

      // Generate label based on position (quadrant)
      const label = generateCampLabel(
        camp.position.x,
        camp.position.y,
        maxCreepLevel,
        i
      );

      // Link camp to map
      await db.insert(mapCreepCamps).values({
        mapId: mapRow.id,
        campId: campRow.id,
        label,
        posX: camp.position.x,
        posY: camp.position.y,
      });
    }

    console.log(`  → ${parsed.data.camps.length} camps seeded`);
  }

  console.log("\nDone!");
  await pool.end();
  process.exit(0);
}

function generateCampLabel(
  x: number,
  y: number,
  level: number,
  index: number
): string {
  const ns = y > 0 ? "S" : "N";
  const ew = x > 0 ? "E" : "W";
  const direction = `${ns}${ew}`;

  const levelColor =
    level <= 2
      ? "green"
      : level <= 4
        ? "yellow"
        : level <= 5
          ? "orange"
          : "red";

  return `${direction} ${levelColor} camp #${index + 1}`;
}

seedMaps().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
