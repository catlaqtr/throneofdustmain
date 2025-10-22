import {
  PlayerState,
  CollectResponse,
  UpgradeResponse,
  GameCharacter,
  Raid,
  RecruitRequest,
  StartRaidRequest,
  BuildingType,
} from "@/types/game";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let optHeaders: Record<string, string> = {};
  if (
    options.headers &&
    typeof options.headers === "object" &&
    !Array.isArray(options.headers)
  ) {
    optHeaders = options.headers as Record<string, string>;
  }
  if (token) {
    optHeaders["Authorization"] = `Bearer ${token}`;
  }
  const headers = { ...baseHeaders, ...optHeaders };

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));

      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("jwtToken");
        }
      }

      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(0, "Network error: Backend server is not running");
    }
    throw error;
  }
}

export const api = {
  // Auth (login/register, production only)
  async auth(
    endpoint: string,
    data: { username: string; password: string }
  ): Promise<{ token: string }> {
    return apiCall<{ token: string }>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Logout (clear token from localStorage)
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwtToken");
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("jwtToken");
    }
    return false;
  },
  // Player state (production only)
  async getPlayerState(): Promise<PlayerState> {
    return apiCall<PlayerState>("/player/state");
  },

  async collectResources(): Promise<CollectResponse> {
    return apiCall<CollectResponse>("/player/collect", { method: "POST" });
  },

  // Buildings (production only)
  async collectBuilding(type: BuildingType): Promise<CollectResponse> {
    return apiCall<CollectResponse>(`/buildings/${type}/collect`, {
      method: "POST",
    });
  },

  async upgradeBuilding(type: BuildingType): Promise<UpgradeResponse> {
    return apiCall<UpgradeResponse>(`/buildings/${type}/upgrade`, {
      method: "POST",
    });
  },

  // Characters (production only)
  async addTrait(characterId: number, trait: string): Promise<GameCharacter> {
    return apiCall<GameCharacter>(`/characters/${characterId}/traits`, {
      method: "POST",
      body: JSON.stringify({ trait }),
    });
  },

  // Training (production only)
  async recruitCharacter(request: RecruitRequest): Promise<GameCharacter> {
    return apiCall<GameCharacter>("/training/recruit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Raids (production only)
  async startRaid(request: StartRaidRequest): Promise<Raid> {
    return apiCall<Raid>("/raids/start", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async resolveRaid(raidId: number): Promise<Raid> {
    return apiCall<Raid>(`/raids/${raidId}/resolve`, { method: "POST" });
  },

  async getRaids(): Promise<Raid[]> {
    return apiCall<Raid[]>("/raids");
  },
};

export { ApiError };
