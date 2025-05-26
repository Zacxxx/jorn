import React, { useState } from 'react';
import ActionButton from '../battle-ui/layout/ActionButton';
import { ArrowUturnLeftIcon } from '../books/IconComponents';
import ExplorationPlay from './ExplorationPlay';
import { PointOfInterest, GameState, EncyclopediaSubTabId, CharacterSheetTab } from '../../types';
import MapGenerator from '../map-generator/map-generator';

interface ExploreViewProps {
  onPlay: (poi?: PointOfInterest | any) => void;
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
  const [selectedMapPOI, setSelectedMapPOI] = useState<any | null>(null);

  const handlePoiFromMapSelected = (poi: any | null) => {
    setSelectedMapPOI(poi);
    if (poi) {
      console.log(`POI from map selected: ${poi.name}`);
    } else {
      console.log('POI from map deselected.');
    }
  };

  const handlePlayAction = () => {
    onPlay(selectedMapPOI);
  };

  const handleSeekCombatClick = () => {
    if (selectedMapPOI) {
      console.log(`Seek Combat initiated for: ${selectedMapPOI.name}`);
      onPlay(selectedMapPOI);
    }
  };

  const handleResearchClick = () => {
    if (selectedMapPOI) {
      console.log(`Research initiated for: ${selectedMapPOI.name}`);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 text-center mx-auto max-w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-4xl font-bold text-emerald-300" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          Explore the Area
        </h2>
        <ActionButton
            onClick={onReturnHome}
            variant="primary"
            size="lg"
            icon={<ArrowUturnLeftIcon className="w-5 h-5 mr-2" />}
            className="!py-3"
        >
            Return to Home
        </ActionButton>
      </div>
      <p className="text-slate-300 mb-6 text-lg">
        {selectedMapPOI
          ? `Selected: ${selectedMapPOI.name}`
          : "The world awaits. Discover its secrets, or select a point on the map."}
      </p>

      <div className="flex-grow min-h-0">
        <MapGenerator onPoiSelected={handlePoiFromMapSelected} />
      </div>

      <div className="mt-4">
        <ExplorationPlay
          onPlay={handlePlayAction}
          isLoading={isLoading}
          selectedPointOfInterest={selectedMapPOI}
        />
      </div>

      {selectedMapPOI && (
        <div className="mt-4 flex justify-center space-x-4">
          <ActionButton
            onClick={handleSeekCombatClick}
            variant="danger" 
            size="lg"
            className="!py-3"
            disabled={isLoading} 
          >
            Seek Combat
          </ActionButton>
          <ActionButton
            onClick={handleResearchClick}
            variant="info" 
            size="lg"
            className="!py-3"
            disabled={isLoading} 
          >
            Research Area
          </ActionButton>
        </div>
      )}

    </div>
  );
};

export default ExploreView; 