import React, { useState } from 'react';
import ActionButton from '../ActionButton';
import { ArrowUturnLeftIcon } from '../IconComponents';
import WorldMap from './WorldMap';
import ExplorationPlay from './ExplorationPlay';
import { PointOfInterest, GameState, EncyclopediaSubTabId, CharacterSheetTab } from '../../types';

interface ExploreViewProps {
  onPlay: (poi?: PointOfInterest) => void;
  onReturnHome: () => void;
  isLoading: boolean;
  onSetGameState: (state: GameState) => void;
  onSetEncyclopediaSubTab: (subTab: EncyclopediaSubTabId) => void;
  onOpenCharacterSheet: (tab: CharacterSheetTab) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({
  onPlay,
  onReturnHome,
  isLoading,
  onSetGameState,
  onSetEncyclopediaSubTab,
  onOpenCharacterSheet
}) => {
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<PointOfInterest | null>(null);

  const handleSelectPointOfInterest = (poi: PointOfInterest | null) => {
    setSelectedPointOfInterest(poi);
    if (poi) {
      console.log(`${poi.properties.name} selected.`);
    } else {
      console.log('Point of interest deselected.');
    }
  };

  const handlePlayAction = () => {
    onPlay(selectedPointOfInterest || undefined);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 text-center mx-auto max-w-4xl">
      <h2 className="text-4xl font-bold text-emerald-300 mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        Explore the Area
      </h2>
      <p className="text-slate-300 mb-6 text-lg">
        {selectedPointOfInterest 
          ? `Selected: ${selectedPointOfInterest.properties.name} (${selectedPointOfInterest.properties.biome})` 
          : "The world awaits. Discover its secrets."}
      </p>

      <WorldMap 
        pointsOfInterest={[]}
        selectedPointOfInterest={selectedPointOfInterest}
        onSelectPointOfInterest={handleSelectPointOfInterest}
        onSetGameState={onSetGameState} 
        onSetEncyclopediaSubTab={onSetEncyclopediaSubTab}
        onNavigateHome={onReturnHome}
      />

      <ExplorationPlay 
        onPlay={handlePlayAction} 
        isLoading={isLoading} 
        selectedPointOfInterest={selectedPointOfInterest} 
      />

      <ActionButton
        onClick={onReturnHome}
        variant="primary"
        size="lg"
        icon={<ArrowUturnLeftIcon className="w-5 h-5 mr-2" />}
        className="w-full max-w-xs mx-auto !py-3 mt-4"
      >
        Return to Home
      </ActionButton>
    </div>
  );
};

export default ExploreView; 