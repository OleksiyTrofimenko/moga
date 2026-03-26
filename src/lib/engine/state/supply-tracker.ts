/**
 * Tracks current supply usage and max supply from buildings.
 */

import { SUPPLY_BUILDINGS, UPKEEP_THRESHOLDS, MAX_SUPPLY } from "../constants";
import type { UpkeepBracket } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

export class SupplyTracker {
  private _currentSupply = 0;
  private _maxSupply = 0;
  private defs: DefinitionsCache;

  constructor(defs: DefinitionsCache, initialSupply: number, initialMaxSupply: number) {
    this.defs = defs;
    this._currentSupply = initialSupply;
    this._maxSupply = initialMaxSupply;
  }

  get currentSupply(): number {
    return this._currentSupply;
  }

  get maxSupply(): number {
    return Math.min(this._maxSupply, MAX_SUPPLY);
  }

  get upkeepBracket(): UpkeepBracket {
    for (let i = UPKEEP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this._currentSupply >= UPKEEP_THRESHOLDS[i].minSupply) {
        return UPKEEP_THRESHOLDS[i].bracket;
      }
    }
    return "none";
  }

  get taxRate(): number {
    for (let i = UPKEEP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this._currentSupply >= UPKEEP_THRESHOLDS[i].minSupply) {
        return UPKEEP_THRESHOLDS[i].taxRate;
      }
    }
    return 0;
  }

  addUnit(gameId: string): void {
    const unitDef = this.defs.units.get(gameId);
    if (unitDef) {
      this._currentSupply += unitDef.supply;
    }
  }

  addBuilding(gameId: string): void {
    const supply = SUPPLY_BUILDINGS[gameId];
    if (supply !== undefined) {
      this._maxSupply += supply;
    }
  }

  /** When a town hall upgrades (e.g., Town Hall → Keep), remove old supply and add new */
  upgradeBuilding(oldGameId: string, newGameId: string): void {
    const oldSupply = SUPPLY_BUILDINGS[oldGameId] ?? 0;
    const newSupply = SUPPLY_BUILDINGS[newGameId] ?? 0;
    this._maxSupply = this._maxSupply - oldSupply + newSupply;
  }

  addHero(): void {
    this._currentSupply += 5;
  }
}
