import React, { useState } from 'react';
import { Player, MasterItemDefinition, GameItem, Spell, SpellComponent } from '../../../../types'; // Corrected path
import ActionButton from '../../../../ui/ActionButton'; // Corrected path assuming ActionButton is in CharacterSheetModal/ui
import { GetSpellIcon } from '../../IconComponents'; // Corrected path
import { DEFAULT_ENCYCLOPEDIA_ICON } from '../../../../constants'; // Corrected path
import { getRarityColorClass } from '../../../../utils'; // Corrected path
import { MASTER_ITEM_DEFINITIONS } from '../../../../services/itemService'; // Corrected path

type EncyclopediaSubTabType = 'monsters' | 'items' | 'spells' | 'components';

interface EncyclopediaTabProps {
  player: Player;
  // masterItemDefinitions: Record<string, MasterItemDefinition>; // Already available via import
}

const EncyclopediaTab: React.FC<EncyclopediaTabProps> = ({ player }) => {
  const [encyclopediaSubTab, setEncyclopediaSubTab] = useState<EncyclopediaSubTabType>('monsters');
  const [selectedEncyclopediaEntry, setSelectedEncyclopediaEntry] = useState<any | null>(null);
  const [encyclopediaSearchTerm, setEncyclopediaSearchTerm] = useState('');

  const renderEntryDetail = (entry: any) => {
    if (!entry) return <p className="text-slate-400 italic text-center">Select an entry to view details.</p>;

    // Determine rarity color, default if no rarity
    const rarityColor = getRarityColorClass(entry.rarity || 0);

    return (
        <div className="p-2 xs:p-3 bg-slate-800/70 rounded-md border border-slate-700 h-full overflow-y-auto styled-scrollbar-thin">
            <div className="flex items-center mb-1.5 xs:mb-2">
                <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className={`w-7 h-7 xs:w-8 xs:h-8 mr-2 xs:mr-3 ${rarityColor}`} />
                <h4 className={`text-base xs:text-lg font-bold ${rarityColor}`}>{entry.name}</h4>
            </div>
            <p className="text-[0.65rem] xs:text-xs text-slate-300 mb-1 italic leading-snug">{entry.description}</p>

            {/* Common Properties */}
            {entry.itemType && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Type: {entry.itemType}</p>}
            {entry.category && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Category: {entry.category} {entry.tier && `(Tier ${entry.tier})`}</p>}

            {/* Spell Specific */}
            {entry.manaCost !== undefined && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Mana Cost: {entry.manaCost}</p>}
            {entry.damage !== undefined && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Damage: {entry.damage} ({entry.damageType})</p>}
            {entry.epCost !== undefined && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Energy Cost: {entry.epCost}</p>}
            {entry.duration !== undefined && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Duration: {entry.duration} turns</p>}
            {entry.scalesWith && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Scales with: {entry.scalesWith}</p>}


            {/* Monster Specific */}
            {entry.level !== undefined && (entry.maxHp || entry.body) && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Level: {entry.level}</p>}
            {entry.maxHp && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">HP: {entry.maxHp}</p>}
            {entry.body && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Body: {entry.body}</p>}
            {entry.mind && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Mind: {entry.mind}</p>}
            {entry.reflex && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Reflex: {entry.reflex}</p>}
            {entry.speed && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Speed: {entry.speed}</p>}
            {entry.weakness && <p className="text-[0.6rem] xs:text-[0.65rem] text-yellow-400">Weakness: {entry.weakness}</p>}
            {entry.resistance && <p className="text-[0.6rem] xs:text-[0.65rem] text-sky-400">Resistance: {entry.resistance}</p>}
            {entry.vanquishedCount !== undefined && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Vanquished: {entry.vanquishedCount}</p>}

            {/* Item Specific (Equipment) */}
            {entry.slot && <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-400">Slot: {entry.slot}</p>}
            {entry.statsBoost && (
                <div className="mt-1">
                    <p className="text-[0.6rem] xs:text-[0.65rem] text-slate-300 font-medium">Stat Boosts:</p>
                    {Object.entries(entry.statsBoost).map(([stat, val]) => (
                        <p key={stat} className="text-[0.55rem] xs:text-[0.6rem] text-green-300 ml-1">{`${stat}: +${val}`}</p>
                    ))}
                </div>
            )}
             {/* Item Specific (Consumable) */}
            {entry.effectType && entry.itemType === "Consumable" && (
                 <p className="text-[0.6rem] xs:text-[0.65rem] text-lime-300">Effect: {entry.effectType.replace(/_/g, ' ')}
                    {entry.magnitude && ` (${entry.magnitude})`}
                    {entry.duration && `, ${entry.duration}t`}
                 </p>
            )}
        </div>
    );
  };

  let filteredEntries: any[] = [];
  let entryTypeSingular = "";

  switch (encyclopediaSubTab) {
    case 'monsters':
      entryTypeSingular = "Monster";
      filteredEntries = Object.values(player.bestiary).filter(m =>
        !encyclopediaSearchTerm || m.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'items':
      entryTypeSingular = "Item";
      const allDisplayableItems: (MasterItemDefinition | GameItem)[] = [
        ...Object.values(MASTER_ITEM_DEFINITIONS), // Global master items
        ...player.items // Player's unique items
      ];
      const uniqueDisplayableItems = Array.from(new Map(allDisplayableItems.map(item => [item.id, item])).values());
      filteredEntries = uniqueDisplayableItems.filter(i =>
        !encyclopediaSearchTerm || i.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'spells':
      entryTypeSingular = "Spell";
      filteredEntries = player.spells.filter(s =>
        !encyclopediaSearchTerm || s.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'components':
      entryTypeSingular = "Component";
      filteredEntries = player.discoveredComponents.filter(c =>
        !encyclopediaSearchTerm || c.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return (
    <div className="h-full flex flex-col p-1 xs:p-1.5">
      <div className="flex space-x-1 mb-1.5 xs:mb-2 p-1 bg-slate-800/50 rounded-md">
        {(['monsters', 'items', 'spells', 'components'] as EncyclopediaSubTabType[]).map(tab => (
          <ActionButton
            key={tab}
            onClick={() => { setEncyclopediaSubTab(tab); setSelectedEncyclopediaEntry(null); }}
            variant={encyclopediaSubTab === tab ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1 !py-1 text-[0.6rem] xs:text-xs"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </ActionButton>
        ))}
      </div>
      <input
        type="text"
        placeholder={`Search ${encyclopediaSubTab}...`}
        value={encyclopediaSearchTerm}
        onChange={e => setEncyclopediaSearchTerm(e.target.value)}
        className="w-full p-1.5 xs:p-2 mb-1.5 xs:mb-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-xs"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 xs:gap-2 flex-grow overflow-hidden">
        <div className="md:col-span-5 lg:col-span-4 overflow-y-auto styled-scrollbar space-y-1 pr-0.5 xs:pr-1 bg-slate-700/40 p-1 xs:p-1.5 rounded-md h-[calc(100vh-280px)] sm:h-[calc(100vh-260px)] md:h-auto">
          {filteredEntries.length === 0 ? (
            <p className="text-slate-400 italic text-center p-3 text-xs sm:text-sm">No {entryTypeSingular.toLowerCase()} entries found.</p>
          ) : (
            filteredEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedEncyclopediaEntry(entry)}
                className={`w-full text-left p-1 xs:p-1.5 rounded-md flex items-center transition-colors duration-150
                                ${selectedEncyclopediaEntry?.id === entry.id ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-600/70 hover:bg-slate-500/70 text-slate-200'}`}
              >
                <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2 flex-shrink-0 opacity-80" />
                <span className="text-[0.6rem] xs:text-xs truncate">{entry.name}</span>
              </button>
            ))
          )}
        </div>
        <div className="md:col-span-7 lg:col-span-8 overflow-y-auto styled-scrollbar p-0.5 xs:p-1 h-[calc(100vh-280px)] sm:h-[calc(100vh-260px)] md:h-auto">
          {selectedEncyclopediaEntry ? renderEntryDetail(selectedEncyclopediaEntry) :
            <div className="flex items-center justify-center h-full text-slate-500 italic text-xs sm:text-sm">Select an entry to view details.</div>
          }
        </div>
      </div>
    </div>
  );
};

export default EncyclopediaTab;
