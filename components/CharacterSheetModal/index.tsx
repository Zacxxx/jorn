import React, { useState, useEffect, useCallback } from 'react';
import { Player, PlayerEffectiveStats, DetailedEquipmentSlot, GameItem, Equipment, Spell, Ability, EquipmentSlot as GenericEquipmentSlot, InventoryFilterType, MasterItemDefinition, MasterResourceItem, MasterConsumableItem, LootChestItem, UniqueConsumable, Quest, CharacterSheetTab, SpellIconName } from '../types';
import Modal from '../ui/Modal';
import '../src/styles/ability-list.css';
import ActionButton from '../ui/ActionButton';
import {
    GetSpellIcon, UserIcon, GearIcon, BagIcon, WandIcon, StarIcon, BookIcon, MindIcon,
    HealIcon, SpeedIcon, SwordSlashIcon, ShieldIcon, BodyIcon, ReflexIcon,
    ChestIcon, CollectionIcon
} from './IconComponents';
import {
    DETAILED_EQUIPMENT_SLOTS_LEFT_COL, DETAILED_EQUIPMENT_SLOTS_RIGHT_COL,
    DETAILED_SLOT_PLACEHOLDER_ICONS, RESOURCE_ICONS, STATUS_EFFECT_ICONS, DEFAULT_ENCYCLOPEDIA_ICON, GENERIC_TO_DETAILED_SLOT_MAP,
    DEFAULT_TRAIT_ICON
} from '../constants';
import SpellbookDisplay from './SpellbookDisplay';
import AbilityBookDisplay from './AbilityBookDisplay';
import { MASTER_ITEM_DEFINITIONS } from '../services/itemService';
import { getRarityColorClass } from '../utils';
import SheetTabButton from './ui/SheetTabButton'; // Added import
import EquipmentSlotDisplay from './ui/EquipmentSlotDisplay'; // Added import
import VitalStatisticsDisplay from './ui/VitalStatisticsDisplay';
import AttributesDisplay from './ui/AttributesDisplay';
import { ItemCard } from './ui/ItemCard';
import ItemSelectionSubModal from './ui/ItemSelectionSubModal';

// Tab Components
import MainTab from './tabs/MainTab';
import CreateTalentModal from './tabs/main/talents/CreateTalentModal';
import ResearchUnlocksModal from './tabs/main/talents/ResearchUnlocksModal';
import InventoryTab from './tabs/InventoryTab';
import SpellsTab from './tabs/SpellsTab';
import AbilitiesTab from './tabs/AbilitiesTab';
import TraitsTab from './tabs/TraitsTab';
import QuestsTab from './tabs/QuestsTab';
import EncyclopediaTab from './tabs/EncyclopediaTab';


interface CharacterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onEquipItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
  onUnequipItem: (slot: DetailedEquipmentSlot) => void;
  maxRegisteredSpells: number;
  maxPreparedSpells: number;
  maxPreparedAbilities: number;
  onEditSpell: (spell: Spell) => void;
  onPrepareSpell: (spell: Spell) => void;
  onUnprepareSpell: (spell: Spell) => void;
  onPrepareAbility: (ability: Ability) => void;
  onUnprepareAbility: (ability: Ability) => void;
  initialTab?: CharacterSheetTab;
  onOpenSpellCraftingScreen?: () => void;
  onOpenTraitCraftingScreen?: () => void;
  canCraftNewTrait?: boolean;
  onOpenLootChest?: (chestId: string) => Promise<void>;
  onUseConsumableFromInventory: (itemId: string, targetId: string | null) => void;
}

// AttributesDisplay is now imported from ui/AttributesDisplay and used within MainTab.tsx
// Inventory-specific types (InventoryGridItemType), state, and handlers are now in InventoryTab.tsx
// MainTab-specific helper components are now in MainTab.tsx or its sub-components.


