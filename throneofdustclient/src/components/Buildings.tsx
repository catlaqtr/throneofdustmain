import { useState } from "react";
import { PlayerState, BuildingType } from "@/types/game";
import { api } from "@/services/api";
import { calculateStorageLimits } from "@/utils/storage";

interface BuildingsProps {
  playerState: PlayerState;
  onStateUpdate: (state: PlayerState) => void;
}

export default function Buildings({
  playerState,
  onStateUpdate,
}: BuildingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getBuildingLevel = (type: BuildingType) => {
    const building = playerState.buildings.find((b) => b.type === type);
    return building?.level || 0;
  };

  const getUpgradeCost = (level: number) => ({
    wood: 40 * (level + 1), // Reduced from 50 for better balance
    stone: 35 * (level + 1), // Reduced from 40 for better balance
    scrap: 15 * (level + 1), // Reduced from 20 for better balance
  });

  const canAffordUpgrade = (type: BuildingType) => {
    const currentLevel = getBuildingLevel(type);
    const cost = getUpgradeCost(currentLevel);
    return (
      playerState.wood >= cost.wood &&
      playerState.stone >= cost.stone &&
      playerState.scrap >= cost.scrap
    );
  };

  const handleUpgrade = async (type: BuildingType) => {
    try {
      setLoading(type);
      setError(null);
      const result = await api.upgradeBuilding(type);
      const cost = getUpgradeCost(getBuildingLevel(type));
      onStateUpdate({
        ...playerState,
        wood: playerState.wood - cost.wood,
        stone: playerState.stone - cost.stone,
        scrap: playerState.scrap - cost.scrap,
        gold: result.goldRemaining,
        buildings: playerState.buildings.map((b) =>
          b.type === type ? { ...b, level: result.newLevel } : b
        ),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upgrade building";
      if (errorMessage.includes("Not enough resources")) {
        const cost = getUpgradeCost(getBuildingLevel(type));
        setError(
          `Not enough resources. You need: ${cost.wood} wood, ${cost.stone} stone, ${cost.scrap} scrap`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(null);
    }
  };

  const buildingInfo = [
    {
      type: BuildingType.TOWN_HALL,
      name: "Town Hall",
      description:
        "Gates other buildings. No building can exceed Town Hall level + 1.",
      icon: "🏛️",
    },
    {
      type: BuildingType.LUMBER_MILL,
      name: "Lumber Mill",
      description: "Produces 30 wood per hour per level.",
      icon: "🌲",
    },
    {
      type: BuildingType.QUARRY,
      name: "Quarry",
      description: "Produces 25 stone per hour per level.",
      icon: "⛰️",
    },
    {
      type: BuildingType.MINE,
      name: "Mine",
      description: "Produces 20 scrap per hour per level.",
      icon: "⛏️",
    },
    {
      type: BuildingType.TREASURY,
      name: "Treasury",
      description: "Produces 25 gold per hour per level.", // Updated from 15 to 25
      icon: "💰",
    },
    {
      type: BuildingType.STOREHOUSE,
      name: "Storehouse",
      description: "Increases resource storage capacity by 750 per level.", // Updated from 500 to 750
      icon: "🏪",
    },
    {
      type: BuildingType.TRAINING_YARD,
      name: "Training Yard",
      description: "Enables recruitment and increases squad cap.",
      icon: "🏋️",
    },
    {
      type: BuildingType.RADAR,
      name: "Radar",
      description: "Reduces ally betrayal chance by 2% per level.",
      icon: "📡",
    },
  ];

  const currentStorageLimits = calculateStorageLimits(playerState);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="modern-card p-8 slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Building Management
            </h2>
            <p className="text-sm opacity-70 mt-1">
              Upgrade your settlement infrastructure
            </p>
          </div>
          <div className="text-4xl">🏗️</div>
        </div>

        {/* Storage Preview */}
        <div className="modern-card p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-purple-400">
              Current Storage Limits
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                <span className="text-xs">🪵</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {currentStorageLimits.wood.toLocaleString()}
                </div>
                <div className="text-xs text-amber-400">Wood</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                <span className="text-xs">🪨</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {currentStorageLimits.stone.toLocaleString()}
                </div>
                <div className="text-xs text-gray-300">Stone</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-xs">🔧</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {currentStorageLimits.scrap.toLocaleString()}
                </div>
                <div className="text-xs text-orange-400">Scrap</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                <span className="text-xs">💰</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">∞</div>
                <div className="text-xs text-yellow-400">Gold</div>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="modern-card p-4 mb-6 border-l-4 border-red-500 bg-red-900/20">
            <div className="flex items-center space-x-2 text-red-200">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Current Resources Display */}
        <div className="modern-card p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">💎</span>
            </div>
            <h3 className="text-xl font-semibold text-green-400">
              Current Resources
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="modern-card p-4 border-l-4 border-amber-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🪵</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {playerState.wood.toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-400">Wood</div>
                </div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-gray-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🪨</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {playerState.stone.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-300">Stone</div>
                </div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-orange-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔧</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {playerState.scrap.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-400">Scrap</div>
                </div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-yellow-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {playerState.gold.toLocaleString()}
                  </div>
                  <div className="text-xs text-yellow-400">Gold</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {buildingInfo.map((building) => {
            const level = getBuildingLevel(building.type);
            const cost = getUpgradeCost(level);
            const canAfford = canAffordUpgrade(building.type);
            const isUpgrading = loading === building.type;
            return (
              <div
                key={building.type}
                className="modern-card p-6 group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-3xl">{building.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {building.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-yellow-400">
                        Level {level}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {building.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ background: "var(--background-tertiary)" }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                        <span className="text-xs">🪵</span>
                      </div>
                      <span className="text-sm text-amber-400">Wood</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        playerState.wood >= cost.wood
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {playerState.wood} / {cost.wood}
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ background: "var(--background-tertiary)" }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                        <span className="text-xs">🪨</span>
                      </div>
                      <span className="text-sm text-gray-300">Stone</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        playerState.stone >= cost.stone
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {playerState.stone} / {cost.stone}
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ background: "var(--background-tertiary)" }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                        <span className="text-xs">🔧</span>
                      </div>
                      <span className="text-sm text-orange-400">Scrap</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        playerState.scrap >= cost.scrap
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {playerState.scrap} / {cost.scrap}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(building.type)}
                  disabled={!canAfford || isUpgrading}
                  className={`modern-btn w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    canAfford && !isUpgrading
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    {isUpgrading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Upgrading...</span>
                      </>
                    ) : (
                      <>
                        <span>⬆️</span>
                        <span>Upgrade</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
