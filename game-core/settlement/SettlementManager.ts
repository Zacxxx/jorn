import { Player } from '../../types';

/**
 * Settlement Management Module
 * Handles settlement interactions, shops, taverns, NPCs, and services
 */

export interface PurchaseResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
  message?: string;
}

export interface ServiceResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
  message?: string;
}

/**
 * Purchase an item from a shop
 * @param player - Current player state
 * @param itemId - ID of item to purchase
 * @param price - Price per item
 * @param quantity - Quantity to purchase
 * @returns Result with updated player and message
 */
export const purchaseItem = (
  player: Player,
  itemId: string,
  price: number,
  quantity: number
): PurchaseResult => {
  const totalCost = price * quantity;
  
  if (player.gold < totalCost) {
    return {
      success: false,
      error: "Not enough gold!"
    };
  }

  const updatedPlayer = {
    ...player,
    gold: player.gold - totalCost,
    inventory: {
      ...player.inventory,
      [itemId]: (player.inventory[itemId] || 0) + quantity
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: `Purchased ${quantity}x item for ${totalCost} gold!`
  };
};

/**
 * Purchase a service from a settlement
 * @param player - Current player state
 * @param serviceId - ID of service to purchase
 * @param price - Price of the service
 * @returns Result with updated player and message
 */
export const purchaseService = (
  player: Player,
  serviceId: string,
  price: number
): ServiceResult => {
  if (player.gold < price) {
    return {
      success: false,
      error: "Not enough gold!"
    };
  }

  // TODO: Implement specific service logic based on serviceId
  const updatedPlayer = {
    ...player,
    gold: player.gold - price
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: `Service purchased for ${price} gold!`
  };
};

/**
 * Sell an item to a shop
 * @param player - Current player state
 * @param itemId - ID of item to sell
 * @param price - Price per item
 * @param quantity - Quantity to sell
 * @returns Result with updated player and message
 */
export const sellItem = (
  player: Player,
  itemId: string,
  price: number,
  quantity: number
): PurchaseResult => {
  const currentQuantity = player.inventory[itemId] || 0;
  
  if (currentQuantity < quantity) {
    return {
      success: false,
      error: "Not enough items to sell!"
    };
  }

  const totalEarnings = price * quantity;
  
  const updatedPlayer = {
    ...player,
    gold: player.gold + totalEarnings,
    inventory: {
      ...player.inventory,
      [itemId]: currentQuantity - quantity
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: `Sold ${quantity}x item for ${totalEarnings} gold!`
  };
};

/**
 * Check if player can afford an item purchase
 * @param player - Current player state
 * @param price - Price per item
 * @param quantity - Quantity to purchase
 * @returns True if player can afford the purchase
 */
export const canAffordPurchase = (
  player: Player,
  price: number,
  quantity: number
): boolean => {
  return player.gold >= (price * quantity);
};

/**
 * Check if player has enough items to sell
 * @param player - Current player state
 * @param itemId - ID of item to sell
 * @param quantity - Quantity to sell
 * @returns True if player has enough items
 */
export const canSellItem = (
  player: Player,
  itemId: string,
  quantity: number
): boolean => {
  return (player.inventory[itemId] || 0) >= quantity;
};

/**
 * Get player's current gold amount
 * @param player - Current player state
 * @returns Current gold amount
 */
export const getPlayerGold = (player: Player): number => {
  return player.gold;
};

/**
 * Get quantity of a specific item in player's inventory
 * @param player - Current player state
 * @param itemId - ID of item to check
 * @returns Quantity of the item
 */
export const getItemQuantity = (player: Player, itemId: string): number => {
  return player.inventory[itemId] || 0;
};

/**
 * Apply reputation changes for settlement interactions
 * @param player - Current player state
 * @param settlementId - ID of settlement
 * @param reputationChange - Amount to change reputation
 * @returns Updated player with reputation change
 */
export const applyReputationChange = (
  player: Player,
  settlementId: string,
  reputationChange: number
): Player => {
  // TODO: Implement reputation system when it's added to player state
  // For now, just return the player unchanged
  return player;
};

/**
 * Check if a shop is available based on player level/progress
 * @param player - Current player state
 * @param shopId - ID of shop to check
 * @returns True if shop is available
 */
export const isShopAvailable = (
  player: Player,
  shopId: string
): boolean => {
  // TODO: Implement shop availability logic based on player progress
  // For now, all shops are available
  return true;
};

/**
 * Check if a service is available based on player level/progress
 * @param player - Current player state
 * @param serviceId - ID of service to check
 * @returns True if service is available
 */
export const isServiceAvailable = (
  player: Player,
  serviceId: string
): boolean => {
  // TODO: Implement service availability logic based on player progress
  // For now, all services are available
  return true;
};

/**
 * Get available shops for a settlement
 * @param settlementId - ID of settlement
 * @returns Array of available shop IDs
 */
export const getAvailableShops = (settlementId: string): string[] => {
  // TODO: Implement settlement-specific shop logic
  // For now, return a default set
  return ['general_store', 'blacksmith', 'alchemist'];
};

/**
 * Get available services for a settlement
 * @param settlementId - ID of settlement
 * @returns Array of available service IDs
 */
export const getAvailableServices = (settlementId: string): string[] => {
  // TODO: Implement settlement-specific service logic
  // For now, return a default set
  return ['rest', 'training', 'information'];
};

/**
 * Settlement Manager utility functions
 */
export const SettlementManagerUtils = {
  purchaseItem,
  purchaseService,
  sellItem,
  canAffordPurchase,
  canSellItem,
  getPlayerGold,
  getItemQuantity,
  applyReputationChange,
  isShopAvailable,
  isServiceAvailable,
  getAvailableShops,
  getAvailableServices,
}; 