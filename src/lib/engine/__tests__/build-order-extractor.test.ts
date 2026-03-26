import { describe, it, expect } from "vitest";
import { extractBuildOrders } from "../analytics/build-order-extractor";
import type { NormalizedEvent, ReplayMetadata } from "@/lib/parser/domain/types";
import type { DefinitionsCache } from "../definitions-cache";

function makeDefs(): DefinitionsCache {
  return {
    units: new Map([
      ["hpea", { gameId: "hpea", name: "Peasant", supply: 1, goldCost: 75, lumberCost: 0 } as never],
      ["hfoo", { gameId: "hfoo", name: "Footman", supply: 2, goldCost: 135, lumberCost: 0 } as never],
      ["ogru", { gameId: "ogru", name: "Grunt", supply: 3, goldCost: 200, lumberCost: 0 } as never],
      ["opeo", { gameId: "opeo", name: "Peon", supply: 1, goldCost: 75, lumberCost: 0 } as never],
    ]),
    heroes: new Map([
      ["Hpal", { gameId: "Hpal", name: "Paladin" } as never],
      ["Obla", { gameId: "Obla", name: "Blademaster" } as never],
    ]),
    buildings: new Map([
      ["hbar", { gameId: "hbar", name: "Barracks", goldCost: 160, lumberCost: 60 } as never],
      ["halt", { gameId: "halt", name: "Altar of Kings", goldCost: 180, lumberCost: 50 } as never],
    ]),
    items: new Map(),
    upgrades: new Map([
      ["Rhde", { gameId: "Rhde", name: "Defend", goldCost: [150], lumberCost: [100], levels: 1 } as never],
    ]),
    heroAbilityMap: new Map(),
  };
}

const metadata: ReplayMetadata = {
  gameVersion: 132,
  buildNumber: 6114,
  isExpansion: true,
  durationMs: 600000,
  isMultiplayer: true,
  mapName: "Test Map",
  mapPath: "(2)TestMap",
  gameName: "Test",
  randomSeed: 0,
  players: [
    { id: 1, name: "Player1", race: "human", teamNumber: 0, color: 0, isComputer: false, handicap: 100, slot: 0 },
    { id: 2, name: "Player2", race: "orc", teamNumber: 1, color: 1, isComputer: false, handicap: 100, slot: 1 },
  ],
};

function makeEvent(
  type: NormalizedEvent["type"],
  timestampMs: number,
  playerId: number,
  itemId: string
): NormalizedEvent {
  return {
    type,
    timestampMs,
    playerId,
    payload: { itemId, name: undefined },
    isInferred: false,
  };
}

describe("extractBuildOrders", () => {
  it("extracts unit, building, hero, and upgrade entries", () => {
    const events: NormalizedEvent[] = [
      makeEvent("UNIT_TRAINED", 30000, 1, "hpea"),
      makeEvent("BUILDING_STARTED", 45000, 1, "hbar"),
      makeEvent("HERO_TRAINED", 60000, 1, "Hpal"),
      makeEvent("UNIT_TRAINED", 90000, 1, "hfoo"),
      makeEvent("UPGRADE_STARTED", 120000, 1, "Rhde"),
      makeEvent("UNIT_TRAINED", 30000, 2, "opeo"),
      makeEvent("HERO_TRAINED", 65000, 2, "Obla"),
      makeEvent("UNIT_TRAINED", 100000, 2, "ogru"),
    ];

    const defs = makeDefs();
    const result = extractBuildOrders(events, metadata, defs);

    expect(result).toHaveLength(2);

    const p1 = result[0];
    expect(p1.playerId).toBe(1);
    expect(p1.playerName).toBe("Player1");
    expect(p1.race).toBe("human");
    expect(p1.entries).toHaveLength(5);

    // Check first entry (Peasant)
    expect(p1.entries[0]).toMatchObject({
      action: "unit",
      gameId: "hpea",
      name: "Peasant",
      goldCost: 75,
    });

    // Check building
    expect(p1.entries[1]).toMatchObject({
      action: "building",
      gameId: "hbar",
      name: "Barracks",
      goldCost: 160,
      lumberCost: 60,
    });

    // Check hero
    expect(p1.entries[2]).toMatchObject({
      action: "hero",
      gameId: "Hpal",
      name: "Paladin",
    });

    // Check upgrade
    expect(p1.entries[4]).toMatchObject({
      action: "upgrade",
      gameId: "Rhde",
      name: "Defend",
    });

    // Player 2
    const p2 = result[1];
    expect(p2.entries).toHaveLength(3);
    expect(p2.entries[2]).toMatchObject({
      action: "unit",
      gameId: "ogru",
      name: "Grunt",
    });
  });

  it("marks cancelled entries", () => {
    const events: NormalizedEvent[] = [
      makeEvent("BUILDING_STARTED", 30000, 1, "hbar"),
      makeEvent("BUILD_CANCELLED", 35000, 1, "hbar"),
    ];

    const defs = makeDefs();
    const result = extractBuildOrders(events, metadata, defs);

    const p1 = result[0];
    expect(p1.entries).toHaveLength(1);
    expect(p1.entries[0].isCancelled).toBe(true);
    expect(p1.entries[0].name).toBe("Barracks");
  });

  it("tracks supply changes through entries", () => {
    const events: NormalizedEvent[] = [
      makeEvent("UNIT_TRAINED", 30000, 1, "hpea"), // +1 supply (6 total)
      makeEvent("UNIT_TRAINED", 45000, 1, "hfoo"), // +2 supply (8 total)
      makeEvent("UNIT_TRAINED", 60000, 1, "hfoo"), // +2 supply (10 total)
    ];

    const defs = makeDefs();
    const result = extractBuildOrders(events, metadata, defs);

    const entries = result[0].entries;
    expect(entries[0].supplyAtTime).toBe(6); // 5 starting + 1 peasant
    expect(entries[1].supplyAtTime).toBe(8); // + 2 footman
    expect(entries[2].supplyAtTime).toBe(10); // + 2 footman
  });

  it("classifies game phases by time", () => {
    const events: NormalizedEvent[] = [
      makeEvent("UNIT_TRAINED", 60000, 1, "hpea"),   // 1 min → opening
      makeEvent("UNIT_TRAINED", 180000, 1, "hfoo"),  // 3 min → early
      makeEvent("UNIT_TRAINED", 480000, 1, "hfoo"),  // 8 min → early_mid
      makeEvent("UNIT_TRAINED", 900000, 1, "hfoo"),  // 15 min → mid
    ];

    const defs = makeDefs();
    const result = extractBuildOrders(events, metadata, defs);

    const entries = result[0].entries;
    expect(entries[0].gamePhase).toBe("opening");
    expect(entries[1].gamePhase).toBe("early");
    expect(entries[2].gamePhase).toBe("early_mid");
    expect(entries[3].gamePhase).toBe("mid");
  });
});
