import React from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import ActionButton from './ActionButton';
import { UserIcon, Bars3Icon, GoldCoinIcon, EssenceIcon, SwordsIcon, HealIcon, WandIcon, StarIcon } from '../src/components/IconComponents'; 

interface HeaderProps {
  player: Player;
  effectivePlayerStats?: PlayerEffectiveStats;
  gameState?: string;
  onOpenCharacterSheet: () => void;
  onNavigateHome: () => void;
  onOpenMobileMenu?: () => void; 
  onOpenGameMenu: () => void;
  isInCombatButNotOnCombatScreen?: boolean;
  isInAnyCombat?: boolean;
  onReturnToCombat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  player, 
  effectivePlayerStats, 
  gameState, 
  onOpenCharacterSheet, 
  onNavigateHome, 
  onOpenMobileMenu, 
  onOpenGameMenu, 
  isInCombatButNotOnCombatScreen = false, 
  isInAnyCombat, 
  onReturnToCombat 
}) => {
  // Show health/mana bars on desktop when not in combat
  const showHealthManaBar = effectivePlayerStats && gameState !== 'IN_COMBAT';

  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-[1000] shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        {/* Left Side - Character Info */}
        <div className="flex items-center gap-2 sm:gap-3"> {/* MOD: Reduced gap for overall left side on mobile */}
          {/* Character Avatar and Info */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-800/50 rounded-xl px-2 py-2 sm:px-3 transition-all duration-200 group" // MOD: Reduced padding and gap for mobile
            onClick={onOpenCharacterSheet}
            title="Open Character Sheet"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 rounded-xl flex items-center justify-center shadow-sm group-hover:border-slate-500/70 transition-colors">
                <UserIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-200 transition-colors" />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            
            {/* Character Details */}
            <div className="min-w-0">
              {/* Character Name */}
              <div className="text-slate-100 text-xs sm:text-sm font-semibold truncate group-hover:text-white transition-colors"> {/* MOD: Adjusted text size for mobile */}
                {player.name || 'Player'}
              </div>
              
              {/* Character Stats - Compact Row */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400"> {/* MOD: Reduced gap for mobile */}
                {/* Level */}
                <span className="text-blue-400 font-medium">L{player.level}</span>
                
                {/* Resources - Compact */}
                <div className="flex items-center gap-1.5 sm:gap-2"> {/* MOD: Reduced gap for mobile */}
                  <div className="flex items-center gap-0.5 sm:gap-1"> {/* MOD: Reduced gap for mobile */}
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="font-medium text-slate-300">{player.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1"> {/* MOD: Reduced gap for mobile */}
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="font-medium text-slate-300">{player.essence.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Location - Hidden on small screens */}
                <span className="hidden sm:inline text-slate-500 truncate max-w-24">
                  {player.currentLocationId || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Health/Mana Bars - Desktop Only, Not in Combat */}
          {showHealthManaBar && (
            <div className="hidden lg:flex items-center gap-3 ml-2">
              <div className="w-px h-6 bg-slate-700"></div>
              
              {/* Stacked Bars - Compact Vertical Layout */}
              <div className="flex flex-col gap-1 min-w-0">
                {/* Health Bar */}
                <div className="flex items-center gap-1.5">
                  <HealIcon className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-medium text-slate-300 w-6">HP</span>
                    <div className="w-16 bg-slate-700/50 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, (player.hp / effectivePlayerStats.maxHp) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-red-300 min-w-0 text-right">{player.hp}/{effectivePlayerStats.maxHp}</span>
                  </div>
                </div>
                
                {/* Mana Bar */}
                <div className="flex items-center gap-1.5">
                  <WandIcon className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-medium text-slate-300 w-6">MP</span>
                    <div className="w-16 bg-slate-700/50 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, (player.mp / effectivePlayerStats.maxMp) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-blue-300 min-w-0 text-right">{player.mp}/{effectivePlayerStats.maxMp}</span>
                  </div>
                </div>
                
                {/* Energy Bar */}
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-medium text-slate-300 w-6">EP</span>
                    <div className="w-16 bg-slate-700/50 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, (player.ep / effectivePlayerStats.maxEp) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-yellow-300 min-w-0 text-right">{player.ep}/{effectivePlayerStats.maxEp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Combat Status Indicator */}
          {isInAnyCombat && onReturnToCombat && (
            <div className="flex items-center">
              <div className="w-px h-6 bg-slate-700 mx-1 sm:mx-2"></div> {/* MOD: Reduced margin for mobile */}
              <button
                onClick={isInCombatButNotOnCombatScreen ? onReturnToCombat : undefined}
                className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${ // MOD: Reduced padding and gap for mobile
                  isInCombatButNotOnCombatScreen 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 cursor-pointer' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default'
                }`}
                title={isInCombatButNotOnCombatScreen ? "Return to Active Combat" : "Currently in Combat"}
                disabled={!isInCombatButNotOnCombatScreen}
              >
                <div className={`w-2 h-2 rounded-full ${isInCombatButNotOnCombatScreen ? 'bg-red-400 animate-pulse' : 'bg-slate-500'}`}></div>
                <span className="text-2xs sm:text-xs">{isInCombatButNotOnCombatScreen ? "Combat" : "In Combat"}</span> {/* MOD: Adjusted text size for mobile */}
              </button>
            </div>
          )}
        </div>
        
        {/* Center - Game Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={onNavigateHome}
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent hover:from-sky-300 hover:to-cyan-300 transition-all duration-200 px-2 sm:px-3 py-1 rounded-lg hover:bg-slate-800/30" // MOD: Reduced padding and text size for mobile
            style={{fontFamily: "'Inter Tight', sans-serif"}}
            title="Go to Home Screen"
          >
            Jorn
          </button>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Game Menu Button - Desktop Only */}
          <ActionButton
            onClick={onOpenGameMenu}
            size="sm"
            variant="secondary"
            icon={<Bars3Icon className="w-4 h-4" />}
            className="hidden sm:flex !px-3 !py-2 !bg-slate-800/50 !border-slate-600/30 hover:!bg-slate-700/50 hover:!border-slate-500/50 !text-slate-300 hover:!text-slate-200 !shadow-none"
            title="Open Game Menu"
          >
            <span className="text-xs font-medium">Menu</span>
          </ActionButton>
          
          {/* Mobile Menu Button - Mobile Only */}
          {onOpenMobileMenu && (
            <ActionButton
              onClick={onOpenMobileMenu}
              size="sm"
              variant="secondary"
              icon={<Bars3Icon className="w-4 h-4" />}
              className="sm:hidden !px-2 !py-2 !bg-transparent hover:!bg-slate-800/50 !border-transparent !shadow-none !text-slate-400 hover:!text-slate-200"
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
