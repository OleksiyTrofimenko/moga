"use client";

import type { EconomySnapshot } from "@/lib/engine/types";

interface EconomyPanelProps {
  economy: EconomySnapshot;
}

const UPKEEP_COLORS = {
  none: "text-green-400",
  low: "text-yellow-400",
  high: "text-red-400",
};

export function EconomyPanel({ economy }: EconomyPanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">Economy</span>
        {economy.isEstimated && (
          <span className="text-xs text-zinc-600 italic">estimated</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-yellow-500">Gold: </span>
          <span className="text-zinc-200 font-mono">
            {economy.goldEstimate}
          </span>
        </div>
        <div>
          <span className="text-green-600">Lumber: </span>
          <span className="text-zinc-200 font-mono">
            {economy.lumberEstimate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <div>Workers: {economy.workerCount}</div>
        <div>
          Mining: {economy.miningWorkers} / Lumber: {economy.lumberWorkers}
        </div>
        <div>
          Income:{" "}
          <span className="text-yellow-600">
            {economy.goldIncome.toFixed(1)}g/s
          </span>{" "}
          <span className="text-green-600">
            {economy.lumberIncome.toFixed(1)}l/s
          </span>
        </div>
        <div>
          Upkeep:{" "}
          <span className={UPKEEP_COLORS[economy.upkeepBracket]}>
            {economy.upkeepBracket}
          </span>
        </div>
      </div>

      <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-1">
        Total spent: {economy.totalGoldSpent}g / {economy.totalLumberSpent}l
      </div>
    </div>
  );
}
