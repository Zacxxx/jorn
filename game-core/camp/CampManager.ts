import { Player, PlayerEffectiveStats } from '../../types';

/**
 * Camp Manager Module
 * Handles rest mechanics, camp activities, and recovery systems
 */

export interface CampContext {
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setGameState: (state: string) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

export interface RestResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
  hpRestored?: number;
  mpRestored?: number;
  epRestored?: number;
  bonusApplied?: string;
}

export type RestType = 'short' | 'long';
export type RestActivity = 'meditation' | 'training' | 'study' | 'crafting' | 'exploration' | 'socializing';

/**
 * Complete a rest with optional activity bonuses
 * @param restType - Type of rest (short or long)
 * @param duration - Duration in hours (optional)
 * @param activity - Activity performed during rest (optional)
 * @param context - Camp execution context
 * @returns Result of the rest
 */
export const completeRest = (
  restType: RestType,
  duration?: number,
  activity?: string,
  context: CampContext
): RestResult => {
  const isShortRest = restType === 'short';
  const restDuration = duration || (isShortRest ? 1 : 8);
  
  // Calculate base recovery
  let hpRestored = 0;
  let mpRestored = 0;
  let epRestored = 0;
  let bonusMessage = '';

  if (isShortRest) {
    // Short rest: partial recovery
    hpRestored = Math.floor(context.effectivePlayerStats.maxHp * 0.25);
    mpRestored = Math.floor(context.effectivePlayerStats.maxMp * 0.5);
    epRestored = context.effectivePlayerStats.maxEp; // Full EP recovery
  } else {
    // Long rest: full recovery
    hpRestored = context.effectivePlayerStats.maxHp;
    mpRestored = context.effectivePlayerStats.maxMp;
    epRestored = context.effectivePlayerStats.maxEp;
  }

  // Apply activity bonuses
  if (activity) {
    const activityBonus = calculateActivityBonus(activity, restType, context);
    if (activityBonus.bonus > 0) {
      switch (activityBonus.type) {
        case 'hp':
          hpRestored += activityBonus.bonus;
          bonusMessage = `+${activityBonus.bonus} HP from ${activity}`;
          break;
        case 'mp':
          mpRestored += activityBonus.bonus;
          bonusMessage = `+${activityBonus.bonus} MP from ${activity}`;
          break;
        case 'ep':
          epRestored += activityBonus.bonus;
          bonusMessage = `+${activityBonus.bonus} EP from ${activity}`;
          break;
        case 'xp':
          context.setPlayer(prev => ({ ...prev, xp: prev.xp + activityBonus.bonus }));
          bonusMessage = `+${activityBonus.bonus} XP from ${activity}`;
          break;
      }
    }
  }

  // Apply recovery (don't exceed maximums)
  const newHp = Math.min(context.effectivePlayerStats.maxHp, context.player.hp + hpRestored);
  const newMp = Math.min(context.effectivePlayerStats.maxMp, context.player.mp + mpRestored);
  const newEp = Math.min(context.effectivePlayerStats.maxEp, context.player.ep + epRestored);

  // Calculate actual amounts restored
  const actualHpRestored = newHp - context.player.hp;
  const actualMpRestored = newMp - context.player.mp;
  const actualEpRestored = newEp - context.player.ep;

  // Update player state
  context.setPlayer(prev => ({
    ...prev,
    hp: newHp,
    mp: newMp,
    ep: newEp,
    activeStatusEffects: [] // Rest clears most status effects
  }));

  // Create result message
  let message = `${isShortRest ? 'Short' : 'Long'} rest completed (${restDuration}h).`;
  if (actualHpRestored > 0) message += ` +${actualHpRestored} HP.`;
  if (actualMpRestored > 0) message += ` +${actualMpRestored} MP.`;
  if (actualEpRestored > 0) message += ` +${actualEpRestored} EP.`;
  if (bonusMessage) message += ` ${bonusMessage}.`;

  context.addLog('System', message, 'heal');
  context.setGameState('HOME');

  return {
    success: true,
    message,
    type: 'success',
    hpRestored: actualHpRestored,
    mpRestored: actualMpRestored,
    epRestored: actualEpRestored,
    bonusApplied: bonusMessage
  };
};

