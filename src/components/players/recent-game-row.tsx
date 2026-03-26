import Link from "next/link";
import { RaceBadge } from "@/components/ui/race-badge";
import type { RecentGame } from "@/lib/players/types";

function formatDuration(ms: number | null): string {
  if (!ms) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function ResultBadge({ won }: { won: boolean | null }) {
  if (won === null) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
        —
      </span>
    );
  }
  return won ? (
    <span className="text-xs px-2 py-0.5 rounded bg-green-800 text-green-200 font-medium">
      W
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded bg-red-800 text-red-200 font-medium">
      L
    </span>
  );
}

export function RecentGameRow({ game }: { game: RecentGame }) {
  return (
    <Link
      href={`/replays/${game.replayId}`}
      className="flex items-center gap-4 py-2 px-3 rounded hover:bg-zinc-800/50 transition-colors"
    >
      <ResultBadge won={game.won} />
      <div className="flex items-center gap-1.5 min-w-0">
        <RaceBadge race={game.opponentRace} />
        <span className="text-zinc-300 truncate">{game.opponentName}</span>
      </div>
      <span className="text-zinc-500 text-sm ml-auto shrink-0">
        {game.mapName || "Unknown Map"}
      </span>
      <span className="text-zinc-500 text-sm shrink-0">
        {formatDuration(game.durationMs)}
      </span>
      <span className="text-zinc-600 text-sm shrink-0">
        {game.createdAt.toLocaleDateString()}
      </span>
    </Link>
  );
}
