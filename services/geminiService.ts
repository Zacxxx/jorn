import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, AVAILABLE_SPELL_ICONS, DEFAULT_TRAIT_ICON, DEFAULT_QUEST_ICON, AVAILABLE_STATUS_EFFECTS, STATUS_EFFECT_ICONS, AVAILABLE_RESOURCES, AVAILABLE_ITEM_ICONS, CONSUMABLE_EFFECT_TYPES, AVAILABLE_EQUIPMENT_SLOTS } from '../constants'; // UPDATED POTION_EFFECT_TYPES
import { GeneratedSpellData, GeneratedEnemyData, SpellIconName, GeneratedTraitData, GeneratedQuestData, Quest, Spell, SpellStatusEffect, StatusEffectName, ResourceCost, ResourceType, GeneratedConsumableData, ConsumableEffectType, GeneratedEquipmentData, EquipmentSlot, Player, PlayerEffectiveStats } from '../types'; // UPDATED Potion types

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

function validateResourceCosts(costs: any[] | undefined): ResourceCost[] | undefined {
    if (costs && Array.isArray(costs)) {
        const validatedCosts = costs.filter((cost: any) => 
            AVAILABLE_RESOURCES.includes(cost.type as ResourceType) &&
            typeof cost.quantity === 'number' && cost.quantity > 0 && cost.quantity <= 5
        ).slice(0, 3); 
        return validatedCosts.length > 0 ? validatedCosts : undefined;
    }
    return undefined;
}


function validateGeneratedSpellData(data: any): GeneratedSpellData {
  if (!AVAILABLE_SPELL_ICONS.includes(data.iconName)) {
      data.iconName = 'Default'; 
  }
  data.damage = typeof data.damage === 'number' ? Math.max(0, Math.min(50, data.damage)) : 5; // Base damage lower, scaling from stats
  data.manaCost = typeof data.manaCost === 'number' ? Math.max(5, Math.min(30, data.manaCost)) : 5;
  if (data.scalesWith && !['Body', 'Mind'].includes(data.scalesWith)) {
    data.scalesWith = data.damageType === 'Physical' ? 'Body' : 'Mind'; // Default scaling
  } else if (!data.scalesWith && data.damageType !== 'Healing' && data.damageType !== 'None' && data.damage > 0) {
    data.scalesWith = data.damageType === 'Physical' ? 'Body' : 'Mind';
  }


  if (data.statusEffectInflict) {
    const sei = data.statusEffectInflict as SpellStatusEffect;
    if (!AVAILABLE_STATUS_EFFECTS.includes(sei.name)) {
      delete data.statusEffectInflict;
    } else {
      sei.duration = typeof sei.duration === 'number' ? Math.max(1, Math.min(3, sei.duration)) : 2; // Shorter duration
      sei.chance = typeof sei.chance === 'number' ? Math.max(10, Math.min(80, sei.chance)) : 50;
      if (sei.magnitude !== undefined && typeof sei.magnitude !== 'number') {
         sei.magnitude = (['Poison', 'Burn', 'Regeneration'].includes(sei.name) || sei.name.startsWith('TEMP_') || sei.name.startsWith('Weaken') || sei.name.startsWith('Strengthen')) ? 3 : undefined; // Lower base magnitude
      } else if (sei.magnitude !== undefined) {
        sei.magnitude = Math.max(1, Math.min(15, sei.magnitude));
      }
      const magnitudeRelevantEffects: StatusEffectName[] = ['Poison', 'Burn', 'Regeneration', 'WeakenBody', 'WeakenMind', 'WeakenReflex', 'StrengthenBody', 'StrengthenMind', 'StrengthenReflex', 'TEMP_BODY_UP', 'TEMP_MIND_UP', 'TEMP_REFLEX_UP', 'TEMP_SPEED_UP', 'TEMP_MAX_HP_UP', 'TEMP_MAX_MP_UP', 'TEMP_HP_REGEN'];
      if (!magnitudeRelevantEffects.includes(sei.name) && sei.magnitude !== undefined) {
        delete sei.magnitude;
      }
    }
  }
  data.resourceCost = validateResourceCosts(data.resourceCost);
  return data as GeneratedSpellData;
}


