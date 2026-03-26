import { describe, it, expect } from "vitest";
import { SupplyTracker } from "../state/supply-tracker";
import { EconomyTracker } from "../state/economy-tracker";
import { UnitTracker } from "../state/unit-tracker";
import { HeroTracker } from "../state/hero-tracker";
import { UpgradeTracker } from "../state/upgrade-tracker";
import { BuildingTracker } from "../state/building-tracker";
import { detectKeyMoments } from "../analytics/key-moment-detector";
import type { DefinitionsCache } from "../definitions-cache";
import type { NormalizedEvent } from "@/lib/parser/domain/types";
import type { PlayerSnapshot } from "../types";

function makeDefs(overrides: Partial<DefinitionsCache> = {}): DefinitionsCache {
  const units = new Map();
  units.set("ogru", { gameId: "ogru", name: "Grunt", supply: 3, goldCost: 200, lumberCost: 0, hp: 700, damageMin: 19, damageMax: 22, attackCooldown: 1.5 });
  units.set("opeo", { gameId: "opeo", name: "Peon", supply: 1, goldCost: 75, lumberCost: 0, hp: 250, damageMin: 7, damageMax: 8, attackCooldown: 1.0 });

  const buildings = new Map();
  buildings.set("otrb", { gameId: "otrb", name: "Orc Burrow", buildTime: 50, goldCost: 160, lumberCost: 40 });
  buildings.set("ostr", { gameId: "ostr", name: "Stronghold", buildTime: 140, goldCost: 315, lumberCost: 190 });
  buildings.set("ogre", { gameId: "ogre", name: "Great Hall", buildTime: 150, goldCost: 385, lumberCost: 185 });

  const heroes = new Map();
  heroes.set("Obla", { gameId: "Obla", name: "Blademaster" });

  const items = new Map();
  items.set("stel", { gameId: "stel", name: "Staff of Teleportation", goldCost: 150, category: "charged" });

  const upgrades = new Map();
  upgrades.set("Rome", { gameId: "Rome", name: "Steel Melee Weapons", levels: 3, researchTime: [60, 75, 90], goldCost: [100, 175, 250], lumberCost: [0, 0, 0], affectsUnits: ["ogru"] });

  return {
    units,
    heroes,
    buildings,
    items,
    upgrades,
    ...overrides,
  } as DefinitionsCache;
}

describe("SupplyTracker", () => {
  it("tracks current and max supply", () => {
    const defs = makeDefs();
    const tracker = new SupplyTracker(defs, 5, 11);

    tracker.addUnit("ogru"); // +3 supply
    expect(tracker.currentSupply).toBe(8);

    tracker.addBuilding("otrb"); // +3 max supply (orc burrow is 3 each, but we use SUPPLY_BUILDINGS constant)
    expect(tracker.maxSupply).toBe(14); // 11 + 3
  });

  it("returns correct upkeep bracket", () => {
    const defs = makeDefs();
    const tracker = new SupplyTracker(defs, 50, 60);
    expect(tracker.upkeepBracket).toBe("none");

    // Simulate adding units to 51+
    const tracker2 = new SupplyTracker(defs, 51, 60);
    expect(tracker2.upkeepBracket).toBe("low");

    const tracker3 = new SupplyTracker(defs, 81, 100);
    expect(tracker3.upkeepBracket).toBe("high");
  });
});

describe("EconomyTracker", () => {
  it("starts with correct resources", () => {
    const tracker = new EconomyTracker("orc");
    const snap = tracker.snapshot();
    expect(snap.goldEstimate).toBe(500);
    expect(snap.lumberEstimate).toBe(150);
    expect(snap.workerCount).toBe(5);
  });

  it("tracks spending", () => {
    const tracker = new EconomyTracker("orc");
    tracker.spend(200, 0);
    const snap = tracker.snapshot();
    expect(snap.goldEstimate).toBe(300);
    expect(snap.totalGoldSpent).toBe(200);
  });

  it("accumulates income over time", () => {
    const tracker = new EconomyTracker("orc");
    tracker.tick(0, "none"); // Initialize
    tracker.tick(60000, "none"); // 60 seconds later

    const snap = tracker.snapshot();
    expect(snap.goldEstimate).toBeGreaterThan(500); // Should have earned gold
  });
});

