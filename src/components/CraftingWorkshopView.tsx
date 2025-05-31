import React, { useState } from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { GearIcon, HeroBackIcon, FlaskIcon, CheckmarkCircleIcon, GoldCoinIcon } from './IconComponents';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';
import { getAllRecipes, getRecipeById } from '../../services/craftingService';

interface CraftingWorkshopViewProps {
  player: Player;
  onReturnHome: () => void;
  onCraftItem: (recipeId: string) => Promise<void>;
  isLoading: boolean;
  onShowMessage: (title: string, message: string) => void;
}

const CraftingWorkshopView: React.FC<CraftingWorkshopViewProps> = ({
  player,
  onReturnHome,
  onCraftItem,
  isLoading,
  onShowMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'equipment' | 'component'>('all');

  // Get all available recipes from the crafting service
  const allRecipes = getAllRecipes();
  
  // Debug logging
  console.log('CraftingWorkshop Debug:', {
    allRecipesCount: allRecipes.length,
    playerDiscoveredRecipes: player.discoveredRecipes,
    allRecipeIds: allRecipes.map(r => r.id)
  });
  
  // Filter recipes based on player's discovered recipes
  const knownRecipes = allRecipes.filter(recipe => {
    // Check if player has discovered this recipe
    return player.discoveredRecipes.includes(recipe.id) ||
           recipe.discovered === true ||
           // Also check for partial matches in case recipe IDs were generated differently
           player.discoveredRecipes.some(discoveredId => 
             discoveredId.includes(recipe.name.toLowerCase().replace(/\s+/g, '_')) ||
             discoveredId.includes(recipe.id)
           );
  });

  // Add some default recipes that should always be available for testing
  const defaultAvailableRecipes = allRecipes.filter(recipe => 
    recipe.id === 'basic_health_potion' || 
    recipe.id === 'iron_sword_basic' ||
    recipe.requirements.some(req => req.type === 'level' && (req.value as number) <= player.level)
  );

  // Combine known recipes with default available ones (remove duplicates)
  const availableRecipes = [...new Map([...knownRecipes, ...defaultAvailableRecipes].map(recipe => [recipe.id, recipe])).values()];
  
  console.log('CraftingWorkshop Recipes:', {
    knownRecipesCount: knownRecipes.length,
    defaultAvailableCount: defaultAvailableRecipes.length,
    finalAvailableCount: availableRecipes.length,
    availableRecipeIds: availableRecipes.map(r => r.id)
  });

  const filteredRecipes = selectedCategory === 'all' 
    ? availableRecipes 
    : availableRecipes.filter(recipe => recipe.category === selectedCategory);

  const canCraftRecipe = (recipe: any): boolean => {
    // Check ingredients
    const hasIngredients = recipe.ingredients.every((ingredient: any) => 
      (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
    );
    
    // Check requirements
    const meetsRequirements = recipe.requirements.every((req: any) => {
      if (req.type === 'level') return player.level >= (req.value as number);
      if (req.type === 'location') return true; // For now, assume location requirements are met
      if (req.type === 'skill') return true; // For now, assume skill requirements are met
      if (req.type === 'tool') return true; // For now, assume tool requirements are met
      return true;
    });
    
    return hasIngredients && meetsRequirements;
  };

  const handleCraft = async (recipeId: string) => {
    try {
      await onCraftItem(recipeId);
    } catch (error) {
      onShowMessage('Crafting Failed', 'Failed to craft item. Please try again.');
    }
  };

  const renderIngredient = (ingredient: any) => {
    const item = MASTER_ITEM_DEFINITIONS[ingredient.itemId];
    const playerHas = player.inventory[ingredient.itemId] || 0;
    const hasEnough = playerHas >= ingredient.quantity;

    return (
      <div key={ingredient.itemId} className="flex items-center justify-between">
        <span className="text-sm text-slate-300">
          {ingredient.quantity}x {item?.name || ingredient.type}
        </span>
        <span className={`text-sm ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
          ({playerHas})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-green-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <GearIcon className="w-8 h-8 mr-3 text-green-400" />
          Crafting Workshop
        </h2>
        <p className="text-slate-300 mb-4">Create items using your discovered recipes</p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <FlaskIcon className="w-4 h-4 mr-1" />
            {availableRecipes.length} recipes available
          </span>
          <span className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1" />
            Gold: {player.gold}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <ActionButton
          onClick={onReturnHome}
          variant="secondary"
          size="lg"
          icon={<HeroBackIcon />}
        >
          Return Home
        </ActionButton>
      </div>

      {/* Category Filter */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Recipe Categories</h3>
        <div className="flex flex-wrap gap-2">
          {(['all', 'consumable', 'equipment', 'component'] as const).map((category) => (
            <ActionButton
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ActionButton>
          ))}
        </div>
      </div>

      {/* Recipes List */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">
          {selectedCategory === 'all' ? 'All Recipes' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Recipes`}
        </h3>
        
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8">
            <FlaskIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 italic">
              {availableRecipes.length === 0 
                ? 'No recipes discovered yet. Visit the Recipe Discovery Lab to find new recipes!'
                : 'No recipes in this category.'
              }
            </p>
            {availableRecipes.length === 0 && (
              <div className="mt-4 text-sm text-slate-500">
                <p>Debug info:</p>
                <p>Player discovered recipes: {player.discoveredRecipes.length}</p>
                <p>Total recipes in system: {allRecipes.length}</p>
                <p>Player level: {player.level}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map((recipe) => {
              const canCraft = canCraftRecipe(recipe);
              
              return (
                <div key={recipe.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-slate-100">{recipe.name}</h4>
                    <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                      {recipe.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4">{recipe.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-slate-200 mb-2">Ingredients:</h5>
                      <div className="space-y-1">
                        {recipe.ingredients.map(renderIngredient)}
                      </div>
                    </div>
                    
                    {recipe.requirements && recipe.requirements.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-200 mb-2">Requirements:</h5>
                        <div className="space-y-1">
                          {recipe.requirements.map((req: any, index: number) => (
                            <div key={index} className="text-xs text-slate-400">
                              {req.type === 'level' && `Level ${req.value}`}
                              {req.type === 'location' && `Location: ${req.value}`}
                              {req.type === 'skill' && `Skill: ${req.value}`}
                              {req.type === 'tool' && `Tool: ${req.value}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Crafting Time: {recipe.craftingTime}h</span>
                      <span>Produces: {recipe.resultQuantity}x {MASTER_ITEM_DEFINITIONS[recipe.resultItemId]?.name || recipe.resultItemId}</span>
                    </div>
                    
                    <ActionButton
                      onClick={() => handleCraft(recipe.id)}
                      variant={canCraft ? "success" : "secondary"}
                      size="sm"
                      disabled={!canCraft || isLoading}
                      isLoading={isLoading}
                      icon={canCraft ? <CheckmarkCircleIcon className="w-4 h-4" /> : <GearIcon className="w-4 h-4" />}
                      className="w-full"
                    >
                      {canCraft ? 'Craft Item' : 'Missing Requirements'}
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftingWorkshopView; 