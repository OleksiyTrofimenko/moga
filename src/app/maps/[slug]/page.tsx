import { db } from "@/lib/db";
import { maps, mapCreepCamps, creepCamps, creepDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function campLevelColor(level: number): string {
  if (level <= 2) return "text-green-400";
  if (level <= 4) return "text-yellow-400";
  if (level <= 5) return "text-orange-400";
  return "text-red-400";
}

function campLevelBg(level: number): string {
  if (level <= 2) return "bg-green-900/20 border-green-800/50";
  if (level <= 4) return "bg-yellow-900/20 border-yellow-800/50";
  if (level <= 5) return "bg-orange-900/20 border-orange-800/50";
  return "bg-red-900/20 border-red-800/50";
}

export default async function MapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [mapRow] = await db
    .select()
    .from(maps)
    .where(eq(maps.slug, slug))
    .limit(1);

  if (!mapRow) notFound();

  // Load all camps for this map
  const campLinks = await db
    .select()
    .from(mapCreepCamps)
    .where(eq(mapCreepCamps.mapId, mapRow.id));

  // Load all creep definitions for name lookups
  const creepDefs = await db.select().from(creepDefinitions);
  const creepDefMap = new Map(creepDefs.map((c) => [c.gameId, c]));

  const campData = await Promise.all(
    campLinks.map(async (link) => {
      const [camp] = await db
        .select()
        .from(creepCamps)
        .where(eq(creepCamps.id, link.campId));
      return camp ? { ...link, camp } : null;
    })
  );

  const validCamps = campData.filter(Boolean) as NonNullable<
    (typeof campData)[number]
  >[];

  // Sort by level descending
  validCamps.sort((a, b) => b.camp.level - a.camp.level);

  const totalXp = validCamps.reduce((s, c) => s + c.camp.xpTotal, 0);
  const totalGold = validCamps.reduce((s, c) => s + c.camp.goldTotal, 0);

  // Level distribution
  const levelCounts: Record<string, number> = {};
  for (const c of validCamps) {
    const bucket =
      c.camp.level <= 2
        ? "Green (1-2)"
        : c.camp.level <= 4
          ? "Yellow (3-4)"
          : c.camp.level <= 5
            ? "Orange (5)"
            : "Red (6+)";
    levelCounts[bucket] = (levelCounts[bucket] ?? 0) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/maps"
        className="text-zinc-400 hover:text-white text-sm mb-4 inline-block"
      >
        &larr; Back to Maps
      </Link>

      {/* Map Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{mapRow.name}</h1>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <span>{mapRow.playerCount} players</span>
          <span>{validCamps.length} creep camps</span>
          <span>{totalXp} total XP</span>
          <span>{totalGold} total gold</span>
        </div>

        {/* Level distribution */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          {Object.entries(levelCounts).map(([label, count]) => (
            <span
              key={label}
              className={
                label.startsWith("Green")
                  ? "text-green-400"
                  : label.startsWith("Yellow")
                    ? "text-yellow-400"
                    : label.startsWith("Orange")
                      ? "text-orange-400"
                      : "text-red-400"
              }
            >
              {label}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Camp List */}
      <div className="space-y-3">
        {validCamps.map((campLink, i) => {
          const camp = campLink.camp;
          return (
            <div
              key={i}
              className={`border rounded-lg p-4 ${campLevelBg(camp.level)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${campLevelColor(camp.level)}`}
                  >
                    Lv {camp.level}
                  </span>
                  {campLink.label && (
                    <span className="text-sm text-zinc-400">
                      {campLink.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{camp.xpTotal} XP</span>
                  <span>{camp.goldTotal} gold</span>
                  {camp.itemDropLevel > 0 && (
                    <span className="text-purple-400">
                      Drop Level {camp.itemDropLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Creep composition */}
              <div className="flex flex-wrap gap-2">
                {camp.creeps.map((creep, j) => {
                  const def = creepDefMap.get(creep.gameId);
                  return (
                    <div
                      key={j}
                      className="bg-zinc-800/50 rounded px-2 py-1 text-xs"
                    >
                      <span className="text-zinc-300">
                        {creep.count > 1 && `${creep.count}x `}
                        {def?.name ?? creep.gameId}
                      </span>
                      {def && (
                        <span className="text-zinc-500 ml-1">
                          (Lv{def.level}, {def.hp}hp)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Position */}
              {campLink.posX != null && campLink.posY != null && (
                <div className="text-xs text-zinc-600 mt-2">
                  Position: ({Math.round(campLink.posX)},{" "}
                  {Math.round(campLink.posY)})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
