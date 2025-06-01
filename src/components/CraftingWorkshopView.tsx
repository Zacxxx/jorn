import React, { useState, useMemo } from 'react';
import { Player, ItemType } from '../types';
import ActionButton from '../../ui/ActionButton';
import { GearIcon, HeroBackIcon, FlaskIcon, CheckmarkCircleIcon, GoldCoinIcon, SearchIcon, FilterListIcon, BookIcon, WandIcon, AtomIcon } from './IconComponents';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';
import { getAllRecipes, getRecipeById } from '../../services/craftingService';
import ItemCraftingForm from './ItemCraftingForm';

interface CraftingWorkshopViewProps {
  player: Player;
  onReturnHome: () => void;
  onCraftItem: (recipeId: string) => Promise<void>;
  onDiscoverRecipe: (prompt: string) => Promise<void>;
  onOpenSpellDesignStudio: (initialPrompt?: string) => void;
  onOpenTheorizeLab: () => void;
  onAICreateComponent: (prompt: string, goldInvested: number, essenceInvested: number) => Promise<any>;
  onInitiateAppItemCraft: (prompt: string, itemType: ItemType) => Promise<void>;
  isLoading: boolean;
  onShowMessage: (title: string, message: string) => void;
}

type TabType = 'craft' | 'discover' | 'spells' | 'research' | 'items';

