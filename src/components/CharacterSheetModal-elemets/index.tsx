import React, { useState, useEffect, useCallback } from 'react';
import { Player, PlayerEffectiveStats, DetailedEquipmentSlot, GameItem, Equipment, Spell, Ability, EquipmentSlot as GenericEquipmentSlot, CharacterSheetTab, Quest } from '../../../types'; // Simplified types
import Modal from '../../../ui/Modal'; // Corrected
import '../../src/styles/ability-list.css'; // Assuming path is correct relative to src
import ActionButton from '../../../ui/ActionButton'; // Corrected
import {
    UserIcon, BagIcon, WandIcon, StarIcon, BookIcon, CollectionIcon, GearIcon // Icons used in TABS array
} from '../IconComponents';
import {
    STATUS_EFFECT_ICONS, GENERIC_TO_DETAILED_SLOT_MAP // GENERIC_TO_DETAILED_SLOT_MAP needed for getCompatibleItemsForSlot
} from '../../../constants'; // Corrected
import { getRarityColorClass } from '../../../utils'; // Corrected
import SheetTabButton from './ui/SheetTabButton';
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
import ProgressTab from './ProgressTab';

// Character Creation
import CharacterCreationModal from '../CharacterCreationModal';


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
  onUpdatePlayer?: (updater: (prev: Player) => Player) => void; // For character creation
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
  onUseConsumableFromInventory, onUpdatePlayer
}) => {
  const [activeTab, setActiveTab] = useState<CharacterSheetTab>(initialTab || 'Main');
  const [itemSelectionModalState, setItemSelectionModalState] = useState<{isOpen: boolean, slot: DetailedEquipmentSlot | null}>({isOpen: false, slot: null});
  // selectedQuestDetail state is now managed by QuestsTab.tsx
  // Inventory state (including contextMenuState) and handlers are moved to InventoryTab.tsx
  // Encyclopedia state and handlers are now managed by EncyclopediaTab.tsx

  // State for new 'Main' tab UI
  const [currentTreeCategory, setCurrentTreeCategory] = useState<string>('core');
  const [selectedTalentDetails, setSelectedTalentDetails] = useState<any | null>(null); // Replace 'any' with a proper Talent type
  const [createTalentModalOpen, setCreateTalentModalOpen] = useState<boolean>(false);
  const [researchUnlocksModalOpen, setResearchUnlocksModalOpen] = useState<boolean>(false);
  const [characterCreationModalOpen, setCharacterCreationModalOpen] = useState<boolean>(false);

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
    }
    // No other state resets needed here as they are managed by individual tabs or modals.
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

  const handleCharacterCreation = (name: string, classId: string, specializationId: string, title?: string) => {
    if (onUpdatePlayer) {
      onUpdatePlayer((prev) => ({
        ...prev,
        name,
        title,
        classId,
        specializationId,
        hasCustomizedCharacter: true
      }));
    }
    setCharacterCreationModalOpen(false);
  };

  // Inventory handler functions (getInventoryGridItems, handleInventoryGridSlotClick, etc.) moved to InventoryTab.tsx
  // renderEncyclopediaContent and its helper renderEntryDetail are now part of EncyclopediaTab.tsx


  const TABS: { id: CharacterSheetTab; label: string; icon: React.ReactNode }[] = [
    { id: 'Main', label: 'Main', icon: <UserIcon /> },
    { id: 'Progress', label: 'Progress', icon: <GearIcon /> },
    { id: 'Inventory', label: 'Inventory', icon: <BagIcon /> },
    { id: 'Spells', label: 'Spells', icon: <WandIcon /> },
    { id: 'Abilities', label: 'Abilities', icon: <StarIcon /> },
    { id: 'Traits', label: 'Traits', icon: <StarIcon className="text-yellow-400"/> },
    { id: 'Quests', label: 'Quests', icon: <BookIcon /> },
    { id: 'Encyclopedia', label: 'Encyclopedia', icon: <CollectionIcon /> },
  ];

  console.log('CharacterSheetModal - activeTab:', activeTab);
  console.log('CharacterSheetModal - TABS:', TABS.map(t => t.id));

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Character Sheet" size="5xl">
      <div className="flex flex-col">
        {/* Debug info */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2 mb-2 text-yellow-300 text-xs">
          🔧 DEBUG: Active tab: {activeTab} | Available tabs: {TABS.map(t => t.id).join(', ')}
        </div>
        
        <div className="flex border-b-2 border-slate-600/80 mb-1.5 xs:mb-2 sm:mb-3 flex-wrap gap-1 overflow-x-auto styled-scrollbar-thin-x">
          {/* Simplified tab rendering for debugging */}
          <button 
            onClick={() => setActiveTab('Main')}
            className={`p-2 rounded ${activeTab === 'Main' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            Main
          </button>
          <button 
            onClick={() => setActiveTab('Progress')}
            className={`p-2 rounded ${activeTab === 'Progress' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            Progress
          </button>
          <button 
            onClick={() => setActiveTab('Inventory')}
            className={`p-2 rounded ${activeTab === 'Inventory' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('Spells')}
            className={`p-2 rounded ${activeTab === 'Spells' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            Spells
          </button>
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
          {activeTab === 'Progress' && (
            <ProgressTab 
              player={player} 
              onOpenCharacterCreation={() => setCharacterCreationModalOpen(true)}
            />
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

      <CharacterCreationModal
        isOpen={characterCreationModalOpen}
        player={player}
        onCreateCharacter={handleCharacterCreation}
        onClose={() => setCharacterCreationModalOpen(false)}
        isRecreation={true}
      />

      {/* ContextMenu is now rendered within InventoryTab.tsx as per previous successful refactor */}
    </Modal>
  );
};

// ItemContextMenu, ItemContextMenuProps, and InventoryGridItemType (if it was here) are fully moved to InventoryTab.tsx.
// However, CharacterSheetModal still renders ItemContextMenu. This needs to be reconciled.
// For now, assuming ItemContextMenu is intended to be part of CharacterSheetModal if it's generic enough,
// or it should be fully inside InventoryTab if specific to it.
// The previous step said "ContextMenu is now rendered within InventoryTab.tsx".
// If that's true, then ItemContextMenu related code (definition and rendering call) should be removed from here.

// Let's proceed assuming ItemContextMenu IS in InventoryTab.tsx as per last successful report.
// This means the direct rendering of ItemContextMenu and its props definition should not be here.
// Also, InventoryGridItemType would not be needed here.
