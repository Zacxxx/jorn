import React from 'react';
import { Player } from '../types';
import ActionButton from './ActionButton';
import { UserIcon, Bars3Icon, GoldCoinIcon, EssenceIcon, SwordsIcon } from '../src/components/IconComponents'; 

interface HeaderProps {
  player: Player;
  onOpenCharacterSheet: () => void;
  onNavigateHome: () => void;
  onOpenMobileMenu?: () => void; 
  onOpenGameMenu: () => void;
  isInCombatButNotOnCombatScreen?: boolean;
  isInAnyCombat?: boolean;
  onReturnToCombat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ player, onOpenCharacterSheet, onNavigateHome, onOpenMobileMenu, onOpenGameMenu, isInCombatButNotOnCombatScreen = false, isInAnyCombat, onReturnToCombat }) => {
  const xpPercentage = player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0;

  return (
    <header className="bg-slate-800/95 shadow-xl border-b-2 border-sky-600/60 sticky top-0 z-[1000] backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex justify-between items-center max-w-6xl">
        <div className="flex items-center space-x-3">
          <button
              onClick={onNavigateHome}
              className="header-title-responsive font-bold text-sky-300 tracking-tight hover:text-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-md px-1 -ml-1"
              style={{fontFamily: "'Inter Tight', sans-serif"}}
              title="Go to Home Screen"
          >
            Jorn
          </button>
          
          {/* Return to Combat Button - Show when in any combat */}
          {isInAnyCombat && onReturnToCombat && (
            <ActionButton
              onClick={isInCombatButNotOnCombatScreen ? onReturnToCombat : undefined}
              size="sm"
              variant={isInCombatButNotOnCombatScreen ? "danger" : "secondary"}
              icon={<SwordsIcon className="w-4 h-4 md:w-5 md:h-5" />}
              className={`!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 ${
                isInCombatButNotOnCombatScreen 
                  ? 'shadow-red-500/40 hover:shadow-red-500/60 animate-pulse border-red-400/60 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/90 hover:to-red-600/90 cursor-pointer' 
                  : 'shadow-slate-500/20 border-slate-500/40 bg-gradient-to-r from-slate-600/60 to-slate-700/60 cursor-default opacity-60'
              }`}
              title={isInCombatButNotOnCombatScreen ? "Return to Active Combat" : "Currently in Combat"}
              disabled={!isInCombatButNotOnCombatScreen}
            >
              <span className="header-action-button-text-responsive font-semibold">
                {isInCombatButNotOnCombatScreen ? "Return to Combat" : "In Combat"}
              </span>
            </ActionButton>
          )}
        </div>
        <div className="flex items-center space-x-1.5 xs:space-x-2 md:space-x-3">
          {/* Level and XP */}
          <div className="header-stat-text-responsive text-slate-300 bg-slate-700/60 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg shadow-md border border-slate-600/70">
            <div className="flex items-center">
              <span className="font-semibold text-green-400 mr-1 xs:mr-1.5">Lvl {player.level}</span>
              <div className="hidden sm:block w-12 md:w-20 h-2.5 bg-slate-600/80 rounded-full overflow-hidden shadow-inner border border-slate-500/50" title={`XP: ${player.xp} / ${player.xpToNextLevel}`}>
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Gold */}
          <div className="header-stat-text-responsive text-slate-300 bg-yellow-700/50 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg shadow-md border border-yellow-600/70 flex items-center" title={`Gold: ${player.gold}`}>
            <GoldCoinIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-yellow-300 mr-0.5 xs:mr-1" />
            <span className="font-semibold text-yellow-200">{player.gold}</span>
          </div>
          {/* Essence */}
          <div className="header-stat-text-responsive text-slate-300 bg-purple-700/50 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg shadow-md border border-purple-600/70 flex items-center" title={`Essence: ${player.essence}`}>
            <EssenceIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-purple-300 mr-0.5 xs:mr-1" />
            <span className="font-semibold text-purple-200">{player.essence}</span>
          </div>

          <ActionButton
            onClick={onOpenCharacterSheet}
            size="sm" 
            variant="primary"
            icon={<UserIcon className="w-4 h-4 md:w-5 md:h-5"/>}
            className="!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 shadow-sky-500/30 hover:shadow-sky-500/50"
            title="Open Character Sheet"
          >
            <span className="hidden sm:inline header-action-button-text-responsive">Character</span>
            <span className="sm:hidden header-action-button-text-responsive">Hero</span>
          </ActionButton>
          <ActionButton
            onClick={onOpenGameMenu}
            size="sm"
            variant="secondary"
            icon={<Bars3Icon className="w-4 h-4 md:w-5 md:h-5" />}
            className="!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 shadow-sky-500/30 hover:shadow-sky-500/50"
            title="Open Game Menu"
          >
            <span className="hidden sm:inline header-action-button-text-responsive">Menu</span>
            <span className="sm:hidden header-action-button-text-responsive">Menu</span>
          </ActionButton>
          {/* Mobile Menu Button */}
          {onOpenMobileMenu && (
            <ActionButton
              onClick={onOpenMobileMenu}
              size="sm"
              variant="secondary"
              icon={<Bars3Icon className="w-5 h-5" />}
              className="sm:hidden !px-2 !py-1.5 bg-transparent hover:bg-slate-700/60 active:bg-slate-600/80 border-transparent shadow-none hover:shadow-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              title="Open Menu"
            >
              {null} 
            </ActionButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
