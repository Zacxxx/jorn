import { MapType, Place, InitialMapInfoResponse, PointsOfInterestResponse, AreaInfo, AreaInfoResponse, OptimalMapTypeResponse, ImageGenerationModelType } from '../../types';
import { 
  generateAreaInfo, AreaInfoParams, AreaInfoResult,
  generateInitialMapInfo, InitialMapInfoParams, InitialMapInfoResult, 
  generatePointsOfInterest, PointsOfInterestParams, PointsOfInterestResult,
  determineOptimalMapType, DetermineMapTypeParams, DetermineMapTypeResult
} from './textGenerationService';
import { generateImageFromPrompt, ImageGenerationParams } from './imageGenerationService';
import { v4 as uuidv4 } from 'uuid';
import { ai, GEMINI_MODEL_NAME } from './config';
import { GenerateImagesResponse } from "@google/genai";
import { imageToPixelGrid } from '../../utils/imageToPixelGrid';
import { Client, handle_file } from "@gradio/client";

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
  places: Place[];
  theme: string;
  customLore: string;
  useCustomLore: boolean;
  model: ImageGenerationModelType;
}
export interface GenerateMapImageResult {
  imageUrl: string;
  determinedMapType: MapType;
  mapTitle: string; // Title for the map, could be areaInfo.name or refined
  rawOptimalMapTypeResponse?: string;
}

const GRADIO_SPACE_NAME = "ByteDance/DreamO";
const HF_TOKEN = "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"; // Your hardcoded token

export const generateMapImage = async ({
    areaInfo,
    places,
    theme,
    customLore,
    useCustomLore,
    model
}: GenerateMapImageParams): Promise<GenerateMapImageResult> => {
    try {
        // Step 1: Determine Optimal Map Type (remains the same)
        const mapTypeResult = await determineOptimalMapType({
            areaInfo: areaInfo,
            pois: places,
        });
        const determinedMapType = mapTypeResult.determinedMapType || 'Region'; // Fallback if needed

        // Step 2: Generate the map image using the chosen model
        let imageUrl: string;
        if (model === 'gradio') {
            console.log(`Duplicating Gradio Space: ${GRADIO_SPACE_NAME}`);
            try {
                const mapGenPrompt = 
                    `A detailed fantasy map of "${areaInfo.name}", which is a ${determinedMapType}. ` +
                    `Theme: ${theme}. Atmosphere: ${areaInfo.moodAtmosphere}. ` +
                    `Key geography: ${areaInfo.geography}. ` +
                    `Lore hint: ${customLore.substring(0, 150)}... ` +
                    `Visually integrate areas suggestive of these points of interest: ${places.map(p => p.name).join(", ")}. ` +
                    `Style: Antique parchment, rich textures, detailed illustration, no text labels, high fantasy, epic.`;

                // Placeholder reference images (URLs to simple, generic images if needed by the model as placeholders)
                // Using a small transparent png as a placeholder. Replace if a specific placeholder is better.
                const placeholderImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

                const app = await Client.duplicate(GRADIO_SPACE_NAME, { hf_token: HF_TOKEN as `hf_${string}` });
                
                console.log("Predicting with DreamO...");
                const result = await app.predict("/generate_image", { 
                    data: [
                        handle_file(placeholderImageUrl), // ref_image1
                        handle_file(placeholderImageUrl), // ref_image2
                        "ip",                             // ref_task1
                        "ip",                             // ref_task2
                        mapGenPrompt,                     // prompt
                        "-1",                             // seed
                        1024,                             // width
                        1024,                             // height
                        512,                              // ref_res
                        20,                               // num_steps (increased a bit from default 12 for potentially better quality)
                        7,                                // guidance (increased a bit from default 3.5)
                        true,                             // true_cfg (assuming boolean, but API says float 1)
                        0,                                // cfg_start_step
                        0,                                // cfg_end_step
                        "text, labels, words, blurry, watermark, signature, UI elements, modern", // neg_prompt
                        3.5,                              // neg_guidance
                        0                                 // first_step_guidance
                    ],
                });

                console.log("DreamO Raw Result:", result);

                // Process the result - ByteDance/DreamO returns a tuple
                if (typeof result?.data === 'object' && result.data !== null && Array.isArray(result.data) && result.data.length > 0) {
                    const generatedImageObject = (result.data as any)[0]; // First element of the tuple is the image
                    if (typeof generatedImageObject === 'object' && generatedImageObject !== null && typeof generatedImageObject.url === 'string') {
                        imageUrl = generatedImageObject.url;
                         // If the URL is relative, prepend the space URL (app.space_url might be useful here if available and URL is relative)
                        if (!imageUrl.startsWith('http') && app.space_url) {
                            try {
                                imageUrl = new URL(imageUrl, app.space_url).toString();
                            } catch (urlError) {
                                console.warn("Could not construct absolute URL for image:", urlError);
                                // Keep relative if construction fails, browser might handle it or might fail later.
                            }
                        }
                    } else if (typeof generatedImageObject === 'string' && generatedImageObject.startsWith('data:image')) {
                        imageUrl = generatedImageObject; // It's a base64 string
                    } else {
                        console.error("DreamO returned an unexpected data structure for the generated image:", generatedImageObject);
                        throw new Error('DreamO returned an unexpected data structure for the generated image.');
                    }
                } else {
                    console.error("DreamO returned an unexpected result structure:", result);
                    throw new Error('DreamO returned an unexpected result structure.');
                }
            } catch (e: any) {
                console.error("Gradio client error with DreamO:", e);
                throw new Error(`Failed to generate image with DreamO: ${e.message || e}`);
            }
        } else { // Default to Gemini
            imageUrl = await generateImageFromPrompt({
                theme: areaInfo.name, // Using area name for more specific image theme
                effectiveMapType: determinedMapType,
                customLore: areaInfo.areaLore, // Using lore from areaInfo
                useCustomLore: !!areaInfo.areaLore,
                areaContext: areaInfo,
                poisForVisualCues: places
            });
        }

        if (!imageUrl) {
            throw new Error('AI failed to generate the map image.');
        }

        // Step 3: Generate a map title (remains the same)
        const titleResult = await generateMapTitle({ 
            areaInfo,
            mapType: determinedMapType,
            pois: places 
        });
        const mapTitle = titleResult.mapTitle || areaInfo.name; // Fallback to area name

        return {
            imageUrl,
            determinedMapType,
            mapTitle,
            rawOptimalMapTypeResponse: mapTypeResult.rawResponse,
            rawMapTitleResponse: titleResult.rawResponse
        };

    } catch (error: any) {
        console.error("Error in generateMapImage main function:", error);
        throw new Error(`Failed to generate map image and details: ${error.message}`);
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
        useCustomLore: params.useCustomLore,
        model: 'gemini',
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
