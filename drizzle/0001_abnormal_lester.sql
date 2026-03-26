CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'analyzing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."game_phase" AS ENUM('opening', 'early', 'early_mid', 'mid', 'mid_late', 'late');--> statement-breakpoint
CREATE TABLE "replay_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"replay_id" uuid NOT NULL,
	"timestamp_ms" integer NOT NULL,
	"game_phase" "game_phase" NOT NULL,
	"player1_state" jsonb NOT NULL,
	"player2_state" jsonb NOT NULL,
	"army_comparison" jsonb NOT NULL,
	"uncertainty_flags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "replay_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"replay_id" uuid NOT NULL,
	"analysis_status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"snapshot_count" integer DEFAULT 0 NOT NULL,
	"snapshot_interval_ms" integer DEFAULT 3000 NOT NULL,
	"game_summary" jsonb,
	"key_moments" jsonb DEFAULT '[]'::jsonb,
	"analysis_error" text,
	CONSTRAINT "replay_analyses_replay_id_unique" UNIQUE("replay_id")
);
--> statement-breakpoint
ALTER TABLE "replays" ADD COLUMN "analysis_status" "analysis_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "replay_snapshots" ADD CONSTRAINT "replay_snapshots_replay_id_replays_id_fk" FOREIGN KEY ("replay_id") REFERENCES "public"."replays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replay_analyses" ADD CONSTRAINT "replay_analyses_replay_id_replays_id_fk" FOREIGN KEY ("replay_id") REFERENCES "public"."replays"("id") ON DELETE cascade ON UPDATE no action;