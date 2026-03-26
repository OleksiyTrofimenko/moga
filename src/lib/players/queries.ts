import { db } from "@/lib/db";
import { replays, replayAnalyses, players } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import type {
  PlayerListEntry,
  PlayerPageData,
  PlayerOverview,
  MatchupStats,
  RecentGame,
  HeroUsage,
  CommonOpening,
} from "./types";
import type { GameSummary, PlayerBuildOrder } from "@/lib/engine/types";

interface ReplayRow {
  id: string;
  player1Name: string | null;
  player1Race: string | null;
  player2Name: string | null;
  player2Race: string | null;
  winner: string | null;
  durationMs: number | null;
  mapName: string | null;
  createdAt: Date;
}

function normalizePlayerName(name: string): string {
  return name.toLowerCase().trim();
}

function isPlayerMatch(dbName: string | null, searchName: string): boolean {
  if (!dbName) return false;
  return normalizePlayerName(dbName) === normalizePlayerName(searchName);
}

function getMostPlayedRace(raceCounts: Record<string, number>): string {
  let max = 0;
  let best = "unknown";
  for (const [race, count] of Object.entries(raceCounts)) {
    if (count > max) {
      max = count;
      best = race;
    }
  }
  return best;
}

export async function getAllPlayers(): Promise<PlayerListEntry[]> {
  // Only return players that have been explicitly tracked
  const trackedPlayers = await db.select({ name: players.name }).from(players);
  if (trackedPlayers.length === 0) return [];

  const trackedNames = new Set(trackedPlayers.map((p) => normalizePlayerName(p.name)));

  const rows = await db
    .select({
      player1Name: replays.player1Name,
      player1Race: replays.player1Race,
      player2Name: replays.player2Name,
      player2Race: replays.player2Race,
      winner: replays.winner,
    })
    .from(replays)
    .where(eq(replays.parseStatus, "completed"));

  const playerMap = new Map<
    string,
    { displayName: string; games: number; wins: number; raceCounts: Record<string, number> }
  >();

  function accumulatePlayer(
    name: string | null,
    race: string | null,
    won: boolean,
  ) {
    if (!name) return;
    const key = normalizePlayerName(name);
    if (!trackedNames.has(key)) return;
    let entry = playerMap.get(key);
    if (!entry) {
      entry = { displayName: name, games: 0, wins: 0, raceCounts: {} };
      playerMap.set(key, entry);
    }
    entry.games++;
    if (won) entry.wins++;
    if (race) {
      entry.raceCounts[race] = (entry.raceCounts[race] || 0) + 1;
    }
  }

  for (const row of rows) {
    const p1Won = row.winner ? isPlayerMatch(row.player1Name, row.winner) : false;
    const p2Won = row.winner ? isPlayerMatch(row.player2Name, row.winner) : false;
    accumulatePlayer(row.player1Name, row.player1Race, p1Won);
    accumulatePlayer(row.player2Name, row.player2Race, p2Won);
  }

  const result: PlayerListEntry[] = [];
  for (const entry of playerMap.values()) {
    result.push({
      name: entry.displayName,
      gamesPlayed: entry.games,
      mostPlayedRace: getMostPlayedRace(entry.raceCounts),
      winRate: entry.games > 0 ? entry.wins / entry.games : 0,
    });
  }

  result.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  return result;
}

