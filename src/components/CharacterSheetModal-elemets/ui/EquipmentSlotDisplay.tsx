import React from 'react';
import { DetailedEquipmentSlot, GameItem, Equipment, SpellIconName } from '../../../../types'; // Corrected path
import { GetSpellIcon } from '../IconComponents'; // Path is correct
import { DETAILED_SLOT_PLACEHOLDER_ICONS } from '../../../../constants'; // Corrected path

interface EquipmentSlotDisplayProps {
  slot: DetailedEquipmentSlot;
  itemId: string | null | undefined;
  allItems: GameItem[];
  onClick: () => void;
  className?: string;
}

const EquipmentSlotDisplay: React.FC<EquipmentSlotDisplayProps> = ({ slot, itemId, allItems, onClick, className = "" }) => {
  const item = itemId ? allItems.find(i => i.id === itemId) as Equipment | undefined : undefined;
  const iconName = item ? item.iconName : DETAILED_SLOT_PLACEHOLDER_ICONS[slot];
  const slotName = slot.replace(/([A-Z0-9])/g, ' $1').trim();

  return (
    <button
      onClick={onClick}
      className={`w-full h-[44px] xs:h-[48px] sm:h-[56px] md:h-[60px] bg-slate-700/70 hover:bg-slate-600/70 border-2 border-slate-600/80 hover:border-sky-500 rounded-lg flex flex-col items-center justify-center p-0.5 sm:p-1 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-1 focus:ring-sky-400 ${className}`}
      title={item ? `${item.name} (${slotName})` : `Equip ${slotName}`}
    >
      <GetSpellIcon iconName={iconName} className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item ? 'text-sky-300' : 'text-slate-500'}`} />
      <span className="text-[0.4rem] xs:text-[0.45rem] sm:text-[0.5rem] text-slate-400 mt-0.5 truncate w-full px-0.5">{item ? item.name : slotName}</span>
    </button>
  );
};

export default EquipmentSlotDisplay;
