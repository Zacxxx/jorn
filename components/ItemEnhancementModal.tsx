import React, { useState, useEffect } from 'react';
import { Equipment, ResourceCost, Player } from '../../types';
import { getEnhancementDetails } from './items/enhancement_rules';
import { hasEnoughResources } from './items/item_utils';
import Modal from './Modal';
import ActionButton from './ActionButton';
import ItemDisplay from './ItemDisplay'; // Assuming you have or will create a component to display item details
import { RESOURCE_ICONS } from '../constants'; // For displaying resource icons

interface ItemEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEnhance: Equipment | null;
  playerInventory: Record<string, number>; // Using string for ResourceType keys from inventory
  onAttemptEnhance: (item: Equipment) => void; // Callback when enhance is clicked
  isLoading: boolean; // To disable button during enhancement process
}

const ItemEnhancementModal: React.FC<ItemEnhancementModalProps> = ({
  isOpen,
  onClose,
  itemToEnhance,
  playerInventory,
  onAttemptEnhance,
  isLoading,
}) => {
  const [enhancementDetails, setEnhancementDetails] = useState<ReturnType<typeof getEnhancementDetails> | null>(null);
  const [canAfford, setCanAfford] = useState<boolean>(false);

  useEffect(() => {
    if (itemToEnhance) {
      const details = getEnhancementDetails(itemToEnhance.enhancementLevel || 0);
      setEnhancementDetails(details);
      setCanAfford(hasEnoughResources(playerInventory as Record<ResourceType, number>, details.cost));
    } else {
      setEnhancementDetails(null);
      setCanAfford(false);
    }
  }, [itemToEnhance, playerInventory]);

  if (!isOpen || !itemToEnhance) return null;

  const handleEnhanceClick = () => {
    if (itemToEnhance && canAfford) {
      onAttemptEnhance(itemToEnhance);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enhance ${itemToEnhance.name}${itemToEnhance.enhancementLevel ? ` +${itemToEnhance.enhancementLevel}` : ''}`} size="lg">
      <div className="p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">
          <div>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Item to Enhance:</h3>
            {/* You'll need an ItemDisplay component or similar here */}
            {/* For now, just basic info */}
            <div className="bg-slate-700/50 p-3 rounded-md">
                 <ItemDisplay item={itemToEnhance} showEquipButton={false} showUnequipButton={false} showDropButton={false} showExamineButton={false}/>
                 {itemToEnhance.enhancementLevel && itemToEnhance.enhancementLevel > 0 && 
                    <p className="text-sm text-yellow-400 mt-1">Current Enhancement: +{itemToEnhance.enhancementLevel}</p>
                 }
            </div>
          </div>
          <div>
            {enhancementDetails && (
              <>
                <h3 className="text-lg font-semibold text-sky-300 mb-2">
                  Enhance to +{enhancementDetails.level} (Success: {(enhancementDetails.successChance * 100).toFixed(0)}%)
                </h3>
                <div className="bg-slate-700/50 p-3 rounded-md">
                  <h4 className="text-md font-medium text-slate-300 mb-2">Required Resources:</h4>
                  {details.cost.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {details.cost.map((res, idx) => (
                        <li key={idx} className={`flex items-center justify-between ${(playerInventory[res.type] || 0) < res.quantity ? 'text-red-400' : 'text-slate-300'}`}>
                          <span className='flex items-center'>
                            {/* Add resource icon here if available */}
                            {/* <GetSpellIcon iconName={RESOURCE_ICONS[res.type]} className="w-4 h-4 mr-1.5" /> */}
                            {res.type}
                          </span>
                          <span>{playerInventory[res.type] || 0} / {res.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-sm text-slate-400">No resources required for this level (unlikely).</p>
                  )}
                  {!canAfford && <p className="text-xs text-red-400 mt-2">You do not have enough resources.</p>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <ActionButton onClick={onClose} variant="secondary">
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleEnhanceClick}
            variant="primary"
            disabled={!canAfford || isLoading || !enhancementDetails}
            isLoading={isLoading}
          >
            {isLoading ? 'Enhancing...' : `Attempt Enhance (+${enhancementDetails?.level})`}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

export default ItemEnhancementModal; 