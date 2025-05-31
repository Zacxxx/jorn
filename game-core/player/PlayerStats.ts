import { Player, PlayerEffectiveStats, Equipment } from '../../types';
import { 
  BASE_HP, 
  BASE_MP, 
  BASE_EP, 
  HP_PER_LEVEL, 
  MP_PER_LEVEL, 
  EP_PER_LEVEL, 
  HP_PER_BODY, 
  MP_PER_MIND, 
  EP_PER_REFLEX, 
  PLAYER_BASE_SPEED_FROM_REFLEX, 
  SPEED_PER_REFLEX, 
  PHYSICAL_POWER_PER_BODY, 
  MAGIC_POWER_PER_MIND, 
  DEFENSE_PER_BODY, 
  DEFENSE_PER_REFLEX, 
  DEFENDING_DEFENSE_BONUS_PERCENTAGE,
  MAX_SPELLS_PER_LEVEL_BASE,
  PREPARED_SPELLS_PER_LEVEL_BASE,
  PREPARED_ABILITIES_PER_LEVEL_BASE
} from '../../constants';

/**
 * Player Stats Calculation Module
 * Handles calculation of effective player stats including equipment and status effect bonuses
 */

/**
 * Calculate effective player stats including equipment bonuses and status effects
 * @param player - The player object
 * @returns Calculated effective stats
 */
export const calculateEffectiveStats = (player: Player): PlayerEffectiveStats => {
  let effectiveBody = player.body;
  let effectiveMind = player.mind;
  let effectiveReflex = player.reflex;
  let bonusMaxHp = 0;
  let bonusMaxMp = 0;
  let bonusMaxEp = 0;
  let bonusSpeed = 0;
  let effectiveDefense = 0;
  let damageReflectionPercent = 0;

  // Apply equipment bonuses
  Object.values(player.equippedItems).forEach(itemId => {
    if (!itemId) return;
    const item = player.items.find(i => i.id === itemId) as Equipment | undefined;
    if (item && item.itemType === 'Equipment') {
      if (item.statsBoost) {
        effectiveBody += item.statsBoost.body || 0;
        effectiveMind += item.statsBoost.mind || 0;
        effectiveReflex += item.statsBoost.reflex || 0;
        bonusSpeed += item.statsBoost.speed || 0;
        bonusMaxHp += item.statsBoost.maxHp || 0;
        bonusMaxMp += item.statsBoost.maxMp || 0;
        bonusMaxEp += item.statsBoost.maxEp || 0;
      }
      if (item.tags?.includes('DamageReflection')) {
        damageReflectionPercent += item.scalingFactor || 0.1; 
      }
    }
  });

  // Apply status effect bonuses
  player.activeStatusEffects.forEach(effect => {
    if (effect.magnitude) {
      if (effect.name === 'TEMP_BODY_UP' || effect.name === 'StrengthenBody') {
        effectiveBody += effect.magnitude;
      }
      if (effect.name === 'TEMP_MIND_UP' || effect.name === 'StrengthenMind') {
        effectiveMind += effect.magnitude;
      }
      if (effect.name === 'TEMP_REFLEX_UP' || effect.name === 'StrengthenReflex') {
        effectiveReflex += effect.magnitude;
      }
      if (effect.name === 'TEMP_SPEED_UP') {
        bonusSpeed += effect.magnitude;
      }
      if (effect.name === 'WeakenBody') {
        effectiveBody = Math.max(1, effectiveBody - effect.magnitude);
      }
      if (effect.name === 'WeakenMind') {
        effectiveMind = Math.max(1, effectiveMind - effect.magnitude);
      }
      if (effect.name === 'WeakenReflex') {
        effectiveReflex = Math.max(1, effectiveReflex - effect.magnitude);
      }
      if (effect.name === 'TEMP_MAX_HP_UP') {
        bonusMaxHp += effect.magnitude;
      }
      if (effect.name === 'TEMP_MAX_MP_UP') {
        bonusMaxMp += effect.magnitude;
      }
      if (effect.name === 'DamageReflection') { 
        damageReflectionPercent += (effect.magnitude / 100); 
      }
    }
  });

  // Calculate derived stats
  const maxHp = BASE_HP + (player.level * HP_PER_LEVEL) + (effectiveBody * HP_PER_BODY) + bonusMaxHp;
  const maxMp = BASE_MP + (player.level * MP_PER_LEVEL) + (effectiveMind * MP_PER_MIND) + bonusMaxMp;
  const maxEp = BASE_EP + (player.level * EP_PER_LEVEL) + (effectiveReflex * EP_PER_REFLEX) + bonusMaxEp;
  const speed = PLAYER_BASE_SPEED_FROM_REFLEX + (effectiveReflex * SPEED_PER_REFLEX) + bonusSpeed;

  const physicalPower = Math.floor(effectiveBody * PHYSICAL_POWER_PER_BODY);
  const magicPower = Math.floor(effectiveMind * MAGIC_POWER_PER_MIND);
  effectiveDefense = Math.floor(effectiveBody * DEFENSE_PER_BODY + effectiveReflex * DEFENSE_PER_REFLEX);

  // Apply defending bonus if player is defending
  if (player.activeStatusEffects.some(eff => eff.name === 'Defending')) {
    effectiveDefense += Math.floor(effectiveDefense * DEFENDING_DEFENSE_BONUS_PERCENTAGE);
  }

  // Clamp damage reflection percentage
  damageReflectionPercent = Math.max(0, Math.min(1, damageReflectionPercent)); 

  return { 
    maxHp, 
    maxMp, 
    maxEp, 
    speed, 
    body: effectiveBody, 
    mind: effectiveMind, 
    reflex: effectiveReflex, 
    physicalPower, 
    magicPower, 
    defense: effectiveDefense, 
    damageReflectionPercent 
  };
};

