import React from 'react';
import { CombatActionItemType, Player, Spell, Ability } from '../../../types';
import { GetSpellIcon } from '../../IconComponents';

interface CombatActionGridSlotProps {
    actionItem: CombatActionItemType;
    player: Player; 
    onClick: (item: CombatActionItemType) => void;
    onMouseEnter: (event: React.MouseEvent, item: CombatActionItemType) => void;
    onMouseLeave: () => void;
    isDisabledByGameLogic: boolean; 
}

export const CombatActionGridSlot: React.FC<CombatActionGridSlotProps> = ({ actionItem, player, onClick, onMouseEnter, onMouseLeave, isDisabledByGameLogic }) => {
    const { name, iconName } = actionItem;
    let costText = "";
    let costColor = "text-slate-400";
    let iconColor = "text-sky-300";
    let isAffordable = true;

    if ('manaCost' in actionItem) { // Spell
        costText = `MP: ${actionItem.manaCost}`;
        isAffordable = player.mp >= actionItem.manaCost;
        costColor = isAffordable ? "text-blue-300" : "text-red-400";
        iconColor = "text-sky-300";
    } else if ('epCost' in actionItem) { // Ability
        costText = `EP: ${actionItem.epCost}`;
        isAffordable = player.ep >= actionItem.epCost;
        costColor = isAffordable ? "text-yellow-300" : "text-red-400";
        iconColor = "text-yellow-300";
    } else { // Consumable
        iconColor = "text-lime-300";
    }
    
    const finalDisabled = isDisabledByGameLogic || !isAffordable;

    return (
        <button
            onClick={() => onClick(actionItem)}
            onMouseEnter={(e) => onMouseEnter(e, actionItem)}
            onMouseLeave={onMouseLeave}
            disabled={finalDisabled}
            className={`w-full h-24 bg-slate-800/90 hover:bg-slate-700/90 border-2 
                        ${finalDisabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-slate-600 hover:border-sky-400 cursor-pointer'} 
                        rounded-lg flex flex-col items-center justify-center p-2 shadow-lg transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-800 focus:ring-sky-400`}
            aria-label={name}
        >
            <GetSpellIcon iconName={iconName} className={`w-10 h-10 mb-1.5 ${finalDisabled ? 'filter grayscale opacity-70' : iconColor}`} />
            <span className="text-xs text-slate-100 text-center truncate w-full">{name}</span>
            {costText && <span className={`text-[0.7rem] ${costColor} font-semibold mt-0.5`}>{costText}</span>}
             {!isAffordable && !isDisabledByGameLogic && <span className="absolute top-1 right-1 text-[0.6rem] text-red-300 bg-red-900/70 px-1 rounded-sm">Low Res</span>}
        </button>
    );
}; 