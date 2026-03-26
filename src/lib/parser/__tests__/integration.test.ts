import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseReplay } from "../index";

const REPLAY_PATH = path.resolve(
  __dirname,
  "../../../../wc3-replays/866302985_Chaemiko_Lyn_Hammerfall.w3g"
);

const hasReplay = fs.existsSync(REPLAY_PATH);

describe.skipIf(!hasReplay)("Integration: parse real replay", () => {
  const buffer = hasReplay ? fs.readFileSync(REPLAY_PATH) : Buffer.alloc(0);

  it("parses without throwing", () => {
    const result = parseReplay(buffer);
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.events).toBeDefined();
    expect(result.diagnostics).toBeDefined();
  });

  it("extracts correct metadata", () => {
    const result = parseReplay(buffer);
    const { metadata } = result;

    expect(metadata.isExpansion).toBe(true);
    expect(metadata.durationMs).toBeGreaterThan(0);
    expect(metadata.players.length).toBeGreaterThanOrEqual(2);

    console.log("Game version:", metadata.gameVersion);
    console.log("Build:", metadata.buildNumber);
    console.log("Duration:", Math.floor(metadata.durationMs / 1000 / 60), "min");
    console.log("Map:", metadata.mapName);
    console.log("Players:");
    for (const p of metadata.players) {
      console.log(`  ${p.name} (${p.race}) team=${p.teamNumber}`);
    }
  });

  it("produces normalized events", () => {
    const result = parseReplay(buffer);
    expect(result.events.length).toBeGreaterThan(0);

    // Count event types
    const counts: Record<string, number> = {};
    for (const e of result.events) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    console.log("Event counts:", counts);
  });

  it("has build order events", () => {
    const result = parseReplay(buffer);
    const buildEvents = result.events.filter(
      (e) =>
        e.type === "UNIT_TRAINED" ||
        e.type === "BUILDING_STARTED" ||
        e.type === "HERO_TRAINED" ||
        e.type === "UPGRADE_STARTED"
    );
    console.log("Build order events:", buildEvents.length);
    console.log("First 15:");
    for (const e of buildEvents.slice(0, 15)) {
      const p = e.payload as Record<string, unknown>;
      console.log(
        `  ${e.timestampMs}ms P${e.playerId} ${e.type}: ${p.name || p.itemId} [0x${(e.rawActionId ?? 0).toString(16)}]`
      );
    }
  });

  it("reports diagnostics", () => {
    const result = parseReplay(buffer);
    const { diagnostics } = result;

    console.log("Total blocks:", diagnostics.totalBlocks);
    console.log("Total timeslots:", diagnostics.totalTimeSlots);
    console.log("Total actions:", diagnostics.totalActions);
    console.log("Unknown action IDs:", Object.keys(diagnostics.unknownActionIds).length);
    console.log("Unknown item IDs:", Object.keys(diagnostics.unknownItemIds).length);
    console.log("Parse time:", Math.round(diagnostics.parseTimeMs), "ms");
    if (diagnostics.errors.length > 0) {
      console.log("Errors:", diagnostics.errors);
    }
    if (Object.keys(diagnostics.unknownItemIds).length > 0) {
      console.log("Top unknown items:",
        Object.entries(diagnostics.unknownItemIds)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      );
    }
  });
});
