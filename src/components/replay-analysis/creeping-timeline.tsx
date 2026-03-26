"use client";

import type { CreepingWindow } from "@/lib/engine/types";

interface CreepingTimelineProps {
  creepingWindows: CreepingWindow[];
  durationMs: number;
  player1Name: string;
  player2Name: string;
  player1Id: number;
  player2Id: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function CreepingTimeline({
  creepingWindows,
  durationMs,
  player1Name,
  player2Name,
  player1Id,
  player2Id,
}: CreepingTimelineProps) {
  if (creepingWindows.length === 0) return null;

  const p1Windows = creepingWindows.filter((w) => w.playerId === player1Id);
  const p2Windows = creepingWindows.filter((w) => w.playerId === player2Id);

  const p1TotalXp = p1Windows.reduce((s, w) => s + w.estimatedXpGained, 0);
  const p2TotalXp = p2Windows.reduce((s, w) => s + w.estimatedXpGained, 0);
  const p1Items = p1Windows.reduce((s, w) => s + w.itemsDropped.length, 0);
  const p2Items = p2Windows.reduce((s, w) => s + w.itemsDropped.length, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-white mb-3">Creeping Activity</h3>

      {/* Player 1 row */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-400">{player1Name}</span>
          <span className="text-xs text-zinc-500">
            {p1Windows.length} sessions, ~{p1TotalXp} XP, {p1Items} items
          </span>
        </div>
        <div className="relative h-4 bg-zinc-800 rounded overflow-hidden">
          {p1Windows.map((w, i) => {
            const left = (w.startMs / durationMs) * 100;
            const width = Math.max(
              ((w.endMs - w.startMs) / durationMs) * 100,
              0.5
            );
            return (
              <div
                key={i}
                className="absolute top-0 h-full bg-blue-600/60 border-l border-blue-400"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${formatTime(w.startMs)} - ${formatTime(w.endMs)}: ~${w.estimatedXpGained} XP, ${w.itemsDropped.length} items`}
              >
                {w.itemsDropped.length > 0 && (
                  <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Player 2 row */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-red-400">{player2Name}</span>
          <span className="text-xs text-zinc-500">
            {p2Windows.length} sessions, ~{p2TotalXp} XP, {p2Items} items
          </span>
        </div>
        <div className="relative h-4 bg-zinc-800 rounded overflow-hidden">
          {p2Windows.map((w, i) => {
            const left = (w.startMs / durationMs) * 100;
            const width = Math.max(
              ((w.endMs - w.startMs) / durationMs) * 100,
              0.5
            );
            return (
              <div
                key={i}
                className="absolute top-0 h-full bg-red-600/60 border-l border-red-400"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${formatTime(w.startMs)} - ${formatTime(w.endMs)}: ~${w.estimatedXpGained} XP, ${w.itemsDropped.length} items`}
              >
                {w.itemsDropped.length > 0 && (
                  <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
