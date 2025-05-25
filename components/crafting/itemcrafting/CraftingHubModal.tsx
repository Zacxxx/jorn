import React, { useState, useEffect } from 'react';
import { ItemType, Equipment, GameItem, ResourceType, Player } from '../../../types'; // Added GameItem, Player
import Modal from '../../ui/Modal';
import ItemCraftingForm from './ItemCraftingForm';
import ActionButton from '../../battle-ui/layout/ActionButton';
import { PotionGenericIcon, GearIcon, ScrollIcon, StarIcon } from '../../books/IconComponents'; // Added StarIcon for enhancement
import ItemEnhancementModal from '../../crafting/itemcrafting/ItemEnhancementModal'; // Import the new modal
import ItemDisplay from '../../characterwindow/inventory/ItemDisplay'; // For showing items in enhance tab

interface CraftingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateAppItemCraft: (prompt: string, itemType: ItemType, quantity: number) => Promise<void>; 
  isLoading: boolean;
  playerItems: GameItem[]; // Added to list items for enhancement
  playerInventory: Player['inventory']; // Added for enhancement modal
  onAttemptEnhanceItem: (itemToEnhance: Equipment) => void; // Callback for enhancement attempt
  isEnhancing: boolean; // Loading state for enhancement
}

// UPDATED CraftingTab type
type CraftingTab = 'Consumables' | 'Equipment' | 'Enhance';

interface LastCraftedItem {
    prompt: string;
    itemType: ItemType;
    quantity: number;
}

