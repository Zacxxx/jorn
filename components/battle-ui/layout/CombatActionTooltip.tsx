import React from 'react';
import { CombatActionItemType, Spell, Ability } from '../../../types';
import { GetSpellIcon } from '../../books/IconComponents';

interface CombatActionTooltipProps {
    actionItem: CombatActionItemType;
    position: { x: number, y: number };
}

export const CombatActionTooltip: React.FC<CombatActionTooltipProps> = ({ actionItem, position }) => {
    const { name, iconName, description } = actionItem;
    const style: React.CSSProperties = {
        position: 'fixed', zIndex: 1100, 
        minWidth: '280px', maxWidth: '320px', pointerEvents: 'none',
    };
    if (typeof window !== 'undefined') {
        const { innerWidth, innerHeight } = window;
        if (position.x + 15 + 320 > innerWidth) { 
            style.right = innerWidth - position.x + 10;
        } else {
            style.left = position.x + 10;
        }
        if (position.y + 15 + 200 > innerHeight) { 
            style.bottom = innerHeight - position.y + 10;
        } else {
            style.top = position.y + 10;
        }
    }

    return (
        <div style={style} className="bg-slate-900/95 p-3.5 rounded-xl shadow-2xl border-2 border-sky-500 text-slate-200 backdrop-blur-md">
            <div className="flex items-center mb-2.5 pb-2 border-b border-slate-700">
                <GetSpellIcon iconName={iconName} className="w-8 h-8 mr-3 flex-shrink-0" />
                <h5 className="text-lg font-bold text-sky-300" style={{fontFamily: "'Inter Tight', sans-serif"}}>{name}</h5>
            </div>
            <p className="text-sm text-slate-300 mb-2 italic leading-relaxed">{description}</p>
            {'manaCost' in actionItem && (<div className="space-y-1 text-xs">
                <p>MP Cost: <span className="font-semibold text-blue-300">{'manaCost' in actionItem ? actionItem.manaCost : 'N/A'}</span></p>
                <p>Damage: <span className="font-semibold text-red-300">{'damage' in actionItem ? `${actionItem.damage} (${actionItem.damageType})` : 'N/A'}</span></p>
                {'scalesWith' in actionItem && actionItem.scalesWith && <p>Scales With: <span className="font-semibold text-purple-300">{actionItem.scalesWith}</span></p>}
                {'effect' in actionItem && actionItem.effect && <p>Effect: <span className="italic text-slate-400">{actionItem.effect}</span></p>}
                {'statusEffectInflict' in actionItem && actionItem.statusEffectInflict && (<p>Status: <span className="font-semibold text-teal-300">{actionItem.statusEffectInflict.chance}% to apply {actionItem.statusEffectInflict.name} ({actionItem.statusEffectInflict.duration}t{actionItem.statusEffectInflict.magnitude ? `, Mag: ${actionItem.statusEffectInflict.magnitude}` : ''})</span></p>)}
            </div>)}
            {'epCost' in actionItem && (<div className="space-y-1 text-xs">
                <p>EP Cost: <span className="font-semibold text-yellow-300">{'epCost' in actionItem ? actionItem.epCost : 'N/A'}</span></p>
                <p>Effect Type: <span className="font-semibold text-lime-300">{'effectType' in actionItem ? actionItem.effectType.replace(/_/g, ' ') : 'N/A'}</span></p>
                {'magnitude' in actionItem && actionItem.magnitude !== undefined && <p>Magnitude: <span className="font-semibold text-lime-300">{actionItem.magnitude}</span></p>}
                {'duration' in actionItem && actionItem.duration !== undefined && <p>Duration: <span className="font-semibold text-lime-300">{actionItem.duration} turns</span></p>}
                {'targetStatusEffect' in actionItem && actionItem.targetStatusEffect && <p>Targets: <span className="font-semibold text-lime-300">{actionItem.targetStatusEffect}</span></p>}
            </div>)}
            {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (<div className="space-y-1 text-xs">
                <p>Type: <span className="font-semibold text-green-300">{'itemType' in actionItem ? actionItem.itemType : 'N/A'}</span></p>
                <p>Effect: <span className="font-semibold text-green-300">{'effectType' in actionItem ? actionItem.effectType.replace(/_/g, ' ') : 'N/A'}{'magnitude' in actionItem && actionItem.magnitude !== undefined && ` (${actionItem.magnitude})`}{'duration' in actionItem && actionItem.duration !== undefined && `, ${actionItem.duration}t`}</span></p>
                {'statusToCure' in actionItem && actionItem.statusToCure && <p>Cures: <span className="font-semibold text-green-300">{actionItem.statusToCure}</span></p>}
                {'buffToApply' in actionItem && actionItem.buffToApply && <p>Buffs: <span className="font-semibold text-green-300">{actionItem.buffToApply}</span></p>}
            </div>)}
        </div>
    );
}; 