
import { MapType, Place, InitialMapInfoResponse, PointsOfInterestResponse, AreaInfo, AreaInfoResponse, OptimalMapTypeResponse } from '../../types';
import { 
  generateAreaInfo, AreaInfoParams, AreaInfoResult,
  generateInitialMapInfo, InitialMapInfoParams, InitialMapInfoResult, 
  generatePointsOfInterest, PointsOfInterestParams, PointsOfInterestResult,
  determineOptimalMapType, DetermineMapTypeParams, DetermineMapTypeResult
} from './textGenerationService';
import { generateImageFromPrompt, ImageGenerationParams } from './imageGenerationService';
import { v4 as uuidv4 } from 'uuid';

// --- Step 1: Generate Area Details ---
export interface GenerateAreaDetailsParams extends AreaInfoParams {}
export interface GenerateAreaDetailsResult {
  areaInfo: AreaInfo;
  rawTextResponse?: string;
}
export const generateAreaDetails = async (
  params: GenerateAreaDetailsParams
): Promise<GenerateAreaDetailsResult> => {
  try {
    const areaResult: AreaInfoResult = await generateAreaInfo(params);
    if (!areaResult.parsedResponse) {
      console.error('Failed to parse AreaInfo data. Raw response:', areaResult.rawResponse.substring(0,1000));
      throw new Error('AI failed to generate valid Area Information. Please try a different theme or simplify your request.');
    }
    return {
      areaInfo: areaResult.parsedResponse,
      rawTextResponse: areaResult.rawResponse,
    };
  } catch (error) {
    console.error("Error in generateAreaDetails:", error);
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred during Area Information generation.');
  }
};

// --- Step 2: Fetch Generated POIs (using AreaInfo) ---
export interface FetchPoisParams {
  areaInfo: AreaInfo;
  customLore?: string;
  useCustomLore?: boolean;
  numberOfPois?: number;
  prioritizeSuggestedNames?: boolean; 
}
export const fetchGeneratedPois = async (params: FetchPoisParams): Promise<Place[]> => {
  try {
    const poiParams: PointsOfInterestParams = {
        areaInfo: params.areaInfo,
        customLore: params.customLore,
        useCustomLore: params.useCustomLore,
        numberOfPois: params.numberOfPois, // Pass through user's choice
        prioritizeSuggestedNames: params.prioritizeSuggestedNames, // Pass through user's choice
    };
    const poiResult: PointsOfInterestResult = await generatePointsOfInterest(poiParams);

    if (!poiResult.parsedResponse || !poiResult.parsedResponse.places || !Array.isArray(poiResult.parsedResponse.places)) {
      console.error('Failed to parse POI data or places array is missing/invalid. Raw response:', poiResult.rawResponse.substring(0,1000));
      throw new Error('AI failed to generate valid Points of Interest. Please try again.');
    }
    
    const { places: rawPois } = poiResult.parsedResponse;

    const validatedPois: Place[] = rawPois.map((poi, index) => ({
      id: uuidv4(), 
      name: poi.name || `${params.areaInfo.name} Feature ${index + 1}`,
      description: poi.description || 'No description provided.',
      significance: poi.significance || 'Significance not detailed.',
      rumors_legends: poi.rumors_legends || 'No rumors or legends available.',
      potential_discoveries: poi.potential_discoveries || 'Potential discoveries not specified.',
      isManuallyAdded: false, // Mark as AI-generated
    }));

    if (validatedPois.length === 0 && (params.numberOfPois && params.numberOfPois > 0) ) { // only warn if POIs were expected
        console.warn("AI generated no POIs, though requested. Raw response:", poiResult.rawResponse.substring(0,1000));
    }
    return validatedPois;

  } catch (error) {
    console.error("Error in fetchGeneratedPois:", error);
     if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred during POI generation.');
  }
};

