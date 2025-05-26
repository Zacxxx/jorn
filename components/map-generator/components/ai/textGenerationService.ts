
import { GenerateContentResponse } from "@google/genai";
import { 
  AreaInfo, AreaInfoResponse,
  InitialMapInfoResponse, PointsOfInterestResponse, MapType, MAP_TYPES, Place, OptimalMapTypeResponse
} from '../../types';
import { ai, TEXT_MODEL_NAME } from './config';
import { parseJsonFromString } from './jsonParser';

// --- Area Information Generation ---
export interface AreaInfoParams {
  theme: string;
  customLore?: string;
  useCustomLore?: boolean;
}
export interface AreaInfoResult {
  parsedResponse: AreaInfoResponse | null;
  rawResponse: string;
}

export const generateAreaInfo = async ({
  theme,
  customLore,
  useCustomLore,
}: AreaInfoParams): Promise<AreaInfoResult> => {
  let loreConsideration = "";
  if (useCustomLore && customLore && customLore.trim()) {
    loreConsideration = `Base your response on the following existing lore, ensuring all details are consistent with it: "${customLore.substring(0, 1000)}${customLore.length > 1000 ? '...' : ''}".`;
  }

  const areaPrompt = `
    Based on the theme: "${theme}", ${loreConsideration}
    Generate detailed information for a fantasy area. Provide creative and evocative details for each field.
    The "suggestedPoiNames" should be a list of 3 to 5 intriguing names for potential Points of Interest within this area, fitting the theme and description. These are just names, not full POIs yet.
    Respond with a JSON object of the following structure:
    {
      "name": "string (A creative and evocative name for the entire area, e.g., 'The Obsidian Peaks', 'Whispering Fen')",
      "description": "string (A 2-3 sentence general overview of the area, setting the scene and primary characteristics)",
      "geography": "string (Detailed description of the area's key geographical features: mountains, rivers, forests, coastlines, etc.)",
      "climate": "string (Description of the prevailing weather conditions, seasons, and any unusual climatic phenomena)",
      "floraFauna": "string (Notable plants, trees, animals, monsters, or magical creatures found in the area)",
      "inhabitants": "string (Description of dominant sentient races, cultures, civilizations, factions, or notable lonely figures)",
      "moodAtmosphere": "string (The overall feeling or vibe of the area: e.g., 'mysterious and foreboding', 'ancient and serene', 'dangerous and volatile', 'vibrant and bustling')",
      "suggestedPoiNames": ["string", "string", "string"],
      "areaLore": "string (1-2 paragraphs of key historical events, overarching myths, legends, or unique magical properties of the area)"
    }
    Ensure all fields are populated with rich, descriptive text.
  `;
  const systemInstruction = "You are an API that STRICTLY returns ONLY valid JSON objects. Do NOT include ANY conversational text, comments, explanations, or ANY non-JSON content whatsoever in your response. Your entire output must be a single, valid JSON object and nothing else.";

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: TEXT_MODEL_NAME,
    contents: areaPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.95,
      topK: 50,
    }
  });
  const rawResponse = response.text;
  const parsedResponse = parseJsonFromString<AreaInfoResponse>(rawResponse);
  return { parsedResponse, rawResponse };
};


