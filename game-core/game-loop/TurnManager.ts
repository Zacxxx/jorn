import { Player, Enemy, PlayerEffectiveStats, ActiveStatusEffect } from '../../types';

/**
 * Turn Manager Module
 * Handles turn-based combat flow, enemy AI, and status effect processing
 */

export interface TurnContext {
  player: Player;
  currentEnemies: Enemy[];
  effectivePlayerStats: PlayerEffectiveStats;
  turn: number;
  isPlayerTurn: boolean;
  currentActingEnemyIndex: number;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setCurrentEnemies: (updater: (prev: Enemy[]) => Enemy[]) => void;
  setTurn: (updater: (prev: number) => number) => void;
  setIsPlayerTurn: (turn: boolean) => void;
  setCurrentActingEnemyIndex: (index: number) => void;
  setGameState: (state: string) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  calculateDamage: (baseDamage: number, attackerPower: number, defenderDefense: number, effectiveness?: 'normal' | 'weak' | 'resistant') => number;
  applyDamageAndReflection: (target: Player | Enemy, damage: number, attacker: Player | Enemy, logActor: 'Player' | 'Enemy', targetIsPlayer: boolean) => { actualDamageDealt: number; updatedTargetHp: number };
  handleEnemyDefeat: (enemy: Enemy) => void;
}

export interface PlayerTurnStartResult {
  willBeStunnedThisTurn: boolean;
}

/**
 * Process player turn start effects (status effects, DoT, etc.)
 * @param turn - Current turn number
 * @param context - Turn execution context
 * @returns Information about turn start effects
 */
export const processPlayerTurnStartEffects = (
  turn: number,
  context: TurnContext
): PlayerTurnStartResult => {
  let willBeStunnedThisTurn = false;
  let playerCurrentHp = context.player.hp;
  let playerCurrentMp = context.player.mp;
  let playerCurrentEp = context.player.ep;
  let newPlayerActiveEffects: ActiveStatusEffect[] = [];

  context.player.activeStatusEffects.forEach(effect => {
    let effectPersists = true;
    
    switch (effect.name) {
      case 'PoisonDoTActive':
      case 'BurningDoTActive':
      case 'BleedingDoTActive':
      case 'CorruptedDoTActive':
      case 'FrostbittenDoTActive':
      case 'RottingDoTActive':
      case 'ShockedDoTActive':
        if (effect.magnitude) {
          playerCurrentHp -= effect.magnitude;
          context.addLog('Player', `takes ${effect.magnitude} ${effect.name.replace('DoTActive', '')} damage.`, 'damage');
        }
        break;
        
      case 'Regeneration':
        if (effect.magnitude) {
          const healAmount = Math.min(effect.magnitude, context.effectivePlayerStats.maxHp - playerCurrentHp);
          if (healAmount > 0) {
            playerCurrentHp += healAmount;
            context.addLog('Player', `regenerates ${healAmount} HP.`, 'heal');
          }
        }
        break;
        
      case 'Stun':
      case 'Freeze':
      case 'Sleep':
        willBeStunnedThisTurn = true;
        context.addLog('Player', `is ${effect.name.toLowerCase()} and cannot act!`, 'status');
        break;
        
      case 'TEMP_HP_REGEN':
        if (effect.magnitude) {
          const regenAmount = Math.min(effect.magnitude, context.effectivePlayerStats.maxHp - playerCurrentHp);
          if (regenAmount > 0) {
            playerCurrentHp += regenAmount;
            context.addLog('Player', `regenerates ${regenAmount} HP from temporary effect.`, 'heal');
          }
        }
        break;
    }

    // Check if effect expires
    if (effect.duration - 1 <= 0) {
      context.addLog('System', `${effect.name} on Player has worn off.`, 'status');
      effectPersists = false;
    } else {
      newPlayerActiveEffects.push({ ...effect, duration: effect.duration - 1 });
    }
  });

  // Update player state
  context.setPlayer(prev => ({
    ...prev,
    hp: Math.max(0, playerCurrentHp),
    mp: playerCurrentMp,
    ep: playerCurrentEp,
    activeStatusEffects: newPlayerActiveEffects
  }));

  // Check for player death
  if (playerCurrentHp <= 0) {
    context.addLog('System', 'Player succumbed to status effects!', 'info');
    context.setGameState('GAME_OVER_DEFEAT');
  }

  return { willBeStunnedThisTurn };
};

/**
 * Process enemy turn AI and actions
 * @param context - Turn execution context
 */
