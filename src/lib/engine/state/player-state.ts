/**
 * Composes all trackers into a single player state.
 * Processes events via processEvent(), advances time via tick(),
 * and produces PlayerSnapshot via snapshot().
 */

import { STARTING_STATE, WORKER_IDS, SUPPLY_BUILDINGS, TIER_BUILDINGS } from "../constants";
import { SupplyTracker } from "./supply-tracker";
import { EconomyTracker } from "./economy-tracker";
import { BuildingTracker } from "./building-tracker";
import { UnitTracker } from "./unit-tracker";
import { HeroTracker } from "./hero-tracker";
import { UpgradeTracker } from "./upgrade-tracker";
import type { PlayerSnapshot, ProductionSummary } from "../types";
import type { DefinitionsCache } from "../definitions-cache";
import type { NormalizedEvent } from "@/lib/parser/domain/types";

export class PlayerState {
  readonly playerId: number;
  readonly playerName: string;
  readonly race: string;

  readonly supply: SupplyTracker;
  readonly economy: EconomyTracker;
  readonly buildings: BuildingTracker;
  readonly units: UnitTracker;
  readonly heroes: HeroTracker;
  readonly upgrades: UpgradeTracker;

  private defs: DefinitionsCache;
  private lastTickMs = 0;

  constructor(
    playerId: number,
    playerName: string,
    race: string,
    defs: DefinitionsCache
  ) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.race = race;
    this.defs = defs;

    const start = STARTING_STATE[race] ?? STARTING_STATE.human;

