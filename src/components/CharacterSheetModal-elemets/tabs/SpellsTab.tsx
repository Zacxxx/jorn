import React from 'react';
import { Spell, Player } from '../../../../types'; // Fixed path to types
import SpellbookDisplay from '../../SpellbookDisplay'; // Fixed path to SpellbookDisplay
import ActionButton from '../../ActionButton'; // Fixed path to ActionButton
import { WandIcon } from '../../IconComponents'; // Fixed path to IconComponents

interface SpellsTabProps {
  player: Player;
  maxRegisteredSpells: number;
  maxPreparedSpells: number;
  onEditSpell: (spell: Spell) => void;
  onPrepareSpell: (spell: Spell) => void;
  onUnprepareSpell: (spell: Spell) => void;
  onOpenSpellCraftingScreen?: () => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({
  player,
  maxRegisteredSpells,
  maxPreparedSpells,
  onEditSpell,
  onPrepareSpell,
  onUnprepareSpell,
  onOpenSpellCraftingScreen,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1 xs:p-2">
      <SpellbookDisplay
        spells={player.spells.filter(s => !player.preparedSpellIds.includes(s.id))}
        playerMana={player.mp}
        title="Spell Collection (Not Prepared)"
        onPrepareSpell={onPrepareSpell}
        onEditSpell={onEditSpell}
        canPrepareMore={player.preparedSpellIds.length < maxPreparedSpells}
        preparedSpellIds={player.preparedSpellIds}
        emptyStateMessage="No other spells in your collection."
        isCompact={false} // Example: provide a default or make it a prop of SpellsTab if needed
      />
      <SpellbookDisplay
        spells={player.spells.filter(s => player.preparedSpellIds.includes(s.id))}
        playerMana={player.mp}
        title="Prepared Spells"
        onUnprepareSpell={onUnprepareSpell}
        onEditSpell={onEditSpell}
        preparedSpellIds={player.preparedSpellIds}
        emptyStateMessage="No spells currently prepared."
        isCompact={false} // Example
      />
      {player.spells.length < maxRegisteredSpells && onOpenSpellCraftingScreen && (
        <div className="md:col-span-2 mt-2 xs:mt-3 text-center">
          <ActionButton onClick={onOpenSpellCraftingScreen} variant="success" icon={<WandIcon />} size="sm" className="text-xs sm:text-sm">
            Craft New Spell ({player.spells.length}/{maxRegisteredSpells})
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default SpellsTab;
