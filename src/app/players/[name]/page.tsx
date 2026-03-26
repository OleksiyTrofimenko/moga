import { notFound } from "next/navigation";
import { getPlayerStats } from "@/lib/players/queries";
import { RaceBadge } from "@/components/ui/race-badge";
import { MatchupSection } from "@/components/players/matchup-section";
import { RecentGameRow } from "@/components/players/recent-game-row";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return { title: `${decoded} — WC3 Helper` };
}

export default async function PlayerStatsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const data = await getPlayerStats(decoded);

  if (!data) notFound();

  const { overview, matchups, recentGames } = data;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Overview header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">
            {overview.playerName}
          </h1>
          <RaceBadge race={overview.mostPlayedRace} short={false} />
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>{overview.totalGames} games</span>
          <span>
            {overview.wins}W {overview.losses}L
          </span>
          <span>{Math.round(overview.winRate * 100)}% win rate</span>
        </div>
        {Object.keys(overview.raceCounts).length > 1 && (
          <div className="flex items-center gap-2 mt-2">
            {Object.entries(overview.raceCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([race, count]) => (
                <span
                  key={race}
                  className="flex items-center gap-1 text-sm text-zinc-500"
                >
                  <RaceBadge race={race} />
                  <span>{count}</span>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Matchup sections */}
      {matchups.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Matchups</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {matchups.map((m) => (
              <MatchupSection key={m.opponentRace} matchup={m} />
            ))}
          </div>
        </section>
      )}

      {/* Recent games */}
      {recentGames.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Games
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
            {recentGames.map((game) => (
              <RecentGameRow key={game.replayId} game={game} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
