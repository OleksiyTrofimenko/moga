import type { ProductionSummary, HeroTimelineEntry } from "@/lib/engine/types";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatGold(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const HERO_EVENT_COLORS: Record<string, string> = {
  trained: "text-orange-400",
  level_up: "text-yellow-400",
  ability_learned: "text-blue-400",
  item_acquired: "text-purple-400",
  died: "text-red-400",
  revived: "text-green-400",
};

function PlayerSummaryCard({ summary }: { summary: ProductionSummary }) {
  const sortedUnits = [...summary.unitsProduced].sort((a, b) => b.totalGold - a.totalGold);
  const sortedLosses = [...summary.unitsLost].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300">
        {summary.playerName}{" "}
        <span className="text-zinc-500 font-normal">({summary.race})</span>
      </h3>

      {/* Economy overview */}
      <div>
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Economy
        </h4>
        <div className="flex gap-4 text-xs">
          <span>
            <span className="text-yellow-500">{formatGold(summary.totalGoldSpent)}</span>
            <span className="text-zinc-600"> gold spent</span>
          </span>
          <span>
            <span className="text-green-500">{formatGold(summary.totalLumberSpent)}</span>
            <span className="text-zinc-600"> lumber spent</span>
          </span>
        </div>
      </div>

      {/* Units produced */}
      {sortedUnits.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Units Produced
          </h4>
          <div className="space-y-0.5 text-xs font-mono">
            {sortedUnits.map((u) => (
              <div key={u.gameId} className="flex justify-between">
                <span className="text-zinc-300">
                  {u.name} <span className="text-zinc-600">×{u.count}</span>
                </span>
                <span className="text-zinc-500">
                  <span className="text-yellow-700">{u.totalGold}g</span>
                  {u.totalLumber > 0 && (
                    <span className="text-green-800 ml-1">{u.totalLumber}w</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Units lost */}
      {sortedLosses.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Units Lost
          </h4>
          <div className="space-y-0.5 text-xs font-mono">
            {sortedLosses.map((u) => (
              <div key={u.gameId} className="flex justify-between">
                <span className="text-red-400/70">{u.name}</span>
                <span className="text-red-500/70">×{u.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buildings */}
      {summary.buildingsBuilt.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Buildings
          </h4>
          <div className="space-y-0.5 text-xs font-mono">
            {summary.buildingsBuilt.map((b) => (
              <div key={b.gameId} className="flex justify-between">
                <span className="text-zinc-300">
                  {b.name} <span className="text-zinc-600">×{b.count}</span>
                </span>
                <span className="text-zinc-500">
                  <span className="text-yellow-700">{b.totalGold}g</span>
                  {b.totalLumber > 0 && (
                    <span className="text-green-800 ml-1">{b.totalLumber}w</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrades */}
      {summary.upgradesCompleted.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Upgrades
          </h4>
          <div className="space-y-0.5 text-xs font-mono">
            {summary.upgradesCompleted.map((u, i) => (
              <div key={`${u.gameId}-${i}`} className="flex justify-between">
                <span className="text-blue-400">
                  {u.name} <span className="text-zinc-600">Lv{u.level}</span>
                </span>
                <span className="text-zinc-600">{formatTime(u.completedAtMs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Timeline */}
      {summary.heroTimeline.length > 0 && (
        <HeroTimeline entries={summary.heroTimeline} />
      )}
    </div>
  );
}

function HeroTimeline({ entries }: { entries: HeroTimelineEntry[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
        Hero Timeline
      </h4>
      <div className="space-y-0.5 text-xs font-mono max-h-[200px] overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-zinc-600 w-10 text-right shrink-0">
              {formatTime(entry.timestampMs)}
            </span>
            <span className={HERO_EVENT_COLORS[entry.event] ?? "text-zinc-400"}>
              {entry.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GameSummaryPanelProps {
  playerSummaries: ProductionSummary[];
}

export function GameSummaryPanel({ playerSummaries }: GameSummaryPanelProps) {
  if (playerSummaries.length < 2) {
    return <div className="text-zinc-500 text-center py-8">No game summary data available</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <PlayerSummaryCard summary={playerSummaries[0]} />
      <PlayerSummaryCard summary={playerSummaries[1]} />
    </div>
  );
}
