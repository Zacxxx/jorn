import React from 'react';
import SpellEditingForm from './SpellEditingForm';
import { Spell, Player, SpellComponent } from '../types';

interface SpellEditingViewProps {
  originalSpell: Spell;
  onInitiateSpellRefinement: (originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  player: Player;
  availableComponents: SpellComponent[];
}

const SpellEditingView: React.FC<SpellEditingViewProps> = ({
  originalSpell,
  onInitiateSpellRefinement,
  isLoading,
  onCancel,
  player,
  availableComponents,
}) => {
  return (
    <div className="space-y-6">
      <SpellEditingForm
        originalSpell={originalSpell}
        onInitiateSpellEdit={onInitiateSpellRefinement} 
        isLoading={isLoading}
        onCancel={onCancel}
        player={player}
        availableComponents={availableComponents}
      />
    </div>
  );
};

export default SpellEditingView;
