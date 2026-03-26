import type { BuildOrderEntry } from "@/lib/engine/types";

const ACTION_BADGE: Record<string, { label: string; color: string }> = {
  unit: { label: "Unit", color: "bg-green-900/50 text-green-400 border-green-800" },
  building: { label: "Bldg", color: "bg-yellow-900/50 text-yellow-400 border-yellow-800" },
  hero: { label: "Hero", color: "bg-orange-900/50 text-orange-400 border-orange-800" },
  upgrade: { label: "Upg", color: "bg-blue-900/50 text-blue-400 border-blue-800" },
  item: { label: "Item", color: "bg-purple-900/50 text-purple-400 border-purple-800" },
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface BuildOrderPanelProps {
  playerName: string;
  race: string;
  entries: BuildOrderEntry[];
}

export function BuildOrderPanel({ playerName, race, entries }: BuildOrderPanelProps) {
  // Filter out items by default for cleaner view
  const buildEntries = entries.filter((e) => e.action !== "item");

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-2">
        {playerName}{" "}
        <span className="text-zinc-500 font-normal">({race})</span>
      </h3>
      <div className="space-y-0.5 font-mono text-xs max-h-[500px] overflow-y-auto">
        {buildEntries.map((entry, i) => {
          const badge = ACTION_BADGE[entry.action];
          return (
            <div
              key={i}
              className={`flex items-center gap-2 py-0.5 ${
                entry.isCancelled ? "opacity-50" : ""
              }`}
            >
              <span className="text-zinc-600 w-10 text-right shrink-0">
                {formatTime(entry.timestampMs)}
              </span>
              <span
                className={`px-1 py-0.5 rounded text-[10px] border shrink-0 w-9 text-center ${badge?.color ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
              >
                {badge?.label ?? "?"}
              </span>
              <span
                className={`text-zinc-200 ${entry.isCancelled ? "line-through text-red-400" : ""}`}
              >
                {entry.name}
              </span>
              {entry.action !== "upgrade" && (
                <span className="text-zinc-600 shrink-0">
                  {entry.supplyAtTime}/{entry.maxSupplyAtTime}
                </span>
              )}
              {(entry.goldCost > 0 || entry.lumberCost > 0) && (
                <span className="text-zinc-600 shrink-0 ml-auto">
                  {entry.goldCost > 0 && (
                    <span className="text-yellow-600">{entry.goldCost}g</span>
                  )}
                  {entry.lumberCost > 0 && (
                    <span className="text-green-700 ml-1">{entry.lumberCost}w</span>
                  )}
                </span>
              )}
              {entry.isCancelled && (
                <span className="text-red-500 text-[10px] ml-auto">CANCELLED</span>
              )}
            </div>
          );
        })}
        {buildEntries.length === 0 && (
          <div className="text-zinc-600 py-4 text-center">No build order data</div>
        )}
      </div>
    </div>
  );
}