export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  isOpen, onClose, player, effectiveStats, onEquipItem, onUnequipItem,
  maxRegisteredSpells, maxPreparedSpells, maxPreparedAbilities, onEditSpell,
  onPrepareSpell, onUnprepareSpell, onPrepareAbility, onUnprepareAbility,
  initialTab, onOpenSpellCraftingScreen,
  onOpenTraitCraftingScreen, canCraftNewTrait, onOpenLootChest,
  onUseConsumableFromInventory
}) => {
  const [activeTab, setActiveTab] = useState<CharacterSheetTab>(initialTab || 'Main');
  const [itemSelectionModalState, setItemSelectionModalState] = useState<{isOpen: boolean, slot: DetailedEquipmentSlot | null}>({isOpen: false, slot: null});
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<Quest | null>(null);

  // Inventory state and handlers are moved to InventoryTab.tsx

  type EncyclopediaSubTabType = 'monsters' | 'items' | 'spells' | 'components';
  const [encyclopediaSubTab, setEncyclopediaSubTab] = useState<EncyclopediaSubTabType>('monsters');
  const [selectedEncyclopediaEntry, setSelectedEncyclopediaEntry] = useState<any | null>(null);
  const [encyclopediaSearchTerm, setEncyclopediaSearchTerm] = useState('');

  // State for new 'Main' tab UI
  const [currentTreeCategory, setCurrentTreeCategory] = useState<string>('core');
  const [selectedTalentDetails, setSelectedTalentDetails] = useState<any | null>(null); // Replace 'any' with a proper Talent type
  const [createTalentModalOpen, setCreateTalentModalOpen] = useState<boolean>(false);
  const [researchUnlocksModalOpen, setResearchUnlocksModalOpen] = useState<boolean>(false);

  // Placeholder for talent data (to be replaced with actual data structure)
  const treeData: any = {
    core: [
      { id: 'core_1', name: 'Core Talent 1', tier: 1, connections: ['core_2'], type: 'passive', description: 'Description for Core Talent 1', effects: ['Effect A'], requirements: {} },
      { id: 'core_2', name: 'Core Talent 2', tier: 2, connections: [], type: 'active', description: 'Description for Core Talent 2', effects: ['Effect B'], requirements: { level: 5 } },
    ],
    combat: [
      { id: 'combat_1', name: 'Combat Talent 1', tier: 1, connections: [], type: 'active', description: 'Description for Combat Talent 1', effects: ['Effect C'], requirements: { body: 5 } },
    ]
    // Add other categories like 'utility' etc.
  };

  // === Talent System Functions (Adapted from ability-list.ts) ===

  const updateTalentDetailsPanel = (talentData: any) => {
    setSelectedTalentDetails(talentData);
  };

  const getTalentById = (talentId: string) => {
    for (const category in treeData) {
      const found = treeData[category].find((t:any) => t.id === talentId);
      if (found) return found;
    }
    return null;
  };

  const getTalentType = (talentId: string): string => {
    const talent = getTalentById(talentId);
    return talent ? talent.type : "Unknown";
  };

  const getTalentDescription = (talentId: string): string => {
    const talent = getTalentById(talentId);
    return talent ? talent.description : "No description found.";
  };

  const getTalentEffects = (talentId: string): string[] => {
    const talent = getTalentById(talentId);
    return talent ? talent.effects : [];
  };

  const getTalentRequirements = (talentId: string, tier: number): object => {
    // Tier might be used if requirements change by rank, not just base talent
    const talent = getTalentById(talentId);
    return talent ? talent.requirements : {};
  };

  // Talent-related functions like updateTalentDetailsPanel, getTalentById, etc. remain here
  // as they are used by MainTab and its sub-components (TalentTree, TalentDetailView)
  // and MainTab receives them as props or they are defined within MainTab's scope if not passed.
  // The actual generateCreateTalentContent and generateResearchUnlocksContent are now within their respective modal components.


  useEffect(() => {
    if (isOpen && initialTab) {
        setActiveTab(initialTab);
        if (initialTab !== 'Quests') setSelectedQuestDetail(null);
        // Reset inventory-specific states if InventoryTab itself doesn't handle it on visibility change
        // (Currently, InventoryTab manages its own state internally, so less need to reset here)
        if (initialTab !== 'Encyclopedia') {
            setSelectedEncyclopediaEntry(null);
            setEncyclopediaSearchTerm('');
        }
    }
    if (!isOpen) { // Reset states when modal closes
        setSelectedQuestDetail(null);
        // Inventory states are managed within InventoryTab, will reset if InventoryTab unmounts or has its own useEffect for isOpen
        setSelectedEncyclopediaEntry(null);
        setEncyclopediaSearchTerm('');
    }
  }, [isOpen, initialTab]);

  const handleCloseModal = () => {
    onClose();
  };


  const getCompatibleItemsForSlot = useCallback((slot: DetailedEquipmentSlot): Equipment[] => {
    const genericSlotTypes: GenericEquipmentSlot[] = [];
    if (['Head', 'Chest', 'Legs', 'Feet', 'Hands', 'Shoulder'].includes(slot)) genericSlotTypes.push('Armor');
    if (['Neck', 'Jewels', 'Belt', 'Accessory1', 'Accessory2'].includes(slot)) genericSlotTypes.push('Accessory');
    if (['WeaponLeft', 'WeaponRight'].includes(slot)) genericSlotTypes.push('Weapon');
    if (slot === 'Back') {
      genericSlotTypes.push('Armor', 'Accessory');
    }

    return player.items.filter(item =>
      item.itemType === 'Equipment' &&
      genericSlotTypes.includes((item as Equipment).slot) &&
      !Object.values(player.equippedItems).includes(item.id)
    ) as Equipment[];
  }, [player.items, player.equippedItems]);

  const handleEquipmentSlotClick = (slot: DetailedEquipmentSlot) => {
    const currentlyEquipped = player.equippedItems[slot];
    if (currentlyEquipped) {
      onUnequipItem(slot);
    } else {
      const compatibleItems = getCompatibleItemsForSlot(slot);
      if (compatibleItems.length === 1) {
        onEquipItem(compatibleItems[0].id, slot);
      } else if (compatibleItems.length > 1) {
        setItemSelectionModalState({ isOpen: true, slot });
      } else {
        // No compatible items to equip
      }
    }
  };

  const handleItemSelectForSlot = (itemId: string, slot: DetailedEquipmentSlot | null) => {
    if (slot) {
      onEquipItem(itemId, slot);
    }
    setItemSelectionModalState({ isOpen: false, slot: null });
  };

  // Inventory handler functions (getInventoryGridItems, handleInventoryGridSlotClick, etc.) moved to InventoryTab.tsx

  const renderEncyclopediaContent = () => {
    let filteredEntries: any[] = [];
    let entryType = "";

    switch (encyclopediaSubTab) {
        case 'monsters':
            entryType = "Monster";
            filteredEntries = Object.values(player.bestiary).filter(m =>
                !encyclopediaSearchTerm || m.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'items':
            entryType = "Item";
            const allDisplayableItems: (MasterItemDefinition | GameItem)[] = [
                ...Object.values(MASTER_ITEM_DEFINITIONS),
                ...player.items
            ];
            // Remove duplicates by ID, preferring unique player items if IDs clash (though master IDs should be distinct)
            const uniqueDisplayableItems = Array.from(new Map(allDisplayableItems.map(item => [item.id, item])).values());

            filteredEntries = uniqueDisplayableItems.filter(i =>
                !encyclopediaSearchTerm || i.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'spells':
            entryType = "Spell";
            filteredEntries = player.spells.filter(s =>
                !encyclopediaSearchTerm || s.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'components':
            entryType = "Component";
            filteredEntries = player.discoveredComponents.filter(c =>
                !encyclopediaSearchTerm || c.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
    }

    const renderEntryDetail = (entry: any) => {
        if (!entry) return <p className="text-slate-400 italic text-center">Select an entry to view details.</p>;
        // This is a basic detail view, can be expanded significantly
        return (
            <div className="p-3 bg-slate-800/70 rounded-md border border-slate-700">
                <div className="flex items-center mb-2">
                    <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className={`w-8 h-8 mr-3 ${getRarityColorClass(entry.rarity || 0)}`} />
                    <h4 className={`text-lg font-bold ${getRarityColorClass(entry.rarity || 0)}`}>{entry.name}</h4>
                </div>
                <p className="text-xs text-slate-300 mb-1 italic">{entry.description}</p>
                {entry.itemType && <p className="text-xs text-slate-400">Type: {entry.itemType}</p>}
                {entry.category && <p className="text-xs text-slate-400">Category: {entry.category} (Tier {entry.tier})</p>}
                {entry.manaCost !== undefined && <p className="text-xs text-slate-400">Mana Cost: {entry.manaCost}</p>}
                {entry.damage !== undefined && <p className="text-xs text-slate-400">Damage: {entry.damage} ({entry.damageType})</p>}
                {entry.level !== undefined && entryType === "Monster" && <p className="text-xs text-slate-400">Level: {entry.level}</p>}
                {entry.weakness && <p className="text-xs text-yellow-400">Weakness: {entry.weakness}</p>}
                {entry.resistance && <p className="text-xs text-sky-400">Resistance: {entry.resistance}</p>}
                {entry.vanquishedCount !== undefined && <p className="text-xs text-slate-400">Vanquished: {entry.vanquishedCount}</p>}
            </div>
        );
    };


    return (
        <div className="h-full flex flex-col">
            <div className="flex space-x-1 mb-2 p-1 bg-slate-800/50 rounded-md">
                {(['monsters', 'items', 'spells', 'components'] as EncyclopediaSubTabType[]).map(tab => (
                    <ActionButton key={tab} onClick={() => {setEncyclopediaSubTab(tab); setSelectedEncyclopediaEntry(null);}} variant={encyclopediaSubTab === tab ? 'primary' : 'secondary'} size="sm" className="flex-1 !py-1 text-xs">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </ActionButton>
                ))}
            </div>
            <input
                type="text"
                placeholder={`Search ${encyclopediaSubTab}...`}
                value={encyclopediaSearchTerm}
                onChange={e => setEncyclopediaSearchTerm(e.target.value)}
                className="w-full p-2 mb-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow overflow-hidden">
                <div className="overflow-y-auto styled-scrollbar space-y-1 pr-1 bg-slate-700/40 p-1.5 rounded-md h-[calc(70vh-180px)] md:h-auto">
                    {filteredEntries.length === 0 ? (
                        <p className="text-slate-400 italic text-center p-3">No {entryType.toLowerCase()} entries found matching criteria.</p>
                    ) : (
                        filteredEntries.map(entry => (
                            <button key={entry.id} onClick={() => setSelectedEncyclopediaEntry(entry)}
                                    className={`w-full text-left p-1.5 rounded-md flex items-center transition-colors
                                                ${selectedEncyclopediaEntry?.id === entry.id ? 'bg-sky-700 text-white' : 'bg-slate-600/70 hover:bg-slate-500/70 text-slate-200'}`}>
                                <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className="w-4 h-4 mr-2 flex-shrink-0"/>
                                <span className="text-xs truncate">{entry.name}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="overflow-y-auto styled-scrollbar p-1 h-[calc(70vh-180px)] md:h-auto">
                    {selectedEncyclopediaEntry ? renderEntryDetail(selectedEncyclopediaEntry) :
                        <div className="flex items-center justify-center h-full text-slate-500 italic">Select an entry to view details.</div>
                    }
                </div>
            </div>
        </div>
    );
  };


  const TABS: { id: CharacterSheetTab; label: string; icon: React.ReactNode }[] = [
    { id: 'Main', label: 'Main', icon: <UserIcon /> },
    { id: 'Inventory', label: 'Inventory', icon: <BagIcon /> },
    { id: 'Spells', label: 'Spells', icon: <WandIcon /> },
    { id: 'Abilities', label: 'Abilities', icon: <StarIcon /> },
    { id: 'Traits', label: 'Traits', icon: <StarIcon className="text-yellow-400"/> },
    { id: 'Quests', label: 'Quests', icon: <BookIcon /> },
    { id: 'Encyclopedia', label: 'Encyclopedia', icon: <CollectionIcon /> },
  ];


  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Character Sheet" size="5xl">
      <div className="flex flex-col min-h-[75vh]">
        <div className="flex border-b-2 border-slate-600/80 mb-1.5 xs:mb-2 sm:mb-3 flex-wrap">
          {TABS.map(tab => (
            <SheetTabButton key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        <div className="flex-grow overflow-y-auto styled-scrollbar p-1">
          {activeTab === 'Main' && (
            <MainTab
              player={player}
              effectiveStats={effectiveStats}
              treeData={treeData} // Pass talent tree data
              currentTreeCategory={currentTreeCategory}
              setCurrentTreeCategory={setCurrentTreeCategory}
              selectedTalentDetails={selectedTalentDetails}
              updateTalentDetailsPanel={updateTalentDetailsPanel}
              setCreateTalentModalOpen={setCreateTalentModalOpen}
              setResearchUnlocksModalOpen={setResearchUnlocksModalOpen}
              // Summaries - these need to be generated based on player data
              preparedSpellsSummary={player.preparedSpellIds.map(id => player.spells.find(s => s.id === id)).filter(Boolean).map(s => ({ name: s!.name, icon: s!.iconName, colorClass: getRarityColorClass(s!.rarity) }))}
              preparedAbilitiesSummary={player.preparedAbilityIds.map(id => player.abilities.find(a => a.id === id)).filter(Boolean).map(a => ({ name: a!.name, icon: a!.iconName, colorClass: getRarityColorClass(a!.rarity) }))}
              activeEffectsSummary={player.activeStatusEffects.map(e => ({ name: e.name, icon: STATUS_EFFECT_ICONS[e.name] || 'Default', colorClass: 'text-purple-300' /* Or derive color based on effect type */ }))}
              onManageSpells={() => setActiveTab('Spells')}
              onManageAbilities={() => setActiveTab('Abilities')}
              onManageEffects={() => {/* Potentially a new tab or sub-view for effects */}}
            />
          )}
          {activeTab === 'Inventory' && (
            <InventoryTab
              player={player}
              onEquipItem={onEquipItem}
              onUseConsumableFromInventory={onUseConsumableFromInventory}
              onOpenLootChest={onOpenLootChest}
              // MASTER_ITEM_DEFINITIONS and GENERIC_TO_DETAILED_SLOT_MAP are constants,
              // InventoryTab can import them directly if not already.
              // Forcing pass-through for now if InventoryTab expects them as props.
              // masterItemDefinitions={MASTER_ITEM_DEFINITIONS}
            />
          )}
          {activeTab === 'Spells' && (
            <SpellsTab
              player={player}
              maxRegisteredSpells={maxRegisteredSpells}
              maxPreparedSpells={maxPreparedSpells}
              onEditSpell={onEditSpell}
              onPrepareSpell={onPrepareSpell}
              onUnprepareSpell={onUnprepareSpell}
              onOpenSpellCraftingScreen={onOpenSpellCraftingScreen}
            />
          )}
          {activeTab === 'Abilities' && (
            <AbilitiesTab
              player={player}
              maxPreparedAbilities={maxPreparedAbilities}
              onPrepareAbility={onPrepareAbility}
              onUnprepareAbility={onUnprepareAbility}
              // onOpenAbilityCraftingScreen={onOpenAbilityCraftingScreen} // If exists
            />
          )}
          {activeTab === 'Traits' && (
            <TraitsTab
              player={player}
              canCraftNewTrait={canCraftNewTrait}
              onOpenTraitCraftingScreen={onOpenTraitCraftingScreen}
            />
          )}
          {activeTab === 'Quests' && (
            <QuestsTab player={player} />
          )}
          {activeTab === 'Encyclopedia' && (
            <EncyclopediaTab player={player} />
          )}
        </div>
      </div>

      {/* Render Modals: Item Selection, Create Talent, Research Unlocks, Context Menu */}
      {itemSelectionModalState.isOpen && itemSelectionModalState.slot && (
        <ItemSelectionSubModal
          isOpen={true}
          onClose={() => setItemSelectionModalState({isOpen: false, slot: null})}
          targetSlot={itemSelectionModalState.slot}
          compatibleItems={getCompatibleItemsForSlot(itemSelectionModalState.slot)}
          onSelectItem={handleItemSelectForSlot}
        />
      )}

      <CreateTalentModal
        isOpen={createTalentModalOpen}
        onClose={() => setCreateTalentModalOpen(false)}
        currentTreeCategory={currentTreeCategory}
        treeData={treeData}
        // TODO: Pass actual onCreateTalent prop
      />

      <ResearchUnlocksModal
        isOpen={researchUnlocksModalOpen}
        onClose={() => setResearchUnlocksModalOpen(false)}
        // TODO: Pass actual research data and unlock handlers
      />

      {/* ContextMenu is now rendered within InventoryTab.tsx */}
    </Modal>
  );
};

// ItemContextMenu and its props are moved to InventoryTab.tsx
