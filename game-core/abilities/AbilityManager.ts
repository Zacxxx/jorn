import { Player, Enemy, Ability, PlayerEffectiveStats, StatusEffectName } from '../../types';

/**
 * Ability Manager Module
 * Handles ability usage, effects, and management
 */

export interface AbilityContext {
  player: Player;
  currentEnemies: Enemy[];
  effectivePlayerStats: PlayerEffectiveStats;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setCurrentEnemies: (updater: (prev: Enemy[]) => Enemy[]) => void;
  setIsPlayerTurn: (turn: boolean) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  applyStatusEffect: (targetId: 'player' | string, effect: { name: StatusEffectName; duration: number; magnitude?: number; chance: number }, sourceId: string) => void;
}

export interface AbilityUseResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
}

/**
 * Use an ability on a target
 * @param abilityId - ID of the ability to use
 * @param targetId - ID of the target (null for self-targeting)
 * @param context - Ability execution context
 * @returns Result of ability usage
 */
export const useAbility = (
  abilityId: string,
  targetId: string | null,
  context: AbilityContext
): AbilityUseResult => {
  const ability = context.player.abilities.find(a => a.id === abilityId);
  
  if (!ability) {
    return {
      success: false,
      message: `Ability ${abilityId} not found.`,
      type: 'error'
    };
  }

  if (context.player.ep < ability.epCost) {
    return {
      success: false,
      message: `Insufficient EP to use ${ability.name}.`,
      type: 'error'
    };
  }

  // Check for silence
  if (ability.tags?.includes('Silence') && context.player.activeStatusEffects.some(eff => eff.name === 'Silenced')) {
    context.addLog('Player', `is Silenced and cannot use this ability!`, 'status');
    context.setIsPlayerTurn(false);
    return {
      success: false,
      message: `Cannot use ${ability.name} while silenced.`,
      type: 'error'
    };
  }

  // Deduct EP cost
  context.setPlayer(prev => ({ ...prev, ep: prev.ep - ability.epCost }));
  context.addLog('Player', `uses ${ability.name}.`, 'action');

  // Determine target
  let targetEntity: Player | Enemy | null = null;
  if (ability.tags?.includes('SelfTarget')) {
    targetEntity = context.player;
    if (ability.effectType === 'TEMP_STAT_BUFF' && ability.targetStatusEffect && ability.duration && ability.magnitude) {
      context.applyStatusEffect('player', { 
        name: ability.targetStatusEffect, 
        duration: ability.duration, 
        magnitude: ability.magnitude, 
        chance: 100 
      }, ability.id);
    }
  } else if (targetId) {
    const foundEnemy = context.currentEnemies.find((e: Enemy) => e.id === targetId);
    if (foundEnemy) {
      targetEntity = foundEnemy;
      if (ability.effectType === 'ENEMY_DEBUFF' && ability.targetStatusEffect && ability.duration) {
        context.applyStatusEffect(targetId, { 
          name: ability.targetStatusEffect, 
          duration: ability.duration, 
          magnitude: ability.magnitude, 
          chance: 100 
        }, ability.id);
      }
    }
  }

  // Apply ability effects
  switch (ability.effectType) {
    case 'MP_RESTORE':
      const mpRestored = Math.min(ability.magnitude || 0, context.effectivePlayerStats.maxMp - context.player.mp);
      if (mpRestored > 0) {
        context.setPlayer(prev => ({ ...prev, mp: prev.mp + mpRestored }));
        context.addLog('Player', `restores ${mpRestored} MP.`, 'resource');
      }
      break;

    case 'SELF_HEAL':
      const hpRestored = Math.min(ability.magnitude || 0, context.effectivePlayerStats.maxHp - context.player.hp);
      if (hpRestored > 0) {
        context.setPlayer(prev => ({ ...prev, hp: prev.hp + hpRestored }));
        context.addLog('Player', `heals for ${hpRestored} HP.`, 'heal');
      }
      break;

    case 'TEMP_STAT_BUFF':
      // Status effect already applied above
      break;

    case 'ENEMY_DEBUFF':
      // Status effect already applied above
      break;
  }

  context.setIsPlayerTurn(false);
  
  return {
    success: true,
    message: `Successfully used ${ability.name}.`,
    type: 'success'
  };
};

/**
 * Check if an ability can be used
 * @param abilityId - ID of the ability to check
 * @param player - Current player state
 * @returns True if ability can be used
 */
export const canUseAbility = (abilityId: string, player: Player): boolean => {
  const ability = player.abilities.find(a => a.id === abilityId);
  if (!ability) return false;
  
  return player.ep >= ability.epCost && 
         !player.activeStatusEffects.some(eff => eff.name === 'Silenced' && ability.tags?.includes('Silence'));
};

/**
 * Get all usable abilities for the player
 * @param player - Current player state
 * @returns Array of abilities that can be used
 */
export const getUsableAbilities = (player: Player): Ability[] => {
  return player.abilities.filter(ability => canUseAbility(ability.id, player));
};

/**
 * Calculate ability effectiveness based on scaling
 * @param ability - The ability to calculate for
 * @param player - Current player state
 * @param effectiveStats - Player's effective stats
 * @returns Calculated magnitude with scaling applied
 */
export const calculateAbilityEffectiveness = (
  ability: Ability, 
  player: Player, 
  effectiveStats: PlayerEffectiveStats
): number => {
  let baseMagnitude = ability.magnitude || 0;
  
  if (ability.scalingFactor && ability.scalesWith) {
    const scalingStatValue = ability.scalesWith === 'Body' ? effectiveStats.body : effectiveStats.mind;
    baseMagnitude += scalingStatValue * ability.scalingFactor;
  }
  
  return Math.floor(baseMagnitude);
};

/**
 * Ability Manager utility functions
 */
export const AbilityManagerUtils = {
  useAbility,
  canUseAbility,
  getUsableAbilities,
  calculateAbilityEffectiveness,
}; 