"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayerState, ViewType } from "@/types/game";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ResourceDisplay from "./ResourceDisplay";
import Navigation from "./Navigation";
import Overview from "./Overview";
import Buildings from "./Buildings";
import Characters from "./Characters";
import Raids from "./Raids";
import ActiveRaids from "./ActiveRaids";
import AuthForm from "./AuthForm";

export default function GameLayout() {
  const {
    token,
    isAuthenticated,
    login,
    logout,
    loading: authLoading,
  } = useAuth();
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayerState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await api.getPlayerState();
      setPlayerState(state);
    } catch (err) {
      if (err instanceof Error && err.message.includes("fetch")) {
        setError(
          "Backend server is not running. Please start your Spring Boot backend on port 8080."
        );
      } else if (
        err instanceof Error &&
        (err.message.includes("401") || err.message.includes("403"))
      ) {
        logout();
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load game state"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      loadPlayerState();
    }
  }, [token, loadPlayerState]);

  const handleCollectResources = useCallback(async () => {
    if (!playerState) return;

    try {
      const result = await api.collectResources();
      // Update player state with new resources
      setPlayerState((prev) =>
        prev
          ? {
              ...prev,
              wood: prev.wood + result.wood,
              stone: prev.stone + result.stone,
              scrap: prev.scrap + result.scrap,
              gold: prev.gold + result.gold,
            }
          : null
      );
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes("401") || err.message.includes("403"))
      ) {
        logout();
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to collect resources"
        );
      }
      throw err; // Re-throw to let the Overview component handle the error
    }
  }, [playerState, logout]);

  const handleLogout = useCallback(() => {
    logout();
    setPlayerState(null);
    setError(null);
  }, [logout]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={login} />;
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium mb-2">Loading Kingdom...</div>
          <div className="text-sm opacity-70">Preparing your throne</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center modern-card p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-400 text-xl mb-6 font-medium">
            Connection Error
          </div>
          <div className="text-sm opacity-70 mb-6">{error}</div>
          <button onClick={loadPlayerState} className="modern-btn w-full">
            <span className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>Retry Connection</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (!playerState) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center modern-card p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-xl mb-2 font-medium">Loading Game Data</div>
          <div className="text-sm opacity-70">
            Please wait while we load your kingdom...
          </div>
        </div>
      </div>
    );
  }

  let renderCurrentView = null;
  if (playerState) {
    switch (currentView) {
      case ViewType.OVERVIEW:
        renderCurrentView = (
          <Overview
            playerState={playerState}
            onCollect={handleCollectResources}
          />
        );
        break;
      case ViewType.BUILDINGS:
        renderCurrentView = (
          <Buildings playerState={playerState} onStateUpdate={setPlayerState} />
        );
        break;
      case ViewType.CHARACTERS:
        renderCurrentView = (
          <Characters
            playerState={playerState}
            onStateUpdate={setPlayerState}
          />
        );
        break;
      case ViewType.RAIDS:
        renderCurrentView = (
          <Raids
            playerState={playerState}
            onStateUpdate={setPlayerState}
            onRefreshState={loadPlayerState}
          />
        );
        break;
      case ViewType.ACTIVE_RAIDS:
        renderCurrentView = (
          <ActiveRaids
            playerState={playerState}
            onStateUpdate={setPlayerState}
          />
        );
        break;
      default:
        renderCurrentView = (
          <Overview
            playerState={playerState}
            onCollect={handleCollectResources}
          />
        );
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Modern Header */}
      <header
        className="glass sticky top-0 z-50 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Throne of Dust
                </h1>
                <p className="text-sm opacity-70">Strategic Kingdom Builder</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <ResourceDisplay
                resources={{
                  wood: playerState.wood,
                  stone: playerState.stone,
                  scrap: playerState.scrap,
                  gold: playerState.gold,
                }}
                buildings={playerState.buildings}
              />
              <button
                onClick={handleLogout}
                className="modern-btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
              >
                <span className="flex items-center space-x-2">
                  <span>🚪</span>
                  <span>Logout</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 fade-in">
        {renderCurrentView}
      </main>
    </div>
  );
}
