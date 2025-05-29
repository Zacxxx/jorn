
import React from 'react';
import TraitCraftingForm from './TraitCraftingForm';
import ActionButton from './ActionButton';

interface TraitCraftingViewProps {
  onCraftTrait: (prompt: string) => Promise<void>;
  isLoading: boolean;
  currentTraits: number;
  playerLevel: number;
  onReturnHome: () => void;
}

const TraitCraftingView: React.FC<TraitCraftingViewProps> = ({
  onCraftTrait,
  isLoading,
  currentTraits,
  playerLevel,
  onReturnHome,
}) => {
  return (
    <div className="space-y-6">
      <TraitCraftingForm 
        onCraftTrait={onCraftTrait} 
        isLoading={isLoading} 
        currentTraits={currentTraits} 
        playerLevel={playerLevel}
      />
      <ActionButton onClick={onReturnHome} variant="secondary" className="w-full sm:w-auto">
        Back to Home
      </ActionButton>
    </div>
  );
};

export default TraitCraftingView;
