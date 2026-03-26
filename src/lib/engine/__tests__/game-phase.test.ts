import { describe, it, expect } from "vitest";
import { classifyGamePhase } from "../analytics/game-phase";
import type { PlayerSnapshot } from "../types";

function makeSnap(overrides: Partial<PlayerSnapshot> = {}): PlayerSnapshot {
  return {
    playerId: 1,
    playerName: "Test",
    race: "human",
    heroes: [],
    units: [],
    buildings: [],
    upgrades: [],
    economy: {
      goldEstimate: 0, lumberEstimate: 0, goldIncome: 0, lumberIncome: 0,
      workerCount: 5, miningWorkers: 3, lumberWorkers: 2,
      upkeepBracket: "none", totalGoldSpent: 0, totalLumberSpent: 0, isEstimated: true,
    },
    currentSupply: 5,
    maxSupply: 12,
    tier: 1,
    ...overrides,
  };
}

describe("game-phase classifier", () => {
  it("opening at game start", () => {
    const p = makeSnap();
    expect(classifyGamePhase(30000, p, p)).toBe("opening");
  });

  it("early when hero is out", () => {
    const p = makeSnap({
      heroes: [{ gameId: "Hamg", name: "AM", level: 1, xp: 0, items: [], alive: true, reviveCount: 0, isEstimated: true }],
      currentSupply: 15,
    });
    expect(classifyGamePhase(150000, p, p)).toBe("early");
  });

  it("early_mid at tier 2", () => {
    const p = makeSnap({ tier: 2, currentSupply: 25 });
    expect(classifyGamePhase(360000, p, p)).toBe("early_mid");
  });

  it("mid at tier 2 with army", () => {
    const p = makeSnap({ tier: 2, currentSupply: 50 });
    expect(classifyGamePhase(720000, p, p)).toBe("mid");
  });

  it("late game at tier 3 high supply", () => {
    const p = makeSnap({ tier: 3, currentSupply: 80 });
    expect(classifyGamePhase(1500000, p, p)).toBe("late");
  });

  it("late game by time alone (25+ min)", () => {
    const p = makeSnap({ tier: 2, currentSupply: 50 });
    expect(classifyGamePhase(25 * 60 * 1000, p, p)).toBe("late");
  });
});
