
import React from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import { GetSpellIcon, UserIcon, HealIcon, WandIcon, ReflexIcon, type IconProps } from './IconComponents';
import { STATUS_EFFECT_ICONS } from '../constants';

interface PlayerBattleDisplayProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onInfoClick: () => void;
}

interface CompactStatBarWithTextProps {
  value: number;
  maxValue: number;
  colorClass: string;
  label: string;
  icon: React.ReactElement<IconProps>; 
}

// Enhanced CompactStatBar for mobile, now includes text directly on the bar
const CompactStatBarWithText: React.FC<CompactStatBarWithTextProps> = 
  ({ value, maxValue, colorClass, label, icon }) => {
  const percentage = maxValue > 0 ? Math.max(0, Math.min(100, (value / maxValue) * 100)) : 0;
  return (
    <div className="mb-1 sm:mb-1.5 w-full">
      <div className="w-full bg-slate-900/70 rounded-md h-5 sm:h-6 relative overflow-hidden border border-slate-700/50 shadow-inner">
        {/* Filled portion */}
        <div
          className={`absolute top-0 left-0 h-full rounded-l-md ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 sm:px-2">
          <span className="flex items-center font-semibold text-white text-shadow-sm battle-statbar-label-text">
            {React.cloneElement(icon, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" })}
            {label}
          </span>
          <span className="font-mono font-semibold text-white text-shadow-sm battle-statbar-value-text">{value}</span>
        </div>
      </div>
    </div>
  );
};


const PlayerBattleDisplay: React.FC<PlayerBattleDisplayProps> = ({ player, effectiveStats, onInfoClick }) => {
  const playerIconName = player.iconName || 'UserIcon';

  return (
    <div className="flex flex-col items-center relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[280px]">
      {/* Player Sprite Placeholder - Smaller for mobile */}
      <div 
        className="w-16 h-16 sm:w-20 md:w-24 bg-sky-700/40 rounded-full mb-1 shadow-lg border-2 border-sky-500/70 flex items-center justify-center"
        title="Player Sprite (Placeholder)"
      >
         <GetSpellIcon iconName={playerIconName} className="w-10 h-10 sm:w-12 md:w-16 text-sky-100 opacity-90 transform scale-x-[-1]" />
      </div>

      {/* Status Box - Compacted for mobile */}
      <button 
        onClick={onInfoClick}
        className="bg-slate-800/90 p-1.5 sm:p-2 rounded-lg shadow-xl border-2 border-sky-600/80 backdrop-blur-sm w-full hover:border-sky-400 transition-colors"
        title={`View ${player.name || "Hero"} details`}
        >
        <div className="flex justify-between items-baseline mb-1">
            <h3 className="battle-char-name-text font-bold text-sky-200 truncate" style={{fontFamily: "'Inter Tight', sans-serif"}}>{player.name || 'Hero'}</h3>
            <span className="battle-char-level-text font-semibold text-slate-300 bg-slate-700/60 px-1 py-0.5 rounded-sm">Lvl {player.level}</span>
        </div>
        
        <CompactStatBarWithText value={player.hp} maxValue={effectiveStats.maxHp} colorClass="bg-gradient-to-r from-green-500 to-emerald-600" label="HP" icon={<HealIcon className="text-green-300"/>} />
        <CompactStatBarWithText value={player.mp} maxValue={effectiveStats.maxMp} colorClass="bg-gradient-to-r from-blue-500 to-sky-600" label="MP" icon={<WandIcon className="text-blue-300"/>} />
        <CompactStatBarWithText value={player.ep} maxValue={effectiveStats.maxEp} colorClass="bg-gradient-to-r from-yellow-500 to-amber-600" label="EP" icon={<ReflexIcon className="text-yellow-300"/>} />

        {player.activeStatusEffects.length > 0 && (
          <div className="mt-1 pt-1 border-t border-slate-700/60">
            <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center">
              {player.activeStatusEffects.slice(0, 4).map(effect => ( // Show fewer on mobile
                <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`} 
                     className="p-0.5 bg-slate-700/80 rounded-sm border border-slate-600/50 shadow-sm">
                  <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-200 opacity-90"/>
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