    this.supply = new SupplyTracker(defs, start.supply, start.maxSupply);
    this.economy = new EconomyTracker(race);
    this.buildings = new BuildingTracker(defs, race, () => {
      // NE wisp consumed callback
      this.units.removeUnit(start.workerGameId);
      this.economy.removeWorker();
    });
    this.units = new UnitTracker(defs, [
      { gameId: start.workerGameId, count: start.workers },
    ]);
    this.heroes = new HeroTracker(defs);
    this.upgrades = new UpgradeTracker(defs);
  }

  processEvent(event: NormalizedEvent): void {
    const payload = event.payload;
    // Parser stores game IDs as "itemId" in event payloads
    const gameId = (payload.itemId as string) ?? (payload.gameId as string) ?? "";

    switch (event.type) {
      case "UNIT_TRAINED": {
        this.units.addUnit(gameId);
        this.supply.addUnit(gameId);

        // Track worker count for economy
        if (WORKER_IDS.has(gameId)) {
          this.economy.addWorker();
        }

        // Spend resources
        const unitDef = this.defs.units.get(gameId);
        if (unitDef) {
          this.economy.spend(unitDef.goldCost, unitDef.lumberCost);
        }
        break;
      }

      case "BUILDING_STARTED": {
        // Check if this is a tier-up upgrade before modifying buildings
        const tierLevel = TIER_BUILDINGS[gameId];
        const isTierUp = tierLevel !== undefined && tierLevel > 1;
        const oldTH = isTierUp ? this.buildings.getCurrentTownHall() : null;

        this.buildings.startBuilding(gameId, event.timestampMs);

        // Track supply buildings
        if (SUPPLY_BUILDINGS[gameId] !== undefined) {
          if (isTierUp && oldTH) {
            this.supply.upgradeBuilding(oldTH, gameId);
          } else {
            this.supply.addBuilding(gameId);
          }
        }

        // Spend resources
        const buildDef = this.defs.buildings.get(gameId);
        if (buildDef) {
          this.economy.spend(buildDef.goldCost, buildDef.lumberCost);
        }
        break;
      }

      case "HERO_TRAINED": {
        this.heroes.trainHero(gameId, event.timestampMs);
        this.supply.addHero();

        // Heroes cost gold to revive (increasing cost), first train is free resource-wise
        // but we charge altar + gold for revive
        const heroDef = this.defs.heroes.get(gameId);
        if (heroDef) {
          // Simplified: charge initial hero cost
          // Real cost depends on level for revives, but we don't track that precisely
        }
        break;
      }

      case "UPGRADE_STARTED": {
        this.upgrades.startUpgrade(gameId, event.timestampMs);

        // Spend resources
        const upgDef = this.defs.upgrades.get(gameId);
        if (upgDef) {
          const level = this.upgrades.getLevel(gameId);
          const goldCosts = upgDef.goldCost ?? [];
          const lumberCosts = upgDef.lumberCost ?? [];
          const goldCost = goldCosts[Math.min(level, goldCosts.length - 1)] ?? 0;
          const lumberCost = lumberCosts[Math.min(level, lumberCosts.length - 1)] ?? 0;
          this.economy.spend(goldCost, lumberCost);
        }
        break;
      }

      case "ITEM_USED": {
        const itemId = (payload.itemId as string) ?? "";
        if (itemId) {
          this.heroes.assignItem(itemId, event.timestampMs);
        }
        break;
      }

      case "ABILITY_USED": {
        // Check if this is a hero ability (skill point learning)
        if (gameId && this.defs.heroAbilityMap.has(gameId)) {
          this.heroes.learnAbility(gameId, event.timestampMs);
        }
        break;
      }

      case "BUILD_CANCELLED": {
        // BUILD_CANCELLED can fire for buildings OR queued units
        const buildDef = this.defs.buildings.get(gameId);
        const unitDef = this.defs.units.get(gameId);

        if (buildDef) {
          this.buildings.cancelBuilding(gameId);
          // Refund resources for cancelled building
          this.economy.spend(-buildDef.goldCost, -buildDef.lumberCost);
        } else if (unitDef) {
          this.units.cancelUnit(gameId);
          // Refund resources for cancelled unit
          this.economy.spend(-unitDef.goldCost, -unitDef.lumberCost);

          if (WORKER_IDS.has(gameId)) {
            this.economy.removeWorker();
          }
        }
        break;
      }
    }
  }

  /**
   * Advance time-dependent state (building completion, upgrade completion, economy, hero XP).
   */
  tick(timestampMs: number): void {
    this.buildings.tick(timestampMs);
    this.upgrades.tick(timestampMs);
    this.economy.tick(timestampMs, this.supply.upkeepBracket);
    this.heroes.tickXp(timestampMs);
    this.lastTickMs = timestampMs;
  }

  /** Update the game phase for hero XP rate estimation */
  setGamePhase(phase: string): void {
    this.heroes.setGamePhase(phase);
  }

  getProductionSummary(): ProductionSummary {
    const economySnap = this.economy.snapshot();
    const buildingList = this.buildings.getBuildings();

    return {
      playerId: this.playerId,
      playerName: this.playerName,
      race: this.race,
      unitsProduced: this.units.getProductionSummary(),
      unitsLost: this.units.getLossSummary(),
      buildingsBuilt: buildingList.map((b) => {
        const def = this.defs.buildings.get(b.gameId);
        return {
          gameId: b.gameId,
          name: b.name,
          count: b.count + b.inProgressCount,
          totalGold: (def?.goldCost ?? 0) * (b.count + b.inProgressCount),
          totalLumber: (def?.lumberCost ?? 0) * (b.count + b.inProgressCount),
        };
      }),
      upgradesCompleted: this.upgrades.getCompletionTimeline(),
      heroTimeline: this.heroes.getTimeline(),
      totalGoldSpent: economySnap.totalGoldSpent,
      totalLumberSpent: economySnap.totalLumberSpent,
    };
  }

  snapshot(timestampMs: number): PlayerSnapshot {
    const economySnap = this.economy.snapshot();
    economySnap.upkeepBracket = this.supply.upkeepBracket;

    return {
      playerId: this.playerId,
      playerName: this.playerName,
      race: this.race,
      heroes: this.heroes.snapshot(timestampMs),
      units: this.units.getUnits(),
      buildings: this.buildings.getBuildings(),
      upgrades: this.upgrades.getUpgrades(),
      economy: economySnap,
      currentSupply: this.supply.currentSupply,
      maxSupply: this.supply.maxSupply,
      tier: this.buildings.tier,
    };
  }
}
