# Throne of Dust - Frontend Client

A Next.js TypeScript frontend for the Throne of Dust browser MMO game.

## Features

- **Resource Management**: Collect and manage wood, stone, scrap, and gold
- **Building System**: Upgrade buildings to increase production and capabilities
- **Character Recruitment**: Recruit and manage characters with different classes and traits
- **Raid System**: Send squads on PvE raids with risk/reward mechanics
- **Ally Mode**: Optional ally assistance with betrayal risk
- **Real-time Updates**: Live resource collection and raid resolution

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:8080`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Mechanics

### Resources

- **Wood**: Produced by Lumber Mill (30/hour per level)
- **Stone**: Produced by Quarry (25/hour per level)
- **Scrap**: Produced by Mine (20/hour per level)
- **Gold**: Produced by Treasury (25/hour per level) - Used for upgrades and recruitment

### Buildings

- **Town Hall**: Gates other building levels
- **Lumber Mill**: Produces wood
- **Quarry**: Produces stone
- **Mine**: Produces scrap
- **Storehouse**: Increases storage capacity by 750 per level
- **Training Yard**: Enables recruitment, increases squad cap
- **Radar**: Reduces ally betrayal chance

### Characters

- **Classes**: Warrior, Rogue, Medic, Scout
- **Traits**: Various bonuses and risks
- **Leveling**: Gain XP from raids, unlock trait slots

### Raids

- **Maps**: Easy, Normal, Hard difficulty
- **Squad Formation**: Select characters based on caps
- **Ally Mode**: Easier raids with betrayal risk
- **Resolution**: Success/failure, loot, casualties

## API Integration

The frontend communicates with the Spring Boot backend through REST APIs:

- `GET /api/player/state` - Get player state
- `POST /api/player/collect` - Collect resources
- `POST /api/buildings/{type}/upgrade` - Upgrade buildings
- `POST /api/training/recruit` - Recruit characters
- `POST /api/raids/start` - Start raids
- `POST /api/raids/{id}/resolve` - Resolve raids

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── GameLayout.tsx   # Main game layout
│   ├── ResourceDisplay.tsx
│   ├── Navigation.tsx
│   ├── Overview.tsx
│   ├── Buildings.tsx
│   ├── Characters.tsx
│   ├── Raids.tsx
│   └── ActiveRaids.tsx
├── services/           # API services
│   └── api.ts
└── types/             # TypeScript types
    └── game.ts
```

### Key Components

- **GameLayout**: Main container with navigation and state management
- **ResourceDisplay**: Shows current resources in header
- **Overview**: Dashboard with quick actions and stats
- **Buildings**: Building management and upgrades
- **Characters**: Character recruitment and management
- **Raids**: Raid planning and squad formation
- **ActiveRaids**: Monitor and resolve ongoing raids

## Styling

The game uses a dark theme with Tailwind CSS:

- **Background**: Gray-900 for main background
- **Cards**: Gray-800 for content areas
- **Accents**: Yellow-400 for highlights, color-coded resources
- **Interactive**: Hover states and transitions

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Maintain API type safety
4. Test with backend integration
