/**
 * Weighted average of damage matrix efficiency across army compositions.
 */

import { getDamageMultiplier } from "./damage-matrix";
import type { AttackType, ArmorType } from "./damage-matrix";
import type { UnitCount } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

/**
 * Calculate how well army A matches up against army B.
 * Returns a modifier (typically 0.7 - 1.3).
 */
export function calculateMatchupModifier(
  attackerUnits: UnitCount[],
  defenderUnits: UnitCount[],
  defs: DefinitionsCache
): number {
  if (attackerUnits.length === 0 || defenderUnits.length === 0) return 1.0;

  let totalWeight = 0;
  let weightedMultiplier = 0;

  for (const attacker of attackerUnits) {
    const aDef = defs.units.get(attacker.gameId);
    if (!aDef) continue;

    const attackType = aDef.attackType as AttackType;
    const avgDmg = (aDef.damageMin + aDef.damageMax) / 2;

    for (const defender of defenderUnits) {
      const dDef = defs.units.get(defender.gameId);
      if (!dDef) continue;

      const armorType = dDef.armorType as ArmorType;
      const multiplier = getDamageMultiplier(attackType, armorType);
      const weight = attacker.count * defender.count * avgDmg;

      weightedMultiplier += multiplier * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 1.0;
  return weightedMultiplier / totalWeight;
}
