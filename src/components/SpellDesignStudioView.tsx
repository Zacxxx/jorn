import React, { useState, useEffect } from 'react';
import { Player, SpellComponent, ResourceCost, SpellIconName, ResourceType, MasterResourceItem, MasterItemDefinition, TagName } from '../types';
import ActionButton from '../../ui/ActionButton';
// import LoadingSpinner from './LoadingSpinner'; // Assuming it might be used later
import { GetSpellIcon, WandIcon, AtomIcon, GoldCoinIcon, TagIcon } from './IconComponents';
import SpellComponentCard from './SpellComponentCard'; // Corrected import
import { AVAILABLE_SPELL_ICONS, RESOURCE_ICONS, AVAILABLE_RESOURCES } from '../constants';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService'; 
import { generateSpellFromDesign } from '../services/geminiService';

interface SpellDesignStudioViewProps {
  player: Player;
  availableComponents: SpellComponent[];
  onFinalizeDesign: (designData: {
    level: number;
    componentsUsed: Array<{ componentId: string; configuration: Record<string, string | number> }>;
    investedResources: ResourceCost[];
    playerName?: string;
    playerDescription?: string;
    playerIcon?: SpellIconName;
    playerPrompt?: string;
    selectedTags?: TagName[];
  }) => Promise<void>;
  isLoading: boolean;
  onReturnHome: () => void;
  maxSpells: number;
  initialPrompt?: string; 
}

// Helper function to merge resource cost arrays
function mergeResourceCosts(list1: ResourceCost[] | undefined, list2: ResourceCost[] | undefined): ResourceCost[] {
    const mergedMap = new Map<string, ResourceCost>();

    function addToMap(costs: ResourceCost[] | undefined) {
        if (!costs) return;
        for (const cost of costs) {
            if (mergedMap.has(cost.itemId)) {
                const existing = mergedMap.get(cost.itemId)!;
                existing.quantity += cost.quantity;
            } else {
                mergedMap.set(cost.itemId, { ...cost });
            }
        }
    }
    addToMap(list1);
    addToMap(list2);
    return Array.from(mergedMap.values());
}


