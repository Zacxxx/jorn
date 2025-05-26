
import { GenerateImagesResponse } from "@google/genai";
import { Place, MapType, AreaInfo } from '../../types'; 
import { ai, IMAGE_MODEL_NAME } from './config';

/**
 * Parameters for generating the map image.
 */
export interface ImageGenerationParams {
  /** The primary theme for the map. */
  theme: string;
  /** The AI-determined map type (e.g., 'World', 'City', 'Interior'). */
  effectiveMapType: MapType; 
  /** Custom lore, likely from AreaInfo.areaLore. */
  customLore: string;
  /** Flag indicating whether to use the custom lore. */
  useCustomLore: boolean;
  /** Full AreaInfo object for detailed context. */
  areaContext: AreaInfo; 
  /** Array of detailed POIs for visual cues on the map. */
  poisForVisualCues?: Place[];
}

/**
 * Generates a fantasy map image based on a detailed prompt.
 */
export const generateImageFromPrompt = async ({
  theme, // Original theme, might be less important than areaContext.description
  effectiveMapType,
  customLore, // Should be areaContext.areaLore
  useCustomLore, // Should be true if areaContext.areaLore is used
  areaContext,
  poisForVisualCues,
}: ImageGenerationParams): Promise<string> => {
  
  let mapTypeSpecificsForImage = "";
  const finalMapTypeForImage = effectiveMapType; // Already determined by AI

  // Use AreaInfo for more detailed type specifics
  if (finalMapTypeForImage === "Automatic") { 
      mapTypeSpecificsForImage = `This is a general fantasy map. Depict varied terrain, bodies of water, and potential points of interest based on the area description: "${areaContext.description.substring(0,200)}...". The specific type of map (e.g. world, region, city) should be inferred from the area's geography and scale.`;
  } else {
      switch(finalMapTypeForImage) {
          case 'Interior': mapTypeSpecificsForImage = `This is an interior map for a location within "${areaContext.name}", such as a dungeon, castle floor plan, building layout. Show rooms, corridors, and key features mentioned or implied by "${areaContext.description.substring(0,150)}...".`; break;
          case 'City': mapTypeSpecificsForImage = `This is a city map for "${areaContext.name}". Show streets, buildings, districts, walls (if any), and notable general landmark areas based on its description: "${areaContext.description.substring(0,150)}...".`; break;
          case 'Battlemap': mapTypeSpecificsForImage = `This is a tactical battlemap for an encounter within "${areaContext.name}". Focus on a specific area. Include cover, obstacles, and terrain features relevant to combat, fitting the mood: "${areaContext.moodAtmosphere}".`; break;
          case 'Detailed Area Feature': mapTypeSpecificsForImage = `This is a detailed map of a specific feature or small location within "${areaContext.name}", such as a 'Lost Temple Complex' or 'Wizard's Tower'. Show intricate details of this specific point of interest.`; break;
          default: mapTypeSpecificsForImage = `This is a ${finalMapTypeForImage}-scale map of "${areaContext.name}". Include varied terrain like ${areaContext.geography.substring(0,150)}... Major general areas of settlement or interest can be suggested, fitting the atmosphere: "${areaContext.moodAtmosphere}".`;
      }
  }
    
  const loreHintForImage = (useCustomLore && customLore && customLore.trim()) 
    ? `The visual details MUST be consistent with and evocative of the following established lore for "${areaContext.name}": "${customLore.substring(0, 400)}${customLore.length > 400 ? '...' : ''}"` 
    : `The visual details should be consistent with a rich fantasy setting for "${areaContext.name}".`;

  let poiVisualCues = "";
  if (poisForVisualCues && poisForVisualCues.length > 0) {
    const cueExamples = poisForVisualCues.slice(0,3).map(p => `${p.name} (described as: ${p.description.substring(0, 70)}...)`).join('; ');
    poiVisualCues = `Visually suggest the locations or types of these Points of Interest: ${cueExamples}. For example, if a POI is 'The Obsidian Spire', show a prominent dark tower. If 'The Sunken Library', show submerged ruins. These should be integrated naturally into the map's geography.`;
  } else if (areaContext.suggestedPoiNames && areaContext.suggestedPoiNames.length > 0) {
    const suggestedNames = areaContext.suggestedPoiNames.slice(0,3).join(', ');
    poiVisualCues = `Visually suggest areas that could correspond to these types of locations: ${suggestedNames}. For example, if 'Dragon's Peak' is suggested, show a significant mountain.`;
  } else {
    poiVisualCues = `Visually suggest areas that could later be defined as Points of Interest based on the area's theme ("${areaContext.description.substring(0,100)}...") and map type. Aim for clear, recognizable visual features.`;
  }

  const imagePrompt = `
  A high-quality, extremely detailed fantasy ${finalMapTypeForImage} map image in an antique, richly textured parchment style, suitable for a AAA fantasy publication.
  The map represents the area known as "${areaContext.name}", described as: "${areaContext.description.substring(0, 300)}${areaContext.description.length > 300 ? '...' : ''}".
  It MUST have a square aspect ratio (1:1).
  ${mapTypeSpecificsForImage}
  ${loreHintForImage}
  ${poiVisualCues}
  Emphasize rich visual storytelling, atmosphere (mood: ${areaContext.moodAtmosphere}), and impeccable detail. Key geographical elements to depict: ${areaContext.geography.substring(0,200)}...
  CRITICALLY IMPORTANT: The image MUST NOT contain any legible text, words, numbers, titles, labels, legends, UI elements, or any form of HUD overlay. Only include artistic, non-linguistic scribbles, abstract symbols, or purely iconic representations if markers are part of the map style (e.g. a small icon for a mountain range, not text). The focus is solely on the cartographic artwork. The map should be a pure visual representation of the described world/area.
  The image must be exactly square.
  `;

  const imageResponse: GenerateImagesResponse = await ai.models.generateImages({
      model: IMAGE_MODEL_NAME,
      prompt: imagePrompt,
      config: { 
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1' // Ensure model adheres if possible
      },
  });

  if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0 || !imageResponse.generatedImages[0].image.imageBytes) {
    throw new Error('Failed to generate map image from AI. No image data received.');
  }
  const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};
