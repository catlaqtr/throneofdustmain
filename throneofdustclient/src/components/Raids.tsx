"use client";

import { useState } from "react";
import {
  PlayerState,
  RaidMapTemplate,
  MAP_TEMPLATES,
  GameCharacter,
  CharacterStatus,
  BuildingType,
} from "@/types/game";
import { api } from "@/services/api";

interface RaidsProps {
  playerState: PlayerState;
  onStateUpdate: (state: PlayerState) => void;
  onRefreshState?: () => Promise<void>;
}

export default function Raids({
  playerState,
  onStateUpdate,
  onRefreshState,
}: RaidsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<RaidMapTemplate | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<GameCharacter[]>([]);
  const [allyMode, setAllyMode] = useState(false);

  const getTrainingYardLevel = () => {
    const trainingYard = playerState.buildings.find(
      (b) => b.type === BuildingType.TRAINING_YARD
    );
    return trainingYard?.level || 0;
  };

  const getPersonalSquadCap = () => {
    return Math.min(getTrainingYardLevel(), 4);
  };

  const getAvailableCharacters = () => {
    return playerState.characters.filter(
      (char) => char.status === CharacterStatus.IDLE
    );
  };

  const getMaxSquadSize = (map: RaidMapTemplate) => {
    const personalCap = getPersonalSquadCap();
    const mapCap = MAP_TEMPLATES[map].mapCap;
    return Math.min(personalCap, mapCap);
  };

  const canStartRaid = (map: RaidMapTemplate) => {
    const template = MAP_TEMPLATES[map];
    const maxSquad = getMaxSquadSize(map);
    return (
      playerState.gold >= template.entryCostGold &&
      getAvailableCharacters().length > 0 &&
      maxSquad > 0
    );
  };

  const handleStartRaid = async () => {
    if (!selectedMap || selectedSquad.length === 0) return;

    try {
      setLoading("start-raid");
      setError(null);

      // Refresh player state to ensure we have the latest character statuses
      if (onRefreshState) {
        await onRefreshState();
      }

      // Double-check that selected characters are still idle
      const availableCharacters = getAvailableCharacters();
      const invalidCharacters = selectedSquad.filter(
        (char) =>
          !availableCharacters.some((available) => available.id === char.id)
      );

      if (invalidCharacters.length > 0) {
        setError(
          `Some selected characters are not available: ${invalidCharacters
            .map((c) => c.name)
            .join(", ")}`
        );
        setLoading(null);
        return;
      }

      await api.startRaid({
        map: selectedMap,
        memberIds: selectedSquad.map((char) => char.id),
        allyMode,
      });

      // Update player state
      const template = MAP_TEMPLATES[selectedMap];
      onStateUpdate({
        ...playerState,
        gold: playerState.gold - template.entryCostGold,
        characters: playerState.characters.map((char) =>
          selectedSquad.some((s) => s.id === char.id)
            ? { ...char, status: CharacterStatus.IN_RAID }
            : char
        ),
      });

      // Reset form
      setSelectedMap(null);
      setSelectedSquad([]);
      setAllyMode(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start raid";

      // If it's a character status error, provide more helpful information
      if (errorMessage.includes("Character not idle")) {
        const nonIdleCharacters = playerState.characters.filter(
          (char) => char.status !== CharacterStatus.IDLE
        );
        setError(
          `Cannot start raid: Some characters are not idle. ` +
            `${
              nonIdleCharacters.length > 0
                ? `Characters currently ${nonIdleCharacters[0].status.toLowerCase()}: ${nonIdleCharacters
                    .map((c) => c.name)
                    .join(", ")}. `
                : ""
            }` +
            `Please wait for active raids to complete or refresh the page.`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(null);
    }
  };

  const toggleSquadMember = (character: GameCharacter) => {
    const isSelected = selectedSquad.some((char) => char.id === character.id);
    const maxSquad = selectedMap ? getMaxSquadSize(selectedMap) : 0;

    if (isSelected) {
      setSelectedSquad(
        selectedSquad.filter((char) => char.id !== character.id)
      );
    } else if (selectedSquad.length < maxSquad) {
      setSelectedSquad([...selectedSquad, character]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="modern-card p-8 slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Raid Operations
              </h2>
              <p className="text-sm opacity-70 mt-1">
                Plan and execute strategic missions
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (onRefreshState) {
                await onRefreshState();
              }
            }}
            className="modern-btn px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
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

        {/* Map Selection */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold text-blue-400">
              Select Raid Map
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(RaidMapTemplate).map((map) => {
              const template = MAP_TEMPLATES[map];
              const canStart = canStartRaid(map);
              const isSelected = selectedMap === map;

              return (
                <button
                  key={map}
                  onClick={() => {
                    setSelectedMap(map);
                    setSelectedSquad([]); // Reset squad when map changes
                  }}
                  disabled={!canStart}
                  className={`modern-card p-6 group transition-all duration-300 ${
                    isSelected
                      ? "border-2 border-yellow-400 bg-yellow-900/20 scale-105"
                      : canStart
                      ? "hover:scale-105 hover:border-yellow-400/50"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {map.replace(/_/g, " ")}
                      </h4>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.difficulty === "EASY"
                            ? "bg-green-500/20 text-green-300"
                            : template.difficulty === "NORMAL"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : template.difficulty === "HARD"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {template.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div
                      className="flex justify-between items-center p-2 rounded-lg"
                      style={{ background: "var(--background-tertiary)" }}
                    >
                      <span className="text-sm text-gray-300">Duration</span>
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
                      <span className="text-sm text-gray-300">Squad Cap</span>
                      <span className="text-sm font-medium text-blue-400">
                        {template.mapCap}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center p-2 rounded-lg"
                      style={{ background: "var(--background-tertiary)" }}
                    >
                      <span className="text-sm text-gray-300">Raid Risk</span>
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Status Overview */}
        <div className="mb-8">
          <div className="modern-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-400">
                Character Status Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="modern-card p-4 border-l-4 border-green-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {
                        playerState.characters.filter(
                          (c) => c.status === CharacterStatus.IDLE
                        ).length
                      }
                    </div>
                    <div className="text-xs text-green-400">Available</div>
                  </div>
                </div>
              </div>
              <div className="modern-card p-4 border-l-4 border-yellow-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚔️</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {
                        playerState.characters.filter(
                          (c) => c.status === CharacterStatus.IN_RAID
                        ).length
                      }
                    </div>
                    <div className="text-xs text-yellow-400">In Raid</div>
                  </div>
                </div>
              </div>
              <div className="modern-card p-4 border-l-4 border-red-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💀</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {
                        playerState.characters.filter(
                          (c) => c.status === CharacterStatus.DEAD
                        ).length
                      }
                    </div>
                    <div className="text-xs text-red-400">Dead</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Squad Selection */}
        {selectedMap && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-green-400">
                Select Squad ({selectedSquad.length}/
                {getMaxSquadSize(selectedMap)})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailableCharacters().map((character) => {
                const isSelected = selectedSquad.some(
                  (char) => char.id === character.id
                );
                const canSelect =
                  selectedSquad.length < getMaxSquadSize(selectedMap);

                return (
                  <button
                    key={character.id}
                    onClick={() => toggleSquadMember(character)}
                    disabled={!isSelected && !canSelect}
                    className={`modern-card p-4 group transition-all duration-300 ${
                      isSelected
                        ? "border-2 border-blue-400 bg-blue-900/20 scale-105"
                        : canSelect
                        ? "hover:scale-105 hover:border-blue-400/50"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-lg">
                          {character.characterClass === "WARRIOR" && "⚔️"}
                          {character.characterClass === "SCOUT" && "🏹"}
                          {character.characterClass === "MEDIC" && "⚕️"}
                          {character.characterClass === "ROGUE" && "🔧"}
                        </span>
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {character.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-400 font-medium">
                            {character.characterClass}
                          </span>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                            Lv.{character.level}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ally Mode */}
        {selectedMap && (
          <div className="mb-8">
            <div className="modern-card p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🤝</span>
                </div>
                <div className="flex-1">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allyMode}
                      onChange={(e) => setAllyMode(e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-white font-semibold text-lg">
                        Ally Mode
                      </span>
                      <p className="text-sm text-gray-400 mt-1">
                        Makes raids easier but adds betrayal risk at extraction
                      </p>
                    </div>
                  </label>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    allyMode
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {allyMode ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Raid Button */}
        {selectedMap && selectedSquad.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleStartRaid}
              disabled={loading === "start-raid"}
              className={`modern-btn px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                loading === "start-raid"
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
              }`}
            >
              <span className="flex items-center space-x-3">
                {loading === "start-raid" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting Raid...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Launch Raid</span>
                  </>
                )}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
