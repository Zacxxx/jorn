import { CraftingRecipe } from '../types';
import craftingData from '../data/craftingRecipes.json';

export interface CraftingData {
  recipes: Record<string, CraftingRecipe>;
  discoveryPrompts: string[];
}

let loadedCraftingData: CraftingData | null = null;

export const loadCraftingData = (): CraftingData => {
  if (!loadedCraftingData) {
    loadedCraftingData = craftingData as CraftingData;
  }
  return loadedCraftingData;
};

export const getAllRecipes = (): CraftingRecipe[] => {
  const data = loadCraftingData();
  return Object.values(data.recipes);
};

export const getDiscoveredRecipes = (): CraftingRecipe[] => {
  return getAllRecipes().filter(recipe => recipe.discovered);
};

export const getRecipeById = (recipeId: string): CraftingRecipe | null => {
  const data = loadCraftingData();
  return data.recipes[recipeId] || null;
};

export const getRecipesByCategory = (category: string): CraftingRecipe[] => {
  return getAllRecipes().filter(recipe => recipe.category === category);
};

export const getDiscoveryPrompts = (): string[] => {
  const data = loadCraftingData();
  return data.discoveryPrompts;
};

export const discoverRecipe = (recipeId: string): void => {
  const data = loadCraftingData();
  if (data.recipes[recipeId]) {
    data.recipes[recipeId].discovered = true;
  }
};

export const canCraftRecipe = (recipe: CraftingRecipe, playerLevel: number, playerLocation?: string, playerSkills?: string[]): boolean => {
  return recipe.requirements.every(req => {
    switch (req.type) {
      case 'level':
        return playerLevel >= (req.value as number);
      case 'location':
        return playerLocation === req.value;
      case 'skill':
        return playerSkills?.includes(req.value as string) || false;
      case 'tool':
        // For now, assume tools are always available
        return true;
      default:
        return true;
    }
  });
};

export const hasRequiredIngredients = (recipe: CraftingRecipe, playerInventory: Record<string, number>): boolean => {
  return recipe.ingredients.every(ingredient => 
    (playerInventory[ingredient.itemId] || 0) >= ingredient.quantity
  );
}; 