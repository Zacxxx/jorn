import React from 'react';
import { Player, PlayerEffectiveStats } from '../../../types'; // Corrected path
import {
    GetSpellIcon, SpeedIcon, SwordSlashIcon, MindIcon, ShieldIcon, BodyIcon, ReflexIcon
} from '../IconComponents'; // Path is correct
import { STATUS_EFFECT_ICONS } from '../../../constants'; // Corrected path

const AttributesDisplay: React.FC<{player:Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
    const combatStats = [
      { label: "Speed", value: stats.speed, icon: <SpeedIcon className="text-lime-300"/>, valClass: "text-lime-200" },
      { label: "Phys. Pow", value: stats.physicalPower, icon: <SwordSlashIcon className="text-orange-300"/>, valClass: "text-orange-200" },
      { label: "Mag. Pow", value: stats.magicPower, icon: <MindIcon className="text-purple-300"/>, valClass: "text-purple-200" },
      { label: "Defense", value: stats.defense, icon: <ShieldIcon className="text-teal-300"/>, valClass: "text-teal-200" },
      { label: "Dmg Reflect", value: Math.round((stats.damageReflectionPercent || 0) * 100), icon: <ShieldIcon className="text-pink-300"/>, valClass: "text-pink-200" },
  ];
  return (
  <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-[0.7rem] xs:text-xs sm:text-sm font-semibold text-sky-200 mb-0.5 xs:mb-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>Attributes</h4>
    <div className="grid grid-cols-3 gap-0.5 xs:gap-1 mb-1 xs:mb-1.5">
        {[
            {label: "Body", value: stats.body, base: player.body, icon: <BodyIcon className="text-red-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects HP, Physical Power, Defense"},
            {label: "Mind", value: stats.mind, base: player.mind, icon: <MindIcon className="text-blue-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects MP, Magic Power"},
            {label: "Reflex", value: stats.reflex, base: player.reflex, icon: <ReflexIcon className="text-yellow-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects EP, Speed, Defense"},
        ].map(attr => (
            <div key={attr.label} className="bg-slate-800/60 p-0.5 xs:p-1 rounded-md text-center shadow-sm border border-slate-600/50" title={`${attr.desc}\nBase: ${attr.base} (+${attr.value - attr.base} from effects/gear)`}>
                {React.cloneElement(attr.icon, {className: `${attr.icon.props.className} mx-auto mb-0 xs:mb-0.5`})}
                <p className="text-[0.45rem] xs:text-[0.5rem] sm:text-[0.6rem] text-slate-200 font-medium">{attr.label}</p>
                <p className="text-[0.65rem] xs:text-xs sm:text-sm md:text-base font-bold text-slate-50">{attr.value}</p>
            </div>
        ))}
    </div>
    <div className="grid grid-cols-2 gap-x-0.5 xs:gap-x-1 gap-y-0.5 pt-0.5 xs:pt-1 border-t border-slate-600/60">
        {combatStats.map(s => (
            <div key={s.label} className="flex items-center justify-between bg-slate-800/60 p-0.5 xs:p-0.5 rounded-md shadow-sm text-[0.5rem] xs:text-[0.55rem] sm:text-[0.65rem]">
                <span className="flex items-center text-slate-200">
                    {React.cloneElement(s.icon, {className: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 mr-0.5 xs:mr-0.5"})}
                    {s.label}:
                </span>
                <span className={`font-bold text-[0.55rem] xs:text-[0.6rem] sm:text-xs ${s.valClass}`}>{s.value}{s.label === 'Dmg Reflect' ? '%' : ''}</span>
            </div>
        ))}
    </div>
     {player.activeStatusEffects.length > 0 && (
      <>
        <h5 className="text-[0.55rem] xs:text-[0.6rem] sm:text-xs font-semibold text-slate-200 mt-1 xs:mt-1.5 mb-0.5">Active Effects:</h5>
        <div className="flex flex-wrap gap-0.5">
          {player.activeStatusEffects.map(effect => (
            <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`}
                 className="text-[0.5rem] xs:text-[0.55rem] bg-slate-600/80 px-0.5 py-0 rounded-sm flex items-center shadow-sm border border-slate-500/70">
              <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-1.5 h-1.5 xs:w-2 xs:h-2 mr-0.5 opacity-90"/>
              <span className="text-slate-100">{effect.name.replace('TEMP_','').replace('_UP','')}</span>
              {effect.magnitude && <span className="ml-0.5 opacity-80">({effect.magnitude})</span>}
              <span className="ml-0.5 text-slate-300 font-mono bg-slate-800/50 px-0.5 text-[0.45rem] xs:text-[0.5rem] rounded-sm">{effect.duration}t</span>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);};

export default AttributesDisplay;
