
import React, { useState } from 'react';
import ActionButton from '../../ui/ActionButton';
import { WandIcon } from './IconComponents';

interface SpellCraftingFormProps {
  onInitiateSpellCraft: (prompt: string) => Promise<void>; // Renamed to reflect new flow
  isLoading: boolean;
  currentSpells: number;
  maxSpells: number;
}

const SpellCraftingForm: React.FC<SpellCraftingFormProps> = ({ onInitiateSpellCraft, isLoading, currentSpells, maxSpells }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const canCraftMoreSpells = currentSpells < maxSpells;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCraftMoreSpells) {
      setError(`Spellbook full for your current level (${currentSpells}/${maxSpells}). Level up to learn more!`);
      return;
    }
    if (!prompt.trim()) {
      setError('Spell description cannot be empty.');
      return;
    }
    setError('');
    try {
      await onInitiateSpellCraft(prompt); // This will now just trigger AI generation
      // setPrompt(''); // Clearing prompt might be better done after final confirmation in App.tsx
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during spell idea generation.");
    }
  };

  const examplePrompts = [
    "A mighty fireball that explodes.",
    "An icy spear that chills foes.",
    "A bolt of lightning that zaps targets.",
    "A soothing light that mends wounds.",
    "A shadowy tendril that drains life.",
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError('');
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-sky-400 flex items-center">
          <WandIcon className="w-7 h-7 mr-2 text-sky-400" />
          Describe Spell Idea
        </h2>
        <p className={`text-sm font-medium ${canCraftMoreSpells ? 'text-slate-400' : 'text-red-400'}`}>
          Spells: {currentSpells} / {maxSpells}
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="spellPrompt" className="block text-sm font-medium text-slate-300 mb-1">
            Describe your spell concept:
          </label>
          <textarea
            id="spellPrompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., 'A cascade of healing rain' or 'Summon a tiny, angry fire sprite'"
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 placeholder-slate-500"
            disabled={isLoading || !canCraftMoreSpells}
          />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!canCraftMoreSpells && !error && (
           <p className="text-yellow-400 text-sm mb-3">
            Your spellbook is full for your current level. Level up to increase capacity.
           </p>
        )}
        <ActionButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !prompt.trim() || !canCraftMoreSpells}
            variant="primary"
            size="lg"
            className="w-full"
        >
          {isLoading ? 'Generating Idea...' : 'Generate Spell Idea'}
        </ActionButton>
      </form>
      <div className="mt-4">
        <p className="text-sm text-slate-400 mb-2">Or try an example (if space available):</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(ex)}
              disabled={isLoading || !canCraftMoreSpells}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-sky-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
       <p className="text-xs text-slate-500 mt-4">The AI will generate a spell based on your idea, including its stats and resource costs. You will then be able to confirm and craft it if you have the required resources.</p>
    </div>
  );
};

export default SpellCraftingForm;
