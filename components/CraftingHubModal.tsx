import React, { useState } from 'react';
import { ItemType } from '../types';
import Modal from './Modal';
import ItemCraftingForm from './ItemCraftingForm';
import ActionButton from './ActionButton';
import { PotionGenericIcon, GearIcon, ScrollIcon } from './IconComponents'; // Added ScrollIcon as a generic consumable icon

interface CraftingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateAppItemCraft: (prompt: string, itemType: ItemType, quantity: number) => Promise<void>;
  isLoading: boolean;
}

type CraftingTab = 'Consumables' | 'Equipment'; // UPDATED

interface LastCraftedItem {
    prompt: string;
    itemType: ItemType;
    quantity: number;
}

const CraftingHubModal: React.FC<CraftingHubModalProps> = ({ isOpen, onClose, onInitiateAppItemCraft, isLoading }) => {
  const [activeCraftingTab, setActiveCraftingTab] = useState<CraftingTab>('Consumables'); // UPDATED
  const [lastCraftedItemDetails, setLastCraftedItemDetails] = useState<LastCraftedItem | null>(null);
  const [showRecraftInForm, setShowRecraftInForm] = useState<boolean>(false);

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
      </div>
      <div className="bg-slate-700/50 p-3 md:p-4 rounded-b-lg shadow-inner">
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
    </Modal>
  );
};

export default CraftingHubModal;