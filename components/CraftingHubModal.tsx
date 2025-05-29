import React, { useState } from 'react';
import { ItemType } from '../types';
import Modal from './Modal';
import ItemCraftingForm from './ItemCraftingForm';
import ActionButton from './ActionButton';
import { PotionGenericIcon, GearIcon, WandIcon, FlaskIcon } from './IconComponents';

interface CraftingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateAppItemCraft: (prompt: string, itemType: ItemType) => Promise<void>;
  isLoading: boolean;
  onOpenSpellDesignStudio: () => void; 
  onOpenTheorizeLab: () => void;     
}

type CraftingHubMainView = 'Items' | 'Spells'; 

export const CraftingHubModal: React.FC<CraftingHubModalProps> = ({ 
    isOpen, 
    onClose, 
    onInitiateAppItemCraft, 
    isLoading,
    onOpenSpellDesignStudio,
    onOpenTheorizeLab 
}) => {
  const [activeMainView, setActiveMainView] = useState<CraftingHubMainView>('Spells');
  const [activeItemCraftType, setActiveItemCraftType] = useState<ItemType>('Consumable');

  const handleItemCraftSubmit = async (prompt: string) => {
    await onInitiateAppItemCraft(prompt, activeItemCraftType);
  };
  
  const MainViewButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = 
  ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center p-3.5 md:p-4 rounded-t-lg transition-all duration-150 border-b-4
                    ${isActive 
                        ? 'bg-slate-700/90 text-sky-300 border-sky-500 shadow-inner' 
                        : 'bg-slate-800/80 hover:bg-slate-700/70 text-slate-400 hover:text-sky-400 border-transparent hover:border-sky-600/50'}`}
        aria-pressed={isActive}
        style={{fontFamily: "'Inter Tight', sans-serif"}}
    >
        <div className="w-5 h-5 md:w-6 md:h-6 mr-2">{icon}</div>
        <span className="text-sm sm:text-base font-semibold tracking-tight uppercase">{label}</span>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grand Crafting Emporium" size="3xl">
      <div className="flex border-b-2 border-slate-600/80 bg-slate-800/70 rounded-t-lg shadow-md">
        <MainViewButton
          icon={<WandIcon />}
          label="Spellcraft"
          isActive={activeMainView === 'Spells'}
          onClick={() => setActiveMainView('Spells')}
        />
        <MainViewButton
          icon={<GearIcon />} 
          label="Item Crafting"
          isActive={activeMainView === 'Items'}
          onClick={() => setActiveMainView('Items')}
        />
      </div>
      <div className="p-4 md:p-6">
        {activeMainView === 'Spells' && (
          <div className="space-y-4 text-center">
            <p className="text-slate-300">Design powerful spells or research new components.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ActionButton onClick={onOpenSpellDesignStudio} variant="primary" size="lg" icon={<WandIcon className="w-5 h-5"/>}>
                    Go to Spell Design Studio
                </ActionButton>
                <ActionButton onClick={onOpenTheorizeLab} variant="info" size="lg" icon={<FlaskIcon className="w-5 h-5"/>}>
                    Theorize New Components
                </ActionButton>
            </div>
          </div>
        )}
        {activeMainView === 'Items' && (
          <div>
            <div className="flex justify-center gap-3 mb-4">
              <ActionButton
                onClick={() => setActiveItemCraftType('Consumable')}
                variant={activeItemCraftType === 'Consumable' ? 'primary' : 'secondary'}
                icon={<PotionGenericIcon className="w-5 h-5"/>}
              >
                Consumables
              </ActionButton>
              <ActionButton
                onClick={() => setActiveItemCraftType('Equipment')}
                variant={activeItemCraftType === 'Equipment' ? 'primary' : 'secondary'}
                icon={<GearIcon className="w-5 h-5"/>}
              >
                Equipment
              </ActionButton>
            </div>
            <ItemCraftingForm
              itemType={activeItemCraftType}
              onInitiateCraft={handleItemCraftSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CraftingHubModal;
