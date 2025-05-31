import { 
  Player, 
  Spell, 
  GeneratedSpellData, 
  ResourceCost, 
  SpellIconName, 
  SpellComponent,
  ItemType,
  GeneratedConsumableData,
  GeneratedEquipmentData,
  Trait
} from '../../types';
import { generateSpellFromDesign, editSpell, generateTrait, generateConsumable, generateEquipment } from '../../services/geminiService';
import { getScalingFactorFromRarity } from '../../utils';
import { DEFAULT_TRAIT_ICON } from '../../constants';
import { checkResources, deductResources } from '../resources/ResourceManager';
import { calculateMaxRegisteredSpells } from '../player/PlayerStats';

/**
 * Spell Crafting Module
 * Handles spell creation, editing, and trait crafting
 */

export interface SpellDesignData {
  level: number;
  componentsUsed: Array<{ componentId: string; configuration: Record<string, string | number> }>;
  investedResources: ResourceCost[];
  playerName?: string;
  playerDescription?: string;
  playerIcon?: SpellIconName;
  playerPrompt?: string;
}

export interface SpellCraftResult {
  success: boolean;
  spell?: Spell;
  updatedPlayer?: Player;
  error?: string;
}

export interface SpellEditResult {
  success: boolean;
  spell?: Spell;
  updatedPlayer?: Player;
  error?: string;
}

export interface TraitCraftResult {
  success: boolean;
  trait?: Trait;
  updatedPlayer?: Player;
  error?: string;
}

export interface ItemCraftResult {
  success: boolean;
  itemData?: GeneratedConsumableData | GeneratedEquipmentData;
  error?: string;
}

/**
 * Finalize spell design and prepare for crafting confirmation
 * @param player - Current player state
 * @param designData - Spell design data from studio
 * @returns Promise with spell data or error
 */
export const finalizeSpellDesign = async (
  player: Player,
  designData: SpellDesignData
): Promise<{ success: boolean; spellData?: GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }; error?: string }> => {
  const maxRegisteredSpells = calculateMaxRegisteredSpells(player.level);
  
  if (player.spells.length >= maxRegisteredSpells) {
    return {
      success: false,
      error: `Spell Collection Full. Max ${maxRegisteredSpells} spells at level ${player.level}.`
    };
  }

  try {
    const spellDetailsFromAI = await generateSpellFromDesign(designData);
    let totalComponentGoldCost = 0;
    let totalComponentEssenceCost = 0;
    
    designData.componentsUsed.forEach(cu => {
      const compDef = player.discoveredComponents.find(c => c.id === cu.componentId);
      if (compDef) {
        totalComponentGoldCost += compDef.usageGoldCost || 0;
        totalComponentEssenceCost += compDef.usageEssenceCost || 0;
      }
    });

    if (player.gold < totalComponentGoldCost) {
      return {
        success: false,
        error: `Insufficient gold for component usage. Need ${totalComponentGoldCost}G. You have ${player.gold}G.`
      };
    }
    
    if (player.essence < totalComponentEssenceCost) {
      return {
        success: false,
        error: `Insufficient essence for component usage. Need ${totalComponentEssenceCost}Ess. You have ${player.essence}Ess.`
      };
    }
    
    const finalSpellData = {
      ...spellDetailsFromAI,
      _componentUsageGoldCost: totalComponentGoldCost,
      _componentUsageEssenceCost: totalComponentEssenceCost,
    };

    return {
      success: true,
      spellData: finalSpellData
    };
  } catch (error) {
    console.error("Spell design finalization error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not finalize spell design with AI."
    };
  }
};

/**
 * Confirm and execute spell crafting
 * @param player - Current player state
 * @param pendingSpellData - Spell data to craft
 * @returns Result with new spell and updated player
 */
