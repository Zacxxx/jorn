
import React from 'react';
import { Player, ActiveStatusEffect, PlayerEffectiveStats } from '../../../types';
import { HealIcon, ShieldIcon, WandIcon, GetSpellIcon, SpeedIcon, MindIcon, BodyIcon, ReflexIcon, SwordSlashIcon } from '../../books/IconComponents'; 
import { STATUS_EFFECT_ICONS } from '../../../constants';


interface PlayerStatsDisplayProps {
  player: Player; 
  effectiveStats: PlayerEffectiveStats; 
}

export const StatBar: React.FC<{ value: number; maxValue: number; colorClass: string; label: string; icon: React.ReactNode }> = ({ value, maxValue, colorClass, label, icon }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center text-sm mb-1">
      <span className="flex items-center font-semibold text-slate-100">
        {icon}
        <span className="ml-1.5">{label}</span>
      </span>
      <span className="font-mono text-slate-200">{value} / {maxValue}</span>
    </div>
    <div className="w-full bg-slate-700/80 rounded-full h-4.5 overflow-hidden shadow-inner border-2 border-slate-600/60">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold text-white/90 shadow-md ${colorClass}`}
        style={{ width: maxValue > 0 ? `${Math.max(0,Math.min(100,(value / maxValue) * 100))}%` : '0%' }}
      >
      </div>
    </div>
  </div>
);

export const ActiveStatusEffectDisplayFull: React.FC<{ effect: ActiveStatusEffect }> = ({ effect }) => {
  const iconName = STATUS_EFFECT_ICONS[effect.name] || 'Default';
  let effectColor = 'text-slate-200';
  let bgColor = 'bg-slate-700/70 hover:bg-slate-600/70 border-slate-600/60';
  if (effect.name === 'Poison' || effect.name === 'Burn') { effectColor = 'text-red-200'; bgColor = 'bg-red-800/50 hover:bg-red-700/50 border-red-700/60'; }
  else if (effect.name === 'Stun' || effect.name === 'Freeze') { effectColor = 'text-blue-200'; bgColor = 'bg-blue-800/50 hover:bg-blue-700/50 border-blue-700/60'; }
  else if (effect.name.startsWith('Weaken')) { effectColor = 'text-orange-200'; bgColor = 'bg-orange-800/50 hover:bg-orange-700/50 border-orange-700/60'; }
  else if (effect.name.startsWith('Strengthen') || effect.name === 'Regeneration' || effect.name.startsWith('TEMP_') || effect.name === 'Defending') { effectColor = 'text-green-200'; bgColor = 'bg-green-800/50 hover:bg-green-700/50 border-green-700/60'; }


  return (
    <div className={`flex items-center p-2 rounded-lg text-sm ${effectColor} ${bgColor} shadow-md border hover:border-current transition-all duration-150`}>
      <GetSpellIcon iconName={iconName} className="w-5 h-5 mr-2 flex-shrink-0" />
      <div className="flex-grow">
        <span className="font-semibold truncate">{effect.name.replace('TEMP_','').replace('_UP',' Up')}</span>
        {effect.magnitude !== undefined && <span className="ml-1 text-xs opacity-90">({effect.magnitude})</span>}
      </div>
      <span className="ml-2 text-slate-300 font-mono bg-slate-800/70 px-2 py-0.5 rounded-md text-xs">{effect.duration}t</span>
    </div>
  );
};


const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ player, effectiveStats }) => {
  
  return (
    <div className="bg-slate-800/70 p-4 md:p-5 rounded-xl shadow-2xl border-2 border-slate-600/80 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-sky-200 mb-4 text-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
        {player.name || "Hero"} - Level {player.level}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Vitals</h3>
            <StatBar value={player.hp} maxValue={effectiveStats.maxHp} colorClass="bg-gradient-to-r from-red-500 to-rose-600" label="Health" icon={<HealIcon className="w-5 h-5 text-red-300"/>} />
            <StatBar value={player.mp} maxValue={effectiveStats.maxMp} colorClass="bg-gradient-to-r from-blue-500 to-sky-600" label="Mana" icon={<WandIcon className="w-5 h-5 text-blue-300"/>} />
            <StatBar value={player.ep} maxValue={effectiveStats.maxEp} colorClass="bg-gradient-to-r from-yellow-400 to-amber-500" label="Energy" icon={<ReflexIcon className="w-5 h-5 text-yellow-300"/>} />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Core Attributes</h3>
            <div className="space-y-2 text-sm">
                <p className="flex items-center"><BodyIcon className="w-5 h-5 mr-2 text-orange-300"/> Body: <span className="font-bold text-orange-200 ml-1">{effectiveStats.body}</span> <span className="text-xs text-slate-400 ml-1">(Base: {player.body})</span></p>
                <p className="flex items-center"><MindIcon className="w-5 h-5 mr-2 text-sky-300"/> Mind: <span className="font-bold text-sky-200 ml-1">{effectiveStats.mind}</span> <span className="text-xs text-slate-400 ml-1">(Base: {player.mind})</span></p>
                <p className="flex items-center"><ReflexIcon className="w-5 h-5 mr-2 text-lime-300"/> Reflex: <span className="font-bold text-lime-200 ml-1">{effectiveStats.reflex}</span> <span className="text-xs text-slate-400 ml-1">(Base: {player.reflex})</span></p>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mt-3 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Combat Stats</h3>
             <div className="space-y-1 text-sm">
                <p className="flex items-center"><SpeedIcon className="w-5 h-5 mr-2 text-yellow-200"/> Speed: <span className="font-bold text-yellow-100 ml-1">{effectiveStats.speed}</span></p>
                <p className="flex items-center"><SwordSlashIcon className="w-5 h-5 mr-2 text-red-300"/> Physical Power: <span className="font-bold text-red-200 ml-1">{effectiveStats.physicalPower}</span></p>
                <p className="flex items-center"><WandIcon className="w-5 h-5 mr-2 text-purple-300"/> Magic Power: <span className="font-bold text-purple-200 ml-1">{effectiveStats.magicPower}</span></p>
                <p className="flex items-center"><ShieldIcon className="w-5 h-5 mr-2 text-teal-300"/> Defense: <span className="font-bold text-teal-200 ml-1">{effectiveStats.defense}</span></p>
            </div>
        </div>
      </div>
      
      {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-slate-700/80">
           <h3 className="text-lg font-semibold text-slate-300 mb-2 text-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>Active Effects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {player.activeStatusEffects.map(effect => (
              <ActiveStatusEffectDisplayFull key={effect.id} effect={effect} />
            ))}
          </div>
        </div>
      )}
       {player.activeStatusEffects.length === 0 && (
         <p className="text-sm text-slate-400 italic text-center mt-4 py-2">No active status effects.</p>
      )}
    </div>
  );
};

export default PlayerStatsDisplay;
