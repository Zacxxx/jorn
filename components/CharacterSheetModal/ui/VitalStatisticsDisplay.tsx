import React from 'react';
import { Player, PlayerEffectiveStats } from '../../../types'; // Corrected path
import { HealIcon, WandIcon, ReflexIcon } from '../IconComponents'; // Path is correct

const VitalStatisticsDisplay: React.FC<{player: Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
  const primaryStats = [
    { label: "HP", value: player.hp, maxValue: stats.maxHp, icon: <HealIcon className="text-red-300"/>, valClass: "text-red-200", barClass: "bg-gradient-to-r from-red-500 to-rose-600" },
    { label: "MP", value: player.mp, maxValue: stats.maxMp, icon: <WandIcon className="text-blue-300"/>, valClass: "text-blue-200", barClass: "bg-gradient-to-r from-blue-500 to-sky-600" },
    { label: "EP", value: player.ep, maxValue: stats.maxEp, icon: <ReflexIcon className="text-yellow-300"/>, valClass: "text-yellow-200", barClass: "bg-gradient-to-r from-yellow-400 to-amber-500" },
  ];

  return (
  <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-[0.7rem] xs:text-xs sm:text-sm font-semibold text-sky-200 mb-1 xs:mb-1.5" style={{fontFamily: "'Inter Tight', sans-serif"}}>Vitals</h4>
    <div className="space-y-1 xs:space-y-1.5">
        {primaryStats.map(s => (
            <div key={s.label}>
                <div className="flex justify-between items-center text-[0.6rem] xs:text-[0.65rem] sm:text-xs mb-0.5">
                    <span className="flex items-center font-medium text-slate-100">
                        {React.cloneElement(s.icon, {className: "w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1"})}
                        {s.label}
                    </span>
                    <span className={`font-mono font-semibold text-[0.65rem] xs:text-xs ${s.valClass}`}>{s.value}<span className="opacity-70 text-[0.55rem] sm:text-[0.65rem]">/{s.maxValue}</span></span>
                </div>
                <div className="w-full bg-slate-800/70 rounded-full h-1.5 xs:h-2 sm:h-2.5 overflow-hidden shadow-inner border border-slate-600/50">
                    <div className={`h-full rounded-full transition-all duration-300 ease-out ${s.barClass} shadow-sm`}
                         style={{ width: s.maxValue > 0 ? `${Math.max(0,Math.min(100,(s.value / s.maxValue) * 100))}%` : '0%' }}>
                    </div>
                </div>
            </div>
        ))}
    </div>
  </div>
  );
};

export default VitalStatisticsDisplay;
