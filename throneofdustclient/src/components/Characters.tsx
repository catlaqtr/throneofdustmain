"use client";

import { useState } from "react";
import {
  PlayerState,
  CharacterClass,
  TraitType,
  CharacterStatus,
  BuildingType,
} from "@/types/game";
import { api } from "@/services/api";

interface CharactersProps {
  playerState: PlayerState;
  onStateUpdate: (state: PlayerState) => void;
}

export default function Characters({
  playerState,
  onStateUpdate,
}: CharactersProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRecruitForm, setShowRecruitForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(
    CharacterClass.WARRIOR
  );
  const [selectedTraits, setSelectedTraits] = useState<TraitType[]>([]);

  const getTrainingYardLevel = () => {
    const trainingYard = playerState.buildings.find(
      (b) => b.type === BuildingType.TRAINING_YARD
    );
    return trainingYard?.level || 0;
  };

  const getRosterLimit = () => {
    return 6 + getTrainingYardLevel();
  };

  const getRecruitCost = () => {
    const trainingYard = playerState.buildings.find(
      (b) => b.type === BuildingType.TRAINING_YARD
    );
    const recruitsSoFar = trainingYard?.recruitsCount || 0;
    return {
      gold: 20 + 5 * recruitsSoFar, // Reduced scaling from +10 to +5 for better balance
      scrap: 5,
    };
  };

  const canAffordRecruit = () => {
    const cost = getRecruitCost();
    return playerState.gold >= cost.gold && playerState.scrap >= cost.scrap;
  };

  const canRecruit = () => {
    return (
      getTrainingYardLevel() > 0 &&
      playerState.characters.length < getRosterLimit() &&
      canAffordRecruit()
    );
  };

  const handleRecruit = async () => {
    try {
      setLoading("recruit");
      setError(null);

      const result = await api.recruitCharacter({
        characterClass: selectedClass,
        traits: selectedTraits,
      });

      const cost = getRecruitCost();
      onStateUpdate({
        ...playerState,
        gold: playerState.gold - cost.gold,
        scrap: playerState.scrap - cost.scrap,
        characters: [...playerState.characters, result],
        buildings: playerState.buildings.map((b) =>
          b.type === BuildingType.TRAINING_YARD
            ? { ...b, recruitsCount: b.recruitsCount + 1 }
            : b
        ),
      });
      setShowRecruitForm(false);
      setSelectedTraits([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to recruit character"
      );
    } finally {
      setLoading(null);
    }
  };

  const getTraitDescription = (trait: TraitType) => {
    const descriptions = {
      [TraitType.STEADY_HAND]: "−5% raid fail chance",
      [TraitType.SCOUTS_EYE]: "−5% extract fail chance",
      [TraitType.MEDIC]: "On extract fail, bank 50% of loot",
      [TraitType.LOOTER]: "+15% rewards",
      [TraitType.CAUTIOUS]: "−5% overall risk, −10% rewards",
      [TraitType.RECKLESS]: "+10% rewards, +5% overall risk",
      [TraitType.UNTRUSTWORTHY]: "10% chance to steal 10% loot and desert",
    };
    return descriptions[trait];
  };

  const aliveCharacters = playerState.characters.filter(
    (char) => char.status !== CharacterStatus.DEAD
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="modern-card p-8 slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Character Management
              </h2>
              <p className="text-sm opacity-70 mt-1">
                Recruit and manage your squad
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRecruitForm(true)}
            disabled={!canRecruit()}
            className={`modern-btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              canRecruit()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            title={
              !canRecruit()
                ? "Check requirements below to enable recruitment"
                : "Click to recruit a new character"
            }
          >
            <span className="flex items-center space-x-2">
              <span>➕</span>
              <span>Recruit Character</span>
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

        {/* Roster Status */}
        <div className="modern-card p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-green-400">
              Roster Status
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="modern-card p-4 border-l-4 border-blue-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {aliveCharacters.length} / {getRosterLimit()}
                  </div>
                  <div className="text-xs text-blue-400">Characters</div>
                </div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-purple-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏋️</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    Level {getTrainingYardLevel()}
                  </div>
                  <div className="text-xs text-purple-400">Training Yard</div>
                </div>
              </div>
            </div>
            <div className="modern-card p-4 border-l-4 border-green-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {getRecruitCost().gold}g + {getRecruitCost().scrap}s
                  </div>
                  <div className="text-xs text-green-400">Recruit Cost</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Requirements */}
        {!canRecruit() && (
          <div className="modern-card p-6 mb-8 border-l-4 border-yellow-400 bg-yellow-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-yellow-400">
                Recruitment Requirements
              </h3>
            </div>
            <div className="space-y-3">
              <div
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ background: "var(--background-tertiary)" }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    getTrainingYardLevel() > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <span className="text-xs text-white">
                    {getTrainingYardLevel() > 0 ? "✓" : "✗"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Training Yard Level
                  </div>
                  <div className="text-xs text-gray-400">
                    Current: {getTrainingYardLevel()} | Required: 1+
                  </div>
                </div>
              </div>
              <div
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ background: "var(--background-tertiary)" }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    playerState.characters.length < getRosterLimit()
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  <span className="text-xs text-white">
                    {playerState.characters.length < getRosterLimit()
                      ? "✓"
                      : "✗"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Roster Space
                  </div>
                  <div className="text-xs text-gray-400">
                    Current: {aliveCharacters.length}/{getRosterLimit()} | Need:
                    Space available
                  </div>
                </div>
              </div>
              <div
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ background: "var(--background-tertiary)" }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    canAffordRecruit() ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <span className="text-xs text-white">
                    {canAffordRecruit() ? "✓" : "✗"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Resources
                  </div>
                  <div className="text-xs text-gray-400">
                    Need: {getRecruitCost().gold}g + {getRecruitCost().scrap}s |
                    Have: {playerState.gold}g + {playerState.scrap}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {aliveCharacters.length === 0 ? (
          <div className="modern-card p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Characters Yet
            </h3>
            <p className="text-gray-400 mb-4">
              Build a Training Yard and recruit your first character to start
              building your squad!
            </p>
            <div className="text-sm text-blue-400">
              💡 Tip: Upgrade your Training Yard to increase your roster limit
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aliveCharacters.map((character) => (
              <div
                key={character.id}
                className="modern-card p-6 group hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">
                        {character.characterClass === CharacterClass.WARRIOR &&
                          "⚔️"}
                        {character.characterClass === CharacterClass.SCOUT &&
                          "🏹"}
                        {character.characterClass === CharacterClass.MEDIC &&
                          "⚕️"}
                        {character.characterClass === CharacterClass.ROGUE &&
                          "🔧"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {character.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-400 font-medium">
                          {character.characterClass}
                        </span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          Lv.{character.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400 font-medium">
                      {character.xp} XP
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        character.status === CharacterStatus.IDLE
                          ? "bg-green-500/20 text-green-300"
                          : character.status === CharacterStatus.IN_RAID
                          ? "bg-yellow-500/20 text-yellow-300"
                          : character.status === CharacterStatus.DEAD
                          ? "bg-red-500/20 text-red-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {character.status}
                    </div>
                  </div>
                </div>

                {character.traits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center space-x-2">
                      <span>⭐</span>
                      <span>Traits</span>
                    </h4>
                    <div className="space-y-2">
                      {character.traits.map((trait, index) => (
                        <div
                          key={index}
                          className="p-2 rounded-lg"
                          style={{ background: "var(--background-tertiary)" }}
                        >
                          <div className="text-xs font-medium text-white mb-1">
                            {trait}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getTraitDescription(trait)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recruit Modal (UI only, no test/debug code) */}
      {showRecruitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              Recruit Character
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) =>
                    setSelectedClass(e.target.value as CharacterClass)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {Object.values(CharacterClass).map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Traits (Optional)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.values(TraitType).map((trait) => (
                    <label key={trait} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTraits.includes(trait)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTraits([...selectedTraits, trait]);
                          } else {
                            setSelectedTraits(
                              selectedTraits.filter((t) => t !== trait)
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-300">
                        {trait}: {getTraitDescription(trait)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 rounded p-3">
                <p className="text-sm text-gray-300">
                  Cost: {getRecruitCost().gold} gold, {getRecruitCost().scrap}{" "}
                  scrap
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRecruit}
                disabled={loading === "recruit" || !canAffordRecruit()}
                className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                  canAffordRecruit() && loading !== "recruit"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading === "recruit" ? "Recruiting..." : "Recruit"}
              </button>
              <button
                onClick={() => setShowRecruitForm(false)}
                className="flex-1 py-2 px-4 rounded font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