describe("UnitTracker", () => {
  it("tracks unit counts", () => {
    const defs = makeDefs();
    const tracker = new UnitTracker(defs, [{ gameId: "opeo", count: 5 }]);

    tracker.addUnit("ogru");
    tracker.addUnit("ogru");
    expect(tracker.getCount("ogru")).toBe(2);
    expect(tracker.getWorkerCount()).toBe(5);
  });

  it("produces unit snapshot", () => {
    const defs = makeDefs();
    const tracker = new UnitTracker(defs, [{ gameId: "opeo", count: 5 }]);
    tracker.addUnit("ogru");

    const units = tracker.getUnits();
    expect(units).toHaveLength(2);
    expect(units.find((u) => u.gameId === "ogru")?.count).toBe(1);
    expect(units.every((u) => u.isEstimated)).toBe(true);
  });
});

describe("HeroTracker", () => {
  it("tracks hero training", () => {
    const defs = makeDefs();
    const tracker = new HeroTracker(defs);

    tracker.trainHero("Obla", 60000);
    const snap = tracker.snapshot(60000);
    expect(snap).toHaveLength(1);
    expect(snap[0].name).toBe("Blademaster");
    expect(snap[0].alive).toBe(true);
  });

  it("detects hero death from re-training", () => {
    const defs = makeDefs();
    const tracker = new HeroTracker(defs);

    tracker.trainHero("Obla", 60000);
    tracker.trainHero("Obla", 300000); // Same hero = revive

    const snap = tracker.snapshot(300000);
    expect(snap).toHaveLength(1);
    expect(snap[0].reviveCount).toBe(1);
  });

  it("estimates hero level from time via tickXp", () => {
    const defs = makeDefs();
    const tracker = new HeroTracker(defs);

    tracker.trainHero("Obla", 0);
    // Set to early game phase (3.5 XP/sec base rate × 1.0 first hero multiplier)
    tracker.setGamePhase("early");
    // Tick XP every 3 seconds for 5 minutes
    for (let t = 3000; t <= 300000; t += 3000) {
      tracker.tickXp(t);
    }
    // After 5 minutes (300 sec) at ~3.5 XP/sec = ~1050 XP → level 4+
    const snap = tracker.snapshot(300000);
    expect(snap[0].level).toBeGreaterThanOrEqual(3);
    expect(snap[0].xp).toBeGreaterThan(0);
  });
});

describe("UpgradeTracker", () => {
  it("tracks upgrade research and completion", () => {
    const defs = makeDefs();
    const tracker = new UpgradeTracker(defs);

    tracker.startUpgrade("Rome", 60000);
    expect(tracker.getLevel("Rome")).toBe(0); // Not yet complete

    // After 60 seconds of research time
    tracker.tick(121000);
    expect(tracker.getLevel("Rome")).toBe(1);
  });

  it("returns upgrade state", () => {
    const defs = makeDefs();
    const tracker = new UpgradeTracker(defs);
    tracker.startUpgrade("Rome", 60000);

    const upgrades = tracker.getUpgrades();
    expect(upgrades).toHaveLength(1);
    expect(upgrades[0].inProgress).toBe(true);
  });
});

describe("SupplyTracker — tier upgrade", () => {
  it("does not double-count supply on tier-up", () => {
    const defs = makeDefs();
    // Orc starts with 11 max supply from Great Hall
    const supply = new SupplyTracker(defs, 5, 11);

    // Upgrade to Stronghold: should replace, not add
    supply.upgradeBuilding("ogre", "ostr");
    expect(supply.maxSupply).toBe(11); // Both provide 11, so no change

    // Add a burrow
    supply.addBuilding("otrb");
    expect(supply.maxSupply).toBe(14); // 11 + 3
  });
});

describe("HeroTracker — item assignment", () => {
  it("assigns item to first alive hero without heroGameId", () => {
    const defs = makeDefs();
    const tracker = new HeroTracker(defs);

    tracker.trainHero("Obla", 60000);
    tracker.assignItem("stel");

    const snap = tracker.snapshot(60000);
    expect(snap[0].items).toHaveLength(1);
    expect(snap[0].items[0].gameId).toBe("stel");
    expect(snap[0].items[0].name).toBe("Staff of Teleportation");
  });
});

