import React, { useState, useEffect } from 'react';
import { Player, Recipe, MasterItemDefinition } from '../types';
import ActionButton from '../../ui/ActionButton';
import { FlaskIcon, BookIcon, HeroBackIcon, SearchIcon, GoldCoinIcon, CheckmarkCircleIcon, GearIcon } from './IconComponents';
import { getAllRecipes, getRecipeById, hasRequiredIngredients, canCraftRecipe } from '../services/craftingService';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';
import { GetSpellIcon } from './IconComponents';

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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const discoveredRecipes = getAllRecipes().filter(recipe => 
    player.discoveredRecipes.includes(recipe.id)
  );
  
  const filteredRecipes = selectedCategory === 'all' 
    ? discoveredRecipes 
    : discoveredRecipes.filter(recipe => recipe.category === selectedCategory);

  const canCraft = (recipe: Recipe): boolean => {
    return hasRequiredIngredients(recipe, player.inventory) && 
           canCraftRecipe(recipe, player.level, player.currentLocationId);
  };

  const getMissingIngredients = (recipe: Recipe): string[] => {
    return recipe.ingredients
      .filter(ingredient => (player.inventory[ingredient.itemId] || 0) < ingredient.quantity)
      .map(ingredient => {
        const have = player.inventory[ingredient.itemId] || 0;
        const need = ingredient.quantity;
        const itemDef = MASTER_ITEM_DEFINITIONS[ingredient.itemId];
        const name = itemDef?.name || ingredient.type;
        return `${name} (${have}/${need})`;
      });
  };

  const getUnmetRequirements = (recipe: Recipe): string[] => {
    const unmet: string[] = [];
    recipe.requirements.forEach(req => {
      switch (req.type) {
        case 'level':
          if (player.level < (req.value as number)) {
            unmet.push(`Level ${req.value} required (you are level ${player.level})`);
          }
          break;
        case 'location':
          if (player.currentLocationId !== req.value) {
            unmet.push(`Must be at ${req.value}`);
          }
          break;
        case 'skill':
          // For now, assume all skills are available
          break;
        case 'tool':
          // For now, assume all tools are available
          break;
      }
    });
    return unmet;
  };

  const handleCraft = async (recipe: Recipe) => {
    if (!canCraft(recipe)) {
      const missing = getMissingIngredients(recipe);
      const unmet = getUnmetRequirements(recipe);
      const issues = [...missing, ...unmet];
      onShowMessage('Cannot Craft', `Missing requirements: ${issues.join(', ')}`);
      return;
    }
    await onCraftItem(recipe.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          Crafting Workshop
        </h2>
        <p className="text-slate-300 mb-4 max-w-2xl mx-auto">
          Transform raw materials into powerful items using your discovered recipes.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <BookIcon className="w-4 h-4 mr-1" />
            {discoveredRecipes.length} recipes available
          </span>
          <span className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1" />
            Gold: {player.gold}
          </span>
          <span className="flex items-center">
            <FlaskIcon className="w-4 h-4 mr-1" />
            Level: {player.level}
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
        <ActionButton
          onClick={() => onShowMessage('Crafting Tips', 'Make sure you have all required ingredients and meet the level requirements. Some recipes require specific locations like a blacksmith or alchemy station.')}
          variant="info"
          size="lg"
          icon={<BookIcon />}
        >
          Crafting Tips
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="lg:col-span-2 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FlaskIcon className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-amber-300">Available Recipes</h3>
            </div>
            <div className="flex space-x-2">
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
          
          {filteredRecipes.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">
              {selectedCategory === 'all' 
                ? 'No recipes discovered yet. Visit the Recipe Discovery Workshop to learn new recipes!' 
                : `No ${selectedCategory} recipes discovered yet.`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredRecipes.map((recipe) => {
                const craftable = canCraft(recipe);
                const missing = getMissingIngredients(recipe);
                const unmet = getUnmetRequirements(recipe);
                
                return (
                  <div 
                    key={recipe.id} 
                    className={`bg-slate-700/50 rounded-lg p-4 border cursor-pointer transition-colors ${
                      selectedRecipe?.id === recipe.id 
                        ? 'border-blue-400 bg-blue-900/20' 
                        : craftable 
                          ? 'border-slate-600 hover:border-slate-500' 
                          : 'border-red-600/50'
                    }`}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-slate-100">{recipe.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                          {recipe.category}
                        </span>
                        {craftable && (
                          <CheckmarkCircleIcon className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{recipe.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Crafting Time: {recipe.craftingTime}h</span>
                      <span>Ingredients: {recipe.ingredients.length}</span>
                    </div>
                    {(missing.length > 0 || unmet.length > 0) && (
                      <div className="mt-2 text-xs text-red-400">
                        Missing: {[...missing, ...unmet].join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recipe Details */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <GearIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-green-300">Recipe Details</h3>
          </div>
          
          {selectedRecipe ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-slate-100 mb-2">{selectedRecipe.name}</h4>
                <p className="text-sm text-slate-300 mb-3">{selectedRecipe.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <span>Category: {selectedRecipe.category}</span>
                  <span>Time: {selectedRecipe.craftingTime}h</span>
                  <span>Result: {selectedRecipe.resultQuantity}x</span>
                  <span>Level: {selectedRecipe.requirements.find(r => r.type === 'level')?.value || 'Any'}</span>
                </div>
              </div>

              <div>
                <h5 className="text-md font-medium text-slate-200 mb-2">Required Ingredients:</h5>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => {
                    const have = player.inventory[ingredient.itemId] || 0;
                    const need = ingredient.quantity;
                    const hasEnough = have >= need;
                    const itemDef = MASTER_ITEM_DEFINITIONS[ingredient.itemId];
                    
                    return (
                      <div key={index} className={`flex items-center justify-between p-2 rounded ${hasEnough ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <div className="flex items-center space-x-2">
                          <GetSpellIcon iconName={itemDef?.iconName || 'Default'} className="w-4 h-4" />
                          <span className="text-sm text-slate-300">
                            {itemDef?.name || ingredient.type}
                          </span>
                        </div>
                        <span className={`text-sm ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                          {have}/{need}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedRecipe.requirements.length > 0 && (
                <div>
                  <h5 className="text-md font-medium text-slate-200 mb-2">Requirements:</h5>
                  <div className="space-y-1">
                    {selectedRecipe.requirements.map((req, index) => {
                      let text = '';
                      let met = true;
                      
                      switch (req.type) {
                        case 'level':
                          text = `Level ${req.value}`;
                          met = player.level >= (req.value as number);
                          break;
                        case 'location':
                          text = `Location: ${req.value}`;
                          met = player.currentLocationId === req.value;
                          break;
                        case 'skill':
                          text = `Skill: ${req.value}`;
                          met = true; // Assume skills are always met for now
                          break;
                        case 'tool':
                          text = `Tool: ${req.value}`;
                          met = true; // Assume tools are always available for now
                          break;
                      }
                      
                      return (
                        <div key={index} className={`text-sm p-1 rounded ${met ? 'text-green-400' : 'text-red-400'}`}>
                          {met ? '✓' : '✗'} {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <ActionButton
                onClick={() => handleCraft(selectedRecipe)}
                variant={canCraft(selectedRecipe) ? 'success' : 'danger'}
                size="lg"
                isLoading={isLoading}
                disabled={!canCraft(selectedRecipe) || isLoading}
                icon={<GearIcon />}
                className="w-full"
              >
                {isLoading ? 'Crafting...' : canCraft(selectedRecipe) ? 'Craft Item' : 'Cannot Craft'}
              </ActionButton>
            </div>
          ) : (
            <p className="text-slate-400 italic text-center py-8">
              Select a recipe to view details and craft items.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CraftingWorkshopView; 