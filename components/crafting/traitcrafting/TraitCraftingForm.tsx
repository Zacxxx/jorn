import React, { useState } from 'react';
import ActionButton from "../../battle-ui/layout/ActionButton";
import { StarIcon } from '../../books/IconComponents'; // Assuming StarIcon for traits
import { TRAIT_LEVEL_INTERVAL, FIRST_TRAIT_LEVEL } from '../../../constants';


interface TraitCraftingFormProps {
  onCraftTrait: (prompt: string) => Promise<void>;
  isLoading: boolean;
  currentTraits: number;
  playerLevel: number;
}

const TraitCraftingForm: React.FC<TraitCraftingFormProps> = ({ onCraftTrait, isLoading, currentTraits, playerLevel }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const expectedTraitsForLevel = Math.floor((playerLevel - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1;
  const canCraftMoreTraits = playerLevel >= FIRST_TRAIT_LEVEL && currentTraits < expectedTraitsForLevel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCraftMoreTraits) {
      setError(`You cannot craft more traits at this time. You have ${currentTraits}/${expectedTraitsForLevel} for your level.`);
      return;
    }
    if (!prompt.trim()) {
      setError('Trait concept cannot be empty.');
      return;
    }
    setError('');
    try {
      await onCraftTrait(prompt);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during trait crafting.");
    }
  };

  const examplePrompts = [
    "Enhanced mana regeneration.",
    "Increased resistance to fire.",
    "Aura of minor healing.",
    "Naturally more evasive.",
    "Stronger critical hits.",
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError('');
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
          <StarIcon className="w-7 h-7 mr-2 text-yellow-400" />
          Define New Trait
        </h2>
        <p className={`text-sm font-medium ${canCraftMoreTraits ? 'text-slate-400' : 'text-red-400'}`}>
          Traits Defined: {currentTraits} / {expectedTraitsForLevel} (Player Level: {playerLevel})
        </p>
      </div>
      <p className="text-sm text-slate-300 mb-3">
        You've unlocked a new Trait slot! Describe a passive benefit or characteristic you'd like your hero to embody.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="traitPrompt" className="block text-sm font-medium text-slate-300 mb-1">
            Describe your desired trait:
          </label>
          <textarea
            id="traitPrompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., 'Resilience against dark magic' or 'Slightly faster movement'"
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-slate-200 placeholder-slate-500"
            disabled={isLoading || !canCraftMoreTraits}
          />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!canCraftMoreTraits && !error && (
           <p className="text-yellow-400 text-sm mb-3">
            You have defined all available traits for your current level.
           </p>
        )}
        <ActionButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !prompt.trim() || !canCraftMoreTraits}
            variant="success"
            size="lg"
            className="w-full"
        >
          {isLoading ? 'Defining...' : 'Forge Trait'}
        </ActionButton>
      </form>
      <div className="mt-4">
        <p className="text-sm text-slate-400 mb-2">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(ex)}
              disabled={isLoading || !canCraftMoreTraits}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-yellow-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraitCraftingForm;
