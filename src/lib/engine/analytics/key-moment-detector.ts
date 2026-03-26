/**
 * Identifies significant events: tier-ups, hero milestones, expansions, power spikes.
 */

import { TIER_BUILDINGS } from "../constants";
import type { KeyMoment, PlayerSnapshot } from "../types";
import type { NormalizedEvent } from "@/lib/parser/domain/types";
import type { DefinitionsCache } from "../definitions-cache";

/**
 * Detect key moments from a single event, given current state.
 */
export function detectKeyMoments(
  event: NormalizedEvent,
  player: PlayerSnapshot,
  opponent: PlayerSnapshot,
  defs: DefinitionsCache
): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const payload = event.payload;
  const gameId = (payload.itemId as string) ?? (payload.gameId as string) ?? "";

  switch (event.type) {
    case "BUILDING_STARTED": {
      // Tier-up detection
      const tierLevel = TIER_BUILDINGS[gameId];
      if (tierLevel && tierLevel > 1) {
        moments.push({
          timestampMs: event.timestampMs,
          type: "tier_up",
          playerId: event.playerId,
          description: `${player.playerName} starts Tier ${tierLevel}`,
          significance: tierLevel === 3 ? 8 : 6,
          data: { gameId, tier: tierLevel },
        });
      }

      // Expansion detection (building a second T1 town hall)
      if (TIER_BUILDINGS[gameId] === 1) {
        // Count tier-1 town halls (starting TH counts as 1, in-progress new one also counted)
        const t1TownHallCount = player.buildings
          .filter((b) => TIER_BUILDINGS[b.gameId] === 1)
          .reduce((sum, b) => sum + b.count, 0);
        // Only flag expansion if total > 1 (starting TH + new one = real expansion)
        if (t1TownHallCount > 1) {
          moments.push({
            timestampMs: event.timestampMs,
            type: "expansion",
            playerId: event.playerId,
            description: `${player.playerName} expands`,
            significance: 7,
            data: { gameId },
          });
        }
      }
      break;
    }

    case "HERO_TRAINED": {
      // First hero is notable, check if player has heroes already
      const isRevive = player.heroes.some((h) => h.gameId === gameId);
      if (isRevive) {
        moments.push({
          timestampMs: event.timestampMs,
          type: "hero_death",
          playerId: event.playerId,
          description: `${player.playerName}'s hero dies and revives`,
          significance: 7,
          data: { gameId },
        });
      }
      break;
    }

    case "UPGRADE_STARTED": {
      const upgDef = defs.upgrades.get(gameId);
      if (upgDef) {
        moments.push({
          timestampMs: event.timestampMs,
          type: "tech_upgrade",
          playerId: event.playerId,
          description: `${player.playerName} researches ${upgDef.name}`,
          significance: 4,
          data: { gameId, name: upgDef.name },
        });
      }
      break;
    }
  }

  return moments;
}

/**
 * Detect hero level milestone moments by comparing snapshots.
 */
export function detectHeroLevelMilestones(
  player: PlayerSnapshot,
  prevHeroLevels: Map<string, number>,
  timestampMs: number
): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const milestoneLevels = [3, 5, 6];

  for (const hero of player.heroes) {
    const prevLevel = prevHeroLevels.get(hero.gameId) ?? 0;
    for (const ml of milestoneLevels) {
      if (prevLevel < ml && hero.level >= ml) {
        moments.push({
          timestampMs,
          type: "hero_level",
          playerId: player.playerId,
          description: `${player.playerName}'s ${hero.name} reaches level ${ml}${ml === 6 ? " (Ultimate)" : ""}`,
          significance: ml === 6 ? 9 : ml === 5 ? 7 : 5,
          data: { heroGameId: hero.gameId, level: ml },
        });
      }
    }
  }

  return moments;
}
