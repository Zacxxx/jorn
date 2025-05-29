import React from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';

interface HelpWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpWikiModal: React.FC<HelpWikiModalProps> = ({ isOpen, onClose }) => {
  
  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mb-5">
        <h3 className="text-xl font-semibold text-sky-300 mb-2 border-b border-slate-600 pb-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
        <div className="text-sm text-slate-300 space-y-1.5 leading-relaxed">
            {children}
        </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jorn - Help & Wiki" size="3xl">
      <div className="max-h-[70vh] overflow-y-auto styled-scrollbar pr-2 space-y-4">
        <Section title="Welcome to Jorn!">
          <p>Jorn is a world of magic, monsters, and adventure, powered by your imagination and AI!</p>
          <p>This guide will help you navigate its features.</p>
        </Section>

        <Section title="Getting Started">
          <p><strong>Character:</strong> Manage your hero's stats, equipment, spells, abilities, traits, and quests via the Character Sheet (Hero button in header or 'User' in game menu).</p>
          <p><strong>Exploration:</strong> The main screen offers options to 'Seek Battle'.</p>
          <p><strong>Footer Menu:</strong> Access key game sections like Crafting, Inventory, Spells, Traits, Quests, Help, and the main Game Menu.</p>
        </Section>

        <Section title="Combat Basics">
          <p><strong>Turn-Based:</strong> Combat is turn-based. Speed determines who goes first.</p>
          <p><strong>Actions:</strong> On your turn, choose to cast Spells, use Abilities, use Items (Potions), or perform Freestyle Actions.</p>
          <p><strong>Resources:</strong> Spells consume Mana (MP), Abilities consume Energy (EP). HP is your health.</p>
          <p><strong>Stats:</strong> Body, Mind, and Reflex are your core stats, influencing HP, MP, EP, damage, defense, and speed.</p>
          <p><strong>Status Effects:</strong> Spells and abilities can apply various status effects (Poison, Stun, Buffs, Debuffs).</p>
        </Section>

        <Section title="Crafting">
          <p><strong>AI-Powered:</strong> Use the 'Crafting' hub (accessible from the footer) to describe spell, potion, or equipment ideas to the AI.</p>
          <p><strong>Spells:</strong> Define new spells with unique effects. Manage them in your Spellbook.</p>
          <p><strong>Potions:</strong> Create consumables for healing, buffing, or curing ailments.</p>
          <p><strong>Equipment:</strong> Forge weapons, armor, and accessories to boost your stats.</p>
          <p><strong>Resources:</strong> Crafting requires specific resources found from battles or quests.</p>
        </Section>

        <Section title="Character Progression">
          <p><strong>Level Up:</strong> Gain XP from defeating enemies to level up, improving your base stats and unlocking more spell/ability slots.</p>
          <p><strong>Traits:</strong> At certain levels, you can define new passive Traits for your character.</p>
          <p><strong>Quests:</strong> Complete quests for XP, resources, and to advance the story.</p>
        </Section>
        
        <Section title="Tips & Tricks">
          <p>Pay attention to enemy weaknesses and resistances in combat.</p>
          <p>Keep your hero well-equipped and your spells/abilities prepared.</p>
          <p>Experiment with crafting prompts to discover powerful combinations!</p>
        </Section>
      </div>
      <div className="mt-6 text-right">
        <ActionButton onClick={onClose} variant="primary">
          Close Wiki
        </ActionButton>
      </div>
    </Modal>
  );
};

export default HelpWikiModal;