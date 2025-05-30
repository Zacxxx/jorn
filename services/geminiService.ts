import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
    GEMINI_MODEL_TEXT, AVAILABLE_SPELL_ICONS, DEFAULT_TRAIT_ICON, DEFAULT_QUEST_ICON, 
    AVAILABLE_STATUS_EFFECTS, STATUS_EFFECT_ICONS, AVAILABLE_RESOURCE_TYPES_FOR_AI, AVAILABLE_ITEM_ICONS, 
    CONSUMABLE_EFFECT_TYPES, AVAILABLE_EQUIPMENT_SLOTS, EXAMPLE_SPELL_COMPONENTS, ENEMY_DIFFICULTY_XP_REWARD
} from '../constants';
import { 
    GeneratedSpellData, GeneratedEnemyData, SpellIconName, GeneratedTraitData, GeneratedQuestData, 
    Quest, Spell, SpellStatusEffect, StatusEffectName, ResourceCost, ResourceType, 
    GeneratedConsumableData, ConsumableEffectType, GeneratedEquipmentData, EquipmentSlot, 
    Player, PlayerEffectiveStats, SpellComponent, ElementName, GeneratedSpellComponentData, TagName,
    LootDrop 
} from '../types';
import { ALL_ELEMENTS } from "../src/components/gameplay/elements/element-list";
import { ALL_TAG_NAMES } from "../src/components/gameplay/tags"; 
import { getScalingFactorFromRarity } from "../utils";


if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "MISSING_API_KEY" });

