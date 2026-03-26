CREATE TYPE "public"."armor_type" AS ENUM('light', 'medium', 'heavy', 'fortified', 'hero', 'unarmored', 'divine');--> statement-breakpoint
CREATE TYPE "public"."attack_type" AS ENUM('normal', 'pierce', 'siege', 'magic', 'chaos', 'hero', 'spells');--> statement-breakpoint
CREATE TYPE "public"."parse_status" AS ENUM('pending', 'parsing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."primary_attribute" AS ENUM('str', 'agi', 'int');--> statement-breakpoint
CREATE TYPE "public"."race" AS ENUM('human', 'orc', 'night_elf', 'undead', 'random');--> statement-breakpoint
CREATE TABLE "unit_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"race" "race" NOT NULL,
	"tier" integer NOT NULL,
	"gold_cost" integer NOT NULL,
	"lumber_cost" integer NOT NULL,
	"supply" integer NOT NULL,
	"build_time" integer NOT NULL,
	"hp" integer NOT NULL,
	"mana" integer,
	"armor" integer NOT NULL,
	"armor_type" "armor_type" NOT NULL,
	"damage_min" integer NOT NULL,
	"damage_max" integer NOT NULL,
	"attack_type" "attack_type" NOT NULL,
	"attack_cooldown" real NOT NULL,
	"range" integer NOT NULL,
	"move_speed" integer NOT NULL,
	"abilities" jsonb DEFAULT '[]'::jsonb,
	"upgrades" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unit_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "hero_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"race" "race" NOT NULL,
	"primary_attribute" "primary_attribute" NOT NULL,
	"str_base" real NOT NULL,
	"str_gain" real NOT NULL,
	"agi_base" real NOT NULL,
	"agi_gain" real NOT NULL,
	"int_base" real NOT NULL,
	"int_gain" real NOT NULL,
	"hp" integer NOT NULL,
	"mana" integer NOT NULL,
	"armor" integer NOT NULL,
	"armor_type" "armor_type" NOT NULL,
	"damage_min" integer NOT NULL,
	"damage_max" integer NOT NULL,
	"attack_type" "attack_type" NOT NULL,
	"attack_cooldown" real NOT NULL,
	"range" integer NOT NULL,
	"move_speed" integer NOT NULL,
	"abilities" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hero_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "building_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"race" "race" NOT NULL,
	"tier" integer NOT NULL,
	"gold_cost" integer NOT NULL,
	"lumber_cost" integer NOT NULL,
	"build_time" integer NOT NULL,
	"hp" integer NOT NULL,
	"armor" integer NOT NULL,
	"armor_type" "armor_type" NOT NULL,
	"produces_units" jsonb DEFAULT '[]'::jsonb,
	"produces_upgrades" jsonb DEFAULT '[]'::jsonb,
	"requires_buildings" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "building_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "item_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"gold_cost" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"category" varchar(30) NOT NULL,
	"effects" jsonb DEFAULT '{}'::jsonb,
	"drops_from" jsonb DEFAULT '[]'::jsonb,
	"sold_at" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "item_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "upgrade_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"race" "race" NOT NULL,
	"levels" integer NOT NULL,
	"gold_cost" jsonb NOT NULL,
	"lumber_cost" jsonb NOT NULL,
	"research_time" jsonb NOT NULL,
	"effects" jsonb DEFAULT '[]'::jsonb,
	"affects_units" jsonb DEFAULT '[]'::jsonb,
	"researched_at" varchar(8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "upgrade_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "ability_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"hero_ability" boolean DEFAULT false NOT NULL,
	"levels" integer DEFAULT 1 NOT NULL,
	"mana_cost" jsonb DEFAULT '[]'::jsonb,
	"cooldown" jsonb DEFAULT '[]'::jsonb,
	"effects" jsonb DEFAULT '[]'::jsonb,
	"belongs_to" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ability_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "creep_camps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"level" integer NOT NULL,
	"creeps" jsonb NOT NULL,
	"item_drop_level" integer NOT NULL,
	"xp_total" integer NOT NULL,
	"gold_total" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creep_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"level" integer NOT NULL,
	"hp" integer NOT NULL,
	"mana" integer,
	"armor" integer NOT NULL,
	"armor_type" "armor_type" NOT NULL,
	"damage_min" integer NOT NULL,
	"damage_max" integer NOT NULL,
	"attack_type" "attack_type" NOT NULL,
	"abilities" jsonb DEFAULT '[]'::jsonb,
	"xp_bounty" integer NOT NULL,
	"gold_bounty" integer NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creep_definitions_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "replay_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"replay_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"timestamp_ms" integer NOT NULL,
	"player_id" integer NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"is_inferred" boolean DEFAULT false NOT NULL,
	"confidence" real
);
--> statement-breakpoint
CREATE TABLE "replays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"replay_version" varchar(10),
	"game_version" integer,
	"build_number" integer,
	"duration_ms" integer,
	"map_name" varchar(255),
	"player1_name" varchar(100),
	"player1_race" "race",
	"player2_name" varchar(100),
	"player2_race" "race",
	"winner" varchar(100),
	"parse_status" "parse_status" DEFAULT 'pending' NOT NULL,
	"parse_error" text,
	"parsed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "replay_events" ADD CONSTRAINT "replay_events_replay_id_replays_id_fk" FOREIGN KEY ("replay_id") REFERENCES "public"."replays"("id") ON DELETE cascade ON UPDATE no action;