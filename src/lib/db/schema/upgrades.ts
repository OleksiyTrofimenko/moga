import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { raceEnum } from "./enums";

export const upgradeDefinitions = pgTable("upgrade_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  race: raceEnum("race").notNull(),
  levels: integer("levels").notNull(), // typically 1-3
  goldCost: jsonb("gold_cost").$type<number[]>().notNull(), // cost per level
  lumberCost: jsonb("lumber_cost").$type<number[]>().notNull(),
  researchTime: jsonb("research_time").$type<number[]>().notNull(), // seconds per level
  effects: jsonb("effects").$type<Record<string, unknown>[]>().default([]),
  affectsUnits: jsonb("affects_units").$type<string[]>().default([]),
  researchedAt: varchar("researched_at", { length: 8 }), // building gameId
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
