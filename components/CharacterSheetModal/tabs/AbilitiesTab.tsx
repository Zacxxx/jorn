import React from 'react';
import { Ability, Player } from '../../../types';
import AbilityBookDisplay from '../../AbilityBookDisplay'; // Adjusted import path
// import ActionButton from '../../../ui/ActionButton'; // Not used in this snippet, but could be for "Craft Ability"
// import { StarIcon } from '../../IconComponents'; // Not used in this snippet

interface AbilitiesTabProps {
  player: Player;
  maxPreparedAbilities: number;
  onPrepareAbility: (ability: Ability) => void;
  onUnprepareAbility: (ability: Ability) => void;
  // onOpenAbilityCraftingScreen?: () => void; // If crafting abilities is a feature
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({
  player,
  maxPreparedAbilities,
  onPrepareAbility,
  onUnprepareAbility,
  // onOpenAbilityCraftingScreen,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1 xs:p-2">
      <AbilityBookDisplay
        abilities={player.abilities.filter(a => !player.preparedAbilityIds.includes(a.id))}
        playerEp={player.ep}
        title="Ability Collection (Not Prepared)"
        onPrepareAbility={onPrepareAbility}
        canPrepareMore={player.preparedAbilityIds.length < maxPreparedAbilities}
        preparedAbilityIds={player.preparedAbilityIds}
        emptyStateMessage="No other abilities known."
        isCompact={false} // Example: provide a default or make it a prop
      />
      <AbilityBookDisplay
        abilities={player.abilities.filter(a => player.preparedAbilityIds.includes(a.id))}
        playerEp={player.ep}
        title="Prepared Abilities"
        onUnprepareAbility={onUnprepareAbility}
        preparedAbilityIds={player.preparedAbilityIds}
        emptyStateMessage="No abilities currently prepared."
        isCompact={false} // Example
      />
      {/* Placeholder for "Craft New Ability" button if feature exists
      {onOpenAbilityCraftingScreen && (
        <div className="md:col-span-2 mt-3 text-center">
          <ActionButton onClick={onOpenAbilityCraftingScreen} variant="success" icon={<StarIcon />}>
            Craft New Ability
          </ActionButton>
        </div>
      )}
      */}
    </div>
  );
};

export default AbilitiesTab;
