import React, { useState } from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { FlaskIcon, BookIcon, HeroBackIcon, SearchIcon, GoldCoinIcon, EssenceIcon } from './IconComponents';
import { discoverRecipeFromPrompt } from '../../services/geminiService';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { getDiscoveryPrompts, getAllRecipes } from '../../services/craftingService';

interface RecipeDiscoveryViewProps {
  player: Player;
  onReturnHome: () => void;
  onDiscoverRecipe: (prompt: string) => Promise<void>;
  isLoading: boolean;
  onShowMessage: (title: string, message: string) => void;
}

const RecipeDiscoveryView: React.FC<RecipeDiscoveryViewProps> = ({
  player,
  onReturnHome,
  onDiscoverRecipe,
  isLoading,
  onShowMessage,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'equipment' | 'component'>('all');
  
  const discoveryPrompts = getDiscoveryPrompts();
  const allRecipes = getAllRecipes();
  const discoveredRecipeIds = player.discoveredRecipes;
  const undiscoveredRecipes = allRecipes.filter(recipe => !discoveredRecipeIds.includes(recipe.id));
  
  const filteredUndiscoveredRecipes = selectedCategory === 'all' 
    ? undiscoveredRecipes 
    : undiscoveredRecipes.filter(recipe => recipe.category === selectedCategory);

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) {
      onShowMessage('Invalid Prompt', 'Please enter a valid research prompt.');
      return;
    }
    await onDiscoverRecipe(prompt.trim());
  };

  const handleCustomPromptSubmit = () => {
    handlePromptSubmit(customPrompt);
    setCustomPrompt('');
  };

  const getDiscoveryHint = (recipe: any): string => {
    const ingredients = recipe.ingredients.map((ing: any) => ing.type).join(', ');
    const requirements = recipe.requirements.map((req: any) => {
      switch (req.type) {
        case 'level': return `Level ${req.value}`;
        case 'location': return `Requires ${req.value}`;
        case 'skill': return `Skill: ${req.value}`;
        case 'tool': return `Tool: ${req.value}`;
        default: return '';
      }
    }).filter(Boolean).join(', ');
    
    return `Ingredients: ${ingredients}${requirements ? ` | Requirements: ${requirements}` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          Recipe Discovery Workshop
        </h2>
        <p className="text-slate-300 mb-4 max-w-2xl mx-auto">
          Use your knowledge and intuition to discover new crafting recipes. Ask questions about materials, techniques, and combinations.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <BookIcon className="w-4 h-4 mr-1" />
            {discoveredRecipeIds.length} recipes discovered
          </span>
          <span className="flex items-center">
            <FlaskIcon className="w-4 h-4 mr-1" />
            {undiscoveredRecipes.length} recipes remaining
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
        <ActionButton
          onClick={() => onShowMessage('Discovery Tips', 'Try asking about specific materials you have, or general crafting techniques. Be specific about what you want to create!')}
          variant="info"
          size="lg"
          icon={<BookIcon />}
        >
          Discovery Tips
        </ActionButton>
      </div>

      {/* Custom Prompt Section */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SearchIcon className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-green-300">Custom Research Query</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What would you like to research?
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., How can I create a healing potion using herbs? What materials do I need for a magic sword?"
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:border-green-400 focus:outline-none resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <ActionButton
            onClick={handleCustomPromptSubmit}
            variant="success"
            size="lg"
            isLoading={isLoading}
            disabled={!customPrompt.trim() || isLoading}
            icon={<SearchIcon />}
            className="w-full"
          >
            {isLoading ? 'Researching...' : 'Research Recipe'}
          </ActionButton>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FlaskIcon className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-semibold text-amber-300">Suggested Research Topics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {discoveryPrompts.map((prompt, index) => (
            <ActionButton
              key={index}
              onClick={() => handlePromptSubmit(prompt)}
              variant="secondary"
              size="sm"
              disabled={isLoading}
              className="text-left justify-start h-auto py-3 px-4"
            >
              <span className="text-sm">{prompt}</span>
            </ActionButton>
          ))}
        </div>
      </div>

      {/* Recipe Hints */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-300">Undiscovered Recipes</h3>
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
        
        {filteredUndiscoveredRecipes.length === 0 ? (
          <p className="text-slate-400 italic text-center py-8">
            {selectedCategory === 'all' 
              ? 'All recipes discovered! You are a master crafter!' 
              : `No undiscovered ${selectedCategory} recipes remaining.`}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUndiscoveredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-slate-100">???</h4>
                  <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  A mysterious {recipe.category} recipe waiting to be discovered...
                </p>
                <div className="text-xs text-slate-400">
                  <p className="mb-1">
                    <span className="text-slate-300">Crafting Time:</span> {recipe.craftingTime}h
                  </p>
                  <p className="text-slate-500">
                    {getDiscoveryHint(recipe)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <LoadingSpinner text="Researching recipe..." size="lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDiscoveryView; 