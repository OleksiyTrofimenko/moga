import { describe, it, expect } from "vitest";
import { getDamageMultiplier, getDamageMatrix } from "../scoring/damage-matrix";
import type { AttackType, ArmorType } from "../scoring/damage-matrix";

describe("damage-matrix", () => {
  it("returns correct multiplier for all 36 attack/armor combinations", () => {
    const matrix = getDamageMatrix();
    const attackTypes: AttackType[] = ["normal", "pierce", "siege", "magic", "chaos", "hero"];
    const armorTypes: ArmorType[] = ["light", "medium", "heavy", "fortified", "hero", "unarmored"];

    // Verify all 36 entries exist
    for (const atk of attackTypes) {
      for (const arm of armorTypes) {
        const value = matrix[atk][arm];
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(2.0);
      }
    }
  });

  it("chaos does full damage against everything", () => {
    const armorTypes: ArmorType[] = ["light", "medium", "heavy", "fortified", "hero", "unarmored"];
    for (const armor of armorTypes) {
      expect(getDamageMultiplier("chaos", armor)).toBe(1.0);
    }
  });

  it("pierce is strong vs light, weak vs fortified", () => {
    expect(getDamageMultiplier("pierce", "light")).toBe(2.0);
    expect(getDamageMultiplier("pierce", "fortified")).toBe(0.35);
  });

  it("siege is strong vs fortified", () => {
    expect(getDamageMultiplier("siege", "fortified")).toBe(1.5);
  });

  it("magic is strong vs heavy", () => {
    expect(getDamageMultiplier("magic", "heavy")).toBe(2.0);
  });

  it("hero does half damage to fortified", () => {
    expect(getDamageMultiplier("hero", "fortified")).toBe(0.5);
  });

  it("returns 1.0 for unknown types", () => {
    expect(getDamageMultiplier("unknown" as AttackType, "light")).toBe(1.0);
  });
});
