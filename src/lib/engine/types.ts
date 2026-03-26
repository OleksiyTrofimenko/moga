/**
 * Phase 2: Game intelligence types.
 * These represent reconstructed game state from replay events.
 */

export type GamePhase =
  | "opening"
  | "early"
  | "early_mid"
  | "mid"
  | "mid_late"
  | "late";

export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export type UpkeepBracket = "none" | "low" | "high";

export interface AbilitySnapshot {
  gameId: string;
  name: string;
  level: number;
  isUltimate: boolean;
}

export interface HeroSnapshot {
  gameId: string;
  name: string;
  level: number;
  xp: number;
  items: ItemSnapshot[];
  abilities: AbilitySnapshot[];
  alive: boolean;
  reviveCount: number;
  isEstimated: boolean;
}

export interface ItemSnapshot {
  gameId: string;
  name: string;
  slot: number;
}

export interface UnitCount {
  gameId: string;
  name: string;
  count: number;
  supply: number;
  goldCost: number;
  lumberCost: number;
  isEstimated: boolean;
}

export interface BuildingState {
  gameId: string;
  name: string;
  count: number;
  /** Buildings still under construction */
  inProgressCount: number;
}

export interface UpgradeState {
  gameId: string;
  name: string;
  currentLevel: number;
  maxLevel: number;
  /** Currently researching */
  inProgress: boolean;
}

export interface EconomySnapshot {
  goldEstimate: number;
  lumberEstimate: number;
  goldIncome: number;
  lumberIncome: number;
  workerCount: number;
  miningWorkers: number;
  lumberWorkers: number;
  upkeepBracket: UpkeepBracket;
  totalGoldSpent: number;
  totalLumberSpent: number;
  isEstimated: boolean;
}

export interface PlayerSnapshot {
  playerId: number;
  playerName: string;
  race: string;
  heroes: HeroSnapshot[];
  units: UnitCount[];
  buildings: BuildingState[];
  upgrades: UpgradeState[];
  economy: EconomySnapshot;
  currentSupply: number;
  maxSupply: number;
  tier: number;
}

export interface ArmyScore {
  /** Raw resource-based value */
  absoluteScore: number;
  /** Score adjusted for matchup and tempo */
  matchupScore: number;
  /** 0-100 confidence in winning an engagement */
  attackConfidence: number;
  /** Breakdown */
  unitScore: number;
  heroScore: number;
  itemScore: number;
  upgradeScore: number;
  matchupModifier: number;
  tempoModifier: number;
}

export interface ArmyComparison {
  player1Score: ArmyScore;
  player2Score: ArmyScore;
  /** Ratio of matchup scores: >1 means player1 favored */
  ratio: number;
  doNotFight: boolean;
  doNotFightReason?: string;
}

export interface GameSnapshot {
  timestampMs: number;
  gamePhase: GamePhase;
  player1State: PlayerSnapshot;
  player2State: PlayerSnapshot;
  armyComparison: ArmyComparison;
  uncertaintyFlags: UncertaintyFlags;
}

export interface UncertaintyFlags {
  unitCountsEstimated: boolean;
  economyEstimated: boolean;
  heroLevelsEstimated: boolean;
  reasons: string[];
}

export type KeyMomentType =
  | "tier_up"
  | "hero_level"
  | "hero_death"
  | "expansion"
  | "power_spike"
  | "fight_detected"
  | "tech_upgrade";

export interface KeyMoment {
  timestampMs: number;
  type: KeyMomentType;
  playerId: number;
  description: string;
  /** 1-10 significance rating */
  significance: number;
  data?: Record<string, unknown>;
}

export interface EngagementWindow {
  startMs: number;
  endMs: number;
  intensity: number;
  involvedPlayers: number[];
  heroDeaths: string[];
}

export interface CreepingWindow {
  startMs: number;
  endMs: number;
  playerId: number;
  estimatedXpGained: number;
  itemsDropped: string[];
  inferredCampLevel?: number;
}

export interface GameSummary {
  durationMs: number;
  player1Race: string;
  player2Race: string;
  phases: { phase: GamePhase; startMs: number; endMs: number }[];
  totalEngagements: number;
  keyMoments: KeyMoment[];
  finalScore: ArmyComparison;
  playerSummaries?: ProductionSummary[];
  buildOrders?: PlayerBuildOrder[];
  creepingWindows?: CreepingWindow[];
}

// =====================
// BUILD ORDER TYPES
// =====================

export type BuildOrderAction = "unit" | "building" | "hero" | "upgrade" | "item";

export interface BuildOrderEntry {
  timestampMs: number;
  playerId: number;
  action: BuildOrderAction;
  gameId: string;
  name: string;
  supplyAtTime: number;
  maxSupplyAtTime: number;
  workerCount: number;
  goldCost: number;
  lumberCost: number;
  gamePhase: GamePhase;
  isCancelled: boolean;
}

export interface PlayerBuildOrder {
  playerId: number;
  playerName: string;
  race: string;
  entries: BuildOrderEntry[];
}

// =====================
// PRODUCTION SUMMARY TYPES
// =====================

export interface ProductionEntry {
  gameId: string;
  name: string;
  count: number;
  totalGold: number;
  totalLumber: number;
}

export interface LossEntry {
  gameId: string;
  name: string;
  count: number;
}

export interface UpgradeCompletionEntry {
  gameId: string;
  name: string;
  level: number;
  completedAtMs: number;
}

export type HeroTimelineEventType =
  | "trained"
  | "level_up"
  | "ability_learned"
  | "item_acquired"
  | "died"
  | "revived";

export interface HeroTimelineEntry {
  heroGameId: string;
  heroName: string;
  event: HeroTimelineEventType;
  timestampMs: number;
  detail: string;
}

export interface ProductionSummary {
  playerId: number;
  playerName: string;
  race: string;
  unitsProduced: ProductionEntry[];
  unitsLost: LossEntry[];
  buildingsBuilt: ProductionEntry[];
  upgradesCompleted: UpgradeCompletionEntry[];
  heroTimeline: HeroTimelineEntry[];
  totalGoldSpent: number;
  totalLumberSpent: number;
}

export interface AnalysisResult {
  snapshots: GameSnapshot[];
  analysis: {
    status: AnalysisStatus;
    snapshotCount: number;
    snapshotIntervalMs: number;
    gameSummary: GameSummary;
    keyMoments: KeyMoment[];
    buildOrders?: PlayerBuildOrder[];
  };
}
