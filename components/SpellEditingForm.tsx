import React, { useState, useEffect } from 'react';
import { Spell, ResourceCost, SpellComponent, Player } from '../types';
import ActionButton from '../ui/ActionButton';
import { WandIcon, GetSpellIcon, StarIcon, AtomIcon } from './IconComponents';
import { RESOURCE_ICONS } from '../constants';

interface SpellEditingFormProps {
  originalSpell: Spell;
  onInitiateSpellEdit: (originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  player: Player;
  availableComponents: SpellComponent[];
}

const SpellEditingForm: React.FC<SpellEditingFormProps> = ({ 
  originalSpell, 
  onInitiateSpellEdit, 
  isLoading, 
  onCancel,
  player,
  availableComponents 
}) => {
  const [name, setName] = useState(originalSpell.name);
  const [description, setDescription] = useState(originalSpell.description);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [augmentLevel, setAugmentLevel] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [error, setError] = useState('');

  const playerEssence = player.inventory['essence'] || 0;
  const maxAugmentLevel = Math.min(5, Math.floor(playerEssence / 10)); // 10 essence per augment level, max 5 levels

  useEffect(() => {
    setName(originalSpell.name);
    setDescription(originalSpell.description);
    setRefinementPrompt('');
    setAugmentLevel(0);
    setSelectedComponentId('');
    setError('');
  }, [originalSpell]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim() && augmentLevel === 0 && !selectedComponentId) {
      setError('Please provide refinement instructions, select an augment level, or choose a component to add.');
      return;
    }
    setError('');
    try {
      await onInitiateSpellEdit(
        originalSpell, 
        refinementPrompt, 
        augmentLevel > 0 ? augmentLevel : undefined,
        selectedComponentId || undefined
      );
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

        {/* Augment Level Section */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-md font-semibold text-sky-200 mb-2 flex items-center">
            <StarIcon className="w-4 h-4 mr-2 text-yellow-400"/>
            Augment Level (Use Essence to make stronger)
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Cost: {augmentLevel * 10} Essence (You have: {playerEssence})
          </p>
          <div className="flex items-center space-x-3">
            <label htmlFor="augmentLevel" className="text-sm text-slate-300 min-w-0">
              Level: {augmentLevel}/{maxAugmentLevel}
            </label>
            <input
              id="augmentLevel"
              type="range"
              min="0"
              max={maxAugmentLevel}
              value={augmentLevel}
              onChange={(e) => {
                setAugmentLevel(Number(e.target.value));
                if (error) setError('');
              }}
              className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              disabled={isLoading || maxAugmentLevel === 0}
            />
          </div>
          {maxAugmentLevel === 0 && (
            <p className="text-xs text-yellow-400 mt-1">Not enough essence (need at least 10)</p>
          )}
        </div>

        {/* Add Component Section */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-md font-semibold text-sky-200 mb-2 flex items-center">
            <AtomIcon className="w-4 h-4 mr-2 text-purple-400"/>
            Add Component Modification
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Attempt to integrate a component into your existing spell
          </p>
          <select
            id="selectedComponentId"
            value={selectedComponentId}
            onChange={(e) => {
              setSelectedComponentId(e.target.value);
              if (error) setError('');
            }}
            className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200"
            disabled={isLoading}
          >
            <option value="">No component modification</option>
            {availableComponents.map(component => (
              <option key={component.id} value={component.id}>
                {component.name} - {component.category} (Tier {component.tier})
              </option>
            ))}
          </select>
          {selectedComponentId && (
            <div className="mt-2 p-2 bg-slate-600/50 rounded text-xs">
              {(() => {
                const component = availableComponents.find(c => c.id === selectedComponentId);
                return component ? (
                  <>
                    <p className="text-slate-300 mb-1">{component.description}</p>
                    {component.tags && component.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-purple-300/80">Tags:</span>
                        {component.tags.map(tag => (
                          <span key={tag} className="bg-purple-900/60 text-purple-200 px-1 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : null;
              })()}
            </div>
          )}
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
              disabled={isLoading || (!refinementPrompt.trim() && augmentLevel === 0 && !selectedComponentId)}
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
