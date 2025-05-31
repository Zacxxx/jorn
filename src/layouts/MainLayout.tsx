import React from 'react';
import Header from '../..//ui/Header';
import { Player } from '../../types'; // Assuming types.ts is in the root

interface MainLayoutProps {
  children: React.ReactNode;
  player: Player;
  onOpenCharacterSheet: () => void;
  onNavigateHome: () => void;
  onOpenMobileMenu?: () => void;
  onOpenSpellbook: () => void;
  onOpenCraftingHub: () => void;
  onOpenInventory: () => void;
  onOpenTraitsPage: () => void;
  onOpenQuestsPage: () => void;
  onOpenEncyclopedia: () => void;
  onOpenGameMenu: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  player,
  onOpenCharacterSheet,
  onNavigateHome,
  onOpenMobileMenu,
  onOpenSpellbook,
  onOpenCraftingHub,
  onOpenInventory,
  onOpenTraitsPage,
  onOpenQuestsPage,
  onOpenEncyclopedia,
  onOpenGameMenu,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col" style={{fontFamily: "'Inter', sans-serif"}}>
      <Header
        player={player}
        onOpenCharacterSheet={onOpenCharacterSheet}
        onNavigateHome={onNavigateHome}
        onOpenMobileMenu={onOpenMobileMenu}
        onOpenGameMenu={onOpenGameMenu}
      />
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 max-w-6xl">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
