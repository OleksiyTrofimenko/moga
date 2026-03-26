/**
 * Tracks heroes: level estimation, inventory, death detection via re-training.
 *
 * Hero XP estimation uses a multi-source model:
 * - Base creeping XP rate (varies by game phase)
 * - XP from known creep kill events
 * - Reduced XP rate when hero is dead
 * - Second/third heroes get less XP (split)
 */

import { HERO_XP_TABLE } from "../constants";
import type { AbilitySnapshot, HeroSnapshot, ItemSnapshot, HeroTimelineEntry } from "../types";
import type { DefinitionsCache } from "../definitions-cache";
import { GAME_ID_MAP } from "../../parser/domain/game-id-map";

/** XP gain rates per second by game phase (accounts for creeping + PvP) */
const XP_RATE_BY_PHASE = {
  opening: 0,       // Hero not out yet usually
  early: 3.5,       // Active creeping
  early_mid: 4.0,   // Creeping + small skirmishes
  mid: 3.0,         // Mix of fighting and creeping
  mid_late: 2.5,    // Less creeping, more fighting
  late: 2.0,        // Mostly PvP, fewer creep camps left
} as const;

/** XP multiplier based on hero order (1st hero gets most XP) */
const HERO_ORDER_XP_MULTIPLIER = [1.0, 0.6, 0.35];

interface HeroState {
  gameId: string;
  name: string;
  trainedAtMs: number;
  alive: boolean;
  reviveCount: number;
  items: ItemSnapshot[];
  /** Learned abilities: abilityGameId → number of times seen (proxy for level) */
  abilities: Map<string, number>;
  /** Last known item slot counter */
  nextItemSlot: number;
  /** Accumulated XP from time-based estimation */
  estimatedXp: number;
  /** Last tick timestamp for XP accumulation */
  lastXpTickMs: number;
  /** Hero order (0 = first hero, 1 = second, 2 = third) */
  order: number;
  /** Timestamp when hero died (for revive timing) */
  deathAtMs: number | null;
  /** Timeline of hero events for summary */
  timeline: HeroTimelineEntry[];
  /** Track ability learn timestamps: abilityGameId → timestampMs[] */
  abilityLearnedAtMs: Map<string, number[]>;
  /** Track item acquisition timestamps: itemGameId → timestampMs */
  itemAcquiredAtMs: Map<string, number>;
  /** Track death timestamps */
  deathTimestamps: number[];
}

export class HeroTracker {
  private heroes: HeroState[] = [];
  private defs: DefinitionsCache;
  private maxHeroes = 3;
  private currentPhase: keyof typeof XP_RATE_BY_PHASE = "opening";
  private lastActiveHeroId: string | null = null;

  constructor(defs: DefinitionsCache) {
    this.defs = defs;
  }

  /** Update the current game phase (affects XP estimation rates) */
  setGamePhase(phase: string): void {
    if (phase in XP_RATE_BY_PHASE) {
      this.currentPhase = phase as keyof typeof XP_RATE_BY_PHASE;
    }
  }

  trainHero(gameId: string, timestampMs: number): void {
    // Check if this hero was already trained — if so, it's a revive (death detection)
    const existing = this.heroes.find((h) => h.gameId === gameId);
    if (existing) {
      existing.reviveCount++;
      existing.alive = true;
      existing.deathAtMs = null;
      existing.timeline.push({
        heroGameId: gameId,
        heroName: existing.name,
        event: "revived",
        timestampMs,
        detail: `Revived (#${existing.reviveCount})`,
      });
      return;
    }

    if (this.heroes.length >= this.maxHeroes) return;

    const def = this.defs.heroes.get(gameId);
    const name = def?.name ?? gameId;
    this.heroes.push({
      gameId,
      name,
      trainedAtMs: timestampMs,
      alive: true,
      reviveCount: 0,
      items: [],
      abilities: new Map(),
      nextItemSlot: 0,
      estimatedXp: 0,
      lastXpTickMs: timestampMs,
      order: this.heroes.length,
      deathAtMs: null,
      timeline: [{
        heroGameId: gameId,
        heroName: name,
        event: "trained",
        timestampMs,
        detail: `${name} trained`,
      }],
      abilityLearnedAtMs: new Map(),
      itemAcquiredAtMs: new Map(),
      deathTimestamps: [],
    });
    // Newly trained hero becomes active (goes creeping)
    this.lastActiveHeroId = gameId;
  }