// --- Optimal Map Type Determination ---
export interface DetermineMapTypeParams {
  areaInfo: AreaInfo;
  pois?: Place[]; // Optional, as POIs might not be generated yet
}
export interface DetermineMapTypeResult {
  parsedResponse: OptimalMapTypeResponse | null;
  rawResponse: string;
  determinedMapType: MapType; // Fallback if parsing fails
}
export const determineOptimalMapType = async ({ areaInfo, pois }: DetermineMapTypeParams): Promise<DetermineMapTypeResult> => {
  let poiContext = "";
  if (pois && pois.length > 0) {
    const poiSummary = pois.map(p => `${p.name}: ${p.description.substring(0,100)}...`).join('; ');
    poiContext = `Consider these Points of Interest within the area: ${poiSummary.substring(0,500)}`;
  }

  const validMapTypes = MAP_TYPES.filter(mt => mt !== "Automatic").join(', ');

  const prompt = `
    Given the following Area Information:
    Name: ${areaInfo.name}
    Description: ${areaInfo.description}
    Geography: ${areaInfo.geography.substring(0,300)}...
    Mood: ${areaInfo.moodAtmosphere}
    ${poiContext}

    Based *only* on the provided information about the area (and POIs if available), determine the MOST SUITABLE 'MapType' from this exact list: [${validMapTypes}].
    Consider the scale and nature implied by the area's description. For example:
    - Vast descriptions of continents or worlds -> 'World', 'Continent'.
    - Large regions with multiple biomes/cities -> 'Region', 'Area'.
    - Single cities or towns -> 'City'.
    - Dungeons, buildings, specific small locations -> 'Interior', 'Battlemap', 'Detailed Area Feature'.
    - Island groups -> 'Archipelago'.
    - Unique environmental concepts -> 'Underdark Realm', 'Celestial Chart', 'Floating Island Network'.
    
    Respond with a JSON object of the following structure:
    {
      "determinedMapType": "string (MUST be one of: [${validMapTypes}])",
      "reasoning": "string (Briefly explain why this map type was chosen based on the area info)"
    }
  `;
  const systemInstruction = "You are an API that STRICTLY returns ONLY valid JSON objects. Do NOT include ANY conversational text, comments, explanations, or ANY non-JSON content whatsoever in your response. Your entire output must be a single, valid JSON object and nothing else.";

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: TEXT_MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.3, 
      topP: 0.9,
      topK: 30,
    }
  });
  const rawResponse = response.text;
  const parsedResponse = parseJsonFromString<OptimalMapTypeResponse>(rawResponse);

  let finalMapType: MapType = 'Region'; 
  if (parsedResponse && parsedResponse.determinedMapType && MAP_TYPES.includes(parsedResponse.determinedMapType as MapType)) {
    finalMapType = parsedResponse.determinedMapType as MapType;
  } else if (areaInfo.description.toLowerCase().includes("city") || areaInfo.name.toLowerCase().includes("city")) {
     finalMapType = 'City';
  } else if (areaInfo.description.toLowerCase().includes("world") || areaInfo.name.toLowerCase().includes("world")) {
     finalMapType = 'World';
  }

  return { parsedResponse, rawResponse, determinedMapType: finalMapType };
};


// --- Points of Interest Generation ---
export interface PointsOfInterestParams {
  areaInfo: AreaInfo;
  customLore?: string;
  useCustomLore?: boolean;
  numberOfPois?: number; // Total number of POIs desired
  prioritizeSuggestedNames?: boolean; // Whether to use areaInfo.suggestedPoiNames first
}
export interface PointsOfInterestResult {
  parsedResponse: PointsOfInterestResponse | null;
  rawResponse: string;
}

