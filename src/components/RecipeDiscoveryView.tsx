import React, { useState } from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { FlaskIcon, HeroBackIcon, BookIcon } from './IconComponents';

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
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      onShowMessage('Invalid Input', 'Please enter a recipe idea.');
      return;
    }
    try {
      await onDiscoverRecipe(prompt.trim());
      setPrompt('');
    } catch (error) {
      onShowMessage('Discovery Failed', 'Failed to discover recipe. Please try again.');
    }
  };

  const examplePrompts = [
    "A healing potion made from forest herbs",
    "A fire resistance elixir using crystal shards",
    "Iron sword with improved durability",
    "Magic robes that boost spell power",
    "Explosive bombs for combat",
    "Stamina restoration drink"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-blue-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <FlaskIcon className="w-8 h-8 mr-3 text-blue-400" />
          Recipe Discovery Lab
        </h2>
        <p className="text-slate-300">Discover new crafting recipes by describing what you want to create</p>
      </div>

      {/* Discovery Form */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipe-prompt" className="block text-sm font-medium text-slate-200 mb-2">
              Describe your recipe idea:
            </label>
            <textarea
              id="recipe-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
              placeholder="Example: A healing potion made from forest herbs and crystal shards..."
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-4">
            <ActionButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!prompt.trim()}
              icon={<FlaskIcon className="w-5 h-5" />}
              className="flex-1"
            >
              {isLoading ? 'Discovering...' : 'Discover Recipe'}
            </ActionButton>
            
            <ActionButton
              onClick={onReturnHome}
              variant="secondary"
              size="lg"
              icon={<HeroBackIcon className="w-5 h-5" />}
            >
              Return Home
            </ActionButton>
          </div>
        </form>
      </div>

      {/* Example Prompts */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center">
          <BookIcon className="w-6 h-6 mr-2 text-amber-400" />
          Example Recipe Ideas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="text-left p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-slate-100 transition-all duration-200"
              disabled={isLoading}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Known Recipes */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">
          Known Recipes ({player.discoveredRecipes.length})
        </h3>
        {player.discoveredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {player.discoveredRecipes.map((recipeId, index) => (
              <div
                key={recipeId}
                className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300"
              >
                <span className="text-sm font-medium">Recipe #{index + 1}</span>
                <p className="text-xs text-slate-400 mt-1">{recipeId}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">No recipes discovered yet. Use the discovery lab above to find new recipes!</p>
        )}
      </div>
    </div>
  );
};

export default RecipeDiscoveryView; 