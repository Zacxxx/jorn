import React, { useState } from 'react';
import { Player, SpellComponent, ResourceType, GeneratedSpellComponentData } from '../types';
import ActionButton from './ActionButton';
import { GetSpellIcon, FlaskIcon, GoldCoinIcon, CheckmarkCircleIcon, EssenceIcon, SearchIcon, WandIcon } from './IconComponents';
import SpellComponentCard from './SpellComponentCard';
import { RESEARCH_SEARCH_BASE_GOLD_COST, RESEARCH_SEARCH_BASE_ESSENCE_COST } from '../constants';
import { getRarityColorClass } from '../utils'; 
import LoadingSpinner from './LoadingSpinner';
import { generateSpellComponentFromResearch } from '../services/geminiService';

interface ResearchLabViewProps {
  player: Player;
  onAICreateComponent: (prompt: string, gold: number, essence: number) => Promise<SpellComponent | null>;
  isLoading: boolean;
  onReturnHome: () => void; // This will now likely go to Research Archives or Crafting Hub
}

const ResearchLabView: React.FC<ResearchLabViewProps> = ({
  player,
  onAICreateComponent,
  isLoading,
  onReturnHome,
}) => {
  const [researchPrompt, setResearchPrompt] = useState('');
  const [goldToInvest, setGoldToInvest] = useState(RESEARCH_SEARCH_BASE_GOLD_COST);
  const [essenceToInvest, setEssenceToInvest] = useState(RESEARCH_SEARCH_BASE_ESSENCE_COST);
  const [error, setError] = useState<string | null>(null);
  const [lastDiscoveredComponent, setLastDiscoveredComponent] = useState<SpellComponent | null>(null);

  const handleInitiateAIResearch = async () => {
    setError(null);
    setLastDiscoveredComponent(null);
    if (!researchPrompt.trim()) {
      setError("Please provide a research idea or concept.");
      return;
    }
    if (player.gold < goldToInvest) {
      setError(`Not enough Gold. Need ${goldToInvest}.`);
      return;
    }
    if (player.essence < essenceToInvest) {
      setError(`Not enough Essence. Need ${essenceToInvest}.`);
      return;
    }

    try {
      const newComponent = await onAICreateComponent(researchPrompt, goldToInvest, essenceToInvest);
      if (newComponent) {
        setLastDiscoveredComponent(newComponent);
        setResearchPrompt(''); 
      } else {
        setError("AI failed to generate a component, or no new ideas were formed. Try a different prompt or investment.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during research.");
    }
  };
  
  const totalComponentsKnown = player.discoveredComponents.length;

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-slate-100">
      <h2 className="text-2xl font-bold text-sky-300 mb-4 text-center flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
        <FlaskIcon className="w-8 h-8 mr-3 text-sky-400" />
        Theorize New Components
      </h2>
      <p className="text-center text-sm text-slate-400 mb-4">Use your knowledge and resources to guide the AI in discovering new spell components.</p>


      <div className="mb-4 p-3 bg-slate-700/50 rounded-md border border-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center space-x-3 text-sm">
          <p className="text-slate-300">Gold: <span className="font-bold text-yellow-300">{player.gold} <GoldCoinIcon className="inline w-4 h-4 align-text-bottom"/></span></p>
          <p className="text-slate-300">Essence: <span className="font-bold text-purple-300">{player.essence} <EssenceIcon className="inline w-4 h-4 align-text-bottom"/></span></p>
        </div>
        <p className="text-sm text-slate-300">Components Known: <span className="font-bold text-green-300">{totalComponentsKnown}</span></p>
      </div>

      <div className="mb-6 p-4 bg-slate-700/60 rounded-lg border-2 border-sky-600/70 shadow-lg">
        <h3 className="text-xl font-semibold text-sky-200 mb-3">New Component Theory</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="researchPrompt" className="block text-sm font-medium text-slate-300 mb-1">Describe your Research Idea:</label>
            <textarea
              id="researchPrompt"
              value={researchPrompt}
              onChange={(e) => setResearchPrompt(e.target.value)}
              placeholder="e.g., 'A component that amplifies fire magic', 'Something to make spells cheaper', 'A defensive ice aura component'"
              rows={3}
              className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="goldToInvest" className="block text-sm font-medium text-slate-300 mb-1">Gold to Invest (influences rarity/complexity):</label>
              <input
                type="number"
                id="goldToInvest"
                value={goldToInvest}
                onChange={(e) => setGoldToInvest(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="essenceToInvest" className="block text-sm font-medium text-slate-300 mb-1">Essence to Invest (influences rarity/power):</label>
              <input
                type="number"
                id="essenceToInvest"
                value={essenceToInvest}
                onChange={(e) => setEssenceToInvest(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                disabled={isLoading}
              />
            </div>
          </div>
          <ActionButton
            onClick={handleInitiateAIResearch}
            isLoading={isLoading}
            disabled={isLoading || player.gold < goldToInvest || player.essence < essenceToInvest || !researchPrompt.trim()}
            variant="primary"
            size="lg"
            icon={<WandIcon className="w-5 h-5" />}
            className="w-full"
          >
            Initiate AI Research
          </ActionButton>
          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
        </div>
      </div>
      
      {isLoading && <div className="my-4 flex justify-center"><LoadingSpinner text="AI is pondering ancient secrets..." /></div>}

      {lastDiscoveredComponent && !isLoading && (
        <div className="my-6 p-4 bg-green-800/20 rounded-lg border-2 border-green-500/70 shadow-xl animate-fadeIn">
          <h3 className="text-xl font-semibold text-green-300 mb-3 flex items-center">
            <CheckmarkCircleIcon className="w-6 h-6 mr-2"/> Discovery!
          </h3>
          <div className="max-w-sm mx-auto"> {/* Center the card and limit its width */}
            <SpellComponentCard component={lastDiscoveredComponent} showResearchRequirements={true} />
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <ActionButton onClick={onReturnHome} variant="secondary" size="lg" disabled={isLoading}>
          Back to Research Archives
        </ActionButton>
      </div>
    </div>
  );
};

export default ResearchLabView;