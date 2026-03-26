"use client";

import type { ArmyComparison } from "@/lib/engine/types";

interface ArmyScorePanelProps {
  comparison: ArmyComparison;
  player1Name: string;
  player2Name: string;
}

export function ArmyScorePanel({
  comparison,
  player1Name,
  player2Name,
}: ArmyScorePanelProps) {
  const { player1Score, player2Score, ratio, doNotFight, doNotFightReason } =
    comparison;

  const totalScore = player1Score.matchupScore + player2Score.matchupScore;
  const p1Pct = totalScore > 0 ? (player1Score.matchupScore / totalScore) * 100 : 50;

  return (
    <div className="space-y-3">
      {/* Score comparison bar */}
      <div>
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>
            {player1Name}: {player1Score.matchupScore}
          </span>
          <span>
            {player2Score.matchupScore}: {player2Name}
          </span>
        </div>
        <div className="flex h-3 rounded overflow-hidden gap-px">
          <div
            className="bg-blue-500 rounded-l transition-all duration-200"
            style={{ width: `${p1Pct}%` }}
          />
          <div
            className="bg-red-500 rounded-r transition-all duration-200"
            style={{ width: `${100 - p1Pct}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <ScoreRow label="Units" v1={player1Score.unitScore} v2={player2Score.unitScore} />
        <ScoreRow label="Heroes" v1={player1Score.heroScore} v2={player2Score.heroScore} />
        <ScoreRow label="Items" v1={player1Score.itemScore} v2={player2Score.itemScore} />
        <ScoreRow label="Upgrades" v1={player1Score.upgradeScore} v2={player2Score.upgradeScore} />
      </div>

      {/* Modifiers */}
      <div className="flex justify-between text-xs text-zinc-500">
        <span>
          Matchup: {player1Score.matchupModifier}x | Tempo:{" "}
          {player1Score.tempoModifier}x
        </span>
        <span>
          {player2Score.matchupModifier}x | {player2Score.tempoModifier}x
        </span>
      </div>

      {/* Do not fight warning */}
      {doNotFight && doNotFightReason && (
        <div className="text-xs text-red-400 bg-red-900/20 rounded px-2 py-1 border border-red-800/30">
          {doNotFightReason}
        </div>
      )}
    </div>
  );
}

function ScoreRow({
  label,
  v1,
  v2,
}: {
  label: string;
  v1: number;
  v2: number;
}) {
  return (
    <>
      <div className="flex justify-between text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-300 font-mono">{v1}</span>
      </div>
      <div className="flex justify-between text-zinc-400">
        <span className="text-zinc-300 font-mono">{v2}</span>
        <span>{label}</span>
      </div>
    </>
  );
}
