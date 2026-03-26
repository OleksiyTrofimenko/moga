import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const abilityDefinitions = pgTable("ability_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  heroAbility: boolean("hero_ability").notNull().default(false),
  levels: integer("levels").notNull().default(1),
  manaCost: jsonb("mana_cost").$type<number[]>().default([]),
  cooldown: jsonb("cooldown").$type<number[]>().default([]),
  effects: jsonb("effects").$type<string[]>().default([]), // per-level descriptions
  belongsTo: jsonb("belongs_to").$type<string[]>().default([]), // hero or unit gameIds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