const SpellDesignStudioView: React.FC<SpellDesignStudioViewProps> = ({
  player,
  availableComponents,
  onFinalizeDesign,
  isLoading,
  onReturnHome,
  maxSpells,
  initialPrompt,
}) => {
  const [spellName, setSpellName] = useState('');
  const [spellDescription, setSpellDescription] = useState('');
  const [spellIcon, setSpellIcon] = useState<SpellIconName>('Default');
  const [spellLevel, setSpellLevel] = useState(1);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [componentConfigs, setComponentConfigs] = useState<Record<string, Record<string, string | number>>>({});
  const [manuallyInvestedResources, setManuallyInvestedResources] = useState<ResourceCost[]>([]);
  const [playerPrompt, setPlayerPrompt] = useState(initialPrompt || ''); 
  const [selectedTags, setSelectedTags] = useState<TagName[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPrompt) {
        setPlayerPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const canCraftMoreSpells = player.spells.length < maxSpells;

  // Get all available tags from selected components
  const getAvailableTagsFromComponents = (): { tag: TagName; componentName: string }[] => {
    const tagMap = new Map<TagName, string>();
    selectedComponentIds.forEach(componentId => {
      const component = availableComponents.find(c => c.id === componentId);
      if (component && component.tags) {
        component.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, component.name);
          }
        });
      }
    });
    return Array.from(tagMap.entries()).map(([tag, componentName]) => ({ tag, componentName }));
  };

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponentIds(prev =>
      prev.includes(componentId) ? prev.filter(id => id !== componentId) : [...prev, componentId]
    );
    
    if (!componentConfigs[componentId]) {
        const component = availableComponents.find(c => c.id === componentId);
        if (component && component.configurableParameters) {
            const initialConfig: Record<string, string | number> = {};
            component.configurableParameters.forEach(p => {
                initialConfig[p.key] = p.defaultValue;
            });
            setComponentConfigs(prev => ({...prev, [componentId]: initialConfig}));
        }
    }
  };

  const handleTagToggle = (tag: TagName) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleParamChange = (componentId: string, paramKey: string, value: string | number) => {
    const paramConfig = availableComponents.find(c => c.id === componentId)?.configurableParameters?.find(p => p.key === paramKey);
    let processedValue = value;
    if (paramConfig && paramConfig.type === 'slider' && typeof value === 'string') {
        processedValue = parseInt(value, 10);
        if (isNaN(processedValue)) {
            processedValue = paramConfig.defaultValue as number; 
        }
    }

    setComponentConfigs(prev => ({
      ...prev,
      [componentId]: {
        ...(prev[componentId] || {}), 
        [paramKey]: processedValue,
      },
    }));
  };
  
  const handleInvestResource = (itemId: string, quantityStr: string) => {
    const quantity = parseInt(quantityStr) || 0;
    const itemDefCandidateUnchecked: MasterItemDefinition | undefined = MASTER_ITEM_DEFINITIONS[itemId];

    if (!itemDefCandidateUnchecked) {
        console.error(`Cannot invest unknown item ID: ${itemId}`);
        setError(`Item ID "${itemId}" not found in definitions.`);
        return;
    }
    
    const itemDefCandidate = itemDefCandidateUnchecked; // Type is MasterItemDefinition here

    if (itemDefCandidate.itemType !== 'Resource') {
        console.error(`Item ${itemId} (${itemDefCandidate.name}) is a ${itemDefCandidate.itemType}, not a Resource. Cannot invest.`);
        setError(`Item "${itemDefCandidate.name}" is not a Resource type and cannot be invested here.`);
        return;
    }
      
    const resourceItemDef = itemDefCandidate as MasterResourceItem; 
      
    if (quantity <= 0) {
        setManuallyInvestedResources(prev => prev.filter(r => r.itemId !== itemId));
        return;
    }
    const playerHas = player.inventory[itemId] || 0;
    const newQuantity = Math.min(quantity, playerHas);

    const currentInvestmentIndex = manuallyInvestedResources.findIndex(r => r.itemId === itemId);

    if (currentInvestmentIndex > -1) {
        setManuallyInvestedResources(prev => prev.map((r, idx) => idx === currentInvestmentIndex ? {...r, quantity: newQuantity} : r));
    } else if (newQuantity > 0) { 
        setManuallyInvestedResources(prev => [...prev, {itemId, quantity: newQuantity, type: resourceItemDef.name as ResourceType }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCraftMoreSpells) {
      setError(`Spellbook full (${player.spells.length}/${maxSpells}). Level up to learn more!`);
      return;
    }
    if (selectedComponentIds.length === 0) {
      setError('Please select at least one spell component.');
      return;
    }
    setError('');

    let combinedInvestedResources: ResourceCost[] = [...manuallyInvestedResources];
    selectedComponentIds.forEach(componentId => {
        const component = availableComponents.find(c => c.id === componentId);
        if (component && component.baseResourceCost) {
            combinedInvestedResources = mergeResourceCosts(combinedInvestedResources, component.baseResourceCost);
        }
    });


    try {
      await onFinalizeDesign({
        level: spellLevel,
        componentsUsed: selectedComponentIds.map(id => ({
          componentId: id,
          configuration: componentConfigs[id] || {},
        })),
        investedResources: combinedInvestedResources,
        playerName: spellName.trim() || undefined,
        playerDescription: spellDescription.trim() || undefined,
        playerIcon: spellIcon === 'Default' ? undefined : spellIcon,
        playerPrompt: playerPrompt.trim() || undefined,
        selectedTags: selectedTags,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize spell design.');
    }
  };

  const availableResourceItems = Object.values(MASTER_ITEM_DEFINITIONS).filter(item => item.itemType === 'Resource') as MasterResourceItem[];


  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-slate-100">
      <h2 className="text-2xl font-bold text-sky-300 mb-6 text-center flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
        <WandIcon className="w-8 h-8 mr-3 text-sky-400" />
        Spell Design Studio
      </h2>
      {!canCraftMoreSpells && (
        <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-md border border-red-700/50 mb-4">
          Your spell collection is full ({player.spells.length}/{maxSpells}). Level up or manage existing spells.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-lg font-semibold text-sky-200 mb-3">Spell Concept (Optional AI Guidance)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="spellName" className="block text-sm font-medium text-slate-300 mb-1">Your Spell Name Idea</label>
              <input type="text" id="spellName" value={spellName} onChange={e => setSpellName(e.target.value)} placeholder="e.g., Azure Comet" className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div>
              <label htmlFor="spellIcon" className="block text-sm font-medium text-slate-300 mb-1">Suggest Icon</label>
              <select id="spellIcon" value={spellIcon} onChange={e => setSpellIcon(e.target.value as SpellIconName)} className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500">
                {AVAILABLE_SPELL_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="spellDescription" className="block text-sm font-medium text-slate-300 mb-1">Your Description Idea</label>
            <textarea id="spellDescription" value={spellDescription} onChange={e => setSpellDescription(e.target.value)} placeholder="e.g., A fast moving shard of pure ice..." rows={2} className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"></textarea>
          </div>
           <div className="mt-4">
            <label htmlFor="playerPrompt" className="block text-sm font-medium text-slate-300 mb-1">General Idea/Prompt for AI</label>
            <textarea id="playerPrompt" value={playerPrompt} onChange={e => setPlayerPrompt(e.target.value)} placeholder="e.g., 'A defensive spell that uses earth magic' or initial prompt if provided." rows={2} className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"></textarea>
          </div>
        </div>

        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
             <label htmlFor="spellLevel" className="block text-sm font-medium text-slate-300 mb-1">Spell Level (1-10)</label>
             <input type="number" id="spellLevel" value={spellLevel} onChange={e => setSpellLevel(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))} min="1" max="10" className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"/>
        </div>

        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-lg font-semibold text-sky-200 mb-3">Select Components ({selectedComponentIds.length})</h3>
          {availableComponents.length === 0 && <p className="text-slate-400 italic">No components researched yet. Visit the Research Lab!</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-60 overflow-y-auto styled-scrollbar pr-2">
            {availableComponents.map(comp => (
              <SpellComponentCard
                key={comp.id}
                component={comp}
                onSelect={handleComponentToggle}
                isSelected={selectedComponentIds.includes(comp.id)}
                showSelectButton={true} 
              />
            ))}
          </div>
        </div>
        
        {/* Component Tags Selection */}
        {selectedComponentIds.length > 0 && getAvailableTagsFromComponents().length > 0 && (
          <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
            <h3 className="text-lg font-semibold text-sky-200 mb-3 flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-purple-400"/>
              Component Tags - Guarantee Effects ({selectedTags.length} selected)
            </h3>
            <p className="text-xs text-slate-400 mb-3">Select tags from your components to guarantee their effects in the final spell:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {getAvailableTagsFromComponents().map(({ tag, componentName }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`p-2 rounded-md border text-left text-xs transition-all ${
                    selectedTags.includes(tag) 
                      ? 'bg-purple-700 border-purple-500 shadow-lg' 
                      : 'bg-slate-600 border-slate-500 hover:border-purple-600'
                  }`}
                  title={`From ${componentName}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-100">{tag}</span>
                    {selectedTags.includes(tag) && (
                      <span className="text-purple-300">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">From: {componentName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedComponentIds.length > 0 && (
        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-lg font-semibold text-sky-200 mb-3">Configure Selected Components</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto styled-scrollbar pr-2">
            {selectedComponentIds.map(id => {
              const comp = availableComponents.find(c => c.id === id);
              if (!comp || !comp.configurableParameters || comp.configurableParameters.length === 0) return null;
              return (
                <div key={id} className="p-3 bg-slate-600/70 rounded-md border border-slate-500/70">
                  <h4 className="text-md font-semibold text-slate-100 mb-2">{comp.name} Parameters</h4>
                  {comp.configurableParameters.map(param => (
                    <div key={param.key} className="mb-2">
                      <label htmlFor={`${id}-${param.key}`} className="block text-xs font-medium text-slate-300 mb-0.5">{param.label}</label>
                      {param.type === 'slider' && (
                        <div className="flex items-center space-x-2">
                            <input type="range" id={`${id}-${param.key}`} min={param.min} max={param.max} step={param.step}
                                value={componentConfigs[id]?.[param.key] ?? param.defaultValue}
                                onChange={e => handleParamChange(id, param.key, e.target.value)}
                                className="w-full h-2 bg-slate-500 rounded-lg appearance-none cursor-pointer accent-sky-500"
                            />
                            <span className="text-xs text-slate-200 w-8 text-right">{componentConfigs[id]?.[param.key] ?? param.defaultValue}</span>
                        </div>
                      )}
                       {/* TODO: Add inputs for 'numberInput' and 'dropdown' types if needed */}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        )}

        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
            <h3 className="text-lg font-semibold text-sky-200 mb-3">Invest Resources (Optional)</h3>
            <p className="text-xs text-slate-400 mb-2">Investing resources can influence the final spell's power or reduce its mana cost, as determined by the AI. Component base costs will be added automatically.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableResourceItems.map(resItemDef => {
                const playerHas = player.inventory[resItemDef.id] || 0;
                return (
                    <div key={resItemDef.id}>
                    <label htmlFor={`invest-${resItemDef.id}`} className="block text-xs font-medium text-slate-300 mb-0.5 flex items-center">
                        <GetSpellIcon iconName={resItemDef.iconName} className="w-3 h-3 mr-1"/>
                        {resItemDef.name} (Have: {playerHas})
                    </label>
                    <input type="number" id={`invest-${resItemDef.id}`} min="0" max={playerHas}
                            value={manuallyInvestedResources.find(r => r.itemId === resItemDef.id)?.quantity || 0}
                            onChange={e => handleInvestResource(resItemDef.id, e.target.value)}
                            className="w-full p-1.5 bg-slate-600 border border-slate-500 rounded-md text-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                            disabled={playerHas === 0}
                    />
                    </div>
                );
            })}
            </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-md border border-red-700/50">{error}</p>}

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-slate-600">
          <ActionButton type="button" onClick={onReturnHome} variant="secondary" size="lg" className="w-full sm:w-auto">
            Cancel
          </ActionButton>
          <ActionButton type="submit" isLoading={isLoading} disabled={!canCraftMoreSpells || isLoading || selectedComponentIds.length === 0} variant="primary" size="lg" className="w-full sm:w-auto">
            {isLoading ? 'Generating...' : 'Finalize Design with AI'}
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default SpellDesignStudioView;
