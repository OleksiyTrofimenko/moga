/**
 * Wraps two PlayerStates. Routes events by playerId.
 */

import { PlayerState } from "./player-state";
import type { DefinitionsCache } from "../definitions-cache";
import type { NormalizedEvent } from "@/lib/parser/domain/types";

export class GameState {
  readonly player1: PlayerState;
  readonly player2: PlayerState;
  private playerMap: Map<number, PlayerState>;

  constructor(
    player1Info: { id: number; name: string; race: string },
    player2Info: { id: number; name: string; race: string },
    defs: DefinitionsCache
  ) {
    this.player1 = new PlayerState(
      player1Info.id,
      player1Info.name,
      player1Info.race,
      defs
    );
    this.player2 = new PlayerState(
      player2Info.id,
      player2Info.name,
      player2Info.race,
      defs
    );

    this.playerMap = new Map([
      [player1Info.id, this.player1],
      [player2Info.id, this.player2],
    ]);
  }

  processEvent(event: NormalizedEvent): void {
    const player = this.playerMap.get(event.playerId);
    if (player) {
      player.processEvent(event);
    }
  }

  tick(timestampMs: number): void {
    this.player1.tick(timestampMs);
    this.player2.tick(timestampMs);
  }
}
