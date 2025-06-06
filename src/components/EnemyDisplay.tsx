import React from 'react';
import { Enemy, ActiveStatusEffect } from '../../types';
import { GetSpellIcon, SkullIcon, BodyIcon, MindIcon, ReflexIcon, SpeedIcon } from './IconComponents';
import { STATUS_EFFECT_ICONS } from '../../constants';


interface EnemyDisplayProps {
  enemy: Enemy | null;
}

const ActiveStatusEffectDisplay: React.FC<{ effect: ActiveStatusEffect }> = ({ effect }) => {
  const iconName = STATUS_EFFECT_ICONS[effect.name] || 'Default';
  let effectColor = 'text-slate-200';
  let bgColor = 'bg-slate-600/80 hover:bg-slate-500/80 border-slate-500/70';
  if (effect.name === 'Poison' || effect.name === 'Burn') { effectColor = 'text-red-200'; bgColor = 'bg-red-700/60 hover:bg-red-600/70 border-red-600/70'; }
  if (effect.name === 'Stun' || effect.name === 'Freeze') { effectColor = 'text-blue-200'; bgColor = 'bg-blue-700/60 hover:bg-blue-600/70 border-blue-600/70'; }
  if (effect.name.startsWith('Weaken')) { effectColor = 'text-orange-200'; bgColor = 'bg-orange-700/60 hover:bg-orange-600/70 border-orange-600/70'; }
  if (effect.name.startsWith('Strengthen') || effect.name === 'Regeneration' || effect.name.startsWith('TEMP_')) { effectColor = 'text-green-200'; bgColor = 'bg-green-700/60 hover:bg-green-600/70 border-green-600/70'; }

  return (
    <div className={`flex items-center p-1.5 rounded-lg text-xs ${effectColor} ${bgColor} shadow-md border hover:border-current transition-all duration-150`} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})` : ''} - ${effect.duration} turns left`}>
      <GetSpellIcon iconName={iconName} className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
      <span className="font-semibold truncate flex-grow text-[0.7rem]">{effect.name.replace('TEMP_','').replace('_UP',' Up')}</span>
      {effect.magnitude !== undefined && <span className="ml-0.5 text-[0.65rem] opacity-90">({effect.magnitude})</span>}
      <span className="ml-auto text-slate-300 text-[0.65rem] font-mono bg-slate-800/60 px-1 py-0.5 rounded-sm">{effect.duration}t</span>
    </div>
  );
};


