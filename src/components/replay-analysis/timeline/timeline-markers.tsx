"use client";

import type { KeyMoment, KeyMomentType } from "@/lib/engine/types";

const MARKER_COLORS: Record<KeyMomentType, string> = {
  hero_level: "bg-orange-400",
  hero_death: "bg-red-500",
  tier_up: "bg-yellow-400",
  expansion: "bg-green-400",
  fight_detected: "bg-red-400",
  power_spike: "bg-purple-400",
  tech_upgrade: "bg-blue-400",
};

interface TimelineMarkersProps {
  durationMs: number;
  keyMoments: KeyMoment[];
  onSeek: (ms: number) => void;
}

export function TimelineMarkers({
  durationMs,
  keyMoments,
  onSeek,
}: TimelineMarkersProps) {
  if (durationMs <= 0) return null;

  // Only show significant moments (significance >= 5)
  const significantMoments = keyMoments.filter((m) => m.significance >= 5);

  return (
    <div className="relative h-4">
      {significantMoments.map((moment, i) => {
        const leftPct = (moment.timestampMs / durationMs) * 100;
        const color = MARKER_COLORS[moment.type] ?? "bg-zinc-400";
        return (
          <button
            key={i}
            className={`absolute top-0.5 w-2.5 h-2.5 rounded-full ${color} hover:scale-150 transition-transform cursor-pointer border border-zinc-900`}
            style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
            title={`${moment.description} (${formatTime(moment.timestampMs)})`}
            onClick={() => onSeek(moment.timestampMs)}
          />
        );
      })}
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
