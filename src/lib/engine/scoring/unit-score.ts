/**
 * Score units by resource value with DPS/HP stat modifier.
 */

import type { UnitCount } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

/**
 * Calculate army score from unit composition.
 * Formula: (goldCost + lumberCost * 1.5) * count, with stat modifier
 */
export function calculateUnitScore(
  units: UnitCount[],
  defs: DefinitionsCache
): number {
  let total = 0;

  for (const unit of units) {
    const def = defs.units.get(unit.gameId);
    if (!def) {
      // Fallback: use raw costs from the unit count
      total += (unit.goldCost + unit.lumberCost * 1.5) * unit.count;
      continue;
    }

    const baseCost = def.goldCost + def.lumberCost * 1.5;
    const avgDamage = (def.damageMin + def.damageMax) / 2;
    const dps = def.attackCooldown > 0 ? avgDamage / def.attackCooldown : 0;

    // Stat modifier: sqrt(DPS * HP) / 20 — clamped to [0.8, 1.5]
    const statMod = dps > 0 ? Math.sqrt(dps * def.hp) / 20 : 1.0;
    const clampedMod = Math.max(0.8, Math.min(1.5, statMod));

    total += baseCost * clampedMod * unit.count;
  }

  return Math.round(total);
}