const CraftingWorkshopView: React.FC<CraftingWorkshopViewProps> = ({
  player,
  onReturnHome,
  onCraftItem,
  onDiscoverRecipe,
  onOpenSpellDesignStudio,
  onOpenTheorizeLab,
  onAICreateComponent,
  onInitiateAppItemCraft,
  isLoading,
  onShowMessage,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('craft');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'equipment' | 'component'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'time' | 'craftable'>('name');
  const [showOnlyCraftable, setShowOnlyCraftable] = useState(false);
  const [discoveryPrompt, setDiscoveryPrompt] = useState('');
  const [spellPrompt, setSpellPrompt] = useState('');
  const [researchPrompt, setResearchPrompt] = useState('');
  const [goldInvestment, setGoldInvestment] = useState(50);
  const [essenceInvestment, setEssenceInvestment] = useState(10);
  const [activeItemCraftType, setActiveItemCraftType] = useState<ItemType>('Consumable');

  // Get all available recipes from the crafting service
  const allRecipes = getAllRecipes();
  
  // Filter recipes based on player's discovered recipes
  const knownRecipes = allRecipes.filter(recipe => {
    // Check if player has discovered this recipe
    return player.discoveredRecipes.includes(recipe.id) ||
           recipe.discovered === true ||
           // Also check for partial matches in case recipe IDs were generated differently
           player.discoveredRecipes.some(discoveredId => 
             discoveredId.includes(recipe.name.toLowerCase().replace(/\s+/g, '_')) ||
             discoveredId.includes(recipe.id)
           );
  });

  // Add some default recipes that should always be available for testing
  const defaultAvailableRecipes = allRecipes.filter(recipe => 
    recipe.id === 'basic_health_potion' || 
    recipe.id === 'iron_sword_basic' ||
    recipe.requirements.some(req => req.type === 'level' && (req.value as number) <= player.level)
  );

  // Combine known recipes with default available ones (remove duplicates)
  const availableRecipes = [...new Map([...knownRecipes, ...defaultAvailableRecipes].map(recipe => [recipe.id, recipe])).values()];
  
  const canCraftRecipe = (recipe: any): boolean => {
    // Check ingredients
    const hasIngredients = recipe.ingredients.every((ingredient: any) => 
      (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
    );
    
    // Check requirements
    const meetsRequirements = recipe.requirements.every((req: any) => {
      if (req.type === 'level') return player.level >= (req.value as number);
      if (req.type === 'location') return true; // For now, assume location requirements are met
      if (req.type === 'skill') return true; // For now, assume skill requirements are met
      if (req.type === 'tool') return true; // For now, assume tool requirements are met
      return true;
    });
    
    return hasIngredients && meetsRequirements;
  };

  // Advanced filtering and sorting
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = availableRecipes;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some((ing: any) => 
          (MASTER_ITEM_DEFINITIONS[ing.itemId]?.name || ing.type).toLowerCase().includes(searchLower)
        )
      );
    }

    // Craftable filter
    if (showOnlyCraftable) {
      filtered = filtered.filter(recipe => canCraftRecipe(recipe));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          const aLevel = a.requirements.find((req: any) => req.type === 'level')?.value || 0;
          const bLevel = b.requirements.find((req: any) => req.type === 'level')?.value || 0;
          return (aLevel as number) - (bLevel as number);
        case 'time':
          return a.craftingTime - b.craftingTime;
        case 'craftable':
          const aCraftable = canCraftRecipe(a) ? 1 : 0;
          const bCraftable = canCraftRecipe(b) ? 1 : 0;
          return bCraftable - aCraftable; // Craftable first
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableRecipes, selectedCategory, searchTerm, sortBy, showOnlyCraftable, player.inventory, player.level]);

  const handleCraft = async (recipeId: string) => {
    try {
      await onCraftItem(recipeId);
    } catch (error) {
      onShowMessage('Crafting Failed', 'Failed to craft item. Please try again.');
    }
  };

  const handleDiscoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryPrompt.trim()) {
      onShowMessage('Invalid Input', 'Please enter a recipe idea.');
      return;
    }
    try {
      await onDiscoverRecipe(discoveryPrompt.trim());
      setDiscoveryPrompt('');
    } catch (error) {
      onShowMessage('Discovery Failed', 'Failed to discover recipe. Please try again.');
    }
  };

  const handleSpellDesign = () => {
    onOpenSpellDesignStudio(spellPrompt.trim() || undefined);
  };

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchPrompt.trim()) {
      onShowMessage('Invalid Input', 'Please enter a research idea.');
      return;
    }
    if (player.gold < goldInvestment || player.essence < essenceInvestment) {
      onShowMessage('Insufficient Resources', 'You need more gold or essence for this research.');
      return;
    }
    try {
      await onAICreateComponent(researchPrompt.trim(), goldInvestment, essenceInvestment);
      setResearchPrompt('');
    } catch (error) {
      onShowMessage('Research Failed', 'Failed to complete research. Please try again.');
    }
  };

  const handleItemCraftSubmit = async (prompt: string) => {
    try {
      await onInitiateAppItemCraft(prompt, activeItemCraftType);
    } catch (error) {
      onShowMessage('Crafting Failed', 'Failed to initiate item crafting. Please try again.');
    }
  };

  const renderIngredient = (ingredient: any, isCompact: boolean = false) => {
    const item = MASTER_ITEM_DEFINITIONS[ingredient.itemId];
    const playerHas = player.inventory[ingredient.itemId] || 0;
    const hasEnough = playerHas >= ingredient.quantity;

    if (isCompact) {
      return (
        <span 
          key={ingredient.itemId} 
          className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border transition-all duration-200 hover:scale-105 ${
            hasEnough 
              ? 'text-green-300 bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
              : 'text-red-300 bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
          }`}
          title={`${item?.name || ingredient.type}: You have ${playerHas}/${ingredient.quantity}`}
        >
          {hasEnough ? '✅' : '❌'} {ingredient.quantity}x {item?.name || ingredient.type}
        </span>
      );
    }

    return (
      <div key={ingredient.itemId} className="flex items-center justify-between">
        <span className="text-sm text-slate-300">
          {ingredient.quantity}x {item?.name || ingredient.type}
        </span>
        <span className={`text-sm ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
          ({playerHas})
        </span>
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consumable': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'equipment': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'component': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
    }
  };

  const renderKnownRecipeCard = (recipeId: string, index: number) => {
    const recipe = allRecipes.find(r => r.id === recipeId);
    const canCraft = recipe ? canCraftRecipe(recipe) : false;
    
    return (
      <div
        key={recipeId}
        className={`bg-slate-700/40 rounded-lg p-2 sm:p-3 border transition-all duration-200 hover:bg-slate-700/60 hover:shadow-lg hover:scale-[1.02] ${
          canCraft ? 'border-green-500/30 hover:border-green-500/50 shadow-green-500/10' : 'border-slate-600/50 hover:border-slate-500/70'
        }`}
      >
        {recipe ? (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-slate-100 truncate hover:text-white transition-colors" title={recipe.name}>
                  {recipe.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded border transition-all duration-200 hover:scale-105 ${getCategoryColor(recipe.category)}`}>
                    {recipe.category}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 ml-2">
                <div className="flex items-center">
                  <span className="mr-1">⏱</span>
                  {recipe.craftingTime}h
                </div>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 mb-1.5 sm:mb-2 line-clamp-2 hover:text-slate-200 transition-colors" title={recipe.description}>
              {recipe.description}
            </p>
            
            <div className="mb-2">
              <div className="text-xs text-slate-400 flex items-center">
                <span className="mr-1">✨</span>
                Produces: <span className="text-slate-300 ml-1 font-medium">{MASTER_ITEM_DEFINITIONS[recipe.resultItemId]?.name || recipe.resultItemId}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Recipe #{index + 1}</span>
              <span className="text-xs text-green-400">✅ Discovered</span>
            </div>
            <p className="text-xs text-slate-400">{recipeId}</p>
          </>
        )}
      </div>
    );
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
    <div className="space-y-3 sm:space-y-4 p-2 sm:p-3 md:p-4 max-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="text-center p-3 sm:p-4 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <ActionButton
            onClick={onReturnHome}
            variant="secondary"
            size="sm"
            icon={<HeroBackIcon />}
            className="text-xs"
          >
            <span className="hidden sm:inline">Return Home</span>
            <span className="sm:hidden">Home</span>
          </ActionButton>
          
          <h2 className="text-xl sm:text-2xl font-bold text-green-300 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
            <GearIcon className="w-6 h-6 mr-2 text-green-400" />
          Crafting Workshop
        </h2>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3">Create and discover crafting recipes</p>
        
        {/* Tabs */}
        <div className="flex justify-center space-x-2 flex-wrap">
          <ActionButton
            onClick={() => setActiveTab('craft')}
            variant={activeTab === 'craft' ? 'primary' : 'secondary'}
            size="sm"
            icon={<GearIcon className="w-4 h-4" />}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            Craft Items
          </ActionButton>
          <ActionButton
            onClick={() => setActiveTab('discover')}
            variant={activeTab === 'discover' ? 'primary' : 'secondary'}
            size="sm"
            icon={<FlaskIcon className="w-4 h-4" />}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            Discover Recipes
          </ActionButton>
          <ActionButton
            onClick={() => setActiveTab('spells')}
            variant={activeTab === 'spells' ? 'primary' : 'secondary'}
            size="sm"
            icon={<WandIcon className="w-4 h-4" />}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            Spell Design
          </ActionButton>
          <ActionButton
            onClick={() => setActiveTab('research')}
            variant={activeTab === 'research' ? 'primary' : 'secondary'}
            size="sm"
            icon={<AtomIcon className="w-4 h-4" />}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            Research Lab
          </ActionButton>
          <ActionButton
            onClick={() => setActiveTab('items')}
            variant={activeTab === 'items' ? 'primary' : 'secondary'}
            size="sm"
            icon={<FlaskIcon className="w-4 h-4" />}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            Item Crafting
          </ActionButton>
        </div>
        
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs text-slate-400 mt-1 sm:mt-2">
          <span className="flex items-center">
            {activeTab === 'craft' && (
              <>
                <FlaskIcon className="w-3 h-3 mr-1" />
                {filteredAndSortedRecipes.length}/{availableRecipes.length} recipes
              </>
            )}
            {activeTab === 'discover' && (
              <>
                <FlaskIcon className="w-3 h-3 mr-1" />
                {player.discoveredRecipes.length} discovered
              </>
            )}
            {activeTab === 'spells' && (
              <>
                <WandIcon className="w-3 h-3 mr-1" />
                {player.spells.length} spells
              </>
            )}
            {activeTab === 'research' && (
              <>
                <AtomIcon className="w-3 h-3 mr-1" />
                {player.discoveredComponents.length} components
              </>
            )}
            {activeTab === 'items' && (
              <>
                <FlaskIcon className="w-3 h-3 mr-1" />
                {player.items.length} items
              </>
            )}
          </span>
          <span className="flex items-center">
            <GoldCoinIcon className="w-3 h-3 mr-1" />
            Gold: {player.gold}
          </span>
          <span className="flex items-center text-purple-400">
            ✨ Essence: {player.essence}
          </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'craft' ? (
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Controls */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-shrink-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 sm:py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-xs sm:text-sm"
                  />
      </div>

      {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
          {(['all', 'consumable', 'equipment', 'component'] as const).map((category) => (
            <ActionButton
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
                      className="text-xs px-2 py-1"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ActionButton>
          ))}
        </div>

                {/* Sort and Filter Options */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="level">Sort by Level</option>
                    <option value="time">Sort by Time</option>
                    <option value="craftable">Sort by Craftable</option>
                  </select>
                  
                  <ActionButton
                    onClick={() => setShowOnlyCraftable(!showOnlyCraftable)}
                    variant={showOnlyCraftable ? 'primary' : 'secondary'}
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    <FilterListIcon className="w-3 h-3 mr-1" />
                    Craftable Only
                  </ActionButton>
        </div>
      </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-600/50">
                <ActionButton
                  onClick={onReturnHome}
                  variant="secondary"
                  size="sm"
                  icon={<HeroBackIcon />}
                  className="text-xs"
                >
                  Return Home
                </ActionButton>
                
                <div className="text-xs text-slate-400">
                  {filteredAndSortedRecipes.filter(r => canCraftRecipe(r)).length} craftable recipes
                </div>
              </div>
            </div>

            {/* Recipes Grid */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-2 sm:p-3 md:p-4 flex-1 overflow-y-auto">
              {filteredAndSortedRecipes.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
                  <FlaskIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-xs sm:text-sm text-slate-400 italic">
                    {availableRecipes.length === 0 
                      ? 'No recipes discovered yet. Use the Discovery tab to find new recipes!'
                      : searchTerm 
                      ? `No recipes match "${searchTerm}"`
                : 'No recipes in this category.'
              }
            </p>
          </div>
        ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3">
                  {filteredAndSortedRecipes.map((recipe) => {
              const canCraft = canCraftRecipe(recipe);
                    const levelReq = recipe.requirements.find((req: any) => req.type === 'level')?.value;
              
              return (
                      <div key={recipe.id} className={`bg-slate-700/40 rounded-lg p-2 sm:p-3 border transition-all duration-200 hover:bg-slate-700/60 hover:shadow-lg hover:scale-[1.02] ${canCraft ? 'border-green-500/30 hover:border-green-500/50 shadow-green-500/10' : 'border-slate-600/50 hover:border-slate-500/70'}`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-slate-100 truncate hover:text-white transition-colors" title={recipe.name}>
                              {recipe.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded border transition-all duration-200 hover:scale-105 ${getCategoryColor(recipe.category)}`}>
                      {recipe.category}
                    </span>
                              {levelReq && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${player.level >= levelReq ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                  Lv.{levelReq}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400 ml-2">
                            <div className="flex items-center">
                              <span className="mr-1">⏱</span>
                              {recipe.craftingTime}h
                            </div>
                            <div className="text-green-400 flex items-center">
                              <span className="mr-1">📦</span>
                              {recipe.resultQuantity}x
                            </div>
                          </div>
                  </div>
                  
                        {/* Description */}
                        <p className="text-xs text-slate-300 mb-1.5 sm:mb-2 line-clamp-2 hover:text-slate-200 transition-colors" title={recipe.description}>
                          {recipe.description}
                        </p>
                        
                        {/* Ingredients - Compact View */}
                        <div className="mb-2 sm:mb-3">
                          <h5 className="text-xs font-medium text-slate-200 mb-0.5 sm:mb-1 flex items-center">
                            <span className="mr-1">🧪</span>
                            Ingredients:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {recipe.ingredients.map((ingredient: any) => renderIngredient(ingredient, true))}
                      </div>
                    </div>
                    
                        {/* Result */}
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs text-slate-400 flex items-center">
                            <span className="mr-1">✨</span>
                            Produces: <span className="text-slate-300 ml-1 font-medium">{MASTER_ITEM_DEFINITIONS[recipe.resultItemId]?.name || recipe.resultItemId}</span>
                          </div>
                    </div>
                    
                        {/* Requirements */}
                        {recipe.requirements && recipe.requirements.length > 0 && (
                          <div className="mb-2 sm:mb-3">
                            <div className="flex flex-wrap gap-1">
                              {recipe.requirements.map((req: any, index: number) => (
                                <span key={index} className="text-xs text-slate-400 bg-slate-600/30 px-1.5 py-0.5 rounded hover:bg-slate-600/50 transition-colors">
                                  {req.type === 'level' && `Lv.${req.value}`}
                                  {req.type === 'location' && `📍 ${req.value}`}
                                  {req.type === 'skill' && `🎯 ${req.value}`}
                                  {req.type === 'tool' && `🔧 ${req.value}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Craft Button */}
                    <ActionButton
                      onClick={() => handleCraft(recipe.id)}
                      variant={canCraft ? "success" : "secondary"}
                      size="sm"
                      disabled={!canCraft || isLoading}
                      isLoading={isLoading}
                          icon={canCraft ? <CheckmarkCircleIcon className="w-3 h-3" /> : <GearIcon className="w-3 h-3" />}
                          className={`w-full text-xs py-1.5 transition-all duration-200 ${canCraft ? 'hover:scale-105 hover:shadow-md' : ''}`}
                        >
                          {canCraft ? '🚀 Craft Now' : '❌ Cannot Craft'}
                        </ActionButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'discover' ? (
          /* Discovery Tab */
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Discovery Form */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-shrink-0">
              <form onSubmit={handleDiscoverySubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="recipe-prompt" className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    🔬 Describe your recipe idea:
                  </label>
                  <textarea
                    id="recipe-prompt"
                    value={discoveryPrompt}
                    onChange={(e) => setDiscoveryPrompt(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[70px] sm:min-h-[80px]"
                    placeholder="Example: A healing potion made from forest herbs and crystal shards..."
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <ActionButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                    disabled={!discoveryPrompt.trim()}
                    icon={<FlaskIcon className="w-4 h-4" />}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {isLoading ? 'Discovering...' : '🔍 Discover Recipe'}
                  </ActionButton>
                  
                  <ActionButton
                    onClick={onReturnHome}
                    variant="secondary"
                    size="sm"
                    icon={<HeroBackIcon className="w-4 h-4" />}
                    className="text-xs sm:text-sm"
                  >
                    Return Home
                  </ActionButton>
                </div>
              </form>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-hidden">
              {/* Example Prompts */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <BookIcon className="w-5 h-5 mr-2 text-amber-400" />
                  💡 Example Ideas
                </h3>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setDiscoveryPrompt(example)}
                      className="w-full text-left p-2 sm:p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-slate-100 transition-all duration-200 text-xs sm:text-sm"
                      disabled={isLoading}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Known Recipes */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <FlaskIcon className="w-5 h-5 mr-2 text-green-400" />
                  📚 Known Recipes ({player.discoveredRecipes.length})
                </h3>
                {player.discoveredRecipes.length > 0 ? (
                  <div className="space-y-2">
                    {player.discoveredRecipes.map((recipeId, index) => renderKnownRecipeCard(recipeId, index))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <FlaskIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-400 italic">No recipes discovered yet. Use the discovery lab above to find new recipes!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'spells' ? (
          /* Spell Design Tab */
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Spell Design Form */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-shrink-0">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="spell-prompt" className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    🪄 Describe your spell idea:
                  </label>
                  <textarea
                    id="spell-prompt"
                    value={spellPrompt}
                    onChange={(e) => setSpellPrompt(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical min-h-[70px] sm:min-h-[80px]"
                    placeholder="Example: A fireball that explodes on impact, dealing area damage..."
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <ActionButton
                    onClick={handleSpellDesign}
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                    icon={<WandIcon className="w-4 h-4" />}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    🎨 Open Spell Design Studio
                  </ActionButton>
                  
                  <ActionButton
                    onClick={onReturnHome}
                    variant="secondary"
                    size="sm"
                    icon={<HeroBackIcon className="w-4 h-4" />}
                    className="text-xs sm:text-sm"
                  >
                    Return Home
                  </ActionButton>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-hidden">
              {/* Spell Examples */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <WandIcon className="w-5 h-5 mr-2 text-purple-400" />
                  ✨ Spell Ideas
                </h3>
                <div className="space-y-2">
                  {[
                    "A healing spell that restores health over time",
                    "Lightning bolt that chains between enemies",
                    "Ice shield that reflects damage back to attackers",
                    "Fire tornado that pulls enemies toward the center",
                    "Shadow step that teleports behind the target",
                    "Light beam that pierces through multiple enemies"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setSpellPrompt(example)}
                      className="w-full text-left p-2 sm:p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-slate-100 transition-all duration-200 text-xs sm:text-sm"
                      disabled={isLoading}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Spells */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <WandIcon className="w-5 h-5 mr-2 text-green-400" />
                  📜 Your Spells ({player.spells.length})
                </h3>
                {player.spells.length > 0 ? (
                  <div className="space-y-2">
                    {player.spells.slice(0, 10).map((spell) => (
                      <div
                        key={spell.id}
                        className="bg-slate-700/40 rounded-lg p-2 sm:p-3 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-medium text-slate-100">{spell.name}</h4>
                          <span className="text-xs text-purple-400">{spell.manaCost} MP</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{spell.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400 bg-slate-600/30 px-2 py-0.5 rounded">
                            {spell.damageType}
                          </span>
                          <span className="text-xs text-slate-400 bg-slate-600/30 px-2 py-0.5 rounded">
                            Lv.{spell.level}
                          </span>
                        </div>
                      </div>
                    ))}
                    {player.spells.length > 10 && (
                      <p className="text-xs text-slate-400 text-center py-2">
                        ...and {player.spells.length - 10} more spells
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <WandIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-400 italic">No spells created yet. Use the design studio to craft your first spell!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'research' ? (
          /* Research Lab Tab */
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Research Form */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-shrink-0">
              <form onSubmit={handleResearchSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="research-prompt" className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    🔬 Describe your component research:
                  </label>
                  <textarea
                    id="research-prompt"
                    value={researchPrompt}
                    onChange={(e) => setResearchPrompt(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical min-h-[70px] sm:min-h-[80px]"
                    placeholder="Example: A fire-based component that increases spell damage..."
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                      💰 Gold Investment: {goldInvestment}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={goldInvestment}
                      onChange={(e) => setGoldInvestment(Number(e.target.value))}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>10</span>
                      <span className={goldInvestment > player.gold ? 'text-red-400' : 'text-green-400'}>
                        Available: {player.gold}
                      </span>
                      <span>500</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                      ✨ Essence Investment: {essenceInvestment}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={essenceInvestment}
                      onChange={(e) => setEssenceInvestment(Number(e.target.value))}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>1</span>
                      <span className={essenceInvestment > player.essence ? 'text-red-400' : 'text-purple-400'}>
                        Available: {player.essence}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 sm:gap-4">
                  <ActionButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                    disabled={!researchPrompt.trim() || goldInvestment > player.gold || essenceInvestment > player.essence}
                    icon={<AtomIcon className="w-4 h-4" />}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {isLoading ? 'Researching...' : '🧪 Conduct Research'}
                  </ActionButton>
                  
                  <ActionButton
                    onClick={onReturnHome}
                    variant="secondary"
                    size="sm"
                    icon={<HeroBackIcon className="w-4 h-4" />}
                    className="text-xs sm:text-sm"
                  >
                    Return Home
                  </ActionButton>
                </div>
              </form>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-hidden">
              {/* Research Examples */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <AtomIcon className="w-5 h-5 mr-2 text-cyan-400" />
                  🧪 Research Ideas
                </h3>
                <div className="space-y-2">
                  {[
                    "Fire essence that amplifies burning effects",
                    "Ice crystal that adds freezing properties",
                    "Lightning core for chain spell effects",
                    "Shadow fragment for stealth enhancements",
                    "Light prism for healing spell boosts",
                    "Void shard for damage amplification"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setResearchPrompt(example)}
                      className="w-full text-left p-2 sm:p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-slate-100 transition-all duration-200 text-xs sm:text-sm"
                      disabled={isLoading}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Discovered Components */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 overflow-y-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3 flex items-center">
                  <AtomIcon className="w-5 h-5 mr-2 text-green-400" />
                  🔬 Components ({player.discoveredComponents.length})
                </h3>
                {player.discoveredComponents.length > 0 ? (
                  <div className="space-y-2">
                    {player.discoveredComponents.slice(0, 8).map((component) => (
                      <div
                        key={component.id}
                        className="bg-slate-700/40 rounded-lg p-2 sm:p-3 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-medium text-slate-100">{component.name}</h4>
                          <span className="text-xs text-cyan-400">T{component.tier}</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{component.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400 bg-slate-600/30 px-2 py-0.5 rounded">
                            {component.category}
                          </span>
                          <span className="text-xs text-slate-400 bg-slate-600/30 px-2 py-0.5 rounded">
                            {component.usageGoldCost || 0}G
                          </span>
                        </div>
                      </div>
                    ))}
                    {player.discoveredComponents.length > 8 && (
                      <p className="text-xs text-slate-400 text-center py-2">
                        ...and {player.discoveredComponents.length - 8} more components
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <AtomIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-400 italic">No components discovered yet. Conduct research to discover new spell components!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Item Crafting Tab */
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Item Crafting Form */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-shrink-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-2 sm:mb-3">AI Item Creation</h3>
                  <p className="text-xs sm:text-sm text-slate-300">Create consumables and equipment using AI-powered generation.</p>
                </div>
                
                <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <ActionButton
                    onClick={() => setActiveItemCraftType('Consumable')}
                    variant={activeItemCraftType === 'Consumable' ? 'primary' : 'secondary'}
                    icon={<FlaskIcon className="w-4 h-4"/>}
                    size="sm"
                  >
                    Consumables
                  </ActionButton>
                  <ActionButton
                    onClick={() => setActiveItemCraftType('Equipment')}
                    variant={activeItemCraftType === 'Equipment' ? 'primary' : 'secondary'}
                    icon={<GearIcon className="w-4 h-4"/>}
                    size="sm"
                  >
                    Equipment
                  </ActionButton>
                </div>
                
                <ItemCraftingForm
                  itemType={activeItemCraftType}
                  onInitiateCraft={handleItemCraftSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftingWorkshopView; 