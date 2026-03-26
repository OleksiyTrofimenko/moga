import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body as { name?: string };

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Player name is required" }, { status: 400 });
  }

  const trimmed = name.trim();

  // Check if already tracked
  const existing = await db
    .select()
    .from(players)
    .where(eq(players.name, trimmed))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ player: existing[0] });
  }

  const [created] = await db
    .insert(players)
    .values({ name: trimmed })
    .returning();

  return NextResponse.json({ player: created }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Player name is required" }, { status: 400 });
  }

  await db.delete(players).where(eq(players.name, name));
  return NextResponse.json({ ok: true });
}
