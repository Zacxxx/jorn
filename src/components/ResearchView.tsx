import React, { useState, useMemo } from 'react';
import ActionButton from '../ui/ActionButton';
import { Player, SpellComponent, SpellComponentCategory, ElementName, TagName } from '../types';
import { BookIcon, FlaskIcon, FilterListIcon, SearchIcon } from './IconComponents';
import SpellComponentCard from './SpellComponentCard'; // Corrected import
import { ALL_ELEMENTS } from './gameplay/elements/element-list';
import { ALL_TAG_NAMES } from './gameplay/tags';

interface ResearchViewProps {
  player: Player;
  onReturnHome: () => void;
  onOpenTheorizeLab: () => void; 
  onShowMessage: (title: string, message: string) => void;
}

const SPELL_COMPONENT_CATEGORIES: SpellComponentCategory[] = ['DamageSource', 'DeliveryMethod', 'PrimaryEffect', 'SecondaryModifier', 'CostEfficiency', 'VisualAspect', 'EssenceInfusion', 'ElementalCore', 'Utility'];


const ResearchView: React.FC<ResearchViewProps> = ({ player, onReturnHome, onOpenTheorizeLab, onShowMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SpellComponentCategory | 'All'>('All');
  const [selectedTier, setSelectedTier] = useState<number | 'All'>('All');
  const [selectedElement, setSelectedElement] = useState<ElementName | 'All'>('All');
  // const [selectedTags, setSelectedTags] = useState<TagName[]>([]); // Future: for tag filtering

  const filteredComponents = useMemo(() => {
    return player.discoveredComponents.filter(comp => {
      const nameMatch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = comp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'All' || comp.category === selectedCategory;
      const tierMatch = selectedTier === 'All' || comp.tier === selectedTier;
      const elementMatch = selectedElement === 'All' || comp.element === selectedElement;
      // const tagMatch = selectedTags.length === 0 || selectedTags.every(tag => comp.tags?.includes(tag));

      return (nameMatch || descMatch) && categoryMatch && tierMatch && elementMatch; // && tagMatch;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [player.discoveredComponents, searchTerm, selectedCategory, selectedTier, selectedElement]);


  const handleResearchArea = () => {
      onShowMessage("Research Area", "This area will allow you to find component blueprints or conduct focused research in specific domains. (Coming Soon!)");
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-slate-100 h-full flex flex-col">
      <h2 className="text-2xl md:text-3xl font-bold text-teal-400 mb-4 sm:mb-6 text-center flex items-center justify-center" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        <BookIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-teal-400" />
        Research Archives
      </h2>
      
      <p className="text-xs sm:text-sm text-slate-300 mb-3 text-center">
        Browse your discovered spell components, {player.name || "Hero"}. Use the filters to narrow your search.
      </p>

      {/* Filter and Search Section */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-700/50 rounded-md border border-slate-600 space-y-2">
        <div className="flex items-center space-x-2">
          <SearchIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search components by name or description..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as SpellComponentCategory | 'All')} className="p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500">
            <option value="All">All Categories</option>
            {SPELL_COMPONENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={selectedTier} onChange={e => setSelectedTier(e.target.value === 'All' ? 'All' : parseInt(e.target.value))} className="p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500">
            <option value="All">All Tiers</option>
            {[1,2,3,4,5].map(tier => <option key={tier} value={tier}>Tier {tier}</option>)}
          </select>
          <select value={selectedElement} onChange={e => setSelectedElement(e.target.value as ElementName | 'All')} className="p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500">
            <option value="All">All Elements</option>
            {ALL_ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
          </select>
        </div>
      </div>

      {/* Discovered Components Grid */}
      <div className="flex-grow overflow-y-auto styled-scrollbar pr-1 min-h-[200px] sm:min-h-[300px]">
        {filteredComponents.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">
            {player.discoveredComponents.length === 0 ? "No components discovered yet." : "No components match your current filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
            {filteredComponents.map(component => (
              <SpellComponentCard 
                key={component.id} 
                component={component} 
                showResearchRequirements={true} // This will be part of expanded view
                className="h-full" // Ensure cards try to take full height if needed
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4 sm:mt-6 pt-3 border-t border-slate-600 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3">
        <ActionButton onClick={onOpenTheorizeLab} variant="primary" size="md" icon={<FlaskIcon className="w-4 h-4"/>} className="w-full sm:w-auto">
          Theorize New Component
        </ActionButton>
        <ActionButton onClick={handleResearchArea} variant="info" size="md" icon={<SearchIcon className="w-4 h-4"/>} className="w-full sm:w-auto">
          Explore Research Areas
        </ActionButton>
        <ActionButton onClick={onReturnHome} variant="secondary" size="md" className="w-full sm:w-auto">
          Return to Home
        </ActionButton>
      </div>
    </div>
  );
};

export default ResearchView;