/**
 * Calculate maximum number of spells a player can register
 * @param level - Player level
 * @returns Maximum registered spells
 */
export const calculateMaxRegisteredSpells = (level: number): number => {
  return level + MAX_SPELLS_PER_LEVEL_BASE;
};

/**
 * Calculate maximum number of spells a player can prepare
 * @param level - Player level
 * @returns Maximum prepared spells
 */
export const calculateMaxPreparedSpells = (level: number): number => {
  return level + PREPARED_SPELLS_PER_LEVEL_BASE;
};

/**
 * Calculate maximum number of abilities a player can prepare
 * @param level - Player level
 * @returns Maximum prepared abilities
 */
export const calculateMaxPreparedAbilities = (level: number): number => {
  return level + PREPARED_ABILITIES_PER_LEVEL_BASE;
};

/**
 * Get prepared spells from player data
 * @param player - Player object
 * @returns Array of prepared spells
 */
export const getPreparedSpells = (player: Player) => {
  return player.spells.filter(spell => player.preparedSpellIds.includes(spell.id));
};

/**
 * Get prepared abilities from player data
 * @param player - Player object
 * @returns Array of prepared abilities
 */
export const getPreparedAbilities = (player: Player) => {
  return player.abilities.filter(ability => player.preparedAbilityIds.includes(ability.id));
};

/**
 * Update player's current stats based on effective stats
 * Used to sync current HP/MP/EP with calculated maximums
 * @param player - Current player state
 * @param effectiveStats - Calculated effective stats
 * @returns Updated player object
 */
export const updatePlayerCurrentStats = (player: Player, effectiveStats: PlayerEffectiveStats): Player => {
  return {
    ...player,
    maxHp: effectiveStats.maxHp,
    hp: player.hp === 0 || player.hp > effectiveStats.maxHp || (player.maxHp === 0 && effectiveStats.maxHp > 0) 
      ? effectiveStats.maxHp 
      : player.hp,
    maxMp: effectiveStats.maxMp,
    mp: player.mp === 0 || player.mp > effectiveStats.maxMp || (player.maxMp === 0 && effectiveStats.maxMp > 0) 
      ? effectiveStats.maxMp 
      : player.mp,
    maxEp: effectiveStats.maxEp,
    ep: player.ep === 0 || player.ep > effectiveStats.maxEp || (player.maxEp === 0 && effectiveStats.maxEp > 0) 
      ? effectiveStats.maxEp 
      : player.ep,
    speed: effectiveStats.speed,
  };
}; 