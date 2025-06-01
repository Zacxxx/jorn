
import React from 'react';
import Modal from '../../ui/Modal';
import ActionButton from '../../ui/ActionButton';
import { BookIcon, GearIcon, StarIcon, BagIcon, CollectionIcon, Bars3Icon as OptionsIcon, ScrollIcon } from './IconComponents'; // Added ScrollIcon

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpellbook: () => void;
  onOpenCraftingHub: () => void;
  onOpenInventory: () => void;
  onOpenTraitsPage: () => void;
  onOpenQuestsPage: () => void;
  onOpenEncyclopedia: () => void;
  onOpenGameOptions: () => void; // Renamed from onOpenGameMenu for clarity
}

const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenSpellbook,
  onOpenCraftingHub,
  onOpenInventory,
  onOpenTraitsPage,
  onOpenQuestsPage,
  onOpenEncyclopedia,
  onOpenGameOptions,
}) => {

  const menuItems = [
    // Reordered and updated Quests icon
    { label: "Inventory", handler: onOpenInventory, icon: <BagIcon className="w-5 h-5" />, variant: 'secondary' as const },
    { label: "Spells", handler: onOpenSpellbook, icon: <BookIcon className="w-5 h-5" />, variant: 'primary' as const },
    { label: "Traits", handler: onOpenTraitsPage, icon: <StarIcon className="w-5 h-5" />, variant: 'success' as const },
    { label: "Quests", handler: onOpenQuestsPage, icon: <ScrollIcon className="w-5 h-5" />, variant: 'warning' as const }, // Changed icon
    { label: "Crafting", handler: onOpenCraftingHub, icon: <GearIcon className="w-5 h-5" />, variant: 'info' as const },
    { label: "Encyclopedia", handler: onOpenEncyclopedia, icon: <CollectionIcon className="w-5 h-5" />, variant: 'secondary' as const },
    { label: "Options", handler: onOpenGameOptions, icon: <OptionsIcon className="w-5 h-5" />, variant: 'secondary' as const },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Menu" size="md">
      <div className="space-y-3">
        {menuItems.map(item => (
          <ActionButton
            key={item.label}
            onClick={() => { item.handler(); onClose(); }} // Close modal after action
            variant={item.variant}
            icon={item.icon}
            className="w-full justify-start text-base py-3"
          >
            {item.label}
          </ActionButton>
        ))}
      </div>
      <div className="mt-6 text-right">
        <ActionButton onClick={onClose} variant="danger" size="md">
          Close Menu
        </ActionButton>
      </div>
    </Modal>
  );
};

export default MobileMenuModal;
