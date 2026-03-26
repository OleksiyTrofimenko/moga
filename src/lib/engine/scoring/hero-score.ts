/**
 * Non-linear hero scoring based on level.
 */

import { HERO_LEVEL_SCORE } from "../constants";
import type { HeroSnapshot } from "../types";

export function calculateHeroScore(heroes: HeroSnapshot[]): number {
  let total = 0;
  for (const hero of heroes) {
    if (!hero.alive) continue;
    const levelScore = HERO_LEVEL_SCORE[hero.level] ?? HERO_LEVEL_SCORE[10] ?? 3900;
    total += levelScore;
  }
  return total;
}
