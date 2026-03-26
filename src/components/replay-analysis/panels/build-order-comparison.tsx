import type { PlayerBuildOrder } from "@/lib/engine/types";
import { BuildOrderPanel } from "./build-order-panel";

interface BuildOrderComparisonProps {
  buildOrders: PlayerBuildOrder[];
}

export function BuildOrderComparison({ buildOrders }: BuildOrderComparisonProps) {
  const p1 = buildOrders[0];
  const p2 = buildOrders[1];

  if (!p1 || !p2) {
    return <div className="text-zinc-500 text-center py-8">No build order data available</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <BuildOrderPanel
          playerName={p1.playerName}
          race={p1.race}
          entries={p1.entries}
        />
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <BuildOrderPanel
          playerName={p2.playerName}
          race={p2.race}
          entries={p2.entries}
        />
      </div>
    </div>
  );
}