const CraftingHubModal: React.FC<CraftingHubModalProps> = ({ 
    isOpen, 
    onClose, 
    onInitiateAppItemCraft, 
    isLoading, 
    playerItems, 
    playerInventory,
    onAttemptEnhanceItem,
    isEnhancing
}) => {
  const [activeCraftingTab, setActiveCraftingTab] = useState<CraftingTab>('Consumables');
  const [lastCraftedItemDetails, setLastCraftedItemDetails] = useState<LastCraftedItem | null>(null);
  const [showRecraftInForm, setShowRecraftInForm] = useState<boolean>(false);
  const [itemToEnhance, setItemToEnhance] = useState<Equipment | null>(null);
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState<boolean>(false);

  // Reset itemToEnhance when tab changes away from Enhance or modal closes
  useEffect(() => {
    if (activeCraftingTab !== 'Enhance') {
      setItemToEnhance(null);
    }
    if (!isOpen) {
        setIsEnhancementModalOpen(false);
        setItemToEnhance(null);
    }
  }, [activeCraftingTab, isOpen]);

  const handleFormSubmit = async (prompt: string, quantity: number) => {
    const itemTypeToCraft = activeCraftingTab === 'Consumables' ? 'Consumable' : 'Equipment'; // UPDATED
    await onInitiateAppItemCraft(prompt, itemTypeToCraft, quantity);
    setLastCraftedItemDetails({ prompt, itemType: itemTypeToCraft, quantity });
    setShowRecraftInForm(false);
  };

  const handleRecraftClick = () => {
    if (lastCraftedItemDetails) {
        const targetTab = lastCraftedItemDetails.itemType === 'Consumable' ? 'Consumables' : 'Equipment';
        setActiveCraftingTab(targetTab);
        setShowRecraftInForm(true);
    }
  };

  const clearLastCraftedForForm = () => {
    setShowRecraftInForm(false);
  }
  
  const handleOpenEnhanceModal = (item: Equipment) => {
    setItemToEnhance(item);
    setIsEnhancementModalOpen(true);
  };

  const handleCloseEnhanceModal = () => {
    setIsEnhancementModalOpen(false);
    // setItemToEnhance(null); // Keep item selected in case user reopens quickly, useEffect handles reset on tab change
  };

  const handleActualEnhanceAttempt = (item: Equipment) => {
    onAttemptEnhanceItem(item);
    // Optionally close modal immediately or wait for isEnhancing to finish
    // For now, let it stay open to show loading, App.tsx can close it via isOpen prop of CraftingHub if needed post-attempt
  };

  const TabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center p-3 md:p-3.5 rounded-t-lg transition-all duration-150 border-b-4
                    ${isActive 
                        ? 'bg-slate-700/90 text-sky-300 border-sky-500 shadow-inner' 
                        : 'bg-slate-850/80 hover:bg-slate-700/70 text-slate-400 hover:text-sky-400 border-transparent hover:border-sky-600/50'}`}
        aria-pressed={isActive}
        style={{fontFamily: "'Inter Tight', sans-serif"}}
    >
        <div className="w-5 h-5 md:w-5 md:h-5 mr-2">{icon}</div>
        <span className="text-sm font-semibold tracking-tight uppercase">{label}</span>
    </button>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crafting Hub" size="2xl">
      <div className="flex border-b-2 border-slate-700/90 bg-slate-850/60 rounded-t-lg shadow-md">
        <TabButton
          icon={<ScrollIcon className="w-5 h-5" />} // Changed to ScrollIcon for broader consumables
          label="Craft Consumable" // UPDATED
          isActive={activeCraftingTab === 'Consumables'} // UPDATED
          onClick={() => setActiveCraftingTab('Consumables')} // UPDATED
        />
        <TabButton
          icon={<GearIcon className="w-5 h-5" />}
          label="Craft Equipment"
          isActive={activeCraftingTab === 'Equipment'}
          onClick={() => setActiveCraftingTab('Equipment')}
        />
        <TabButton
          icon={<StarIcon className="w-5 h-5" />} // Using StarIcon for Enhance
          label="Enhance Item"
          isActive={activeCraftingTab === 'Enhance'}
          onClick={() => setActiveCraftingTab('Enhance')}
        />
      </div>
      <div className="bg-slate-700/50 p-3 md:p-4 rounded-b-lg shadow-inner min-h-[200px]">
        {activeCraftingTab === 'Consumables' && ( // UPDATED
          <ItemCraftingForm
            itemType="Consumable" // UPDATED
            onInitiateCraft={handleFormSubmit}
            isLoading={isLoading}
            lastCraftedPrompt={showRecraftInForm && lastCraftedItemDetails?.itemType === 'Consumable' ? lastCraftedItemDetails.prompt : undefined}
            lastCraftedQuantity={showRecraftInForm && lastCraftedItemDetails?.itemType === 'Consumable' ? lastCraftedItemDetails.quantity : undefined}
            onClearLastCrafted={clearLastCraftedForForm}
          />
        )}
        {activeCraftingTab === 'Equipment' && (
          <ItemCraftingForm
            itemType="Equipment"
            onInitiateCraft={handleFormSubmit}
            isLoading={isLoading}
            lastCraftedPrompt={showRecraftInForm && lastCraftedItemDetails?.itemType === 'Equipment' ? lastCraftedItemDetails.prompt : undefined}
            lastCraftedQuantity={showRecraftInForm && lastCraftedItemDetails?.itemType === 'Equipment' ? lastCraftedItemDetails.quantity : undefined}
            onClearLastCrafted={clearLastCraftedForForm}
          />
        )}
        {activeCraftingTab === 'Enhance' && (
            <div>
                <h3 className="text-xl font-semibold text-sky-300 mb-3">Select Equipment to Enhance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-2 bg-slate-800/30 rounded">
                    {Array.isArray(playerItems) && playerItems.filter(item => item.itemType === 'Equipment').length > 0 ? (
                        playerItems.filter(item => item.itemType === 'Equipment').map(item => item as Equipment).map(equip => (
                            <div key={equip.id} className="bg-slate-700 p-2 rounded-md hover:bg-slate-600/70 cursor-pointer transition-all duration-150"
                                onClick={() => handleOpenEnhanceModal(equip)} >
                                <ItemDisplay item={equip} compact={true} showEquipButton={false} showDropButton={false} showUnequipButton={false} showExamineButton={false} />
                                {equip.enhancementLevel && equip.enhancementLevel > 0 && 
                                    <p className="text-xs text-yellow-400 mt-1 text-center">+{equip.enhancementLevel}</p> }
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 col-span-full text-center py-4">You have no equippable items to enhance, or item data is unavailable.</p>
                    )}
                </div>
            </div>
        )}
      </div>
       <div className="mt-5 pt-4 border-t-2 border-slate-700/80 flex justify-between items-center">
            {lastCraftedItemDetails && (
                <ActionButton 
                    onClick={handleRecraftClick}
                    variant="outline"
                    size="md"
                    className="transition-all duration-150 hover:bg-sky-700 hover:text-white"
                    disabled={isLoading}
                >
                    Recraft: {lastCraftedItemDetails.prompt.substring(0,20)}... (x{lastCraftedItemDetails.quantity})
                </ActionButton>
            )}
            {!lastCraftedItemDetails && <div />}
          <ActionButton onClick={onClose} variant="secondary" size="md">
            Close Crafting
          </ActionButton>
        </div>
        {itemToEnhance && (
            <ItemEnhancementModal 
                isOpen={isEnhancementModalOpen}
                onClose={handleCloseEnhanceModal}
                itemToEnhance={itemToEnhance}
                playerInventory={playerInventory}
                onAttemptEnhance={handleActualEnhanceAttempt}
                isLoading={isEnhancing}
            />
        )}
    </Modal>
  );
};

export default CraftingHubModal;