import { 
  Player, 
  Enemy, 
  Spell, 
  TagName, 
  PlayerEffectiveStats,
  CombatActionLog,
  GameState, // Added GameState
  ResourceCost // Added ResourceCost
} from '../../types'; // Adjusted path assuming types.ts is now in src
import { getEffectiveTags } from '../spells/TagSystem';
import {
  ENEMY_DIFFICULTY_XP_REWARD,
  BATTLE_RESOURCE_REWARD_TYPES,
  BATTLE_RESOURCE_REWARD_QUANTITY_MIN,
  BATTLE_RESOURCE_REWARD_QUANTITY_MAX
} from '../../constants'; // Adjusted path assuming constants.ts is at root
import { ResourceManagerUtils } from '../resources/ResourceManager';

/**
 * Combat Engine Module
 * Handles core combat mechanics, damage calculation, and spell application
 */

export interface DamageResult {
  actualDamageDealt: number;
  updatedTargetHp: number;
}

export interface SpellApplicationResult {
  updatedTargetHp?: number;
  synergyBonusAppliedInThisHit: boolean;
}

export interface TagDamageModifierResult {
  damage: number;
  synergyBonusApplied: boolean;
}

export interface CombatContext {
  player: Player;
  currentEnemies: Enemy[];
  effectivePlayerStats: PlayerEffectiveStats;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type?: string) => void; // type is string to match App.tsx more generically
  setPlayer: (updater: (prev: Player) => Player) => void;
  setCurrentEnemies: (updater: (prev: Enemy[]) => Enemy[]) => void;
  setModalContent: (content: { title: string; message: string; type: 'info' | 'error' | 'success' } | null) => void; // Allow null
  setGameState: (state: GameState | string) => void; // Allow string for flexibility, ideally GameState
  handleEnemyDefeat: (enemy: Enemy) => void; // This will be replaced by the centralized one
}

