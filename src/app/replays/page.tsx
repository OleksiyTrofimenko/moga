import { db } from "@/lib/db";
import { replays } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { UploadForm } from "@/components/replays/upload-form";
import { ReplayCard } from "@/components/replays/replay-card";

export const dynamic = "force-dynamic";

export default async function ReplaysPage() {
  const replayList = await db
    .select()
    .from(replays)
    .orderBy(desc(replays.createdAt))
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Replay Vault</h1>

      <div className="mb-8">
        <UploadForm />
      </div>

      {replayList.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">
          No replays yet. Upload a .w3g file to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {replayList.map((replay) => (
            <ReplayCard
              key={replay.id}
              id={replay.id}
              player1Name={replay.player1Name}
              player1Race={replay.player1Race}
              player2Name={replay.player2Name}
              player2Race={replay.player2Race}
              mapName={replay.mapName}
              durationMs={replay.durationMs}
              parseStatus={replay.parseStatus}
              createdAt={replay.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
