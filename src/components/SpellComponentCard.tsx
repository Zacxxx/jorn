import React, { useState } from 'react';
import { SpellComponent, ResourceCost, SpellIconName } from '../types';
import { GetSpellIcon, GoldCoinIcon, EssenceIcon, WandIcon, AtomIcon, BookIcon, ReflexIcon, CollectionIcon, GearIcon } from './IconComponents'; // Added GearIcon
import { RESOURCE_ICONS } from '../../constants';
import { getRarityColorClass } from '../../utils';
import ActionButton from '../../ui/ActionButton'; // Assuming ActionButton is in ui folder

interface SpellComponentCardProps {
  component: SpellComponent;
  onSelect?: (componentId: string) => void;
  isSelected?: boolean;
  showResearchRequirements?: boolean; // This might become part of the expanded view by default
  className?: string;
  showSelectButton?: boolean; // For SpellDesignStudio's explicit select button
}

const DetailItem: React.FC<{ label: string; value: string | number | React.ReactNode; icon?: SpellIconName; iconClass?: string; valueClass?: string; smallText?: boolean }> = ({ label, value, icon, iconClass, valueClass, smallText }) => (
  <div className={`flex items-start ${smallText ? 'text-[0.65rem]' : 'text-xs'} mb-0.5`}>
    {icon && <GetSpellIcon iconName={icon} className={`w-3.5 h-3.5 mr-1.5 mt-px flex-shrink-0 ${iconClass || 'text-slate-400'}`} />}
    <strong className={`text-slate-300 ${smallText ? 'w-20' : 'w-24'} flex-shrink-0`}>{label}:</strong>
    <div className={`text-slate-200 ${valueClass || ''}`}>{value}</div>
  </div>
);