// New context for the centralized handleEnemyDefeat
export interface EnemyDefeatContext {
  player: Player;
  defeatedEnemy: Enemy;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>; // Matching App.tsx state setter type
  setCurrentEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>; // Matching App.tsx state setter type
  addLog: (actor: string, message: string, type?: string) => void;
  showMessageModal: (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  setGameState: (gameState: GameState) => void;
  currentEnemiesList: Enemy[]; // Pass the current list to check for victory
}

/**
 * Calculate damage with all modifiers applied
 * @param baseDamage - Base damage value
 * @param attackerPower - Attacker's power stat
 * @param defenderDefense - Defender's defense stat
 * @param effectiveness - Elemental effectiveness
 * @param scalingFactor - Spell scaling factor
 * @param scalingStatValue - Value of the scaling stat
 * @returns Final damage amount
 */
export const calculateDamage = (
  baseDamage: number, 
  attackerPower: number, 
  defenderDefense: number, 
  effectiveness: 'normal' | 'weak' | 'resistant' = 'normal', 
  scalingFactor: number = 0, 
  scalingStatValue: number = 0
): number => {
  // Updated to simpler formula from App.tsx enemy turn context for now
  let damage = baseDamage + Math.floor(attackerPower * 0.5);
  const defenseMitigation = Math.floor(defenderDefense * 0.3);
  damage = Math.max(1, damage - defenseMitigation);

  if (effectiveness === 'weak') {
    damage = Math.floor(damage * 1.5);
  } else if (effectiveness === 'resistant') {
    damage = Math.floor(damage * 0.5);
  }
  // scalingFactor and scalingStatValue are not used in this simplified version yet
  return damage;
};

/**
 * Apply damage and handle damage reflection
 * @param target - Target receiving damage
 * @param damage - Damage amount
 * @param attacker - Entity dealing damage
 * @param context - Combat context
 * @param targetIsPlayer - Whether target is the player
 * @returns Damage result with reflection applied
 */
export const applyDamageAndReflection = (
  target: Player | Enemy,
  damage: number,
  attacker: Player | Enemy,
  context: CombatContext,
  targetIsPlayer: boolean
): DamageResult => {
  let actualDamageDealt = damage;
  let updatedTargetHp = target.hp - actualDamageDealt;
  let reflectionPercent = 0;

  if (targetIsPlayer) {
    reflectionPercent = context.effectivePlayerStats.damageReflectionPercent || 0;
  } else { 
    const enemyTarget = target as Enemy;
    reflectionPercent = enemyTarget.activeStatusEffects.find(eff => eff.name === 'DamageReflection')?.magnitude || 0; 
  }

  if (reflectionPercent > 0) {
    const reflectedDamage = Math.floor(actualDamageDealt * reflectionPercent);
    if (reflectedDamage > 0) {
      const reflectorName = targetIsPlayer ? context.player.name : (target as Enemy).name;
      const reflectTargetName = !targetIsPlayer ? context.player.name : (attacker as Enemy).name;
      context.addLog('Player', `${reflectorName} reflects ${reflectedDamage} damage back to ${reflectTargetName}!`, 'damage');
      
      if (targetIsPlayer) { 
        const enemyAttacker = attacker as Enemy;
        context.setCurrentEnemies(prevEnemies => 
          prevEnemies.map(e => e.id === enemyAttacker.id ? {...e, hp: Math.max(0, e.hp - reflectedDamage)} : e)
        );
        if (enemyAttacker.hp - reflectedDamage <= 0 && !context.currentEnemies.find(e => e.id === enemyAttacker.id && e.hp <= 0)) { 
          context.handleEnemyDefeat({...enemyAttacker, hp: enemyAttacker.hp - reflectedDamage});
        }
      } else { 
        context.setPlayer(prevPlayer => {
          const newPlayerHp = Math.max(0, prevPlayer.hp - reflectedDamage);
          if (newPlayerHp <= 0) {
            context.setModalContent({ title: "Defeat!", message: "Slain by reflected damage.", type: 'error' });
            context.setGameState('GAME_OVER_DEFEAT');
          }
          return {...prevPlayer, hp: newPlayerHp};
        });
      }
    }
  }
  return { actualDamageDealt, updatedTargetHp };
};

/**
 * Apply tag-based damage modifiers
 * @param damage - Base damage
 * @param effectiveTags - Effective spell tags
 * @param enemy - Target enemy
 * @param synergyAlreadyAppliedThisCast - Whether synergy bonus was already applied
 * @returns Modified damage and synergy status
 */
export const applyTagDamageModifiers = (
  damage: number,
  effectiveTags: TagName[],
  enemy: Enemy,
  synergyAlreadyAppliedThisCast: boolean
): TagDamageModifierResult => {
  let modifiedDamage = damage;
  let synergyBonusApplied = false;

  // Critical hit chance
  if (effectiveTags.includes('Critical') && Math.random() < 0.3) {
    modifiedDamage *= 2;
  }

  // Damage amplification tags
  if (effectiveTags.includes('Overwhelming')) {
    modifiedDamage *= 1.5;
  }

  if (effectiveTags.includes('Empowerment')) {
    modifiedDamage *= 1.3;
  }

  // Synergy bonus (once per cast)
  if (effectiveTags.includes('Synergy') && !synergyAlreadyAppliedThisCast) {
    modifiedDamage *= 1.25;
    synergyBonusApplied = true;
  }

  // Conditional damage modifiers
  if (effectiveTags.includes('Brutal') && enemy.hp < enemy.maxHp * 0.25) {
    modifiedDamage *= 2;
  }

  if (effectiveTags.includes('Devastating') && enemy.hp === enemy.maxHp) {
    modifiedDamage *= 1.8;
  }

  // Damage over time amplification
  if (effectiveTags.includes('Ramping')) {
    const dotEffects = enemy.activeStatusEffects.filter(eff => 
      eff.name.includes('DoTActive')
    ).length;
    if (dotEffects > 0) {
      modifiedDamage *= (1 + dotEffects * 0.2);
    }
  }

  return { 
    damage: Math.floor(modifiedDamage), 
    synergyBonusApplied 
  };
};

/**
 * Get elemental effectiveness multiplier
 * @param effectiveTags - Effective spell tags
 * @param enemy - Target enemy
 * @returns Effectiveness multiplier
 */
export const getElementalEffectiveness = (effectiveTags: TagName[], enemy: Enemy): number => {
  let effectiveness = 1.0;

  // Check for elemental tags and enemy resistances/weaknesses
  const elementalTags = effectiveTags.filter(tag => 
    ['Fire', 'Ice', 'Lightning', 'Earth', 'Air', 'Dark', 'Light', 'Poison', 'Arcane'].includes(tag)
  );

  elementalTags.forEach(tag => {
    if (enemy.weakness && enemy.weakness.includes(tag)) {
      effectiveness *= 1.5;
    } else if (enemy.resistance && enemy.resistance.includes(tag)) {
      effectiveness *= 0.5;
    }
  });

  // Special effectiveness modifiers
  if (effectiveTags.includes('Resonance')) {
    effectiveness *= 1.2;
  }

  if (effectiveTags.includes('Penetrating') && effectiveness > 1.0) {
    effectiveness *= 1.3;
  }

  return effectiveness;
};

/**
 * Apply spell effects to an enemy target
 * @param spell - Spell being cast
 * @param enemy - Target enemy
 * @param powerMultiplier - Power multiplier for multi-target spells
 * @param effectiveSpellTags - Effective spell tags
 * @param synergyAlreadyAppliedThisCast - Whether synergy was already applied
 * @param context - Combat context
 * @returns Application result
 */
export const applySpellToEnemy = (
  spell: Spell, 
  enemy: Enemy, 
  powerMultiplier: number = 1.0, 
  effectiveSpellTags: TagName[], 
  synergyAlreadyAppliedThisCast: boolean,
  context: CombatContext
): SpellApplicationResult => {
  let synergyBonusJustApplied = false;
  
  if (spell.damage <= 0 && !effectiveSpellTags.some(tag => tag === 'Healing' || tag === 'Shield')) {
    return { synergyBonusAppliedInThisHit: false };
  }

  const scalingStatValue = spell.scalesWith === 'Mind' ? context.effectivePlayerStats.mind : 
                          spell.scalesWith === 'Body' ? context.effectivePlayerStats.body : 0;
  const attackerPower = spell.scalesWith === 'Body' ? context.effectivePlayerStats.physicalPower : 
                       context.effectivePlayerStats.magicPower;
  
  let baseDamage = calculateDamage(
    spell.damage * powerMultiplier, 
    attackerPower, 
    enemy.mind, 
    'normal', 
    spell.scalingFactor, 
    scalingStatValue
  );
  
  const damageModifiersResult = applyTagDamageModifiers(baseDamage, effectiveSpellTags, enemy, synergyAlreadyAppliedThisCast);
  baseDamage = damageModifiersResult.damage;
  if (damageModifiersResult.synergyBonusApplied) {
    synergyBonusJustApplied = true;
  }
  
  const elementalEffectiveness = getElementalEffectiveness(effectiveSpellTags, enemy);
  baseDamage = Math.floor(baseDamage * elementalEffectiveness);
  
  // Apply armor/defense modifiers
  if (effectiveSpellTags.includes('Armor_Ignoring') || effectiveSpellTags.includes('True_Damage')) {
    // No change to baseDamage from enemy defenses
  } else if (effectiveSpellTags.includes('Piercing')) {
    baseDamage = Math.max(1, Math.floor(baseDamage - (enemy.mind * 0.5)));
  } else {
    const effectivenessType = enemy.weakness === spell.damageType ? 'weak' : 
                             enemy.resistance === spell.damageType ? 'resistant' : 'normal';
    if (effectivenessType === 'weak') baseDamage = Math.floor(baseDamage * 1.5);
    else if (effectivenessType === 'resistant') baseDamage = Math.floor(baseDamage * 0.5);
  }
  
  const damageResult = applyDamageAndReflection(enemy, baseDamage, context.player, context, false);
  const actualDamage = damageResult.actualDamageDealt;
  
  context.addLog('Player', `deals ${actualDamage} ${spell.damageType} damage to ${enemy.name}.`, 'damage');
  context.setCurrentEnemies(prevEnemies => 
    prevEnemies.map(e => e.id === enemy.id ? { ...e, hp: Math.max(0, damageResult.updatedTargetHp) } : e)
  );
  
  // Handle lifesteal
  if (effectiveSpellTags.includes('Lifesteal') || effectiveSpellTags.includes('Vampiric')) {
    const healPercent = effectiveSpellTags.includes('Vampiric') ? 0.5 : 0.25;
    const healAmount = Math.floor(actualDamage * healPercent);
    if (healAmount > 0) {
      context.setPlayer(prev => ({ 
        ...prev, 
        hp: Math.min(context.effectivePlayerStats.maxHp, prev.hp + healAmount) 
      }));
      context.addLog('Player', `heals ${healAmount} HP from lifesteal.`, 'heal');
    }
  }

  return { 
    updatedTargetHp: damageResult.updatedTargetHp, 
    synergyBonusAppliedInThisHit: synergyBonusJustApplied 
  };
};

/**
 * Apply spell effects to the player (self-targeting)
 * @param spell - Spell being cast
 * @param effectiveSpellTags - Effective spell tags
 * @param context - Combat context
 */
export const applySpellToSelf = (
  spell: Spell, 
  effectiveSpellTags: TagName[],
  context: CombatContext
): void => {
  if (spell.damageType === 'HealingSource' || effectiveSpellTags.includes('Healing')) {
    const healAmount = spell.damage || 0;
    const scalingStatValue = spell.scalesWith === 'Mind' ? context.effectivePlayerStats.mind : 
                            spell.scalesWith === 'Body' ? context.effectivePlayerStats.body : 0;
    const finalHealAmount = healAmount + (scalingStatValue * (spell.scalingFactor || 0));
    
    context.setPlayer(prev => ({ 
      ...prev, 
      hp: Math.min(context.effectivePlayerStats.maxHp, prev.hp + finalHealAmount) 
    }));
    context.addLog('Player', `heals ${finalHealAmount} HP.`, 'heal');
  }

  // Handle shield effects
  if (effectiveSpellTags.includes('Shield')) {
    // TODO: Implement shield mechanics when status effects support it
    context.addLog('Player', 'gains a protective shield.', 'status');
  }

  // Handle buff effects
  if (effectiveSpellTags.includes('Enhancement')) {
    // TODO: Implement buff mechanics
    context.addLog('Player', 'gains beneficial effects.', 'status');
  }
};

/**
 * Execute a player attack with a spell
 * @param spell - Spell to cast
 * @param targetId - ID of target enemy
 * @param context - Combat context
 * @returns Whether the attack was successful
 */
export const executePlayerAttack = (
  spell: Spell,
  targetId: string,
  context: CombatContext
): boolean => {
  const targetEnemy = context.currentEnemies.find(e => e.id === targetId);
  let hasSynergyBonusAppliedThisCast = false;

  // Get effective tags before any checks
  const effectiveSpellTags = getEffectiveTags(spell.tags);

  if (!targetEnemy || context.player.mp < spell.manaCost) {
    context.addLog('Player', `cannot cast ${spell.name} (insufficient MP or no target).`, 'error');
    return false;
  }

  // Enhanced silence and control checks
  if (context.player.activeStatusEffects.some(eff => ['Silenced', 'Stun', 'Sleep'].includes(eff.name))) {
    const statusEffect = context.player.activeStatusEffects.find(eff => ['Silenced', 'Stun', 'Sleep'].includes(eff.name));
    context.addLog('Player', `cannot cast spells due to ${statusEffect?.name}!`, 'status');
    return false;
  }

  // Calculate actual mana cost with tag modifiers
  let actualManaCost = spell.manaCost;
  if (effectiveSpellTags.includes('Reduced_Cost')) {
    actualManaCost = Math.floor(actualManaCost * 0.7);
  }
  if (effectiveSpellTags.includes('Free_Cast') && Math.random() < 0.3) {
    actualManaCost = 0;
    context.addLog('System', 'Free cast activated!', 'success');
  }

  // Check MP again after cost modification
  if (context.player.mp < actualManaCost && !effectiveSpellTags.includes('Blood_Magic')) {
    context.addLog('Player', `cannot cast ${spell.name} (insufficient MP after modifiers).`, 'error');
    return false;
  }

  // Handle blood magic
  if (effectiveSpellTags.includes('Blood_Magic')) {
    const healthCost = Math.floor(spell.manaCost * 0.5);
    if (context.player.hp <= healthCost && actualManaCost > 0) {
      context.addLog('Player', `cannot cast ${spell.name} (not enough HP for Blood Magic).`, 'error');
      return false;
    }
    context.setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - healthCost) }));
    if (actualManaCost > 0) {
      context.setPlayer(prev => ({ ...prev, mp: prev.mp - Math.floor(actualManaCost * 0.5) }));
    }
    context.addLog('System', `Blood magic: ${healthCost} health sacrificed for ${spell.name}.`, 'warning');
  } else {
    context.setPlayer(prev => ({ ...prev, mp: prev.mp - actualManaCost }));
  }

  context.addLog('Player', `casts ${spell.name} on ${targetEnemy.name}. Effective Tags: [${effectiveSpellTags.join(', ')}]`, 'action');

  // Determine all targets based on targeting tags
  let targets: Enemy[] = [];
  if (effectiveSpellTags.includes('SingleTarget') || (!effectiveSpellTags.some(tag => ['MultiTarget', 'AreaOfEffect', 'GlobalTarget', 'RandomTarget'].includes(tag)))) {
    targets = [targetEnemy];
  } else if (effectiveSpellTags.includes('MultiTarget')) {
    targets = context.currentEnemies.slice(0, 3);
  } else if (effectiveSpellTags.includes('AreaOfEffect')) {
    targets = [...context.currentEnemies];
  } else if (effectiveSpellTags.includes('GlobalTarget')) {
    targets = [...context.currentEnemies];
  } else if (effectiveSpellTags.includes('RandomTarget')) {
    const count = effectiveSpellTags.includes('Chain') ? 3 : 1;
    targets = [...context.currentEnemies].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // Apply spell to each target
  targets.forEach((enemy, index) => {
    const powerMultiplier = effectiveSpellTags.includes('MultiTarget') ? Math.max(0.4, 1 - index * 0.2) : 1.0;
    const result = applySpellToEnemy(spell, enemy, powerMultiplier, effectiveSpellTags, hasSynergyBonusAppliedThisCast, context);
    if (result.synergyBonusAppliedInThisHit) {
      hasSynergyBonusAppliedThisCast = true;
    }
  });

  // Handle self-target effects
  if (effectiveSpellTags.includes('SelfTarget') || spell.damageType === 'HealingSource') {
    applySpellToSelf(spell, effectiveSpellTags, context);
  }

  // Check for enemy defeats
  targets.forEach(enemy => {
    const updatedEnemy = context.currentEnemies.find(e => e.id === enemy.id);
    if (updatedEnemy && updatedEnemy.hp <= 0 && !context.currentEnemies.find(e => e.id === updatedEnemy.id && e.hp <= 0)) {
      context.handleEnemyDefeat(updatedEnemy);
    }
  });

  return true;
};

