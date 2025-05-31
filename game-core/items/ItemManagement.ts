import { 
  Player, 
  GameItem, 
  Equipment, 
  Spell, 
  Ability,
  GeneratedConsumableData, 
  GeneratedEquipmentData, 
  ItemType,
  DetailedEquipmentSlot
} from '../../types';
import { getScalingFactorFromRarity } from '../../utils';
import { checkResources, deductResources } from '../resources/ResourceManager';
import { calculateMaxPreparedSpells, calculateMaxPreparedAbilities } from '../player/PlayerStats';

/**
 * Item Management Module
 * Handles item crafting, equipment, and spell/ability preparation
 */

export interface ItemCraftConfirmResult {
  success: boolean;
  item?: GameItem;
  updatedPlayer?: Player;
  error?: string;
}

export interface EquipmentResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
}

export interface SpellPreparationResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
}

/**
 * Confirm item crafting and add to player inventory
 * @param player - Current player state
 * @param pendingItemData - Item data to craft
 * @returns Result with new item and updated player
 */
export const confirmItemCraft = (
  player: Player,
  pendingItemData: GeneratedConsumableData | GeneratedEquipmentData
): ItemCraftConfirmResult => {
  if (!pendingItemData) {
    return {
      success: false,
      error: "No item data to confirm."
    };
  }

  const itemTypeCrafted: ItemType = (pendingItemData as GeneratedEquipmentData).slot ? 'Equipment' : 'Consumable';
  
  if (!checkResources(player, pendingItemData.resourceCost)) {
    return {
      success: false,
      error: "Insufficient resources."
    };
  }

  // Deduct resources
  const resourceResult = deductResources(player, pendingItemData.resourceCost);
  if (!resourceResult.success || !resourceResult.updatedPlayer) {
    return {
      success: false,
      error: "Failed to deduct resources."
    };
  }

  // Create new item
  const newItem: GameItem = {
    ...pendingItemData,
    id: `${itemTypeCrafted.toLowerCase()}-${Date.now()}`,
    itemType: itemTypeCrafted,
    rarity: pendingItemData.rarity || 0,
    stackable: false, 
    scalingFactor: (pendingItemData as GeneratedEquipmentData).scalingFactor || getScalingFactorFromRarity(pendingItemData.rarity || 0),
  } as GameItem;

  // Add item to player inventory
  const updatedPlayer = {
    ...resourceResult.updatedPlayer,
    items: [...resourceResult.updatedPlayer.items, newItem]
  };

  return {
    success: true,
    item: newItem,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Equip an item to a specific slot
 * @param player - Current player state
 * @param itemId - ID of item to equip
 * @param slot - Equipment slot to equip to
 * @returns Result with updated player
 */
export const equipItem = (
  player: Player,
  itemId: string,
  slot: DetailedEquipmentSlot
): EquipmentResult => {
  const itemToEquip = player.items.find(i => i.id === itemId) as Equipment | undefined;
  
  if (!itemToEquip || itemToEquip.itemType !== 'Equipment') {
    return {
      success: false,
      error: "Item not found or not equipment."
    };
  }

  const updatedPlayer = {
    ...player,
    equippedItems: { 
      ...player.equippedItems, 
      [slot]: itemToEquip.id 
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Unequip an item from a specific slot
 * @param player - Current player state
 * @param slot - Equipment slot to unequip from
 * @returns Result with updated player
 */
export const unequipItem = (
  player: Player,
  slot: DetailedEquipmentSlot
): EquipmentResult => {
  if (!player.equippedItems[slot]) {
    return {
      success: false,
      error: "No item equipped in that slot."
    };
  }

  const updatedPlayer = {
    ...player,
    equippedItems: { 
      ...player.equippedItems, 
      [slot]: null 
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Prepare a spell for use
 * @param player - Current player state
 * @param spell - Spell to prepare
 * @returns Result with updated player
 */
export const prepareSpell = (
  player: Player,
  spell: Spell
): SpellPreparationResult => {
  const maxPreparedSpells = calculateMaxPreparedSpells(player.level);
  
  if (player.preparedSpellIds.length >= maxPreparedSpells) {
    return {
      success: false,
      error: `Maximum prepared spells reached (${maxPreparedSpells}).`
    };
  }

  if (player.preparedSpellIds.includes(spell.id)) {
    return {
      success: false,
      error: "Spell is already prepared."
    };
  }

  const updatedPlayer = {
    ...player,
    preparedSpellIds: Array.from(new Set([...player.preparedSpellIds, spell.id]))
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Unprepare a spell
 * @param player - Current player state
 * @param spell - Spell to unprepare
 * @returns Result with updated player
 */
export const unprepareSpell = (
  player: Player,
  spell: Spell
): SpellPreparationResult => {
  if (!player.preparedSpellIds.includes(spell.id)) {
    return {
      success: false,
      error: "Spell is not prepared."
    };
  }

  const updatedPlayer = {
    ...player,
    preparedSpellIds: player.preparedSpellIds.filter(id => id !== spell.id)
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Prepare an ability for use
 * @param player - Current player state
 * @param ability - Ability to prepare
 * @returns Result with updated player
 */
export const prepareAbility = (
  player: Player,
  ability: Ability
): SpellPreparationResult => {
  const maxPreparedAbilities = calculateMaxPreparedAbilities(player.level);
  
  if (player.preparedAbilityIds.length >= maxPreparedAbilities) {
    return {
      success: false,
      error: `Maximum prepared abilities reached (${maxPreparedAbilities}).`
    };
  }

  if (player.preparedAbilityIds.includes(ability.id)) {
    return {
      success: false,
      error: "Ability is already prepared."
    };
  }

  const updatedPlayer = {
    ...player,
    preparedAbilityIds: Array.from(new Set([...player.preparedAbilityIds, ability.id]))
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Unprepare an ability
 * @param player - Current player state
 * @param ability - Ability to unprepare
 * @returns Result with updated player
 */
export const unprepareAbility = (
  player: Player,
  ability: Ability
): SpellPreparationResult => {
  if (!player.preparedAbilityIds.includes(ability.id)) {
    return {
      success: false,
      error: "Ability is not prepared."
    };
  }

  const updatedPlayer = {
    ...player,
    preparedAbilityIds: player.preparedAbilityIds.filter(id => id !== ability.id)
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Get equipped item in a specific slot
 * @param player - Current player state
 * @param slot - Equipment slot to check
 * @returns Equipped item or undefined
 */
export const getEquippedItem = (player: Player, slot: DetailedEquipmentSlot): Equipment | undefined => {
  const itemId = player.equippedItems[slot];
  if (!itemId) return undefined;
  
  return player.items.find(i => i.id === itemId) as Equipment | undefined;
};

/**
 * Check if an item is equipped
 * @param player - Current player state
 * @param itemId - ID of item to check
 * @returns True if item is equipped, false otherwise
 */
export const isItemEquipped = (player: Player, itemId: string): boolean => {
  return Object.values(player.equippedItems).includes(itemId);
};

/**
 * Get all equipped items
 * @param player - Current player state
 * @returns Array of equipped items
 */
export const getAllEquippedItems = (player: Player): Equipment[] => {
  const equippedItems: Equipment[] = [];
  
  Object.values(player.equippedItems).forEach(itemId => {
    if (itemId) {
      const item = player.items.find(i => i.id === itemId) as Equipment | undefined;
      if (item && item.itemType === 'Equipment') {
        equippedItems.push(item);
      }
    }
  });
  
  return equippedItems;
};

/**
 * Item Management utility functions
 */
export const ItemManagementUtils = {
  confirmItemCraft,
  equipItem,
  unequipItem,
  prepareSpell,
  unprepareSpell,
  prepareAbility,
  unprepareAbility,
  getEquippedItem,
  isItemEquipped,
  getAllEquippedItems,
}; 