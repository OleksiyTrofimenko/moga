"use client";

import { useState } from "react";
import type { MapCampInfo } from "@/lib/engine/definitions-cache";

interface MapCampsPanelProps {
  mapName: string;
  mapSlug: string;
  camps: MapCampInfo[];
}

function campLevelColor(level: number): string {
  if (level <= 2) return "text-green-400";
  if (level <= 4) return "text-yellow-400";
  if (level <= 5) return "text-orange-400";
  return "text-red-400";
}

function campLevelBg(level: number): string {
  if (level <= 2) return "bg-green-900/30 border-green-800";
  if (level <= 4) return "bg-yellow-900/30 border-yellow-800";
  if (level <= 5) return "bg-orange-900/30 border-orange-800";
  return "bg-red-900/30 border-red-800";
}

export function MapCampsPanel({ mapName, mapSlug, camps }: MapCampsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (camps.length === 0) return null;

  const totalXp = camps.reduce((sum, c) => sum + c.camp.xpTotal, 0);
  const totalGold = camps.reduce((sum, c) => sum + c.camp.goldTotal, 0);

  // Sort camps by level descending
  const sortedCamps = [...camps].sort(
    (a, b) => b.camp.level - a.camp.level
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-white">Map Creep Camps</h3>
          <span className="text-xs text-zinc-500">
            <a
              href={`/maps/${mapSlug}`}
              className="hover:text-zinc-300"
              onClick={(e) => e.stopPropagation()}
            >
              {mapName}
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>{camps.length} camps</span>
          <span>{totalXp} XP</span>
          <span>{totalGold} gold</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 6l4 4 4-4H4z" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-800 p-4">
          <div className="grid gap-2">
            {sortedCamps.map((campInfo, i) => (
              <div
                key={i}
                className={`border rounded p-3 ${campLevelBg(campInfo.camp.level)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${campLevelColor(campInfo.camp.level)}`}
                    >
                      Lv {campInfo.camp.level}
                    </span>
                    {campInfo.label && (
                      <span className="text-xs text-zinc-400">
                        {campInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{campInfo.camp.xpTotal} XP</span>
                    <span>{campInfo.camp.goldTotal} gold</span>
                    {campInfo.camp.itemDropLevel > 0 && (
                      <span className="text-purple-400">
                        Drop Lv {campInfo.camp.itemDropLevel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-zinc-300">
                  {campInfo.camp.creeps
                    .map(
                      (c) =>
                        `${c.count > 1 ? `${c.count}x ` : ""}${campInfo.camp.name.includes(c.gameId) ? "" : c.gameId}`
                    )
                    .filter(Boolean)
                    .join(", ") || campInfo.camp.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
