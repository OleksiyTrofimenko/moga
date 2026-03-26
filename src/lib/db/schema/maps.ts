import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { creepCamps } from "./creeps";

export const maps = pgTable("maps", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  playerCount: integer("player_count").notNull().default(2),
  w3xFileName: varchar("w3x_file_name", { length: 255 }),
  aliases: jsonb("aliases").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mapCreepCamps = pgTable("map_creep_camps", {
  id: serial("id").primaryKey(),
  mapId: integer("map_id")
    .references(() => maps.id, { onDelete: "cascade" })
    .notNull(),
  campId: integer("camp_id")
    .references(() => creepCamps.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar("label", { length: 100 }),
  posX: real("pos_x"),
  posY: real("pos_y"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
