/**
 * Public API for the game intelligence engine.
 */

export { analyzeReplay } from "./snapshot-generator";
export { loadDefinitions } from "./definitions-cache";
export type { DefinitionsCache } from "./definitions-cache";
export type {
  GameSnapshot,
  PlayerSnapshot,
  HeroSnapshot,
  EconomySnapshot,
  ArmyScore,
  ArmyComparison,
  KeyMoment,
  GameSummary,
  AnalysisResult,
  GamePhase,
  AnalysisStatus,
  UncertaintyFlags,
  EngagementWindow,
  KeyMomentType,
  UnitCount,
  BuildingState,
  UpgradeState,
  ItemSnapshot,
  UpkeepBracket,
} from "./types";
