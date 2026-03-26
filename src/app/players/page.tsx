import { getAllPlayers } from "@/lib/players/queries";
import { PlayerCard } from "@/components/players/player-card";

export const metadata = {
  title: "Players — WC3 Helper",
};

export default async function PlayersPage() {
  const players = await getAllPlayers();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Players</h1>

      {players.length === 0 ? (
        <p className="text-zinc-500">
          No players found. Upload some replays first.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((player) => (
            <PlayerCard key={player.name} player={player} />
          ))}
        </div>
      )}
    </main>
  );
}
