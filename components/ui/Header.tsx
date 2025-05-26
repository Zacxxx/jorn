import React, { useState, useRef } from 'react';
import { Player } from '../../types';
import ActionButton from '../battle-ui/layout/ActionButton';
import { UserIcon, ChevronDownIcon, ChevronUpIcon } from '../books/IconComponents';
import useMobileFeatures from '../../hooks/useMobileFeatures';

interface HeaderProps {
  player: Player;
  onOpenCharacterSheet: () => void;
  onNavigateHome: () => void;
  onSaveGame: () => void;
  onImportGame: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportGame: () => void;
  onResetGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  player, 
  onOpenCharacterSheet, 
  onNavigateHome,
  onSaveGame,
  onImportGame,
  onExportGame,
  onResetGame
}) => {
  const { isMobile, isPortrait } = useMobileFeatures();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const xpPercentage = player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0;

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    onResetGame();
    setShowResetConfirm(false);
  };

  return (
    <header className="bg-slate-800/95 shadow-xl border-b-2 border-sky-600/60 sticky top-0 z-[1000] backdrop-blur-md">
      <div className="container mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5 flex justify-between items-center max-w-6xl">
        <button 
          onClick={onNavigateHome}
          className="text-lg sm:text-2xl md:text-3xl font-bold text-sky-300 tracking-tight hover:text-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-md px-1 -ml-1"
          style={{fontFamily: "'Inter Tight', sans-serif"}}
          title="Go to Home Screen"
        >
          Jorn
        </button>
        <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-300 bg-slate-700/60 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-lg shadow-md border border-slate-600/70">
            <div className="flex items-center">
              <span className="font-semibold text-green-400 mr-1 sm:mr-1.5 text-[10px] sm:text-xs md:text-sm">Lvl {player.level}</span>
              <div className="w-12 sm:w-16 md:w-24 h-2 sm:h-3 bg-slate-600/80 rounded-full overflow-hidden shadow-inner border border-slate-500/50" title={`XP: ${player.xp} / ${player.xpToNextLevel}`}>
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Hero Button */}
          <ActionButton 
            onClick={onOpenCharacterSheet} 
            size="sm" 
            variant="primary" 
            icon={<UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"/>}
            className="!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 shadow-sky-500/30 hover:shadow-sky-500/50 text-[11px] sm:text-sm"
            title="Open Character Sheet"
          >
            <span className="hidden sm:inline">Character</span>
            <span className="sm:hidden">Hero</span>
          </ActionButton>

          {/* User Menu Button */}
          <div className="relative">
            <ActionButton
              onClick={() => setShowUserMenu(!showUserMenu)}
              size="sm"
              variant="secondary"
              icon={<UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"/>}
              className="!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 md:!px-3 md:!py-2 shadow-slate-500/30 hover:shadow-slate-500/50 text-[11px] sm:text-sm"
              title="User Menu"
            >
              <span className="hidden sm:inline">User</span>
              <span className="sm:hidden">User</span>
              {showUserMenu ? (
                <ChevronUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              )}
            </ActionButton>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={onSaveGame}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    role="menuitem"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    role="menuitem"
                  >
                    Import
                  </button>
                  <button
                    onClick={onExportGame}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    role="menuitem"
                  >
                    Export
                  </button>
                  <button
                    onClick={handleResetClick}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                    role="menuitem"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input for import */}
          <input
            type="file"
            ref={importFileRef}
            onChange={onImportGame}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Confirm Reset</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to reset your game? This will delete all your progress and cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;