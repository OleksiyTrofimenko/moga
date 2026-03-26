import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const itemDefinitions = pgTable("item_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  goldCost: integer("gold_cost").notNull().default(0),
  level: integer("level").notNull().default(1),
  category: varchar("category", { length: 30 }).notNull(), // permanent, charged, powerup, artifact, purchasable
  effects: jsonb("effects").$type<Record<string, unknown>>().default({}),
  dropsFrom: jsonb("drops_from").$type<number[]>().default([]), // creep camp levels
  soldAt: jsonb("sold_at").$type<string[]>().default([]), // neutral building gameIds
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
