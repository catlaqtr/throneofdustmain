import { PlayerState, StorageLimits, BuildingType } from "@/types/game";

// Base storage limits (without storehouse) - Improved balance
const BASE_STORAGE = {
  wood: 1500, // Increased from 1000
  stone: 1500, // Increased from 1000
  scrap: 1500, // Increased from 1000
  gold: 10000, // Gold typically has higher limits
};

// Storage increase per storehouse level - Improved balance
const STORAGE_PER_LEVEL = {
  wood: 750, // Increased from 500
  stone: 750, // Increased from 500
  scrap: 750, // Increased from 500
  gold: 5000,
};

export function calculateStorageLimits(
  playerState: PlayerState
): StorageLimits {
  const storehouse = playerState.buildings.find(
    (b) => b.type === BuildingType.STOREHOUSE
  );
  const storehouseLevel = storehouse?.level || 0;

  return {
    wood: BASE_STORAGE.wood + storehouseLevel * STORAGE_PER_LEVEL.wood,
    stone: BASE_STORAGE.stone + storehouseLevel * STORAGE_PER_LEVEL.stone,
    scrap: BASE_STORAGE.scrap + storehouseLevel * STORAGE_PER_LEVEL.scrap,
    gold: Number.MAX_SAFE_INTEGER, // Gold has no storage limit according to backend
  };
}

export function getStorageUsagePercentage(
  current: number,
  limit: number
): number {
  return Math.round((current / limit) * 100);
}

export function isStorageFull(current: number, limit: number): boolean {
  return current >= limit;
}

export function getStorageColor(percentage: number): string {
  if (percentage >= 90) return "text-red-400";
  if (percentage >= 75) return "text-orange-400";
  if (percentage >= 50) return "text-yellow-400";
  return "text-green-400";
}
