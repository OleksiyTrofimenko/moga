import { db } from "@/lib/db";
import { maps, mapCreepCamps, creepCamps } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MapsPage() {
  const allMaps = await db.select().from(maps).orderBy(asc(maps.name));

  // Get camp counts and totals for each map
  const mapData = await Promise.all(
    allMaps.map(async (map) => {
      const campLinks = await db
        .select()
        .from(mapCreepCamps)
        .where(eq(mapCreepCamps.mapId, map.id));

      let totalXp = 0;
      let totalGold = 0;
      let campCount = 0;

      for (const link of campLinks) {
        const [camp] = await db
          .select()
          .from(creepCamps)
          .where(eq(creepCamps.id, link.campId));
        if (camp) {
          totalXp += camp.xpTotal;
          totalGold += camp.goldTotal;
          campCount++;
        }
      }

      return {
        ...map,
        campCount,
        totalXp,
        totalGold,
      };
    })
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Maps</h1>

      {mapData.length === 0 ? (
        <div className="text-zinc-500 text-center py-12">
          No maps seeded yet. Run{" "}
          <code className="text-zinc-400">npm run db:seed-maps</code> to
          populate map data.
        </div>
      ) : (
        <div className="grid gap-3">
          {mapData.map((map) => (
            <Link
              key={map.id}
              href={`/maps/${map.slug}`}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-medium">{map.name}</h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    {map.playerCount} players
                    {map.w3xFileName && (
                      <span className="ml-2 text-zinc-600">
                        {map.w3xFileName}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{map.campCount} camps</span>
                  <span>{map.totalXp} XP</span>
                  <span>{map.totalGold} gold</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
