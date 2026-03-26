/**
 * Builds per-player production summaries from final game state.
 */

import type { GameState } from "../state/game-state";
import type { ProductionSummary } from "../types";

export function buildGameSummary(gameState: GameState): ProductionSummary[] {
  return [
    gameState.player1.getProductionSummary(),
    gameState.player2.getProductionSummary(),
  ];
}
