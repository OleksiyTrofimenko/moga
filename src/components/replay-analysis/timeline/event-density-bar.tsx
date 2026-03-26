"use client";

interface EventDensityBarProps {
  durationMs: number;
  /** Action counts per 10-second bucket */
  densityBuckets: number[];
}

export function EventDensityBar({
  durationMs,
  densityBuckets,
}: EventDensityBarProps) {
  if (densityBuckets.length === 0 || durationMs <= 0) return null;

  const maxDensity = densityBuckets.length > 0 ? Math.max(...densityBuckets, 1) : 1;

  return (
    <div className="flex h-3 gap-px rounded overflow-hidden">
      {densityBuckets.map((count, i) => {
        const intensity = count / maxDensity;
        const opacity = Math.max(0.1, intensity);
        return (
          <div
            key={i}
            className="flex-1 bg-emerald-500 rounded-sm"
            style={{ opacity }}
            title={`${count} actions`}
          />
        );
      })}
    </div>
  );
}

/**
 * Build density buckets from snapshot data.
 */
export function buildDensityBuckets(
  eventTimestamps: number[],
  durationMs: number,
  bucketSizeMs: number = 10000
): number[] {
  const bucketCount = Math.ceil(durationMs / bucketSizeMs);
  const buckets = new Array(bucketCount).fill(0);

  for (const ts of eventTimestamps) {
    const idx = Math.min(
      Math.floor(ts / bucketSizeMs),
      bucketCount - 1
    );
    if (idx >= 0) buckets[idx]++;
  }

  return buckets;
}
