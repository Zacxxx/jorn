import { Player, Enemy, PlayerEffectiveStats, UniqueConsumable, MasterConsumableItem, StatusEffectName } from '../../types';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

/**
 * Consumables Hook Module
 * Handles consumable item usage and effects
 */

export interface ConsumableContext {
  player: Player;
  currentEnemies: Enemy[];
  effectivePlayerStats: PlayerEffectiveStats;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setCurrentEnemies: (updater: (prev: Enemy[]) => Enemy[]) => void;
  setIsPlayerTurn: (turn: boolean) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  applyStatusEffect: (targetId: 'player' | string, effect: { name: StatusEffectName; duration: number; magnitude?: number; chance: number }, sourceId: string) => void;
}

export interface ConsumableUseResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
  effectApplied?: string;
}

/**
 * Use a consumable item
 * @param itemId - ID of the consumable to use
 * @param targetId - ID of the target (null for self-targeting)
 * @param context - Consumable execution context
 * @returns Result of consumable usage
 */
export const useConsumable = (
  itemId: string,
  targetId: string | null,
  context: ConsumableContext
): ConsumableUseResult => {
  let itemUsed: UniqueConsumable | MasterConsumableItem | undefined;
  let isStackable = false;

  // Find the consumable item
  const uniqueItem = context.player.items.find(i => i.id === itemId && i.itemType === 'Consumable') as UniqueConsumable | undefined;
  if (uniqueItem) {
    itemUsed = uniqueItem;
  } else {
    const masterItemDef = MASTER_ITEM_DEFINITIONS[itemId] as MasterConsumableItem | undefined;
    if (masterItemDef && masterItemDef.itemType === 'Consumable' && (context.player.inventory[itemId] || 0) > 0) {
      itemUsed = masterItemDef;
      isStackable = true;
    }
  }

  if (!itemUsed) {
    return {
      success: false,
      message: `Could not find or use item ${itemId}.`,
      type: 'error'
    };
  }

  context.addLog('Player', `uses ${itemUsed.name}.`, 'action');

  // Apply consumable effects
  let effectApplied = '';
  
  switch (itemUsed.effectType) {
    case 'HP_RESTORE':
      const hpRestored = Math.min(itemUsed.magnitude || 0, context.effectivePlayerStats.maxHp - context.player.hp);
      if (hpRestored > 0) {
        context.setPlayer(prev => ({ ...prev, hp: prev.hp + hpRestored }));
        context.addLog('Player', `restores ${hpRestored} HP.`, 'heal');
        effectApplied = `Restored ${hpRestored} HP`;
      } else {
        effectApplied = 'HP already at maximum';
      }
      break;

    case 'MP_RESTORE':
      const mpRestored = Math.min(itemUsed.magnitude || 0, context.effectivePlayerStats.maxMp - context.player.mp);
      if (mpRestored > 0) {
        context.setPlayer(prev => ({ ...prev, mp: prev.mp + mpRestored }));
        context.addLog('Player', `restores ${mpRestored} MP.`, 'resource');
        effectApplied = `Restored ${mpRestored} MP`;
      } else {
        effectApplied = 'MP already at maximum';
      }
      break;

    case 'EP_RESTORE':
      const epRestored = Math.min(itemUsed.magnitude || 0, context.effectivePlayerStats.maxEp - context.player.ep);
      if (epRestored > 0) {
        context.setPlayer(prev => ({ ...prev, ep: prev.ep + epRestored }));
        context.addLog('Player', `restores ${epRestored} EP.`, 'resource');
        effectApplied = `Restored ${epRestored} EP`;
      } else {
        effectApplied = 'EP already at maximum';
      }
      break;

    case 'CURE_STATUS':
      if (itemUsed.statusToCure) {
        const hadEffect = context.player.activeStatusEffects.some(eff => eff.name === itemUsed.statusToCure);
        if (hadEffect) {
          context.setPlayer(prev => ({
            ...prev,
            activeStatusEffects: prev.activeStatusEffects.filter(eff => eff.name !== itemUsed!.statusToCure)
          }));
          context.addLog('Player', `is cured of ${itemUsed.statusToCure}.`, 'status');
          effectApplied = `Cured ${itemUsed.statusToCure}`;
        } else {
          effectApplied = `No ${itemUsed.statusToCure} to cure`;
        }
      }
      break;

    case 'APPLY_BUFF':
      if (itemUsed.buffToApply && itemUsed.duration) {
        context.applyStatusEffect('player', {
          name: itemUsed.buffToApply,
          duration: itemUsed.duration,
          magnitude: itemUsed.magnitude,
          chance: 100
        }, itemUsed.id);
        effectApplied = `Applied ${itemUsed.buffToApply} for ${itemUsed.duration} turns`;
      }
      break;

    default:
      effectApplied = 'Unknown effect';
      break;
  }

  // Remove the consumed item
  if (isStackable) {
    context.setPlayer(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) - 1 }
    }));
  } else {
    context.setPlayer(prev => ({ 
      ...prev, 
      items: prev.items.filter(i => i.id !== itemId) 
    }));
  }

  context.setIsPlayerTurn(false);

  return {
    success: true,
    message: `Successfully used ${itemUsed.name}.`,
    type: 'success',
    effectApplied
  };
};

