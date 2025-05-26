import React from 'react';
import ActionButton from '../battle-ui/layout/ActionButton';
import { BookIcon, GearIcon, StarIcon, BagIcon, Bars3Icon, CollectionIcon } from '../books/IconComponents';

interface FooterProps {
  onOpenSpellbook: () => void;
  onOpenCraftingHub: () => void;
  onOpenInventory: () => void;
  onOpenTraitsPage: () => void;
  onOpenQuestsPage: () => void;
  onOpenEncyclopedia: () => void;
  onOpenGameMenu: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
    onOpenSpellbook,
    onOpenCraftingHub,
    onOpenInventory,
    onOpenTraitsPage,
    onOpenQuestsPage,
    onOpenEncyclopedia,
    onOpenGameMenu
}) => {
  return (
    <footer className="bg-slate-900/80 border-t-2 border-slate-700/60 backdrop-blur-sm shadow-inner sticky bottom-0 z-[999] safe-area-inset-bottom">
      <div className="container mx-auto px-2 py-1.5 sm:px-3 sm:py-2.5 max-w-6xl">
        {/* Mobile Grid Layout */}
        <div className="sm:hidden grid grid-cols-4 gap-1.5 mb-1.5">
          <ActionButton 
            onClick={onOpenSpellbook} 
            variant="primary" 
            size="sm"
            icon={<BookIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-sky-500/30 hover:shadow-sky-500/50 text-[11px] h-9 min-h-[44px]"
            title="Open Spellbook"
          >
            Spells
          </ActionButton>
          <ActionButton 
            onClick={onOpenInventory} 
            variant="secondary" 
            size="sm"
            icon={<BagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-slate-500/30 hover:shadow-slate-500/50 text-[11px] h-9 min-h-[44px]"
            title="Open Inventory"
          >
            Items
          </ActionButton>
          <ActionButton 
            onClick={onOpenCraftingHub} 
            variant="info" 
            size="sm"
            icon={<GearIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-teal-500/30 hover:shadow-teal-500/50 text-[11px] h-9 min-h-[44px]"
            title="Open Crafting Hub"
          >
            Craft
          </ActionButton>
          <ActionButton 
            onClick={onOpenTraitsPage} 
            variant="success" 
            size="sm"
            icon={<StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-green-500/30 hover:shadow-green-500/50 text-[11px] h-9 min-h-[44px]"
            title="View/Define Traits"
          >
            Traits
          </ActionButton>
          <ActionButton 
            onClick={onOpenQuestsPage} 
            variant="warning" 
            size="sm"
            icon={<BookIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-yellow-500/30 hover:shadow-yellow-500/50 text-[11px] h-9 min-h-[44px]"
            title="View Quest Log"
          >
            Quests
          </ActionButton>
          <ActionButton 
            onClick={onOpenEncyclopedia} 
            variant="secondary" 
            size="sm"
            icon={<CollectionIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} 
            className="shadow-slate-500/30 hover:shadow-slate-500/50 text-[11px] h-9 min-h-[44px]"
            title="Open Encyclopedia"
          >
            Wiki
          </ActionButton>
          <ActionButton 
            onClick={onOpenGameMenu} 
            variant="secondary" 
            size="sm"
            icon={<Bars3Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
            className="shadow-slate-500/30 hover:shadow-slate-500/50 text-[11px] h-9 min-h-[44px]"
            title="Open Game Menu"
          >
            Menu
          </ActionButton>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xs text-slate-400 text-center sm:text-left mb-2 sm:mb-0">
            <p>&copy; {new Date().getFullYear()} Jorn. Gemini API.</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            <ActionButton 
              onClick={onOpenCraftingHub} 
              variant="info" 
              size="sm"
              icon={<GearIcon className="w-4 h-4"/>}
              className="shadow-teal-500/30 hover:shadow-teal-500/50 min-h-[44px]"
              title="Open Crafting Hub"
            >
              Crafting
            </ActionButton>
            <ActionButton 
              onClick={onOpenInventory} 
              variant="secondary" 
              size="sm"
              icon={<BagIcon className="w-4 h-4"/>}
              className="shadow-slate-500/30 hover:shadow-slate-500/50 min-h-[44px]"
              title="Open Inventory"
            >
              Inventory
            </ActionButton>
            <ActionButton 
              onClick={onOpenSpellbook} 
              variant="primary" 
              size="sm"
              icon={<BookIcon className="w-4 h-4"/>}
              className="shadow-sky-500/30 hover:shadow-sky-500/50 min-h-[44px]"
              title="Open Spellbook"
            >
              Spells
            </ActionButton>
            <ActionButton 
              onClick={onOpenTraitsPage} 
              variant="success" 
              size="sm"
              icon={<StarIcon className="w-4 h-4"/>}
              className="shadow-green-500/30 hover:shadow-green-500/50 min-h-[44px]"
              title="View/Define Traits"
            >
              Traits
            </ActionButton>
            <ActionButton 
              onClick={onOpenQuestsPage} 
              variant="warning" 
              size="sm"
              icon={<BookIcon className="w-4 h-4"/>}
              className="shadow-yellow-500/30 hover:shadow-yellow-500/50 min-h-[44px]"
              title="View Quest Log"
            >
              Quests
            </ActionButton>
            <ActionButton 
              onClick={onOpenEncyclopedia} 
              variant="secondary" 
              size="sm"
              icon={<CollectionIcon className="w-4 h-4"/>} 
              className="shadow-slate-500/30 hover:shadow-slate-500/50 min-h-[44px]"
              title="Open Encyclopedia"
            >
              Encyclopedia
            </ActionButton>
            <ActionButton 
              onClick={onOpenGameMenu} 
              variant="secondary" 
              size="sm"
              icon={<Bars3Icon className="w-4 h-4"/>}
              className="shadow-slate-500/30 hover:shadow-slate-500/50 min-h-[44px]"
              title="Open Game Menu"
            >
              Menu
            </ActionButton>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;