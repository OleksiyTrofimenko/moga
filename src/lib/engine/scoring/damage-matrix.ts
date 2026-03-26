/**
 * WC3 attack type vs armor type damage multiplier matrix.
 *
 * Rows: attack types (normal, pierce, siege, magic, chaos, hero)
 * Columns: armor types (light, medium, heavy, fortified, hero, unarmored)
 *
 * Values represent damage multipliers (1.0 = full damage).
 * Source: Warcraft III game data.
 */

export type AttackType = "normal" | "pierce" | "siege" | "magic" | "chaos" | "hero";
export type ArmorType = "light" | "medium" | "heavy" | "fortified" | "hero" | "unarmored";

const MATRIX: Record<AttackType, Record<ArmorType, number>> = {
  normal: {
    light: 1.0,
    medium: 1.5,
    heavy: 1.0,
    fortified: 0.7,
    hero: 1.0,
    unarmored: 1.0,
  },
  pierce: {
    light: 2.0,
    medium: 0.75,
    heavy: 1.0,
    fortified: 0.35,
    hero: 0.5,
    unarmored: 1.5,
  },
  siege: {
    light: 1.0,
    medium: 0.5,
    heavy: 1.0,
    fortified: 1.5,
    hero: 0.5,
    unarmored: 1.5,
  },
  magic: {
    light: 1.25,
    medium: 0.75,
    heavy: 2.0,
    fortified: 0.35,
    hero: 0.5,
    unarmored: 1.0,
  },
  chaos: {
    light: 1.0,
    medium: 1.0,
    heavy: 1.0,
    fortified: 1.0,
    hero: 1.0,
    unarmored: 1.0,
  },
  hero: {
    light: 1.0,
    medium: 1.0,
    heavy: 1.0,
    fortified: 0.5,
    hero: 1.0,
    unarmored: 1.0,
  },
};

/**
 * Get the damage multiplier for a given attack type vs armor type.
 */
export function getDamageMultiplier(attack: AttackType, armor: ArmorType): number {
  return MATRIX[attack]?.[armor] ?? 1.0;
}

/**
 * Get the full damage matrix (for testing/display).
 */
export function getDamageMatrix(): Record<AttackType, Record<ArmorType, number>> {
  return MATRIX;
}
