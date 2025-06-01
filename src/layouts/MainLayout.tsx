import React from 'react';
import Header from '../../ui/Header';
import { Player, PlayerEffectiveStats } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  player: Player;
  effectivePlayerStats?: PlayerEffectiveStats;
  gameState?: string;
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
  isInCombatButNotOnCombatScreen?: boolean;
  isInAnyCombat?: boolean;
  onReturnToCombat?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  player,
  effectivePlayerStats,
  gameState,
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
  isInCombatButNotOnCombatScreen,
  isInAnyCombat,
  onReturnToCombat,
}) => {
  // Remove background gradient on HOME screen to allow video background to show
  const shouldShowBackground = gameState !== 'HOME';
  
  return (
    <div 
      className={`min-h-screen text-slate-100 flex flex-col ${
        shouldShowBackground ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : ''
      }`} 
      style={{fontFamily: "'Inter', sans-serif"}}
    >
      <Header
        player={player}
        effectivePlayerStats={effectivePlayerStats}
        gameState={gameState}
        onOpenCharacterSheet={onOpenCharacterSheet}
        onNavigateHome={onNavigateHome}
        onOpenMobileMenu={onOpenMobileMenu}
        onOpenGameMenu={onOpenGameMenu}
        isInCombatButNotOnCombatScreen={isInCombatButNotOnCombatScreen}
        isInAnyCombat={isInAnyCombat}
        onReturnToCombat={onReturnToCombat}
      />
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 max-w-6xl">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
