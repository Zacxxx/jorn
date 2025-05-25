
import React from 'react';
import { Enemy } from '../../../types';
import { GetSpellIcon, SkullIcon, HealIcon } from '../../books/IconComponents';
import { STATUS_EFFECT_ICONS } from '../../../constants';

interface EnemyBattleDisplayProps {
  enemy: Enemy;
  isTargeted: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

const CompactHpBar: React.FC<{ value: number; maxValue: number; colorClass: string; height?: string }> = ({ value, maxValue, colorClass, height = 'h-2.5' }) => (
  <div className={`w-full bg-slate-900/70 rounded-full ${height} overflow-hidden shadow-inner border border-slate-700/50`}>
    <div
      className={`h-full rounded-full transition-all duration-300 ease-out ${colorClass}`}
      style={{ width: maxValue > 0 ? `${Math.max(0,Math.min(100,(value / maxValue) * 100))}%` : '0%' }}
    />
  </div>
);

interface EnemyBattleDisplayProps {
  enemy: Enemy;
  isTargeted: boolean;
  isAOEActive?: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

const EnemyBattleDisplay: React.FC<EnemyBattleDisplayProps> = ({ enemy, isTargeted, isAOEActive = false, onClick, onInfoClick }) => {
  const enemyIconName = enemy.iconName || 'SkullIcon';

  return (
    <div className="flex flex-col items-center relative" style={{ maxWidth: '240px' }}>
      {/* Enemy Sprite Placeholder */}
      <button 
        onClick={onClick} /* For targeting */
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-red-500/30 rounded-full mb-1.5 shadow-lg border-2 flex items-center justify-center
          ${isTargeted ? 'border-yellow-400 ring-2 ring-yellow-300' : isAOEActive ? 'border-purple-400 ring-2 ring-purple-300 animate-pulse' : 'border-red-400/60 hover:border-yellow-500'} transition-all duration-150`}
        title={`Target ${enemy.name}`}
        aria-pressed={isTargeted}
      >
         <GetSpellIcon iconName={enemyIconName} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-red-100 opacity-80" />
      </button>

      {/* Status Box */}
      <button 
        onClick={onInfoClick} /* For opening details modal */
        className={`bg-slate-800/90 p-2 rounded-lg shadow-xl border-2 backdrop-blur-sm w-full min-w-[180px] hover:border-red-400 transition-colors
                    ${isTargeted ? 'border-yellow-500/80' : 'border-red-600/80'}`}
        title={`View ${enemy.name} details`}
        >
        <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-xs sm:text-sm font-bold text-red-200 truncate" style={{fontFamily: "'Inter Tight', sans-serif"}}>{enemy.name}</h3>
            <span className="text-[0.65rem] font-semibold text-slate-300 bg-slate-700/60 px-1 py-0.5 rounded-sm">Lvl {enemy.level}</span>
        </div>
        
        <div className="flex items-center space-x-1 mb-1">
            <HealIcon className="w-3 h-3 text-red-300 flex-shrink-0" />
            <CompactHpBar value={enemy.hp} maxValue={enemy.maxHp} colorClass="bg-gradient-to-r from-red-500 to-rose-600" />
        </div>
        
        {enemy.activeStatusEffects.length > 0 && (
          <div className="mt-1 pt-1 border-t border-slate-700/60">
            <div className="flex flex-wrap gap-1 justify-center">
              {enemy.activeStatusEffects.slice(0, 4).map(effect => (
                <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`} 
                     className="p-0.5 bg-slate-700/80 rounded-sm border border-slate-600/50 shadow-sm">
                  <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-2.5 h-2.5 text-slate-200 opacity-90"/>
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
