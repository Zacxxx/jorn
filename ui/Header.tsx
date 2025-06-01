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
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-[1000] shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        {/* Left Side - Character Info */}
        <div className="flex items-center gap-3">
          {/* Character Avatar and Info */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 rounded-xl px-3 py-2 transition-all duration-200 group"
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
              <div className="text-slate-100 text-sm font-semibold truncate group-hover:text-white transition-colors">
                {player.name || 'Player'}
              </div>
              
              {/* Character Stats - Compact Row */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {/* Level */}
                <span className="text-blue-400 font-medium">L{player.level}</span>
                
                {/* Resources - Compact */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="font-medium text-slate-300">{player.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
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
          
          {/* Combat Status Indicator */}
          {isInAnyCombat && onReturnToCombat && (
            <div className="flex items-center">
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              <button
                onClick={isInCombatButNotOnCombatScreen ? onReturnToCombat : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isInCombatButNotOnCombatScreen 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 cursor-pointer' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default'
                }`}
                title={isInCombatButNotOnCombatScreen ? "Return to Active Combat" : "Currently in Combat"}
                disabled={!isInCombatButNotOnCombatScreen}
              >
                <div className={`w-2 h-2 rounded-full ${isInCombatButNotOnCombatScreen ? 'bg-red-400 animate-pulse' : 'bg-slate-500'}`}></div>
                <span>{isInCombatButNotOnCombatScreen ? "Combat" : "In Combat"}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Center - Game Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={onNavigateHome}
            className="text-xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent hover:from-sky-300 hover:to-cyan-300 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-slate-800/30"
            style={{fontFamily: "'Inter Tight', sans-serif"}}
            title="Go to Home Screen"
          >
            Jorn
          </button>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={onOpenGameMenu}
            size="sm"
            variant="secondary"
            icon={<Bars3Icon className="w-4 h-4" />}
            className="!px-3 !py-2 !bg-slate-800/50 !border-slate-600/30 hover:!bg-slate-700/50 hover:!border-slate-500/50 !text-slate-300 hover:!text-slate-200 !shadow-none"
            title="Open Game Menu"
          >
            <span className="hidden sm:inline text-xs font-medium">Menu</span>
          </ActionButton>
          
          {/* Mobile Menu Button */}
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