export const generatePointsOfInterest = async ({
  areaInfo,
  customLore,
  useCustomLore,
  numberOfPois = 3,
  prioritizeSuggestedNames = true,
}: PointsOfInterestParams): Promise<PointsOfInterestResult> => {
  
  let loreContext = `The POIs must be deeply rooted in the area's established lore: "${areaInfo.areaLore.substring(0, 500)}${areaInfo.areaLore.length > 500 ? '...' : ''}". `;
  if (useCustomLore && customLore && customLore.trim()) {
    loreContext += `Also consider this supplemental custom lore: "${customLore.substring(0, 300)}${customLore.length > 300 ? '...' : ''}".`;
  }

  let poiGuidance = "";
  const desiredPoiCount = Math.max(1, numberOfPois); // Ensure at least 1 POI
  const suggestedNames = areaInfo.suggestedPoiNames || [];
  let namesToUseExplicitly: string[] = [];
  let additionalPoisToGenerate = desiredPoiCount;

  if (prioritizeSuggestedNames && suggestedNames.length > 0) {
    namesToUseExplicitly = suggestedNames.slice(0, desiredPoiCount);
    additionalPoisToGenerate = desiredPoiCount - namesToUseExplicitly.length;
    
    if (namesToUseExplicitly.length > 0) {
      poiGuidance = `First, generate detailed POIs for each of these ${namesToUseExplicitly.length} specific names: ${namesToUseExplicitly.map(name => `"${name}"`).join(', ')}. `;
    }
    if (additionalPoisToGenerate > 0) {
      poiGuidance += `Then, generate ${additionalPoisToGenerate} additional distinct POIs that fit the area, ensuring a total of ${desiredPoiCount} POIs.`;
    } else if (namesToUseExplicitly.length === 0) { // Should not happen if suggestedNames.length > 0, but as a fallback
       poiGuidance = `Generate exactly ${desiredPoiCount} distinct and detailed Points of Interest (POIs).`;
    } else {
       // All POIs are covered by suggested names
       poiGuidance += `Ensure a total of exactly ${desiredPoiCount} POIs using only the provided names.`;
    }
  } else {
    poiGuidance = `Generate exactly ${desiredPoiCount} distinct and detailed Points of Interest (POIs).`;
  }


  const textPrompt = `
    The overall area is named "${areaInfo.name}" and described as: "${areaInfo.description.substring(0,300)}...". 
    Geography: "${areaInfo.geography.substring(0,200)}...". Atmosphere: "${areaInfo.moodAtmosphere}".
    ${loreContext}
    ${poiGuidance}

    Each POI MUST include:
    1.  "id": A temporary unique string identifier (e.g., "poi_temp_1"). This ID will be replaced later.
    2.  "name": A creative and evocative name for the POI. If specific names were provided above, use them. For any additionally generated POIs, create new, fitting names.
    3.  "description": A 1-2 sentence flavorful overview of the POI, setting the scene, consistent with the area.
    4.  "significance": A brief explanation of why this place is important or noteworthy in the context of "${areaInfo.name}".
    5.  "rumors_legends": Interesting stories, myths, or common knowledge whispered about this POI, related to area lore.
    6.  "potential_discoveries": Examples of what one might find or learn here (e.g., 'an ancient artifact', 'a hidden trail', 'clues related to area lore', 'a rare magical herb').

    Respond with a JSON object of the following structure:
    {
      "places": [
        { 
          "id": "string", 
          "name": "string", 
          "description": "string", 
          "significance": "string", 
          "rumors_legends": "string", 
          "potential_discoveries": "string" 
        }
        // ... (include POI objects, aiming for ${desiredPoiCount} total)
      ]
    }
    The "places" array should contain exactly ${desiredPoiCount} POI objects. Each field must be a simple string.
  `;
  const systemInstruction = "You are an API that STRICTLY returns ONLY valid JSON objects. Do NOT include ANY conversational text, comments, explanations, or ANY non-JSON content whatsoever in your response. Your entire output must be a single, valid JSON object and nothing else. Ensure all strings within the JSON are properly escaped.";
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: TEXT_MODEL_NAME,
    contents: textPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.75, 
      topP: 0.9,
      topK: 50,
    }
  });

  const rawResponse = response.text;
  const parsedResponse = parseJsonFromString<PointsOfInterestResponse>(rawResponse);
  
  if (parsedResponse && parsedResponse.places) {
    if (parsedResponse.places.length !== desiredPoiCount) {
        console.warn(`AI returned ${parsedResponse.places.length} POIs, but ${desiredPoiCount} were requested. Prompt guidance: "${poiGuidance.substring(0,100)}...". Using what was returned. Raw: ${rawResponse.substring(0,500)}`);
    }
    // Ensure IDs are present (though they will be replaced by UUIDs later).
    parsedResponse.places = parsedResponse.places.map((p, i) => ({
      ...p,
      id: p.id || `temp_ai_id_${Date.now()}_${i}` 
    }));
  }

  return { parsedResponse, rawResponse };
};


// --- Initial Map Info (Legacy/Adapted - May be less critical if AreaInfo drives title) ---
export interface InitialMapInfoParams {
  theme: string; 
  mapTypeInput: MapType; 
  customLore: string;
  useCustomLore: boolean;
  areaInfo?: AreaInfo; 
}
export interface InitialMapInfoResult {
  parsedResponse: InitialMapInfoResponse | null;
  rawResponse: string;
  effectiveMapType: MapType; 
  title: string; 
}

export const generateInitialMapInfo = async ({
  theme,
  mapTypeInput, 
  customLore,
  useCustomLore,
  areaInfo,
}: InitialMapInfoParams): Promise<InitialMapInfoResult> => {
  
  let titleToUse = areaInfo?.name || "Untitled Map";
  let effectiveMapType: MapType = areaInfo && mapTypeInput === 'Automatic' 
    ? (await determineOptimalMapType({areaInfo})).determinedMapType 
    : mapTypeInput !== 'Automatic' ? mapTypeInput : 'Region';

  if (areaInfo) {
    // Title is derived, mapType might be determined.
  } else {
     const titleGenPrompt = `Generate a creative title for a map with theme: "${theme}". JSON: {"title": "string"}`;
     const titleResponse = await ai.models.generateContent({ model: TEXT_MODEL_NAME, contents: titleGenPrompt, config: { responseMimeType: "application/json" }});
     const parsedTitle = parseJsonFromString<{title: string}>(titleResponse.text);
     if (parsedTitle?.title) titleToUse = parsedTitle.title;
     if (mapTypeInput === 'Automatic') {
        effectiveMapType = theme.toLowerCase().includes("city") ? 'City' : theme.toLowerCase().includes("world") ? 'World' : 'Region';
     }
  }

  return {
    parsedResponse: { title: titleToUse, chosenMapType: effectiveMapType },
    rawResponse: "Manually constructed or from simplified call",
    effectiveMapType: effectiveMapType,
    title: titleToUse,
  };
};
