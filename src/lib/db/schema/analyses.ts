import {
  pgTable,
  serial,
  uuid,
  integer,
  jsonb,
  text,
} from "drizzle-orm/pg-core";
import { analysisStatusEnum } from "./enums";
import { replays } from "./replays";
import type { GameSummary, KeyMoment } from "@/lib/engine/types";

export const replayAnalyses = pgTable("replay_analyses", {
  id: serial("id").primaryKey(),
  replayId: uuid("replay_id")
    .references(() => replays.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  analysisStatus: analysisStatusEnum("analysis_status").notNull().default("pending"),
  snapshotCount: integer("snapshot_count").notNull().default(0),
  snapshotIntervalMs: integer("snapshot_interval_ms").notNull().default(3000),
  gameSummary: jsonb("game_summary").$type<GameSummary>(),
  keyMoments: jsonb("key_moments").$type<KeyMoment[]>().default([]),
  analysisError: text("analysis_error"),
});
