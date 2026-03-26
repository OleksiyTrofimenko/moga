/**
 * Multi-signal game phase classifier.
 * Checks time, tier, hero level, supply, expansions.
 */

import type { GamePhase, PlayerSnapshot } from "../types";

/**
 * Classify the current game phase based on multiple signals from both players.
 */
export function classifyGamePhase(
  timestampMs: number,
  player1: PlayerSnapshot,
  player2: PlayerSnapshot
): GamePhase {
  const timeMin = timestampMs / 60000;
  const maxTier = Math.max(player1.tier, player2.tier);
  const maxHeroLevel = Math.max(
    ...player1.heroes.map((h) => h.level),
    ...player2.heroes.map((h) => h.level),
    0
  );
  const maxSupply = Math.max(player1.currentSupply, player2.currentSupply);

  // Late game: tier 3 + high supply or long game
  if (
    (maxTier >= 3 && maxSupply >= 70) ||
    timeMin >= 25
  ) {
    return "late";
  }

  // Mid-late: tier 3 or high supply
  if (
    maxTier >= 3 ||
    (maxSupply >= 60 && timeMin >= 15) ||
    timeMin >= 20
  ) {
    return "mid_late";
  }

  // Mid: tier 2 tech established + army
  if (
    (maxTier >= 2 && maxSupply >= 40) ||
    (maxHeroLevel >= 5 && maxTier >= 2) ||
    timeMin >= 12
  ) {
    return "mid";
  }

  // Early-mid: tier 2 started or moderate army
  if (
    maxTier >= 2 ||
    maxSupply >= 30 ||
    maxHeroLevel >= 3 ||
    timeMin >= 6
  ) {
    return "early_mid";
  }

  // Early: hero out, first units
  if (
    maxHeroLevel >= 1 ||
    maxSupply >= 15 ||
    timeMin >= 2
  ) {
    return "early";
  }

  // Opening: first 2 minutes
  return "opening";
}
