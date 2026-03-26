import { db } from "@/lib/db";
import { replays, replayEvents, replayAnalyses, replaySnapshots, players, maps, mapCreepCamps, creepCamps } from "@/lib/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReplayAnalysisPage } from "@/components/replay-analysis/replay-analysis-page";
import { ReanalyzeButton } from "@/components/replay-analysis/reanalyze-button";
import { TrackPlayerButton } from "@/components/players/track-player-button";
import { MapCampsPanel } from "@/components/replay-analysis/map-camps-panel";
import { CreepingTimeline } from "@/components/replay-analysis/creeping-timeline";
import { resolveMapSlug } from "@/lib/map/map-resolver";
import type { GameSnapshot, KeyMoment, GamePhase, PlayerBuildOrder, ProductionSummary, CreepingWindow } from "@/lib/engine/types";
import type { MapCampInfo } from "@/lib/engine/definitions-cache";

export const dynamic = "force-dynamic";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const EVENT_COLORS: Record<string, string> = {
  GAME_START: "text-white",
  PLAYER_INFO: "text-zinc-400",
  UNIT_TRAINED: "text-green-400",
  BUILDING_STARTED: "text-yellow-400",
  HERO_TRAINED: "text-orange-400",
  UPGRADE_STARTED: "text-blue-400",
  ABILITY_USED: "text-zinc-500",
  ITEM_USED: "text-purple-400",
  BUILD_CANCELLED: "text-red-400",
  CHAT_MESSAGE: "text-cyan-400",
  PLAYER_LEFT: "text-red-300",
  MINIMAP_PING: "text-zinc-600",
  GAME_END: "text-white",
  UNKNOWN_ACTION: "text-zinc-700",
};

