/**
 * Item scoring: gold cost * category multiplier.
 */

import { ITEM_CATEGORY_MULTIPLIER } from "../constants";
import type { HeroSnapshot } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

export function calculateItemScore(
  heroes: HeroSnapshot[],
  defs: DefinitionsCache
): number {
  let total = 0;

  for (const hero of heroes) {
    for (const item of hero.items) {
      const def = defs.items.get(item.gameId);
      if (!def) continue;
      const multiplier = ITEM_CATEGORY_MULTIPLIER[def.category] ?? 1.0;
      total += def.goldCost * multiplier;
    }
  }

  return Math.round(total);
}
