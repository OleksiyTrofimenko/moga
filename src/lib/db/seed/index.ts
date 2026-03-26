import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as schema from "../schema";

dotenv.config({ path: ".env.local" });

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  // =====================
  // UNITS — all 4 races
  // =====================
  console.log("  Seeding units...");
  await db.insert(schema.unitDefinitions).values([
    // HUMAN
    { gameId: "hpea", name: "Peasant", race: "human", tier: 1, goldCost: 75, lumberCost: 0, supply: 1, buildTime: 15, hp: 220, armor: 0, armorType: "medium", damageMin: 5, damageMax: 5, attackType: "normal", attackCooldown: 2.0, range: 90, moveSpeed: 190, tags: ["worker", "ground", "organic"] },
    { gameId: "hfoo", name: "Footman", race: "human", tier: 1, goldCost: 135, lumberCost: 0, supply: 2, buildTime: 20, hp: 420, armor: 2, armorType: "heavy", damageMin: 12, damageMax: 13, attackType: "normal", attackCooldown: 1.35, range: 90, moveSpeed: 270, tags: ["melee", "ground", "organic"] },
    { gameId: "hrif", name: "Rifleman", race: "human", tier: 2, goldCost: 205, lumberCost: 30, supply: 3, buildTime: 26, hp: 535, armor: 0, armorType: "medium", damageMin: 21, damageMax: 23, attackType: "pierce", attackCooldown: 1.5, range: 400, moveSpeed: 270, tags: ["ranged", "ground", "organic"] },
    { gameId: "hkni", name: "Knight", race: "human", tier: 3, goldCost: 245, lumberCost: 60, supply: 4, buildTime: 45, hp: 835, armor: 5, armorType: "heavy", damageMin: 34, damageMax: 36, attackType: "normal", attackCooldown: 1.4, range: 90, moveSpeed: 350, tags: ["melee", "ground", "organic", "mounted"] },
    { gameId: "hmpr", name: "Priest", race: "human", tier: 2, goldCost: 135, lumberCost: 10, supply: 2, buildTime: 28, hp: 290, armor: 0, armorType: "unarmored", damageMin: 8, damageMax: 9, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "hsor", name: "Sorceress", race: "human", tier: 2, goldCost: 155, lumberCost: 20, supply: 2, buildTime: 30, hp: 325, armor: 0, armorType: "unarmored", damageMin: 11, damageMax: 12, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "hspt", name: "Spell Breaker", race: "human", tier: 2, goldCost: 215, lumberCost: 30, supply: 3, buildTime: 28, hp: 600, armor: 3, armorType: "medium", damageMin: 14, damageMax: 16, attackType: "normal", attackCooldown: 1.35, range: 250, moveSpeed: 300, tags: ["melee", "ground", "organic"] },
    { gameId: "hmtm", name: "Mortar Team", race: "human", tier: 2, goldCost: 180, lumberCost: 70, supply: 3, buildTime: 36, hp: 360, armor: 0, armorType: "medium", damageMin: 53, damageMax: 65, attackType: "siege", attackCooldown: 3.5, range: 1000, moveSpeed: 270, tags: ["ranged", "ground", "mechanical"] },
    { gameId: "hmtt", name: "Siege Engine", race: "human", tier: 3, goldCost: 195, lumberCost: 60, supply: 4, buildTime: 45, hp: 700, armor: 2, armorType: "fortified", damageMin: 44, damageMax: 56, attackType: "siege", attackCooldown: 3.0, range: 190, moveSpeed: 220, tags: ["melee", "ground", "mechanical"] },
    { gameId: "hgry", name: "Gryphon Rider", race: "human", tier: 3, goldCost: 280, lumberCost: 70, supply: 4, buildTime: 45, hp: 825, armor: 0, armorType: "light", damageMin: 45, damageMax: 55, attackType: "magic", attackCooldown: 2.33, range: 450, moveSpeed: 375, tags: ["ranged", "air", "organic"] },
    { gameId: "hdhw", name: "Dragonhawk Rider", race: "human", tier: 3, goldCost: 200, lumberCost: 30, supply: 3, buildTime: 28, hp: 575, armor: 1, armorType: "light", damageMin: 19, damageMax: 21, attackType: "pierce", attackCooldown: 1.75, range: 300, moveSpeed: 350, tags: ["ranged", "air", "organic"] },
    { gameId: "hwat", name: "Water Elemental", race: "human", tier: 1, goldCost: 0, lumberCost: 0, supply: 0, buildTime: 0, hp: 525, armor: 0, armorType: "heavy", damageMin: 17, damageMax: 19, attackType: "pierce", attackCooldown: 1.5, range: 300, moveSpeed: 220, tags: ["summoned", "ground"] },

    // ORC
    { gameId: "opeo", name: "Peon", race: "orc", tier: 1, goldCost: 75, lumberCost: 0, supply: 1, buildTime: 15, hp: 250, armor: 0, armorType: "medium", damageMin: 7, damageMax: 8, attackType: "normal", attackCooldown: 2.0, range: 90, moveSpeed: 190, tags: ["worker", "ground", "organic"] },
    { gameId: "ogru", name: "Grunt", race: "orc", tier: 1, goldCost: 200, lumberCost: 0, supply: 3, buildTime: 25, hp: 700, armor: 1, armorType: "heavy", damageMin: 19, damageMax: 22, attackType: "normal", attackCooldown: 1.6, range: 90, moveSpeed: 270, tags: ["melee", "ground", "organic"] },
    { gameId: "ohun", name: "Troll Headhunter", race: "orc", tier: 1, goldCost: 135, lumberCost: 20, supply: 2, buildTime: 20, hp: 350, armor: 0, armorType: "medium", damageMin: 23, damageMax: 27, attackType: "pierce", attackCooldown: 1.75, range: 450, moveSpeed: 270, tags: ["ranged", "ground", "organic"] },
    { gameId: "otbk", name: "Troll Berserker", race: "orc", tier: 2, goldCost: 135, lumberCost: 20, supply: 2, buildTime: 20, hp: 450, armor: 0, armorType: "medium", damageMin: 23, damageMax: 27, attackType: "pierce", attackCooldown: 1.75, range: 450, moveSpeed: 270, tags: ["ranged", "ground", "organic"] },
    { gameId: "orai", name: "Raider", race: "orc", tier: 2, goldCost: 180, lumberCost: 40, supply: 3, buildTime: 28, hp: 610, armor: 1, armorType: "medium", damageMin: 25, damageMax: 27, attackType: "siege", attackCooldown: 1.5, range: 90, moveSpeed: 350, tags: ["melee", "ground", "organic", "mounted"] },
    { gameId: "oshm", name: "Shaman", race: "orc", tier: 2, goldCost: 130, lumberCost: 20, supply: 2, buildTime: 30, hp: 335, armor: 0, armorType: "unarmored", damageMin: 10, damageMax: 12, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "odoc", name: "Witch Doctor", race: "orc", tier: 2, goldCost: 145, lumberCost: 25, supply: 2, buildTime: 30, hp: 315, armor: 0, armorType: "unarmored", damageMin: 10, damageMax: 12, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "ospw", name: "Spirit Walker", race: "orc", tier: 3, goldCost: 195, lumberCost: 35, supply: 3, buildTime: 38, hp: 500, armor: 1, armorType: "unarmored", damageMin: 16, damageMax: 19, attackType: "magic", attackCooldown: 1.75, range: 500, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "okod", name: "Kodo Beast", race: "orc", tier: 2, goldCost: 255, lumberCost: 60, supply: 4, buildTime: 30, hp: 1000, armor: 1, armorType: "unarmored", damageMin: 17, damageMax: 19, attackType: "pierce", attackCooldown: 2.0, range: 100, moveSpeed: 220, tags: ["melee", "ground", "organic"] },
    { gameId: "owyv", name: "Wind Rider", race: "orc", tier: 3, goldCost: 265, lumberCost: 40, supply: 4, buildTime: 35, hp: 570, armor: 0, armorType: "light", damageMin: 36, damageMax: 42, attackType: "pierce", attackCooldown: 2.5, range: 300, moveSpeed: 375, tags: ["ranged", "air", "organic"] },
    { gameId: "otbr", name: "Troll Batrider", race: "orc", tier: 2, goldCost: 160, lumberCost: 40, supply: 2, buildTime: 28, hp: 325, armor: 0, armorType: "light", damageMin: 14, damageMax: 16, attackType: "magic", attackCooldown: 2.0, range: 350, moveSpeed: 375, tags: ["ranged", "air", "organic"] },
    { gameId: "otau", name: "Tauren", race: "orc", tier: 3, goldCost: 280, lumberCost: 80, supply: 5, buildTime: 44, hp: 1300, armor: 3, armorType: "heavy", damageMin: 33, damageMax: 39, attackType: "normal", attackCooldown: 1.9, range: 90, moveSpeed: 270, tags: ["melee", "ground", "organic"] },

    // NIGHT ELF
    { gameId: "ewsp", name: "Wisp", race: "night_elf", tier: 1, goldCost: 60, lumberCost: 0, supply: 1, buildTime: 14, hp: 120, armor: 0, armorType: "medium", damageMin: 0, damageMax: 0, attackType: "normal", attackCooldown: 1.0, range: 0, moveSpeed: 270, tags: ["worker", "ground", "organic"] },
    { gameId: "earc", name: "Archer", race: "night_elf", tier: 1, goldCost: 130, lumberCost: 10, supply: 2, buildTime: 20, hp: 255, armor: 0, armorType: "medium", damageMin: 16, damageMax: 18, attackType: "pierce", attackCooldown: 1.5, range: 500, moveSpeed: 270, tags: ["ranged", "ground", "organic"] },
    { gameId: "esen", name: "Huntress", race: "night_elf", tier: 1, goldCost: 195, lumberCost: 20, supply: 3, buildTime: 30, hp: 600, armor: 3, armorType: "unarmored", damageMin: 19, damageMax: 22, attackType: "normal", attackCooldown: 1.6, range: 220, moveSpeed: 350, tags: ["melee", "ground", "organic", "mounted"] },
    { gameId: "edry", name: "Dryad", race: "night_elf", tier: 2, goldCost: 145, lumberCost: 60, supply: 3, buildTime: 30, hp: 435, armor: 0, armorType: "unarmored", damageMin: 17, damageMax: 19, attackType: "pierce", attackCooldown: 1.5, range: 500, moveSpeed: 350, tags: ["ranged", "ground", "organic"] },
    { gameId: "edot", name: "Druid of the Talon", race: "night_elf", tier: 2, goldCost: 135, lumberCost: 20, supply: 2, buildTime: 22, hp: 300, armor: 0, armorType: "unarmored", damageMin: 11, damageMax: 13, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "edoc", name: "Druid of the Claw", race: "night_elf", tier: 2, goldCost: 255, lumberCost: 80, supply: 4, buildTime: 35, hp: 430, armor: 1, armorType: "unarmored", damageMin: 20, damageMax: 25, attackType: "normal", attackCooldown: 1.5, range: 90, moveSpeed: 270, tags: ["melee", "caster", "ground", "organic"] },
    { gameId: "efdr", name: "Faerie Dragon", race: "night_elf", tier: 2, goldCost: 155, lumberCost: 25, supply: 2, buildTime: 25, hp: 450, armor: 0, armorType: "light", damageMin: 13, damageMax: 15, attackType: "magic", attackCooldown: 1.5, range: 300, moveSpeed: 350, tags: ["ranged", "air", "organic"] },
    { gameId: "emtg", name: "Mountain Giant", race: "night_elf", tier: 3, goldCost: 350, lumberCost: 100, supply: 7, buildTime: 55, hp: 1600, armor: 4, armorType: "heavy", damageMin: 33, damageMax: 39, attackType: "normal", attackCooldown: 2.0, range: 90, moveSpeed: 220, tags: ["melee", "ground", "organic"] },
    { gameId: "ehip", name: "Hippogryph", race: "night_elf", tier: 2, goldCost: 160, lumberCost: 20, supply: 2, buildTime: 20, hp: 500, armor: 0, armorType: "unarmored", damageMin: 0, damageMax: 0, attackType: "normal", attackCooldown: 1.0, range: 0, moveSpeed: 350, tags: ["air", "organic"] },
    { gameId: "echm", name: "Chimaera", race: "night_elf", tier: 3, goldCost: 330, lumberCost: 70, supply: 5, buildTime: 50, hp: 1000, armor: 2, armorType: "light", damageMin: 67, damageMax: 83, attackType: "magic", attackCooldown: 3.0, range: 600, moveSpeed: 250, tags: ["ranged", "air", "organic"] },
    { gameId: "ehpr", name: "Hippogryph Rider", race: "night_elf", tier: 2, goldCost: 290, lumberCost: 30, supply: 4, buildTime: 0, hp: 780, armor: 0, armorType: "unarmored", damageMin: 29, damageMax: 34, attackType: "pierce", attackCooldown: 1.5, range: 450, moveSpeed: 350, tags: ["ranged", "air", "organic"] },
    { gameId: "ebal", name: "Glaive Thrower", race: "night_elf", tier: 2, goldCost: 210, lumberCost: 65, supply: 3, buildTime: 36, hp: 350, armor: 0, armorType: "medium", damageMin: 44, damageMax: 53, attackType: "siege", attackCooldown: 3.5, range: 900, moveSpeed: 220, tags: ["ranged", "ground", "mechanical"] },

    // UNDEAD
    { gameId: "uaco", name: "Acolyte", race: "undead", tier: 1, goldCost: 75, lumberCost: 0, supply: 1, buildTime: 15, hp: 220, armor: 0, armorType: "medium", damageMin: 9, damageMax: 10, attackType: "normal", attackCooldown: 2.0, range: 90, moveSpeed: 220, tags: ["worker", "ground", "organic"] },
    { gameId: "ugho", name: "Ghoul", race: "undead", tier: 1, goldCost: 120, lumberCost: 0, supply: 2, buildTime: 18, hp: 340, armor: 0, armorType: "medium", damageMin: 11, damageMax: 13, attackType: "normal", attackCooldown: 1.3, range: 90, moveSpeed: 270, tags: ["melee", "ground", "organic", "lumber_harvester"] },
    { gameId: "ucry", name: "Crypt Fiend", race: "undead", tier: 2, goldCost: 215, lumberCost: 40, supply: 3, buildTime: 30, hp: 550, armor: 0, armorType: "medium", damageMin: 26, damageMax: 31, attackType: "pierce", attackCooldown: 1.75, range: 550, moveSpeed: 270, tags: ["ranged", "ground", "organic"] },
    { gameId: "ugar", name: "Gargoyle", race: "undead", tier: 2, goldCost: 185, lumberCost: 30, supply: 2, buildTime: 35, hp: 410, armor: 3, armorType: "unarmored", damageMin: 16, damageMax: 18, attackType: "normal", attackCooldown: 1.3, range: 300, moveSpeed: 375, tags: ["ranged", "air", "organic"] },
    { gameId: "unec", name: "Necromancer", race: "undead", tier: 2, goldCost: 145, lumberCost: 20, supply: 2, buildTime: 24, hp: 305, armor: 0, armorType: "unarmored", damageMin: 10, damageMax: 12, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "uban", name: "Banshee", race: "undead", tier: 2, goldCost: 155, lumberCost: 30, supply: 2, buildTime: 28, hp: 285, armor: 0, armorType: "unarmored", damageMin: 10, damageMax: 12, attackType: "magic", attackCooldown: 1.75, range: 600, moveSpeed: 270, tags: ["ranged", "caster", "ground", "organic"] },
    { gameId: "uobs", name: "Obsidian Statue", race: "undead", tier: 2, goldCost: 200, lumberCost: 35, supply: 3, buildTime: 35, hp: 550, armor: 3, armorType: "heavy", damageMin: 0, damageMax: 0, attackType: "normal", attackCooldown: 1.0, range: 0, moveSpeed: 220, tags: ["ground", "mechanical"] },
    { gameId: "ubsp", name: "Destroyer", race: "undead", tier: 3, goldCost: 200, lumberCost: 35, supply: 5, buildTime: 0, hp: 900, armor: 2, armorType: "light", damageMin: 19, damageMax: 21, attackType: "magic", attackCooldown: 1.75, range: 450, moveSpeed: 320, tags: ["ranged", "air", "organic"] },
    { gameId: "umtw", name: "Meat Wagon", race: "undead", tier: 2, goldCost: 230, lumberCost: 50, supply: 4, buildTime: 36, hp: 380, armor: 2, armorType: "medium", damageMin: 62, damageMax: 76, attackType: "siege", attackCooldown: 3.5, range: 1000, moveSpeed: 220, tags: ["ranged", "ground", "mechanical"] },
    { gameId: "uabo", name: "Abomination", race: "undead", tier: 3, goldCost: 240, lumberCost: 70, supply: 4, buildTime: 40, hp: 1080, armor: 2, armorType: "heavy", damageMin: 33, damageMax: 39, attackType: "normal", attackCooldown: 1.6, range: 90, moveSpeed: 270, tags: ["melee", "ground", "organic"] },
    { gameId: "ufro", name: "Frost Wyrm", race: "undead", tier: 3, goldCost: 385, lumberCost: 120, supply: 7, buildTime: 65, hp: 1100, armor: 1, armorType: "light", damageMin: 80, damageMax: 96, attackType: "magic", attackCooldown: 2.5, range: 600, moveSpeed: 270, tags: ["ranged", "air", "organic"] },
    { gameId: "ushd", name: "Shade", race: "undead", tier: 1, goldCost: 0, lumberCost: 0, supply: 0, buildTime: 15, hp: 250, armor: 0, armorType: "medium", damageMin: 0, damageMax: 0, attackType: "normal", attackCooldown: 1.0, range: 0, moveSpeed: 350, tags: ["ground", "organic", "scout"] },
  ]).onConflictDoNothing();
  console.log("  Units seeded.");

  // =====================
  // HEROES — all 16 + 8 neutral
  // =====================
  console.log("  Seeding heroes...");
  await db.insert(schema.heroDefinitions).values([
    // HUMAN HEROES
    { gameId: "Hamg", name: "Archmage", race: "human", primaryAttribute: "int", strBase: 14, strGain: 1.8, agiBase: 17, agiGain: 1.0, intBase: 19, intGain: 3.2, hp: 475, mana: 285, armor: 3, armorType: "hero", damageMin: 21, damageMax: 27, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AHbz", name: "Blizzard", isUltimate: false }, { gameId: "AHwe", name: "Summon Water Elemental", isUltimate: false }, { gameId: "AHab", name: "Brilliance Aura", isUltimate: false }, { gameId: "AHmt", name: "Mass Teleport", isUltimate: true }] },
    { gameId: "Hmkg", name: "Mountain King", race: "human", primaryAttribute: "str", strBase: 22, strGain: 3.0, agiBase: 11, agiGain: 1.5, intBase: 15, intGain: 1.5, hp: 700, mana: 225, armor: 2, armorType: "hero", damageMin: 26, damageMax: 36, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AHtb", name: "Storm Bolt", isUltimate: false }, { gameId: "AHtc", name: "Thunder Clap", isUltimate: false }, { gameId: "AHbh", name: "Bash", isUltimate: false }, { gameId: "AHav", name: "Avatar", isUltimate: true }] },
    { gameId: "Hpal", name: "Paladin", race: "human", primaryAttribute: "str", strBase: 22, strGain: 2.7, agiBase: 13, agiGain: 1.0, intBase: 17, intGain: 1.8, hp: 700, mana: 255, armor: 4, armorType: "hero", damageMin: 24, damageMax: 34, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AHhb", name: "Holy Light", isUltimate: false }, { gameId: "AHds", name: "Divine Shield", isUltimate: false }, { gameId: "AHad", name: "Devotion Aura", isUltimate: false }, { gameId: "AHre", name: "Resurrection", isUltimate: true }] },
    { gameId: "Hblm", name: "Blood Mage", race: "human", primaryAttribute: "int", strBase: 18, strGain: 2.0, agiBase: 14, agiGain: 1.0, intBase: 19, intGain: 3.0, hp: 550, mana: 285, armor: 3, armorType: "hero", damageMin: 21, damageMax: 27, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AHdr", name: "Flame Strike", isUltimate: false }, { gameId: "AHfs", name: "Banish", isUltimate: false }, { gameId: "AHsb", name: "Siphon Mana", isUltimate: false }, { gameId: "AHpx", name: "Phoenix", isUltimate: true }] },

    // ORC HEROES
    { gameId: "Obla", name: "Blademaster", race: "orc", primaryAttribute: "agi", strBase: 18, strGain: 2.0, agiBase: 22, agiGain: 3.0, intBase: 16, intGain: 1.5, hp: 550, mana: 240, armor: 5, armorType: "hero", damageMin: 24, damageMax: 46, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AOcr", name: "Critical Strike", isUltimate: false }, { gameId: "AOmw", name: "Mirror Image", isUltimate: false }, { gameId: "AOwk", name: "Wind Walk", isUltimate: false }, { gameId: "AObd", name: "Bladestorm", isUltimate: true }] },
    { gameId: "Ofar", name: "Far Seer", race: "orc", primaryAttribute: "int", strBase: 15, strGain: 2.0, agiBase: 18, agiGain: 1.0, intBase: 19, intGain: 3.0, hp: 475, mana: 285, armor: 3, armorType: "hero", damageMin: 21, damageMax: 27, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AOcl", name: "Chain Lightning", isUltimate: false }, { gameId: "AOfs", name: "Far Sight", isUltimate: false }, { gameId: "AOsf", name: "Feral Spirit", isUltimate: false }, { gameId: "AOeq", name: "Earthquake", isUltimate: true }] },
    { gameId: "Otch", name: "Tauren Chieftain", race: "orc", primaryAttribute: "str", strBase: 25, strGain: 3.2, agiBase: 10, agiGain: 1.0, intBase: 15, intGain: 1.5, hp: 775, mana: 225, armor: 2, armorType: "hero", damageMin: 29, damageMax: 39, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 300, abilities: [{ gameId: "AOsh", name: "Shockwave", isUltimate: false }, { gameId: "AOws", name: "War Stomp", isUltimate: false }, { gameId: "AOre", name: "Endurance Aura", isUltimate: false }, { gameId: "AOr2", name: "Reincarnation", isUltimate: true }] },
    { gameId: "Oshd", name: "Shadow Hunter", race: "orc", primaryAttribute: "agi", strBase: 19, strGain: 2.0, agiBase: 18, agiGain: 1.5, intBase: 21, intGain: 2.5, hp: 550, mana: 315, armor: 4, armorType: "hero", damageMin: 21, damageMax: 33, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AOhw", name: "Healing Wave", isUltimate: false }, { gameId: "AOhx", name: "Hex", isUltimate: false }, { gameId: "AOsw", name: "Serpent Ward", isUltimate: false }, { gameId: "AOvd", name: "Big Bad Voodoo", isUltimate: true }] },

    // NIGHT ELF HEROES
    { gameId: "Edem", name: "Demon Hunter", race: "night_elf", primaryAttribute: "agi", strBase: 19, strGain: 2.4, agiBase: 22, agiGain: 1.5, intBase: 16, intGain: 2.1, hp: 575, mana: 240, armor: 5, armorType: "hero", damageMin: 22, damageMax: 42, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AEmb", name: "Mana Burn", isUltimate: false }, { gameId: "AEim", name: "Immolation", isUltimate: false }, { gameId: "AEev", name: "Evasion", isUltimate: false }, { gameId: "AEme", name: "Metamorphosis", isUltimate: true }] },
    { gameId: "Ekee", name: "Keeper of the Grove", race: "night_elf", primaryAttribute: "int", strBase: 16, strGain: 1.8, agiBase: 15, agiGain: 1.5, intBase: 18, intGain: 2.7, hp: 500, mana: 270, armor: 3, armorType: "hero", damageMin: 20, damageMax: 26, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AEer", name: "Entangling Roots", isUltimate: false }, { gameId: "AEfn", name: "Force of Nature", isUltimate: false }, { gameId: "AEah", name: "Thorns Aura", isUltimate: false }, { gameId: "AEtq", name: "Tranquility", isUltimate: true }] },
    { gameId: "Emoo", name: "Priestess of the Moon", race: "night_elf", primaryAttribute: "agi", strBase: 18, strGain: 1.9, agiBase: 19, agiGain: 1.5, intBase: 15, intGain: 2.6, hp: 550, mana: 225, armor: 4, armorType: "hero", damageMin: 21, damageMax: 37, attackType: "hero", attackCooldown: 2.33, range: 600, moveSpeed: 320, abilities: [{ gameId: "AEst", name: "Scout", isUltimate: false }, { gameId: "AEsf", name: "Searing Arrows", isUltimate: false }, { gameId: "AEar", name: "Trueshot Aura", isUltimate: false }, { gameId: "AEsv", name: "Starfall", isUltimate: true }] },
    { gameId: "Ewar", name: "Warden", race: "night_elf", primaryAttribute: "agi", strBase: 18, strGain: 2.2, agiBase: 20, agiGain: 1.3, intBase: 18, intGain: 2.1, hp: 550, mana: 270, armor: 4, armorType: "hero", damageMin: 22, damageMax: 38, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AEfk", name: "Fan of Knives", isUltimate: false }, { gameId: "AEbl", name: "Blink", isUltimate: false }, { gameId: "AEsh", name: "Shadow Strike", isUltimate: false }, { gameId: "AEsv", name: "Vengeance", isUltimate: true }] },

    // UNDEAD HEROES
    { gameId: "Udea", name: "Death Knight", race: "undead", primaryAttribute: "str", strBase: 23, strGain: 2.7, agiBase: 12, agiGain: 1.5, intBase: 17, intGain: 2.0, hp: 700, mana: 255, armor: 3, armorType: "hero", damageMin: 27, damageMax: 37, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AUdc", name: "Death Coil", isUltimate: false }, { gameId: "AUdp", name: "Death Pact", isUltimate: false }, { gameId: "AUau", name: "Unholy Aura", isUltimate: false }, { gameId: "AUan", name: "Animate Dead", isUltimate: true }] },
    { gameId: "Udre", name: "Dreadlord", race: "undead", primaryAttribute: "str", strBase: 21, strGain: 2.5, agiBase: 16, agiGain: 1.5, intBase: 18, intGain: 2.5, hp: 625, mana: 270, armor: 3, armorType: "hero", damageMin: 25, damageMax: 35, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [{ gameId: "AUcs", name: "Carrion Swarm", isUltimate: false }, { gameId: "AUsl", name: "Sleep", isUltimate: false }, { gameId: "AUav", name: "Vampiric Aura", isUltimate: false }, { gameId: "AUin", name: "Inferno", isUltimate: true }] },
    { gameId: "Ulic", name: "Lich", race: "undead", primaryAttribute: "int", strBase: 15, strGain: 2.0, agiBase: 14, agiGain: 1.0, intBase: 20, intGain: 3.5, hp: 475, mana: 300, armor: 2, armorType: "hero", damageMin: 22, damageMax: 28, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [{ gameId: "AUfn", name: "Frost Nova", isUltimate: false }, { gameId: "AUfa", name: "Frost Armor", isUltimate: false }, { gameId: "AUdr", name: "Dark Ritual", isUltimate: false }, { gameId: "AUdd", name: "Death and Decay", isUltimate: true }] },
    { gameId: "Ucry", name: "Crypt Lord", race: "undead", primaryAttribute: "str", strBase: 24, strGain: 3.2, agiBase: 14, agiGain: 1.2, intBase: 14, intGain: 1.6, hp: 750, mana: 210, armor: 3, armorType: "hero", damageMin: 28, damageMax: 38, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 300, abilities: [{ gameId: "AUim", name: "Impale", isUltimate: false }, { gameId: "AUts", name: "Spiked Carapace", isUltimate: false }, { gameId: "AUcb", name: "Carrion Beetles", isUltimate: false }, { gameId: "AUls", name: "Locust Swarm", isUltimate: true }] },

    // NEUTRAL HEROES
    { gameId: "Nalc", name: "Alchemist", race: "human", primaryAttribute: "str", strBase: 23, strGain: 2.7, agiBase: 14, agiGain: 1.0, intBase: 17, intGain: 2.0, hp: 700, mana: 255, armor: 3, armorType: "hero", damageMin: 27, damageMax: 37, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [] },
    { gameId: "Nbst", name: "Beastmaster", race: "orc", primaryAttribute: "str", strBase: 22, strGain: 3.0, agiBase: 13, agiGain: 1.5, intBase: 18, intGain: 1.5, hp: 700, mana: 270, armor: 2, armorType: "hero", damageMin: 26, damageMax: 36, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [] },
    { gameId: "Nbrn", name: "Dark Ranger", race: "undead", primaryAttribute: "agi", strBase: 17, strGain: 1.9, agiBase: 21, agiGain: 2.1, intBase: 18, intGain: 2.4, hp: 525, mana: 270, armor: 4, armorType: "hero", damageMin: 23, damageMax: 39, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [] },
    { gameId: "Nfir", name: "Firelord", race: "human", primaryAttribute: "int", strBase: 20, strGain: 2.0, agiBase: 15, agiGain: 1.5, intBase: 22, intGain: 3.0, hp: 600, mana: 330, armor: 3, armorType: "hero", damageMin: 24, damageMax: 30, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [] },
    { gameId: "Nngs", name: "Naga Sea Witch", race: "night_elf", primaryAttribute: "int", strBase: 15, strGain: 2.0, agiBase: 17, agiGain: 1.0, intBase: 21, intGain: 3.0, hp: 475, mana: 315, armor: 3, armorType: "hero", damageMin: 23, damageMax: 29, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [] },
    { gameId: "Npbm", name: "Pandaren Brewmaster", race: "orc", primaryAttribute: "str", strBase: 24, strGain: 3.0, agiBase: 14, agiGain: 1.0, intBase: 14, intGain: 1.5, hp: 750, mana: 210, armor: 3, armorType: "hero", damageMin: 28, damageMax: 38, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 320, abilities: [] },
    { gameId: "Nplh", name: "Pit Lord", race: "undead", primaryAttribute: "str", strBase: 26, strGain: 3.5, agiBase: 10, agiGain: 1.0, intBase: 17, intGain: 1.5, hp: 825, mana: 255, armor: 2, armorType: "hero", damageMin: 30, damageMax: 40, attackType: "hero", attackCooldown: 1.8, range: 90, moveSpeed: 300, abilities: [] },
    { gameId: "Ntin", name: "Tinker", race: "human", primaryAttribute: "int", strBase: 16, strGain: 1.7, agiBase: 16, agiGain: 1.0, intBase: 20, intGain: 3.0, hp: 500, mana: 300, armor: 2, armorType: "hero", damageMin: 22, damageMax: 28, attackType: "hero", attackCooldown: 1.8, range: 600, moveSpeed: 320, abilities: [] },
  ]).onConflictDoNothing();
  console.log("  Heroes seeded.");

  // =====================
  // BUILDINGS — all races
  // =====================
  console.log("  Seeding buildings...");
  await db.insert(schema.buildingDefinitions).values([
    // HUMAN
    { gameId: "htow", name: "Town Hall", race: "human", tier: 1, goldCost: 385, lumberCost: 185, buildTime: 150, hp: 1500, armor: 5, armorType: "fortified", producesUnits: ["hpea"], tags: ["town_hall"] },
    { gameId: "hkee", name: "Keep", race: "human", tier: 2, goldCost: 320, lumberCost: 210, buildTime: 140, hp: 1800, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "hcas", name: "Castle", race: "human", tier: 3, goldCost: 360, lumberCost: 210, buildTime: 140, hp: 2000, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "halt", name: "Altar of Kings", race: "human", tier: 1, goldCost: 180, lumberCost: 50, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["Hamg", "Hmkg", "Hpal", "Hblm"], tags: ["altar"] },
    { gameId: "hbar", name: "Barracks", race: "human", tier: 1, goldCost: 160, lumberCost: 60, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["hfoo", "hrif", "hkni", "hspt"], tags: ["production"] },
    { gameId: "hbla", name: "Blacksmith", race: "human", tier: 1, goldCost: 140, lumberCost: 60, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", tags: ["tech"] },
    { gameId: "harm", name: "Workshop", race: "human", tier: 2, goldCost: 140, lumberCost: 140, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["hmtm", "hmtt"], tags: ["production"] },
    { gameId: "hars", name: "Arcane Sanctum", race: "human", tier: 2, goldCost: 150, lumberCost: 140, buildTime: 70, hp: 1050, armor: 5, armorType: "fortified", producesUnits: ["hmpr", "hsor", "hspt"], tags: ["production", "caster"] },
    { gameId: "hlum", name: "Lumber Mill", race: "human", tier: 1, goldCost: 120, lumberCost: 0, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", tags: ["tech"] },
    { gameId: "hhou", name: "Farm", race: "human", tier: 1, goldCost: 80, lumberCost: 20, buildTime: 35, hp: 500, armor: 5, armorType: "fortified", tags: ["supply"] },
    { gameId: "hwtw", name: "Scout Tower", race: "human", tier: 1, goldCost: 30, lumberCost: 20, buildTime: 25, hp: 500, armor: 5, armorType: "fortified", tags: ["tower"] },
    { gameId: "hatw", name: "Arcane Tower", race: "human", tier: 1, goldCost: 70, lumberCost: 50, buildTime: 50, hp: 500, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "hgtw", name: "Guard Tower", race: "human", tier: 1, goldCost: 70, lumberCost: 50, buildTime: 50, hp: 500, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "hctw", name: "Cannon Tower", race: "human", tier: 2, goldCost: 150, lumberCost: 100, buildTime: 75, hp: 600, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "hvlt", name: "Arcane Vault", race: "human", tier: 1, goldCost: 130, lumberCost: 30, buildTime: 60, hp: 375, armor: 5, armorType: "fortified", tags: ["shop"] },
    { gameId: "hgra", name: "Gryphon Aviary", race: "human", tier: 3, goldCost: 140, lumberCost: 150, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["hgry", "hdhw"], tags: ["production"] },

    // ORC
    { gameId: "ogre", name: "Great Hall", race: "orc", tier: 1, goldCost: 385, lumberCost: 185, buildTime: 150, hp: 1500, armor: 5, armorType: "fortified", producesUnits: ["opeo"], tags: ["town_hall"] },
    { gameId: "ostr", name: "Stronghold", race: "orc", tier: 2, goldCost: 315, lumberCost: 190, buildTime: 140, hp: 1800, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "ofrt", name: "Fortress", race: "orc", tier: 3, goldCost: 325, lumberCost: 190, buildTime: 140, hp: 2000, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "oalt", name: "Altar of Storms", race: "orc", tier: 1, goldCost: 180, lumberCost: 50, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["Obla", "Ofar", "Otch", "Oshd"], tags: ["altar"] },
    { gameId: "obar", name: "Barracks", race: "orc", tier: 1, goldCost: 180, lumberCost: 50, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["ogru", "ohun", "otbk"], tags: ["production"] },
    { gameId: "ofor", name: "War Mill", race: "orc", tier: 1, goldCost: 205, lumberCost: 0, buildTime: 70, hp: 1200, armor: 5, armorType: "fortified", tags: ["tech"] },
    { gameId: "obea", name: "Beastiary", race: "orc", tier: 2, goldCost: 145, lumberCost: 140, buildTime: 60, hp: 1100, armor: 5, armorType: "fortified", producesUnits: ["orai", "okod", "owyv", "otbr"], tags: ["production"] },
    { gameId: "osld", name: "Spirit Lodge", race: "orc", tier: 2, goldCost: 150, lumberCost: 150, buildTime: 70, hp: 800, armor: 5, armorType: "fortified", producesUnits: ["oshm", "odoc", "ospw"], tags: ["production", "caster"] },
    { gameId: "otrb", name: "Orc Burrow", race: "orc", tier: 1, goldCost: 160, lumberCost: 40, buildTime: 50, hp: 600, armor: 5, armorType: "fortified", tags: ["supply", "defense"] },
    { gameId: "owtw", name: "Watch Tower", race: "orc", tier: 1, goldCost: 110, lumberCost: 80, buildTime: 60, hp: 500, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "ovln", name: "Voodoo Lounge", race: "orc", tier: 1, goldCost: 130, lumberCost: 30, buildTime: 60, hp: 375, armor: 5, armorType: "fortified", tags: ["shop"] },
    { gameId: "otto", name: "Tauren Totem", race: "orc", tier: 3, goldCost: 135, lumberCost: 155, buildTime: 70, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["otau", "ospw"], tags: ["production"] },

    // NIGHT ELF
    { gameId: "etol", name: "Tree of Life", race: "night_elf", tier: 1, goldCost: 340, lumberCost: 185, buildTime: 120, hp: 1300, armor: 5, armorType: "fortified", producesUnits: ["ewsp"], tags: ["town_hall"] },
    { gameId: "etoa", name: "Tree of Ages", race: "night_elf", tier: 2, goldCost: 320, lumberCost: 180, buildTime: 140, hp: 1700, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "etoe", name: "Tree of Eternity", race: "night_elf", tier: 3, goldCost: 330, lumberCost: 200, buildTime: 140, hp: 2000, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "eate", name: "Altar of Elders", race: "night_elf", tier: 1, goldCost: 180, lumberCost: 50, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["Edem", "Ekee", "Emoo", "Ewar"], tags: ["altar"] },
    { gameId: "eaom", name: "Ancient of War", race: "night_elf", tier: 1, goldCost: 150, lumberCost: 60, buildTime: 60, hp: 1000, armor: 5, armorType: "fortified", producesUnits: ["earc", "esen", "ebal"], tags: ["production"] },
    { gameId: "eaow", name: "Ancient of Wind", race: "night_elf", tier: 2, goldCost: 150, lumberCost: 140, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["edot", "efdr", "ehip"], tags: ["production"] },
    { gameId: "eaoe", name: "Ancient of Lore", race: "night_elf", tier: 2, goldCost: 155, lumberCost: 145, buildTime: 70, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["edry", "edoc", "emtg"], tags: ["production"] },
    { gameId: "edob", name: "Hunter's Hall", race: "night_elf", tier: 1, goldCost: 210, lumberCost: 100, buildTime: 60, hp: 1100, armor: 5, armorType: "fortified", tags: ["tech"] },
    { gameId: "emow", name: "Moon Well", race: "night_elf", tier: 1, goldCost: 180, lumberCost: 40, buildTime: 50, hp: 600, armor: 5, armorType: "fortified", tags: ["supply"] },
    { gameId: "eden", name: "Ancient Protector", race: "night_elf", tier: 1, goldCost: 135, lumberCost: 80, buildTime: 60, hp: 600, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "etrp", name: "Ancient Protector", race: "night_elf", tier: 1, goldCost: 135, lumberCost: 80, buildTime: 60, hp: 600, armor: 5, armorType: "fortified", tags: ["tower", "defense"] },
    { gameId: "edos", name: "Chimaera Roost", race: "night_elf", tier: 3, goldCost: 140, lumberCost: 190, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["echm"], tags: ["production"] },

    // UNDEAD
    { gameId: "unpl", name: "Necropolis", race: "undead", tier: 1, goldCost: 255, lumberCost: 0, buildTime: 120, hp: 1500, armor: 5, armorType: "fortified", producesUnits: ["uaco"], tags: ["town_hall"] },
    { gameId: "unp1", name: "Halls of the Dead", race: "undead", tier: 2, goldCost: 315, lumberCost: 190, buildTime: 140, hp: 1750, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "unp2", name: "Black Citadel", race: "undead", tier: 3, goldCost: 325, lumberCost: 230, buildTime: 140, hp: 2000, armor: 5, armorType: "fortified", tags: ["town_hall", "upgrade"] },
    { gameId: "ualt", name: "Altar of Darkness", race: "undead", tier: 1, goldCost: 180, lumberCost: 50, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["Udea", "Udre", "Ulic", "Ucry"], tags: ["altar"] },
    { gameId: "usep", name: "Crypt", race: "undead", tier: 1, goldCost: 200, lumberCost: 50, buildTime: 60, hp: 1300, armor: 5, armorType: "fortified", producesUnits: ["ugho", "ucry", "ugar"], tags: ["production"] },
    { gameId: "ugrv", name: "Graveyard", race: "undead", tier: 1, goldCost: 215, lumberCost: 0, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", tags: ["tech"] },
    { gameId: "utod", name: "Temple of the Damned", race: "undead", tier: 2, goldCost: 155, lumberCost: 140, buildTime: 70, hp: 900, armor: 5, armorType: "fortified", producesUnits: ["unec", "uban"], tags: ["production", "caster"] },
    { gameId: "uslh", name: "Slaughterhouse", race: "undead", tier: 3, goldCost: 140, lumberCost: 135, buildTime: 60, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["uabo", "umtw", "uobs"], tags: ["production"] },
    { gameId: "uzig", name: "Ziggurat", race: "undead", tier: 1, goldCost: 150, lumberCost: 50, buildTime: 50, hp: 550, armor: 5, armorType: "fortified", tags: ["supply"] },
    { gameId: "uzg1", name: "Spirit Tower", race: "undead", tier: 1, goldCost: 145, lumberCost: 40, buildTime: 35, hp: 550, armor: 5, armorType: "fortified", tags: ["tower", "defense", "supply"] },
    { gameId: "uzg2", name: "Nerubian Tower", race: "undead", tier: 2, goldCost: 100, lumberCost: 20, buildTime: 35, hp: 550, armor: 5, armorType: "fortified", tags: ["tower", "defense", "supply"] },
    { gameId: "utom", name: "Tomb of Relics", race: "undead", tier: 1, goldCost: 130, lumberCost: 30, buildTime: 60, hp: 425, armor: 5, armorType: "fortified", tags: ["shop"] },
    { gameId: "ubon", name: "Boneyard", race: "undead", tier: 3, goldCost: 175, lumberCost: 200, buildTime: 80, hp: 1200, armor: 5, armorType: "fortified", producesUnits: ["ufro"], tags: ["production"] },
    { gameId: "usap", name: "Sacrificial Pit", race: "undead", tier: 3, goldCost: 75, lumberCost: 150, buildTime: 60, hp: 900, armor: 5, armorType: "fortified", tags: ["tech"] },
  ]).onConflictDoNothing();
  console.log("  Buildings seeded.");

  // =====================
  // UPGRADES — core upgrades per race
  // =====================
  console.log("  Seeding upgrades...");
  await db.insert(schema.upgradeDefinitions).values([
    // HUMAN
    { gameId: "Rhme", name: "Iron Forged Swords", race: "human", levels: 3, goldCost: [100, 175, 250], lumberCost: [0, 0, 0], researchTime: [60, 75, 90], affectsUnits: ["hfoo", "hkni", "hspt"], researchedAt: "hbla" },
    { gameId: "Rhra", name: "Iron Plating", race: "human", levels: 3, goldCost: [125, 175, 250], lumberCost: [25, 50, 75], researchTime: [60, 75, 90], affectsUnits: ["hfoo", "hkni", "hspt"], researchedAt: "hbla" },
    { gameId: "Rhla", name: "Leather Armor", race: "human", levels: 3, goldCost: [100, 175, 250], lumberCost: [100, 175, 250], researchTime: [60, 75, 90], affectsUnits: ["hrif", "hmpr", "hsor"], researchedAt: "hbla" },
    { gameId: "Rhlh", name: "Lumber Harvesting", race: "human", levels: 2, goldCost: [100, 150], lumberCost: [0, 0], researchTime: [60, 75], affectsUnits: ["hpea"], researchedAt: "hlum" },
    { gameId: "Rhac", name: "Improved Masonry", race: "human", levels: 3, goldCost: [125, 150, 175], lumberCost: [50, 75, 100], researchTime: [60, 75, 90], affectsUnits: [], researchedAt: "hlum" },
    { gameId: "Rhri", name: "Long Rifles", race: "human", levels: 1, goldCost: [75], lumberCost: [125], researchTime: [40], affectsUnits: ["hrif"], researchedAt: "hbla" },
    { gameId: "Rhan", name: "Animal War Training", race: "human", levels: 1, goldCost: [75], lumberCost: [75], researchTime: [40], affectsUnits: ["hkni", "hgry", "hdhw"], researchedAt: "hbar" },
    { gameId: "Rhpt", name: "Priest Training", race: "human", levels: 2, goldCost: [100, 150], lumberCost: [0, 0], researchTime: [60, 75], affectsUnits: ["hmpr"], researchedAt: "hars" },
    { gameId: "Rhst", name: "Sorceress Training", race: "human", levels: 2, goldCost: [100, 150], lumberCost: [0, 0], researchTime: [60, 75], affectsUnits: ["hsor"], researchedAt: "hars" },

    // ORC
    { gameId: "Rome", name: "Steel Melee Weapons", race: "orc", levels: 3, goldCost: [100, 175, 250], lumberCost: [0, 0, 0], researchTime: [60, 75, 90], affectsUnits: ["ogru", "otau", "orai"], researchedAt: "ofor" },
    { gameId: "Rora", name: "Steel Ranged Weapons", race: "orc", levels: 3, goldCost: [100, 175, 250], lumberCost: [0, 0, 0], researchTime: [60, 75, 90], affectsUnits: ["ohun", "otbk", "owyv", "otbr"], researchedAt: "ofor" },
    { gameId: "Roar", name: "Unit Armor", race: "orc", levels: 3, goldCost: [150, 200, 250], lumberCost: [75, 100, 125], researchTime: [60, 75, 90], affectsUnits: ["ogru", "otau", "orai", "ohun", "otbk"], researchedAt: "ofor" },
    { gameId: "Ropg", name: "Pillage", race: "orc", levels: 1, goldCost: [75], lumberCost: [25], researchTime: [45], affectsUnits: ["opeo", "ogru", "orai"], researchedAt: "ofor" },
    { gameId: "Robs", name: "Berserker Upgrade", race: "orc", levels: 1, goldCost: [75], lumberCost: [25], researchTime: [40], affectsUnits: ["ohun"], researchedAt: "obar" },
    { gameId: "Rows", name: "Pulverize", race: "orc", levels: 1, goldCost: [150], lumberCost: [50], researchTime: [60], affectsUnits: ["otau"], researchedAt: "otto" },
    { gameId: "Rost", name: "Shaman Training", race: "orc", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["oshm"], researchedAt: "osld" },
    { gameId: "Rowt", name: "Witch Doctor Training", race: "orc", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["odoc"], researchedAt: "osld" },
    { gameId: "Rosp", name: "Spiked Barricades", race: "orc", levels: 3, goldCost: [25, 50, 75], lumberCost: [25, 50, 75], researchTime: [30, 45, 60], affectsUnits: [], researchedAt: "ofor" },
    { gameId: "Roen", name: "Ensnare", race: "orc", levels: 1, goldCost: [50], lumberCost: [75], researchTime: [40], affectsUnits: ["orai"], researchedAt: "obea" },
    { gameId: "Rovs", name: "Envenomed Spears", race: "orc", levels: 1, goldCost: [100], lumberCost: [150], researchTime: [40], affectsUnits: ["owyv"], researchedAt: "obea" },

    // NIGHT ELF
    { gameId: "Reib", name: "Improved Bows", race: "night_elf", levels: 3, goldCost: [100, 175, 250], lumberCost: [50, 100, 150], researchTime: [60, 75, 90], affectsUnits: ["earc", "ehpr"], researchedAt: "edob" },
    { gameId: "Rema", name: "Moon Armor", race: "night_elf", levels: 3, goldCost: [150, 200, 250], lumberCost: [75, 100, 150], researchTime: [60, 75, 90], affectsUnits: ["earc", "esen", "edry", "ehpr"], researchedAt: "edob" },
    { gameId: "Rerh", name: "Reinforced Hides", race: "night_elf", levels: 3, goldCost: [100, 175, 250], lumberCost: [100, 175, 250], researchTime: [60, 75, 90], affectsUnits: ["edoc", "edot", "emtg"], researchedAt: "edob" },
    { gameId: "Remg", name: "Strength of the Moon", race: "night_elf", levels: 3, goldCost: [100, 175, 250], lumberCost: [0, 0, 0], researchTime: [60, 75, 90], affectsUnits: ["earc", "esen", "ehpr", "edry"], researchedAt: "edob" },
    { gameId: "Redt", name: "Druid of the Talon Training", race: "night_elf", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["edot"], researchedAt: "eaow" },
    { gameId: "Redc", name: "Druid of the Claw Training", race: "night_elf", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["edoc"], researchedAt: "eaoe" },
    { gameId: "Reht", name: "Hippogryph Taming", race: "night_elf", levels: 1, goldCost: [75], lumberCost: [75], researchTime: [30], affectsUnits: ["ehip"], researchedAt: "eaow" },

    // UNDEAD
    { gameId: "Rume", name: "Unholy Strength", race: "undead", levels: 3, goldCost: [125, 175, 250], lumberCost: [0, 0, 0], researchTime: [60, 75, 90], affectsUnits: ["ugho", "uabo"], researchedAt: "ugrv" },
    { gameId: "Rura", name: "Creature Attack", race: "undead", levels: 3, goldCost: [100, 150, 200], lumberCost: [50, 100, 150], researchTime: [60, 75, 90], affectsUnits: ["ucry", "ugar", "ufro"], researchedAt: "ugrv" },
    { gameId: "Ruar", name: "Unholy Armor", race: "undead", levels: 3, goldCost: [125, 175, 250], lumberCost: [25, 50, 75], researchTime: [60, 75, 90], affectsUnits: ["ugho", "ucry", "ugar", "uabo", "ufro"], researchedAt: "ugrv" },
    { gameId: "Ruac", name: "Cannibalize", race: "undead", levels: 1, goldCost: [75], lumberCost: [0], researchTime: [30], affectsUnits: ["ugho"], researchedAt: "usep" },
    { gameId: "Rugf", name: "Ghoul Frenzy", race: "undead", levels: 1, goldCost: [100], lumberCost: [150], researchTime: [45], affectsUnits: ["ugho"], researchedAt: "ugrv" },
    { gameId: "Ruwb", name: "Web", race: "undead", levels: 1, goldCost: [75], lumberCost: [25], researchTime: [30], affectsUnits: ["ucry"], researchedAt: "usep" },
    { gameId: "Rusf", name: "Stone Form", race: "undead", levels: 1, goldCost: [75], lumberCost: [150], researchTime: [60], affectsUnits: ["ugar"], researchedAt: "ugrv" },
    { gameId: "Rune", name: "Necromancer Training", race: "undead", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["unec"], researchedAt: "utod" },
    { gameId: "Ruba", name: "Banshee Training", race: "undead", levels: 2, goldCost: [100, 150], lumberCost: [50, 100], researchTime: [60, 75], affectsUnits: ["uban"], researchedAt: "utod" },
    { gameId: "Rufb", name: "Freezing Breath", race: "undead", levels: 1, goldCost: [150], lumberCost: [200], researchTime: [75], affectsUnits: ["ufro"], researchedAt: "ubon" },
    { gameId: "Ruex", name: "Exhume Corpses", race: "undead", levels: 1, goldCost: [75], lumberCost: [50], researchTime: [30], affectsUnits: ["umtw"], researchedAt: "uslh" },
  ]).onConflictDoNothing();
  console.log("  Upgrades seeded.");

  // =====================
  // ITEMS — common items
  // =====================
  console.log("  Seeding items...");
  await db.insert(schema.itemDefinitions).values([
    // Potions / charged
    { gameId: "phea", name: "Potion of Healing", goldCost: 150, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "pman", name: "Potion of Mana", goldCost: 200, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "pinv", name: "Potion of Invisibility", goldCost: 100, level: 2, category: "charged", tags: ["consumable"] },
    { gameId: "pnvl", name: "Potion of Invulnerability", goldCost: 150, level: 3, category: "charged", tags: ["consumable"] },
    { gameId: "shea", name: "Scroll of Healing", goldCost: 100, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "stel", name: "Staff of Teleportation", goldCost: 150, level: 2, category: "charged", tags: ["consumable", "mobility"] },
    { gameId: "sreg", name: "Scroll of Regeneration", goldCost: 100, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "shas", name: "Scroll of Speed", goldCost: 50, level: 1, category: "charged", tags: ["consumable", "mobility"] },
    { gameId: "stwp", name: "Scroll of Town Portal", goldCost: 350, level: 3, category: "charged", tags: ["consumable", "mobility"] },
    { gameId: "dust", name: "Dust of Appearance", goldCost: 75, level: 1, category: "charged", tags: ["utility"] },
    { gameId: "plcl", name: "Lesser Clarity Potion", goldCost: 50, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "tret", name: "Tome of Retraining", goldCost: 300, level: 3, category: "charged", tags: ["utility"] },

    // Permanent items
    { gameId: "rlif", name: "Ring of Protection +2", goldCost: 75, level: 1, category: "permanent", tags: ["armor"] },
    { gameId: "rde1", name: "Ring of Protection +3", goldCost: 125, level: 2, category: "permanent", tags: ["armor"] },
    { gameId: "rst1", name: "Gauntlets of Ogre Strength +3", goldCost: 100, level: 1, category: "permanent", tags: ["stat"] },
    { gameId: "rat6", name: "Claws of Attack +6", goldCost: 100, level: 2, category: "permanent", tags: ["damage"] },
    { gameId: "rat9", name: "Claws of Attack +9", goldCost: 175, level: 3, category: "permanent", tags: ["damage"] },
    { gameId: "bspd", name: "Boots of Speed", goldCost: 150, level: 2, category: "permanent", tags: ["mobility"] },
    { gameId: "belv", name: "Boots of Quel'Thalas +6", goldCost: 200, level: 3, category: "permanent", tags: ["stat"] },
    { gameId: "bgst", name: "Belt of Giant Strength +6", goldCost: 200, level: 3, category: "permanent", tags: ["stat"] },
    { gameId: "ciri", name: "Robe of the Magi +6", goldCost: 200, level: 3, category: "permanent", tags: ["stat"] },
    { gameId: "hslv", name: "Healing Salve", goldCost: 100, level: 1, category: "charged", tags: ["consumable"] },
    { gameId: "hval", name: "Health Stone", goldCost: 0, level: 2, category: "charged", tags: ["consumable"] },
    { gameId: "mana", name: "Mana Stone", goldCost: 0, level: 2, category: "charged", tags: ["consumable"] },

    // Artifacts
    { gameId: "ofro", name: "Orb of Frost", goldCost: 375, level: 4, category: "artifact", tags: ["orb"] },
    { gameId: "olig", name: "Orb of Lightning", goldCost: 375, level: 4, category: "artifact", tags: ["orb"] },
    { gameId: "oven", name: "Orb of Venom", goldCost: 325, level: 4, category: "artifact", tags: ["orb"] },

    // Creep drops — Claws of Attack
    { gameId: "rat3", name: "Claws of Attack +3", goldCost: 0, level: 1, category: "permanent", tags: ["damage", "creep_drop"] },
    { gameId: "ratc", name: "Claws of Attack +12", goldCost: 0, level: 4, category: "permanent", tags: ["damage", "creep_drop"] },
    { gameId: "ratf", name: "Claws of Attack +15", goldCost: 0, level: 5, category: "permanent", tags: ["damage", "creep_drop"] },

    // Creep drops — Stat items
    { gameId: "rags", name: "Slippers of Agility +3", goldCost: 0, level: 1, category: "permanent", tags: ["stat", "creep_drop"] },
    { gameId: "rmpi", name: "Mantle of Intelligence +3", goldCost: 0, level: 1, category: "permanent", tags: ["stat", "creep_drop"] },
    { gameId: "rnec", name: "Circlet of Nobility", goldCost: 0, level: 2, category: "permanent", tags: ["stat", "creep_drop"] },
    { gameId: "rhth", name: "Kelen's Dagger of Escape", goldCost: 0, level: 3, category: "charged", tags: ["mobility", "creep_drop"] },

    // Creep drops — Rings
    { gameId: "rre1", name: "Ring of Regeneration", goldCost: 0, level: 2, category: "permanent", tags: ["regen", "creep_drop"] },
    { gameId: "rre2", name: "Ring of Regeneration +2", goldCost: 0, level: 3, category: "permanent", tags: ["regen", "creep_drop"] },
    { gameId: "rde2", name: "Ring of Protection +4", goldCost: 0, level: 3, category: "permanent", tags: ["armor", "creep_drop"] },
    { gameId: "rde3", name: "Ring of Protection +5", goldCost: 0, level: 4, category: "permanent", tags: ["armor", "creep_drop"] },

    // Creep drops — Pendants/Periapts
    { gameId: "penr", name: "Pendant of Energy", goldCost: 0, level: 2, category: "permanent", tags: ["mana", "creep_drop"] },
    { gameId: "pmna", name: "Pendant of Mana", goldCost: 0, level: 3, category: "permanent", tags: ["mana", "creep_drop"] },
    { gameId: "prvt", name: "Periapt of Vitality", goldCost: 0, level: 3, category: "permanent", tags: ["hp", "creep_drop"] },

    // Creep drops — Masks/Amulets/Gems
    { gameId: "modt", name: "Mask of Death", goldCost: 0, level: 5, category: "permanent", tags: ["lifesteal", "creep_drop"] },
    { gameId: "lhst", name: "Medallion of Courage", goldCost: 0, level: 3, category: "permanent", tags: ["stat", "creep_drop"] },
    { gameId: "gemt", name: "Gem of True Seeing", goldCost: 0, level: 3, category: "permanent", tags: ["utility", "creep_drop"] },

    // Creep drops — Gloves/Cloaks
    { gameId: "gcel", name: "Gloves of Haste", goldCost: 0, level: 3, category: "permanent", tags: ["attack_speed", "creep_drop"] },
    { gameId: "clsd", name: "Cloak of Shadows", goldCost: 0, level: 3, category: "permanent", tags: ["magic_resist", "creep_drop"] },
    { gameId: "clfm", name: "Cloak of Flames", goldCost: 0, level: 4, category: "permanent", tags: ["damage", "creep_drop"] },

    // Creep drops — Orbs
    { gameId: "odef", name: "Orb of Darkness", goldCost: 0, level: 4, category: "artifact", tags: ["orb", "creep_drop"] },
    { gameId: "ocor", name: "Orb of Corruption", goldCost: 0, level: 4, category: "artifact", tags: ["orb", "creep_drop"] },
    { gameId: "ofir", name: "Orb of Fire", goldCost: 0, level: 4, category: "artifact", tags: ["orb", "creep_drop"] },

    // Creep drops — Wands
    { gameId: "wcyc", name: "Wand of the Wind", goldCost: 0, level: 2, category: "charged", tags: ["utility", "creep_drop"] },
    { gameId: "wneu", name: "Wand of Neutralization", goldCost: 0, level: 2, category: "charged", tags: ["utility", "creep_drop"] },

    // Creep drops — Charged
    { gameId: "ankh", name: "Ankh of Reincarnation", goldCost: 0, level: 5, category: "charged", tags: ["creep_drop"] },
    { gameId: "pghe", name: "Potion of Greater Healing", goldCost: 0, level: 3, category: "charged", tags: ["consumable", "creep_drop"] },
    { gameId: "pgma", name: "Potion of Greater Mana", goldCost: 0, level: 3, category: "charged", tags: ["consumable", "creep_drop"] },
    { gameId: "pams", name: "Anti-magic Potion", goldCost: 0, level: 2, category: "charged", tags: ["consumable", "creep_drop"] },

    // Creep drops — Misc
    { gameId: "ward", name: "Sentry Ward", goldCost: 0, level: 1, category: "charged", tags: ["utility", "creep_drop"] },
    { gameId: "skul", name: "Sacrificial Skull", goldCost: 0, level: 2, category: "charged", tags: ["creep_drop"] },
    { gameId: "sori", name: "Sobi Mask", goldCost: 0, level: 2, category: "permanent", tags: ["mana_regen", "creep_drop"] },
    { gameId: "spro", name: "Amulet of Spell Shield", goldCost: 0, level: 4, category: "permanent", tags: ["magic_resist", "creep_drop"] },
    { gameId: "sbch", name: "Scroll of the Beast", goldCost: 0, level: 2, category: "charged", tags: ["consumable", "creep_drop"] },
    { gameId: "spre", name: "Scroll of Protection", goldCost: 0, level: 2, category: "charged", tags: ["consumable", "creep_drop"] },
    { gameId: "ssan", name: "Staff of Sanctuary", goldCost: 0, level: 3, category: "charged", tags: ["utility", "creep_drop"] },
    { gameId: "ssil", name: "Staff of Silence", goldCost: 0, level: 3, category: "charged", tags: ["utility", "creep_drop"] },
    { gameId: "cnob", name: "Circlet of Nobility", goldCost: 0, level: 2, category: "permanent", tags: ["stat", "creep_drop"] },
    { gameId: "pdiv", name: "Potion of Divinity", goldCost: 0, level: 4, category: "charged", tags: ["consumable", "creep_drop"] },
    { gameId: "pres", name: "Potion of Restoration", goldCost: 0, level: 3, category: "charged", tags: ["consumable", "creep_drop"] },

    // Powerups
    { gameId: "tstr", name: "Tome of Strength", goldCost: 0, level: 1, category: "powerup", tags: ["permanent_stat"] },
    { gameId: "tagi", name: "Tome of Agility", goldCost: 0, level: 1, category: "powerup", tags: ["permanent_stat"] },
    { gameId: "tint", name: "Tome of Intelligence", goldCost: 0, level: 1, category: "powerup", tags: ["permanent_stat"] },
    { gameId: "txp2", name: "Tome of Experience", goldCost: 0, level: 3, category: "powerup", tags: ["xp"] },
  ]).onConflictDoNothing();
  console.log("  Items seeded.");

  console.log("Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
