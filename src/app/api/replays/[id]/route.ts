import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { replays, replayEvents } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const replay = await db.select().from(replays).where(eq(replays.id, id)).limit(1);

  if (replay.length === 0) {
    return NextResponse.json({ error: "Replay not found" }, { status: 404 });
  }

  const events = await db
    .select()
    .from(replayEvents)
    .where(eq(replayEvents.replayId, id))
    .orderBy(asc(replayEvents.timestampMs));

  return NextResponse.json({
    ...replay[0],
    events,
  });
}
