/**
 * Orchestrator: walks events chronologically, maintains GameState,
 * emits snapshots at regular intervals.
 */

import { SNAPSHOT_INTERVAL_MS } from "./constants";
import { GameState } from "./state/game-state";
import { compareArmies } from "./scoring/army-score";
import { classifyGamePhase } from "./analytics/game-phase";
import { detectKeyMoments, detectHeroLevelMilestones } from "./analytics/key-moment-detector";
import { detectEngagements } from "./analytics/engagement-detector";
import { extractBuildOrders } from "./analytics/build-order-extractor";
import { buildGameSummary } from "./analytics/game-summary-builder";
import { CreepTracker } from "./analytics/creep-tracker";
import type {
  GameSnapshot,
  KeyMoment,
  GameSummary,
  GamePhase,
  AnalysisResult,
  UncertaintyFlags,
} from "./types";
import type { DefinitionsCache } from "./definitions-cache";
import type { NormalizedEvent } from "@/lib/parser/domain/types";
import type { ReplayMetadata } from "@/lib/parser/domain/types";

interface PlayerMeta {
  id: number;
  name: string;
  race: string;
}

/**
 * Run the full analysis pipeline on parsed replay events.
 */
export function analyzeReplay(
  events: NormalizedEvent[],
  metadata: ReplayMetadata,
  defs: DefinitionsCache
): AnalysisResult {
  const p1 = metadata.players[0];
  const p2 = metadata.players[1];

  if (!p1 || !p2) {
    throw new Error("Analysis requires exactly 2 players");
  }

  const player1Meta: PlayerMeta = { id: p1.id, name: p1.name, race: p1.race };
  const player2Meta: PlayerMeta = { id: p2.id, name: p2.name, race: p2.race };

  const gameState = new GameState(player1Meta, player2Meta, defs);

  // Filter to game-relevant events and sort by timestamp
  const gameEvents = events
    .filter(
      (e) =>
        e.type !== "GAME_START" &&
        e.type !== "PLAYER_INFO" &&
        e.type !== "GAME_END"
    )
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const snapshots: GameSnapshot[] = [];
  const allKeyMoments: KeyMoment[] = [];

  // Track previous hero levels for milestone detection
  let prevP1HeroLevels = new Map<string, number>();
  let prevP2HeroLevels = new Map<string, number>();

  // Track phases for summary
  const phaseTransitions: { phase: GamePhase; startMs: number }[] = [];
  let currentPhase: GamePhase | null = null;

  let nextSnapshotMs = SNAPSHOT_INTERVAL_MS;
  let eventIdx = 0;

  // Walk through time, processing events as we go
  const durationMs = metadata.durationMs;
  const endMs = durationMs > 0 ? durationMs : (gameEvents[gameEvents.length - 1]?.timestampMs ?? 0);

  // Pre-compute engagement windows for death tracking
  const engagementWindows = detectEngagements(events);
  let engagementIdx = 0;

  // Creep tracking
  const creepTracker = new CreepTracker(engagementWindows, defs);

  for (let t = 0; t <= endMs; t += SNAPSHOT_INTERVAL_MS) {
    // Process all events up to this timestamp
    while (eventIdx < gameEvents.length && gameEvents[eventIdx].timestampMs <= t) {
      const event = gameEvents[eventIdx];
      gameState.processEvent(event);

      // Detect key moments from this event
      const p1Snap = gameState.player1.snapshot(event.timestampMs);
      const p2Snap = gameState.player2.snapshot(event.timestampMs);
      const player = event.playerId === player1Meta.id ? p1Snap : p2Snap;
      const opponent = event.playerId === player1Meta.id ? p2Snap : p1Snap;

      const moments = detectKeyMoments(event, player, opponent, defs);
      allKeyMoments.push(...moments);

      // Feed event to creep tracker
      creepTracker.processEvent(event);

      eventIdx++;
    }

    // Apply engagement losses: when an engagement window ends, estimate unit losses
    while (
      engagementIdx < engagementWindows.length &&
      engagementWindows[engagementIdx].endMs <= t
    ) {
      const eng = engagementWindows[engagementIdx];
      // Use engagement intensity to estimate losses
      // Higher intensity = more losses. Scale: intensity 10 → ~25% loss, 30 → ~50%
      const baseLoss = Math.min(eng.intensity / 60, 0.5);

      // The weaker army loses more units
      const p1Snap = gameState.player1.snapshot(t);
      const p2Snap = gameState.player2.snapshot(t);
      const comparison = compareArmies(p1Snap, p2Snap, defs);

      if (comparison.ratio > 1) {
        // P1 stronger: P2 loses more, P1 loses less
        gameState.player2.units.applyEngagementLosses(baseLoss);
        gameState.player1.units.applyEngagementLosses(baseLoss * 0.4);
      } else if (comparison.ratio < 1) {
        // P2 stronger
        gameState.player1.units.applyEngagementLosses(baseLoss);
        gameState.player2.units.applyEngagementLosses(baseLoss * 0.4);
      } else {
        // Even — both lose equally
        gameState.player1.units.applyEngagementLosses(baseLoss * 0.7);
        gameState.player2.units.applyEngagementLosses(baseLoss * 0.7);
      }

      // Mark heroes as dead if detected in engagement
      for (const heroId of eng.heroDeaths) {
        gameState.player1.heroes.markHeroDead(heroId, eng.endMs);
        gameState.player2.heroes.markHeroDead(heroId, eng.endMs);
      }

      engagementIdx++;
    }

    // Advance time-dependent state
    gameState.tick(t);

    // Tick creep tracker to close timed-out sessions
    creepTracker.tick(t);

    // Take snapshot
    const p1Snapshot = gameState.player1.snapshot(t);
    const p2Snapshot = gameState.player2.snapshot(t);
    const armyComparison = compareArmies(p1Snapshot, p2Snapshot, defs);
    const phase = classifyGamePhase(t, p1Snapshot, p2Snapshot);

    // Update game phase for hero XP estimation
    if (phase !== currentPhase) {
      phaseTransitions.push({ phase, startMs: t });
      currentPhase = phase;
      gameState.player1.setGamePhase(phase);
      gameState.player2.setGamePhase(phase);
    }

    // Detect hero level milestones
    const p1Milestones = detectHeroLevelMilestones(p1Snapshot, prevP1HeroLevels, t);
    const p2Milestones = detectHeroLevelMilestones(p2Snapshot, prevP2HeroLevels, t);
    allKeyMoments.push(...p1Milestones, ...p2Milestones);

    // Update previous hero levels
    prevP1HeroLevels = new Map(p1Snapshot.heroes.map((h) => [h.gameId, h.level]));
    prevP2HeroLevels = new Map(p2Snapshot.heroes.map((h) => [h.gameId, h.level]));

    // Dynamic uncertainty flags based on actual tracking capability
    const hasDeathTracking =
      gameState.player1.units.hasDeathData || gameState.player2.units.hasDeathData;
    const reasons: string[] = [];
    if (!hasDeathTracking) {
      reasons.push("Unit counts are optimistic (no deaths detected yet)");
    } else {
      reasons.push("Unit deaths estimated from engagement analysis");
    }
    reasons.push("Economy estimated from income/spending model");
    reasons.push("Hero levels estimated from phase-based XP model");

    const uncertaintyFlags: UncertaintyFlags = {
      unitCountsEstimated: !hasDeathTracking,
      economyEstimated: true,
      heroLevelsEstimated: true,
      reasons,
    };

    snapshots.push({
      timestampMs: t,
      gamePhase: phase,
      player1State: p1Snapshot,
      player2State: p2Snapshot,
      armyComparison,
      uncertaintyFlags,
    });

    nextSnapshotMs = t + SNAPSHOT_INTERVAL_MS;
  }

  // Add engagement key moments
  for (const engagement of engagementWindows) {
    allKeyMoments.push({
      timestampMs: engagement.startMs,
      type: "fight_detected",
      playerId: 0,
      description: `Fight detected (intensity: ${engagement.intensity})`,
      significance: Math.min(10, Math.round(engagement.intensity / 3)),
      data: { endMs: engagement.endMs, heroDeaths: engagement.heroDeaths },
    });
  }

  // Sort key moments by time
  allKeyMoments.sort((a, b) => a.timestampMs - b.timestampMs);

  // Build phase timeline
  const phases = phaseTransitions.map((pt, i) => ({
    phase: pt.phase,
    startMs: pt.startMs,
    endMs: i < phaseTransitions.length - 1 ? phaseTransitions[i + 1].startMs : endMs,
  }));

  const finalSnapshot = snapshots[snapshots.length - 1];

  // Extract build orders, game summary, and creeping windows
  const buildOrders = extractBuildOrders(events, metadata, defs);
  const playerSummaries = buildGameSummary(gameState);
  const creepingWindows = creepTracker.getCreepingWindows();

  const gameSummary: GameSummary = {
    durationMs: endMs,
    player1Race: player1Meta.race,
    player2Race: player2Meta.race,
    phases,
    totalEngagements: engagementWindows.length,
    keyMoments: allKeyMoments,
    finalScore: finalSnapshot?.armyComparison ?? {
      player1Score: { absoluteScore: 0, matchupScore: 0, attackConfidence: 50, unitScore: 0, heroScore: 0, itemScore: 0, upgradeScore: 0, matchupModifier: 1, tempoModifier: 1 },
      player2Score: { absoluteScore: 0, matchupScore: 0, attackConfidence: 50, unitScore: 0, heroScore: 0, itemScore: 0, upgradeScore: 0, matchupModifier: 1, tempoModifier: 1 },
      ratio: 1,
      doNotFight: false,
    },
    playerSummaries,
    buildOrders,
    creepingWindows,
  };

  return {
    snapshots,
    analysis: {
      status: "completed",
      snapshotCount: snapshots.length,
      snapshotIntervalMs: SNAPSHOT_INTERVAL_MS,
      gameSummary,
      keyMoments: allKeyMoments,
      buildOrders,
    },
  };
}
