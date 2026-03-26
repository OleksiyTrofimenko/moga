CREATE TABLE "map_creep_camps" (
	"id" serial PRIMARY KEY NOT NULL,
	"map_id" integer NOT NULL,
	"camp_id" integer NOT NULL,
	"label" varchar(100),
	"pos_x" real,
	"pos_y" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"player_count" integer DEFAULT 2 NOT NULL,
	"w3x_file_name" varchar(255),
	"aliases" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "maps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "map_creep_camps" ADD CONSTRAINT "map_creep_camps_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_creep_camps" ADD CONSTRAINT "map_creep_camps_camp_id_creep_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."creep_camps"("id") ON DELETE cascade ON UPDATE no action;