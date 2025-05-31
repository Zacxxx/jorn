import { Player, ResourceCost } from '../../types';

/**
 * Resource Management Module
 * Handles checking and deducting resources from player inventory
 */

/**
 * Check if player has sufficient resources for given costs
 * @param player - Player object
 * @param costs - Array of resource costs to check
 * @returns True if player has sufficient resources, false otherwise
 */
export const checkResources = (player: Player, costs?: ResourceCost[]): boolean => {
  if (!costs || costs.length === 0) return true;
  return costs.every(cost => (player.inventory[cost.itemId] || 0) >= cost.quantity);
};

/**
 * Deduct resources from player inventory
 * @param player - Player object
 * @param costs - Array of resource costs to deduct
 * @returns Object with success status and updated player if successful
 */
export const deductResources = (player: Player, costs?: ResourceCost[]): { success: boolean; updatedPlayer?: Player } => {
  if (!costs || !checkResources(player, costs)) {
    return { success: false };
  }
  
  const newInventory = { ...player.inventory };
  costs.forEach(cost => { 
    newInventory[cost.itemId] = (newInventory[cost.itemId] || 0) - cost.quantity; 
  });
  
  const updatedPlayer = { 
    ...player, 
    inventory: newInventory 
  };
  
  return { 
    success: true, 
    updatedPlayer 
  };
};

/**
 * Add resources to player inventory
 * @param player - Player object
 * @param resources - Array of resources to add
 * @returns Updated player object
 */
export const addResources = (player: Player, resources: ResourceCost[]): Player => {
  const newInventory = { ...player.inventory };
  resources.forEach(resource => {
    newInventory[resource.itemId] = (newInventory[resource.itemId] || 0) + resource.quantity;
  });
  
  return {
    ...player,
    inventory: newInventory
  };
};

/**
 * Get total quantity of a specific resource in player inventory
 * @param player - Player object
 * @param itemId - ID of the resource item
 * @returns Quantity of the resource
 */
export const getResourceQuantity = (player: Player, itemId: string): number => {
  return player.inventory[itemId] || 0;
};

/**
 * Check if player can afford a specific resource cost
 * @param player - Player object
 * @param itemId - ID of the resource item
 * @param quantity - Required quantity
 * @returns True if player has enough of the resource
 */
export const canAffordResource = (player: Player, itemId: string, quantity: number): boolean => {
  return getResourceQuantity(player, itemId) >= quantity;
};

/**
 * Calculate total cost of multiple resource requirements
 * @param costs - Array of resource costs
 * @returns Object mapping item IDs to total quantities needed
 */
export const calculateTotalCosts = (costs: ResourceCost[]): Record<string, number> => {
  const totalCosts: Record<string, number> = {};
  costs.forEach(cost => {
    totalCosts[cost.itemId] = (totalCosts[cost.itemId] || 0) + cost.quantity;
  });
  return totalCosts;
};

/**
 * Resource Manager utility functions
 */
export const ResourceManagerUtils = {
  checkResources,
  deductResources,
  addResources,
  getResourceQuantity,
  canAffordResource,
  calculateTotalCosts,
}; 