/**
 * Check if a consumable can be used
 * @param itemId - ID of the consumable to check
 * @param player - Current player state
 * @returns True if consumable can be used
 */
export const canUseConsumable = (itemId: string, player: Player): boolean => {
  // Check unique items
  const uniqueItem = player.items.find(i => i.id === itemId && i.itemType === 'Consumable');
  if (uniqueItem) return true;

  // Check stackable items
  const masterItemDef = MASTER_ITEM_DEFINITIONS[itemId];
  if (masterItemDef && masterItemDef.itemType === 'Consumable' && (player.inventory[itemId] || 0) > 0) {
    return true;
  }

  return false;
};

/**
 * Get all usable consumables for the player
 * @param player - Current player state
 * @returns Array of consumable items that can be used
 */
export const getUsableConsumables = (player: Player): Array<UniqueConsumable | MasterConsumableItem> => {
  const usableConsumables: Array<UniqueConsumable | MasterConsumableItem> = [];

  // Add unique consumables
  player.items.forEach(item => {
    if (item.itemType === 'Consumable') {
      usableConsumables.push(item as UniqueConsumable);
    }
  });

  // Add stackable consumables
  Object.entries(player.inventory).forEach(([itemId, quantity]) => {
    if (quantity > 0) {
      const masterItem = MASTER_ITEM_DEFINITIONS[itemId];
      if (masterItem && masterItem.itemType === 'Consumable') {
        usableConsumables.push(masterItem as MasterConsumableItem);
      }
    }
  });

  return usableConsumables;
};

/**
 * Get consumable effectiveness preview
 * @param itemId - ID of the consumable
 * @param player - Current player state
 * @param effectiveStats - Player's effective stats
 * @returns Preview of what the consumable would do
 */
export const getConsumablePreview = (
  itemId: string,
  player: Player,
  effectiveStats: PlayerEffectiveStats
): string => {
  let item: UniqueConsumable | MasterConsumableItem | undefined;

  // Find the item
  const uniqueItem = player.items.find(i => i.id === itemId && i.itemType === 'Consumable') as UniqueConsumable | undefined;
  if (uniqueItem) {
    item = uniqueItem;
  } else {
    const masterItem = MASTER_ITEM_DEFINITIONS[itemId] as MasterConsumableItem | undefined;
    if (masterItem && masterItem.itemType === 'Consumable') {
      item = masterItem;
    }
  }

  if (!item) return 'Item not found';

  switch (item.effectType) {
    case 'HP_RESTORE':
      const hpWouldRestore = Math.min(item.magnitude || 0, effectiveStats.maxHp - player.hp);
      return `Would restore ${hpWouldRestore} HP (${item.magnitude} max)`;

    case 'MP_RESTORE':
      const mpWouldRestore = Math.min(item.magnitude || 0, effectiveStats.maxMp - player.mp);
      return `Would restore ${mpWouldRestore} MP (${item.magnitude} max)`;

    case 'EP_RESTORE':
      const epWouldRestore = Math.min(item.magnitude || 0, effectiveStats.maxEp - player.ep);
      return `Would restore ${epWouldRestore} EP (${item.magnitude} max)`;

    case 'CURE_STATUS':
      const hasStatus = player.activeStatusEffects.some(eff => eff.name === item.statusToCure);
      return hasStatus ? `Would cure ${item.statusToCure}` : `No ${item.statusToCure} to cure`;

    case 'APPLY_BUFF':
      return `Would apply ${item.buffToApply} for ${item.duration} turns`;

    default:
      return 'Unknown effect';
  }
};

/**
 * Get consumables by effect type
 * @param player - Current player state
 * @param effectType - Type of effect to filter by
 * @returns Array of consumables with the specified effect
 */
export const getConsumablesByEffect = (
  player: Player,
  effectType: 'HP_RESTORE' | 'MP_RESTORE' | 'EP_RESTORE' | 'CURE_STATUS' | 'APPLY_BUFF'
): Array<UniqueConsumable | MasterConsumableItem> => {
  return getUsableConsumables(player).filter(item => item.effectType === effectType);
};

/**
 * Consumables utility functions
 */
export const ConsumablesUtils = {
  useConsumable,
  canUseConsumable,
  getUsableConsumables,
  getConsumablePreview,
  getConsumablesByEffect,
}; 