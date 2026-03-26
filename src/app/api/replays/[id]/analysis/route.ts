import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { replays, replayAnalyses, replaySnapshots } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const replay = await db
    .select()
    .from(replays)
    .where(eq(replays.id, id))
    .limit(1);

  if (replay.length === 0) {
    return NextResponse.json({ error: "Replay not found" }, { status: 404 });
  }

  const analysis = await db
    .select()
    .from(replayAnalyses)
    .where(eq(replayAnalyses.replayId, id))
    .limit(1);

  if (analysis.length === 0) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }

  const snapshots = await db
    .select()
    .from(replaySnapshots)
    .where(eq(replaySnapshots.replayId, id))
    .orderBy(asc(replaySnapshots.timestampMs));

  return NextResponse.json({
    replay: replay[0],
    analysis: analysis[0],
    snapshots,
  });
}
