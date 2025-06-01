import React, { useState, useEffect, useMemo } from 'react';
import { Player, SpellComponent, GeneratedSpellData, SpellIconName, TagName, ResourceCost, SpellComponentCategory, ElementName, ResourceType } from '../types';
import { AVAILABLE_SPELL_ICONS } from '../../constants';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';
import { MasterResourceItem } from '../types';
import ActionButton from './ActionButton';
import { WandIcon, TagIcon, HeroBackIcon, FlaskIcon, GoldCoinIcon, EssenceIcon, SearchIcon, FilterListIcon, SaveIcon, BookIcon } from './IconComponents';
import SpellComponentCard from './SpellComponentCard';
import { GetSpellIcon } from './IconComponents';

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

interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  timestamp: number;
  components?: string[];
}

interface ComponentFilter {
  category: SpellComponentCategory | 'all';
  tier: number | 'all';
  element: ElementName | 'all';
  searchText: string;
}

const mergeResourceCosts = (costs1: ResourceCost[], costs2: ResourceCost[]): ResourceCost[] => {
  const merged = [...costs1];
  costs2.forEach(cost2 => {
    const existingIndex = merged.findIndex(c => c.itemId === cost2.itemId);
    if (existingIndex > -1) {
      merged[existingIndex].quantity += cost2.quantity;
    } else {
      merged.push({ ...cost2 });
    }
  });
  return merged;
};

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

  const [componentFilter, setComponentFilter] = useState<ComponentFilter>({
    category: 'all',
    tier: 'all',
    element: 'all',
    searchText: ''
  });
  
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => {
    const saved = localStorage.getItem('jorn-saved-spell-prompts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showPromptManager, setShowPromptManager] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
        setPlayerPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    localStorage.setItem('jorn-saved-spell-prompts', JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  const canCraftMoreSpells = player.spells.length < maxSpells;

  // Filter components based on current filter settings
  const filteredComponents = useMemo(() => {
    return availableComponents.filter(comp => {
      if (componentFilter.category !== 'all' && comp.category !== componentFilter.category) return false;
      if (componentFilter.tier !== 'all' && comp.tier !== componentFilter.tier) return false;
      if (componentFilter.element !== 'all' && comp.element !== componentFilter.element) return false;
      if (componentFilter.searchText && !comp.name.toLowerCase().includes(componentFilter.searchText.toLowerCase())) return false;
      return true;
    });
  }, [availableComponents, componentFilter]);

  // Calculate total crafting costs
  const totalCosts = useMemo(() => {
    let goldCost = 0;
    let essenceCost = 0;
    let resourceCosts: ResourceCost[] = [...manuallyInvestedResources];
    
    selectedComponentIds.forEach(componentId => {
      const component = availableComponents.find(c => c.id === componentId);
      if (component) {
        goldCost += component.usageGoldCost || 0;
        essenceCost += component.usageEssenceCost || 0;
        if (component.baseResourceCost) {
          resourceCosts = mergeResourceCosts(resourceCosts, component.baseResourceCost);
        }
      }
    });
    
    return { goldCost, essenceCost, resourceCosts };
  }, [selectedComponentIds, manuallyInvestedResources, availableComponents]);

  const canAffordCraft = player.gold >= totalCosts.goldCost && 
                         player.essence >= totalCosts.essenceCost &&
                         totalCosts.resourceCosts.every(cost => 
                           (player.inventory[cost.itemId] || 0) >= cost.quantity
                         );

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
  
  const handleInvestResource = (itemId: string, valueStr: string) => {
    const quantity = parseInt(valueStr) || 0;
    setManuallyInvestedResources(prev => {
      if (quantity === 0) {
        return prev.filter(r => r.itemId !== itemId);
      }
      const itemDefCandidateUnchecked = MASTER_ITEM_DEFINITIONS[itemId];
      if (!itemDefCandidateUnchecked) {
        console.warn(`Unknown item ID for investment: ${itemId}`);
        return prev;
      }
      const itemDefCandidate = itemDefCandidateUnchecked;
      if (itemDefCandidate.itemType !== 'Resource') {
        console.warn(`Item ${itemId} is not a resource and cannot be invested.`);
        return prev;
      }
      const item = itemDefCandidate as MasterResourceItem;
      
      const existingIndex = prev.findIndex(r => r.itemId === itemId);
      const newCost: ResourceCost = {
        itemId,
        quantity,
        type: item.name as ResourceType
      };
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newCost;
        return updated;
      } else {
        return [...prev, newCost];
      }
    });
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

  // Calculate total costs for preview
  const calculateTotalCosts = () => {
    let totalGold = 0;
    let totalEssence = 0;
    let totalResourceCosts: ResourceCost[] = [...manuallyInvestedResources];

    // Add component usage costs
    selectedComponentIds.forEach(componentId => {
      const component = availableComponents.find(c => c.id === componentId);
      if (component) {
        totalGold += component.usageGoldCost || 0;
        totalEssence += component.usageEssenceCost || 0;
        
        // Add component base resource costs
        if (component.baseResourceCost) {
          totalResourceCosts = mergeResourceCosts(totalResourceCosts, component.baseResourceCost);
        }
      }
    });

    return {
      gold: totalGold,
      essence: totalEssence,
      resources: totalResourceCosts
    };
  };

  const totalCostsPreview = calculateTotalCosts();
  const canAffordCosts = player.gold >= totalCostsPreview.gold && 
                        player.essence >= totalCostsPreview.essence &&
                        totalCostsPreview.resources.every(cost => (player.inventory[cost.itemId] || 0) >= cost.quantity);

  const saveCurrentPrompt = () => {
    if (!playerPrompt.trim()) {
      setError('Cannot save empty prompt');
      return;
    }
    
    const promptName = prompt('Enter a name for this prompt:');
    if (!promptName) return;
    
    const newSavedPrompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      name: promptName,
      prompt: playerPrompt,
      timestamp: Date.now(),
      components: selectedComponentIds
    };
    
    setSavedPrompts(prev => [newSavedPrompt, ...prev.slice(0, 19)]); // Keep max 20 prompts
    setError('');
  };

  const loadPrompt = (savedPrompt: SavedPrompt) => {
    setPlayerPrompt(savedPrompt.prompt);
    if (savedPrompt.components) {
      setSelectedComponentIds(savedPrompt.components.filter(id => 
        availableComponents.some(comp => comp.id === id)
      ));
    }
    setShowPromptManager(false);
  };

  const deletePrompt = (promptId: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== promptId));
  };

  // Get component explanations
  const getComponentExplanation = (component: SpellComponent): string => {
    const explanations: Record<string, string> = {
      'damage': 'Determines the base damage output of the spell',
      'range': 'Affects how far the spell can reach targets',
      'area': 'Controls the area of effect for multi-target spells',
      'element': 'Adds elemental damage and potential status effects',
      'targeting': 'Defines how the spell selects targets',
      'channeling': 'Adds sustained effects over multiple turns',
      'metamagic': 'Modifies other spell components for enhanced effects',
      'ritual': 'Powerful effects that require preparation time',
      'enchantment': 'Applies mental effects and status conditions',
      'protection': 'Provides defensive bonuses and damage reduction',
      'utility': 'Offers non-combat benefits and strategic advantages'
    };
    return explanations[component.category] || 'This component provides unique magical properties to your spell.';
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <WandIcon className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-semibold text-sky-300">Design Your Spell</h3>
            </div>
            <div className="flex items-center space-x-2">
              <ActionButton 
                onClick={() => setShowPromptManager(!showPromptManager)}
                variant="secondary"
                size="sm"
                icon={<BookIcon />}
              >
                Saved Prompts ({savedPrompts.length})
              </ActionButton>
              <ActionButton 
                onClick={saveCurrentPrompt}
                variant="success"
                size="sm"
                icon={<SaveIcon />}
                disabled={!playerPrompt.trim()}
              >
                Save Prompt
              </ActionButton>
            </div>
          </div>

          {/* Prompt Manager */}
          {showPromptManager && (
            <div className="mb-4 p-4 bg-slate-600/50 rounded-lg border border-slate-500">
              <h4 className="text-lg font-medium text-slate-200 mb-3">Saved Prompts</h4>
              {savedPrompts.length === 0 ? (
                <p className="text-slate-400 italic">No saved prompts yet.</p>
              ) : (
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {savedPrompts.map(savedPrompt => (
                    <div key={savedPrompt.id} className="flex items-center justify-between p-3 bg-slate-500/50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-slate-200">{savedPrompt.name}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(savedPrompt.timestamp).toLocaleDateString()} • {savedPrompt.prompt.length} chars
                          {savedPrompt.components && savedPrompt.components.length > 0 && (
                            <span> • {savedPrompt.components.length} components</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-1 truncate">{savedPrompt.prompt}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <ActionButton 
                          onClick={() => loadPrompt(savedPrompt)}
                          variant="primary"
                          size="sm"
                        >
                          Load
                        </ActionButton>
                        <ActionButton 
                          onClick={() => deletePrompt(savedPrompt.id)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
            <label htmlFor="playerPrompt" className="block text-sm font-medium text-slate-300 mb-2">
              Spell Effect Prompt 
              <span className="text-slate-400 font-normal">(Describe what the spell does)</span>
            </label>
            <div className="mb-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
              <div className="text-xs text-blue-300 font-medium mb-1">💡 Prompting Tips:</div>
              <ul className="text-xs text-blue-200 space-y-1">
                <li>• Be specific about damage types, effects, and targeting</li>
                <li>• Mention if the spell should have status effects or special conditions</li>
                <li>• Include power level hints: "weak", "moderate", "powerful", "devastating"</li>
                <li>• Describe tactical use: "single target nuke", "crowd control", "utility spell"</li>
                <li>• Reference your selected components to guide the AI</li>
              </ul>
            </div>
            <textarea 
              id="playerPrompt" 
              value={playerPrompt} 
              onChange={e => setPlayerPrompt(e.target.value)} 
              placeholder="Example: 'A powerful fire spell that launches a blazing projectile at a single enemy, dealing high fire damage and having a chance to inflict burning. The spell should feel impactful and dangerous, with flames that linger after impact.'" 
              rows={6} 
              className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 resize-none"
            />
            <div className="text-xs text-slate-400 mt-1">
              Characters: {playerPrompt.length} | Selected Components: {selectedComponentIds.length}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
             <label htmlFor="spellLevel" className="block text-sm font-medium text-slate-300 mb-1">Spell Level (1-10)</label>
             <input type="number" id="spellLevel" value={spellLevel} onChange={e => setSpellLevel(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))} min="1" max="10" className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"/>
        </div>

        {/* Component Selection */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FlaskIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-purple-300">Components ({filteredComponents.length}/{availableComponents.length})</h3>
            </div>
            <div className="flex items-center space-x-2">
              <FilterListIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-400">Filter</span>
            </div>
          </div>

          {/* Filtering Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-48">
                <div className="relative">
                  <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={componentFilter.searchText}
                    onChange={e => setComponentFilter(prev => ({...prev, searchText: e.target.value}))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <select
                value={componentFilter.category}
                onChange={e => setComponentFilter(prev => ({...prev, category: e.target.value as any}))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="damage">Damage</option>
                <option value="range">Range</option>
                <option value="area">Area</option>
                <option value="element">Element</option>
                <option value="targeting">Targeting</option>
                <option value="channeling">Channeling</option>
                <option value="metamagic">Metamagic</option>
                <option value="ritual">Ritual</option>
                <option value="enchantment">Enchantment</option>
                <option value="protection">Protection</option>
                <option value="utility">Utility</option>
              </select>

              {/* Tier Filter */}
              <select
                value={componentFilter.tier}
                onChange={e => setComponentFilter(prev => ({...prev, tier: e.target.value === 'all' ? 'all' : parseInt(e.target.value)}))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Tiers</option>
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
                <option value="4">Tier 4</option>
                <option value="5">Tier 5</option>
              </select>

              {/* Element Filter */}
              <select
                value={componentFilter.element}
                onChange={e => setComponentFilter(prev => ({...prev, element: e.target.value as any}))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Elements</option>
                <option value="Fire">Fire</option>
                <option value="Water">Water</option>
                <option value="Earth">Earth</option>
                <option value="Air">Air</option>
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
                <option value="Arcane">Arcane</option>
                <option value="Nature">Nature</option>
              </select>
            </div>
          </div>

          {availableComponents.length === 0 && <p className="text-slate-400 italic">No components researched yet. Visit the Research Lab!</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-60 overflow-y-auto styled-scrollbar pr-2">
            {filteredComponents.map(comp => (
              <SpellComponentCard
                key={comp.id}
                component={comp}
                isSelected={selectedComponentIds.includes(comp.id)}
                onSelect={handleComponentToggle}
                showSelectButton={true}
              />
            ))}
          </div>
        </div>

        {/* Cost Calculator */}
        <div className={`bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border ${canAffordCosts ? 'border-green-500/60' : 'border-red-500/60'} p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <GoldCoinIcon className={`w-6 h-6 ${canAffordCosts ? 'text-green-400' : 'text-red-400'}`} />
            <h3 className={`text-xl font-semibold ${canAffordCosts ? 'text-green-300' : 'text-red-300'}`}>Crafting Cost Preview</h3>
          </div>
          
          <div className="mb-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
            <div className="text-xs text-blue-300 font-medium mb-1">ℹ️ Cost Information:</div>
            <p className="text-xs text-blue-200">
              This shows the guaranteed costs (components + your invested resources). 
              The AI may request additional resources but will only use what you actually have in your inventory.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GoldCoinIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">Gold:</span>
                </div>
                <span className={`font-medium ${player.gold >= totalCostsPreview.gold ? 'text-green-400' : 'text-red-400'}`}>
                  {totalCostsPreview.gold} / {player.gold}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EssenceIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Essence:</span>
                </div>
                <span className={`font-medium ${player.essence >= totalCostsPreview.essence ? 'text-green-400' : 'text-red-400'}`}>
                  {totalCostsPreview.essence} / {player.essence}
                </span>
              </div>
            </div>
            
            {totalCostsPreview.resources.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-slate-400 mb-2">Required Resources:</div>
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
                  {totalCostsPreview.resources.map(cost => {
                    const item = MASTER_ITEM_DEFINITIONS[cost.itemId];
                    const hasEnough = (player.inventory[cost.itemId] || 0) >= cost.quantity;
                    return (
                      <div key={cost.itemId} className={`flex items-center justify-between text-xs ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                        <span>{item?.name || cost.itemId}</span>
                        <span>{cost.quantity} / {player.inventory[cost.itemId] || 0}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {!canAffordCosts && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-md">
              <p className="text-red-300 text-sm">⚠️ Insufficient resources for guaranteed costs!</p>
            </div>
          )}
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
                      {param.type === 'numberInput' && (
                        <input 
                          type="number" 
                          id={`${id}-${param.key}`}
                          min={param.min} 
                          max={param.max}
                          step={param.step}
                          value={componentConfigs[id]?.[param.key] ?? param.defaultValue}
                          onChange={e => handleParamChange(id, param.key, parseInt(e.target.value) || param.defaultValue)}
                          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                        />
                      )}
                      {param.type === 'dropdown' && (
                        <select
                          id={`${id}-${param.key}`}
                          value={componentConfigs[id]?.[param.key] ?? param.defaultValue}
                          onChange={e => handleParamChange(id, param.key, e.target.value)}
                          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                        >
                          {param.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
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
          <ActionButton type="submit" isLoading={isLoading} disabled={!canCraftMoreSpells || isLoading || selectedComponentIds.length === 0 || !canAffordCosts} variant="primary" size="lg" className="w-full sm:w-auto">
            {isLoading ? 'Generating...' : 'Finalize Design with AI'}
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default SpellDesignStudioView;