const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy }) => {
  if (!enemy) {
    return (
      <div className="bg-slate-800/80 p-6 rounded-xl shadow-2xl border-2 border-slate-700/70 text-center min-h-[300px] flex flex-col justify-center items-center backdrop-blur-md">
        <SkullIcon className="w-24 h-24 text-slate-600 mb-4 opacity-70" />
        <p className="text-slate-400 text-xl">No enemy encountered yet.</p>
        <p className="text-sm text-slate-500 mt-1">Seek battle to face your next foe!</p>
      </div>
    );
  }

  const isDefeated = enemy.isDefeated || enemy.hp <= 0;

  const StatBar: React.FC<{ value: number; maxValue: number; colorClass: string; label: string }> = ({ value, maxValue, colorClass, label }) => (
    <div className="mb-2.5">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className={`font-semibold ${isDefeated ? 'text-slate-500' : 'text-slate-200'}`}>{label}</span>
        <span className={`font-mono ${isDefeated ? 'text-slate-500' : 'text-slate-300'}`}>{value} / {maxValue}</span>
      </div>
      <div className={`w-full rounded-full h-4 overflow-hidden shadow-inner border-2 ${isDefeated ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-700/80 border-slate-600/60'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-md ${isDefeated ? 'bg-slate-600/50' : colorClass}`}
          style={{ width: maxValue > 0 ? `${Math.max(0, Math.min(100, (value / maxValue) * 100))}%` : '0%' }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className={`relative p-4 md:p-5 rounded-xl shadow-2xl border-2 backdrop-blur-lg ${
      isDefeated 
        ? 'bg-slate-900/70 border-slate-600/40 opacity-75' 
        : 'bg-slate-800/90 border-red-700/60'
    }`}>
      {/* Defeated Overlay */}
      {isDefeated && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/60 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <SkullIcon className="w-16 h-16 text-slate-400 mx-auto mb-2 opacity-80" />
            <div className="bg-slate-800/90 px-4 py-2 rounded-lg border border-slate-600/50">
              <span className="text-slate-300 font-bold text-lg tracking-wider">DEFEATED</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center text-center">
        <div className={`mb-3 p-3.5 rounded-full inline-block shadow-xl border-2 ${
          isDefeated 
            ? 'bg-slate-800/90 border-slate-600/60' 
            : 'bg-slate-700/90 border-red-600/60'
        }`}>
          <GetSpellIcon iconName={enemy.iconName} className={`w-16 h-16 sm:w-20 sm:h-20 ${
            isDefeated ? 'text-slate-500' : 'text-red-300'
          }`} />
        </div>
        <h3 className={`text-2xl md:text-3xl font-bold ${
          isDefeated ? 'text-slate-500' : 'text-red-300'
        }`} style={{fontFamily: "'Inter Tight', sans-serif"}}>{enemy.name} (Lvl {enemy.level})</h3>
        <p className={`text-sm italic mt-1.5 mb-3.5 max-w-md leading-relaxed ${
          isDefeated ? 'text-slate-500' : 'text-slate-300'
        }`}>{enemy.description}</p>
      </div>

      <StatBar value={enemy.hp} maxValue={enemy.maxHp} colorClass="bg-gradient-to-r from-red-500 via-red-600 to-rose-600" label="HP" />

      {enemy.activeStatusEffects && enemy.activeStatusEffects.length > 0 && (
        <div className="my-3 py-2.5 border-y-2 border-slate-700/80">
           <h4 className={`text-xs font-semibold mb-1.5 text-center uppercase tracking-wider ${
             isDefeated ? 'text-slate-500' : 'text-slate-300'
           }`}>Active Effects</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {enemy.activeStatusEffects.map(effect => (
              <ActiveStatusEffectDisplay key={effect.id} effect={effect} />
            ))}
          </div>
        </div>
      )}

      <div className={`mt-3.5 pt-3 border-t-2 border-slate-700/80 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs ${
        isDefeated ? 'opacity-60' : ''
      }`}>
        <div className={`flex items-center p-1.5 rounded-md shadow ${
          isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-200 bg-slate-700/50'
        }`}>
          <BodyIcon className={`w-4 h-4 mr-1.5 ${isDefeated ? 'text-slate-500' : 'text-orange-300'}`} /> Body: <span className={`font-semibold ml-1 ${isDefeated ? 'text-slate-500' : 'text-orange-200'}`}>{enemy.body}</span>
        </div>
        <div className={`flex items-center p-1.5 rounded-md shadow ${
          isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-200 bg-slate-700/50'
        }`}>
          <MindIcon className={`w-4 h-4 mr-1.5 ${isDefeated ? 'text-slate-500' : 'text-sky-300'}`} /> Mind: <span className={`font-semibold ml-1 ${isDefeated ? 'text-slate-500' : 'text-sky-200'}`}>{enemy.mind}</span>
        </div>
        <div className={`flex items-center p-1.5 rounded-md shadow ${
          isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-200 bg-slate-700/50'
        }`}>
          <ReflexIcon className={`w-4 h-4 mr-1.5 ${isDefeated ? 'text-slate-500' : 'text-lime-300'}`} /> Reflex: <span className={`font-semibold ml-1 ${isDefeated ? 'text-slate-500' : 'text-lime-200'}`}>{enemy.reflex}</span>
        </div>
         <div className={`flex items-center p-1.5 rounded-md shadow ${
          isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-200 bg-slate-700/50'
        }`}>
          <SpeedIcon className={`w-4 h-4 mr-1.5 ${isDefeated ? 'text-slate-500' : 'text-yellow-300'}`} /> Speed: <span className={`font-semibold ml-1 ${isDefeated ? 'text-slate-500' : 'text-yellow-200'}`}>{enemy.speed}</span>
        </div>
        {enemy.weakness && (
          <p className={`p-1.5 rounded-md shadow col-span-1 xs:col-span-2 sm:col-span-1 ${
            isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-300 bg-slate-700/50'
          }`}>Weakness: <span className={`font-semibold ${isDefeated ? 'text-slate-500' : 'text-yellow-400'}`}>{enemy.weakness}</span></p>
        )}
        {enemy.resistance && (
          <p className={`p-1.5 rounded-md shadow col-span-1 xs:col-span-2 sm:col-span-1 ${
            isDefeated ? 'text-slate-500 bg-slate-800/50' : 'text-slate-300 bg-slate-700/50'
          }`}>Resistance: <span className={`font-semibold ${isDefeated ? 'text-slate-500' : 'text-cyan-400'}`}>{enemy.resistance}</span></p>
        )}
      </div>

      {enemy.specialAbilityName && (
        <div className={`mt-3.5 pt-3 border-t-2 border-slate-700/80 p-2.5 rounded-lg shadow-inner ${
          isDefeated ? 'bg-slate-800/40 opacity-60' : 'bg-slate-700/40'
        }`}>
          <p className={`text-sm font-semibold ${isDefeated ? 'text-slate-500' : 'text-purple-300'}`}>{enemy.specialAbilityName}</p>
          {enemy.specialAbilityDescription && <p className={`text-xs italic mt-0.5 ${isDefeated ? 'text-slate-500' : 'text-slate-300'}`}>{enemy.specialAbilityDescription}</p>}
        </div>
      )}
    </div>
  );
};

export default EnemyDisplay;
