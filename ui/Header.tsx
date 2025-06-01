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
        
        {/* Character Info Section - Replaces XP bar and money counts */}
        <div className="flex items-center gap-3">
          {/* Character Avatar and Info */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/40 rounded-lg p-1.5 transition-all duration-200 border border-transparent hover:border-slate-600/50"
            onClick={onOpenCharacterSheet}
            title="Open Character Sheet"
          >
            {/* Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/30 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            </div>
            
            {/* Character Details */}
            <div className="flex-1 min-w-0">
              {/* Character Name */}
              <h3 className="text-white text-sm sm:text-base font-bold mb-0 truncate">{player.name || 'Player'}</h3>
              
              {/* Character Info Row */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs">
                {/* Level - Always visible */}
                <span className="text-blue-400 font-semibold">Lvl {player.level}</span>
                
                {/* Title - Hidden on very small screens */}
                <span className="hidden xs:inline text-purple-400 font-medium">The Brave</span>
                
                {/* Location - Hidden on small screens */}
                <span className="hidden sm:inline text-green-400 truncate max-w-20 lg:max-w-none">{player.currentLocationId || 'Unknown'}</span>
                
                {/* Gold - Always visible but compact on mobile */}
                <div className="flex items-center gap-1">
                  <GoldCoinIcon className="w-3 h-3 text-yellow-300" />
                  <span className="text-yellow-400 font-semibold">{player.gold.toLocaleString()}</span>
                </div>
                
                {/* Essence - Always visible but compact on mobile */}
                <div className="flex items-center gap-1">
                  <EssenceIcon className="w-3 h-3 text-purple-300" />
                  <span className="text-cyan-400 font-semibold">{player.essence.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButton
            onClick={onOpenGameMenu}
            size="sm"
            variant="secondary"
            icon={<Bars3Icon className="w-4 h-4 md:w-5 md:h-5" />}
            className="!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 shadow-sky-500/30 hover:shadow-sky-500/50"
            title="Open Game Menu"
          >
            <span className="hidden sm:inline header-action-button-text-responsive">Menu</span>
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