function parseJsonFromGeminiResponse(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; 
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonStr, e);
    throw new Error(`Invalid JSON response from AI: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function validateResourceCosts(costs: any[] | undefined, maxTypes = 3, maxQuantity = 5): ResourceCost[] | undefined {
    if (costs && Array.isArray(costs)) {
        const validatedCosts = costs
            .filter((cost: any) =>
                typeof cost.itemId === 'string' &&
                typeof cost.quantity === 'number' && cost.quantity > 0 && cost.quantity <= maxQuantity &&
                typeof cost.type === 'string' && AVAILABLE_RESOURCE_TYPES_FOR_AI.includes(cost.type as ResourceType)
            )
            .slice(0, maxTypes)
            .map(cost => ({
                itemId: cost.itemId,
                quantity: cost.quantity,
                type: cost.type as ResourceType, // Type is now guaranteed to be ResourceType
            }));
        return validatedCosts.length > 0 ? validatedCosts : undefined;
    }
    return undefined;
}


function validateGeneratedSpellData(data: any): GeneratedSpellData {
  if (!data.iconName || !AVAILABLE_SPELL_ICONS.includes(data.iconName)) {
      data.iconName = 'Default'; 
  }
  data.damage = typeof data.damage === 'number' ? Math.max(0, Math.min(100, data.damage)) : 5; 
  data.manaCost = typeof data.manaCost === 'number' ? Math.max(1, Math.min(100, data.manaCost)) : 5; 
  
  if (!ALL_ELEMENTS.includes(data.damageType as ElementName)) {
    data.damageType = data.damage > 0 ? 'Arcane' : ('None' as any); 
  }

  if (data.scalesWith && !['Body', 'Mind'].includes(data.scalesWith)) {
    data.scalesWith = data.damageType === 'PhysicalNeutral' ? 'Body' : 'Mind'; 
  } else if (!data.scalesWith && data.damageType !== 'HealingSource' && data.damageType !== ('None' as any) && data.damage > 0) {
    data.scalesWith = data.damageType === 'PhysicalNeutral' ? 'Body' : 'Mind';
  }

  if (data.statusEffectInflict) {
    const sei = data.statusEffectInflict as SpellStatusEffect;
    if (!AVAILABLE_STATUS_EFFECTS.includes(sei.name)) { 
      delete data.statusEffectInflict;
    } else {
      sei.duration = typeof sei.duration === 'number' ? Math.max(1, Math.min(5, sei.duration)) : 2; 
      sei.chance = typeof sei.chance === 'number' ? Math.max(10, Math.min(100, sei.chance)) : 50; 
      if (sei.magnitude !== undefined && typeof sei.magnitude !== 'number') {
         sei.magnitude = (['Poison', 'Burn', 'Regeneration'].includes(sei.name) || sei.name.startsWith('TEMP_') || sei.name.startsWith('Weaken') || sei.name.startsWith('Strengthen') || sei.name.endsWith('DoTActive')) ? 5 : undefined; 
      } else if (sei.magnitude !== undefined) {
        sei.magnitude = Math.max(1, Math.min(25, sei.magnitude)); 
      }
      const magnitudeRelevantEffects: StatusEffectName[] = ['Poison', 'Burn', 'Regeneration', 'WeakenBody', 'WeakenMind', 'WeakenReflex', 'StrengthenBody', 'StrengthenMind', 'StrengthenReflex', 'TEMP_BODY_UP', 'TEMP_MIND_UP', 'TEMP_REFLEX_UP', 'TEMP_SPEED_UP', 'TEMP_MAX_HP_UP', 'TEMP_MAX_MP_UP', 'TEMP_HP_REGEN', 'BurningDoTActive', 'PoisonDoTActive', 'BleedingDoTActive', 'CorruptedDoTActive', 'FrostbittenDoTActive', 'RottingDoTActive', 'ShockedDoTActive']; 
      if (!magnitudeRelevantEffects.includes(sei.name) && sei.magnitude !== undefined) {
        delete sei.magnitude;
      }
    }
  }
  data.resourceCost = validateResourceCosts(data.resourceCost);
  data.level = typeof data.level === 'number' ? Math.max(1, Math.min(10, data.level)) : 1; 
  data.rarity = typeof data.rarity === 'number' ? Math.max(0, Math.min(10, data.rarity)) : 0;
  data.scalingFactor = getScalingFactorFromRarity(data.rarity); // Assign scaling factor
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.filter((tag: any) => typeof tag === 'string' && ALL_TAG_NAMES.includes(tag as TagName)).slice(0, 5); 
    if (data.scalingFactor > 0 && data.scalesWith && !data.tags.includes('Scaling')) {
        data.tags.push('Scaling');
    }
  } else {
    data.tags = (data.scalingFactor > 0 && data.scalesWith) ? ['Scaling'] : [];
  }
  data.epCost = typeof data.epCost === 'number' ? Math.max(0, Math.min(50, data.epCost)) : undefined;
  data.duration = typeof data.duration === 'number' ? Math.max(1, Math.min(5, data.duration)) : undefined;


  return data as GeneratedSpellData;
}


export async function generateSpell(prompt: string): Promise<GeneratedSpellData> {
  const systemInstruction = `You are a spell design assistant for a fantasy RPG. Create a JSON object for a spell.
Fields:
- name: Cool, concise spell name (string, max 3 words).
- description: Flavorful description (string, 1-2 sentences, max 100 chars).
- manaCost: Integer (5-30).
- damage: Integer (0-50). This is base damage/healing.
- damageType: Choose from: ${ALL_ELEMENTS.join(', ')}.
- scalesWith: Optional 'Body' or 'Mind'. If damage > 0 and not HealingSource/None, this should be set.
- effect: Optional string for secondary flavor text (max 70 chars).
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.join(', ')}. Default 'Default'.
- statusEffectInflict: Optional object. { name: from ${AVAILABLE_STATUS_EFFECTS.join(', ')}, duration: (1-3 turns), magnitude: (1-10, if applicable), chance: (20-80%) }.
- resourceCost: Optional array of { "itemId": "string_id_from_master_list", "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}", "quantity": integer (1-3) }. Max 2 types. 
- level: Integer (1-10).
- rarity: Integer (0-10, 0 common, 10 relic). This will determine scalingFactor.
- tags: Array of strings (max 3). Choose from: ${ALL_TAG_NAMES.join(', ')}. If scalesWith is set, include 'Scaling' tag.
- epCost: Optional integer (0-20).
- duration: Optional integer (1-5 turns, for spells that apply effects like Silence or buffs).
Ensure valid JSON. Prioritize balanced spells.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });
    
    const rawData = parseJsonFromGeminiResponse(response.text);
    return validateGeneratedSpellData(rawData);

  } catch (error) {
    console.error("Error generating spell (legacy):", error);
    throw new Error(`Failed to generate spell (legacy): ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function generateSpellFromDesign(
  designData: { level: number; componentsUsed: Array<{ componentId: string; configuration: Record<string, string | number> }>; investedResources?: ResourceCost[]; playerName?: string; playerDescription?: string; playerIcon?: SpellIconName; playerPrompt?: string; }
): Promise<GeneratedSpellData> {
  const { level, componentsUsed, investedResources, playerName, playerDescription, playerIcon, playerPrompt } = designData;

  const chosenComponentsDetails = componentsUsed.map(cu => {
    const compDef = EXAMPLE_SPELL_COMPONENTS.find(c => c.id === cu.componentId); 
    return { ...compDef, configuration: cu.configuration }; 
  });
  
  let promptForAI = `A player is designing a level ${level} spell.
Player's concept prompt (optional): "${playerPrompt || 'None provided.'}"
Player's chosen name (optional): "${playerName || 'None provided.'}"
Player's chosen description (optional): "${playerDescription || 'None provided.'}"
Player's chosen icon (optional): "${playerIcon || 'None provided.'}"

Selected Spell Components and their configurations:
${JSON.stringify(chosenComponentsDetails, null, 2)}

Player has invested the following resources into crafting:
${investedResources && investedResources.length > 0 ? JSON.stringify(investedResources.map(rc => ({ itemId: rc.itemId, quantity: rc.quantity, type: rc.type })), null, 2) : "No specific resources invested by player upfront."}

Your task is to finalize this spell. Generate a JSON object with:
- name: (string) Creative spell name. Adapt if player provided.
- description: (string) Flavorful spell description. Adapt if player provided. Max 150 chars.
- iconName: (SpellIconName from list) Best fitting icon. Options: ${AVAILABLE_SPELL_ICONS.join(', ')}.
- manaCost: (integer) Balanced mana cost (1-100). Consider level, components, configurations, invested resources.
- damage: (integer) Final base damage (0-100). Derived from components, configs, level.
- damageType: (ElementName from list: ${ALL_ELEMENTS.join(', ')}) Derived from components.
- scalesWith: ('Body' | 'Mind' | null) Derived from components.
- statusEffectInflict: (object | null) Derived status effect. Status Name from: ${AVAILABLE_STATUS_EFFECTS.join(', ')}. Chance: 10-100%. Duration: 1-5 turns. Magnitude: 1-25.
- resourceCost: (array of ResourceCost objects | null) Final additional resources for crafting. Use itemId from master list. ResourceType from: ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}. Quantity: 1-5. Max 3 types.
- tags: (array of strings, max 5) Functional tags. Choose from: ${ALL_TAG_NAMES.join(', ')}. If scalesWith is set, include 'Scaling' tag.
- rarity: (integer, 0-10) Estimate rarity based on power, complexity, component rarity.
- epCost: (integer, optional) EP cost (0-50).
- duration: (integer, optional, 1-5 turns) For spells with lasting effects like buffs/debuffs.
The spell's power, costs should be proportional to its level and components. Return ONLY valid JSON.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: promptForAI }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });
    
    const rawData = parseJsonFromGeminiResponse(response.text);
    const validatedData = validateGeneratedSpellData(rawData); 
    
    validatedData.level = level;
    validatedData.componentsUsed = componentsUsed;
    if (playerName && !validatedData.name) validatedData.name = playerName;
    if (playerDescription && !validatedData.description) validatedData.description = playerDescription;
    if (playerIcon && (!validatedData.iconName || validatedData.iconName === 'Default')) validatedData.iconName = playerIcon;
    validatedData.scalingFactor = getScalingFactorFromRarity(validatedData.rarity); // Set scalingFactor

    return validatedData;

  } catch (error) {
    console.error("Error generating spell from design:", error);
    throw new Error(`Failed to generate spell from design: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function editSpellImplementation(originalSpell: Spell, refinementPrompt: string): Promise<GeneratedSpellData> {
  const systemInstruction = `You are a spell refinement assistant. Modify an existing spell.
Original spell: ${JSON.stringify(originalSpell, null, 2)}
User's request: "${refinementPrompt}"
Generate a new JSON object. Fields are same as generateSpellFromDesign.
DamageType must be one of: ${ALL_ELEMENTS.join(', ')}.
Adjust manaCost (1-100) and damage (0-100) based on changes.
Resource costs might also change (1-5 quantity, max 3 types, provide itemId from master list, type from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}).
Update rarity (0-10) and tags (array of strings from ${ALL_TAG_NAMES.join(', ')}) based on changes. If scalesWith is set or changed, include 'Scaling' tag.
Ensure valid JSON. Spell level is ${originalSpell.level}. Return ONLY the valid JSON object.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Refine spell: ${originalSpell.name}. Instructions: ${refinementPrompt}` }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.75,
      },
    });

    const rawData = parseJsonFromGeminiResponse(response.text);
    const validatedData = validateGeneratedSpellData(rawData);
    
    validatedData.damage = Math.max(0, Math.min(100, validatedData.damage ?? originalSpell.damage));
    validatedData.manaCost = Math.max(1, Math.min(100, validatedData.manaCost ?? originalSpell.manaCost));
    validatedData.level = originalSpell.level; 
    validatedData.rarity = validatedData.rarity ?? originalSpell.rarity;
    validatedData.tags = validatedData.tags && validatedData.tags.length > 0 ? validatedData.tags : originalSpell.tags;
    validatedData.scalingFactor = getScalingFactorFromRarity(validatedData.rarity); // Update scalingFactor

    return validatedData;
  } catch (error) {
    console.error("Error editing spell:", error);
    throw new Error(`Failed to edit spell: ${error instanceof Error ? error.message : String(error)}`);
  }
}
export { editSpellImplementation as editSpell };


export async function generateEnemy(playerLevel: number): Promise<GeneratedEnemyData> {
  const difficulty = playerLevel < 3 ? 'easy' : playerLevel < 7 ? 'medium' : 'hard';
  const isElite = Math.random() < 0.1; 

  const statRange = {
    easy: {min: 5, max: 10},
    medium: {min: 8, max: 15},
    hard: {min: 12, max: 20}
  };
  const hpRange = {
    easy: {min: 30, max: 60},
    medium: {min: 60, max: 120},
    hard: {min: 120, max: 200}
  };
  
  let goldMin = isElite && ENEMY_DIFFICULTY_XP_REWARD.elite ? Math.floor(ENEMY_DIFFICULTY_XP_REWARD[difficulty].goldMin * ENEMY_DIFFICULTY_XP_REWARD.elite.gold_multiplier) : ENEMY_DIFFICULTY_XP_REWARD[difficulty].goldMin;
  let goldMax = isElite && ENEMY_DIFFICULTY_XP_REWARD.elite ? Math.floor(ENEMY_DIFFICULTY_XP_REWARD[difficulty].goldMax * ENEMY_DIFFICULTY_XP_REWARD.elite.gold_multiplier) : ENEMY_DIFFICULTY_XP_REWARD[difficulty].goldMax;
  let essenceMin = isElite && ENEMY_DIFFICULTY_XP_REWARD.elite ? Math.floor(ENEMY_DIFFICULTY_XP_REWARD[difficulty].essenceMin * ENEMY_DIFFICULTY_XP_REWARD.elite.essence_multiplier) : ENEMY_DIFFICULTY_XP_REWARD[difficulty].essenceMin;
  let essenceMax = isElite && ENEMY_DIFFICULTY_XP_REWARD.elite ? Math.floor(ENEMY_DIFFICULTY_XP_REWARD[difficulty].essenceMax * ENEMY_DIFFICULTY_XP_REWARD.elite.essence_multiplier) : ENEMY_DIFFICULTY_XP_REWARD[difficulty].essenceMax;

  if (isElite) { 
    essenceMin = Math.max(1, essenceMin); 
    essenceMax = Math.max(2, essenceMax);
  }

  const systemInstruction = `You are an RPG encounter designer. Generate a unique fantasy RPG enemy.
Return ONLY a single, valid JSON object.
- name: Creative enemy name (string, max 4 words). If elite, can prepend "Elite".
- description: Short evocative description (string, 1-2 sentences, max 120 chars).
- hp: Integer health. Base on difficulty '${difficulty}': easy (${hpRange.easy.min}-${hpRange.easy.max}), medium (${hpRange.medium.min}-${hpRange.medium.max}), hard (${hpRange.hard.min}-${hpRange.hard.max}). If elite, increase by 50-100%.
- level: Integer, around playerLevel=${playerLevel}. Min level 1.
- baseBody, baseMind, baseReflex: Integer core stats. Based on difficulty '${difficulty}': easy (${statRange.easy.min}-${statRange.easy.max}), medium (${statRange.medium.min}-${statRange.medium.max}), hard (${statRange.hard.min}-${statRange.hard.max}). If elite, increase by 25-50%.
- baseSpeed: Optional integer (5-15).
- specialAbilityName: (Optional string) Max 3 words.
- specialAbilityDescription: (Optional string) Max 70 chars.
- weakness: (Optional ElementName from ${ALL_ELEMENTS.join(', ')}).
- resistance: (Optional ElementName from ${ALL_ELEMENTS.join(', ')}).
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon', 'BodyIcon', 'ReflexIcon', 'SpeedIcon', 'GoldCoinIcon', 'EssenceIcon'].includes(icon)).join(', ')}. Default 'SkullIcon'.
- goldDrop: {min: ${goldMin}, max: ${goldMax}}.
- essenceDrop: {min: ${essenceMin}, max: ${essenceMax}}.
- isElite: ${isElite} (boolean).
- droppedResources: (Optional array of { "itemId": "string_id_from_master_list", "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}", "quantity": integer (1-2) }) 1-2 thematically coherent resources. Elites might drop more.
- lootTableId: (Optional string) e.g., "goblin_common_loot", "elite_drake_treasure". Default "default_lvl_${playerLevel}".
Ensure stats are appropriate for '${difficulty}'. If isElite, increase HP and stats.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Generate a ${difficulty} enemy for a level ${playerLevel} player. Elite status: ${isElite}.`}] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const generatedData = parseJsonFromGeminiResponse(response.text) as GeneratedEnemyData;

    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon', 'BodyIcon', 'ReflexIcon', 'SpeedIcon', 'GoldCoinIcon', 'EssenceIcon'].includes(generatedData.iconName)) {
        generatedData.iconName = 'SkullIcon';
    }
    if (generatedData.iconName === 'Default') {
        generatedData.iconName = 'SkullIcon';
    }
    
    const currentDifficultyRange = difficulty;
    generatedData.isElite = isElite; 
    
    generatedData.hp = typeof generatedData.hp === 'number' ? Math.max(hpRange[currentDifficultyRange].min, Math.min(hpRange[currentDifficultyRange].max * (generatedData.isElite ? 2 : 1), generatedData.hp)) : hpRange[currentDifficultyRange].min * (generatedData.isElite ? 1.5 : 1);
    generatedData.baseBody = typeof generatedData.baseBody === 'number' ? Math.max(statRange[currentDifficultyRange].min, Math.min(statRange[currentDifficultyRange].max * (generatedData.isElite ? 1.5 : 1), generatedData.baseBody)) : statRange[currentDifficultyRange].min * (generatedData.isElite ? 1.25 : 1);
    generatedData.baseMind = typeof generatedData.baseMind === 'number' ? Math.max(statRange[currentDifficultyRange].min, Math.min(statRange[currentDifficultyRange].max * (generatedData.isElite ? 1.5 : 1), generatedData.baseMind)) : statRange[currentDifficultyRange].min * (generatedData.isElite ? 1.25 : 1);
    generatedData.baseReflex = typeof generatedData.baseReflex === 'number' ? Math.max(statRange[currentDifficultyRange].min, Math.min(statRange[currentDifficultyRange].max * (generatedData.isElite ? 1.5 : 1), generatedData.baseReflex)) : statRange[currentDifficultyRange].min * (generatedData.isElite ? 1.25 : 1);
    
    if (generatedData.baseSpeed !== undefined) {
      generatedData.baseSpeed = typeof generatedData.baseSpeed === 'number' ? Math.max(5, Math.min(15  * (generatedData.isElite ? 1.2 : 1), generatedData.baseSpeed)) : (5 + Math.floor(generatedData.baseReflex / 2));
    }
    generatedData.level = typeof generatedData.level === 'number' ? Math.max(1, Math.min(playerLevel + 2, generatedData.level)) : Math.max(1, playerLevel);

    generatedData.goldDrop = { min: goldMin, max: goldMax };
    generatedData.essenceDrop = { min: essenceMin, max: essenceMax };
    generatedData.droppedResources = validateResourceCosts(generatedData.droppedResources, 2, generatedData.isElite ? 3 : 2);


    return generatedData;
  } catch (error) {
    console.error("Error generating enemy:", error);
    throw new Error(`Failed to generate enemy: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateTrait(prompt: string, playerLevel: number): Promise<GeneratedTraitData> {
  const systemInstruction = `You are an RPG trait designer. Player level ${playerLevel}. Create a JSON object for a passive trait.
Fields:
- name: Concise name (string, max 3 words).
- description: Brief flavorful description (string, 1-2 sentences, max 150 chars). This describes a PASSIVE benefit. The description should hint if the trait's effectiveness is influenced by core player stats (Body, Mind, Reflex, Speed) or if it provides a direct numeric boost that might scale (e.g., 'Improves fire resistance based on Mind' or 'Grants +X to HP that increases with trait level/rarity').
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon', 'FlaskIcon', 'AtomIcon', 'GoldCoinIcon', 'EssenceIcon', 'ChestIcon'].includes(icon)).join(', ')}. Default '${DEFAULT_TRAIT_ICON}'.
- rarity: (integer, 0-10) Rarity of the trait.
- level: Integer (should generally match playerLevel at creation).
- scalingFactor: Float (0.05 to 0.5, higher for rarer traits, representing how the trait's main benefit might scale if applicable).
- tags: (array of 1-3 strings) Assign tags from ${ALL_TAG_NAMES.join(', ')} that directly reflect the trait's primary function and any elemental or mechanical affinity (e.g., a trait improving fire resistance should have ['Fire', 'Resist'] tags; a trait boosting healing effectiveness might have ['Healing', 'Enhancement'] tags). If the trait's benefit scales, include the 'Scaling' tag.
Keep traits passive, not overly game-breaking. Ensure the trait's name, description, tags, and any scaling implications are coherent and clearly related. Return ONLY the valid JSON object.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const generatedData = parseJsonFromGeminiResponse(response.text) as GeneratedTraitData;

    // Existing icon validation
    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon', 'FlaskIcon', 'AtomIcon', 'GoldCoinIcon', 'EssenceIcon', 'ChestIcon'].includes(generatedData.iconName)) {
      generatedData.iconName = DEFAULT_TRAIT_ICON;
    }

    // Existing rarity validation
    generatedData.rarity = typeof generatedData.rarity === 'number' ? Math.max(0, Math.min(10, generatedData.rarity)) : 1;

    // New: Validate and set 'level'
    generatedData.level = typeof generatedData.level === 'number' && generatedData.level > 0 ? Math.min(generatedData.level, playerLevel + 5) : playerLevel; // Cap level slightly above player level if AI provides it, else default to playerLevel

    // New: Validate and set 'scalingFactor'
    // Formula: 0.05 for rarity 0, up to 0.5 for rarity 10
    const baseScaling = 0.05;
    const maxAdditionalScaling = 0.45;
    const calculatedScalingFactor = baseScaling + (generatedData.rarity / 10) * maxAdditionalScaling;

    if (typeof generatedData.scalingFactor !== 'number' || generatedData.scalingFactor < 0.01 || generatedData.scalingFactor > 1.0) {
      generatedData.scalingFactor = parseFloat(calculatedScalingFactor.toFixed(3));
    } else {
      generatedData.scalingFactor = parseFloat(generatedData.scalingFactor.toFixed(3)); // Ensure consistent precision
    }

    // Existing tags validation
    if (generatedData.tags && Array.isArray(generatedData.tags)) {
        generatedData.tags = generatedData.tags.filter((tag: any) => typeof tag === 'string' && ALL_TAG_NAMES.includes(tag as TagName)).slice(0, 3);
        // New: If scalingFactor is meaningful and 'Scaling' tag is not present, add it.
        if (generatedData.scalingFactor > baseScaling + 0.01 && !generatedData.tags.includes('Scaling')) {
            if (generatedData.tags.length < 3) {
                generatedData.tags.push('Scaling');
            }
        }
    } else {
        generatedData.tags = [];
        if (generatedData.scalingFactor > baseScaling + 0.01) {
             generatedData.tags.push('Scaling');
        }
    }
    // If there are no tags and it's not a scaling trait, add a default tag like 'Passive' or 'Utility' if possible
    if (generatedData.tags.length === 0 && ALL_TAG_NAMES.includes('Passive')) {
        generatedData.tags.push('Passive');
    }

    return generatedData;
  } catch (error) {
    console.error("Error generating trait:", error);
    throw new Error(`Failed to generate trait: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateMainQuestStory(playerLevel: number, existingQuests: Quest[]): Promise<GeneratedQuestData> {
  const lastMainQuest = existingQuests.filter(q => q.isMainQuest).sort((a,b) => b.id.localeCompare(a.id))[0]; 
  const previousQuestContext = lastMainQuest ? `Recently engaged with: '${lastMainQuest.title}'.` : "This is the first main quest.";

  const systemInstruction = `You are an RPG story writer. Player level ${playerLevel}.
Context: ${previousQuestContext}
Generate the next main storyline quest. Respond ONLY with a single, valid JSON object matching this structure:
{
  "title": "Compelling title (string, max 7 words)",
  "description": "Narrative setup (string, 2-4 sentences, max 200 chars)",
  "objectives": ["Actionable step 1 (string)", "Actionable step 2 (string)", "Actionable step 3 (string, optional)"],
  "iconName": "IconName (Choose from: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon', 'FlaskIcon', 'AtomIcon', 'GoldCoinIcon', 'EssenceIcon', 'ChestIcon'].includes(icon)).join(', ')}. Default '${DEFAULT_QUEST_ICON}')"
}
Make the quest a natural progression from the context. Do not include any other text, explanations, or markdown formatting. Just the JSON object.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Player level: ${playerLevel}. ${previousQuestContext}` }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json", 
        temperature: 0.85,
      },
    });

    const generatedData = parseJsonFromGeminiResponse(response.text) as GeneratedQuestData;
    
    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon', 'FlaskIcon', 'AtomIcon', 'GoldCoinIcon', 'EssenceIcon', 'ChestIcon'].includes(generatedData.iconName)) {
      generatedData.iconName = DEFAULT_QUEST_ICON;
    }
    if (!Array.isArray(generatedData.objectives) || generatedData.objectives.some(obj => typeof obj !== 'string')) {
        console.warn("AI generated invalid objectives for quest, providing defaults.");
        generatedData.objectives = ["Review quest details in your log."];
    }
     if (generatedData.objectives.length === 0) {
        generatedData.objectives = ["Investigate the situation."];
    }

    return generatedData;
  } catch (error) {
    console.error("Error generating main quest:", error);
    throw new Error(`Failed to generate main quest: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function generateConsumable(prompt: string, playerLevel: number): Promise<GeneratedConsumableData> { 
  const systemInstruction = `You are an RPG item designer. Create a JSON object for a Consumable item. Player Level: ${playerLevel}.
Fields:
- name: Creative consumable name (string, max 3 words).
- description: Flavorful description (string, 1-2 sentences, max 100 chars).
- iconName: Choose from: ${AVAILABLE_ITEM_ICONS.join(', ')}. Pick appropriate.
- effectType: Choose from: ${CONSUMABLE_EFFECT_TYPES.join(', ')}.
- magnitude: Integer. For _RESTORE (10-50 + Lvl*2). For APPLY_BUFF (1-5 for stats, 5-10 for regen). Omit if CURE_STATUS.
- duration: Integer (2-4 turns). Only for APPLY_BUFF.
- statusToCure: Optional. If CURE_STATUS, one from ${AVAILABLE_STATUS_EFFECTS.filter(se => ['Poison', 'Burn', 'Stun', 'Freeze', 'WeakenBody', 'WeakenMind', 'WeakenReflex', 'PoisonDoTActive', 'BurningDoTActive', 'Silenced', 'Rooted'].includes(se)).join(', ')}.
- buffToApply: Optional. If APPLY_BUFF, one from ${AVAILABLE_STATUS_EFFECTS.filter(se => se.startsWith('TEMP_')).join(', ')}.
- resourceCost: Optional array of 1-2 { "itemId": "string_id_from_master_list", "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}", "quantity": integer (1-3) }.
- rarity: (integer, 0-10) Rarity of the consumable.
- tags: (optional array of strings, max 3) Functional tags, from ${ALL_TAG_NAMES.join(', ')}.
Ensure valid JSON. Balance consumables. Return ONLY the valid JSON object.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Consumable idea: ${prompt}` }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.75,
      },
    });
    
    const data = parseJsonFromGeminiResponse(response.text) as GeneratedConsumableData;

    if (!AVAILABLE_ITEM_ICONS.includes(data.iconName)) data.iconName = 'PotionGeneric'; 
    if (!CONSUMABLE_EFFECT_TYPES.includes(data.effectType)) data.effectType = 'HP_RESTORE';
    
    if (data.magnitude !== undefined) {
      data.magnitude = typeof data.magnitude === 'number' ? Math.max(1, Math.min(50 + playerLevel * 5, data.magnitude)) : (data.effectType.includes('RESTORE') ? 10 + playerLevel * 2 : 5);
    }
    if (data.duration !== undefined) {
      data.duration = typeof data.duration === 'number' ? Math.max(1, Math.min(4, data.duration)) : (data.effectType === 'APPLY_BUFF' ? 3 : undefined);
    } else if (data.effectType === 'APPLY_BUFF') {
        data.duration = 3;
    }

    if (data.effectType === 'CURE_STATUS' && data.statusToCure && !AVAILABLE_STATUS_EFFECTS.includes(data.statusToCure)) delete data.statusToCure;
    if (data.effectType === 'APPLY_BUFF' && data.buffToApply && !AVAILABLE_STATUS_EFFECTS.includes(data.buffToApply)) delete data.buffToApply;
    if (data.effectType === 'APPLY_BUFF' && !data.buffToApply) data.buffToApply = 'TEMP_BODY_UP';
    
    if(data.effectType !== 'APPLY_BUFF') delete data.duration;
    if(data.effectType !== 'CURE_STATUS') delete data.statusToCure;
    if(data.effectType !== 'APPLY_BUFF') delete data.buffToApply;
    if(data.effectType === 'CURE_STATUS' && data.magnitude === undefined) delete data.magnitude; 

    data.resourceCost = validateResourceCosts(data.resourceCost);
    data.rarity = typeof data.rarity === 'number' ? Math.max(0, Math.min(10, data.rarity)) : 1;
    if (data.tags && Array.isArray(data.tags)) {
        data.tags = data.tags.filter((tag: any) => typeof tag === 'string' && ALL_TAG_NAMES.includes(tag as TagName)).slice(0, 3);
    } else {
        data.tags = [];
    }
    return data;

  } catch (error) {
    console.error("Error generating consumable:", error);
    throw new Error(`Failed to generate consumable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateEquipment(prompt: string, playerLevel: number): Promise<GeneratedEquipmentData> {
  const systemInstruction = `You are an RPG item designer. Create JSON for Equipment. Player Level: ${playerLevel}.
Fields:
- name: Creative name (string, max 3 words).
- description: Flavorful description (string, 1-2 sentences, max 100 chars).
- iconName: From: ${AVAILABLE_ITEM_ICONS.join(', ')}. Pick 'SwordHilt', 'Breastplate', or 'Amulet' based on slot.
- slot: 'Weapon', 'Armor', or 'Accessory'.
- statsBoost: JSON object. Keys: 'body', 'mind', 'reflex', 'speed', 'maxHp', 'maxMp', 'maxEp'. Values are positive integers.
  - Weapon: Prioritize 'body' or 'mind' (e.g., 1-5 + Lvl/2). Minor other stats.
  - Armor: Prioritize 'body', 'maxHp' (e.g., 1-5 for body, 5-15 for HP + Lvl).
  - Accessory: Diverse, moderate boosts (e.g., 1-3 for core stats, 1-3 for speed, 5-10 for HP/MP/EP).
- resourceCost: Optional array of 1-3 { "itemId": "string_id_from_master_list", "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}", "quantity": integer (1-5) }.
- rarity: (integer, 0-10) Rarity of the equipment, affecting power.
- tags: (optional array of strings, max 3) Functional tags, from ${ALL_TAG_NAMES.join(', ')}. E.g., ['FireResistance', 'StatBoostMind', 'OnHitEffect', 'Scaling'].
- scalesWith: (Optional 'Body' | 'Mind') If the item has a 'Scaling' tag, specify which stat its main effect scales with.
Ensure valid JSON. Balance for player level. If 'Scaling' tag, rarity determines scalingFactor. Return ONLY the valid JSON object.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Equipment idea: ${prompt}` }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.75,
      },
    });
    
    const data = parseJsonFromGeminiResponse(response.text) as GeneratedEquipmentData;

    if (!AVAILABLE_ITEM_ICONS.includes(data.iconName)) {
        if (data.slot === 'Weapon') data.iconName = 'SwordHilt';
        else if (data.slot === 'Armor') data.iconName = 'Breastplate';
        else data.iconName = 'Amulet';
    }
    if (!AVAILABLE_EQUIPMENT_SLOTS.includes(data.slot)) data.slot = 'Accessory';

    if (data.statsBoost && typeof data.statsBoost === 'object') {
      const validStats: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>> = {};
      const maxCoreStatVal = 5 + Math.floor(playerLevel / 2) + (data.rarity || 0); 
      const maxResourceStatVal = 15 + playerLevel + ((data.rarity || 0) * 2);
      const maxSpeedVal = 3 + Math.floor(playerLevel / 3) + Math.floor((data.rarity || 0) / 2);

      for (const key in data.statsBoost) {
        const statKey = key as keyof PlayerEffectiveStats; 
        const val = (data.statsBoost as any)[statKey];
        if (typeof val === 'number' && val > 0) {
          if (['body', 'mind', 'reflex'].includes(statKey)) {
            validStats[statKey as 'body'|'mind'|'reflex'] = Math.min(val, maxCoreStatVal);
          } else if (['maxHp', 'maxMp', 'maxEp'].includes(statKey)) {
            validStats[statKey as 'maxHp'|'maxMp'|'maxEp'] = Math.min(val, maxResourceStatVal);
          } else if (statKey === 'speed') {
            validStats.speed = Math.min(val, maxSpeedVal);
          }
        }
      }
      data.statsBoost = validStats;
    } else {
      data.statsBoost = {}; 
    }
    
    data.resourceCost = validateResourceCosts(data.resourceCost);
    data.rarity = typeof data.rarity === 'number' ? Math.max(0, Math.min(10, data.rarity)) : 1;
    data.scalingFactor = getScalingFactorFromRarity(data.rarity); // Assign scaling factor

    if (data.tags && Array.isArray(data.tags)) {
        data.tags = data.tags.filter((tag: any) => typeof tag === 'string' && ALL_TAG_NAMES.includes(tag as TagName)).slice(0, 3);
        if (data.tags.includes('Scaling') && !data.scalesWith) {
            // If 'Scaling' tag is present but scalesWith is not, try to infer or default
            if (data.slot === 'Weapon' && data.statsBoost?.body && (data.statsBoost.body > (data.statsBoost.mind || 0))) data.scalesWith = 'Body';
            else data.scalesWith = 'Mind';
        }
    } else {
        data.tags = [];
    }
    if (data.scalesWith && data.scalingFactor > 0 && !data.tags.includes('Scaling')) data.tags.push('Scaling');
    
    return data;

  } catch (error) {
    console.error("Error generating equipment:", error);
    throw new Error(`Failed to generate equipment: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateSpellComponentFromResearch(
  promptText: string,
  goldInvested: number,
  essenceInvested: number,
  playerLevel: number,
  existingComponentCount: number 
): Promise<GeneratedSpellComponentData> {
  const systemInstruction = `You are an RPG Spell Component designer. Create a new, unique spell component.
Player's idea: "${promptText}", Gold: ${goldInvested}, Essence: ${essenceInvested}, Player Level: ${playerLevel}, Components Known: ${existingComponentCount}.
Higher investment/level = rarer/more complex. Return ONLY a single, valid JSON object:
- name: (string, max 4 words) Creative name.
- description: (string, 1-2 sentences, max 150 chars) Flavorful description.
- iconName: (SpellIconName from ${AVAILABLE_SPELL_ICONS.join(', ')}). Default 'AtomIcon'.
- category: (SpellComponentCategory from ${['ElementalCore', 'PrimaryEffect', 'SecondaryModifier', 'DeliveryMethod', 'CostEfficiency', 'Utility', 'VisualAspect', 'EssenceInfusion'].join(', ')}).
- tier: (integer, 1-5) Influences power. Higher investment = higher tier.
- baseEffects: (array of 1-3 SpellComponentEffect objects) Core mechanical effects.
  - type: e.g., 'ADD_BASE_DAMAGE', 'SET_ELEMENT', 'APPLY_STATUS_EFFECT', 'ADD_TAG'.
  - elementName: (ElementName from ${ALL_ELEMENTS.join(', ')}, if SET_ELEMENT).
  - value: (number or string).
  - statusEffect: (object { name: StatusEffectName, chance: number, duration: number, magnitude?: number }, if APPLY_STATUS_EFFECT).
  - tagName: (TagName from ${ALL_TAG_NAMES.join(', ')}, if ADD_TAG).
- configurableParameters: (optional array of 0-1 SpellComponentParameterConfig objects { key, label, type 'slider', min, max, step, defaultValue, costInfluenceFactor }).
- rarity: (integer, 0-10) Higher investment = higher chance of rare.
- element: (optional ElementName from ${ALL_ELEMENTS.join(', ')}).
- tags: (optional array of 1-3 TagName from ${ALL_TAG_NAMES.join(', ')}).
- manaCost: (optional integer, 0-10) Inherent mana cost.
- energyCost: (optional integer, 0-10) Inherent EP cost.
- usageGoldCost: (optional integer, 0-50) Gold cost to USE this component in a spell design.
- usageEssenceCost: (optional integer, 0-20) Essence cost to USE this component.
- baseResourceCost: (optional array of 0-2 ResourceCost objects { "itemId": "string_id_from_master_list", "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}", "quantity": 1-3 }).
- researchRequirements: (object) Suggested { gold: (5-200), essence?: (0-50), requiredLevel?: (1-10), items?: (array of { itemId: string, type: ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}, quantity: number }) }.
Prioritize thematic consistency. Balance power, costs, requirements based on rarity/tier.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Research Idea: "${promptText}". Investment: Gold ${goldInvested}, Essence ${essenceInvested}. Player Level: ${playerLevel}. Components Known: ${existingComponentCount}.` }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        temperature: 0.85, 
      },
    });

    const rawData = parseJsonFromGeminiResponse(response.text) as GeneratedSpellComponentData;
    
    if (!rawData.name || typeof rawData.name !== 'string') rawData.name = "Mysterious Fragment";
    if (!rawData.description || typeof rawData.description !== 'string') rawData.description = "An enigmatic discovery.";
    if (!AVAILABLE_SPELL_ICONS.includes(rawData.iconName)) rawData.iconName = 'AtomIcon';
    const validCategories: SpellComponent['category'][] = ['ElementalCore', 'PrimaryEffect', 'SecondaryModifier', 'DeliveryMethod', 'CostEfficiency', 'Utility', 'VisualAspect', 'EssenceInfusion'];
    if (!validCategories.includes(rawData.category)) rawData.category = 'Utility';
    rawData.tier = typeof rawData.tier === 'number' ? Math.max(1, Math.min(5, rawData.tier)) as 1|2|3|4|5 : 1;
    
    rawData.rarity = typeof rawData.rarity === 'number' ? Math.max(0, Math.min(10, rawData.rarity)) : Math.floor((goldInvested + essenceInvested * 2) / 20); 
    rawData.rarity = Math.min(10, Math.max(0, rawData.rarity));

    if (rawData.element && !ALL_ELEMENTS.includes(rawData.element)) delete rawData.element;
    if (rawData.tags && Array.isArray(rawData.tags)) {
        rawData.tags = rawData.tags.filter((tag: any) => typeof tag === 'string' && ALL_TAG_NAMES.includes(tag as TagName)).slice(0, 3);
    } else {
        rawData.tags = [];
    }
    rawData.manaCost = typeof rawData.manaCost === 'number' ? Math.max(0, Math.min(15, rawData.manaCost)) : undefined;
    rawData.energyCost = typeof rawData.energyCost === 'number' ? Math.max(0, Math.min(15, rawData.energyCost)) : undefined;
    rawData.usageGoldCost = typeof rawData.usageGoldCost === 'number' ? Math.max(0, Math.min(50, rawData.usageGoldCost)) : undefined;
    rawData.usageEssenceCost = typeof rawData.usageEssenceCost === 'number' ? Math.max(0, Math.min(20, rawData.usageEssenceCost)) : undefined;
    
    // Validate baseResourceCost using the stricter validateResourceCosts
    rawData.baseResourceCost = validateResourceCosts(rawData.baseResourceCost, 2, 3);

    if (!rawData.baseEffects || !Array.isArray(rawData.baseEffects) || rawData.baseEffects.length === 0) {
        rawData.baseEffects = [{ type: 'ADD_TAG', tagName: 'Utility' as TagName }]; 
    } else {
        rawData.baseEffects = rawData.baseEffects.slice(0,3).filter(eff => eff.type); 
    }
    
    if (rawData.researchRequirements) {
        rawData.researchRequirements.gold = typeof rawData.researchRequirements.gold === 'number' ? Math.max(5, Math.min(500, rawData.researchRequirements.gold)) : (5 + rawData.rarity * 10);
        rawData.researchRequirements.essence = typeof rawData.researchRequirements.essence === 'number' ? Math.max(0, Math.min(100, rawData.researchRequirements.essence)) : (rawData.rarity * 5);
        rawData.researchRequirements.requiredLevel = typeof rawData.researchRequirements.requiredLevel === 'number' ? Math.max(1, Math.min(playerLevel + 5, rawData.researchRequirements.requiredLevel)) : (1 + Math.floor(rawData.rarity / 2));
        
        // Validate researchRequirements.items
        if (rawData.researchRequirements.items && Array.isArray(rawData.researchRequirements.items)) {
            rawData.researchRequirements.items = (rawData.researchRequirements.items as any[])
                .map((item: any) => {
                    const mappedItem: Partial<ResourceCost> = {};
                    if (typeof item.itemId === 'string') {
                        mappedItem.itemId = item.itemId;
                    }
                    if (typeof item.quantity === 'number' && item.quantity > 0) {
                        mappedItem.quantity = item.quantity;
                    }
                    // Only assign type if it's a valid ResourceType
                    if (item.type && typeof item.type === 'string' && AVAILABLE_RESOURCE_TYPES_FOR_AI.includes(item.type as ResourceType)) {
                        mappedItem.type = item.type as ResourceType;
                    } else if (item.type) {
                        console.warn(`Invalid resource type '${item.type}' in component researchRequirements.items from AI for item ID '${item.itemId || 'unknown'}'. Omitting type.`);
                    }
                    return mappedItem;
                })
                .filter((item: Partial<ResourceCost>) => item.itemId && item.quantity); // Keep only if essential parts are present

            if (rawData.researchRequirements.items.length === 0) {
                delete rawData.researchRequirements.items;
            }
        }

    } else {
         rawData.researchRequirements = { gold: (5 + rawData.rarity * 10), essence: (rawData.rarity * 5), requiredLevel: (1 + Math.floor(rawData.rarity / 2))};
    }

    return rawData;

  } catch (error) {
    console.error("Error generating spell component:", error);
    throw new Error(`Failed to generate spell component: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateLootFromChest(chestLevel: number, chestRarity: number, playerLevel: number): Promise<LootDrop[]> {
    const numberOfDrops = 1 + Math.floor(chestRarity / 3) + (Math.random() < (chestLevel / 1000) ? 1 : 0); // 1-3 drops, more for higher rarity/level
    
    const systemInstruction = `You are an RPG Loot Master. Generate loot for a chest.
Chest Level: ${chestLevel}, Chest Rarity: ${chestRarity}, Player Level: ${playerLevel}.
Return an array of ${numberOfDrops} JSON objects, each representing a single loot drop.
Each object must have a 'type' field chosen from: 'gold', 'essence', 'resource', 'consumable', 'equipment', 'spell', 'component'.
- For 'gold': { "type": "gold", "amount": integer (e.g., 10-500 based on chest level/rarity) }
- For 'essence': { "type": "essence", "amount": integer (e.g., 1-50 based on chest level/rarity) }
- For 'resource': { "type": "resource", "itemId": "string_id_from_master_resource_list", "quantity": integer (1-5), "type": "ResourceType from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}"}.
- For 'consumable': { "type": "consumable", "promptHint": "brief idea for AI generation e.g., 'Strong healing potion'", "rarityHint": integer (0-10 based on chest rarity) } OR { "type": "consumable", "itemId": "string_id_from_master_consumable_list", "quantity": 1 } (for predefined ones).
- For 'equipment': { "type": "equipment", "promptHint": "brief idea for AI generation e.g., 'Fire sword'", "rarityHint": integer (0-10 based on chest rarity) }
- For 'spell': { "type": "spell", "promptHint": "brief idea for AI generation e.g., 'Defensive earth shield spell'", "rarityHint": integer (0-10 based on chest rarity) }
- For 'component': { "type": "component", "componentData": { /* Full GeneratedSpellComponentData structure here, but keep it concise. Ensure 'researchRequirements.items' if present, contains objects with 'itemId', 'type' (from ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}), and 'quantity'. */ } }
If generating componentData, it should be a fully formed JSON object for a spell component (name, description, iconName, category, tier, baseEffects, rarity, etc.).
Focus on thematic loot. Higher level/rarity chests yield better/rarer items.
Return ONLY the array of JSON objects.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: [{ role: "user", parts: [{ text: `Generate ${numberOfDrops} loot items.` }] }],
            config: {
                systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
                responseMimeType: "application/json",
                temperature: 0.9,
            },
        });
        const lootDrops = parseJsonFromGeminiResponse(response.text) as LootDrop[];
        
        // Basic validation of loot drops
        return lootDrops.map(drop => {
            if (drop.type === 'component' && drop.componentData?.researchRequirements?.items) {
                drop.componentData.researchRequirements.items = (drop.componentData.researchRequirements.items as any[])
                    .map((item: any) => {
                        const mappedItem: Partial<ResourceCost> = {};
                        if (typeof item.itemId === 'string') mappedItem.itemId = item.itemId;
                        if (typeof item.quantity === 'number' && item.quantity > 0) mappedItem.quantity = item.quantity;
                        if (item.type && typeof item.type === 'string' && AVAILABLE_RESOURCE_TYPES_FOR_AI.includes(item.type as ResourceType)) {
                            mappedItem.type = item.type as ResourceType;
                        } else if (item.type) {
                             console.warn(`Invalid resource type '${item.type}' in loot drop component researchRequirements.items. Omitting type.`);
                        }
                        return mappedItem;
                    })
                    .filter((item: Partial<ResourceCost>) => item.itemId && item.quantity) as Partial<ResourceCost>[];
                if (drop.componentData.researchRequirements.items.length === 0) {
                    delete drop.componentData.researchRequirements.items;
                }
            }
            return drop;
        }).filter(drop => {
            if (!drop.type) return false;
            if (drop.type === 'gold' || drop.type === 'essence') return typeof drop.amount === 'number';
            if (drop.type === 'resource') return typeof drop.itemId === 'string' && typeof drop.quantity === 'number' && typeof drop.type === 'string' && AVAILABLE_RESOURCE_TYPES_FOR_AI.includes(drop.type as ResourceType);
            if (drop.type === 'consumable' || drop.type === 'equipment' || drop.type === 'spell') {
                return typeof drop.promptHint === 'string' && typeof drop.rarityHint === 'number' || typeof drop.itemId === 'string';
            }
            if (drop.type === 'component') return typeof drop.componentData === 'object';
            return false;
        }).slice(0, numberOfDrops);

    } catch (error) {
        console.error("Error generating loot from chest:", error);
        const fallbackAmount = Math.floor(chestLevel / 10) + chestRarity * 5;
        return [{ type: 'gold', amount: fallbackAmount > 0 ? fallbackAmount : 10 }];
    }
}

export async function discoverRecipeFromPrompt(prompt: string, playerLevel: number): Promise<any> {
  const systemInstruction = `You are a recipe discovery assistant for a fantasy RPG crafting system. 
  Based on the player's prompt, suggest a crafting recipe that would make sense.
  
  Return a JSON object with:
  - name: Recipe name (string)
  - description: Recipe description (string)
  - category: One of 'consumable', 'equipment', 'component', 'misc'
  - resultItemId: Generated item ID (string)
  - resultQuantity: Number of items produced (1-5)
  - ingredients: Array of { itemId: string, quantity: number, type: ResourceType }
  - requirements: Array of { type: 'level' | 'skill' | 'location' | 'tool', value: string | number }
  - craftingTime: Time in hours (1-24)
  - discoveryPrompt: The original prompt (string)
  
  Available resource types: ${AVAILABLE_RESOURCE_TYPES_FOR_AI.join(', ')}
  Player level: ${playerLevel}
  
  Make the recipe balanced and appropriate for the player's level.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });
    
    const rawData = parseJsonFromGeminiResponse(response.text);
    return rawData;

  } catch (error) {
    console.error("Error discovering recipe:", error);
    throw new Error(`Failed to discover recipe: ${error instanceof Error ? error.message : String(error)}`);
  }
}
