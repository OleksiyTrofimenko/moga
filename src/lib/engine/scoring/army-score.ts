/**
 * Composes all scoring components into final army comparison.
 */

import { calculateUnitScore } from "./unit-score";
import { calculateHeroScore } from "./hero-score";
import { calculateItemScore } from "./item-score";
import { calculateUpgradeScore } from "./upgrade-score";
import { calculateMatchupModifier } from "./matchup-modifier";
import { calculateTempoModifier } from "./tempo-modifier";
import type { PlayerSnapshot, ArmyScore, ArmyComparison } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

function scorePlayer(
  player: PlayerSnapshot,
  opponent: PlayerSnapshot,
  defs: DefinitionsCache
): ArmyScore {
  const unitScore = calculateUnitScore(player.units, defs);
  const heroScore = calculateHeroScore(player.heroes);
  const itemScore = calculateItemScore(player.heroes, defs);
  const upgradeScore = calculateUpgradeScore(player.upgrades, player.units, defs);

  const absoluteScore = unitScore + heroScore + itemScore + upgradeScore;

  const matchupModifier = calculateMatchupModifier(player.units, opponent.units, defs);
  const tempoModifier = calculateTempoModifier(player, opponent);

  const matchupScore = Math.round(absoluteScore * matchupModifier * tempoModifier);

  // Attack confidence: how likely this player wins an engagement (0-100)
  const attackConfidence = Math.min(
    100,
    Math.max(0, Math.round(50 + (matchupModifier - 1) * 100 + (tempoModifier - 1) * 80))
  );

  return {
    absoluteScore,
    matchupScore,
    attackConfidence,
    unitScore,
    heroScore,
    itemScore,
    upgradeScore,
    matchupModifier: Math.round(matchupModifier * 100) / 100,
    tempoModifier: Math.round(tempoModifier * 100) / 100,
  };
}

export function compareArmies(
  player1: PlayerSnapshot,
  player2: PlayerSnapshot,
  defs: DefinitionsCache
): ArmyComparison {
  const player1Score = scorePlayer(player1, player2, defs);
  const player2Score = scorePlayer(player2, player1, defs);

  const ratio =
    player2Score.matchupScore > 0
      ? player1Score.matchupScore / player2Score.matchupScore
      : player1Score.matchupScore > 0
        ? 999
        : 1;

  // Do-not-fight warning: if one side has overwhelming advantage
  const doNotFight = ratio < 0.6 || ratio > 1.67;
  const doNotFightReason = doNotFight
    ? ratio < 0.6
      ? `${player2.playerName} has significant army advantage`
      : `${player1.playerName} has significant army advantage`
    : undefined;

  return {
    player1Score,
    player2Score,
    ratio: Math.round(ratio * 100) / 100,
    doNotFight,
    doNotFightReason,
  };
}
