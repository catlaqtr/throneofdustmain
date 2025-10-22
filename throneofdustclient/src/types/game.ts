// Backend API Types - matching the Java backend exactly

// Enums matching backend
export enum BuildingType {
  LUMBER_MILL = "LUMBER_MILL",
  QUARRY = "QUARRY",
  MINE = "MINE",
  TREASURY = "TREASURY",
  STOREHOUSE = "STOREHOUSE",
  TOWN_HALL = "TOWN_HALL",
  TRAINING_YARD = "TRAINING_YARD",
  RADAR = "RADAR",
}

export enum CharacterClass {
  WARRIOR = "WARRIOR",
  ROGUE = "ROGUE",
  MEDIC = "MEDIC",
  SCOUT = "SCOUT",
}

export enum CharacterStatus {
  IDLE = "IDLE",
  IN_RAID = "IN_RAID",
  DEAD = "DEAD",
}

export enum TraitType {
  STEADY_HAND = "STEADY_HAND",
  SCOUTS_EYE = "SCOUTS_EYE",
  MEDIC = "MEDIC",
  LOOTER = "LOOTER",
  CAUTIOUS = "CAUTIOUS",
  RECKLESS = "RECKLESS",
  UNTRUSTWORTHY = "UNTRUSTWORTHY",
}

export enum RaidMapTemplate {
  ABANDONED_OUTPOST = "ABANDONED_OUTPOST",
  RUINED_FORT = "RUINED_FORT",
  DEEP_WARRENS = "DEEP_WARRENS",
}

export enum RaidStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export enum MapDifficulty {
  EASY = "EASY",
  NORMAL = "NORMAL",
  HARD = "HARD",
}

// Core entities matching backend models
export interface Building {
  id: number;
  type: BuildingType;
  level: number;
  lastCollectedAt: string; // ISO string
  lastActionAt?: string; // ISO string
  recruitsCount: number;
}

export interface GameCharacter {
  id: number;
  name: string;
  characterClass: CharacterClass;
  status: CharacterStatus;
  level: number;
  xp: number;
  traits: TraitType[];
  createdAt: string; // ISO string
}

export interface Raid {
  id: number;
  map: RaidMapTemplate;
  status: RaidStatus;
  allyMode: boolean;
  members: GameCharacter[];
  startAt: string; // ISO string
  endAt: string; // ISO string
  success?: boolean;
  lootGold?: number;
  lootScrap?: number;
  betrayalOccurred?: boolean;
  extractionSuccess?: boolean;
  casualties?: number;
}

// API Response types
export interface PlayerState {
  wood: number;
  stone: number;
  scrap: number;
  gold: number;
  buildings: Building[];
  characters: GameCharacter[];
}

// Storage limits interface
export interface StorageLimits {
  wood: number;
  stone: number;
  scrap: number;
  gold: number;
}

export interface CollectResponse {
  wood: number;
  stone: number;
  scrap: number;
  gold: number;
}

export interface UpgradeResponse {
  newLevel: number;
  goldRemaining: number;
}

export interface ErrorResponse {
  message: string;
}

// Request types
export interface RecruitRequest {
  characterClass?: CharacterClass;
  traits?: TraitType[];
}

export interface StartRaidRequest {
  map: RaidMapTemplate;
  memberIds: number[];
  allyMode: boolean;
}

export interface AddTraitRequest {
  trait: TraitType;
}

// Map template data (matching backend enum values)
export interface MapTemplateData {
  difficulty: MapDifficulty;
  durationMinutes: number;
  entryCostGold: number;
  baseRaidFail: number;
  baseExtractFail: number;
  goldMin: number;
  goldMax: number;
  scrapMin: number;
  scrapMax: number;
  mapCap: number;
}

// UI State
export interface UIState {
  currentView: ViewType;
  selectedRaidTemplate: RaidMapTemplate | null;
  selectedSquad: GameCharacter[];
  allyMode: boolean;
  loading: boolean;
  error: string | null;
}

export enum ViewType {
  OVERVIEW = "OVERVIEW",
  BUILDINGS = "BUILDINGS",
  CHARACTERS = "CHARACTERS",
  RAIDS = "RAIDS",
  ACTIVE_RAIDS = "ACTIVE_RAIDS",
}

// Map template constants (matching backend) - Improved balance
export const MAP_TEMPLATES: Record<RaidMapTemplate, MapTemplateData> = {
  [RaidMapTemplate.ABANDONED_OUTPOST]: {
    difficulty: MapDifficulty.EASY,
    durationMinutes: 5,
    entryCostGold: 10,
    baseRaidFail: 0.15,
    baseExtractFail: 0.15,
    goldMin: 12, // Increased from 8
    goldMax: 20, // Increased from 14
    scrapMin: 3, // Increased from 2
    scrapMax: 8, // Increased from 5
    mapCap: 2,
  },
  [RaidMapTemplate.RUINED_FORT]: {
    difficulty: MapDifficulty.NORMAL,
    durationMinutes: 15,
    entryCostGold: 25,
    baseRaidFail: 0.35,
    baseExtractFail: 0.25,
    goldMin: 30, // Increased from 20
    goldMax: 50, // Increased from 35
    scrapMin: 10, // Increased from 6
    scrapMax: 18, // Increased from 12
    mapCap: 3,
  },
  [RaidMapTemplate.DEEP_WARRENS]: {
    difficulty: MapDifficulty.HARD,
    durationMinutes: 45,
    entryCostGold: 60,
    baseRaidFail: 0.55,
    baseExtractFail: 0.35,
    goldMin: 80, // Increased from 60
    goldMax: 140, // Increased from 110
    scrapMin: 25, // Increased from 18
    scrapMax: 40, // Increased from 30
    mapCap: 4,
  },
};
