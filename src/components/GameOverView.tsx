import React, { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import CombatLogDisplay from './CombatLogDisplay';
import EnemyDisplay from './EnemyDisplay';
import { CombatActionLog, Enemy } from '../../types';
import { SkullIcon, StarIcon, GoldCoinIcon, EssenceIcon, CheckmarkCircleIcon } from './IconComponents';

// Add missing icon components
const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228V2.721m-2.48 5.228a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

interface GameOverViewProps {
  gameState: 'GAME_OVER_VICTORY' | 'GAME_OVER_DEFEAT';
  modalMessage: string | undefined; // From modalContent.message
  currentEnemy: Enemy | null; // For victory screen
  combatLog: CombatActionLog[];
  onReturnHome: () => void;
  onFindEnemy: () => void; // For Fight Again button
  isLoading: boolean;
  currentEnemies?: Enemy[]; // All enemies for victory screen
}

const GameOverView: React.FC<GameOverViewProps> = ({
  gameState,
  modalMessage,
  currentEnemy,
  combatLog,
  onReturnHome,
  onFindEnemy,
  isLoading,
  currentEnemies = [],
}) => {
  const isVictory = gameState === 'GAME_OVER_VICTORY';
  const [showDetails, setShowDetails] = useState(false);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animation sequence for victory
  useEffect(() => {
    if (isVictory) {
      const timer1 = setTimeout(() => setAnimationPhase(1), 300);
      const timer2 = setTimeout(() => setAnimationPhase(2), 800);
      const timer3 = setTimeout(() => setAnimationPhase(3), 1300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVictory]);

  // Calculate rewards from combat log
  const rewards = React.useMemo(() => {
    const goldGained = combatLog
      .filter(log => log.message.includes('Gained') && log.message.includes('gold'))
      .reduce((total, log) => {
        const match = log.message.match(/(\d+) gold/);
        return total + (match ? parseInt(match[1]) : 0);
      }, 0);

    const essenceGained = combatLog
      .filter(log => log.message.includes('Gained') && log.message.includes('essence'))
      .reduce((total, log) => {
        const match = log.message.match(/(\d+) essence/);
        return total + (match ? parseInt(match[1]) : 0);
      }, 0);

    return { gold: goldGained, essence: essenceGained };
  }, [combatLog]);

  const defeatedEnemies = currentEnemies.filter(enemy => enemy.isDefeated || enemy.hp <= 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {isVictory ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-gold-900/20 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,197,94,0.15),transparent_70%)]" />
            {/* Floating particles for victory */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400/60 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-slate-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]" />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 pt-8 pb-4 px-4">
          <div className="text-center">
            {/* Main Title with Animation */}
            <div className={`transform transition-all duration-1000 ${animationPhase >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="relative inline-block">
                {isVictory ? (
                  <StarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
                ) : (
                  <SkullIcon className="w-16 h-16 sm:w-20 sm:h-20 text-red-400 mx-auto mb-4" />
                )}
                {isVictory && animationPhase >= 1 && (
                  <div className="absolute inset-0 animate-ping">
                    <StarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400/50 mx-auto" />
                  </div>
                )}
              </div>
              
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-2 ${
                isVictory ? 'text-emerald-400' : 'text-red-400'
              }`} style={{fontFamily: "'Inter Tight', sans-serif"}}>
                {isVictory ? 'VICTORY!' : 'DEFEATED!'}
              </h1>
              
              <p className={`text-lg sm:text-xl mb-6 ${
                isVictory ? 'text-emerald-200' : 'text-red-200'
              }`}>
                {modalMessage || (isVictory ? 'You emerged victorious!' : 'You have fallen in battle.')}
              </p>
            </div>

            {/* Rewards Section - Victory Only */}
            {isVictory && (rewards.gold > 0 || rewards.essence > 0) && (
              <div className={`transform transition-all duration-1000 delay-300 ${
                animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-emerald-500/30 shadow-2xl max-w-md mx-auto mb-6">
                  <h3 className="text-emerald-300 font-bold text-lg mb-4 flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 mr-2" />
                    Battle Rewards
                  </h3>
                  <div className="flex justify-center space-x-6">
                    {rewards.gold > 0 && (
                      <div className="flex items-center space-x-2 bg-yellow-900/30 px-4 py-2 rounded-lg">
                        <GoldCoinIcon className="w-6 h-6 text-yellow-400" />
                        <span className="text-yellow-200 font-bold text-lg">+{rewards.gold}</span>
                      </div>
                    )}
                    {rewards.essence > 0 && (
                      <div className="flex items-center space-x-2 bg-purple-900/30 px-4 py-2 rounded-lg">
                        <EssenceIcon className="w-6 h-6 text-purple-400" />
                        <span className="text-purple-200 font-bold text-lg">+{rewards.essence}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Defeated Enemies Section - Victory Only */}
        {isVictory && defeatedEnemies.length > 0 && (
          <div className={`flex-shrink-0 px-4 mb-6 transform transition-all duration-1000 delay-500 ${
            animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/40 shadow-xl hover:border-emerald-500/40 transition-all duration-300 mb-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-emerald-300 font-bold text-lg flex items-center">
                    <SkullIcon className="w-5 h-5 mr-2" />
                    Enemies Defeated ({defeatedEnemies.length})
                  </h3>
                  {showDetails ? (
                    <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                
                {!showDetails && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {defeatedEnemies.slice(0, 3).map(enemy => (
                      <div key={enemy.id} className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                        <span className="text-slate-300 text-sm font-medium">{enemy.name}</span>
                        <span className="text-slate-500 text-xs">Lvl {enemy.level}</span>
                      </div>
                    ))}
                    {defeatedEnemies.length > 3 && (
                      <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                        <span className="text-slate-400 text-sm">+{defeatedEnemies.length - 3} more</span>
                      </div>
                    )}
                  </div>
                )}
              </button>

              {/* Detailed Enemy List */}
              {showDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top duration-300">
                  {defeatedEnemies.map(enemy => (
                    <div key={enemy.id} className="transform hover:scale-105 transition-transform duration-200">
                      <EnemyDisplay enemy={enemy} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Combat Log Section */}
        <div className="flex-1 px-4 mb-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowCombatLog(!showCombatLog)}
              className="w-full bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/40 shadow-xl hover:border-slate-500/60 transition-all duration-300 mb-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 font-bold text-lg">Battle Log</h3>
                {showCombatLog ? (
                  <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {showCombatLog && (
              <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-slate-600/40 shadow-xl animate-in slide-in-from-top duration-300">
                <div className="max-h-64 sm:max-h-80 overflow-y-auto p-4">
                  <CombatLogDisplay logs={combatLog} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex-shrink-0 p-4 transform transition-all duration-1000 delay-700 ${
          animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="max-w-md mx-auto space-y-3">
            <ActionButton 
              onClick={onReturnHome} 
              variant="primary" 
              size="lg" 
              className="w-full text-lg font-bold py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-xl"
            >
              Continue Adventure
            </ActionButton>
            
            {isVictory && (
              <ActionButton 
                onClick={onFindEnemy} 
                variant="danger" 
                isLoading={isLoading} 
                icon={<SkullIcon />} 
                size="lg" 
                className="w-full text-lg font-bold py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-xl"
              >
                {isLoading ? 'Seeking Battle...' : 'Fight Again'}
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverView;
