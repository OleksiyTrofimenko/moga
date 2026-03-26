import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { attackTypeEnum, armorTypeEnum } from "./enums";

export const creepDefinitions = pgTable("creep_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  level: integer("level").notNull(),
  hp: integer("hp").notNull(),
  mana: integer("mana"),
  armor: integer("armor").notNull(),
  armorType: armorTypeEnum("armor_type").notNull(),
  damageMin: integer("damage_min").notNull(),
  damageMax: integer("damage_max").notNull(),
  attackType: attackTypeEnum("attack_type").notNull(),
  abilities: jsonb("abilities").$type<string[]>().default([]),
  xpBounty: integer("xp_bounty").notNull(),
  goldBounty: integer("gold_bounty").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export interface CreepCampMember {
  gameId: string;
  count: number;
}

export const creepCamps = pgTable("creep_camps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  level: integer("level").notNull(),
  creeps: jsonb("creeps").$type<CreepCampMember[]>().notNull(),
  itemDropLevel: integer("item_drop_level").notNull(),
  xpTotal: integer("xp_total").notNull(),
  goldTotal: integer("gold_total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
