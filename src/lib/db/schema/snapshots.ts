import {
  pgTable,
  serial,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { gamePhaseEnum } from "./enums";
import { replays } from "./replays";
import type { PlayerSnapshot, ArmyComparison, UncertaintyFlags } from "@/lib/engine/types";

export const replaySnapshots = pgTable("replay_snapshots", {
  id: serial("id").primaryKey(),
  replayId: uuid("replay_id")
    .references(() => replays.id, { onDelete: "cascade" })
    .notNull(),
  timestampMs: integer("timestamp_ms").notNull(),
  gamePhase: gamePhaseEnum("game_phase").notNull(),
  player1State: jsonb("player1_state").$type<PlayerSnapshot>().notNull(),
  player2State: jsonb("player2_state").$type<PlayerSnapshot>().notNull(),
  armyComparison: jsonb("army_comparison").$type<ArmyComparison>().notNull(),
  uncertaintyFlags: jsonb("uncertainty_flags").$type<UncertaintyFlags>().notNull(),
});