/**
 * Calculate activity bonus for rest
 * @param activity - Activity performed during rest
 * @param restType - Type of rest
 * @param context - Camp execution context
 * @returns Bonus information
 */
const calculateActivityBonus = (
  activity: string,
  restType: RestType,
  context: CampContext
): { type: 'hp' | 'mp' | 'ep' | 'xp'; bonus: number } => {
  const isLongRest = restType === 'long';
  const baseBonus = isLongRest ? 10 : 5;
  const playerLevel = context.player.level;

  switch (activity.toLowerCase()) {
    case 'meditation':
      return { type: 'mp', bonus: Math.floor(baseBonus + playerLevel * 2) };
    
    case 'training':
      return { type: 'ep', bonus: Math.floor(baseBonus + playerLevel * 1.5) };
    
    case 'study':
      return { type: 'xp', bonus: Math.floor(baseBonus + playerLevel) };
    
    case 'crafting':
      return { type: 'mp', bonus: Math.floor(baseBonus * 0.8 + playerLevel) };
    
    case 'exploration':
      return { type: 'hp', bonus: Math.floor(baseBonus + playerLevel * 0.5) };
    
    case 'socializing':
      return { type: 'ep', bonus: Math.floor(baseBonus + playerLevel) };
    
    default:
      return { type: 'hp', bonus: 0 };
  }
};

/**
 * Check if player can rest
 * @param restType - Type of rest to check
 * @param context - Camp execution context
 * @returns True if player can rest
 */
export const canRest = (restType: RestType, context: CampContext): boolean => {
  // Can always rest if not at full health/mana/energy
  const needsRecovery = context.player.hp < context.effectivePlayerStats.maxHp ||
                       context.player.mp < context.effectivePlayerStats.maxMp ||
                       context.player.ep < context.effectivePlayerStats.maxEp;

  // Can always rest if has negative status effects
  const hasNegativeEffects = context.player.activeStatusEffects.some(effect => 
    ['PoisonDoTActive', 'BurningDoTActive', 'BleedingDoTActive', 'Stun', 'Silenced'].includes(effect.name)
  );

  return needsRecovery || hasNegativeEffects;
};

/**
 * Get available rest activities
 * @param player - Current player state
 * @returns Array of available activities
 */
export const getAvailableActivities = (player: Player): RestActivity[] => {
  const baseActivities: RestActivity[] = ['meditation', 'training'];
  
  // Add activities based on player level/items
  if (player.level >= 3) baseActivities.push('study');
  if (player.level >= 5) baseActivities.push('exploration');
  if (player.discoveredRecipes.length > 0) baseActivities.push('crafting');
  if (player.level >= 7) baseActivities.push('socializing');
  
  return baseActivities;
};

/**
 * Get rest recommendations based on player state
 * @param player - Current player state
 * @param effectiveStats - Player's effective stats
 * @returns Recommended rest type and activity
 */
export const getRestRecommendations = (
  player: Player, 
  effectiveStats: PlayerEffectiveStats
): { restType: RestType; activity?: RestActivity; reason: string } => {
  const hpPercent = player.hp / effectiveStats.maxHp;
  const mpPercent = player.mp / effectiveStats.maxMp;
  const epPercent = player.ep / effectiveStats.maxEp;
  
  // Recommend long rest if severely injured
  if (hpPercent < 0.3 || mpPercent < 0.3) {
    return {
      restType: 'long',
      activity: 'meditation',
      reason: 'Severely depleted resources require extended rest.'
    };
  }
  
  // Recommend short rest for minor recovery
  if (hpPercent < 0.7 || mpPercent < 0.7 || epPercent < 0.5) {
    return {
      restType: 'short',
      activity: 'training',
      reason: 'Minor recovery needed, short rest should suffice.'
    };
  }
  
  // Player is mostly healthy
  return {
    restType: 'short',
    activity: 'study',
    reason: 'You are in good condition. Consider studying for experience.'
  };
};

/**
 * Camp Manager utility functions
 */
export const CampManagerUtils = {
  completeRest,
  canRest,
  getAvailableActivities,
  getRestRecommendations,
}; 