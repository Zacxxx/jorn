
import React, { useState, useEffect } from 'react';
import { Spell, ResourceCost } from '../types';
import ActionButton from '../ui/ActionButton';
import { WandIcon, GetSpellIcon } from './IconComponents';
import { RESOURCE_ICONS } from '../constants';

interface SpellEditingFormProps {
  originalSpell: Spell;
  onInitiateSpellEdit: (originalSpell: Spell, refinementPrompt: string) => Promise<void>; // Renamed
  isLoading: boolean;
  onCancel: () => void;
}

const SpellEditingForm: React.FC<SpellEditingFormProps> = ({ originalSpell, onInitiateSpellEdit, isLoading, onCancel }) => {
  const [name, setName] = useState(originalSpell.name);
  const [description, setDescription] = useState(originalSpell.description);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(originalSpell.name);
    setDescription(originalSpell.description);
    setRefinementPrompt('');
    setError('');
  }, [originalSpell]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim()) {
      setError('Please provide some instructions on how to refine the spell.');
      return;
    }
    setError('');
    try {
      await onInitiateSpellEdit(originalSpell, refinementPrompt); // Triggers AI refinement
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during spell refinement idea generation.");
    }
  };

  const renderResourceCosts = (costs: ResourceCost[]) => (
    <div className="mt-1.5">
      <p className="text-xs text-amber-300/80 font-semibold mb-0.5">Current Crafting Cost:</p>
      <div className="flex flex-wrap gap-1.5">
        {costs.map(cost => (
          <div key={cost.type} className="flex items-center text-xs text-amber-400 bg-slate-900/50 px-1.5 py-0.5 rounded" title={`${cost.quantity} ${cost.type}`}>
            <GetSpellIcon iconName={RESOURCE_ICONS[cost.type] || 'Default'} className="w-3 h-3 mr-1 opacity-80" />
            {cost.quantity} {cost.type.split(' ')[0]}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-sky-400 flex items-center">
          <WandIcon className="w-7 h-7 mr-2 text-sky-400" />
          Refine Spell: {originalSpell.name}
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 p-3 bg-slate-700/50 rounded-md">
            <p className="text-sm font-medium text-slate-300">Original Spell Details:</p>
            <p className="text-xs text-slate-400">Name: {name}</p>
            <p className="text-xs text-slate-400">Description: {description}</p>
            <p className="text-xs text-slate-400">Mana: {originalSpell.manaCost}, Dmg: {originalSpell.damage} ({originalSpell.damageType})</p>
            {originalSpell.effect && <p className="text-xs text-slate-400">Effect: {originalSpell.effect}</p>}
            {originalSpell.resourceCost && originalSpell.resourceCost.length > 0 && renderResourceCosts(originalSpell.resourceCost)}
        </div>

        <div className="mb-4">
          <label htmlFor="refinementPrompt" className="block text-sm font-medium text-slate-300 mb-1">
            How would you like to change this spell?
          </label>
          <textarea
            id="refinementPrompt"
            value={refinementPrompt}
            onChange={(e) => {
              setRefinementPrompt(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., 'Make it stronger and fire-based', 'Reduce mana cost but add a slight chance to misfire', 'Change its effect to heal over time and require Verdant Leaves'"
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 placeholder-slate-500"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex space-x-4">
          <ActionButton
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              variant="secondary"
              size="lg"
              className="flex-1"
          >
            Cancel
          </ActionButton>
          <ActionButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !refinementPrompt.trim()}
              variant="primary"
              size="lg"
              className="flex-1"
          >
            {isLoading ? 'Generating Refinement...' : 'Generate Refinement Idea'}
          </ActionButton>
        </div>
      </form>
       <div className="mt-4 text-xs text-slate-500">
          <p>The AI will attempt to modify the spell based on your instructions, including its stats and resource costs. You will then be able to confirm the changes.</p>
        </div>
    </div>
  );
};

export default SpellEditingForm;
