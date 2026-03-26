"use client";

import type { PlayerSnapshot, ArmyComparison } from "@/lib/engine/types";
import { PlayerStateCard } from "./player-state-card";
import { ArmyScorePanel } from "./panels/army-score-panel";

interface ComparisonViewProps {
  player1: PlayerSnapshot;
  player2: PlayerSnapshot;
  armyComparison: ArmyComparison;
}

export function ComparisonView({
  player1,
  player2,
  armyComparison,
}: ComparisonViewProps) {
  return (
    <div className="space-y-4">
      {/* Army score comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Army Strength
        </h3>
        <ArmyScorePanel
          comparison={armyComparison}
          player1Name={player1.playerName}
          player2Name={player2.playerName}
        />
      </div>

      {/* Side-by-side player states */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlayerStateCard player={player1} />
        <PlayerStateCard player={player2} />
      </div>
    </div>
  );
}