export const processEnemyTurn = (context: TurnContext): void => {
  if (context.currentEnemies.length === 0 || context.isPlayerTurn) return;

  const actingEnemy = context.currentEnemies[context.currentActingEnemyIndex];
  if (!actingEnemy || actingEnemy.hp <= 0) {
    advanceToNextEnemyOrPlayerTurn(context);
    return;
  }

  // Process enemy status effects
  let enemyCurrentHp = actingEnemy.hp;
  let enemyIsStunned = false;
  let enemyIsSilenced = false;
  let enemyIsRooted = false;
  let newEnemyActiveEffects: ActiveStatusEffect[] = [];

  actingEnemy.activeStatusEffects.forEach(effect => {
    let effectPersists = true;
    
    switch (effect.name) {
      case 'PoisonDoTActive':
      case 'BurningDoTActive':
      case 'BleedingDoTActive':
      case 'CorruptedDoTActive':
      case 'FrostbittenDoTActive':
      case 'RottingDoTActive':
      case 'ShockedDoTActive':
        if (effect.magnitude) {
          enemyCurrentHp -= effect.magnitude;
          context.addLog('Enemy', `${actingEnemy.name} takes ${effect.magnitude} ${effect.name.replace('DoTActive', '')} damage.`, 'damage');
        }
        break;
        
      case 'Stun':
      case 'Freeze':
        enemyIsStunned = true;
        break;
        
      case 'Silenced':
        enemyIsSilenced = true;
        break;
        
      case 'Rooted':
        enemyIsRooted = true;
        break;
    }

    if (effect.duration - 1 <= 0) {
      context.addLog('Enemy', `${effect.name} on ${actingEnemy.name} has worn off.`, 'status');
      effectPersists = false;
    } else {
      newEnemyActiveEffects.push({ ...effect, duration: effect.duration - 1 });
    }
  });

  // Update enemy state
  context.setCurrentEnemies(prev => 
    prev.map(e => e.id === actingEnemy.id ? 
      { ...e, hp: Math.max(0, enemyCurrentHp), activeStatusEffects: newEnemyActiveEffects } : e
    )
  );

  // Check if enemy died from status effects
  if (enemyCurrentHp <= 0) {
    context.addLog('System', `${actingEnemy.name} succumbed to status effects!`, 'info');
    context.handleEnemyDefeat({ ...actingEnemy, hp: enemyCurrentHp });
    advanceToNextEnemyOrPlayerTurn(context);
    return;
  }

  // Execute enemy action
  if (enemyIsStunned) {
    context.addLog('Enemy', `${actingEnemy.name} is stunned and cannot act!`, 'status');
  } else {
    executeEnemyAction(actingEnemy, enemyIsSilenced, context);
  }

  advanceToNextEnemyOrPlayerTurn(context);
};

/**
 * Execute an enemy's action (attack or special ability)
 * @param enemy - The acting enemy
 * @param isSilenced - Whether the enemy is silenced
 * @param context - Turn execution context
 */
const executeEnemyAction = (enemy: Enemy, isSilenced: boolean, context: TurnContext): void => {
  const useSpecial = enemy.specialAbilityName && !isSilenced && Math.random() < 0.5;
  
  if (useSpecial) {
    // Use special ability
    context.addLog('Enemy', `${enemy.name} uses ${enemy.specialAbilityName}!`, 'action');
    const enemyPower = enemy.mind + 5;
    const damageTypeForEnemy = enemy.resistance || 'Arcane';
    const calculatedDamage = context.calculateDamage(10 + enemy.level * 2, enemyPower, context.effectivePlayerStats.defense);
    
    const { actualDamageDealt, updatedTargetHp: playerNewHp } = context.applyDamageAndReflection(
      context.player, 
      calculatedDamage, 
      enemy, 
      'Player', 
      true
    );
    
    context.addLog('Enemy', `deals ${actualDamageDealt} ${damageTypeForEnemy} damage to Player.`, 'damage');
    context.setPlayer(prev => ({ ...prev, hp: playerNewHp }));
    
    if (playerNewHp <= 0) {
      context.setGameState('GAME_OVER_DEFEAT');
      return;
    }
  } else {
    // Basic attack
    if (isSilenced && enemy.specialAbilityName) {
      context.addLog('Enemy', `${enemy.name} is Silenced and resorts to a basic attack!`, 'status');
    } else {
      context.addLog('Enemy', `${enemy.name} attacks Player!`, 'action');
    }
    
    const enemyPower = enemy.body;
    const damageTypeForEnemy = 'PhysicalNeutral';
    const calculatedDamage = context.calculateDamage(5 + enemy.level, enemyPower, context.effectivePlayerStats.defense);
    
    const { actualDamageDealt, updatedTargetHp: playerNewHp } = context.applyDamageAndReflection(
      context.player, 
      calculatedDamage, 
      enemy, 
      'Player', 
      true
    );
    
    context.addLog('Enemy', `deals ${actualDamageDealt} ${damageTypeForEnemy} damage to Player.`, 'damage');
    context.setPlayer(prev => ({ ...prev, hp: playerNewHp }));
    
    if (playerNewHp <= 0) {
      context.setGameState('GAME_OVER_DEFEAT');
      return;
    }
  }
};

/**
 * Advance to the next enemy's turn or back to player turn
 * @param context - Turn execution context
 */
const advanceToNextEnemyOrPlayerTurn = (context: TurnContext): void => {
  const nextIndex = context.currentActingEnemyIndex + 1;
  const livingEnemies = context.currentEnemies.filter(e => e.hp > 0);
  
  if (nextIndex >= context.currentEnemies.length || livingEnemies.length === 0) {
    // End of enemy turns, start new player turn
    context.setTurn(prev => prev + 1);
    context.setIsPlayerTurn(true);
    context.setCurrentActingEnemyIndex(0);
  } else {
    // Move to next enemy
    context.setCurrentActingEnemyIndex(nextIndex);
  }
};

/**
 * Check if combat should end
 * @param context - Turn execution context
 * @returns True if combat should end
 */
export const shouldEndCombat = (context: TurnContext): boolean => {
  const livingEnemies = context.currentEnemies.filter(e => e.hp > 0);
  return livingEnemies.length === 0 || context.player.hp <= 0;
};

/**
 * Turn Manager utility functions
 */
export const TurnManagerUtils = {
  processPlayerTurnStartEffects,
  processEnemyTurn,
  shouldEndCombat,
}; 