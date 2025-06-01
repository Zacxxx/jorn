import React from 'react';
import { Player, PlayerEffectiveStats } from '../src/types';
import ActionButton from './ActionButton';
import { UserIcon, Bars3Icon, GoldCoinIcon, EssenceIcon, SwordsIcon, HealIcon, WandIcon, ReflexIcon } from '../src/components/IconComponents';

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
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[1000] shadow-2xl shadow-black/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        {/* Left Side - Character Info */}
        <div className="flex items-center gap-2 sm:gap-3"> {/* MOD: Reduced gap for overall left side on mobile */}
          {/* Character Avatar and Info */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-white/10 rounded-xl px-2 py-2 sm:px-3 transition-all duration-200 group backdrop-blur-sm border border-white/5 hover:border-white/20" // MOD: Reduced padding and gap for mobile
            onClick={onOpenCharacterSheet}
            title="Open Character Sheet"
          >
            {/* Avatar with Circular Health/Mana Indicators */}
            <div className="relative">
              {/* Main Avatar */}
              <div className="w-9 h-9 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:border-white/30 transition-colors relative z-10">
                <UserIcon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              </div>
              
              {/* Circular Progress Rings - Desktop Only, Not in Combat */}
              {/* SVGs removed as per request */}
              
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-black/30 rounded-full z-20 shadow-lg"></div>
            </div>
            
            {/* Character Details */}
            <div className="min-w-0">
              {/* Character Name */}
              <div className="text-white text-xs sm:text-sm font-semibold truncate group-hover:text-white/90 transition-colors drop-shadow-sm"> {/* MOD: Adjusted text size for mobile */}
                {player.title ? `${player.title} ${player.name || 'Player'}` : (player.name || 'Player')}
              </div>
              
              {/* NEW STATS BLOCK START */}
              {showHealthManaBar && (
                <div className="hidden lg:flex items-center gap-3 mt-0.5"> {/* Adjusted gap and margin-top */}
                  {/* HP */}
                  <div className="flex items-center gap-1">
                    <HealIcon className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-300 font-mono text-xs drop-shadow-sm">{player.hp}/{effectivePlayerStats.maxHp}</span>
                  </div>
                  {/* MP */}
                  <div className="flex items-center gap-1">
                    <WandIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-300 font-mono text-xs drop-shadow-sm">{player.mp}/{effectivePlayerStats.maxMp}</span>
                  </div>
                  {/* EP */}
                  <div className="flex items-center gap-1">
                    <ReflexIcon className="w-3.5 h-3.5 text-yellow-400" /> {/* Or SpeedIcon */}
                    <span className="text-yellow-300 font-mono text-xs drop-shadow-sm">{player.ep}/{effectivePlayerStats.maxEp}</span>
                  </div>
                </div>
              )}
              {/* NEW STATS BLOCK END */}

              {/* Character Stats - Compact Row (original, now without HP/MP/EP) */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/60"> {/* MOD: Reduced gap for mobile */}
                {/* Level */}
                <span className="text-blue-300 font-medium drop-shadow-sm">L{player.level}</span>
                
                {/* Resources - Compact */}
                <div className="flex items-center gap-1.5 sm:gap-2"> {/* MOD: Reduced gap for mobile */}
                  <div className="flex items-center gap-0.5 sm:gap-1"> {/* MOD: Reduced gap for mobile */}
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                    <span className="font-medium text-white/80 drop-shadow-sm">{player.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1"> {/* MOD: Reduced gap for mobile */}
                    <div className="w-2 h-2 bg-purple-400 rounded-full shadow-sm"></div>
                    <span className="font-medium text-white/80 drop-shadow-sm">{player.essence.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Location - Hidden on small screens */}
                <span className="hidden sm:inline text-white/40 truncate max-w-24 drop-shadow-sm">
                  {player.currentLocationId || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Combat Status Indicator */}
          {isInAnyCombat && onReturnToCombat && (
            <div className="flex items-center">
              <div className="w-px h-6 bg-white/20 mx-1 sm:mx-2"></div> {/* MOD: Reduced margin for mobile */}
              <button
                onClick={isInCombatButNotOnCombatScreen ? onReturnToCombat : undefined}
                className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 backdrop-blur-sm border ${ // MOD: Reduced padding and gap for mobile
                  isInCombatButNotOnCombatScreen 
                    ? 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30 hover:border-red-400/50 cursor-pointer shadow-lg' 
                    : 'bg-white/10 text-white/60 border-white/20 cursor-default'
                }`}
                title={isInCombatButNotOnCombatScreen ? "Return to Active Combat" : "Currently in Combat"}
                disabled={!isInCombatButNotOnCombatScreen}
              >
                <div className={`w-2 h-2 rounded-full ${isInCombatButNotOnCombatScreen ? 'bg-red-400 animate-pulse shadow-sm' : 'bg-white/40'}`}></div>
                <span className="text-2xs sm:text-xs drop-shadow-sm">{isInCombatButNotOnCombatScreen ? "Combat" : "In Combat"}</span> {/* MOD: Adjusted text size for mobile */}
              </button>
            </div>
          )}
        </div>
        
        {/* Center - Game Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={onNavigateHome}
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent hover:from-sky-200 hover:to-cyan-200 transition-all duration-200 px-2 sm:px-3 py-1 rounded-lg drop-shadow-lg" // MOD: Reduced padding and text size for mobile
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
            className="hidden sm:flex !px-3 !py-2 !bg-transparent !border-transparent hover:!bg-white/10 hover:!border-white/20 !text-white/80 hover:!text-white !shadow-none backdrop-blur-sm items-center"
            title="Open Game Menu"
          >
            <span className="text-xs font-medium drop-shadow-sm">Menu</span>
          </ActionButton>
          
          {/* Mobile Menu Button - Mobile Only */}
          {onOpenMobileMenu && (
            <ActionButton
              onClick={onOpenMobileMenu}
              size="sm"
              variant="secondary"
              icon={<Bars3Icon className="w-4 h-4" />}
              className="sm:hidden !px-2 !py-2 !bg-transparent hover:!bg-white/10 !border-transparent !shadow-none !text-white/60 hover:!text-white backdrop-blur-sm flex items-center justify-center"
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