export async function getPlayerStats(
  playerName: string,
): Promise<PlayerPageData | null> {
  const allReplays = await db
    .select({
      id: replays.id,
      player1Name: replays.player1Name,
      player1Race: replays.player1Race,
      player2Name: replays.player2Name,
      player2Race: replays.player2Race,
      winner: replays.winner,
      durationMs: replays.durationMs,
      mapName: replays.mapName,
      createdAt: replays.createdAt,
    })
    .from(replays)
    .where(eq(replays.parseStatus, "completed"));

  // Filter to replays involving this player
  const playerReplays = allReplays.filter(
    (r) =>
      isPlayerMatch(r.player1Name, playerName) ||
      isPlayerMatch(r.player2Name, playerName),
  );

  if (playerReplays.length === 0) return null;

  // Normalize perspective
  interface NormalizedReplay {
    row: ReplayRow;
    playerRace: string | null;
    opponentName: string;
    opponentRace: string | null;
    won: boolean | null;
    playerId: number;
  }

  const normalized: NormalizedReplay[] = playerReplays.map((r) => {
    const isPlayer1 = isPlayerMatch(r.player1Name, playerName);
    const playerRace = isPlayer1 ? r.player1Race : r.player2Race;
    const opponentName = isPlayer1
      ? r.player2Name || "Unknown"
      : r.player1Name || "Unknown";
    const opponentRace = isPlayer1 ? r.player2Race : r.player1Race;
    const won = r.winner
      ? isPlayer1
        ? isPlayerMatch(r.player1Name, r.winner)
        : isPlayerMatch(r.player2Name, r.winner)
      : null;
    const playerId = isPlayer1 ? 0 : 1;
    return { row: r, playerRace, opponentName, opponentRace, won, playerId };
  });

  // Build overview
  const raceCounts: Record<string, number> = {};
  let wins = 0;
  for (const n of normalized) {
    if (n.playerRace) {
      raceCounts[n.playerRace] = (raceCounts[n.playerRace] || 0) + 1;
    }
    if (n.won) wins++;
  }

  const displayName =
    normalized[0].row[
      isPlayerMatch(normalized[0].row.player1Name, playerName)
        ? "player1Name"
        : "player2Name"
    ] || playerName;

  const overview: PlayerOverview = {
    playerName: displayName,
    totalGames: normalized.length,
    wins,
    losses: normalized.filter((n) => n.won === false).length,
    winRate: normalized.length > 0 ? wins / normalized.length : 0,
    mostPlayedRace: getMostPlayedRace(raceCounts),
    raceCounts,
  };

  // Fetch analyses
  const replayIds = playerReplays.map((r) => r.id);
  const analyses =
    replayIds.length > 0
      ? await db
          .select({
            replayId: replayAnalyses.replayId,
            gameSummary: replayAnalyses.gameSummary,
          })
          .from(replayAnalyses)
          .where(inArray(replayAnalyses.replayId, replayIds))
      : [];

  const analysisMap = new Map<string, GameSummary>();
  for (const a of analyses) {
    if (a.gameSummary) {
      analysisMap.set(a.replayId, a.gameSummary);
    }
  }

  // Group by opponent race for matchup stats
  const matchupMap = new Map<
    string,
    {
      games: NormalizedReplay[];
      wins: number;
    }
  >();

  for (const n of normalized) {
    const race = n.opponentRace || "unknown";
    let entry = matchupMap.get(race);
    if (!entry) {
      entry = { games: [], wins: 0 };
      matchupMap.set(race, entry);
    }
    entry.games.push(n);
    if (n.won) entry.wins++;
  }

  const matchups: MatchupStats[] = [];
  for (const [opponentRace, data] of matchupMap) {
    // Hero usage
    const heroCounts = new Map<string, number>();
    let gamesWithHeroData = 0;

    // Common openers
    const openerKeys = new Map<string, { entries: string[]; count: number }>();

    for (const n of data.games) {
      const summary = analysisMap.get(n.row.id);
      if (!summary) continue;

      // Hero timeline from playerSummaries
      if (summary.playerSummaries) {
        const playerSummary = summary.playerSummaries.find(
          (ps) => ps.playerId === n.playerId,
        );
        if (playerSummary) {
          gamesWithHeroData++;
          const trainedHeroes = playerSummary.heroTimeline
            .filter((h) => h.event === "trained")
            .map((h) => h.heroName);
          const uniqueHeroes = [...new Set(trainedHeroes)];
          for (const hero of uniqueHeroes) {
            heroCounts.set(hero, (heroCounts.get(hero) || 0) + 1);
          }
        }
      }

      // Build orders
      if (summary.buildOrders) {
        const playerBo = summary.buildOrders.find(
          (bo: PlayerBuildOrder) => bo.playerId === n.playerId,
        );
        if (playerBo) {
          const openerEntries = playerBo.entries
            .filter((e) => !e.isCancelled && e.action !== "item")
            .slice(0, 10)
            .map((e) => e.name);
          const key = openerEntries.join(" → ");
          const existing = openerKeys.get(key);
          if (existing) {
            existing.count++;
          } else {
            openerKeys.set(key, { entries: openerEntries, count: 1 });
          }
        }
      }
    }

    const heroUsage: HeroUsage[] = [...heroCounts.entries()]
      .map(([heroName, gamesUsed]) => ({
        heroName,
        gamesUsed,
        totalGames: gamesWithHeroData,
      }))
      .sort((a, b) => b.gamesUsed - a.gamesUsed);

    const commonOpenings: CommonOpening[] = [...openerKeys.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    matchups.push({
      opponentRace,
      gamesPlayed: data.games.length,
      wins: data.wins,
      winRate: data.games.length > 0 ? data.wins / data.games.length : 0,
      heroUsage,
      commonOpenings,
    });
  }

  matchups.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // Recent games
  const recentGames: RecentGame[] = normalized
    .sort((a, b) => b.row.createdAt.getTime() - a.row.createdAt.getTime())
    .slice(0, 10)
    .map((n) => ({
      replayId: n.row.id,
      opponentName: n.opponentName,
      opponentRace: n.opponentRace,
      playerRace: n.playerRace,
      won: n.won,
      durationMs: n.row.durationMs,
      mapName: n.row.mapName,
      createdAt: n.row.createdAt,
    }));

  return { overview, matchups, recentGames };
}
