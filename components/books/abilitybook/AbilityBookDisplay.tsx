
import React from 'react';
import { Ability } from '../../../types';
import { GetSpellIcon, MindIcon, CheckmarkCircleIcon, FilterListIcon, SortAlphaIcon } from '../IconComponents';
import ActionButton from '../../battle-ui/layout/ActionButton';

interface AbilityCardProps {
  ability: Ability;
  onPrepareAbility?: (ability: Ability) => void;
  onUnprepareAbility?: (ability: Ability) => void;
  onUseAbility?: (abilityId: string) => void; // For combat
  showPrepareButton?: boolean;
  showUnprepareButton?: boolean;
  isPreparedView?: boolean; 
  isGenerallyPrepared?: boolean; 
  playerEp: number;
  isCombatContext?: boolean; // New prop
}

export const AbilityCard: React.FC<AbilityCardProps> = ({ // Exported AbilityCard
  ability,
  onPrepareAbility,
  onUnprepareAbility,
  onUseAbility,
  showPrepareButton = false,
  showUnprepareButton = false,
  isPreparedView = false,
  isGenerallyPrepared = false,
  playerEp,
  isCombatContext = false,
}) => {

  const canUse = playerEp >= ability.epCost;

  const cardClasses = `bg-slate-700/95 p-3.5 rounded-xl shadow-lg border-2 flex flex-col justify-between relative backdrop-blur-sm
    ${isCombatContext && onUseAbility && canUse ? 'cursor-pointer hover:border-yellow-400 focus-within:border-yellow-400 hover:shadow-yellow-400/40' : ''}
    ${!canUse && isCombatContext ? 'opacity-60 cursor-not-allowed' : (isCombatContext ? '' : 'hover:border-slate-500')}
    ${isPreparedView && !isCombatContext ? 'border-sky-500/90 ring-2 ring-sky-500/70' : (isCombatContext ? 'border-slate-600/90' : 'border-slate-600/90')}
     transition-all duration-200 ease-in-out transform hover:scale-[1.03]`;
  
  const handleCardClick = () => {
    if (isCombatContext && onUseAbility && canUse) {
      onUseAbility(ability.id);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      tabIndex={isCombatContext && onUseAbility && canUse ? 0 : -1}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick();}}
      title={`${ability.name}: ${ability.description}${isCombatContext && !canUse ? ' (Not enough EP)' : ''}`}
    >
      {isGenerallyPrepared && !isPreparedView && !isCombatContext && (
         <div className="absolute top-1.5 right-1.5 p-0.5 bg-green-600/90 rounded-full shadow-md border border-green-400/70 z-10" title="Prepared">
            <CheckmarkCircleIcon className="w-4 h-4 text-green-100" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-start mb-2">
          <div className="p-1.5 bg-slate-800/80 rounded-md mr-2.5 shadow-inner border border-slate-600/60">
            <GetSpellIcon iconName={ability.iconName} className="w-9 h-9 text-yellow-300 flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-grow">
            <h4 className="text-base font-bold text-yellow-200 truncate" title={ability.name} style={{fontFamily: "'Inter Tight', sans-serif"}}>{ability.name}</h4>
            <p className="text-xs text-slate-400 capitalize">{ability.effectType.replace('_', ' ')}</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mb-1.5 leading-snug h-12 overflow-y-auto styled-scrollbar pr-1" title={ability.description}>{ability.description}</p>
        {ability.magnitude && <p className="text-xs text-lime-300/90 italic mb-1.5 truncate" title={`Magnitude: ${ability.magnitude}`}>Magnitude: {ability.magnitude}</p>}
      </div>
      <div className="mt-auto">
        <div className="pt-2 mt-1.5 border-t-2 border-slate-600/80 text-xs flex justify-between items-center font-semibold">
          <span className="text-yellow-300 flex items-center">
            <MindIcon className="inline-block w-4 h-4 mr-1 opacity-80"/>EP: <span className="font-bold text-lg ml-1">{ability.epCost}</span>
          </span>
        </div>
         {!canUse && isCombatContext && (
            <div className="absolute inset-0 bg-slate-900/85 flex items-center justify-center rounded-xl backdrop-blur-sm z-20">
                <p className="text-yellow-300 font-bold text-sm px-2.5 py-1 bg-yellow-800/70 rounded-lg shadow-md border border-yellow-700/80">Low Energy</p>
            </div>
         )}
      </div>
      {!isCombatContext && (
        <div className="mt-2.5 flex gap-2">
            {showPrepareButton && onPrepareAbility && (
              <ActionButton onClick={(e) => { e.stopPropagation(); onPrepareAbility(ability);}} size="sm" variant="success" className="flex-1 !py-1 !font-semibold text-xs">
                Prepare
              </ActionButton>
            )}
            {showUnprepareButton && onUnprepareAbility && (
              <ActionButton onClick={(e) => { e.stopPropagation(); onUnprepareAbility(ability);}} size="sm" variant="warning" className="flex-1 !py-1 !font-semibold text-xs">
                Unprepare
              </ActionButton>
            )}
          </div>
      )}
    </div>
  );
};


interface AbilityBookDisplayProps {
  abilities: Ability[];
  playerEp: number;
  title?: string;
  onPrepareAbility?: (ability: Ability) => void;
  onUnprepareAbility?: (ability: Ability) => void;
  onUseAbility?: (abilityId: string) => void; // For combat
  canPrepareMore?: boolean;
  preparedAbilityIds?: string[];
  emptyStateMessage?: string;
  isCombatContext?: boolean; // New prop
}

const AbilityBookDisplay: React.FC<AbilityBookDisplayProps> = ({
  abilities,
  playerEp,
  title = "My Abilities",
  onPrepareAbility,
  onUnprepareAbility,
  onUseAbility,
  canPrepareMore = true,
  preparedAbilityIds = [],
  emptyStateMessage = "No abilities found.",
  isCombatContext = false,
}) => {

  const renderFilterSortPlaceholders = () => (
    <div className="flex justify-end space-x-2 mb-2.5 opacity-50 cursor-not-allowed">
        <div className="flex items-center text-xs text-slate-400 bg-slate-700/70 px-2.5 py-1 rounded-md shadow-sm border border-slate-600/60">
            <FilterListIcon className="w-3.5 h-3.5 mr-1"/> Filter
        </div>
        <div className="flex items-center text-xs text-slate-400 bg-slate-700/70 px-2.5 py-1 rounded-md shadow-sm border border-slate-600/60">
            <SortAlphaIcon className="w-3.5 h-3.5 mr-1"/> Sort
        </div>
    </div>
  );
  
  if (!abilities.length && title === "Ability Collection (Not Prepared)" && !isCombatContext) { 
    return (
      <div className="bg-slate-800/90 p-3 md:p-4 rounded-xl shadow-xl border-2 border-slate-700/80 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-yellow-300 mb-3 border-b-2 border-yellow-500/80 pb-2.5 pt-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
        {title === "Ability Collection (Not Prepared)" && renderFilterSortPlaceholders()}
        <p className="text-slate-400 italic py-6 px-4 text-center text-sm bg-slate-700/70 rounded-lg shadow-inner border border-slate-600/80">{emptyStateMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800/90 p-3 md:p-4 rounded-xl shadow-xl border-2 border-slate-700/80 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-yellow-300 mb-3 border-b-2 border-yellow-500/80 pb-2.5 pt-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
      {title === "Ability Collection (Not Prepared)" && !isCombatContext && renderFilterSortPlaceholders()}
      {abilities.length === 0 && (
         <p className="text-slate-400 italic py-6 px-4 text-center text-sm bg-slate-700/70 rounded-lg shadow-inner border border-slate-600/80">{emptyStateMessage}</p>
      )}
      <div className={`grid grid-cols-1 ${isCombatContext ? 'sm:grid-cols-1 md:grid-cols-2' : 'md:grid-cols-2'} gap-3 max-h-[380px] md:max-h-[420px] overflow-y-auto pr-1.5 styled-scrollbar`}>
        {abilities.map((ability) => {
          const isGenerallyPreparedCheck = preparedAbilityIds.includes(ability.id);
          return (
            <AbilityCard
              key={ability.id}
              ability={ability}
              playerEp={playerEp}
              onPrepareAbility={onPrepareAbility ? onPrepareAbility : undefined}
              onUnprepareAbility={onUnprepareAbility ? onUnprepareAbility : undefined}
              onUseAbility={onUseAbility ? onUseAbility : undefined}
              showPrepareButton={!!onPrepareAbility && !isGenerallyPreparedCheck && canPrepareMore}
              showUnprepareButton={!!onUnprepareAbility && isGenerallyPreparedCheck}
              isPreparedView={(!!onUnprepareAbility && isGenerallyPreparedCheck)} 
              isGenerallyPrepared={isGenerallyPreparedCheck}
              isCombatContext={isCombatContext}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AbilityBookDisplay;
