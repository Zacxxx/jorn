import React, { useState } from 'react';
import { ItemType, Player } from '../types';
import ItemCraftingForm from '../../components/ItemCraftingForm';
import ActionButton from '../../ui/ActionButton';
import { PotionGenericIcon, GearIcon, WandIcon, FlaskIcon, BookIcon, SearchIcon, HeroBackIcon } from './IconComponents';

interface CraftingHubViewProps {
  player: Player;
  onReturnHome: () => void;
  onInitiateAppItemCraft: (prompt: string, itemType: ItemType) => Promise<void>;
  isLoading: boolean;
  onOpenSpellDesignStudio: () => void; 
  onOpenTheorizeLab: () => void;
  onOpenRecipeDiscovery: () => void;
  onOpenCraftingWorkshop: () => void;
}

type CraftingHubMainView = 'Items' | 'Spells' | 'Recipes';

const CraftingHubView: React.FC<CraftingHubViewProps> = ({ 
    player,
    onReturnHome,
    onInitiateAppItemCraft, 
    isLoading,
    onOpenSpellDesignStudio,
    onOpenTheorizeLab,
    onOpenRecipeDiscovery,
    onOpenCraftingWorkshop
}) => {
  const [activeMainView, setActiveMainView] = useState<CraftingHubMainView>('Spells');
  const [activeItemCraftType, setActiveItemCraftType] = useState<ItemType>('Consumable');

  const handleItemCraftSubmit = async (prompt: string) => {
    await onInitiateAppItemCraft(prompt, activeItemCraftType);
  };
  
  const MainViewButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = 
  ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center p-3.5 md:p-4 rounded-t-lg transition-all duration-150 border-b-4
                    ${isActive 
                        ? 'bg-slate-700/90 text-sky-300 border-sky-500 shadow-inner' 
                        : 'bg-slate-800/80 hover:bg-slate-700/70 text-slate-400 hover:text-sky-400 border-transparent hover:border-sky-600/50'}`}
        aria-pressed={isActive}
        style={{fontFamily: "'Inter Tight', sans-serif"}}
    >
        <div className="w-5 h-5 md:w-6 md:h-6 mr-2">{icon}</div>
        <span className="text-sm sm:text-base font-semibold tracking-tight uppercase">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h1 className="text-3xl font-bold text-sky-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <GearIcon className="w-8 h-8 mr-3 text-sky-400" />
          Grand Crafting Emporium
        </h1>
        <p className="text-slate-300 text-lg">Master the arts of creation and discovery</p>
        
        {/* Player Resources */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-slate-400">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Gold: {player.gold}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Essence: {player.essence}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Level: {player.level}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 overflow-hidden">
        <div className="flex border-b-2 border-slate-600/80 bg-slate-800/70">
          <MainViewButton
            icon={<WandIcon />}
            label="Spellcraft"
            isActive={activeMainView === 'Spells'}
            onClick={() => setActiveMainView('Spells')}
          />
          <MainViewButton
            icon={<GearIcon />} 
            label="Item Crafting"
            isActive={activeMainView === 'Items'}
            onClick={() => setActiveMainView('Items')}
          />
          <MainViewButton
            icon={<BookIcon />} 
            label="Recipe Crafting"
            isActive={activeMainView === 'Recipes'}
            onClick={() => setActiveMainView('Recipes')}
          />
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {activeMainView === 'Spells' && (
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-200 mb-3">Arcane Arts</h2>
                <p className="text-slate-300 text-lg">Design powerful spells or research new components.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-sky-500/50 transition-all duration-200">
                  <WandIcon className="w-12 h-12 mx-auto mb-4 text-sky-400" />
                  <h3 className="text-xl font-semibold text-slate-200 mb-3">Spell Design Studio</h3>
                  <p className="text-slate-300 mb-4">Create custom spells using discovered components and magical theory.</p>
                  <ActionButton onClick={onOpenSpellDesignStudio} variant="primary" size="lg" className="w-full">
                    Enter Studio
                  </ActionButton>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-200">
                  <FlaskIcon className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-slate-200 mb-3">Component Research</h3>
                  <p className="text-slate-300 mb-4">Theorize and discover new magical components for spell creation.</p>
                  <ActionButton onClick={onOpenTheorizeLab} variant="info" size="lg" className="w-full">
                    Research Lab
                  </ActionButton>
                </div>
              </div>
            </div>
          )}

          {activeMainView === 'Items' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-200 mb-3">Item Creation</h2>
                <p className="text-slate-300 text-lg">Craft consumables and equipment using AI-powered generation.</p>
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                <ActionButton
                  onClick={() => setActiveItemCraftType('Consumable')}
                  variant={activeItemCraftType === 'Consumable' ? 'primary' : 'secondary'}
                  icon={<PotionGenericIcon className="w-5 h-5"/>}
                  size="lg"
                >
                  Consumables
                </ActionButton>
                <ActionButton
                  onClick={() => setActiveItemCraftType('Equipment')}
                  variant={activeItemCraftType === 'Equipment' ? 'primary' : 'secondary'}
                  icon={<GearIcon className="w-5 h-5"/>}
                  size="lg"
                >
                  Equipment
                </ActionButton>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <ItemCraftingForm
                  itemType={activeItemCraftType}
                  onInitiateCraft={handleItemCraftSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {activeMainView === 'Recipes' && (
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-200 mb-3">Traditional Crafting</h2>
                <p className="text-slate-300 text-lg">Discover new crafting recipes and create items using traditional methods.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-green-500/50 transition-all duration-200">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-semibold text-slate-200 mb-3">Recipe Discovery</h3>
                  <p className="text-slate-300 mb-4">Research and learn new crafting recipes through experimentation.</p>
                  <ActionButton onClick={onOpenRecipeDiscovery} variant="success" size="lg" className="w-full">
                    Discovery Workshop
                  </ActionButton>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-amber-500/50 transition-all duration-200">
                  <GearIcon className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <h3 className="text-xl font-semibold text-slate-200 mb-3">Crafting Workshop</h3>
                  <p className="text-slate-300 mb-4">Create items using your discovered recipes and gathered materials.</p>
                  <ActionButton onClick={onOpenCraftingWorkshop} variant="warning" size="lg" className="w-full">
                    Workshop
                  </ActionButton>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-slate-700/30 rounded-lg border border-slate-600/30 max-w-3xl mx-auto">
                <h4 className="text-lg font-medium text-slate-200 mb-3">Recipe-Based Crafting</h4>
                <p className="text-slate-300">
                  Use the Recipe Discovery Workshop to research and learn new crafting recipes through experimentation and knowledge. 
                  Then use the Crafting Workshop to create items using your discovered recipes and gathered materials.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center">
        <ActionButton 
          onClick={onReturnHome} 
          variant="secondary" 
          size="lg"
          icon={<HeroBackIcon className="w-5 h-5" />}
          className="px-8"
        >
          Return Home
        </ActionButton>
      </div>
    </div>
  );
};

export default CraftingHubView; 