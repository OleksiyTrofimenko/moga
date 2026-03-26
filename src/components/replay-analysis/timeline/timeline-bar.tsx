"use client";

import type { GamePhase } from "@/lib/engine/types";

interface PhaseSegment {
  phase: GamePhase;
  startMs: number;
  endMs: number;
}

const PHASE_COLORS: Record<GamePhase, string> = {
  opening: "bg-zinc-700",
  early: "bg-blue-900",
  early_mid: "bg-blue-700",
  mid: "bg-yellow-700",
  mid_late: "bg-orange-700",
  late: "bg-red-800",
};

const PHASE_LABELS: Record<GamePhase, string> = {
  opening: "Opening",
  early: "Early",
  early_mid: "Early-Mid",
  mid: "Mid",
  mid_late: "Mid-Late",
  late: "Late",
};

interface TimelineBarProps {
  durationMs: number;
  currentMs: number;
  phases: PhaseSegment[];
  onSeek: (ms: number) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TimelineBar({
  durationMs,
  currentMs,
  phases,
  onSeek,
}: TimelineBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    onSeek(Math.round(pct * durationMs));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return; // Only if mouse button held
    handleClick(e);
  };

  const cursorPct = durationMs > 0 ? (currentMs / durationMs) * 100 : 0;

  // Find current phase
  const currentPhase = phases.find(
    (p) => currentMs >= p.startMs && currentMs < p.endMs
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{formatTime(currentMs)}</span>
        <span className="text-zinc-500">
          {currentPhase ? PHASE_LABELS[currentPhase.phase] : ""}
        </span>
        <span>{formatTime(durationMs)}</span>
      </div>
      <div
        className="relative h-6 rounded cursor-pointer overflow-hidden flex"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      >
        {/* Phase segments */}
        {phases.map((phase, i) => {
          const widthPct =
            durationMs > 0
              ? ((phase.endMs - phase.startMs) / durationMs) * 100
              : 0;
          return (
            <div
              key={i}
              className={`${PHASE_COLORS[phase.phase]} h-full relative group`}
              style={{ width: `${widthPct}%` }}
              title={`${PHASE_LABELS[phase.phase]} (${formatTime(phase.startMs)} - ${formatTime(phase.endMs)})`}
            />
          );
        })}

        {/* Cursor */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.5)] z-10 pointer-events-none"
          style={{ left: `${cursorPct}%` }}
        />
      </div>
    </div>
  );
}
