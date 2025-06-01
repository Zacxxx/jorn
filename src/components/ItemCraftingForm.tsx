

import React, { useState } from 'react';
import ActionButton from '../../ui/ActionButton';
import { GetSpellIcon, ScrollIcon } from './IconComponents'; // Changed WandIcon to ScrollIcon for consumables
import { ItemType } from '../../types';

interface ItemCraftingFormProps {
  itemType: ItemType;
  onInitiateCraft: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const ItemCraftingForm: React.FC<ItemCraftingFormProps> = ({ itemType, onInitiateCraft, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError(`${itemType} concept cannot be empty.`);
      return;
    }
    setError('');
    try {
      await onInitiateCraft(prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : `An unknown error occurred during ${itemType} idea generation.`);
    }
  };

  const examplePrompts = itemType === 'Consumable' ? [ // UPDATED examples for Consumable
    "A bubbling elixir that restores health quickly.",
    "A shimmering salve that clears toxins.",
    "An energizing draught for mages.",
    "A piece of enchanted jerky that briefly enhances strength.",
    "A scroll that creates a small, temporary light source.",
  ] : [
    "A lightweight sword infused with ice magic.",
    "Sturdy armor that resists physical blows.",
    "An amulet that quickens the wearer's reflexes.",
    "A staff that amplifies arcane power.",
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError('');
  };

  const titleIcon = itemType === 'Consumable' ? <ScrollIcon className="w-7 h-7 mr-2 text-sky-400" /> : <GetSpellIcon iconName="SwordHilt" className="w-7 h-7 mr-2 text-sky-400" />;

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-400 flex items-center">
          {titleIcon}
          Describe {itemType} Idea
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 sm:mb-4">
          <label htmlFor="itemPrompt" className="block text-xs sm:text-sm font-medium text-slate-300 mb-0.5 sm:mb-1">
            Describe your {itemType.toLowerCase()} concept:
          </label>
          <textarea
            id="itemPrompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError('');
            }}
            placeholder={itemType === 'Consumable' ? "e.g., 'A potion that grants night vision', 'Food that boosts reflex'" : "e.g., 'A shield that can reflect weak spells'"}
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 placeholder-slate-500"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-400 text-xs sm:text-sm mb-2 sm:mb-3">{error}</p>}
        
        <ActionButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !prompt.trim()}
            variant="primary"
            size="lg"
            className="w-full"
        >
          {isLoading ? 'Generating Idea...' : `Generate ${itemType} Idea`}
        </ActionButton>
      </form>
      <div className="mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(ex)}
              disabled={isLoading}
              className="text-[10px] sm:text-xs bg-slate-700 hover:bg-slate-600 text-sky-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
       <p className="text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4">The AI will generate a {itemType.toLowerCase()} based on your idea, including its properties and resource costs. You will then be able to confirm and craft it if you have the required resources.</p>
    </div>
  );
};

export default ItemCraftingForm;
