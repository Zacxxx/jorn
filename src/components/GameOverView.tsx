import React from 'react';
import ActionButton from './ActionButton';
import CombatLogDisplay from './CombatLogDisplay';
import EnemyDisplay from './EnemyDisplay';
import { CombatActionLog, Enemy } from '../../types';
import { SkullIcon } from './IconComponents';

interface GameOverViewProps {
  gameState: 'GAME_OVER_VICTORY' | 'GAME_OVER_DEFEAT';
  modalMessage: string | undefined; // From modalContent.message
  currentEnemy: Enemy | null; // For victory screen
  combatLog: CombatActionLog[];
  onReturnHome: () => void;
  onFindEnemy: () => void; // For Fight Again button
  isLoading: boolean;
}

const GameOverView: React.FC<GameOverViewProps> = ({
  gameState,
  modalMessage,
  currentEnemy,
  combatLog,
  onReturnHome,
  onFindEnemy,
  isLoading,
}) => {
  const isVictory = gameState === 'GAME_OVER_VICTORY';

  return (
    <div className="text-center p-6 md:p-8 bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl space-y-6 border-2 border-slate-700/70">
      <h2 className={`text-4xl md:text-5xl font-bold ${isVictory ? 'text-green-400' : 'text-red-400'}`} style={{fontFamily: "'Inter Tight', sans-serif"}}>
        {isVictory ? 'Victory!' : 'Defeated!'}
      </h2>
      <p className="text-slate-300 text-lg leading-relaxed">{modalMessage || (isVictory ? 'You won the battle!' : 'You lost the battle.')}</p>
      
      {currentEnemy && isVictory && (
        <div className="max-w-md mx-auto my-4 p-3 bg-slate-700/50 rounded-lg shadow-inner border border-slate-600">
            <p className="text-sm text-slate-400 mb-2">You defeated:</p>
            <EnemyDisplay enemy={currentEnemy} />
        </div> 
      )}
      
      <div className="max-h-48 overflow-y-auto styled-scrollbar border border-slate-700 rounded-lg p-2 bg-slate-900/30">
        <CombatLogDisplay logs={combatLog} />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
        <ActionButton onClick={onReturnHome} variant="primary" size="lg" className="w-full sm:w-auto">
          Continue
        </ActionButton>
        {isVictory && (
          <ActionButton onClick={onFindEnemy} variant="danger" isLoading={isLoading} icon={<SkullIcon />} size="lg" className="w-full sm:w-auto">
            Fight Again
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default GameOverView;
