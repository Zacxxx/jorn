
import React from 'react';
import SpellEditingForm from './SpellEditingForm';
import SpellCard from '../../books/spellbook/SpellCard';
import { Spell } from '../../../types';

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
      {/* Static preview for the spell being edited */}
      <div className="mb-2">
        <SpellCard spell={{
  ...originalSpell,
  body: originalSpell.body ?? 0,
  mind: originalSpell.mind ?? 0,
  reflex: originalSpell.reflex ?? 0,
  speed: originalSpell.speed ?? 0,
  level: originalSpell.level ?? 1,
  activeStatusEffects: originalSpell.activeStatusEffects ?? [],
  iconName: originalSpell.iconName ?? 'Default',
}} />
      </div>
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