export async function generateSpell(prompt: string): Promise<GeneratedSpellData> {
  const systemInstruction = `You are a spell design assistant for a fantasy RPG. Create a JSON object for a spell.
Fields:
- name: Cool, concise spell name (string, max 3 words).
- description: Flavorful description (string, 1-2 sentences, max 100 chars).
- manaCost: Integer (5-30).
- damage: Integer (0-50). This is base damage/healing. It will be boosted by player stats.
- damageType: 'Fire', 'Ice', 'Lightning', 'Physical', 'Healing', 'Dark', 'Light', 'Arcane', 'Poison', 'None'.
- scalesWith: Optional 'Body' (for Physical/some direct damage) or 'Mind' (for elemental/arcane/healing). If damage > 0 and not Healing/None, this should be set. Default 'Mind' for most magic, 'Body' for Physical.
- effect: Optional string for secondary flavor text (max 70 chars).
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.join(', ')}. Default to 'Default' if unsure.
- statusEffectInflict: Optional object.
  - name: Choose from: ${AVAILABLE_STATUS_EFFECTS.join(', ')}.
  - duration: Integer (1-3 turns).
  - magnitude: Integer (1-10). Only for effects that have magnitude (e.g., Poison, Regen, stat buffs/debuffs like TEMP_BODY_UP). Omit for Stun/Freeze.
  - chance: Integer (20-80 percent).
- resourceCost: Optional array of objects for crafting. Max 2 types. { "type": "ResourceType", "quantity": integer (1-3) }.
  - ResourceType: ${AVAILABLE_RESOURCES.join(', ')}.
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
    console.error("Error generating spell:", error);
    throw new Error(`Failed to generate spell: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function editSpell(originalSpell: Spell, refinementPrompt: string): Promise<GeneratedSpellData> {
  const systemInstruction = `You are a spell refinement assistant. Modify an existing spell.
Original spell: ${JSON.stringify(originalSpell, null, 2)}
User's request: "${refinementPrompt}"
Generate a new JSON object. Fields are same as generateSpell.
Adjust manaCost (5-40) and damage (0-60) based on changes.
Resource costs might also change (1-3 quantity, max 2 types).
Ensure valid JSON.`;

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
    
    validatedData.damage = Math.max(0, Math.min(60, validatedData.damage || originalSpell.damage));
    validatedData.manaCost = Math.max(5, Math.min(40, validatedData.manaCost || originalSpell.manaCost));

    return validatedData;
  } catch (error) {
    console.error("Error editing spell:", error);
    throw new Error(`Failed to edit spell: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function generateEnemy(playerLevel: number): Promise<GeneratedEnemyData> {
  const difficulty = playerLevel < 3 ? 'easy' : playerLevel < 7 ? 'medium' : 'hard';
  // Adjusted stat ranges for Body, Mind, Reflex
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


  const systemInstruction = `You are an RPG encounter designer. Generate a unique fantasy RPG enemy.
Return a JSON object with the following fields:
- name: Creative enemy name (string, max 4 words).
- description: Short evocative description (string, 1-2 sentences, max 120 chars).
- hp: Integer health. Based on difficulty '${difficulty}': easy (${hpRange.easy.min}-${hpRange.easy.max}), medium (${hpRange.medium.min}-${hpRange.medium.max}), hard (${hpRange.hard.min}-${hpRange.hard.max}).
- level: Integer, around playerLevel (e.g. playerLevel=${playerLevel}, enemy level could be ${playerLevel-1} to ${playerLevel+1}). Min level 1.
- baseBody: Integer core physical stat. Based on difficulty '${difficulty}': easy (${statRange.easy.min}-${statRange.easy.max}), medium (${statRange.medium.min}-${statRange.medium.max}), hard (${statRange.hard.min}-${statRange.hard.max}).
- baseMind: Integer core mental/magical stat. Similar range to baseBody.
- baseReflex: Integer core agility/reaction stat. Similar range to baseBody.
- baseSpeed: Optional integer for speed. If omitted, it will be derived. Typical range 5-15.
- specialAbilityName: (Optional string) Name for a special ability. Max 3 words.
- specialAbilityDescription: (Optional string) Description of special ability. Max 70 chars.
- weakness: (Optional string) A damage type: 'Fire', 'Ice', 'Lightning', 'Physical', 'Arcane', 'Poison', 'Dark', 'Light'.
- resistance: (Optional string) A damage type it is resistant to.
- iconName: Choose one icon name from this list: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon', 'BodyIcon', 'ReflexIcon', 'SpeedIcon'].includes(icon)).join(', ')}. Select one that best represents the enemy. Default 'SkullIcon'.

Ensure stats are appropriate for '${difficulty}' difficulty. Return valid JSON.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: `Generate a ${difficulty} enemy for a level ${playerLevel} player.`}] }],
      config: {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }]},
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const generatedData = parseJsonFromGeminiResponse(response.text) as GeneratedEnemyData;

    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon', 'BodyIcon', 'ReflexIcon', 'SpeedIcon'].includes(generatedData.iconName)) {
        generatedData.iconName = 'SkullIcon';
    }
    if (generatedData.iconName === 'Default') {
        generatedData.iconName = 'SkullIcon';
    }
    generatedData.hp = typeof generatedData.hp === 'number' ? Math.max(hpRange[difficulty].min, Math.min(hpRange[difficulty].max, generatedData.hp)) : hpRange[difficulty].min;
    generatedData.baseBody = typeof generatedData.baseBody === 'number' ? Math.max(statRange[difficulty].min, Math.min(statRange[difficulty].max, generatedData.baseBody)) : statRange[difficulty].min;
    generatedData.baseMind = typeof generatedData.baseMind === 'number' ? Math.max(statRange[difficulty].min, Math.min(statRange[difficulty].max, generatedData.baseMind)) : statRange[difficulty].min;
    generatedData.baseReflex = typeof generatedData.baseReflex === 'number' ? Math.max(statRange[difficulty].min, Math.min(statRange[difficulty].max, generatedData.baseReflex)) : statRange[difficulty].min;
    
    if (generatedData.baseSpeed !== undefined) {
      generatedData.baseSpeed = typeof generatedData.baseSpeed === 'number' ? Math.max(5, Math.min(15, generatedData.baseSpeed)) : (5 + Math.floor(generatedData.baseReflex / 2));
    }


    generatedData.level = typeof generatedData.level === 'number' ? Math.max(1, Math.min(playerLevel + 2, generatedData.level)) : Math.max(1, playerLevel);

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
- description: Brief flavorful description (string, 1-2 sentences, max 120 chars). This describes a PASSIVE benefit.
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon'].includes(icon)).join(', ')}. Pick appropriate (e.g., 'Star', 'Shield', 'BodyIcon', 'MindIcon', 'ReflexIcon'). Default '${DEFAULT_TRAIT_ICON}'.
Keep traits passive, not overly game-breaking. Return valid JSON.`;

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

    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon'].includes(generatedData.iconName)) {
      generatedData.iconName = DEFAULT_TRAIT_ICON;
    }
    return generatedData;
  } catch (error) {
    console.error("Error generating trait:", error);
    throw new Error(`Failed to generate trait: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateMainQuestStory(playerLevel: number, existingQuests: Quest[]): Promise<GeneratedQuestData> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please configure the API key in your environment.");
  }

  const lastMainQuest = existingQuests.filter(q => q.isMainQuest).sort((a,b) => b.id.localeCompare(a.id))[0]; 
  const previousQuestContext = lastMainQuest ? `Recently engaged with: '${lastMainQuest.title}'.` : "This is the first main quest.";

  const systemInstruction = `You are an RPG story writer. Player level ${playerLevel}.
Context: ${previousQuestContext}
Generate the next main storyline quest. JSON object with:
- title: Compelling title (string, max 7 words).
- description: Narrative setup (string, 2-4 sentences, max 200 chars).
- objectives: Array of 2-3 strings, actionable steps.
- iconName: Choose from: ${AVAILABLE_SPELL_ICONS.filter(icon => !icon.startsWith('Status') && !['Gem', 'Plant', 'Dust', 'Thread', 'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 'HeroBackIcon'].includes(icon)).join(', ')}. Default '${DEFAULT_QUEST_ICON}'.
Make quest a natural progression. Return valid JSON.`;

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

    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    const generatedData = parseJsonFromGeminiResponse(response.text) as GeneratedQuestData;
    
    // Validate required fields
    if (!generatedData.title || !generatedData.description || !Array.isArray(generatedData.objectives)) {
      throw new Error("Invalid quest data structure received from API");
    }

    if (!AVAILABLE_SPELL_ICONS.includes(generatedData.iconName) || ['HeroBackIcon'].includes(generatedData.iconName)) {
      generatedData.iconName = DEFAULT_QUEST_ICON;
    }
    if (!Array.isArray(generatedData.objectives)) {
        generatedData.objectives = ["Review quest details."];
    }

    return generatedData;
  } catch (error) {
    console.error("Error generating main quest:", error);
    // Add more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      playerLevel,
      hasPreviousQuest: !!lastMainQuest,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
    console.error("Quest generation error details:", errorDetails);
    throw new Error(`Failed to generate main quest: ${errorMessage}`);
  }
}


