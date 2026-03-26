/**
 * Re-analyzes all replays that are parsed but not analyzed (or all if --force).
 * Usage: npx tsx src/lib/db/seed/reanalyze.ts [--force]
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { eq, asc, and, or, isNull } from "drizzle-orm";
import * as schema from "../schema";
import { analyzeReplay } from "../../engine/snapshot-generator";
import { loadDefinitions } from "../../engine/definitions-cache";
import type { NormalizedEvent } from "../../parser/domain/types";
import type { ReplayMetadata, PlayerInfo } from "../../parser/domain/types";

dotenv.config({ path: ".env.local" });

async function reanalyze() {
  const force = process.argv.includes("--force");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Loading definitions...");
  const defs = await loadDefinitions(db);
  console.log(
    `  Loaded: ${defs.units.size} units, ${defs.heroes.size} heroes, ${defs.buildings.size} buildings, ${defs.upgrades.size} upgrades, ${defs.items.size} items`
  );

  // Find replays to analyze
  const condition = force
    ? eq(schema.replays.parseStatus, "completed")
    : and(
        eq(schema.replays.parseStatus, "completed"),
        or(
          isNull(schema.replays.analysisStatus),
          eq(schema.replays.analysisStatus, "pending"),
          eq(schema.replays.analysisStatus, "failed")
        )
      );

  const replaysToAnalyze = await db
    .select()
    .from(schema.replays)
    .where(condition);

  console.log(`Found ${replaysToAnalyze.length} replays to analyze${force ? " (force mode)" : ""}.`);

  for (const replay of replaysToAnalyze) {
    console.log(`\nAnalyzing: ${replay.originalFileName} (${replay.id})`);

    try {
      // Load events
      const events = await db
        .select()
        .from(schema.replayEvents)
        .where(eq(schema.replayEvents.replayId, replay.id))
        .orderBy(asc(schema.replayEvents.timestampMs));

      if (events.length === 0) {
        console.log("  No events found, skipping.");
        continue;
      }

      // Build metadata from replay record
      const metadata: ReplayMetadata = {
        gameVersion: replay.gameVersion ?? 0,
        buildNumber: replay.buildNumber ?? 0,
        isExpansion: replay.replayVersion === "W3XP",
        durationMs: replay.durationMs ?? 0,
        isMultiplayer: true,
        mapName: replay.mapName ?? "",
        mapPath: "",
        gameName: "",
        players: [
          {
            id: events.find((e) => e.playerId > 0)?.playerId ?? 1,
            name: replay.player1Name ?? "Player 1",
            race: (replay.player1Race ?? "human") as PlayerInfo["race"],
            teamNumber: 0,
            color: 0,
            isComputer: false,
            handicap: 100,
            slot: 0,
          },
          {
            id: (() => {
              const playerIds = new Set(events.map((e) => e.playerId).filter((id) => id > 0));
              const ids = [...playerIds];
              return ids.length > 1 ? ids[1] : 2;
            })(),
            name: replay.player2Name ?? "Player 2",
            race: (replay.player2Race ?? "orc") as PlayerInfo["race"],
            teamNumber: 1,
            color: 1,
            isComputer: false,
            handicap: 100,
            slot: 1,
          },
        ],
        randomSeed: 0,
      };

      // Convert DB events to NormalizedEvents
      const normalizedEvents: NormalizedEvent[] = events.map((e) => ({
        type: e.eventType as NormalizedEvent["type"],
        timestampMs: e.timestampMs,
        playerId: e.playerId,
        payload: (e.payload ?? {}) as Record<string, unknown>,
        isInferred: e.isInferred,
      }));

      // Run analysis
      const result = analyzeReplay(normalizedEvents, metadata, defs);

      // Clear old data if force mode
      if (force) {
        await db.delete(schema.replaySnapshots).where(eq(schema.replaySnapshots.replayId, replay.id));
        await db.delete(schema.replayAnalyses).where(eq(schema.replayAnalyses.replayId, replay.id));
      }

      // Store analysis
      await db
        .insert(schema.replayAnalyses)
        .values({
          replayId: replay.id,
          analysisStatus: "completed",
          snapshotCount: result.snapshots.length,
          snapshotIntervalMs: result.analysis.snapshotIntervalMs,
          gameSummary: result.analysis.gameSummary,
          keyMoments: result.analysis.keyMoments,
        })
        .onConflictDoNothing();

      // Store snapshots in batches
      if (result.snapshots.length > 0) {
        const snapshotValues = result.snapshots.map((s) => ({
          replayId: replay.id,
          timestampMs: s.timestampMs,
          gamePhase: s.gamePhase,
          player1State: s.player1State,
          player2State: s.player2State,
          armyComparison: s.armyComparison,
          uncertaintyFlags: s.uncertaintyFlags,
        }));

        const BATCH_SIZE = 50;
        for (let i = 0; i < snapshotValues.length; i += BATCH_SIZE) {
          await db.insert(schema.replaySnapshots).values(snapshotValues.slice(i, i + BATCH_SIZE));
        }
      }

      // Update replay
      await db
        .update(schema.replays)
        .set({ analysisStatus: "completed" })
        .where(eq(schema.replays.id, replay.id));

      console.log(
        `  Done: ${result.snapshots.length} snapshots, ${result.analysis.keyMoments.length} key moments`
      );
    } catch (err) {
      console.error(`  Failed:`, err instanceof Error ? err.message : err);
      await db
        .update(schema.replays)
        .set({ analysisStatus: "failed" })
        .where(eq(schema.replays.id, replay.id));
    }
  }

  console.log("\nRe-analysis complete.");
  await pool.end();
}

reanalyze().catch((err) => {
  console.error("Re-analysis failed:", err);
  process.exit(1);
});
