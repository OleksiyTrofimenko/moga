/**
 * Upgrade scoring: level * value_per_level * count of affected units.
 */

import type { UpgradeState, UnitCount } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

const VALUE_PER_LEVEL = 50;

export function calculateUpgradeScore(
  upgrades: UpgradeState[],
  units: UnitCount[],
  defs: DefinitionsCache
): number {
  let total = 0;

  for (const upgrade of upgrades) {
    if (upgrade.currentLevel <= 0) continue;

    const def = defs.upgrades.get(upgrade.gameId);
    const affectsUnits = def?.affectsUnits ?? [];

    // Count how many units this upgrade affects
    let affectedCount = 0;
    if (affectsUnits.length > 0) {
      for (const unit of units) {
        if (affectsUnits.includes(unit.gameId)) {
          affectedCount += unit.count;
        }
      }
    } else {
      // If no specific units listed, estimate from total army
      affectedCount = units.reduce((sum, u) => sum + u.count, 0);
    }

    // At least value the upgrade itself even with 0 affected units
    const effectiveCount = Math.max(1, affectedCount);
    total += upgrade.currentLevel * VALUE_PER_LEVEL * effectiveCount;
  }

  return Math.round(total);
}
