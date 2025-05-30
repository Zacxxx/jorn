import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';
import { TAG_DEFINITIONS } from '../constants';
import { TagName } from '../types';
import { GetSpellIcon } from './IconComponents';

interface HelpWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpWikiModal: React.FC<HelpWikiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'tags'>('guide');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [selectedTagCategory, setSelectedTagCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<TagName | null>(null);

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mb-5">
        <h3 className="text-xl font-semibold text-sky-300 mb-2 border-b border-slate-600 pb-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
        <div className="text-sm text-slate-300 space-y-1.5 leading-relaxed">
            {children}
        </div>
    </div>
  );

  // Tag system logic
  const tagCategories = useMemo(() => {
    const categories = new Set<string>();
    Object.values(TAG_DEFINITIONS).forEach(tag => categories.add(tag.category));
    return ['All', ...Array.from(categories).sort()];
  }, []);

  const filteredTags = useMemo(() => {
    return Object.entries(TAG_DEFINITIONS).filter(([tagName, tagDef]) => {
      const nameMatch = tagName.toLowerCase().includes(tagSearchTerm.toLowerCase()) || 
                       tagDef.description.toLowerCase().includes(tagSearchTerm.toLowerCase());
      const categoryMatch = selectedTagCategory === 'All' || tagDef.category === selectedTagCategory;
      return nameMatch && categoryMatch;
    }).sort(([a], [b]) => a.localeCompare(b));
  }, [tagSearchTerm, selectedTagCategory]);

  const renderTagDetail = (tagName: TagName) => {
    const tagDef = TAG_DEFINITIONS[tagName];
    if (!tagDef) return null;

    const getCategoryColor = (category: string) => {
      const colors: Record<string, string> = {
        'damage': 'text-red-400',
        'targeting': 'text-blue-400',
        'properties': 'text-purple-400',
        'modifiers': 'text-orange-400',
        'support': 'text-green-400',
        'control': 'text-yellow-400',
        'buffs': 'text-emerald-400',
        'debuffs': 'text-red-500',
        'dot': 'text-orange-500',
        'vampiric': 'text-red-600',
        'defensive': 'text-cyan-400',
        'resource': 'text-yellow-500',
        'scaling': 'text-purple-500',
        'timing': 'text-indigo-400',
        'environmental': 'text-green-500',
        'special': 'text-pink-400',
        'meta': 'text-gray-400',
        'rarity': 'text-amber-400'
      };
      return colors[category] || 'text-slate-400';
    };

    const getPowerStars = (level: number) => {
      return '★'.repeat(Math.min(level, 10)) + '☆'.repeat(Math.max(0, 10 - level));
    };

    const getRarityText = (rarity: number) => {
      if (rarity <= 1) return 'Common';
      if (rarity <= 2) return 'Uncommon';
      if (rarity <= 4) return 'Rare';
      if (rarity <= 6) return 'Epic';
      if (rarity <= 8) return 'Legendary';
      return 'Mythic';
    };

    return (
      <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700">
        <div className="flex items-center mb-3">
          <div className={`w-3 h-3 rounded-full mr-3 ${tagDef.color.replace('text-', 'bg-')}`}></div>
          <h4 className={`text-xl font-bold ${tagDef.color}`}>{tagDef.name}</h4>
        </div>
        
        <p className="text-slate-300 mb-4 leading-relaxed">{tagDef.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-slate-400 text-sm w-20">Category:</span>
              <span className={`text-sm font-medium capitalize ${getCategoryColor(tagDef.category)}`}>
                {tagDef.category.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 text-sm w-20">Type:</span>
              <span className="text-sm text-slate-300 capitalize">{tagDef.effectType}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 text-sm w-20">Rarity:</span>
              <span className="text-sm text-amber-400">{getRarityText(tagDef.rarity)} ({tagDef.rarity}/10)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-slate-400 text-sm w-20">Power:</span>
              <span className="text-sm text-yellow-400" title={`${tagDef.powerLevel}/10`}>
                {getPowerStars(tagDef.powerLevel)}
              </span>
            </div>
            {tagDef.unlockLevel && (
              <div className="flex items-center">
                <span className="text-slate-400 text-sm w-20">Unlock:</span>
                <span className="text-sm text-cyan-400">Level {tagDef.unlockLevel}</span>
              </div>
            )}
          </div>
        </div>

        {(tagDef.synergizesWith && tagDef.synergizesWith.length > 0) && (
          <div className="mb-3">
            <span className="text-green-400 text-sm font-medium block mb-1">Synergizes with:</span>
            <div className="flex flex-wrap gap-1">
              {tagDef.synergizesWith.map(synTag => (
                <button 
                  key={synTag}
                  onClick={() => setSelectedTag(synTag)}
                  className="text-xs px-2 py-1 bg-green-900/30 border border-green-600/50 rounded text-green-300 hover:bg-green-800/40 transition-colors"
                >
                  {synTag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {(tagDef.conflictsWith && tagDef.conflictsWith.length > 0) && (
          <div className="mb-3">
            <span className="text-red-400 text-sm font-medium block mb-1">Conflicts with:</span>
            <div className="flex flex-wrap gap-1">
              {tagDef.conflictsWith.map(conflictTag => (
                <button 
                  key={conflictTag}
                  onClick={() => setSelectedTag(conflictTag)}
                  className="text-xs px-2 py-1 bg-red-900/30 border border-red-600/50 rounded text-red-300 hover:bg-red-800/40 transition-colors"
                >
                  {conflictTag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTagsContent = () => (
    <div className="h-full">
      <div className="mb-4">
        <p className="text-slate-300 text-sm mb-3">
          Tags are magical properties that define how spells behave in combat. Combine different tags to create unique spell effects and discover powerful synergies.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            placeholder="Search tags..."
            value={tagSearchTerm}
            onChange={(e) => setTagSearchTerm(e.target.value)}
            className="flex-1 p-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-sm"
          />
          <select
            value={selectedTagCategory}
            onChange={(e) => setSelectedTagCategory(e.target.value)}
            className="p-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-sm min-w-[140px]"
          >
            {tagCategories.map(category => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-xs text-slate-400 mb-2">
          Showing {filteredTags.length} of {Object.keys(TAG_DEFINITIONS).length} tags
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(70vh-240px)]">
        {/* Tags List */}
        <div className="overflow-y-auto styled-scrollbar bg-slate-700/40 rounded-lg p-2">
          <div className="space-y-1">
            {filteredTags.map(([tagName, tagDef]) => (
              <button
                key={tagName}
                onClick={() => setSelectedTag(tagName as TagName)}
                className={`w-full text-left p-2 rounded-md transition-colors flex items-center justify-between ${
                  selectedTag === tagName 
                    ? 'bg-sky-700 text-white' 
                    : 'bg-slate-600/70 hover:bg-slate-500/70 text-slate-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${tagDef.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-sm font-medium">{tagDef.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400 capitalize">{tagDef.category}</span>
                  {tagDef.unlockLevel && (
                    <span className="text-xs text-cyan-400">L{tagDef.unlockLevel}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Detail */}
        <div className="overflow-y-auto styled-scrollbar">
          {selectedTag ? (
            renderTagDetail(selectedTag)
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 italic text-center">
              <div>
                <GetSpellIcon iconName="TagGeneric" className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Select a tag to view detailed information</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGuideContent = () => (
    <div className="space-y-4">
      <Section title="Welcome to Jorn!">
        <p>Jorn is a world of magic, monsters, and adventure, powered by your imagination and AI!</p>
        <p>This guide will help you navigate its features.</p>
      </Section>

      <Section title="Getting Started">
        <p><strong>Character:</strong> Manage your hero's stats, equipment, spells, abilities, traits, and quests via the Character Sheet (Hero button in header or 'User' in game menu).</p>
        <p><strong>Exploration:</strong> The main screen offers options to 'Seek Battle', explore the world map, visit settlements, and manage your homestead.</p>
        <p><strong>Footer Menu:</strong> Access key game sections like Crafting, Inventory, Spells, Traits, Quests, Help, and the main Game Menu.</p>
      </Section>

      <Section title="Combat Basics">
        <p><strong>Turn-Based:</strong> Combat is turn-based. Speed determines who goes first.</p>
        <p><strong>Actions:</strong> On your turn, choose to cast Spells, use Abilities, use Items (Potions), perform Freestyle Actions, or Defend.</p>
        <p><strong>Resources:</strong> Spells consume Mana (MP), Abilities consume Energy (EP). HP is your health.</p>
        <p><strong>Stats:</strong> Body, Mind, and Reflex are your core stats, influencing HP, MP, EP, damage, defense, and speed.</p>
        <p><strong>Status Effects:</strong> Spells and abilities can apply various status effects (Poison, Stun, Buffs, Debuffs).</p>
        <p><strong>Elemental System:</strong> Different damage types have varying effectiveness against enemies. Check enemy weaknesses and resistances!</p>
      </Section>

      <Section title="Spell Crafting & Tags">
        <p><strong>Spell Design Studio:</strong> Create custom spells using a component-based system with tags that define spell behavior.</p>
        <p><strong>Tags:</strong> Magical properties that determine how spells function in combat. Combine tags for unique effects and powerful synergies.</p>
        <p><strong>Components:</strong> Research and discover new spell components that provide different tags and effects.</p>
        <p><strong>Synergies:</strong> Some tags work better together, while others conflict. Experiment to find powerful combinations!</p>
        <p><strong>Tag Categories:</strong> Damage types, targeting methods, spell properties, and special effects - explore the Tags tab for details.</p>
      </Section>

      <Section title="Crafting Systems">
        <p><strong>AI-Powered:</strong> Use the 'Crafting' hub to describe spell, potion, or equipment ideas to the AI.</p>
        <p><strong>Spell Design Studio:</strong> Advanced spell creation with component selection and tag customization.</p>
        <p><strong>Research Archives:</strong> Discover new spell components and study magical theory.</p>
        <p><strong>Item Crafting:</strong> Create consumables, equipment, and magical items using gathered resources.</p>
        <p><strong>Recipe Discovery:</strong> Learn new crafting recipes through experimentation and research.</p>
        <p><strong>Resources:</strong> Gather crafting materials from battles, exploration, and special locations.</p>
      </Section>

      <Section title="Character Progression">
        <p><strong>Level Up:</strong> Gain XP from defeating enemies to level up, improving your base stats and unlocking more spell/ability slots.</p>
        <p><strong>Traits:</strong> At certain levels, you can define new passive Traits for your character.</p>
        <p><strong>Abilities:</strong> Energy-based skills that provide utility, healing, and tactical options.</p>
        <p><strong>Equipment:</strong> Weapons, armor, and accessories that boost your stats and provide special effects.</p>
        <p><strong>Spells:</strong> Your primary magical arsenal - prepare spells for combat from your learned collection.</p>
      </Section>

      <Section title="World Exploration">
        <p><strong>World Map:</strong> Travel between different locations, each with unique enemies, resources, and opportunities.</p>
        <p><strong>Settlements:</strong> Visit towns and cities to trade with merchants, gather information, and accept quests.</p>
        <p><strong>Wilderness:</strong> Explore dangerous areas to find rare resources and face challenging enemies.</p>
        <p><strong>Homestead:</strong> Your personal base where you can upgrade facilities and manage long-term projects.</p>
        <p><strong>Points of Interest:</strong> Special locations with unique rewards, puzzles, or encounters.</p>
      </Section>
        
      <Section title="Tips & Tricks">
        <p>Pay attention to enemy weaknesses and resistances - elemental advantages can double your damage!</p>
        <p>Keep your hero well-equipped and your spells/abilities prepared for different situations.</p>
        <p>Experiment with tag combinations in the Spell Design Studio to discover powerful synergies.</p>
        <p>Use the Camp to rest and recover between challenging battles.</p>
        <p>Check the Tags section of this wiki to understand all available magical properties.</p>
        <p>Balance offensive and defensive capabilities - survivability is just as important as damage.</p>
        <p>Resource management is key - don't waste valuable materials on low-impact crafts.</p>
      </Section>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jorn - Help & Wiki" size="4xl">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 p-1 bg-slate-800/50 rounded-md">
        <ActionButton 
          onClick={() => setActiveTab('guide')} 
          variant={activeTab === 'guide' ? 'primary' : 'secondary'} 
          size="sm" 
          className="flex-1"
        >
          Game Guide
        </ActionButton>
        <ActionButton 
          onClick={() => setActiveTab('tags')} 
          variant={activeTab === 'tags' ? 'primary' : 'secondary'} 
          size="sm" 
          className="flex-1"
        >
          Tags Reference
        </ActionButton>
      </div>

      {/* Content */}
      <div className="max-h-[70vh] overflow-y-auto styled-scrollbar pr-2">
        {activeTab === 'guide' ? renderGuideContent() : renderTagsContent()}
      </div>

      {/* Footer */}
      <div className="mt-6 text-right">
        <ActionButton onClick={onClose} variant="primary">
          Close Wiki
        </ActionButton>
      </div>
    </Modal>
  );
};

export default HelpWikiModal;