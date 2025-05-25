import React from 'react';
import { Player } from '../../types';
import ActionButton from '../battle-ui/layout/ActionButton';
import { UserIcon } from '../books/IconComponents';

interface HeaderProps {
  player: Player;
  onOpenCharacterSheet: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ player, onOpenCharacterSheet, onNavigateHome }) => {
  const xpPercentage = player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0;

  return (
    <header className="bg-slate-800/95 shadow-xl border-b-2 border-sky-600/60 sticky top-0 z-[1000] backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex justify-between items-center max-w-6xl">
        <button 
            onClick={onNavigateHome}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-300 tracking-tight hover:text-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-md px-1 -ml-1"
            style={{fontFamily: "'Inter Tight', sans-serif"}}
            title="Go to Home Screen"
        >
          Jorn
        </button>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="text-xs md:text-sm text-slate-300 bg-slate-700/60 px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-md border border-slate-600/70">
            <div className="flex items-center">
              <span className="font-semibold text-green-400 mr-1.5">Lvl {player.level}</span>
              <div className="w-16 md:w-24 h-3 bg-slate-600/80 rounded-full overflow-hidden shadow-inner border border-slate-500/50" title={`XP: ${player.xp} / ${player.xpToNextLevel}`}>
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <ActionButton 
            onClick={onOpenCharacterSheet} 
            size="sm" 
            variant="primary" 
            icon={<UserIcon className="w-4 h-4 md:w-5 md:h-5"/>}
            className="!px-2.5 !py-1.5 md:!px-3 md:!py-2 shadow-sky-500/30 hover:shadow-sky-500/50"
            title="Open Character Sheet"
          >
            <span className="hidden sm:inline">Character</span>
            <span className="sm:hidden">Hero</span>
          </ActionButton>
        </div>
      </div>
    </header>
  );
};

export default Header;