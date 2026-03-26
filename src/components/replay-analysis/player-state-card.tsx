"use client";

import type { PlayerSnapshot } from "@/lib/engine/types";
import { HeroPanel } from "./panels/hero-panel";
import { ArmyPanel } from "./panels/army-panel";
import { EconomyPanel } from "./panels/economy-panel";

const RACE_COLORS: Record<string, string> = {
  human: "border-blue-600",
  orc: "border-red-600",
  night_elf: "border-green-600",
  undead: "border-purple-600",
};

const RACE_BADGES: Record<string, string> = {
  human: "bg-blue-900 text-blue-300",
  orc: "bg-red-900 text-red-300",
  night_elf: "bg-green-900 text-green-300",
  undead: "bg-purple-900 text-purple-300",
};

interface PlayerStateCardProps {
  player: PlayerSnapshot;
}

export function PlayerStateCard({ player }: PlayerStateCardProps) {
  const borderColor = RACE_COLORS[player.race] ?? "border-zinc-600";
  const badgeClass = RACE_BADGES[player.race] ?? "bg-zinc-800 text-zinc-300";

  return (
    <div
      className={`bg-zinc-900 border ${borderColor} rounded-lg p-4 space-y-4`}
    >
      {/* Player header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold">{player.playerName}</h3>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${badgeClass}`}
          >
            {player.race}
          </span>
        </div>
        <span className="text-zinc-400 text-sm">Tier {player.tier}</span>
      </div>

      {/* Heroes */}
      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
          Heroes
        </h4>
        <HeroPanel heroes={player.heroes} />
      </div>

      {/* Army */}
      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
          Army
        </h4>
        <ArmyPanel
          units={player.units}
          currentSupply={player.currentSupply}
          maxSupply={player.maxSupply}
        />
      </div>

      {/* Economy */}
      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
          Economy
        </h4>
        <EconomyPanel economy={player.economy} />
      </div>
    </div>
  );
}
