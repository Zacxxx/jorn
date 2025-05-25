import React from 'react';
import ActionButton from '../ActionButton'; // Adjusted path
import { PlayIcon } from '../IconComponents'; // Adjusted path

interface ExplorationPlayProps {
  onPlay: () => void;
  isLoading: boolean;
  selectedPointOfInterest: any; // Replace 'any' with 'PointOfInterest | null' once defined and used
}

const ExplorationPlay: React.FC<ExplorationPlayProps> = ({
  onPlay,
  isLoading,
  selectedPointOfInterest
}) => {
  // This component will primarily house the "PLAY" button.
  // The logic for what "PLAY" does (e.g., initiate combat, enter location) 
  // will be handled by the `onPlay` prop passed from ExploreView -> App.tsx.

  // If a point of interest is selected, the PLAY button might be more specific,
  // e.g., "Enter [PoI Name]" or "Engage enemies at [PoI Name]"
  // For now, it remains generic.

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <ActionButton
        onClick={onPlay} // This is currently handleFindEnemy from App.tsx
        variant="success"
        size="lg"
        icon={<PlayIcon className="w-6 h-6 mr-2" />}
        className="h-full !py-5 text-lg"
        isLoading={isLoading}
        loadingText={selectedPointOfInterest ? `Entering ${selectedPointOfInterest.properties.name}...` : "Loading..."}
        disabled={isLoading} // Disable if already loading
      >
        {selectedPointOfInterest ? `ENTER ${selectedPointOfInterest.properties.name.toUpperCase()}` : 'PLAY'}
      </ActionButton>
    </div>
  );
};

export default ExplorationPlay; 