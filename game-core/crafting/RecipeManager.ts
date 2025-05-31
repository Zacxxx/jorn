import { Player } from '../../types';
import { discoverRecipeFromPrompt, getRecipeById } from '../../src/utils/recipeUtils';

/**
 * Recipe Manager Module
 * Handles recipe discovery and crafting operations
 */

export interface RecipeDiscoveryResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
  recipeName?: string;
  recipeId?: string;
}

export interface RecipeCraftResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
  resultItemId?: string;
  resultQuantity?: number;
  updatedInventory?: Record<string, number>;
}

export interface RecipeDiscoveryContext {
  setPlayer: (updater: (prev: Player) => Player) => void;
  setIsLoading: (loading: boolean) => void;
  setModalContent: (content: { title: string; message: string; type: 'info' | 'error' | 'success' }) => void;
}

export interface RecipeCraftContext {
  setPlayer: (updater: (prev: Player) => Player) => void;
  setIsLoading: (loading: boolean) => void;
  setModalContent: (content: { title: string; message: string; type: 'info' | 'error' | 'success' }) => void;
}

/**
 * Discover a new recipe from a text prompt
 * @param prompt - Text description of what to discover
 * @param player - Current player state
 * @param context - Recipe discovery context
 * @returns Promise that resolves to discovery result
 */
export const discoverRecipe = async (
  prompt: string,
  player: Player,
  context: RecipeDiscoveryContext
): Promise<RecipeDiscoveryResult> => {
  context.setIsLoading(true);
  
  try {
    const result = await discoverRecipeFromPrompt(prompt, player.level);
    
    if (result.name) {
      // Add the discovered recipe to player's known recipes
      const recipeId = `recipe-${Date.now()}-${result.name.toLowerCase().replace(/\s+/g, '_')}`;
      
      context.setPlayer(prev => ({
        ...prev,
        discoveredRecipes: [...prev.discoveredRecipes, recipeId]
      }));
      
      const successMessage = `You discovered: ${result.name}! Visit the Crafting Workshop to create it.`;
      context.setModalContent({ 
        title: "Recipe Discovered!", 
        message: successMessage, 
        type: 'success' 
      });
      
      return {
        success: true,
        message: successMessage,
        type: 'success',
        recipeName: result.name,
        recipeId
      };
    } else {
      const errorMessage = "No suitable recipe could be discovered from that prompt.";
      context.setModalContent({ 
        title: "Discovery Failed", 
        message: errorMessage, 
        type: 'error' 
      });
      
      return {
        success: false,
        message: errorMessage,
        type: 'error'
      };
    }
  } catch (error) {
    console.error("Recipe discovery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to discover recipe.";
    
    context.setModalContent({ 
      title: "Discovery Error", 
      message: errorMessage, 
      type: 'error' 
    });
    
    return {
      success: false,
      message: errorMessage,
      type: 'error'
    };
  } finally {
    context.setIsLoading(false);
  }
};

/**
 * Craft an item using a known recipe
 * @param recipeId - ID of the recipe to craft
 * @param player - Current player state
 * @param context - Recipe craft context
 * @returns Promise that resolves to craft result
 */
export const craftItemFromRecipe = async (
  recipeId: string,
  player: Player,
  context: RecipeCraftContext
): Promise<RecipeCraftResult> => {
  context.setIsLoading(true);
  
  try {
    const recipe = getRecipeById(recipeId);
    if (!recipe) {
      const errorMessage = "Recipe not found.";
      context.setModalContent({ 
        title: "Craft Failed", 
        message: errorMessage, 
        type: 'error' 
      });
      
      return {
        success: false,
        message: errorMessage,
        type: 'error'
      };
    }
    
    // Check if player has required ingredients
    const hasIngredients = recipe.ingredients.every((ingredient: any) => 
      (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
    );
    
    if (!hasIngredients) {
      const errorMessage = "You don't have all the required ingredients.";
      context.setModalContent({ 
        title: "Craft Failed", 
        message: errorMessage, 
        type: 'error' 
      });
      
      return {
        success: false,
        message: errorMessage,
        type: 'error'
      };
    }
    
    // Deduct ingredients and add result item
    const newInventory = { ...player.inventory };
    
    // Deduct ingredients
    recipe.ingredients.forEach((ingredient: any) => {
      newInventory[ingredient.itemId] = (newInventory[ingredient.itemId] || 0) - ingredient.quantity;
    });
    
    // Add result item
    newInventory[recipe.resultItemId] = (newInventory[recipe.resultItemId] || 0) + recipe.resultQuantity;
    
    // Update player inventory
    context.setPlayer(prev => ({
      ...prev,
      inventory: newInventory
    }));
    
    const successMessage = `Successfully crafted ${recipe.resultQuantity}x ${recipe.name}!`;
    context.setModalContent({ 
      title: "Crafting Complete!", 
      message: successMessage, 
      type: 'success' 
    });
    
    return {
      success: true,
      message: successMessage,
      type: 'success',
      resultItemId: recipe.resultItemId,
      resultQuantity: recipe.resultQuantity,
      updatedInventory: newInventory
    };
  } catch (error) {
    console.error("Crafting error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to craft item.";
    
    context.setModalContent({ 
      title: "Craft Error", 
      message: errorMessage, 
      type: 'error' 
    });
    
    return {
      success: false,
      message: errorMessage,
      type: 'error'
    };
  } finally {
    context.setIsLoading(false);
  }
};

/**
 * Check if a recipe can be crafted with current inventory
 * @param recipeId - ID of the recipe to check
 * @param player - Current player state
 * @returns True if recipe can be crafted
 */
export const canCraftRecipe = (recipeId: string, player: Player): boolean => {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return false;
  
  return recipe.ingredients.every((ingredient: any) => 
    (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
  );
};

/**
 * Get missing ingredients for a recipe
 * @param recipeId - ID of the recipe to check
 * @param player - Current player state
 * @returns Array of missing ingredients with quantities needed
 */
export const getMissingIngredients = (recipeId: string, player: Player): Array<{itemId: string, needed: number, have: number}> => {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return [];
  
  return recipe.ingredients
    .map((ingredient: any) => ({
      itemId: ingredient.itemId,
      needed: ingredient.quantity,
      have: player.inventory[ingredient.itemId] || 0
    }))
    .filter(item => item.have < item.needed);
};

/**
 * Recipe Manager utility functions
 */
export const RecipeManagerUtils = {
  discoverRecipe,
  craftItemFromRecipe,
  canCraftRecipe,
  getMissingIngredients,
}; 