export const confirmSpellCraft = (
  player: Player,
  pendingSpellData: GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }
): SpellCraftResult => {
  if (!pendingSpellData) {
    return {
      success: false,
      error: "No spell data to confirm."
    };
  }

  if (!checkResources(player, pendingSpellData.resourceCost)) {
    return {
      success: false,
      error: "Insufficient final resources for this AI-balanced spell."
    };
  }

  const componentGoldCost = pendingSpellData._componentUsageGoldCost || 0;
  const componentEssenceCost = pendingSpellData._componentUsageEssenceCost || 0;

  if (player.gold < componentGoldCost) {
    return {
      success: false,
      error: `Insufficient gold for component usage. Need ${componentGoldCost}G.`
    };
  }
  
  if (player.essence < componentEssenceCost) {
    return {
      success: false,
      error: `Insufficient essence for component usage. Need ${componentEssenceCost}Ess.`
    };
  }

  // Deduct resources
  const resourceResult = deductResources(player, pendingSpellData.resourceCost);
  if (!resourceResult.success || !resourceResult.updatedPlayer) {
    return {
      success: false,
      error: "Failed to deduct resources."
    };
  }

  // Deduct component costs
  const updatedPlayer = {
    ...resourceResult.updatedPlayer,
    gold: resourceResult.updatedPlayer.gold - componentGoldCost,
    essence: resourceResult.updatedPlayer.essence - componentEssenceCost,
  };

  // Create new spell
  const newSpell: Spell = {
    id: `spell-${Date.now()}`,
    name: pendingSpellData.name,
    description: pendingSpellData.description,
    manaCost: pendingSpellData.manaCost,
    damage: pendingSpellData.damage,
    damageType: pendingSpellData.damageType,
    scalesWith: pendingSpellData.scalesWith,
    effect: pendingSpellData.effect,
    iconName: pendingSpellData.iconName,
    statusEffectInflict: pendingSpellData.statusEffectInflict,
    resourceCost: pendingSpellData.resourceCost,
    level: pendingSpellData.level || 1,
    componentsUsed: pendingSpellData.componentsUsed || [],
    tags: pendingSpellData.tags || [],
    rarity: pendingSpellData.rarity || 0,
    epCost: pendingSpellData.epCost,
    scalingFactor: getScalingFactorFromRarity(pendingSpellData.rarity || 0),
    duration: pendingSpellData.duration,
  };

  // Add spell to player
  const finalPlayer = {
    ...updatedPlayer,
    spells: [...updatedPlayer.spells, newSpell]
  };

  return {
    success: true,
    spell: newSpell,
    updatedPlayer: finalPlayer
  };
};

/**
 * Initiate spell refinement/editing
 * @param player - Current player state
 * @param originalSpell - Spell to edit
 * @param refinementPrompt - User's refinement instructions
 * @param augmentLevel - Optional power augmentation level
 * @param selectedComponentId - Optional component to integrate
 * @returns Promise with edited spell data or error
 */
export const initiateSpellRefinement = async (
  player: Player,
  originalSpell: Spell,
  refinementPrompt: string,
  augmentLevel?: number,
  selectedComponentId?: string
): Promise<{ success: boolean; spellData?: GeneratedSpellData; updatedPlayer?: Player; error?: string }> => {
  try {
    let enhancedPrompt = refinementPrompt;
    let updatedPlayer = { ...player };
    
    if (augmentLevel && augmentLevel > 0) {
      enhancedPrompt += ` AUGMENT LEVEL: Increase spell power level by ${augmentLevel} (using ${augmentLevel * 10} essence). Make the spell significantly more powerful.`;
      
      // Deduct essence for augment
      const essenceCost = augmentLevel * 10;
      const playerEssence = player.inventory['essence'] || 0;
      if (playerEssence < essenceCost) {
        return {
          success: false,
          error: 'Not enough essence for augment level'
        };
      }
      
      updatedPlayer = {
        ...updatedPlayer,
        inventory: {
          ...updatedPlayer.inventory,
          essence: Math.max(0, (updatedPlayer.inventory['essence'] || 0) - essenceCost)
        }
      };
    }
    
    if (selectedComponentId) {
      const component = player.discoveredComponents.find((c: SpellComponent) => c.id === selectedComponentId);
      if (component) {
        enhancedPrompt += ` COMPONENT INTEGRATION: Integrate the component "${component.name}" (${component.category}, Tier ${component.tier}) into this spell. Component description: ${component.description}. Component tags: ${component.tags?.join(', ') || 'none'}.`;
      }
    }
    
    const editedSpellData = await editSpell(originalSpell, enhancedPrompt);
    
    return {
      success: true,
      spellData: editedSpellData,
      updatedPlayer: updatedPlayer
    };
  } catch (error) {
    console.error("Spell refinement error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not generate refinement."
    };
  }
};