const SpellComponentCard: React.FC<SpellComponentCardProps> = ({
  component,
  onSelect,
  isSelected,
  showResearchRequirements = true, // Kept for compatibility, but details are now in expanded view
  className = '',
  showSelectButton = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rarityColor = getRarityColorClass(component.rarity);
  const baseBorderColor = rarityColor.replace('text-', 'border-');
  const borderColor = isSelected ? 'border-sky-400 ring-2 ring-sky-400 shadow-sky-500/50' : `${baseBorderColor}/70 hover:border-sky-500/70`;

  const renderCosts = (costs: ResourceCost[] | undefined, title: string, iconColorClass: string) => {
    if (!costs || costs.length === 0) return null;
    return (
      <div className="mt-1">
        <p className={`text-[0.6rem] font-semibold mb-0.5 ${iconColorClass}`}>{title}:</p>
        <div className="flex flex-wrap gap-0.5">
          {costs.map((cost, index) => (
            <div key={`${cost.itemId || cost.type}-${index}`} className="flex items-center text-[0.55rem] text-slate-200 bg-slate-800/60 px-1 py-0.5 rounded-sm shadow-sm border border-slate-600/50" title={`${cost.quantity} ${cost.type}`}>
              <GetSpellIcon iconName={RESOURCE_ICONS[cost.itemId] || RESOURCE_ICONS[cost.type as string] || 'Default'} className={`w-2 h-2 mr-0.5 ${iconColorClass}`} />
              {cost.quantity} <span className="ml-0.5 opacity-70 truncate max-w-[40px]">{cost.type?.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const collapsedContent = (
    <>
      <div className="flex items-start mb-1.5">
        <GetSpellIcon iconName={component.iconName} className={`w-9 h-9 mr-2.5 flex-shrink-0 p-1 bg-slate-800/60 rounded-md border border-slate-500/70 ${rarityColor}`} />
        <div className="flex-grow min-w-0">
          <h4 className={`text-sm font-bold ${rarityColor} truncate`} title={component.name}>{component.name}</h4>
          <p className="text-[0.65rem] text-slate-400">{component.category} - Tier {component.tier}</p>
          <p className={`text-[0.65rem] font-semibold ${rarityColor}`}>Rarity: {component.rarity}</p>
        </div>
      </div>
      {component.tags && component.tags.length > 0 && (
         <div className="mt-1">
            <p className="text-[0.6rem] text-purple-300/80 truncate">Tags: {component.tags.slice(0,2).join(', ')}{component.tags.length > 2 ? '...' : ''}</p>
         </div>
      )}
    </>
  );

  const expandedContent = (
    <>
      {collapsedContent} {/* Show collapsed info first */}
      <hr className="border-slate-600/70 my-1.5" />
      <p className="text-[0.7rem] text-slate-300 mb-1.5 h-12 overflow-y-auto styled-scrollbar pr-1">{component.description}</p>

      <div className="space-y-0.5 text-[0.7rem] mb-1.5">
        {component.element && <DetailItem label="Element" value={component.element} icon="AtomIcon" iconClass="text-teal-400" smallText />}
        {component.manaCost !== undefined && component.manaCost !== 0 && <DetailItem label="Mana Mod" value={component.manaCost > 0 ? `+${component.manaCost}` : component.manaCost} icon="WandIcon" iconClass="text-blue-400" smallText />}
        {component.energyCost !== undefined && component.energyCost !== 0 && <DetailItem label="EP Mod" value={component.energyCost > 0 ? `+${component.energyCost}` : component.energyCost} icon="ReflexIcon" iconClass="text-yellow-400" smallText />}
        {renderCosts(component.baseResourceCost, "Adds to Spell Cost", "text-amber-300")}
        {component.usageGoldCost !== undefined && component.usageGoldCost > 0 && <DetailItem label="Usage Gold" value={component.usageGoldCost} icon="GoldCoinIcon" iconClass="text-yellow-400" smallText />}
        {component.usageEssenceCost !== undefined && component.usageEssenceCost > 0 && <DetailItem label="Usage Essence" value={component.usageEssenceCost} icon="EssenceIcon" iconClass="text-purple-400" smallText />}
      </div>

      {showResearchRequirements && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-600/70">
          <h5 className="text-[0.65rem] font-semibold text-sky-300 mb-0.5">Research Needs:</h5>
          <div className="space-y-0.5">
            <DetailItem label="Gold" value={component.researchRequirements.gold} icon="GoldCoinIcon" iconClass="text-yellow-400" smallText />
            {component.researchRequirements.essence !== undefined && <DetailItem label="Essence" value={component.researchRequirements.essence} icon="EssenceIcon" iconClass="text-purple-400" smallText />}
            {component.researchRequirements.requiredLevel !== undefined && <DetailItem label="Min Lvl" value={component.researchRequirements.requiredLevel} icon="Star" iconClass="text-green-400" smallText />}
            {renderCosts(component.researchRequirements.items as ResourceCost[], "Items Needed", "text-orange-300")}
          </div>
        </div>
      )}
      {component.configurableParameters && component.configurableParameters.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-600/70">
           <p className="text-[0.6rem] text-teal-300 italic flex items-center"><GearIcon className="w-3 h-3 mr-1"/>Configurable Parameters Available.</p>
        </div>
      )}
    </>
  );

  const cardBaseClass = `p-2.5 rounded-lg shadow-lg border-2 text-left flex flex-col ${borderColor} ${className} bg-slate-700/80 transition-all duration-150 focus:outline-none`;

  const mainContentClickable = !onSelect || showSelectButton;

  return (
    <div className={`${cardBaseClass} ${onSelect && !showSelectButton ? 'cursor-pointer hover:bg-slate-600/80' : ''}`}
         onClick={onSelect && !showSelectButton ? () => onSelect(component.id) : undefined}
         aria-pressed={onSelect && !showSelectButton ? isSelected : undefined}
         tabIndex={onSelect && !showSelectButton ? 0 : -1}
         onKeyDown={onSelect && !showSelectButton ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(component.id); } : undefined}
    >
      <div 
        onClick={mainContentClickable ? (e) => { e.stopPropagation(); setIsExpanded(!isExpanded); } : undefined }
        className={mainContentClickable ? 'cursor-pointer' : ''}
      >
        {isExpanded ? expandedContent : collapsedContent}
      </div>
      
      <div className="mt-auto pt-2 flex gap-2">
        <ActionButton
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            size="sm"
            variant="secondary"
            className="flex-1 !py-1 text-xs"
        >
            {isExpanded ? "Hide Details" : "Show Details"}
        </ActionButton>
        {showSelectButton && onSelect && (
            <ActionButton
                onClick={(e) => { e.stopPropagation(); onSelect(component.id); }}
                size="sm"
                variant={isSelected ? "success" : "primary"}
                className="flex-1 !py-1 text-xs"
                disabled={isSelected}
            >
                {isSelected ? "Selected" : "Select"}
            </ActionButton>
        )}
      </div>
    </div>
  );
};

export default SpellComponentCard;
