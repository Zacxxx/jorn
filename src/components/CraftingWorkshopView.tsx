import React, { useState } from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { GearIcon, HeroBackIcon, FlaskIcon, CheckmarkCircleIcon, GoldCoinIcon } from './IconComponents';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

interface CraftingWorkshopViewProps {
  player: Player;
  onReturnHome: () => void;
  onCraftItem: (recipeId: string) => Promise<void>;
  isLoading: boolean;
  onShowMessage: (title: string, message: string) => void;
}

// Mock recipe data - in a real implementation, this would come from a service
const mockRecipes = [
  {
    id: 'health_potion_basic',
    name: 'Basic Health Potion',
    description: 'A simple healing potion that restores health over time.',
    category: 'consumable',
    resultItemId: 'health_potion_minor',
    resultQuantity: 1,
    ingredients: [
      { itemId: 'verdant_leaf', quantity: 3, type: 'Verdant Leaf' },
      { itemId: 'crystal_shard', quantity: 1, type: 'Crystal Shard' }
    ],
    craftingTime: 2,
    requirements: [
      { type: 'level', value: 1 }
    ]
  },
  {
    id: 'mana_potion_basic',
    name: 'Basic Mana Potion',
    description: 'A simple potion that restores magical energy.',
    category: 'consumable',
    resultItemId: 'mana_potion_minor',
    resultQuantity: 1,
    ingredients: [
      { itemId: 'arcane_dust', quantity: 2, type: 'Arcane Dust' },
      { itemId: 'emberbloom_petal', quantity: 2, type: 'Emberbloom Petal' }
    ],
    craftingTime: 2,
    requirements: [
      { type: 'level', value: 2 }
    ]
  },
  {
    id: 'iron_sword_basic',
    name: 'Iron Sword',
    description: 'A sturdy iron sword suitable for combat.',
    category: 'equipment',
    resultItemId: 'iron_sword',
    resultQuantity: 1,
    ingredients: [
      { itemId: 'iron_ore', quantity: 5, type: 'Iron Ore' },
      { itemId: 'ancient_bone', quantity: 1, type: 'Ancient Bone' }
    ],
    craftingTime: 4,
    requirements: [
      { type: 'level', value: 3 }
    ]
  }
];

const CraftingWorkshopView: React.FC<CraftingWorkshopViewProps> = ({
  player,
  onReturnHome,
  onCraftItem,
  isLoading,
  onShowMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'equipment' | 'component'>('all');

  // Get known recipes - in a real implementation, this would filter based on player.discoveredRecipes
  const knownRecipes = mockRecipes.filter(recipe => 
    player.discoveredRecipes.includes(recipe.id) ||
    player.discoveredRecipes.some(id => id.includes(recipe.name.toLowerCase().replace(/\s+/g, '_')))
  );

  const filteredRecipes = selectedCategory === 'all' 
    ? knownRecipes 
    : knownRecipes.filter(recipe => recipe.category === selectedCategory);

  const canCraftRecipe = (recipe: typeof mockRecipes[0]): boolean => {
    return recipe.ingredients.every(ingredient => 
      (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
    ) && recipe.requirements.every(req => {
      if (req.type === 'level') return player.level >= (req.value as number);
      return true;
    });
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
            {knownRecipes.length} recipes available
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
              {knownRecipes.length === 0 
                ? 'No recipes discovered yet. Visit the Recipe Discovery Lab to find new recipes!'
                : 'No recipes in this category.'
              }
            </p>
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
                    
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Crafting Time: {recipe.craftingTime}h</span>
                      <span>Produces: {recipe.resultQuantity}x item</span>
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
                      {canCraft ? 'Craft Item' : 'Missing Ingredients'}
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