"use client";

import type { UnitCount } from "@/lib/engine/types";

interface ArmyPanelProps {
  units: UnitCount[];
  currentSupply: number;
  maxSupply: number;
}

export function ArmyPanel({ units, currentSupply, maxSupply }: ArmyPanelProps) {
  // Filter out workers for display, sort by supply cost desc
  const armyUnits = units
    .filter((u) => u.count > 0)
    .sort((a, b) => b.supply - a.supply);

  if (armyUnits.length === 0) {
    return (
      <div className="text-zinc-500 text-sm italic">No units</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-zinc-400">Army Composition</span>
        <span className="text-xs font-mono text-zinc-300">
          {currentSupply}/{maxSupply} supply
        </span>
      </div>
      <div className="space-y-0.5">
        {armyUnits.map((unit) => (
          <div
            key={unit.gameId}
            className="flex items-center justify-between text-sm py-0.5"
          >
            <span className="text-zinc-300">
              {unit.name}
              {unit.isEstimated && (
                <span className="text-zinc-600 text-xs ml-0.5">~</span>
              )}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-400">
                x{unit.count}
              </span>
              <span className="text-zinc-500 w-8 text-right">
                {unit.supply}s
              </span>
              <span className="text-yellow-600 w-12 text-right">
                {unit.goldCost * unit.count}g
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
