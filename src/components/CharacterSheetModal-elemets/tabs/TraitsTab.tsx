import React from 'react';
import { Player, Trait } from '../../../../types'; // Fixed path to types
import ActionButton from '../../ActionButton'; // Fixed path to ActionButton
import { GetSpellIcon, StarIcon } from '../../IconComponents'; // Fixed path to IconComponents
import { getRarityColorClass } from '../../../../utils'; // Fixed path to utils
import { DEFAULT_TRAIT_ICON } from '../../../../constants'; // Fixed path to constants


interface TraitsTabProps {
  player: Player;
  canCraftNewTrait?: boolean;
  onOpenTraitCraftingScreen?: () => void;
}

const TraitsTab: React.FC<TraitsTabProps> = ({
  player,
  canCraftNewTrait,
  onOpenTraitCraftingScreen,
}) => {
  return (
    <div className="p-1 xs:p-2">
      <h3 className="text-lg font-semibold text-yellow-200 mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Player Traits</h3>
      {player.traits.length === 0 ? (
        <p className="text-slate-400 italic">No traits defined yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 xs:gap-2">
          {player.traits.map(trait => (
            <div key={trait.id} className={`p-2 rounded-lg shadow-md border ${getRarityColorClass(trait.rarity).replace('text-', 'border-')}/60 bg-slate-700/70`}>
              <div className="flex items-center mb-1">
                <GetSpellIcon iconName={trait.iconName || DEFAULT_TRAIT_ICON} className={`w-4 h-4 mr-2 ${getRarityColorClass(trait.rarity)}`} />
                <h4 className={`text-sm font-semibold ${getRarityColorClass(trait.rarity)}`}>{trait.name}</h4>
              </div>
              <p className="text-[0.65rem] xs:text-xs text-slate-300 leading-snug">{trait.description}</p>
              {trait.tags && trait.tags.length > 0 && <p className="text-[0.6rem] text-purple-300 mt-1">Tags: {trait.tags.join(', ')}</p>}
              <p className="text-[0.6rem] text-slate-400">Rarity: {trait.rarity}</p>
            </div>
          ))}
        </div>
      )}
      {canCraftNewTrait && onOpenTraitCraftingScreen && (
        <div className="mt-3 text-center">
          <ActionButton onClick={onOpenTraitCraftingScreen} variant="success" icon={<StarIcon />} size="sm" className="text-xs sm:text-sm">
            Define New Trait
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default TraitsTab;
