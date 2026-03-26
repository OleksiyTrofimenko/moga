"use client";

import type { HeroSnapshot } from "@/lib/engine/types";

interface HeroPanelProps {
  heroes: HeroSnapshot[];
}

export function HeroPanel({ heroes }: HeroPanelProps) {
  if (heroes.length === 0) {
    return (
      <div className="text-zinc-500 text-sm italic">No heroes yet</div>
    );
  }

  return (
    <div className="space-y-3">
      {heroes.map((hero) => (
        <div
          key={hero.gameId}
          className="bg-zinc-800/50 rounded p-3 border border-zinc-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-bold text-sm">
                {hero.name}
              </span>
              {!hero.alive && (
                <span className="text-red-400 text-xs">(Dead)</span>
              )}
            </div>
            <span className="text-yellow-400 text-sm font-mono">
              Lv {hero.level}
              {hero.isEstimated && (
                <span className="text-zinc-500 text-xs ml-1">~</span>
              )}
            </span>
          </div>

          {/* Abilities */}
          {hero.abilities && hero.abilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {hero.abilities.map((ability) => (
                <span
                  key={ability.gameId}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    ability.isUltimate
                      ? "bg-amber-900/50 text-amber-300"
                      : "bg-sky-900/40 text-sky-300"
                  }`}
                >
                  {ability.name} {ability.level > 1 ? `Lv ${ability.level}` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Item slots */}
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, i) => {
              const item = hero.items[i];
              return (
                <div
                  key={i}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    item
                      ? "bg-zinc-700 text-purple-300"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {item?.name ?? "Empty"}
                </div>
              );
            })}
          </div>

          {hero.reviveCount > 0 && (
            <div className="text-xs text-red-400/70 mt-1">
              Deaths: {hero.reviveCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