/**
 * Confirm spell edit and apply changes
 * @param player - Current player state
 * @param originalSpell - Original spell being edited
 * @param pendingSpellData - New spell data from editing
 * @returns Result with updated spell and player
 */
export const confirmSpellEdit = (
  player: Player,
  originalSpell: Spell,
  pendingSpellData: GeneratedSpellData
): SpellEditResult => {
  if (!pendingSpellData || !originalSpell) {
    return {
      success: false,
      error: "Missing spell data for editing."
    };
  }

  if (!checkResources(player, pendingSpellData.resourceCost)) {
    return {
      success: false,
      error: "Insufficient resources."
    };
  }

  // Deduct resources
  const resourceResult = deductResources(player, pendingSpellData.resourceCost);
  if (!resourceResult.success || !resourceResult.updatedPlayer) {
    return {
      success: false,
      error: "Failed to deduct resources."
    };
  }

  // Create updated spell
  const updatedSpell: Spell = {
    ...originalSpell,
    ...pendingSpellData,
    level: pendingSpellData.level || originalSpell.level,
    componentsUsed: pendingSpellData.componentsUsed || originalSpell.componentsUsed,
    tags: pendingSpellData.tags || originalSpell.tags,
    rarity: pendingSpellData.rarity ?? originalSpell.rarity,
    epCost: pendingSpellData.epCost ?? originalSpell.epCost,
    scalingFactor: getScalingFactorFromRarity(pendingSpellData.rarity ?? originalSpell.rarity),
    duration: pendingSpellData.duration ?? originalSpell.duration,
  };

  // Update player with modified spell
  const updatedPlayer = {
    ...resourceResult.updatedPlayer,
    spells: resourceResult.updatedPlayer.spells.map(s => s.id === updatedSpell.id ? updatedSpell : s)
  };

  return {
    success: true,
    spell: updatedSpell,
    updatedPlayer: updatedPlayer
  };
};

/**
 * Craft a new trait
 * @param player - Current player state
 * @param promptText - Trait description prompt
 * @returns Promise with new trait and updated player
 */
export const craftTrait = async (
  player: Player,
  promptText: string
): Promise<TraitCraftResult> => {
  try {
    const traitData = await generateTrait(promptText, player.level);
    const newTrait: Trait = {
      ...traitData,
      id: `trait-${Date.now()}`,
      iconName: traitData.iconName || DEFAULT_TRAIT_ICON,
      rarity: traitData.rarity || 0,
      scalingFactor: getScalingFactorFromRarity(traitData.rarity || 0),
    };

    const updatedPlayer = {
      ...player,
      traits: [...player.traits, newTrait]
    };

    return {
      success: true,
      trait: newTrait,
      updatedPlayer: updatedPlayer
    };
  } catch (error) {
    console.error("Trait crafting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not craft trait."
    };
  }
};

/**
 * Initiate item crafting
 * @param promptText - Item description prompt
 * @param itemType - Type of item to craft
 * @param playerLevel - Player's current level
 * @returns Promise with item data or error
 */
export const initiateItemCraft = async (
  promptText: string,
  itemType: ItemType,
  playerLevel: number
): Promise<ItemCraftResult> => {
  try {
    let itemData: GeneratedConsumableData | GeneratedEquipmentData;
    if (itemType === 'Consumable') {
      itemData = await generateConsumable(promptText, playerLevel);
    } else {
      itemData = await generateEquipment(promptText, playerLevel);
    }

    return {
      success: true,
      itemData: itemData
    };
  } catch (error) {
    console.error("Item crafting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not craft item."
    };
  }
};

/**
 * Spell Crafting utility functions
 */
export const SpellCraftingUtils = {
  finalizeSpellDesign,
  confirmSpellCraft,
  initiateSpellRefinement,
  confirmSpellEdit,
  craftTrait,
  initiateItemCraft,
}; 