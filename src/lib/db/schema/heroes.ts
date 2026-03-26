import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { raceEnum, attackTypeEnum, armorTypeEnum, primaryAttributeEnum } from "./enums";

export interface HeroAbilitySlot {
  gameId: string;
  name: string;
  isUltimate: boolean;
}

export const heroDefinitions = pgTable("hero_definitions", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id", { length: 8 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  race: raceEnum("race").notNull(),
  primaryAttribute: primaryAttributeEnum("primary_attribute").notNull(),
  strBase: real("str_base").notNull(),
  strGain: real("str_gain").notNull(),
  agiBase: real("agi_base").notNull(),
  agiGain: real("agi_gain").notNull(),
  intBase: real("int_base").notNull(),
  intGain: real("int_gain").notNull(),
  hp: integer("hp").notNull(),
  mana: integer("mana").notNull(),
  armor: integer("armor").notNull(),
  armorType: armorTypeEnum("armor_type").notNull(),
  damageMin: integer("damage_min").notNull(),
  damageMax: integer("damage_max").notNull(),
  attackType: attackTypeEnum("attack_type").notNull(),
  attackCooldown: real("attack_cooldown").notNull(),
  range: integer("range").notNull(),
  moveSpeed: integer("move_speed").notNull(),
  abilities: jsonb("abilities").$type<HeroAbilitySlot[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
