/**
 * Resolves a replay's mapName string to a map slug.
 * Handles variations like "(2)Hammerfall", "w3c_240409_1839_Hammerfall", "Hammerfall v1.0"
 */

/**
 * Normalize a map name for matching: lowercase, strip prefixes/suffixes.
 */
function normalizeMapName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^\(\d+\)\s*/, "") // strip "(2)" prefix
    .replace(/^w3c_\d+_\d+_/, "") // strip "w3c_YYMMDD_HHMM_" prefix
    .replace(/_v?\d+(\.\d+)*\.w3x$/i, "") // strip "_v1.0.w3x" suffix
    .replace(/\s*v?\d+(\.\d+)*$/i, "") // strip " v1.0" suffix
    .replace(/\.w3x$/i, "") // strip ".w3x" extension
    .replace(/[_\s]+/g, "") // collapse separators
    .trim();
}

export interface MapAliasEntry {
  slug: string;
  aliases: string[];
}

/**
 * Resolve a replay map name to a map slug.
 * Checks against the provided alias entries.
 */
export function resolveMapSlug(
  mapName: string,
  aliasEntries: MapAliasEntry[]
): string | null {
  if (!mapName) return null;

  const normalized = normalizeMapName(mapName);

  for (const entry of aliasEntries) {
    // Check slug
    if (normalizeMapName(entry.slug) === normalized) {
      return entry.slug;
    }

    // Check aliases
    for (const alias of entry.aliases) {
      if (normalizeMapName(alias) === normalized) {
        return entry.slug;
      }
    }
  }

  // Partial match: check if normalized name contains or is contained by any alias
  for (const entry of aliasEntries) {
    const slugNorm = normalizeMapName(entry.slug);
    if (normalized.includes(slugNorm) || slugNorm.includes(normalized)) {
      return entry.slug;
    }

    for (const alias of entry.aliases) {
      const aliasNorm = normalizeMapName(alias);
      if (normalized.includes(aliasNorm) || aliasNorm.includes(normalized)) {
        return entry.slug;
      }
    }
  }

  return null;
}

/**
 * Extract a clean map name from a w3x filename.
 * "w3c_240409_1839_Hammerfall.w3x" → "Hammerfall"
 */
export function extractMapNameFromFilename(filename: string): string {
  return filename
    .replace(/^w3c_\d+_\d+_/, "") // strip W3C prefix
    .replace(/\.w3x$/i, "") // strip extension
    .replace(/_v?\d+(\.\d+)*$/i, "") // strip version suffix
    .replace(/_/g, " "); // underscores to spaces
}

/**
 * Generate a URL-friendly slug from a map name.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
