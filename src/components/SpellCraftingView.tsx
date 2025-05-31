
import React from 'react';
import SpellCraftingForm from './SpellCraftingForm';
import ActionButton from './ActionButton';

interface SpellCraftingViewProps {
  onInitiateSpellCraft: (prompt: string) => Promise<void>;
  isLoading: boolean;
  currentSpells: number;
  maxSpells: number;
  onReturnHome: () => void;
}

const SpellCraftingView: React.FC<SpellCraftingViewProps> = ({
  onInitiateSpellCraft,
  isLoading,
  currentSpells,
  maxSpells,
  onReturnHome,
}) => {
  return (
    <div className="space-y-6">
      <SpellCraftingForm 
        onInitiateSpellCraft={onInitiateSpellCraft} 
        isLoading={isLoading} 
        currentSpells={currentSpells} 
        maxSpells={maxSpells} 
      />
      <ActionButton onClick={onReturnHome} variant="secondary" className="w-full sm:w-auto">
        Back to Home
      </ActionButton>
    </div>
  );
};

export default SpellCraftingView;
