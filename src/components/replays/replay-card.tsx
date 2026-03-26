"use client";

import Link from "next/link";
import { RaceBadge, RACE_COLORS, RACE_LABELS } from "@/components/ui/race-badge";

interface ReplayCardProps {
  id: string;
  player1Name: string | null;
  player1Race: string | null;
  player2Name: string | null;
  player2Race: string | null;
  mapName: string | null;
  durationMs: number | null;
  parseStatus: string;
  createdAt: string;
}

// Re-export for any consumers that may have imported from here
export { RACE_COLORS, RACE_LABELS, RaceBadge };

function formatDuration(ms: number | null): string {
  if (!ms) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-800 text-green-200",
    failed: "bg-red-800 text-red-200",
    pending: "bg-yellow-800 text-yellow-200",
    parsing: "bg-blue-800 text-blue-200",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || "bg-zinc-700 text-zinc-300"}`}>
      {status}
    </span>
  );
}

export function ReplayCard({
  id,
  player1Name,
  player1Race,
  player2Name,
  player2Race,
  mapName,
  durationMs,
  parseStatus,
  createdAt,
}: ReplayCardProps) {
  return (
    <Link
      href={`/replays/${id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <RaceBadge race={player1Race} />
            <a
              href={`/players/${encodeURIComponent(player1Name || "")}`}
              className="relative z-10 text-white font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {player1Name || "Player 1"}
            </a>
          </div>
          <span className="text-zinc-500">vs</span>
          <div className="flex items-center gap-1.5">
            <RaceBadge race={player2Race} />
            <a
              href={`/players/${encodeURIComponent(player2Name || "")}`}
              className="relative z-10 text-white font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {player2Name || "Player 2"}
            </a>
          </div>
        </div>
        <StatusBadge status={parseStatus} />
      </div>

      <div className="flex items-center gap-4 text-sm text-zinc-400">
        <span>{mapName || "Unknown Map"}</span>
        <span>{formatDuration(durationMs)}</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
