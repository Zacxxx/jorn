import React from 'react';
import { DetailedEquipmentSlot, Equipment } from '../../../types'; // Corrected path
import Modal from '../../../ui/Modal'; // Corrected path for global UI
import ActionButton from '../../../ui/ActionButton'; // Corrected path for global UI
import { ItemCard } from './ItemCard'; // Path is correct

interface ItemSelectionSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: DetailedEquipmentSlot;
  compatibleItems: Equipment[];
  onSelectItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
}

const ItemSelectionSubModal: React.FC<ItemSelectionSubModalProps> = ({ isOpen, onClose, targetSlot, compatibleItems, onSelectItem }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={true} onClose={onClose} title={`Select for ${targetSlot.replace(/([A-Z0-9])/g, ' $1').trim()}`} size="lg">
      {compatibleItems.length === 0 ? (
        <p className="text-slate-400 italic text-center py-4 text-xs sm:text-sm">No compatible items.</p>
      ) : (
        <div className="space-y-1.5 xs:space-y-2 max-h-60 overflow-y-auto styled-scrollbar p-1">
          {compatibleItems.map(item => (
            <div key={item.id} onClick={() => onSelectItem(item.id, targetSlot)} className="cursor-pointer">
              <ItemCard
                item={item}
                isCompact={true}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 xs:mt-4 text-right">
        <ActionButton onClick={onClose} variant="secondary">Close</ActionButton>
      </div>
    </Modal>
  );
};

export default ItemSelectionSubModal;
