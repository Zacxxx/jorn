import React from 'react';
import { Spell, SpellIconName } from '../types';
import { GetSpellIcon, WandIcon, HealIcon, SwordSlashIcon, CheckmarkCircleIcon } from './IconComponents';

interface SpellCardProps {
  spell: Spell;
  showPrepared?: boolean;
  showEditButton?: boolean;
  onEditClick?: (spell: Spell) => void;
  showPrepareButton?: boolean;
  showUnprepareButton?: boolean;
  onPrepareClick?: (spell: Spell) => void;
  onUnprepareClick?: (spell: Spell) => void;
  className?: string;
}

/**
 * Universal SpellCard for displaying a spell consistently throughout the app.
 * Shows icon, name, tags, stats, effects, and resource costs.
 */
const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  showPrepared = false,
  showEditButton = false,
  onEditClick,
  showPrepareButton = false,
  showUnprepareButton = false,
  onPrepareClick,
  onUnprepareClick,
  className = '',
}) => {
  // Tag logic: Compose tags from spell properties and custom tags
  const tags: string[] = [];
  if (spell.aoe || spell.targetType === 'aoe') tags.push('AOE');
  if (spell.targetType === 'single') tags.push('Single Target');
  if (Array.isArray((spell as any).tags)) {
    (spell as any).tags.forEach((t: string) => {
      if (!tags.includes(t)) tags.push(t);
    });
  }

  return (
    <div
      className={`bg-slate-700/95 p-3.5 rounded-xl shadow-lg border-2 flex flex-col justify-between relative backdrop-blur-sm ${className}`}
      title={`${spell.name}: ${spell.description}`}
    >
      {showPrepared && (
        <div className="absolute top-1.5 right-1.5 p-0.5 bg-green-600/90 rounded-full shadow-md border border-green-400/70 z-10" title="Prepared">
          <CheckmarkCircleIcon className="w-4 h-4 text-green-100" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-start mb-2 relative">
          <div className="p-1.5 bg-slate-800/80 rounded-md mr-2.5 shadow-inner border border-slate-600/60 relative">
            <GetSpellIcon iconName={spell.iconName} className="w-9 h-9 text-sky-300 flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-grow">
            <h4 className="text-base font-bold text-sky-200 truncate" style={{fontFamily: "'Inter Tight', sans-serif"}}>{spell.name}</h4>
            <p className="text-xs text-slate-400 capitalize">{spell.damageType} Type</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full font-semibold bg-purple-700 text-purple-100 border border-purple-400/80 shadow-sm">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-300 mb-1.5 leading-snug h-12 overflow-y-auto styled-scrollbar pr-1" title={spell.description}>{spell.description}</p>
        {spell.effect && <p className="text-xs text-purple-300/90 italic mb-1.5 truncate" title={spell.effect}>Info: {spell.effect}</p>}
        {spell.statusEffectInflict && (
          <div className="text-xs text-teal-200 italic mb-1.5 flex items-center bg-teal-800/50 p-1 rounded-md shadow-sm border border-teal-700/60" title={spell.statusEffectInflict.description || `Chance to apply ${spell.statusEffectInflict.name}` }>
            <GetSpellIcon iconName={spell.statusEffectInflict.iconName || 'Default'} className="w-3.5 h-3.5 mr-1.5 opacity-90 flex-shrink-0" />
            {spell.statusEffectInflict.chance}% {spell.statusEffectInflict.name} ({spell.statusEffectInflict.duration}t
            {spell.statusEffectInflict.magnitude ? `, ${spell.statusEffectInflict.magnitude} mag` : ''})
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
        {spell.resourceCost && spell.resourceCost.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-600/70">
            <p className="text-xs text-amber-300 font-semibold mb-1">Craft/Edit Cost:</p>
            <div className="flex flex-wrap gap-1">
              {spell.resourceCost.map(cost => (
                <div key={cost.type} className="flex items-center text-[0.7rem] text-amber-200 bg-slate-600/80 px-1.5 py-0.5 rounded shadow-sm border border-slate-500/60" title={`${cost.quantity} ${cost.type}`}>
                  <GetSpellIcon iconName={cost.iconName || 'Default'} className="w-3 h-3 mr-1 opacity-80" />
                  {cost.quantity} <span className="ml-0.5 opacity-70">{cost.type.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(showPrepareButton || showUnprepareButton) && (
          <div className="flex gap-2 mt-3">
            {showPrepareButton && (
              <button
                className="flex-1 py-1 px-2 text-xs rounded bg-green-700 hover:bg-green-800 text-white border border-green-400 shadow font-semibold"
                onClick={() => onPrepareClick && onPrepareClick(spell)}
              >Prepare</button>
            )}
            {showUnprepareButton && (
              <button
                className="flex-1 py-1 px-2 text-xs rounded bg-yellow-700 hover:bg-yellow-800 text-white border border-yellow-400 shadow font-semibold"
                onClick={() => onUnprepareClick && onUnprepareClick(spell)}
              >Unprepare</button>
            )}
          </div>
        )}
      </div>
      {showEditButton && (
        <button
          className="absolute bottom-2 right-2 px-2 py-1 text-xs rounded bg-sky-700 text-white border border-sky-400 hover:bg-sky-800 shadow"
          onClick={() => onEditClick && onEditClick(spell)}
        >Edit</button>
      )}
    </div>
  );
};

export default SpellCard;
