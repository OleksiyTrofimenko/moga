import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  replays,
  replayEvents,
  replaySnapshots,
  replayAnalyses,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeReplay, loadDefinitions } from "@/lib/engine";
import { parseReplay } from "@/lib/parser";
import { LocalStorage } from "@/lib/storage/local";
import type { ReplayMetadata, PlayerInfo } from "@/lib/parser/domain/types";

const STORAGE_PATH = process.env.STORAGE_PATH || "./storage/replays";
const storage = new LocalStorage(STORAGE_PATH);

/** Strip invalid Unicode chars from event payloads before storing as JSONB. */
function sanitizePayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const json = JSON.stringify(payload);
  const clean = json
    .replace(/\\u0000/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  try {
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Find replay
    const [replay] = await db
      .select()
      .from(replays)
      .where(eq(replays.id, id))
      .limit(1);

    if (!replay) {
      return NextResponse.json({ error: "Replay not found" }, { status: 404 });
    }

    if (!replay.filePath) {
      return NextResponse.json(
        { error: "Replay file not found on disk" },
        { status: 400 }
      );
    }

    // Mark as analyzing
    await db
      .update(replays)
      .set({ analysisStatus: "analyzing" })
      .where(eq(replays.id, id));

    // Re-parse the .w3g file from storage (picks up normalizer improvements)
    const buffer = await storage.read(replay.filePath);
    const parseResult = parseReplay(buffer);

    // Clear old events, snapshots, and analyses
    await db.delete(replayEvents).where(eq(replayEvents.replayId, id));
    await db.delete(replaySnapshots).where(eq(replaySnapshots.replayId, id));
    await db.delete(replayAnalyses).where(eq(replayAnalyses.replayId, id));

    // Insert freshly parsed events
    const eventValues = parseResult.events.map((event) => ({
      replayId: id,
      eventType: event.type,
      timestampMs: event.timestampMs,
      playerId: event.playerId,
      payload: sanitizePayload(event.payload),
      isInferred: event.isInferred,
      confidence: null as number | null,
    }));

    if (eventValues.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < eventValues.length; i += BATCH_SIZE) {
        await db.insert(replayEvents).values(eventValues.slice(i, i + BATCH_SIZE));
      }
    }

    // Build metadata for analysis
    const p1 = parseResult.metadata.players[0];
    const p2 = parseResult.metadata.players[1];
    const metadata: ReplayMetadata = parseResult.metadata;

    // If metadata players are missing race info, fall back to stored replay data
    if (!p1 && replay.player1Name) {
      metadata.players[0] = {
        id: 1,
        name: replay.player1Name,
        race: (replay.player1Race ?? "human") as PlayerInfo["race"],
        teamNumber: 0,
        color: 0,
        isComputer: false,
        handicap: 100,
        slot: 0,
      };
    }
    if (!p2 && replay.player2Name) {
      metadata.players[1] = {
        id: 2,
        name: replay.player2Name,
        race: (replay.player2Race ?? "orc") as PlayerInfo["race"],
        teamNumber: 1,
        color: 1,
        isComputer: false,
        handicap: 100,
        slot: 1,
      };
    }

    // Load definitions and run analysis on fresh events
    const defs = await loadDefinitions();
    const result = analyzeReplay(parseResult.events, metadata, defs);

    // Store new analysis
    await db.insert(replayAnalyses).values({
      replayId: id,
      analysisStatus: "completed",
      snapshotCount: result.snapshots.length,
      snapshotIntervalMs: result.analysis.snapshotIntervalMs,
      gameSummary: result.analysis.gameSummary,
      keyMoments: result.analysis.keyMoments,
    });

    // Store snapshots in batches
    if (result.snapshots.length > 0) {
      const snapshotValues = result.snapshots.map((s) => ({
        replayId: id,
        timestampMs: s.timestampMs,
        gamePhase: s.gamePhase,
        player1State: s.player1State,
        player2State: s.player2State,
        armyComparison: s.armyComparison,
        uncertaintyFlags: s.uncertaintyFlags,
      }));

      const BATCH_SIZE = 50;
      for (let i = 0; i < snapshotValues.length; i += BATCH_SIZE) {
        await db
          .insert(replaySnapshots)
          .values(snapshotValues.slice(i, i + BATCH_SIZE));
      }
    }

    // Update replay status
    await db
      .update(replays)
      .set({
        parseStatus: "completed",
        analysisStatus: "completed",
        parsedAt: new Date(),
      })
      .where(eq(replays.id, id));

    return NextResponse.json({
      status: "completed",
      eventCount: eventValues.length,
      snapshotCount: result.snapshots.length,
      keyMomentCount: result.analysis.keyMoments.length,
    });
  } catch (err) {
    console.error("Re-analysis error for replay", id, ":", err);

    // Mark as failed
    await db
      .update(replays)
      .set({ analysisStatus: "failed" })
      .where(eq(replays.id, id));

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown analysis error",
      },
      { status: 500 }
    );
  }
}
