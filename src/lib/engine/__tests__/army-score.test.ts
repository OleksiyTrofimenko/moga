import { describe, it, expect } from "vitest";
import { calculateUnitScore } from "../scoring/unit-score";
import { calculateHeroScore } from "../scoring/hero-score";
import { calculateTempoModifier } from "../scoring/tempo-modifier";
import type { UnitCount, HeroSnapshot, PlayerSnapshot } from "../types";
import type { DefinitionsCache } from "../definitions-cache";

// Minimal defs mock for testing
function makeMockDefs(): DefinitionsCache {
  const units = new Map();
  // Grunt: 200g, 3 supply, normal attack, medium armor
  units.set("ogru", {
    gameId: "ogru", name: "Grunt", goldCost: 200, lumberCost: 0, supply: 3,
    hp: 700, damageMin: 19, damageMax: 22, attackCooldown: 1.5, attackType: "normal", armorType: "heavy",
  });
  // Footman: 135g, 2 supply
  units.set("hfoo", {
    gameId: "hfoo", name: "Footman", goldCost: 135, lumberCost: 0, supply: 2,
    hp: 420, damageMin: 12, damageMax: 13, attackCooldown: 1.35, attackType: "normal", armorType: "heavy",
  });

  return {
    units,
    heroes: new Map(),
    buildings: new Map(),
    items: new Map(),
    upgrades: new Map(),
    heroAbilityMap: new Map(),
  } as DefinitionsCache;
}

describe("unit-score", () => {
  it("scores 4 grunts higher than 4 footmen by resource value", () => {
    const defs = makeMockDefs();

    const grunts: UnitCount[] = [
      { gameId: "ogru", name: "Grunt", count: 4, supply: 12, goldCost: 200, lumberCost: 0, isEstimated: true },
    ];
    const footmen: UnitCount[] = [
      { gameId: "hfoo", name: "Footman", count: 4, supply: 8, goldCost: 135, lumberCost: 0, isEstimated: true },
    ];

    const gruntScore = calculateUnitScore(grunts, defs);
    const footmanScore = calculateUnitScore(footmen, defs);

    expect(gruntScore).toBeGreaterThan(footmanScore);
    expect(gruntScore).toBeGreaterThan(0);
    expect(footmanScore).toBeGreaterThan(0);
  });
});

describe("hero-score", () => {
  it("scores higher-level heroes higher", () => {
    const hero1: HeroSnapshot[] = [{
      gameId: "Obla", name: "Blademaster", level: 3, xp: 0,
      items: [], abilities: [], alive: true, reviveCount: 0, isEstimated: true,
    }];
    const hero5: HeroSnapshot[] = [{
      gameId: "Obla", name: "Blademaster", level: 5, xp: 0,
      items: [], abilities: [], alive: true, reviveCount: 0, isEstimated: true,
    }];

    expect(calculateHeroScore(hero5)).toBeGreaterThan(calculateHeroScore(hero1));
  });

  it("dead heroes score 0", () => {
    const deadHero: HeroSnapshot[] = [{
      gameId: "Obla", name: "Blademaster", level: 5, xp: 0,
      items: [], abilities: [], alive: false, reviveCount: 1, isEstimated: true,
    }];

    expect(calculateHeroScore(deadHero)).toBe(0);
  });
});

describe("tempo-modifier", () => {
  it("gives advantage for higher tier", () => {
    const p1 = makePlayerSnap({ tier: 3 });
    const p2 = makePlayerSnap({ tier: 2 });

    const mod = calculateTempoModifier(p1, p2);
    expect(mod).toBeGreaterThan(1.0);
  });

  it("gives advantage for ultimate hero", () => {
    const p1 = makePlayerSnap({
      heroes: [{ gameId: "Obla", name: "BM", level: 6, xp: 0, items: [], abilities: [], alive: true, reviveCount: 0, isEstimated: true }],
    });
    const p2 = makePlayerSnap({
      heroes: [{ gameId: "Hamg", name: "AM", level: 4, xp: 0, items: [], abilities: [], alive: true, reviveCount: 0, isEstimated: true }],
    });

    const mod = calculateTempoModifier(p1, p2);
    expect(mod).toBeGreaterThan(1.1); // should get hero level + ultimate bonus
  });

  it("returns 1.0 for equal players", () => {
    const p = makePlayerSnap({});
    expect(calculateTempoModifier(p, p)).toBe(1.0);
  });
});

function makePlayerSnap(overrides: Partial<PlayerSnapshot>): PlayerSnapshot {
  return {
    playerId: 1,
    playerName: "Test",
    race: "orc",
    heroes: [],
    units: [],
    buildings: [],
    upgrades: [],
    economy: {
      goldEstimate: 0, lumberEstimate: 0, goldIncome: 0, lumberIncome: 0,
      workerCount: 5, miningWorkers: 3, lumberWorkers: 2,
      upkeepBracket: "none", totalGoldSpent: 0, totalLumberSpent: 0, isEstimated: true,
    },
    currentSupply: 20,
    maxSupply: 50,
    tier: 1,
    ...overrides,
  };
}
