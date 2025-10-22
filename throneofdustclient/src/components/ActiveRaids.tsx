"use client";

import { useState, useEffect } from "react";
import {
  PlayerState,
  Raid,
  MAP_TEMPLATES,
  CharacterStatus,
} from "@/types/game";
import { api } from "@/services/api";

interface ActiveRaidsProps {
  playerState: PlayerState;
  onStateUpdate: (state: PlayerState) => void;
}

export default function ActiveRaids({
  playerState,
  onStateUpdate,
}: ActiveRaidsProps) {
  const [raids, setRaids] = useState<Raid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    loadRaids();

    // Set up interval to refresh raids every 30 seconds
    const interval = setInterval(() => {
      loadRaids();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadRaids = async () => {
    try {
      setLoading(true);
      setError(null);
      const raidList = await api.getRaids();
      // Filter out resolved raids - only show active raids
      const activeRaids = raidList.filter((raid) => raid.status !== "RESOLVED");
      setRaids(activeRaids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load raids");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRaid = async (raidId: number) => {
    try {
      setResolving(raidId);
      setError(null);
      const result = await api.resolveRaid(raidId);

      // Update raids list
      setRaids(raids.map((raid) => (raid.id === raidId ? result : raid)));

      // Update player state with loot and character status
      if (result.success && result.lootGold && result.lootScrap) {
        onStateUpdate({
          ...playerState,
          gold: playerState.gold + result.lootGold,
          scrap: playerState.scrap + result.lootScrap,
          characters: playerState.characters.map((char) =>
            result.members.some((member) => member.id === char.id)
              ? { ...char, status: CharacterStatus.IDLE }
              : char
          ),
        });
      } else {
        // Update character status even if raid failed
        onStateUpdate({
          ...playerState,
          characters: playerState.characters.map((char) =>
            result.members.some((member) => member.id === char.id)
              ? { ...char, status: CharacterStatus.IDLE }
              : char
          ),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve raid");
    } finally {
      setResolving(null);
    }
  };

  const formatTimeRemaining = (endAt: string) => {
    const end = new Date(endAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ready to resolve";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getResultText = (raid: Raid) => {
    if (raid.status !== "RESOLVED") return "";
    if (raid.success === false) return "Raid Failed";
    if (raid.betrayalOccurred) return "Ally Betrayed";
    if (raid.extractionSuccess === false) return "Extraction Failed";
    return "Success";
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading raids...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="modern-card p-8 slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Active Raids
              </h2>
              <p className="text-sm opacity-70 mt-1">
                Monitor your ongoing missions
              </p>
            </div>
          </div>
          <button
            onClick={loadRaids}
            className="modern-btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <span>🔄</span>
              <span>Refresh</span>
            </span>
          </button>
        </div>

        {error && (
          <div className="modern-card p-4 mb-6 border-l-4 border-red-500 bg-red-900/20">
            <div className="flex items-center space-x-2 text-red-200">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {raids.length === 0 ? (
          <div className="modern-card p-8 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Active Raids
            </h3>
            <p className="text-gray-400 mb-4">
              Start a raid from the Raids tab to begin your missions!
            </p>
            <div className="text-sm text-blue-400">
              💡 Tip: Raids take 5 minutes to complete and reward resources
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {raids.map((raid) => {
              const template = MAP_TEMPLATES[raid.map];
              const isReady = new Date(raid.endAt) <= new Date();
              const canResolve = raid.status === "IN_PROGRESS" && isReady;

              return (
                <div
                  key={raid.id}
                  className="modern-card p-6 group hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-3xl">🗺️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {raid.map.replace(/_/g, " ")}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              raid.status === "SCHEDULED"
                                ? "bg-blue-500/20 text-blue-300"
                                : raid.status === "IN_PROGRESS"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : raid.status === "RESOLVED"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}
                          >
                            {raid.status.replace(/_/g, " ")}
                          </div>
                          {raid.status === "RESOLVED" && (
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                raid.success === false
                                  ? "bg-red-500/20 text-red-300"
                                  : raid.betrayalOccurred
                                  ? "bg-orange-500/20 text-orange-300"
                                  : raid.extractionSuccess === false
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {getResultText(raid)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          raid.allyMode
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {raid.allyMode ? "🤝 Ally Mode" : "👤 Solo Mode"}
                      </div>
                      {raid.status !== "RESOLVED" && (
                        <div className="mt-2 text-lg font-bold text-yellow-400">
                          {formatTimeRemaining(raid.endAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="modern-card p-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                        <span>👥</span>
                        <span>Squad Members</span>
                      </h4>
                      <div className="space-y-2">
                        {raid.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-3 p-2 rounded-lg"
                            style={{ background: "var(--background-tertiary)" }}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-sm">
                                {member.characterClass === "WARRIOR" && "⚔️"}
                                {member.characterClass === "SCOUT" && "🏹"}
                                {member.characterClass === "MEDIC" && "⚕️"}
                                {member.characterClass === "ROGUE" && "🔧"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                Lv.{member.level} {member.characterClass}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="modern-card p-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                        <span>📊</span>
                        <span>Raid Details</span>
                      </h4>
                      <div className="space-y-3">
                        <div
                          className="flex justify-between items-center p-2 rounded-lg"
                          style={{ background: "var(--background-tertiary)" }}
                        >
                          <span className="text-sm text-gray-300">
                            Duration
                          </span>
                          <span className="text-sm font-medium text-white">
                            {template.durationMinutes} min
                          </span>
                        </div>
                        <div
                          className="flex justify-between items-center p-2 rounded-lg"
                          style={{ background: "var(--background-tertiary)" }}
                        >
                          <span className="text-sm text-gray-300">Cost</span>
                          <span className="text-sm font-medium text-yellow-400">
                            {template.entryCostGold} gold
                          </span>
                        </div>
                        <div
                          className="flex justify-between items-center p-2 rounded-lg"
                          style={{ background: "var(--background-tertiary)" }}
                        >
                          <span className="text-sm text-gray-300">
                            Raid Risk
                          </span>
                          <span className="text-sm font-medium text-red-400">
                            {Math.round(template.baseRaidFail * 100)}%
                          </span>
                        </div>
                        <div
                          className="flex justify-between items-center p-2 rounded-lg"
                          style={{ background: "var(--background-tertiary)" }}
                        >
                          <span className="text-sm text-gray-300">
                            Extract Risk
                          </span>
                          <span className="text-sm font-medium text-red-400">
                            {Math.round(template.baseExtractFail * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {raid.status === "RESOLVED" && (
                    <div className="modern-card p-4 mb-6 border-l-4 border-green-400">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center space-x-2">
                        <span>📋</span>
                        <span>Results</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                              <span className="text-xs">💰</span>
                            </div>
                            <span className="text-sm text-gray-300">
                              Loot Gold:{" "}
                            </span>
                            <span className="text-sm font-medium text-yellow-400">
                              {raid.lootGold || 0}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                              <span className="text-xs">🔧</span>
                            </div>
                            <span className="text-sm text-gray-300">
                              Loot Scrap:{" "}
                            </span>
                            <span className="text-sm font-medium text-orange-400">
                              {raid.lootScrap || 0}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <span className="text-xs">💀</span>
                            </div>
                            <span className="text-sm text-gray-300">
                              Casualties:{" "}
                            </span>
                            <span className="text-sm font-medium text-red-400">
                              {raid.casualties || 0}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                              <span className="text-xs">⚔️</span>
                            </div>
                            <span className="text-sm text-gray-300">
                              Betrayal:{" "}
                            </span>
                            <span className="text-sm font-medium text-orange-400">
                              {raid.betrayalOccurred ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {canResolve && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleResolveRaid(raid.id)}
                        disabled={resolving === raid.id}
                        className={`modern-btn px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                          resolving === raid.id
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
                        }`}
                      >
                        <span className="flex items-center space-x-3">
                          {resolving === raid.id ? (
                            <>
                              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>Resolving...</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>Resolve Raid</span>
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
