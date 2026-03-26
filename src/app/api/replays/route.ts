import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { replays, replayEvents, replaySnapshots, replayAnalyses } from "@/lib/db/schema";
import { parseReplay, ReplayParseError } from "@/lib/parser";
import { analyzeReplay, loadDefinitions } from "@/lib/engine";
import { LocalStorage } from "@/lib/storage/local";
import { desc, eq } from "drizzle-orm";

const EXPECTED_SIGNATURE = "Warcraft III recorded game";

/** Strip invalid Unicode chars from event payloads before storing as JSONB.
 *  PostgreSQL JSONB rejects \u0000 and certain escape sequences. */
function sanitizePayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const json = JSON.stringify(payload);
  // Remove null bytes (\u0000) and other control chars that PostgreSQL JSONB rejects
  const clean = json.replace(/\\u0000/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  try {
    return JSON.parse(clean);
  } catch {
    return {};
  }
}
const MAX_SIZE_BYTES = (parseInt(process.env.MAX_REPLAY_SIZE_MB || "20") || 20) * 1024 * 1024;
const STORAGE_PATH = process.env.STORAGE_PATH || "./storage/replays";

const storage = new LocalStorage(STORAGE_PATH);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("replay") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate extension
    if (!file.name.toLowerCase().endsWith(".w3g")) {
      return NextResponse.json(
        { error: "Only .w3g replay files are supported" },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum ${MAX_SIZE_BYTES / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Read file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Quick signature check
    const sigCheck = buffer.toString("utf8", 0, 26);
    if (!sigCheck.startsWith(EXPECTED_SIGNATURE)) {
      return NextResponse.json(
        { error: "Invalid replay file: signature mismatch" },
        { status: 400 }
      );
    }

    // Save original file
    const filePath = await storage.save(file.name, buffer);

    // Attempt to parse
    let parseResult;
    let parseStatus: "completed" | "failed" = "completed";
    let parseError: string | null = null;

    try {
      parseResult = parseReplay(buffer);
    } catch (err) {
      parseStatus = "failed";
      parseError =
        err instanceof ReplayParseError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown parse error";
    }

    // Determine player races for the replays table
    const p1 = parseResult?.metadata.players[0];
    const p2 = parseResult?.metadata.players[1];

    // Insert replay record
    const [replay] = await db
      .insert(replays)
      .values({
        originalFileName: file.name,
        filePath,
        fileSize: buffer.length,
        replayVersion: parseResult?.metadata.isExpansion ? "W3XP" : "WAR3",
        gameVersion: parseResult?.metadata.gameVersion ?? null,
        buildNumber: parseResult?.metadata.buildNumber ?? null,
        durationMs: parseResult?.metadata.durationMs ?? null,
        mapName: parseResult?.metadata.mapName ?? null,
        player1Name: p1?.name ?? null,
        player1Race: p1?.race !== "unknown" ? p1?.race ?? null : null,
        player2Name: p2?.name ?? null,
        player2Race: p2?.race !== "unknown" ? p2?.race ?? null : null,
        parseStatus,
        parseError,
        parsedAt: parseStatus === "completed" ? new Date() : null,
      })
      .returning();

    // Insert normalized events if parsing succeeded
    let eventCount = 0;
    if (parseResult && parseStatus === "completed") {
      const eventValues = parseResult.events.map((event) => ({
        replayId: replay.id,
        eventType: event.type,
        timestampMs: event.timestampMs,
        playerId: event.playerId,
        payload: sanitizePayload(event.payload),
        isInferred: event.isInferred,
        confidence: null as number | null,
      }));

      if (eventValues.length > 0) {
        // Insert in batches of 100 to stay under PostgreSQL's parameter limit
        // (100 events × 7 columns = 700 params, well under the ~65535 limit)
        const BATCH_SIZE = 100;
        for (let i = 0; i < eventValues.length; i += BATCH_SIZE) {
          const batch = eventValues.slice(i, i + BATCH_SIZE);
          await db.insert(replayEvents).values(batch);
        }
        eventCount = eventValues.length;
      }
    }

    // Run analysis if parsing succeeded
    let analysisError: string | null = null;
    if (parseResult && parseStatus === "completed") {
      try {
        const defs = await loadDefinitions();
        const result = analyzeReplay(parseResult.events, parseResult.metadata, defs);

        // Store analysis record
        await db.insert(replayAnalyses).values({
          replayId: replay.id,
          analysisStatus: "completed",
          snapshotCount: result.snapshots.length,
          snapshotIntervalMs: result.analysis.snapshotIntervalMs,
          gameSummary: result.analysis.gameSummary,
          keyMoments: result.analysis.keyMoments,
        });

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
            const batch = snapshotValues.slice(i, i + BATCH_SIZE);
            await db.insert(replaySnapshots).values(batch);
          }
        }

        // Update replay analysis status
        await db
          .update(replays)
          .set({ analysisStatus: "completed" })
          .where(eq(replays.id, replay.id));
      } catch (err) {
        analysisError =
          err instanceof Error ? err.message : "Unknown analysis error";
        console.error("Analysis error for replay", replay.id, ":", analysisError);
        // Clean up partial analysis data so re-analysis can retry cleanly
        await db.delete(replaySnapshots).where(eq(replaySnapshots.replayId, replay.id));
        await db.delete(replayAnalyses).where(eq(replayAnalyses.replayId, replay.id));
        await db
          .update(replays)
          .set({ analysisStatus: "failed" })
          .where(eq(replays.id, replay.id));
      }
    }

    return NextResponse.json(
      {
        id: replay.id,
        parseStatus,
        parseError,
        analysisError,
        metadata: parseResult?.metadata ?? null,
        eventCount,
        diagnostics: parseResult?.diagnostics ?? null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Replay upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  const results = await db
    .select()
    .from(replays)
    .orderBy(desc(replays.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(results);
}
