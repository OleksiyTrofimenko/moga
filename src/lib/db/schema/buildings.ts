import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { raceEnum, armorTypeEnum } from "./enums";

export const buildingDefinitions = pgTable("building_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  race: raceEnum("race").notNull(),
  tier: integer("tier").notNull(), // which tier this building belongs to or unlocks
  goldCost: integer("gold_cost").notNull(),
  lumberCost: integer("lumber_cost").notNull(),
  buildTime: integer("build_time").notNull(),
  hp: integer("hp").notNull(),
  armor: integer("armor").notNull(),
  armorType: armorTypeEnum("armor_type").notNull(),
  producesUnits: jsonb("produces_units").$type<string[]>().default([]),
  producesUpgrades: jsonb("produces_upgrades").$type<string[]>().default([]),
  requiresBuildings: jsonb("requires_buildings").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
