import React, { useState } from 'react';
import { PointOfInterest, GameState, EncyclopediaSubTabId } from '../../types'; // Adjusted path
import ActionButton from '../ActionButton'; // Adjusted path
import WorldMapCard from './WorldMapCard';
import { BookOpenIcon, SearchIcon, SkullIcon } from '../IconComponents'; // Adjusted path

interface WorldMapProps {
  pointsOfInterest: PointOfInterest[]; // Later, this could be full WorldMapData
  selectedPointOfInterest: PointOfInterest | null;
  onSelectPointOfInterest: (poi: PointOfInterest | null) => void;
  onSetGameState: (state: GameState) => void; // To change to encyclopedia or other views
  onSetEncyclopediaSubTab: (subTab: EncyclopediaSubTabId) => void; // To open specific encyclopedia tab
  onNavigateHome: () => void; // To return to the main home screen
  // Add other necessary props, e.g., for initiating research or battle from here
}

// Placeholder function to generate random PoIs for now
const generateDummyPointsOfInterest = (): PointOfInterest[] => {
  const biomes = ['Forest', 'Mountains', 'Plains', 'Swamp', 'Desert'];
  const names = ['Whispering Woods', 'Dragon\'s Peak', 'Sunken City', 'Haunted Marsh', 'Ancient Ruins'];
  return names.map((name, index) => ({
    id: `poi-${index + 1}`,
    properties: {
      name: name,
      description: `A mysterious location known as ${name}. Many tales are told of this place.`,
      biome: biomes[index % biomes.length],
      location: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }, // Random % position
      numberOfNPCs: Math.floor(Math.random() * 15) + 5,
      pointOfInterest: 'A strange glowing crystal',
      explored: Math.random() > 0.5,
      temperature: 'Temperate',
      structures: ['Old Shack'],
      loot: ['Minor Treasures'],
      encounterDifficulty: 'medium'
    },
    npcs: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => ({
      id: `npc-${index}-${i}`,
      name: `Creature ${i + 1}`,
      description: 'A denizen of this area.',
      personality: ['neutral', 'aggressive', 'savage', 'passive'][Math.floor(Math.random() * 4)] as any,
      isMonster: Math.random() > 0.3,
      iconName: 'SkullIcon' // Placeholder
    }))
  }));
};

const WorldMap: React.FC<WorldMapProps> = ({
  pointsOfInterest = generateDummyPointsOfInterest(), // Use dummy data for now
  selectedPointOfInterest,
  onSelectPointOfInterest,
  onSetGameState,
  onSetEncyclopediaSubTab,
  onNavigateHome
}) => {
  const [hoveredPoui, setHoveredPoui] = useState<PointOfInterest | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);

  const handlePointClick = (poi: PointOfInterest) => {
    onSelectPointOfInterest(poi);
    // Potentially set GameState to 'BIOME_SELECTED' or similar if needed globally
    // For now, ExploreView manages selectedPointOfInterest locally.
  };

  const handleLearnMore = () => {
    if (selectedPointOfInterest) {
      // This is a simplified navigation. Ideally, you might pass the PoI ID
      // to the encyclopedia or have a dedicated state in App.tsx for selected encyclopedia entry.
      onSetEncyclopediaSubTab('biomes'); // Or a new 'PointsOfInterest' tab
      onSetGameState('CHARACTER_SHEET'); // Assuming encyclopedia is within CharacterSheetModal
    }
  };
  
  const handleResearch = () => {
    if (selectedPointOfInterest) {
        alert(`Research for ${selectedPointOfInterest.properties.name} initiated (placeholder).`);
    }
  };

  const handleSeekBattle = () => {
    if (selectedPointOfInterest) {
        alert(`Seek battle at ${selectedPointOfInterest.properties.name} (placeholder - might trigger specific encounter).`);
        // Potentially, this could call a modified version of handleFindEnemy with PoI context.
    }
  };

  const handleMouseEnter = (event: React.MouseEvent, poi: PointOfInterest) => {
    setHoveredPoui(poi);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoui(null);
    setTooltipPosition(null);
  };

  return (
    <div className="w-full h-auto bg-slate-700/50 rounded-lg mb-6 border border-slate-600 relative aspect-[16/10] overflow-hidden">
      {/* This div will represent the map area. Actual map graphics/tiles would go here. */}
      {pointsOfInterest.map((poi) => (
        <button
          key={poi.id}
          className={`absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out
                      ${selectedPointOfInterest?.id === poi.id ? 'bg-yellow-400 ring-2 ring-yellow-200 scale-125' : 'bg-sky-500 hover:bg-sky-300'}
                      ${poi.properties.explored ? 'opacity-70' : 'opacity-100'}`}
          style={{ left: `${poi.properties.location.x}%`, top: `${poi.properties.location.y}%` }}
          onClick={() => handlePointClick(poi)}
          onMouseEnter={(e) => handleMouseEnter(e, poi)}
          onMouseLeave={handleMouseLeave}
          title={poi.properties.name}
        >
          <span className="sr-only">{poi.properties.name}</span>
          {/* Could add a small icon inside based on PoI type or status */}
        </button>
      ))}

      {hoveredPoui && tooltipPosition && (
        <div style={{ position: 'fixed', top: tooltipPosition.y + 10, left: tooltipPosition.x + 10, zIndex: 1000 }}>
            <WorldMapCard pointOfInterest={hoveredPoui.properties} />
        </div>
      )}

      {/* Buttons that appear when a PoI is selected */}
      {selectedPointOfInterest && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-slate-900/80 backdrop-blur-sm rounded-b-lg">
          <div className="flex justify-center items-center gap-2">
            <ActionButton 
                onClick={handleLearnMore} 
                variant="info" 
                size="sm"
                icon={<BookOpenIcon className="w-4 h-4"/>}
                >
                Learn More
            </ActionButton>
            <ActionButton 
                onClick={handleResearch} 
                variant="secondary" 
                size="sm"
                icon={<SearchIcon className="w-4 h-4"/>}
                disabled // Placeholder
                >
                Research
            </ActionButton>
            <ActionButton 
                onClick={handleSeekBattle} 
                variant="danger" 
                size="sm"
                icon={<SkullIcon className="w-4 h-4"/>}
                disabled // Placeholder
                >
                Seek Battle
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap; 