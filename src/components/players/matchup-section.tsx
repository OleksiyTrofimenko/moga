import { RaceBadge } from "@/components/ui/race-badge";
import type { MatchupStats } from "@/lib/players/types";

export function MatchupSection({ matchup }: { matchup: MatchupStats }) {
  const winPct = Math.round(matchup.winRate * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-zinc-400 text-sm">vs</span>
        <RaceBadge race={matchup.opponentRace} short={false} />
        <span className="text-zinc-400 text-sm ml-auto">
          {matchup.wins}W {matchup.gamesPlayed - matchup.wins}L
        </span>
      </div>

      {/* Win rate bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-zinc-400">Win rate</span>
          <span className="text-white font-medium">{winPct}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all"
            style={{ width: `${winPct}%` }}
          />
        </div>
      </div>

      {/* Hero usage */}
      {matchup.heroUsage.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            Hero Picks
          </h4>
          <div className="space-y-1">
            {matchup.heroUsage.map((hero) => (
              <div
                key={hero.heroName}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-300">{hero.heroName}</span>
                <span className="text-zinc-500">
                  {hero.gamesUsed}/{hero.totalGames} games
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common openers */}
      {matchup.commonOpenings.length > 0 && (
        <div>
          <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            Common Openers
          </h4>
          <div className="space-y-2">
            {matchup.commonOpenings.map((opener, i) => (
              <div key={i} className="text-sm">
                <span className="text-zinc-500 mr-2">
                  ({opener.count}x)
                </span>
                <span className="text-zinc-400">
                  {opener.entries.join(" → ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
