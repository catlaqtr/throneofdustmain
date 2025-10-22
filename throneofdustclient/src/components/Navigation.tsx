import { ViewType } from "@/types/game";

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Navigation({
  currentView,
  onViewChange,
}: NavigationProps) {
  const navItems = [
    { view: ViewType.OVERVIEW, label: "Overview", icon: "🏠" },
    { view: ViewType.BUILDINGS, label: "Buildings", icon: "🏗️" },
    { view: ViewType.CHARACTERS, label: "Characters", icon: "👥" },
    { view: ViewType.RAIDS, label: "Raids", icon: "🗡️" },
    { view: ViewType.ACTIVE_RAIDS, label: "Active Raids", icon: "⏰" },
  ];

  return (
    <nav className="glass border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                currentView === item.view
                  ? "text-white bg-gradient-to-b from-blue-500/20 to-transparent border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {currentView === item.view && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
