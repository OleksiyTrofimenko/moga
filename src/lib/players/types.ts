export interface PlayerOverview {
  playerName: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  mostPlayedRace: string;
  raceCounts: Record<string, number>;
}

export interface HeroUsage {
  heroName: string;
  gamesUsed: number;
  totalGames: number;
}

export interface CommonOpening {
  entries: string[];
  count: number;
}

export interface MatchupStats {
  opponentRace: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  heroUsage: HeroUsage[];
  commonOpenings: CommonOpening[];
}

export interface RecentGame {
  replayId: string;
  opponentName: string;
  opponentRace: string | null;
  playerRace: string | null;
  won: boolean | null;
  durationMs: number | null;
  mapName: string | null;
  createdAt: Date;
}

export interface PlayerPageData {
  overview: PlayerOverview;
  matchups: MatchupStats[];
  recentGames: RecentGame[];
}

export interface PlayerListEntry {
  name: string;
  gamesPlayed: number;
  mostPlayedRace: string;
  winRate: number;
}
