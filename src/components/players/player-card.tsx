import Link from "next/link";
import { RaceBadge } from "@/components/ui/race-badge";
import type { PlayerListEntry } from "@/lib/players/types";

export function PlayerCard({ player }: { player: PlayerListEntry }) {
  return (
    <Link
      href={`/players/${encodeURIComponent(player.name)}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-lg">{player.name}</span>
        <RaceBadge race={player.mostPlayedRace} short={false} />
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-400">
        <span>{player.gamesPlayed} games</span>
        <span>{Math.round(player.winRate * 100)}% win rate</span>
      </div>
    </Link>
  );
}
