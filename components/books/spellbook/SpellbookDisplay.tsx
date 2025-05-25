
import React from 'react';
import { Spell } from '../../../types';
import SpellCard from './SpellCard';
import { FilterListIcon, SortAlphaIcon } from '../IconComponents';

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
          const isGenerallyPreparedCheck = preparedSpellIds?.includes(spell.id);
          return (
            <SpellCard
              key={spell.id}
              spell={spell}
              showPrepareButton={!!onPrepareSpell && !isGenerallyPreparedCheck && canPrepareMore}
              showUnprepareButton={!!onUnprepareSpell && isGenerallyPreparedCheck}
              showEditButton={!!onEditSpell && !isCombat}
              onEditClick={onEditSpell ? () => onEditSpell(spell) : undefined}
              onPrepareClick={onPrepareSpell ? () => onPrepareSpell(spell) : undefined}
              onUnprepareClick={onUnprepareSpell ? () => onUnprepareSpell(spell) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SpellbookDisplay;
