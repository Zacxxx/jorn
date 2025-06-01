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

const XMarkIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);

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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {isVictory ? (
          <>
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-gold-900/30 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,197,94,0.2),transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
            
            {/* Moving background waves */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent transform -skew-y-12 animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-500/10 to-transparent transform skew-y-12 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            </div>
            
            {/* Floating particles for victory - slower and more elegant */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400/40 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${3 + Math.random() * 3}s`,
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

      {/* Enemy Detail Modal */}
      {selectedEnemy && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-600/50 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100">Enemy Details</h3>
                <button
                  onClick={() => setSelectedEnemy(null)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <EnemyDisplay enemy={selectedEnemy} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Fixed fullscreen layout with proper containment */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden max-w-full">
        {/* Header Section - Fixed height with max width */}
        <div className="flex-shrink-0 pt-3 pb-2 px-4 max-w-4xl mx-auto w-full">
          <div className="text-center">
            {/* Main Title with Animation */}
            <div className={`transform transition-all duration-1000 ${animationPhase >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="relative inline-block">
                {isVictory ? (
                  <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-2" />
                ) : (
                  <SkullIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-2" />
                )}
              </div>
              
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 ${
                isVictory ? 'text-emerald-400' : 'text-red-400'
              }`} style={{fontFamily: "'Inter Tight', sans-serif"}}>
                {isVictory ? 'VICTORY!' : 'DEFEATED!'}
              </h1>
              
              <p className={`text-sm sm:text-base mb-3 ${
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
                <div className="bg-slate-800/60 backdrop-blur-lg rounded-lg p-2 sm:p-3 border border-emerald-500/30 shadow-2xl max-w-xs mx-auto mb-3">
                  <h3 className="text-emerald-300 font-bold text-sm mb-2 flex items-center justify-center">
                    <TrophyIcon className="w-3 h-3 mr-1" />
                    Battle Rewards
                  </h3>
                  <div className="flex justify-center space-x-3">
                    {rewards.gold > 0 && (
                      <div className="flex items-center space-x-1 bg-yellow-900/30 px-2 py-1 rounded">
                        <GoldCoinIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-200 font-bold text-sm">+{rewards.gold}</span>
                      </div>
                    )}
                    {rewards.essence > 0 && (
                      <div className="flex items-center space-x-1 bg-purple-900/30 px-2 py-1 rounded">
                        <EssenceIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200 font-bold text-sm">+{rewards.essence}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area - Flexible height with proper containment */}
        <div className="flex-1 px-4 min-h-0 flex flex-col max-w-4xl mx-auto w-full">
          {/* Defeated Enemies Section - Victory Only */}
          {isVictory && defeatedEnemies.length > 0 && (
            <div className={`flex-shrink-0 transform transition-all duration-1000 delay-500 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex flex-col w-full">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-shrink-0 w-full bg-slate-800/60 backdrop-blur-lg rounded-lg p-2 border border-slate-600/40 shadow-xl hover:border-emerald-500/40 transition-all duration-300 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-emerald-300 font-bold text-sm flex items-center">
                      <SkullIcon className="w-3 h-3 mr-1" />
                      Enemies Defeated ({defeatedEnemies.length})
                    </h3>
                    {showDetails ? (
                      <ChevronUpIcon className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  
                  {!showDetails && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-center max-w-full">
                      {defeatedEnemies.slice(0, 2).map(enemy => (
                        <div key={enemy.id} className="flex items-center space-x-1 bg-slate-700/50 px-2 py-1 rounded text-xs">
                          <span className="text-slate-300 font-medium truncate">{enemy.name}</span>
                          <span className="text-slate-500 flex-shrink-0">Lvl {enemy.level}</span>
                        </div>
                      ))}
                      {defeatedEnemies.length > 2 && (
                        <div className="flex items-center space-x-1 bg-slate-700/50 px-2 py-1 rounded text-xs">
                          <span className="text-slate-400">+{defeatedEnemies.length - 2} more</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {/* Detailed Enemy List - Responsive grid with proper constraints */}
                {showDetails && (
                  <div className="max-h-32 overflow-y-auto mb-2 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pb-2 w-full">
                      {defeatedEnemies.map(enemy => (
                        <button
                          key={enemy.id}
                          onClick={() => setSelectedEnemy(enemy)}
                          className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg w-full min-w-0"
                        >
                          <div className="bg-slate-800/60 backdrop-blur-lg rounded-lg border border-slate-600/40 hover:border-emerald-500/40 transition-colors w-full">
                            <EnemyDisplay enemy={enemy} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Below enemies section with proper centering */}
          <div className={`flex-shrink-0 py-2 transform transition-all duration-1000 delay-700 ${
            animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="max-w-xs mx-auto space-y-2 w-full">
              <ActionButton 
                onClick={onReturnHome} 
                variant="primary" 
                size="lg" 
                className="w-full text-sm font-bold py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-xl"
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
                  className="w-full text-sm font-bold py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-xl"
                >
                  {isLoading ? 'Seeking Battle...' : 'Fight Again'}
                </ActionButton>
              )}
            </div>
          </div>

          {/* Combat Log Section - Only show if no enemies or enemies section is collapsed */}
          {(!isVictory || defeatedEnemies.length === 0 || !showDetails) && (
            <div className="flex-1 min-h-0 w-full">
              <button
                onClick={() => setShowCombatLog(!showCombatLog)}
                className="w-full bg-slate-800/60 backdrop-blur-lg rounded-lg p-2 border border-slate-600/40 shadow-xl hover:border-slate-500/60 transition-all duration-300 mb-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-300 font-bold text-sm">Battle Log</h3>
                  {showCombatLog ? (
                    <ChevronUpIcon className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </button>

              {showCombatLog && (
                <div className="bg-slate-900/60 backdrop-blur-lg rounded-lg border border-slate-600/40 shadow-xl h-32 overflow-y-auto w-full">
                  <div className="p-2">
                    <CombatLogDisplay logs={combatLog} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverView;
