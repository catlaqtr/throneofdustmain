import { PlayerState, BuildingType } from "@/types/game";
import {
  calculateStorageLimits,
  getStorageUsagePercentage,
} from "@/utils/storage";
import { useState, useEffect } from "react";

interface OverviewProps {
  playerState: PlayerState;
  onCollect: () => Promise<void>;
}

export default function Overview({ playerState, onCollect }: OverviewProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState<string | null>(
    null
  );
  const [timeUntilNextCollection, setTimeUntilNextCollection] =
    useState<number>(0);

  const getBuildingLevel = (type: BuildingType) => {
    const building = playerState.buildings.find((b) => b.type === type);
    return building?.level || 0;
  };


  const handleCollect = async () => {
    setIsCollecting(true);
    setCollectionMessage(null);

    try {
      await onCollect();
      setCollectionMessage(
        "Resources collected successfully! Check your storage to see what you gained."
      );
    } catch {
      setCollectionMessage("Failed to collect resources. Please try again.");
    } finally {
      setIsCollecting(false);
      // Clear message after 3 seconds
      setTimeout(() => setCollectionMessage(null), 3000);
    }
  };

  // Calculate time until next collection (assuming hourly collection)
  useEffect(() => {
    const updateTimeUntilNextCollection = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const diffMs = nextHour.getTime() - now.getTime();
      const diffMinutes = Math.ceil(diffMs / (1000 * 60));
      setTimeUntilNextCollection(diffMinutes);
    };

    updateTimeUntilNextCollection();
    const interval = setInterval(updateTimeUntilNextCollection, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const storageLimits = calculateStorageLimits(playerState);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="modern-card p-8 slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kingdom Overview
            </h2>
            <p className="text-sm opacity-70 mt-1">
              Manage your settlement and resources
            </p>
          </div>
          <div className="text-4xl">🏰</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="modern-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Town Hall</h3>
                <p className="text-2xl font-bold text-yellow-400">
                  Level {getBuildingLevel(BuildingType.TOWN_HALL)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Gates other buildings</p>
          </div>

          <div className="modern-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🪵</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Lumber Mill
                </h3>
                <p className="text-2xl font-bold text-amber-400">
                  Level {getBuildingLevel(BuildingType.LUMBER_MILL)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              +{30 * getBuildingLevel(BuildingType.LUMBER_MILL)} wood/hour
            </p>
          </div>

          <div className="modern-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🪨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Quarry</h3>
                <p className="text-2xl font-bold text-gray-300">
                  Level {getBuildingLevel(BuildingType.QUARRY)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              +{25 * getBuildingLevel(BuildingType.QUARRY)} stone/hour
            </p>
          </div>

          <div className="modern-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⛏️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Mine</h3>
                <p className="text-2xl font-bold text-orange-400">
                  Level {getBuildingLevel(BuildingType.MINE)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              +{20 * getBuildingLevel(BuildingType.MINE)} scrap/hour
            </p>
          </div>

          <div className="modern-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Treasury</h3>
                <p className="text-2xl font-bold text-yellow-400">
                  Level {getBuildingLevel(BuildingType.TREASURY)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              +{25 * getBuildingLevel(BuildingType.TREASURY)} gold/hour
            </p>
          </div>
        </div>

        {/* Storage Information */}
        <div className="modern-card p-6 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-purple-400">
              Storage Capacity
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="modern-card p-4 border-l-4 border-amber-400">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🪵</span>
                </div>
                <h4 className="text-amber-400 font-semibold">Wood Storage</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {playerState.wood.toLocaleString()}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {getStorageUsagePercentage(
                    playerState.wood,
                    storageLimits.wood
                  )}
                  % used
                </span>
                <span className="text-gray-500">
                  / {storageLimits.wood.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      getStorageUsagePercentage(
                        playerState.wood,
                        storageLimits.wood
                      ),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-gray-400">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🪨</span>
                </div>
                <h4 className="text-gray-300 font-semibold">Stone Storage</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {playerState.stone.toLocaleString()}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {getStorageUsagePercentage(
                    playerState.stone,
                    storageLimits.stone
                  )}
                  % used
                </span>
                <span className="text-gray-500">
                  / {storageLimits.stone.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      getStorageUsagePercentage(
                        playerState.stone,
                        storageLimits.stone
                      ),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-orange-400">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔧</span>
                </div>
                <h4 className="text-orange-400 font-semibold">Scrap Storage</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {playerState.scrap.toLocaleString()}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {getStorageUsagePercentage(
                    playerState.scrap,
                    storageLimits.scrap
                  )}
                  % used
                </span>
                <span className="text-gray-500">
                  / {storageLimits.scrap.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      getStorageUsagePercentage(
                        playerState.scrap,
                        storageLimits.scrap
                      ),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-yellow-400">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <h4 className="text-yellow-400 font-semibold">Gold Storage</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {playerState.gold.toLocaleString()}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">∞ Unlimited</span>
                <span className="text-gray-500">Treasury Production</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>
          </div>
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ background: "var(--background-tertiary)" }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏪</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Storehouse Level {getBuildingLevel(BuildingType.STOREHOUSE)}
                </div>
                <div className="text-xs text-purple-400">
                  +{getBuildingLevel(BuildingType.STOREHOUSE) * 750} storage per
                  resource
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Section */}
        <div className="modern-card p-6 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-green-400">
              Resource Collection
            </h3>
          </div>

          {/* Collection Status */}
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: "var(--background-tertiary)" }}
          >
            <p className="text-sm text-gray-300 mb-2">
              Resources are produced continuously and collected when you click
              the button below.
            </p>
            <div className="flex items-center space-x-2 text-sm text-blue-400">
              <span>⏰</span>
              <span>
                Next optimal collection time: {timeUntilNextCollection} minutes
              </span>
            </div>
          </div>

          {/* Collection Feedback */}
          {collectionMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-green-200 fade-in">
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>{collectionMessage}</span>
              </div>
            </div>
          )}

          {/* Collect Button */}
          <div className="flex justify-center">
            <button
              onClick={handleCollect}
              disabled={isCollecting}
              className={`modern-btn px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                isCollecting
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
              }`}
            >
              <span className="flex items-center space-x-3">
                {isCollecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Collecting...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Collect Resources</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
