import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  text,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { raceEnum, parseStatusEnum, analysisStatusEnum } from "./enums";

export const replays = pgTable("replays", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size").notNull(),
  replayVersion: varchar("replay_version", { length: 10 }), // "WAR3" or "W3XP"
  gameVersion: integer("game_version"),
  buildNumber: integer("build_number"),
  durationMs: integer("duration_ms"),
  mapName: varchar("map_name", { length: 255 }),
  player1Name: varchar("player1_name", { length: 100 }),
  player1Race: raceEnum("player1_race"),
  player2Name: varchar("player2_name", { length: 100 }),
  player2Race: raceEnum("player2_race"),
  winner: varchar("winner", { length: 100 }),
  parseStatus: parseStatusEnum("parse_status").notNull().default("pending"),
  parseError: text("parse_error"),
  analysisStatus: analysisStatusEnum("analysis_status").default("pending"),
  parsedAt: timestamp("parsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const replayEvents = pgTable("replay_events", {
  id: serial("id").primaryKey(),
  replayId: uuid("replay_id")
    .references(() => replays.id, { onDelete: "cascade" })
    .notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  timestampMs: integer("timestamp_ms").notNull(),
  playerId: integer("player_id").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  isInferred: boolean("is_inferred").notNull().default(false),
  confidence: real("confidence"),
});
