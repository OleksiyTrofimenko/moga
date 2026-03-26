"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { GameSnapshot, KeyMoment, GamePhase, PlayerBuildOrder, ProductionSummary } from "@/lib/engine/types";
import { TimelineBar } from "./timeline/timeline-bar";
import { TimelineMarkers } from "./timeline/timeline-markers";
import {
  EventDensityBar,
  buildDensityBuckets,
} from "./timeline/event-density-bar";
import { ComparisonView } from "./comparison-view";
import { BuildOrderComparison } from "./panels/build-order-comparison";
import { GameSummaryPanel } from "./panels/game-summary-panel";

const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8] as const;

type Tab = "live" | "build_orders" | "game_summary";

interface ReplayAnalysisPageProps {
  replay: {
    id: string;
    player1Name: string | null;
    player2Name: string | null;
    player1Race: string | null;
    player2Race: string | null;
    durationMs: number | null;
    mapName: string | null;
  };
  snapshots: GameSnapshot[];
  keyMoments: KeyMoment[];
  phases: { phase: GamePhase; startMs: number; endMs: number }[];
  eventTimestamps: number[];
  buildOrders?: PlayerBuildOrder[];
  playerSummaries?: ProductionSummary[];
}

export function ReplayAnalysisPage({
  replay,
  snapshots,
  keyMoments,
  phases,
  eventTimestamps,
  buildOrders,
  playerSummaries,
}: ReplayAnalysisPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // Default 1x
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationMs = replay.durationMs ?? 0;

  const currentSnapshot = snapshots[currentIndex];
  const speed = PLAYBACK_SPEEDS[speedIndex];

  const densityBuckets = useMemo(
    () => buildDensityBuckets(eventTimestamps, durationMs),
    [eventTimestamps, durationMs]
  );

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 3000 / speed;
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, snapshots.length]);

  const handleSeek = useCallback(
    (ms: number) => {
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < snapshots.length; i++) {
        const dist = Math.abs(snapshots[i].timestampMs - ms);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setCurrentIndex(closest);
    },
    [snapshots]
  );

  const handlePlayPause = useCallback(() => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentIndex, snapshots.length]);

  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(snapshots.length - 1, prev + 1));
  }, [snapshots.length]);

  const handleSpeedCycle = useCallback(() => {
    setSpeedIndex((prev) => (prev + 1) % PLAYBACK_SPEEDS.length);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleStepBack();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleStepForward();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleStepBack, handleStepForward]);

  if (!currentSnapshot) {
    return (
      <div className="text-zinc-400 text-center py-12">
        No analysis data available
      </div>
    );
  }

  const tabs: { key: Tab; label: string; available: boolean }[] = [
    { key: "live", label: "Live View", available: true },
    { key: "build_orders", label: "Build Orders", available: !!buildOrders?.length },
    { key: "game_summary", label: "Game Summary", available: !!playerSummaries?.length },
  ];

  return (
    <div className="space-y-4">
      {/* Timeline section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
        <TimelineBar
          durationMs={durationMs}
          currentMs={currentSnapshot.timestampMs}
          phases={phases}
          onSeek={handleSeek}
        />
        <TimelineMarkers
          durationMs={durationMs}
          keyMoments={keyMoments}
          onSeek={handleSeek}
        />
        <EventDensityBar
          durationMs={durationMs}
          densityBuckets={densityBuckets}
        />

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Step back (Left arrow)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3v10h2V3H3zm3 5l8 5V3L6 8z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2h3v12H4V2zm5 0h3v12H9V2z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l10 6-10 6V2z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentIndex >= snapshots.length - 1}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Step forward (Right arrow)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 3v10h2V3h-2zm-1 5L2 3v10l8-5z" />
            </svg>
          </button>

          <button
            onClick={handleSpeedCycle}
            className="ml-3 px-2 py-1 rounded text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors min-w-[3rem]"
            title="Playback speed"
          >
            {speed}x
          </button>

          <span className="ml-3 text-xs text-zinc-500">
            {currentIndex + 1} / {snapshots.length}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-zinc-800">
        {tabs.filter((t) => t.available).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-white border-white"
                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "live" && (
        <ComparisonView
          player1={currentSnapshot.player1State}
          player2={currentSnapshot.player2State}
          armyComparison={currentSnapshot.armyComparison}
        />
      )}

      {activeTab === "build_orders" && buildOrders && (
        <BuildOrderComparison buildOrders={buildOrders} />
      )}

      {activeTab === "game_summary" && playerSummaries && (
        <GameSummaryPanel playerSummaries={playerSummaries} />
      )}
    </div>
  );
}