describe("BuildingTracker", () => {
  it("starts with a town hall", () => {
    const defs = makeDefs();
    const tracker = new BuildingTracker(defs, "orc");

    expect(tracker.tier).toBe(1);
    expect(tracker.getCompletedCount("ogre")).toBe(1);
  });

  it("tracks building construction and completion", () => {
    const defs = makeDefs();
    const tracker = new BuildingTracker(defs, "orc");

    tracker.startBuilding("otrb", 30000);
    const buildings = tracker.getBuildings();
    const burrow = buildings.find((b) => b.gameId === "otrb");
    expect(burrow?.inProgressCount).toBe(1);

    // After build time (50 sec = 50000 ms)
    tracker.tick(80001);
    expect(tracker.getCompletedCount("otrb")).toBe(1);
  });

  it("detects tier upgrades", () => {
    const defs = makeDefs();
    const tracker = new BuildingTracker(defs, "orc");

    tracker.startBuilding("ostr", 120000); // Stronghold
    tracker.tick(260001); // 140 sec build time
    expect(tracker.tier).toBe(2);
  });
});

describe("Key Moment Detector — expansion", () => {
  function makePlayerSnapshot(buildings: { gameId: string; count: number }[]): PlayerSnapshot {
    return {
      playerId: 1,
      playerName: "Player1",
      race: "orc",
      heroes: [],
      units: [],
      buildings: buildings.map((b) => ({
        gameId: b.gameId,
        name: b.gameId,
        count: b.count,
        inProgressCount: 0,
      })),
      upgrades: [],
      economy: {
        goldEstimate: 500,
        lumberEstimate: 150,
        goldIncome: 0,
        lumberIncome: 0,
        workerCount: 5,
        miningWorkers: 5,
        lumberWorkers: 0,
        totalGoldSpent: 0,
        totalLumberSpent: 0,
        upkeepBracket: "none" as const,
        isEstimated: true,
      },
      currentSupply: 5,
      maxSupply: 11,
      tier: 1,
    };
  }

  function makeEvent(type: string, gameId: string, timestampMs: number): NormalizedEvent {
    return {
      type: type as NormalizedEvent["type"],
      playerId: 1,
      timestampMs,
      payload: { itemId: gameId },
      isInferred: false,
    };
  }

  it("does NOT flag expansion on tier-up (T2 upgrade)", () => {
    const defs = makeDefs();
    // Player has starting Great Hall
    const player = makePlayerSnapshot([{ gameId: "ogre", count: 1 }]);
    const opponent = makePlayerSnapshot([]);

    const event = makeEvent("BUILDING_STARTED", "ostr", 120000); // Stronghold = tier 2
    const moments = detectKeyMoments(event, player, opponent, defs);

    const expansions = moments.filter((m) => m.type === "expansion");
    expect(expansions).toHaveLength(0);
  });

  it("flags expansion when building a second T1 town hall", () => {
    const defs = makeDefs();
    // Player has starting Great Hall + the new one in progress (count=2 in snapshot)
    const player = makePlayerSnapshot([{ gameId: "ogre", count: 2 }]);
    const opponent = makePlayerSnapshot([]);

    const event = makeEvent("BUILDING_STARTED", "ogre", 300000);
    const moments = detectKeyMoments(event, player, opponent, defs);

    const expansions = moments.filter((m) => m.type === "expansion");
    expect(expansions).toHaveLength(1);
  });

  it("does NOT flag expansion for starting town hall only", () => {
    const defs = makeDefs();
    // Player only has 1 T1 TH (the starting one) — snapshot taken before new building added
    const player = makePlayerSnapshot([{ gameId: "ogre", count: 1 }]);
    const opponent = makePlayerSnapshot([]);

    const event = makeEvent("BUILDING_STARTED", "ogre", 300000);
    const moments = detectKeyMoments(event, player, opponent, defs);

    const expansions = moments.filter((m) => m.type === "expansion");
    expect(expansions).toHaveLength(0);
  });
});
