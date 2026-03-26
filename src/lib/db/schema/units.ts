import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { raceEnum, attackTypeEnum, armorTypeEnum } from "./enums";

export const unitDefinitions = pgTable("unit_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  race: raceEnum("race").notNull(),
  tier: integer("tier").notNull(),
  goldCost: integer("gold_cost").notNull(),
  lumberCost: integer("lumber_cost").notNull(),
  supply: integer("supply").notNull(),
  buildTime: integer("build_time").notNull(), // seconds
  hp: integer("hp").notNull(),
  mana: integer("mana"),
  armor: integer("armor").notNull(),
  armorType: armorTypeEnum("armor_type").notNull(),
  damageMin: integer("damage_min").notNull(),
  damageMax: integer("damage_max").notNull(),
  attackType: attackTypeEnum("attack_type").notNull(),
  attackCooldown: real("attack_cooldown").notNull(), // seconds
  range: integer("range").notNull(),
  moveSpeed: integer("move_speed").notNull(),
  abilities: jsonb("abilities").$type<string[]>().default([]),
  upgrades: jsonb("upgrades").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
