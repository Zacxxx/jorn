
import React from 'react';
import SpellCraftingForm from '../spellcrafting/SpellCraftingForm';
import SpellCard from '../../books/spellbook/SpellCard';
import ActionButton from '../../battle-ui/layout/ActionButton';

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
      {/* Static preview for a new spell (placeholder values) */}
      <div className="mb-2">
        <SpellCard
          spell={{
            id: 'preview',
            name: 'New Spell Preview',
            description: 'Your spell preview will appear here once crafted.',
            iconName: 'Default',
            damageType: 'Arcane',
            damage: 0,
            manaCost: 0,
            aoe: false,
            tags: [],
            resourceCost: [],
            body: 0,
            mind: 0,
            reflex: 0,
            speed: 0,
            level: 1,
            activeStatusEffects: [],
          }}
        />
      </div>
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
