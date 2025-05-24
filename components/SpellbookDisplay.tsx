

import React from 'react';
import { Spell, ResourceCost, SpellIconName } from '../types';
import { GetSpellIcon, WandIcon, SwordSlashIcon, HealIcon, CheckmarkCircleIcon, FilterListIcon, SortAlphaIcon } from './IconComponents'; // Added CheckmarkCircleIcon, FilterListIcon, SortAlphaIcon
import ActionButton from './ActionButton';
import { STATUS_EFFECT_ICONS, RESOURCE_ICONS } from '../constants';


interface SpellCardProps {
  spell: Spell;
  onSelectSpell?: (spell: Spell) => void;
  canCast: boolean;
  isCombat?: boolean;
  onPrepareSpell?: (spell: Spell) => void;
  onUnprepareSpell?: (spell: Spell) => void;
  onEditSpell?: (spell: Spell) => void;
  showPrepareButton?: boolean;
  showUnprepareButton?: boolean;
  showEditButton?: boolean;
  isPreparedView?: boolean; // True if this card is in the "Prepared Spells" section
  isGenerallyPrepared?: boolean; // True if this spell is in the player's preparedSpellIds (for collection view)
}

export const SpellCard: React.FC<SpellCardProps> = ({ // Exported SpellCard
  spell,
  onSelectSpell,
  canCast,
  isCombat = false,
  onPrepareSpell,
  onUnprepareSpell,
  onEditSpell,
  showPrepareButton = false,
  showUnprepareButton = false,
  showEditButton = false,
  isPreparedView = false,
  isGenerallyPrepared = false,
}) => {

  const cardClasses = `bg-slate-700/95 p-3.5 rounded-xl shadow-lg border-2 flex flex-col justify-between relative backdrop-blur-sm
    ${isCombat && onSelectSpell && canCast ? 'cursor-pointer hover:border-sky-400 focus-within:border-sky-400 hover:shadow-sky-400/40' : ''}
    ${!canCast && isCombat ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-500'}
    ${isPreparedView && !isCombat ? 'border-sky-500/90 ring-2 ring-sky-500/70' : 'border-slate-600/90'}
     transition-all duration-200 ease-in-out transform hover:scale-[1.03]`;

  const handleCardClick = () => {
    if (isCombat && onSelectSpell && canCast) {
      onSelectSpell(spell);
    }
  };

  const statusEffect = spell.statusEffectInflict;

  const renderResourceCosts = (costs: ResourceCost[]) => (
    <div className="mt-2 pt-2 border-t border-slate-600/70">
      <p className="text-xs text-amber-300 font-semibold mb-1">Craft/Edit Cost:</p>
      <div className="flex flex-wrap gap-1">
        {costs.map(cost => (
          <div key={cost.type} className="flex items-center text-[0.7rem] text-amber-200 bg-slate-600/80 px-1.5 py-0.5 rounded shadow-sm border border-slate-500/60" title={`${cost.quantity} ${cost.type}`}>
            <GetSpellIcon iconName={RESOURCE_ICONS[cost.type] || 'Default'} className="w-3 h-3 mr-1 opacity-80" />
            {cost.quantity} <span className="ml-0.5 opacity-70">{cost.type.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      tabIndex={isCombat && onSelectSpell && canCast ? 0 : -1}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick();}}
      title={isCombat && !canCast ? "Not enough mana" : `${spell.name}: ${spell.description}`}
    >
      {isGenerallyPrepared && !isPreparedView && !isCombat && (
        <div className="absolute top-1.5 right-1.5 p-0.5 bg-green-600/90 rounded-full shadow-md border border-green-400/70 z-10" title="Prepared">
            <CheckmarkCircleIcon className="w-4 h-4 text-green-100" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-start mb-2">
          <div className="p-1.5 bg-slate-800/80 rounded-md mr-2.5 shadow-inner border border-slate-600/60">
            <GetSpellIcon iconName={spell.iconName} className="w-9 h-9 text-sky-300 flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-grow">
            <h4 className="text-base font-bold text-sky-200 truncate" title={spell.name} style={{fontFamily: "'Inter Tight', sans-serif"}}>{spell.name}</h4>
            <p className="text-xs text-slate-400 capitalize">{spell.damageType} Type</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mb-1.5 leading-snug h-12 overflow-y-auto styled-scrollbar pr-1" title={spell.description}>{spell.description}</p>
        {spell.effect && <p className="text-xs text-purple-300/90 italic mb-1.5 truncate" title={spell.effect}>Info: {spell.effect}</p>}
        {statusEffect && (
          <div className="text-xs text-teal-200 italic mb-1.5 flex items-center bg-teal-800/50 p-1 rounded-md shadow-sm border border-teal-700/60" title={statusEffect.description || `Chance to apply ${statusEffect.name}`}>
             <GetSpellIcon iconName={STATUS_EFFECT_ICONS[statusEffect.name] || 'Default'} className="w-3.5 h-3.5 mr-1.5 opacity-90 flex-shrink-0" />
            {statusEffect.chance}% {statusEffect.name} ({statusEffect.duration}t
            {statusEffect.magnitude ? `, ${statusEffect.magnitude} mag` : ''})
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="pt-2 mt-1.5 border-t-2 border-slate-600/80 text-xs flex justify-between items-center font-semibold">
          <span className="text-blue-300 flex items-center">
            <WandIcon className="inline-block w-4 h-4 mr-1 opacity-80"/>MP: <span className="font-bold text-lg ml-1">{spell.manaCost}</span>
          </span>
          <span className={`${spell.damageType === 'Healing' ? 'text-green-300' : spell.damage > 0 ? 'text-red-300' : 'text-slate-400'} flex items-center`}>
            {spell.damageType === 'Healing' ? <HealIcon className="inline-block w-4 h-4 mr-1 opacity-80"/> : spell.damage > 0 ? <SwordSlashIcon className="inline-block w-4 h-4 mr-1 opacity-80"/> : null}
            {spell.damageType === 'Healing' ? 'Heal:' : spell.damage > 0 ? 'Dmg:' : 'Effect'} <span className="font-bold text-lg ml-1">{spell.damage > 0 ? spell.damage : ''}</span>
          </span>
        </div>
        {spell.resourceCost && spell.resourceCost.length > 0 && !isCombat && renderResourceCosts(spell.resourceCost)}
      </div>
       {!canCast && isCombat && (
        <div className="absolute inset-0 bg-slate-900/85 flex items-center justify-center rounded-xl backdrop-blur-sm z-20">
          <p className="text-red-300 font-bold text-sm px-2.5 py-1 bg-red-800/70 rounded-lg shadow-md border border-red-700/80">Low Mana</p>
        </div>
      )}
      {!isCombat && (
        <div className="mt-2.5 flex gap-2">
          {showPrepareButton && onPrepareSpell && (
            <ActionButton onClick={(e) => { e.stopPropagation(); onPrepareSpell(spell);}} size="sm" variant="success" className="flex-1 !py-1 !font-semibold text-xs">
              Prepare
            </ActionButton>
          )}
          {showUnprepareButton && onUnprepareSpell && (
            <ActionButton onClick={(e) => { e.stopPropagation(); onUnprepareSpell(spell);}} size="sm" variant="warning" className="flex-1 !py-1 !font-semibold text-xs">
              Unprepare
            </ActionButton>
          )}
          {showEditButton && onEditSpell && (
             <ActionButton onClick={(e) => { e.stopPropagation(); onEditSpell(spell);}} size="sm" variant="secondary" className="flex-1 !py-1 !font-semibold text-xs">
              Edit
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
};


interface SpellbookDisplayProps {
  spells: Spell[];
  playerMana: number;
  onSelectSpell?: (spell: Spell) => void;
  isCombat?: boolean;
  title?: string;
  onPrepareSpell?: (spell: Spell) => void;
  onUnprepareSpell?: (spell: Spell) => void;
  onEditSpell?: (spell: Spell) => void;
  canPrepareMore?: boolean;
  preparedSpellIds?: string[];
  emptyStateMessage?: string;
}

const SpellbookDisplay: React.FC<SpellbookDisplayProps> = ({
  spells,
  playerMana,
  onSelectSpell,
  isCombat = false,
  title = "My Spellbook",
  onPrepareSpell,
  onUnprepareSpell,
  onEditSpell,
  canPrepareMore = true,
  preparedSpellIds = [],
  emptyStateMessage = "Your spellbook is empty. Craft some spells!"
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

  if (!spells.length && !isCombat && title === "Spell Collection (Not Prepared)") { // Show filter/sort only for main collection
    return (
      <div className="bg-slate-800/90 p-3 md:p-4 rounded-xl shadow-xl border-2 border-slate-700/80 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-sky-300 mb-3 border-b-2 border-sky-500/80 pb-2.5 pt-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
        {title === "Spell Collection (Not Prepared)" && !isCombat && renderFilterSortPlaceholders()}
        <p className="text-slate-400 italic py-6 px-4 text-center text-sm bg-slate-700/70 rounded-lg shadow-inner border border-slate-600/80">{emptyStateMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800/90 p-3 md:p-4 rounded-xl shadow-xl border-2 border-slate-700/80 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-sky-300 mb-3 border-b-2 border-sky-500/80 pb-2.5 pt-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
      {title === "Spell Collection (Not Prepared)" && !isCombat && renderFilterSortPlaceholders()}
      {spells.length === 0 && (
         <p className="text-slate-400 italic py-6 px-4 text-center text-sm bg-slate-700/70 rounded-lg shadow-inner border border-slate-600/80">{emptyStateMessage}</p>
      )}
      <div className={`grid grid-cols-1 ${isCombat ? 'sm:grid-cols-1 md:grid-cols-2' : 'md:grid-cols-2'} gap-3 max-h-[380px] md:max-h-[420px] overflow-y-auto pr-1.5 styled-scrollbar`}>
        {spells.map((spell) => {
          const isGenerallyPreparedCheck = preparedSpellIds.includes(spell.id);
          return (
            <SpellCard
              key={spell.id}
              spell={spell}
              onSelectSpell={onSelectSpell}
              canCast={playerMana >= spell.manaCost}
              isCombat={isCombat}
              onPrepareSpell={onPrepareSpell ? onPrepareSpell : undefined}
              onUnprepareSpell={onUnprepareSpell ? onUnprepareSpell : undefined}
              onEditSpell={onEditSpell && !isCombat ? onEditSpell : undefined}
              showPrepareButton={!!onPrepareSpell && !isGenerallyPreparedCheck && canPrepareMore}
              showUnprepareButton={!!onUnprepareSpell && isGenerallyPreparedCheck}
              showEditButton={!!onEditSpell && !isCombat}
              isPreparedView={isCombat || (!!onUnprepareSpell && isGenerallyPreparedCheck)}
              isGenerallyPrepared={isGenerallyPreparedCheck}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SpellbookDisplay;