/**
 * Combat Engine utility functions
 */
export const CombatEngineUtils = {
  calculateDamage,
  applyDamageAndReflection,
  applyTagDamageModifiers,
  getElementalEffectiveness,
  applySpellToEnemy,
  applySpellToSelf,
  executePlayerAttack,
  applyDamage, // Added new applyDamage
  handleEnemyDefeat, // Export the new centralized function
};

// New simplified applyDamage function (as per subtask description)
// The existing applyDamageAndReflection will be kept for player attacks or more complex scenarios.
export const applyDamage = (
  target: Player | Enemy,
  damage: number
): { actualDamageDealt: number; updatedTargetHp: number } => {
  const actualDamageDealt = damage; // No reflection considered in this simplified version
  const updatedTargetHp = Math.max(0, target.hp - actualDamageDealt);
  // Note: This function does NOT modify the target object directly. It returns values.
  return { actualDamageDealt, updatedTargetHp };
};

export const handleEnemyDefeat = (context: EnemyDefeatContext): void => {
  const {
    player,
    defeatedEnemy,
    setPlayer,
    setCurrentEnemies,
    addLog,
    showMessageModal,
    setGameState,
    currentEnemiesList // This is the list *before* removing the current defeatedEnemy
  } = context;

  const difficultyBracket = defeatedEnemy.isElite ? 'elite' :
                           (defeatedEnemy.level > player.level + 2 ? 'hard' :
                           (defeatedEnemy.level < player.level - 2 ? 'easy' : 'medium'));

  const baseRewardsKey = difficultyBracket === 'elite' ? 'hard' : difficultyBracket; // Elite uses 'hard' for base then applies multiplier
  const baseRewards = ENEMY_DIFFICULTY_XP_REWARD[baseRewardsKey] || ENEMY_DIFFICULTY_XP_REWARD.medium;

  let goldReward = Math.floor(Math.random() * (defeatedEnemy.goldDrop?.max ?? baseRewards.goldMax)) + (defeatedEnemy.goldDrop?.min ?? baseRewards.goldMin);
  let essenceReward = Math.floor(Math.random() * (defeatedEnemy.essenceDrop?.max ?? baseRewards.essenceMax)) + (defeatedEnemy.essenceDrop?.min ?? baseRewards.essenceMin);
  let xpReward = baseRewards.xp; // XP multiplier for elite is applied below

  if (defeatedEnemy.isElite && ENEMY_DIFFICULTY_XP_REWARD.elite) {
    goldReward = Math.floor(goldReward * ENEMY_DIFFICULTY_XP_REWARD.elite.gold_multiplier);
    essenceReward = Math.floor(essenceReward * ENEMY_DIFFICULTY_XP_REWARD.elite.essence_multiplier);
    xpReward = Math.floor(xpReward * ENEMY_DIFFICULTY_XP_REWARD.elite.xp_multiplier);
  }

  let droppedResourceMessages: string[] = [];
  const resourcesToGive: { itemId: string, quantity: number }[] = [];

  if (defeatedEnemy.droppedResources && defeatedEnemy.droppedResources.length > 0) {
    defeatedEnemy.droppedResources.forEach(res => {
      resourcesToGive.push({ itemId: res.itemId, quantity: res.quantity });
      const resourceName = ResourceManagerUtils.getResourceNameById(res.itemId);
      droppedResourceMessages.push(`${res.quantity} ${resourceName || res.itemId}`);
    });
  } else {
    const numResourceTypesToDrop = Math.floor(Math.random() * (BATTLE_RESOURCE_REWARD_TYPES + 1));
    for (let i = 0; i < numResourceTypesToDrop; i++) {
      const randomResource = ResourceManagerUtils.getRandomResource();
      if (randomResource) {
        const quantity = Math.floor(Math.random() * (BATTLE_RESOURCE_REWARD_QUANTITY_MAX - BATTLE_RESOURCE_REWARD_QUANTITY_MIN + 1)) + BATTLE_RESOURCE_REWARD_QUANTITY_MIN;
        resourcesToGive.push({ itemId: randomResource.id, quantity });
        droppedResourceMessages.push(`${quantity} ${randomResource.name}`);
      }
    }
  }

  setPlayer(prev => {
    const newInventory = { ...prev.inventory };
    resourcesToGive.forEach(drop => {
      newInventory[drop.itemId] = (newInventory[drop.itemId] || 0) + drop.quantity;
    });

    let newXp = prev.xp + xpReward;
    let newLevel = prev.level;
    let newXpToNext = prev.xpToNextLevel;
    if (newXp >= prev.xpToNextLevel) {
        newLevel += 1;
        newXpToNext = Math.floor(prev.xpToNextLevel * 1.5);
        addLog('System', `Level Up! Reached level ${newLevel}!`, 'success');
    }

    return {
      ...prev,
      gold: prev.gold + goldReward,
      essence: prev.essence + essenceReward,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
      inventory: newInventory,
      bestiary: {
        ...prev.bestiary,
        [defeatedEnemy.id]: {
          ...(prev.bestiary[defeatedEnemy.id] || { id: defeatedEnemy.id, name: defeatedEnemy.name, iconName: defeatedEnemy.iconName, description: defeatedEnemy.description }),
          vanquishedCount: (prev.bestiary[defeatedEnemy.id]?.vanquishedCount || 0) + 1,
          level: defeatedEnemy.level,
          weakness: defeatedEnemy.weakness,
          resistance: defeatedEnemy.resistance,
          specialAbilityName: defeatedEnemy.specialAbilityName,
        },
      },
    };
  });

  let rewardMessage = `${defeatedEnemy.name} defeated! Gained ${xpReward} XP, ${goldReward} gold, and ${essenceReward} essence.`;
  if (droppedResourceMessages.length > 0) {
    rewardMessage += ` Obtained: ${droppedResourceMessages.join(', ')}.`;
  }
  addLog('System', rewardMessage, 'success');

  // Remove defeated enemy from the perspective of the caller who holds the full list
  const updatedEnemiesListAfterCurrentDefeat = currentEnemiesList.filter(e => e.id !== defeatedEnemy.id);
  setCurrentEnemies(updatedEnemiesListAfterCurrentDefeat);

  // Check for victory using the just updated list
  if (updatedEnemiesListAfterCurrentDefeat.length === 0 || updatedEnemiesListAfterCurrentDefeat.every(e => e.hp <= 0)) {
    setTimeout(() => {
      addLog('System', 'Victory! All enemies defeated.', 'success');
      showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
      setGameState('GAME_OVER_VICTORY');
    }, 100); // Delay to allow reward log to appear first
  }
}; 