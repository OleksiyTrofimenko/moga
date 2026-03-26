import { pgEnum } from "drizzle-orm/pg-core";

export const raceEnum = pgEnum("race", [
  "human",
  "orc",
  "night_elf",
  "undead",
  "random",
]);

export const attackTypeEnum = pgEnum("attack_type", [
  "normal",
  "pierce",
  "siege",
  "magic",
  "chaos",
  "hero",
  "spells",
]);

export const armorTypeEnum = pgEnum("armor_type", [
  "light",
  "medium",
  "heavy",
  "fortified",
  "hero",
  "unarmored",
  "divine",
]);

export const primaryAttributeEnum = pgEnum("primary_attribute", [
  "str",
  "agi",
  "int",
]);

export const parseStatusEnum = pgEnum("parse_status", [
  "pending",
  "parsing",
  "completed",
  "failed",
]);

export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "analyzing",
  "completed",
  "failed",
]);

export const gamePhaseEnum = pgEnum("game_phase", [
  "opening",
  "early",
  "early_mid",
  "mid",
  "mid_late",
  "late",
]);
