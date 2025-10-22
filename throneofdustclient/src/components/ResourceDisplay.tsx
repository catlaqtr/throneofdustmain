import { PlayerState } from "@/types/game";
import {
  calculateStorageLimits,
  getStorageUsagePercentage,
  getStorageColor,
} from "@/utils/storage";

interface Resources {
  wood: number;
  stone: number;
  scrap: number;
  gold: number;
}

interface ResourceDisplayProps {
  resources: Resources;
  buildings: PlayerState["buildings"];
}

export default function ResourceDisplay({
  resources,
  buildings,
}: ResourceDisplayProps) {
  const storageLimits = calculateStorageLimits({ buildings } as PlayerState);

  const resourceData = [
    {
      name: "Wood",
      value: resources.wood,
      limit: storageLimits.wood,
      color: "amber",
      bgColor: "bg-amber-600",
      textColor: "text-amber-400",
    },
    {
      name: "Stone",
      value: resources.stone,
      limit: storageLimits.stone,
      color: "gray",
      bgColor: "bg-gray-500",
      textColor: "text-gray-300",
    },
    {
      name: "Scrap",
      value: resources.scrap,
      limit: storageLimits.scrap,
      color: "orange",
      bgColor: "bg-orange-600",
      textColor: "text-orange-400",
    },
    {
      name: "Gold",
      value: resources.gold,
      limit: Number.MAX_SAFE_INTEGER,
      color: "yellow",
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-400",
    },
  ];

  return (
    <div className="flex space-x-4">
      {resourceData.map((resource) => {
        const isGold = resource.name === "Gold";
        const percentage = isGold
          ? 0
          : getStorageUsagePercentage(resource.value, resource.limit);
        const usageColor = isGold
          ? "text-green-400"
          : getStorageColor(percentage);

        return (
          <div key={resource.name} className="modern-card p-3 min-w-[120px]">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 ${resource.bgColor} rounded-lg flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-sm">
                  {resource.name === "Wood" && "🪵"}
                  {resource.name === "Stone" && "🪨"}
                  {resource.name === "Scrap" && "🔧"}
                  {resource.name === "Gold" && "💰"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className={`${resource.textColor} font-semibold text-sm`}>
                  {resource.value.toLocaleString()}
                </span>
                <span className={`${usageColor} text-xs opacity-80`}>
                  {isGold ? "∞" : `${percentage}%`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