  /** Advance XP estimation based on elapsed time */
  tickXp(timestampMs: number): void {
    for (const hero of this.heroes) {
      if (hero.lastXpTickMs < 0) {
        hero.lastXpTickMs = timestampMs;
        continue;
      }

      const elapsedSec = (timestampMs - hero.lastXpTickMs) / 1000;
      if (elapsedSec <= 0) {
        hero.lastXpTickMs = timestampMs;
        continue;
      }

      // Dead heroes don't gain XP
      if (!hero.alive) {
        hero.lastXpTickMs = timestampMs;
        continue;
      }

      const baseRate = XP_RATE_BY_PHASE[this.currentPhase];
      const orderMult = HERO_ORDER_XP_MULTIPLIER[hero.order] ?? 0.35;
      const xpGain = baseRate * orderMult * elapsedSec;
      hero.estimatedXp += xpGain;
      hero.lastXpTickMs = timestampMs;
    }
  }

  /** Mark a hero as dead (called when detecting hero death from engagement) */
  markHeroDead(gameId: string, timestampMs: number): void {
    const hero = this.heroes.find((h) => h.gameId === gameId);
    if (hero && hero.alive) {
      hero.alive = false;
      hero.deathAtMs = timestampMs;
      hero.deathTimestamps.push(timestampMs);
      hero.timeline.push({
        heroGameId: gameId,
        heroName: hero.name,
        event: "died",
        timestampMs,
        detail: `${hero.name} died`,
      });
    }
  }

  /** Record a hero ability usage. First occurrence = learned, subsequent = level up. */
  learnAbility(abilityGameId: string, timestampMs?: number): void {
    const abilityInfo = this.defs.heroAbilityMap.get(abilityGameId);
    if (!abilityInfo) return;

    const hero = this.heroes.find((h) => h.gameId === abilityInfo.heroGameId);
    if (!hero) return;

    const current = hero.abilities.get(abilityGameId) ?? 0;
    const maxLevel = abilityInfo.isUltimate ? 1 : 3;
    if (current < maxLevel) {
      const newLevel = current + 1;
      hero.abilities.set(abilityGameId, newLevel);

      // Record timestamp
      if (timestampMs !== undefined) {
        const timestamps = hero.abilityLearnedAtMs.get(abilityGameId) ?? [];
        timestamps.push(timestampMs);
        hero.abilityLearnedAtMs.set(abilityGameId, timestamps);

        hero.timeline.push({
          heroGameId: hero.gameId,
          heroName: hero.name,
          event: "ability_learned",
          timestampMs,
          detail: `${abilityInfo.abilityName} (${newLevel})`,
        });
      }
    }
    // Hero that used ability is active
    this.lastActiveHeroId = hero.gameId;
  }

  /** Assign item to best-guess hero (replays don't tell us which hero picked it up) */
  assignItem(itemGameId: string, timestampMs?: number): void {
    // Skip non-entity IDs (binary garbage from replay format)
    if (!itemGameId || /[\x00-\x1f]/.test(itemGameId)) return;

    const aliveHeroes = this.heroes.filter((h) => h.alive);

    let hero: HeroState | undefined;
    if (aliveHeroes.length === 1) {
      // Only one hero alive — must be them
      hero = aliveHeroes[0];
    } else if (aliveHeroes.length > 1 && this.lastActiveHeroId) {
      // Prefer the last active hero if alive
      hero = aliveHeroes.find((h) => h.gameId === this.lastActiveHeroId);
    }
    if (!hero && aliveHeroes.length > 0) {
      // Fallback: alive hero with fewest items (distributes evenly)
      hero = aliveHeroes.reduce((a, b) => (a.items.length <= b.items.length ? a : b));
    }
    if (!hero) {
      hero = this.heroes[0];
    }

    return this._addItem(hero, itemGameId, timestampMs);
  }