// --- Step 3: Generate Map Image (with AI-determined MapType) ---
export interface GenerateMapImageParams {
  areaInfo: AreaInfo;
  places: Place[]; // Detailed POIs
  theme: string; // Original theme for context
  customLore?: string;
  useCustomLore?: boolean;
}
export interface GenerateMapImageResult {
  imageUrl: string;
  determinedMapType: MapType;
  mapTitle: string; // Title for the map, could be areaInfo.name or refined
  rawOptimalMapTypeResponse?: string;
}
export const generateMapImage = async (
  params: GenerateMapImageParams
): Promise<GenerateMapImageResult> => {
  try {
    // 3a. Determine Optimal Map Type
    const mapTypeResult: DetermineMapTypeResult = await determineOptimalMapType({
      areaInfo: params.areaInfo,
      pois: params.places,
    });
    
    if (!mapTypeResult.determinedMapType) {
        console.warn("Could not determine optimal map type, defaulting to Region. Raw:", mapTypeResult.rawResponse?.substring(0,500));
    }
    const determinedMapType = mapTypeResult.determinedMapType || 'Region';

    // 3b. Generate Image
    const imageGenParams: ImageGenerationParams = {
      theme: params.theme, 
      effectiveMapType: determinedMapType,
      customLore: params.areaInfo.areaLore, 
      useCustomLore: true, 
      areaContext: params.areaInfo, 
      poisForVisualCues: params.places, 
    };
    const imageUrl = await generateImageFromPrompt(imageGenParams);

    if (!imageUrl) {
      throw new Error('AI failed to generate the map image.');
    }
    
    const mapTitle = params.areaInfo.name; 

    return {
      imageUrl,
      determinedMapType,
      mapTitle,
      rawOptimalMapTypeResponse: mapTypeResult.rawResponse,
    };

  } catch (error) {
    console.error("Error in generateMapImage:", error);
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred during map image generation.');
  }
};


// --- Legacy generateMapDetails (to be phased out or heavily adapted) ---
/**
 * @deprecated This function represents an older, single-step generation flow. 
 * The application now uses a multi-step process: 
 * 1. `generateAreaDetails` 
 * 2. `fetchGeneratedPois`
 * 3. `generateMapImage`.
 * This legacy function is not actively used in the main application flow and may be removed in the future.
 */
export interface GenerateMapDetailsParams_Legacy {
  theme: string; 
  mapTypeInput: MapType; 
  customLore: string; 
  useCustomLore: boolean;
}
export interface GenerateMapDetailsResult_Legacy {
  title: string;
  imageUrl: string;
  places: Place[];
  mapType: MapType;
  usedTheme: string;
  rawTextResponse?: string; 
  areaInfo?: AreaInfo;
}

export const generateMapDetails_Legacy = async (
  params: GenerateMapDetailsParams_Legacy
): Promise<GenerateMapDetailsResult_Legacy> => {
  try {
    console.warn("generateMapDetails_Legacy is called - this function is DEPRECATED and being phased out.");

    const areaParams: AreaInfoParams = { theme: params.theme, customLore: params.customLore, useCustomLore: params.useCustomLore };
    const areaDetails = await generateAreaInfo(areaParams); 
    if (!areaDetails.parsedResponse) throw new Error("Legacy: Failed to get area info.");

    const poiParams: FetchPoisParams = { areaInfo: areaDetails.parsedResponse, numberOfPois: 3, prioritizeSuggestedNames: true }; // Defaulting prioritize
    const pois = await fetchGeneratedPois(poiParams);

    const imageParams: GenerateMapImageParams = { 
        areaInfo: areaDetails.parsedResponse, 
        places: pois, 
        theme: params.theme, 
        customLore: params.customLore, 
        useCustomLore: params.useCustomLore 
    };
    const imageResult = await generateMapImage(imageParams);
    
    return {
      title: imageResult.mapTitle,
      imageUrl: imageResult.imageUrl,
      places: pois,
      mapType: imageResult.determinedMapType,
      usedTheme: params.theme,
      areaInfo: areaDetails.parsedResponse,
      rawTextResponse: areaDetails.rawResponse,
    };

  } catch (error) {
    console.error("Error in generateMapDetails_Legacy:", error);
    if (error instanceof Error) {
        throw new Error(`Legacy map generation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during legacy map generation.');
  }
};
