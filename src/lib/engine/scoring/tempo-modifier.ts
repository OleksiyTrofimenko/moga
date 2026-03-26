/**
 * Tempo modifier: tier advantage, hero level advantage, upgrade advantage, power spikes.
 */

import type { PlayerSnapshot } from "../types";

/**
 * Calculate tempo modifier for a player relative to their opponent.
 * Returns a multiplier (typically 0.9 - 1.35).
 */
export function calculateTempoModifier(
  player: PlayerSnapshot,
  opponent: PlayerSnapshot
): number {
  let modifier = 1.0;

  // Tier advantage: +10% per tier ahead
  const tierDiff = player.tier - opponent.tier;
  if (tierDiff > 0) {
    modifier += 0.10 * tierDiff;
  }

  // Hero level advantage: +8% if highest hero is 2+ levels ahead
  const playerMaxHeroLevel = Math.max(
    0,
    ...player.heroes.map((h) => h.level)
  );
  const opponentMaxHeroLevel = Math.max(
    0,
    ...opponent.heroes.map((h) => h.level)
  );
  const heroLevelDiff = playerMaxHeroLevel - opponentMaxHeroLevel;
  if (heroLevelDiff >= 2) {
    modifier += 0.08;
  }

  // Upgrade advantage: +5% per completed upgrade level ahead
  const playerUpgradeLevels = player.upgrades.reduce(
    (sum, u) => sum + u.currentLevel,
    0
  );
  const opponentUpgradeLevels = opponent.upgrades.reduce(
    (sum, u) => sum + u.currentLevel,
    0
  );
  const upgradeDiff = playerUpgradeLevels - opponentUpgradeLevels;
  if (upgradeDiff > 0) {
    modifier += 0.05 * Math.min(upgradeDiff, 3); // Cap at +15%
  }

  // Power spike: +12% if hero has ultimate (level 6+)
  const hasUltimate = player.heroes.some((h) => h.level >= 6);
  const opponentHasUltimate = opponent.heroes.some((h) => h.level >= 6);
  if (hasUltimate && !opponentHasUltimate) {
    modifier += 0.12;
  }

  return modifier;
}
