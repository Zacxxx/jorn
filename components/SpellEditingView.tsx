
import React from 'react';
import SpellEditingForm from './SpellEditingForm';
import { Spell } from '../types';

interface SpellEditingViewProps {
  originalSpell: Spell;
  onInitiateSpellRefinement: (originalSpell: Spell, refinementPrompt: string) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

const SpellEditingView: React.FC<SpellEditingViewProps> = ({
  originalSpell,
  onInitiateSpellRefinement,
  isLoading,
  onCancel,
}) => {
  return (
    <div className="space-y-6">
      <SpellEditingForm
        originalSpell={originalSpell}
        onInitiateSpellEdit={onInitiateSpellRefinement} 
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </div>
  );
};

export default SpellEditingView;