export default async function ReplayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const replay = await db
    .select()
    .from(replays)
    .where(eq(replays.id, id))
    .limit(1);

  if (replay.length === 0) notFound();

  const r = replay[0];

  // Check which players are tracked
  const playerNames = [r.player1Name, r.player2Name].filter(Boolean) as string[];
  const trackedPlayers = playerNames.length > 0
    ? await db.select({ name: players.name }).from(players).where(inArray(players.name, playerNames))
    : [];
  const trackedSet = new Set(trackedPlayers.map((p) => p.name));

  // Load analysis data
  const analysis = await db
    .select()
    .from(replayAnalyses)
    .where(eq(replayAnalyses.replayId, id))
    .limit(1);

  const hasAnalysis = analysis.length > 0 && r.analysisStatus === "completed";

  let snapshots: GameSnapshot[] = [];
  let keyMoments: KeyMoment[] = [];
  let phases: { phase: GamePhase; startMs: number; endMs: number }[] = [];
  let eventTimestamps: number[] = [];
  let buildOrders: PlayerBuildOrder[] | undefined;
  let playerSummaries: ProductionSummary[] | undefined;
  let creepingWindows: CreepingWindow[] | undefined;

  // Resolve map camps
  const mapCampInfos: MapCampInfo[] = [];
  let resolvedMapSlug = "";
  let resolvedMapName = r.mapName || "";

  try {
    const allMaps = await db.select().from(maps);
    const aliasEntries = allMaps.map((m) => ({
      slug: m.slug,
      aliases: (m.aliases as string[]) ?? [],
    }));

    const slug = resolveMapSlug(r.mapName || "", aliasEntries);
    if (slug) {
      resolvedMapSlug = slug;
      const mapRow = allMaps.find((m) => m.slug === slug);
      if (mapRow) {
        resolvedMapName = mapRow.name;
        const campLinks = await db
          .select()
          .from(mapCreepCamps)
          .where(eq(mapCreepCamps.mapId, mapRow.id));

        for (const link of campLinks) {
          const [camp] = await db
            .select()
            .from(creepCamps)
            .where(eq(creepCamps.id, link.campId));
          if (camp) {
            mapCampInfos.push({
              campId: camp.id,
              label: link.label,
              posX: link.posX,
              posY: link.posY,
              camp: {
                name: camp.name,
                level: camp.level,
                creeps: camp.creeps,
                itemDropLevel: camp.itemDropLevel,
                xpTotal: camp.xpTotal,
                goldTotal: camp.goldTotal,
              },
            });
          }
        }
      }
    }
  } catch {
    // Maps table may not exist yet
  }

  if (hasAnalysis) {
    const snapshotRows = await db
      .select()
      .from(replaySnapshots)
      .where(eq(replaySnapshots.replayId, id))
      .orderBy(asc(replaySnapshots.timestampMs));

    snapshots = snapshotRows.map((row) => ({
      timestampMs: row.timestampMs,
      gamePhase: row.gamePhase as GamePhase,
      player1State: row.player1State,
      player2State: row.player2State,
      armyComparison: row.armyComparison,
      uncertaintyFlags: row.uncertaintyFlags,
    }));

    const gameSummary = analysis[0].gameSummary as {
      phases?: { phase: GamePhase; startMs: number; endMs: number }[];
      keyMoments?: KeyMoment[];
      playerSummaries?: ProductionSummary[];
      buildOrders?: PlayerBuildOrder[];
      creepingWindows?: CreepingWindow[];
    } | null;

    keyMoments = (analysis[0].keyMoments as KeyMoment[]) ?? [];
    phases = gameSummary?.phases ?? [];
    playerSummaries = gameSummary?.playerSummaries;
    buildOrders = gameSummary?.buildOrders;
    creepingWindows = gameSummary?.creepingWindows;

    // Get event timestamps for density bar
    const events = await db
      .select({ timestampMs: replayEvents.timestampMs })
      .from(replayEvents)
      .where(eq(replayEvents.replayId, id));
    eventTimestamps = events.map((e) => e.timestampMs);
  }

  // Load events for build order (always shown)
  const events = await db
    .select()
    .from(replayEvents)
    .where(eq(replayEvents.replayId, id))
    .orderBy(asc(replayEvents.timestampMs));

  const significantEvents = events.filter(
    (e) =>
      e.eventType !== "ABILITY_USED" &&
      e.eventType !== "UNKNOWN_ACTION" &&
      e.eventType !== "SELECTION_CHANGED" &&
      e.eventType !== "HOTKEY_ASSIGNED"
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link
        href="/replays"
        className="text-zinc-400 hover:text-white text-sm mb-4 inline-block"
      >
        &larr; Back to Vault
      </Link>

      {/* Match Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">
            {r.player1Name || "Player 1"} vs {r.player2Name || "Player 2"}
          </h1>
          <span className="text-zinc-400 text-sm">
            {r.durationMs ? formatTime(r.durationMs) : "--:--"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Map:</span>{" "}
            <span className="text-white">{r.mapName || "Unknown"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Version:</span>{" "}
            <span className="text-white">
              {r.replayVersion} v{r.gameVersion}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Player 1:</span>{" "}
            <span className="text-white">
              {r.player1Name} ({r.player1Race || "?"})
            </span>
            {r.player1Name && (
              <TrackPlayerButton
                playerName={r.player1Name}
                isTracked={trackedSet.has(r.player1Name)}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Player 2:</span>{" "}
            <span className="text-white">
              {r.player2Name} ({r.player2Race || "?"})
            </span>
            {r.player2Name && (
              <TrackPlayerButton
                playerName={r.player2Name}
                isTracked={trackedSet.has(r.player2Name)}
              />
            )}
          </div>
          <div>
            <span className="text-zinc-500">Parse Status:</span>{" "}
            <span
              className={
                r.parseStatus === "completed"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {r.parseStatus}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Analysis:</span>{" "}
            <span
              className={
                hasAnalysis
                  ? "text-green-400"
                  : "text-zinc-500"
              }
            >
              {hasAnalysis ? "completed" : r.analysisStatus ?? "pending"}
            </span>
          </div>
        </div>

        {r.parseError && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
            {r.parseError}
          </div>
        )}

        {/* Re-analyze button: show when parsed but analysis failed/pending, or to re-run */}
        {r.parseStatus === "completed" && (
          <div className="mt-4">
            <ReanalyzeButton
              replayId={r.id}
              currentStatus={r.analysisStatus ?? "pending"}
            />
          </div>
        )}
      </div>

      {/* Map Creep Camps */}
      {mapCampInfos.length > 0 && (
        <div className="mb-6">
          <MapCampsPanel
            mapName={resolvedMapName}
            mapSlug={resolvedMapSlug}
            camps={mapCampInfos}
          />
        </div>
      )}

      {/* Creeping Timeline */}
      {hasAnalysis && creepingWindows && creepingWindows.length > 0 && (
        <div className="mb-6">
          <CreepingTimeline
            creepingWindows={creepingWindows}
            durationMs={r.durationMs ?? 0}
            player1Name={r.player1Name || "Player 1"}
            player2Name={r.player2Name || "Player 2"}
            player1Id={1}
            player2Id={2}
          />
        </div>
      )}

      {/* Analysis View */}
      {hasAnalysis && snapshots.length > 0 && (
        <div className="mb-6">
          <ReplayAnalysisPage
            replay={{
              id: r.id,
              player1Name: r.player1Name,
              player2Name: r.player2Name,
              player1Race: r.player1Race,
              player2Race: r.player2Race,
              durationMs: r.durationMs,
              mapName: r.mapName,
            }}
            snapshots={snapshots}
            keyMoments={keyMoments}
            phases={phases}
            eventTimestamps={eventTimestamps}
            buildOrders={buildOrders}
            playerSummaries={playerSummaries}
          />
        </div>
      )}

      {/* Build Order / Event Stream */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Build Order ({significantEvents.length} events)
        </h2>

        <div className="space-y-1 font-mono text-sm max-h-[600px] overflow-y-auto">
          {significantEvents.map((event) => {
            const payload = event.payload as Record<string, unknown>;
            const name = payload?.name as string | undefined;
            const itemId = payload?.itemId as string | undefined;

            return (
              <div key={event.id} className="flex items-baseline gap-3">
                <span className="text-zinc-600 w-14 text-right shrink-0">
                  {formatTime(event.timestampMs)}
                </span>
                <span className="text-zinc-500 w-5 text-right shrink-0">
                  P{event.playerId}
                </span>
                <span
                  className={`${EVENT_COLORS[event.eventType] || "text-zinc-500"}`}
                >
                  {event.eventType}
                  {name ? `: ${name}` : ""}
                  {!name && itemId ? ` [${itemId}]` : ""}
                  {event.eventType === "CHAT_MESSAGE"
                    ? `: ${payload?.message}`
                    : ""}
                  {event.eventType === "PLAYER_INFO"
                    ? `: ${payload?.name} (${payload?.race})`
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
