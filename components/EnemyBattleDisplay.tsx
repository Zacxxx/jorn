import React from 'react';
import { Enemy } from '../types';
import { GetSpellIcon, HealIcon, type IconProps } from './IconComponents';
import { STATUS_EFFECT_ICONS } from '../constants';

interface EnemyBattleDisplayProps {
  enemy: Enemy;
  isTargeted: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

interface CompactHpBarWithTextProps {
  value: number;
  maxValue: number;
  colorClass: string;
  label: string;
  icon: React.ReactElement<IconProps>;
}
// Enhanced CompactHpBar for mobile, includes text directly on the bar
const CompactHpBarWithText: React.FC<CompactHpBarWithTextProps> = 
  ({ value, maxValue, colorClass, label, icon }) => {
  const percentage = maxValue > 0 ? Math.max(0, Math.min(100, (value / maxValue) * 100)) : 0;
  return (
    <div className="w-full">
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


const EnemyBattleDisplay: React.FC<EnemyBattleDisplayProps> = ({ enemy, isTargeted, onClick, onInfoClick }) => {
  const enemyIconName = enemy.iconName || 'SkullIcon';

  return (
    <div className="flex flex-col items-center relative w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px]">
      {/* Enemy Sprite Placeholder - Smaller for mobile */}
      <button 
        onClick={onClick} /* For targeting */
        className={`w-14 h-14 sm:w-16 md:w-20 bg-red-700/40 rounded-full mb-1 shadow-lg border-2 flex items-center justify-center
                    ${isTargeted ? 'border-yellow-400 ring-2 ring-yellow-300 scale-105' : 'border-red-500/70 hover:border-yellow-500'} transition-all duration-150`}
        title={`Target ${enemy.name}`}
        aria-pressed={isTargeted}
      >
         <GetSpellIcon iconName={enemyIconName} className="w-8 h-8 sm:w-10 md:w-12 text-red-100 opacity-90" />
      </button>

      {/* Status Box - Compacted for mobile */}
      <button 
        onClick={onInfoClick} /* For opening details modal */
        className={`bg-slate-800/90 p-1.5 sm:p-2 rounded-lg shadow-xl border-2 backdrop-blur-sm w-full hover:border-red-400 transition-colors
                    ${isTargeted ? 'border-yellow-500/80' : 'border-red-600/80'}`}
        title={`View ${enemy.name} details`}
        >
        <div className="flex justify-between items-baseline mb-0.5 sm:mb-1">
            <h3 className="battle-char-name-text font-bold text-red-200 truncate" style={{fontFamily: "'Inter Tight', sans-serif"}}>{enemy.name}</h3>
            <span className="battle-char-level-text font-semibold text-slate-300 bg-slate-700/60 px-1 py-0.5 rounded-sm">Lvl {enemy.level}</span>
        </div>
        
        <CompactHpBarWithText value={enemy.hp} maxValue={enemy.maxHp} colorClass="bg-gradient-to-r from-red-500 to-rose-600" label="HP" icon={<HealIcon className="text-red-200"/>} />
        
        {enemy.activeStatusEffects.length > 0 && (
          <div className="mt-1 pt-1 border-t border-slate-700/60">
            <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center">
              {enemy.activeStatusEffects.slice(0, 3).map(effect => ( // Show fewer on mobile
                <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`} 
                     className="p-0.5 bg-slate-700/80 rounded-sm border border-slate-600/50 shadow-sm">
                  <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-200 opacity-90"/>
                </div>
              ))}
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default EnemyBattleDisplay;
