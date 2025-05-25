import React, { useState, useEffect } from 'react';
import ActionButton from '../../battle-ui/layout/ActionButton';
import { GetSpellIcon, ScrollIcon } from '../../books/IconComponents'; // Changed WandIcon to ScrollIcon for consumables
import { ItemType } from '../../../types';

interface ItemCraftingFormProps {
  itemType: ItemType;
  onInitiateCraft: (prompt: string, quantity: number) => Promise<void>;
  isLoading: boolean;
  lastCraftedPrompt?: string;
  lastCraftedQuantity?: number;
  onClearLastCrafted?: () => void;
}

const ItemCraftingForm: React.FC<ItemCraftingFormProps> = ({ itemType, onInitiateCraft, isLoading, lastCraftedPrompt, lastCraftedQuantity, onClearLastCrafted }) => {
  const [prompt, setPrompt] = useState(lastCraftedPrompt || '');
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState<number>(lastCraftedQuantity || 1);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [selectedSavedPrompt, setSelectedSavedPrompt] = useState<string>('');

  useEffect(() => {
    const loadedPrompts = localStorage.getItem(`saved${itemType}Prompts`);
    if (loadedPrompts) {
      setSavedPrompts(JSON.parse(loadedPrompts));
    }
    if (lastCraftedPrompt) {
      setPrompt(lastCraftedPrompt);
    }
    if (lastCraftedQuantity) {
      setQuantity(lastCraftedQuantity);
    }
  }, [itemType, lastCraftedPrompt, lastCraftedQuantity]);

  const savePrompt = () => {
    if (prompt && !savedPrompts.includes(prompt)) {
      const updatedPrompts = [...savedPrompts, prompt];
      setSavedPrompts(updatedPrompts);
      localStorage.setItem(`saved${itemType}Prompts`, JSON.stringify(updatedPrompts));
      setSelectedSavedPrompt(prompt);
    }
  };

  const loadPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setSelectedSavedPrompt(selectedPrompt);
    setError('');
  };

  const deleteSavedPrompt = (promptToDelete: string) => {
    const updatedPrompts = savedPrompts.filter(p => p !== promptToDelete);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem(`saved${itemType}Prompts`, JSON.stringify(updatedPrompts));
    if (selectedSavedPrompt === promptToDelete) {
      setSelectedSavedPrompt('');
      if(prompt === promptToDelete) setPrompt('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError(`${itemType} concept cannot be empty.`);
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    setError('');
    try {
      await onInitiateCraft(prompt, quantity);
      if (onClearLastCrafted && prompt === lastCraftedPrompt && quantity === lastCraftedQuantity) {
        onClearLastCrafted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `An unknown error occurred during ${itemType} idea generation.`);
    }
  };

  const examplePrompts = itemType === 'Consumable' ? [
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
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-sky-400 flex items-center">
          {titleIcon}
          Describe {itemType} Idea
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="itemPrompt" className="block text-sm font-medium text-slate-300 mb-1">
            Describe your {itemType.toLowerCase()} concept:
          </label>
          <div className="flex flex-col sm:flex-row gap-2 items-start">
            <textarea
              id="itemPrompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError('');
                setSelectedSavedPrompt('');
              }}
              placeholder={itemType === 'Consumable' ? "e.g., 'A potion that grants night vision', 'Food that boosts reflex'" : "e.g., 'A shield that can reflect weak spells'"}
              rows={3}
              className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 placeholder-slate-500"
              disabled={isLoading}
            />
            <ActionButton
                onClick={savePrompt}
                variant="outline"
                size="sm"
                className="h-auto mt-0.5 px-3 py-1.5 self-start transition-all duration-150 hover:bg-sky-700 hover:text-white"
                disabled={isLoading || !prompt.trim() || savedPrompts.includes(prompt)}
                title={savedPrompts.includes(prompt) ? "Prompt already saved" : "Save current prompt"}
            >
                Save
            </ActionButton>
          </div>
        </div>

        <div className="mb-4">
            <label htmlFor="itemQuantity" className="block text-sm font-medium text-slate-300 mb-1">
                Quantity:
            </label>
            <input 
                type="number"
                id="itemQuantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                className="w-24 p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200"
                disabled={isLoading}
            />
        </div>

        {savedPrompts.length > 0 && (
          <div className="mb-4">
            <label htmlFor="savedPromptsSelect" className="block text-sm font-medium text-slate-300 mb-1">
              Load a saved prompt:
            </label>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                <select
                id="savedPromptsSelect"
                value={selectedSavedPrompt}
                onChange={(e) => loadPrompt(e.target.value)}
                className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 transition-colors duration-150 hover:border-sky-500"
                disabled={isLoading}
                >
                <option value="">-- Select a prompt --</option>
                {savedPrompts.map((sp, idx) => (
                    <option key={idx} value={sp}>{sp.length > 50 ? sp.substring(0, 47) + "..." : sp}</option>
                ))}
                </select>
                {selectedSavedPrompt && (
                    <ActionButton
                        onClick={() => deleteSavedPrompt(selectedSavedPrompt)}
                        variant="danger_outline"
                        size="sm"
                        className="h-auto px-3 py-1.5 self-center transition-all duration-150 hover:bg-red-700 hover:text-white"
                        disabled={isLoading}
                        title="Delete selected saved prompt"
                    >
                        Delete
                    </ActionButton>
                )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        
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
      <div className="mt-4">
        <p className="text-sm text-slate-400 mb-2">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(ex)}
              disabled={isLoading}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-sky-300 px-2 py-1 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
       <p className="text-xs text-slate-500 mt-4">The AI will generate a {itemType.toLowerCase()} based on your idea, including its properties and resource costs. You will then be able to confirm and craft it if you have the required resources.</p>
    </div>
  );
};

export default ItemCraftingForm;