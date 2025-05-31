import { Player, SpellComponent } from '../../types';
import { generateSpellComponentFromResearch } from '../../services/geminiService';

/**
 * Research Manager Module
 * Handles spell component research, AI creation, and discovery systems
 */

export interface ResearchContext {
  player: Player;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setIsLoading: (loading: boolean) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

export interface ComponentCreationResult {
  success: boolean;
  component?: SpellComponent;
  message: string;
  type: 'success' | 'error';
  goldSpent?: number;
  essenceSpent?: number;
}

export interface ResearchInvestment {
  gold: number;
  essence: number;
  timeInvested?: number;
}

/**
 * Create a new spell component using AI
 * @param prompt - Description of the desired component
 * @param goldInvested - Amount of gold to invest
 * @param essenceInvested - Amount of essence to invest
 * @param context - Research execution context
 * @returns Promise that resolves to creation result
 */
export const createAIComponent = async (
  prompt: string,
  goldInvested: number,
  essenceInvested: number,
  context: ResearchContext
): Promise<ComponentCreationResult> => {
  // Validate inputs
  if (!prompt.trim()) {
    return {
      success: false,
      message: 'Please provide a description for the component.',
      type: 'error'
    };
  }

  if (goldInvested < 0 || essenceInvested < 0) {
    return {
      success: false,
      message: 'Investment amounts must be positive.',
      type: 'error'
    };
  }

  // Check if player has enough resources
  if (context.player.gold < goldInvested) {
    return {
      success: false,
      message: `Insufficient gold. You have ${context.player.gold}, but need ${goldInvested}.`,
      type: 'error'
    };
  }

  if (context.player.essence < essenceInvested) {
    return {
      success: false,
      message: `Insufficient essence. You have ${context.player.essence}, but need ${essenceInvested}.`,
      type: 'error'
    };
  }

  context.setIsLoading(true);
  context.addLog('System', `Researching component: "${prompt}"...`, 'info');

  try {
    // Create component using AI
    const generatedComponentData = await generateSpellComponentFromResearch(
      prompt,
      goldInvested,
      essenceInvested,
      context.player.level,
      context.player.discoveredComponents.length
    );

    if (!generatedComponentData) {
      context.setIsLoading(false);
      return {
        success: false,
        message: 'Failed to create component. The research yielded no results.',
        type: 'error'
      };
    }

    // Convert GeneratedSpellComponentData to SpellComponent by adding required fields
    const newComponent: SpellComponent = {
      ...generatedComponentData,
      id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Deduct resources and add component
    context.setPlayer(prev => ({
      ...prev,
      gold: prev.gold - goldInvested,
      essence: prev.essence - essenceInvested,
      discoveredComponents: [...prev.discoveredComponents, newComponent]
    }));

    const successMessage = `Successfully created component: ${newComponent.name}!`;
    context.addLog('System', successMessage, 'success');
    context.showMessageModal(
      'Component Created!',
      `${successMessage}\n\nInvestment: ${goldInvested} gold, ${essenceInvested} essence`,
      'success'
    );

    context.setIsLoading(false);
    return {
      success: true,
      component: newComponent,
      message: successMessage,
      type: 'success',
      goldSpent: goldInvested,
      essenceSpent: essenceInvested
    };

  } catch (error) {
    console.error('Component creation error:', error);
    context.setIsLoading(false);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during research.';
    context.showMessageModal('Research Failed', errorMessage, 'error');
    
    return {
      success: false,
      message: errorMessage,
      type: 'error'
    };
  }
};

/**
 * Calculate recommended investment for component creation
 * @param prompt - Component description
 * @param playerLevel - Current player level
 * @param playerGold - Available gold
 * @param playerEssence - Available essence
 * @returns Recommended investment amounts
 */
export const calculateRecommendedInvestment = (
  prompt: string,
  playerLevel: number,
  playerGold: number,
  playerEssence: number
): ResearchInvestment => {
  // Base investment scales with player level
  const baseGold = Math.max(10, playerLevel * 5);
  const baseEssence = Math.max(5, playerLevel * 2);

  // Adjust based on prompt complexity (rough heuristic)
  const promptComplexity = Math.min(3, Math.max(1, prompt.split(' ').length / 5));
  const complexityMultiplier = 0.5 + (promptComplexity * 0.5);

  let recommendedGold = Math.floor(baseGold * complexityMultiplier);
  let recommendedEssence = Math.floor(baseEssence * complexityMultiplier);

  // Cap at player's available resources (use up to 50% of available)
  recommendedGold = Math.min(recommendedGold, Math.floor(playerGold * 0.5));
  recommendedEssence = Math.min(recommendedEssence, Math.floor(playerEssence * 0.5));

  // Ensure minimum investment
  recommendedGold = Math.max(1, recommendedGold);
  recommendedEssence = Math.max(1, recommendedEssence);

  return {
    gold: recommendedGold,
    essence: recommendedEssence,
    timeInvested: Math.floor(promptComplexity * 30) // Estimated time in minutes
  };
};

/**
 * Get research efficiency based on player stats and level
 * @param player - Current player state
 * @returns Research efficiency multiplier (1.0 = normal)
 */
export const getResearchEfficiency = (player: Player): number => {
  // Base efficiency from Mind stat
  const mindBonus = player.mind * 0.02; // 2% per Mind point
  
  // Level bonus
  const levelBonus = player.level * 0.01; // 1% per level
  
  // Equipment bonus (if player has research-enhancing items)
  let equipmentBonus = 0;
  // TODO: Check for research-enhancing equipment
  
  return Math.max(0.5, 1.0 + mindBonus + levelBonus + equipmentBonus);
};

/**
 * Estimate component creation success chance
 * @param investment - Investment amounts
 * @param player - Current player state
 * @param prompt - Component description
 * @returns Estimated success percentage
 */
export const estimateSuccessChance = (
  investment: ResearchInvestment,
  player: Player,
  prompt: string
): number => {
  // Base success chance
  let successChance = 60; // 60% base
  
  // Investment bonus (more investment = higher chance)
  const totalInvestment = investment.gold + investment.essence;
  const investmentBonus = Math.min(30, totalInvestment * 0.5); // Max 30% bonus
  
  // Player level bonus
  const levelBonus = Math.min(20, player.level * 1); // Max 20% bonus
  
  // Research efficiency bonus
  const efficiency = getResearchEfficiency(player);
  const efficiencyBonus = (efficiency - 1.0) * 100; // Convert to percentage
  
  // Prompt complexity penalty
  const promptComplexity = prompt.split(' ').length;
  const complexityPenalty = Math.max(0, (promptComplexity - 10) * 0.5); // Penalty for very complex prompts
  
  successChance += investmentBonus + levelBonus + efficiencyBonus - complexityPenalty;
  
  return Math.max(10, Math.min(95, successChance)); // Clamp between 10% and 95%
};

/**
 * Get available research projects based on player progress
 * @param player - Current player state
 * @returns Array of available research project descriptions
 */
export const getAvailableResearchProjects = (player: Player): string[] => {
  const projects: string[] = [];
  
  // Basic projects always available
  projects.push(
    'Elemental Amplifier - Enhances elemental spell damage',
    'Mana Conduit - Reduces spell mana costs',
    'Stability Matrix - Improves spell reliability'
  );
  
  // Level-gated projects
  if (player.level >= 5) {
    projects.push(
      'Temporal Distortion - Adds time-based effects',
      'Void Resonator - Enables dark magic manipulation'
    );
  }
  
  if (player.level >= 10) {
    projects.push(
      'Reality Anchor - Allows reality-bending effects',
      'Consciousness Bridge - Enables mind-affecting spells'
    );
  }
  
  if (player.level >= 15) {
    projects.push(
      'Planar Gateway - Enables interdimensional magic',
      'Divine Spark - Allows divine magic channeling'
    );
  }
  
  return projects;
};

/**
 * Check if player has discovered a specific component type
 * @param player - Current player state
 * @param componentType - Type of component to check
 * @returns True if player has discovered this type
 */
export const hasDiscoveredComponentType = (player: Player, componentType: string): boolean => {
  return player.discoveredComponents.some(component => 
    component.name.toLowerCase().includes(componentType.toLowerCase()) ||
    component.description.toLowerCase().includes(componentType.toLowerCase())
  );
};

/**
 * Research Manager utility functions
 */
export const ResearchManagerUtils = {
  createAIComponent,
  calculateRecommendedInvestment,
  getResearchEfficiency,
  estimateSuccessChance,
  getAvailableResearchProjects,
  hasDiscoveredComponentType,
}; 