  useItem(gameId: string, itemGameId: string, timestampMs?: number): void {
    const hero = this.heroes.find((h) => h.gameId === gameId) ?? this.heroes[0];
    return this._addItem(hero, itemGameId, timestampMs);
  }

  private _addItem(hero: HeroState | undefined, itemGameId: string, timestampMs?: number): void {
    if (!hero) return;

    const itemDef = this.defs.items.get(itemGameId);
    // Fallback to GAME_ID_MAP for items not yet seeded in DB (e.g. creep drops)
    const itemName = itemDef?.name ?? GAME_ID_MAP[itemGameId]?.name;
    // Skip truly unknown items — likely binary garbage, not real items
    if (!itemName) return;

    // Check if hero already has this item
    const existingIdx = hero.items.findIndex((i) => i.gameId === itemGameId);
    if (existingIdx >= 0) return; // Already has it

    if (hero.items.length < 6) {
      hero.items.push({
        gameId: itemGameId,
        name: itemName,
        slot: hero.nextItemSlot++,
      });

      // Record timestamp for timeline
      if (timestampMs !== undefined) {
        hero.itemAcquiredAtMs.set(itemGameId, timestampMs);
        hero.timeline.push({
          heroGameId: hero.gameId,
          heroName: hero.name,
          event: "item_acquired",
          timestampMs,
          detail: itemName,
        });
      }
    }
  }

  /** Estimate hero level from accumulated XP */
  private _estimateLevel(hero: HeroState): number {
    let level = 1;
    for (let i = 1; i < HERO_XP_TABLE.length; i++) {
      if (hero.estimatedXp >= HERO_XP_TABLE[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return Math.min(level, 10);
  }

  getHeroCount(): number {
    return this.heroes.length;
  }

  snapshot(_currentMs: number): HeroSnapshot[] {
    return this.heroes.map((hero) => {
      const level = this._estimateLevel(hero);
      const abilities: AbilitySnapshot[] = [];
      for (const [abilityId, lvl] of hero.abilities) {
        const info = this.defs.heroAbilityMap.get(abilityId);
        if (info) {
          abilities.push({
            gameId: abilityId,
            name: info.abilityName,
            level: lvl,
            isUltimate: info.isUltimate,
          });
        }
      }
      return {
        gameId: hero.gameId,
        name: hero.name,
        level,
        xp: Math.round(hero.estimatedXp),
        items: [...hero.items],
        abilities,
        alive: hero.alive,
        reviveCount: hero.reviveCount,
        isEstimated: true,
      };
    });
  }

  /** Check if any hero just hit a milestone level (uses stored XP, not time-based) */
  checkMilestones(prevLevels: Map<string, number>): { gameId: string; name: string; level: number }[] {
    const milestones: { gameId: string; name: string; level: number }[] = [];
    const milestoneLevels = [3, 5, 6];

    for (const hero of this.heroes) {
      const prevLevel = prevLevels.get(hero.gameId) ?? 0;
      const currLevel = this._estimateLevel(hero);

      for (const ml of milestoneLevels) {
        if (prevLevel < ml && currLevel >= ml) {
          milestones.push({ gameId: hero.gameId, name: hero.name, level: ml });
        }
      }
    }
    return milestones;
  }

  /** Get combined timeline of all hero events, sorted by timestamp */
  getTimeline(): HeroTimelineEntry[] {
    const all: HeroTimelineEntry[] = [];
    for (const hero of this.heroes) {
      all.push(...hero.timeline);
    }
    return all.sort((a, b) => a.timestampMs - b.timestampMs);
  }

  getMaxHeroLevel(_currentMs: number): number {
    let max = 0;
    for (const hero of this.heroes) {
      max = Math.max(max, this._estimateLevel(hero));
    }
    return max;
  }
}
