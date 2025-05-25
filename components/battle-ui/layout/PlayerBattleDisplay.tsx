
import React from 'react';
import { Player, PlayerEffectiveStats } from '../../../types';
import { GetSpellIcon, UserIcon, HealIcon, WandIcon, ReflexIcon, BodyIcon, MindIcon } from '../../books/IconComponents';
import { STATUS_EFFECT_ICONS } from '../../../constants';

interface PlayerBattleDisplayProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onInfoClick: () => void;
}

const CompactStatBar: React.FC<{ value: number; maxValue: number; colorClass: string; label: string; icon: React.ReactNode }> = ({ value, maxValue, colorClass, label, icon }) => (
  <div className="mb-1.5">
    <div className="flex justify-between items-center text-xs mb-0.5">
      <span className="flex items-center font-semibold text-slate-100">
        {icon}
        <span className="ml-1">{label}</span>
      </span>
      <span className="font-mono text-slate-200 text-[0.7rem]">{value}/{maxValue}</span>
    </div>
    <div className="w-full bg-slate-900/70 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-700/50">
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${colorClass}`}
        style={{ width: maxValue > 0 ? `${Math.max(0,Math.min(100,(value / maxValue) * 100))}%` : '0%' }}
      />
    </div>
  </div>
);

const PlayerBattleDisplay: React.FC<PlayerBattleDisplayProps> = ({ player, effectiveStats, onInfoClick }) => {
  const playerIconName = player.iconName || 'UserIcon';

  return (
    <div className="flex flex-col items-center relative" style={{ maxWidth: '280px' }}>
      {/* Player Sprite Placeholder */}
      <div 
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-sky-500/30 rounded-full mb-2 shadow-lg border-2 border-sky-400/60 flex items-center justify-center"
        title="Player Sprite (Placeholder)"
      >
         <GetSpellIcon iconName={playerIconName} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-sky-100 opacity-80 transform scale-x-[-1]" />
      </div>

      {/* Status Box */}
      <button 
        onClick={onInfoClick}
        className="bg-slate-800/90 p-2.5 rounded-lg shadow-xl border-2 border-sky-600/80 backdrop-blur-sm w-full min-w-[200px] hover:border-sky-400 transition-colors"
        title={`View ${player.name || "Hero"} details`}
        >
        <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-sm sm:text-base font-bold text-sky-200 truncate" style={{fontFamily: "'Inter Tight', sans-serif"}}>{player.name || 'Hero'}</h3>
            <span className="text-xs font-semibold text-slate-300 bg-slate-700/60 px-1.5 py-0.5 rounded-sm">Lvl {player.level}</span>
        </div>
        
        <CompactStatBar value={player.hp} maxValue={effectiveStats.maxHp} colorClass="bg-gradient-to-r from-green-500 to-emerald-600" label="HP" icon={<HealIcon className="w-3 h-3 text-green-300"/>} />
        <CompactStatBar value={player.mp} maxValue={effectiveStats.maxMp} colorClass="bg-gradient-to-r from-blue-500 to-sky-600" label="MP" icon={<WandIcon className="w-3 h-3 text-blue-300"/>} />
        <CompactStatBar value={player.ep} maxValue={effectiveStats.maxEp} colorClass="bg-gradient-to-r from-yellow-500 to-amber-600" label="EP" icon={<ReflexIcon className="w-3 h-3 text-yellow-300"/>} />

        {player.activeStatusEffects.length > 0 && (
          <div className="mt-1.5 pt-1 border-t border-slate-700/60">
            <div className="flex flex-wrap gap-1 justify-center">
              {player.activeStatusEffects.slice(0, 5).map(effect => (
                <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`} 
                     className="p-1 bg-slate-700/80 rounded-md border border-slate-600/50 shadow-sm">
                  <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-3 h-3 text-slate-200 opacity-90"/>
                </div>
              ))}
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default PlayerBattleDisplay;