export async function generateConsumable(prompt: string, playerLevel: number): Promise<GeneratedConsumableData> { // RENAMED
  const systemInstruction = `You are an RPG item designer. Create a JSON object for a Consumable item.
Consumables can be potions, elixirs, food items granting temporary buffs, utility scrolls, or other single-use magic items. Player Level: ${playerLevel}.
Fields:
- name: Creative consumable name (string, max 3 words).
- description: Flavorful description (string, 1-2 sentences, max 100 chars).
- iconName: Choose from: ${AVAILABLE_ITEM_ICONS.join(', ')}. Pick appropriate (e.g. 'PotionHP', 'Scroll', 'Star', 'PotionGeneric').
- effectType: Choose from: ${CONSUMABLE_EFFECT_TYPES.join(', ')}.
- magnitude: Integer. For _RESTORE (10-50 + Lvl*2). For APPLY_BUFF (1-5 for stats like TEMP_BODY_UP, 5-10 for regen). Omit if CURE_STATUS.
- duration: Integer (2-4 turns). Only for APPLY_BUFF.
- statusToCure: Optional. If CURE_STATUS, one from ${AVAILABLE_STATUS_EFFECTS.filter(se => ['Poison', 'Burn', 'Stun', 'Freeze', 'WeakenBody', 'WeakenMind', 'WeakenReflex'].includes(se)).join(', ')}.
- buffToApply: Optional. If APPLY_BUFF, one from ${AVAILABLE_STATUS_EFFECTS.filter(se => se.startsWith('TEMP_')).join(', ')}.
- resourceCost: Optional array of 1-2 objects: { "type": "ResourceType", "quantity": integer (1-3) }. Resources: ${AVAILABLE_RESOURCES.join(', ')}.
Ensure valid JSON. Balance consumables.`;

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

    if (!AVAILABLE_ITEM_ICONS.includes(data.iconName)) data.iconName = 'PotionGeneric'; // Default to generic if not suitable
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
    if(data.effectType === 'CURE_STATUS' && data.magnitude === undefined) delete data.magnitude; // Should be magnitude relevant to HP/MP/EP if curing by restoring

    data.resourceCost = validateResourceCosts(data.resourceCost);
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
- resourceCost: Optional array of 1-3 objects: { "type": "ResourceType", "quantity": integer (1-5) }. Resources: ${AVAILABLE_RESOURCES.join(', ')}.
Ensure valid JSON. Balance for player level.`;

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
      const maxCoreStatVal = 5 + Math.floor(playerLevel / 2);
      const maxResourceStatVal = 15 + playerLevel;
      const maxSpeedVal = 3 + Math.floor(playerLevel / 3);

      for (const key in data.statsBoost) {
        const statKey = key as keyof PlayerEffectiveStats; // Broader type for initial check
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
    return data;

  } catch (error) {
    console.error("Error generating equipment:", error);
    throw new Error(`Failed to generate equipment: ${error instanceof Error ? error.message : String(error)}`);
  }
}