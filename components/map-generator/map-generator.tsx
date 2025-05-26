import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapData, Place, MapType, MAP_TYPES, ExportedMapData, AreaInfo, SessionState, APP_VERSION, ManualPoiFormData, AppMode, FinalizedMapEntry, FINALIZED_MAPS_KEY, APP_MODES, IMAGE_GENERATION_MODELS, ImageGenerationModelType } from './types';
import { ErrorDisplay } from './components/ui/ErrorDisplay';
import { HelpModal } from './components/ui/HelpModal';
import { LeftPanel } from './components/ui/LeftPanel';
import { RightPanel } from './components/ui/RightPanel';
import { ManualPoiForm } from './components/ui/ManualPoiForm';
import { generateAreaDetails, fetchGeneratedPois, generateMapImage } from './components/ai/geminiService';
import { imageToPixelGrid } from './utils/imageToPixelGrid';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'aiFantasyMapGeneratorSession';

interface MapGeneratorProps {
  onPoiSelected?: (poi: Place | null) => void;
}

const App: React.FC<MapGeneratorProps> = ({ onPoiSelected }) => {
  // Core Data State
  const [theme, setTheme] = useState<string>('');
  const [customLore, setCustomLore] = useState<string>('');
  const [useCustomLore, setUseCustomLore] = useState<boolean>(false);
  const [mapType, setMapType] = useState<MapType>(MAP_TYPES[0]); 
  const [areaInfo, setAreaInfo] = useState<AreaInfo | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);

  // Loading and Error State
  const [isGeneratingArea, setIsGeneratingArea] = useState<boolean>(false);
  const [isGeneratingPois, setIsGeneratingPois] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isManualPoiFormOpen, setIsManualPoiFormOpen] = useState<boolean>(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [isRightPanelFullscreen, setIsRightPanelFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const [showOriginalOverlay, setShowOriginalOverlay] = useState<boolean>(false);
  const [pixelGridOpacity, setPixelGridOpacity] = useState<number>(0.7);
  const [activePoiDetail, setActivePoiDetail] = useState<Place | null>(null);
  const [placingPoiId, setPlacingPoiId] = useState<string | null>(null);

  // POI Generation Options
  const [numPoisToGenerate, setNumPoisToGenerate] = useState<number>(3);
  const [prioritizeSuggestedPoiNames, setPrioritizeSuggestedPoiNames] = useState<boolean>(true);

  // App Mode and Finalized Maps
  const [appMode, setAppMode] = useState<AppMode>(APP_MODES[0]); // 'create'
  const [finalizedMaps, setFinalizedMaps] = useState<FinalizedMapEntry[]>([]);
  const [viewingFinalizedMap, setViewingFinalizedMap] = useState<FinalizedMapEntry | null>(null);

  // Image Generation Model Choice
  const [imageGenerationModel, setImageGenerationModel] = useState<ImageGenerationModelType>(IMAGE_GENERATION_MODELS[0]); // Default to gemini

  const importFileRef = useRef<HTMLInputElement>(null!);
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessionRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSessionRaw) {
      try {
        const savedSession = JSON.parse(savedSessionRaw) as SessionState;
        
        if (savedSession.appVersion !== APP_VERSION) {
          console.warn(`Loading session from a different app version (Session: ${savedSession.appVersion}, App: ${APP_VERSION}). Some features may behave unexpectedly.`);
        }

        setTheme(savedSession.theme || '');
        setCustomLore(savedSession.customLore || '');
        setUseCustomLore(savedSession.useCustomLore || false);
        setAreaInfo(savedSession.areaInfo || null);
        setMapData(savedSession.mapData || null);
        setIsLeftPanelCollapsed(savedSession.isLeftPanelCollapsed !== undefined ? savedSession.isLeftPanelCollapsed : false);
        setShowOriginalOverlay(savedSession.showOriginalOverlay !== undefined ? savedSession.showOriginalOverlay : false);
        setPixelGridOpacity(savedSession.pixelGridOpacity !== undefined ? savedSession.pixelGridOpacity : 0.7);
        setNumPoisToGenerate(savedSession.numPoisToGenerate !== undefined ? savedSession.numPoisToGenerate : 3);
        setPrioritizeSuggestedPoiNames(savedSession.prioritizeSuggestedPoiNames !== undefined ? savedSession.prioritizeSuggestedPoiNames : true);
        setAppMode(savedSession.appMode || APP_MODES[0]);
        setImageGenerationModel(savedSession.imageGenerationModel || IMAGE_GENERATION_MODELS[0]);
        
        if (savedSession.mapData?.mapType) {
          setMapType(savedSession.mapData.mapType);
        }
        console.log("Session loaded from localStorage.");
      } catch (err) {
        console.error("Failed to parse or load session from localStorage:", err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // Load finalized maps
    const savedFinalizedMapsRaw = localStorage.getItem(FINALIZED_MAPS_KEY);
    if (savedFinalizedMapsRaw) {
        try {
            const savedFinalizedMaps = JSON.parse(savedFinalizedMapsRaw) as FinalizedMapEntry[];
            setFinalizedMaps(savedFinalizedMaps);
        } catch (err) {
            console.error("Failed to parse finalized maps from localStorage:", err);
            localStorage.removeItem(FINALIZED_MAPS_KEY);
        }
    }
  }, []);

  useEffect(() => {
    // Only save if there's something meaningful to save to avoid clearing local storage on first load with empty state.
    if (theme || customLore || areaInfo || mapData || isLeftPanelCollapsed || showOriginalOverlay || pixelGridOpacity !== 0.7 || numPoisToGenerate !==3 || !prioritizeSuggestedPoiNames || appMode !== APP_MODES[0] || imageGenerationModel !== IMAGE_GENERATION_MODELS[0]) {
      try {
        const sessionToSave: SessionState = {
          appVersion: APP_VERSION,
          theme,
          customLore,
          useCustomLore,
          areaInfo,
          mapData,
          isLeftPanelCollapsed,
          showOriginalOverlay,
          pixelGridOpacity,
          numPoisToGenerate,
          prioritizeSuggestedPoiNames,
          appMode,
          imageGenerationModel,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionToSave));
      } catch (err) {
        console.error("Failed to save session to localStorage:", err);
      }
    }
    // Save finalized maps separately
    if (finalizedMaps.length > 0) {
        localStorage.setItem(FINALIZED_MAPS_KEY, JSON.stringify(finalizedMaps));
    } else {
        localStorage.removeItem(FINALIZED_MAPS_KEY); // Clean up if empty
    }

  }, [
    theme, customLore, useCustomLore, areaInfo, mapData, 
    isLeftPanelCollapsed, showOriginalOverlay, pixelGridOpacity,
    numPoisToGenerate, prioritizeSuggestedPoiNames, appMode, finalizedMaps,
    imageGenerationModel
  ]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen().catch(err => {
        setError(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsRightPanelFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);


  useEffect(() => {
    if (isRightPanelFullscreen) {
      document.body.classList.add('overflow-hidden'); 
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isRightPanelFullscreen]);

  const clearError = () => setError(null);
  const isLoading = isGeneratingArea || isGeneratingPois || isGeneratingImage;

  const resetAppState = (clearSession: boolean = true) => {
    setTheme('');
    setCustomLore('');
    setUseCustomLore(false);
    setMapType(MAP_TYPES[0]);
    setAreaInfo(null);
    setMapData(null);
    setIsGeneratingArea(false);
    setIsGeneratingPois(false);
    setIsGeneratingImage(false);
    setLoadingMessage('');
    setError(null);
    setShowOriginalOverlay(false);
    setPixelGridOpacity(0.7);
    setActivePoiDetail(null);
    setPlacingPoiId(null);
    setIsManualPoiFormOpen(false);
    setNumPoisToGenerate(3);
    setPrioritizeSuggestedPoiNames(true);
    setAppMode(APP_MODES[0]); // Reset to create mode
    setImageGenerationModel(IMAGE_GENERATION_MODELS[0]); // Reset image model
    setViewingFinalizedMap(null);


    if (clearSession) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        // Optionally, clear finalized maps too if full clear is intended
        // localStorage.removeItem(FINALIZED_MAPS_KEY);
        // setFinalizedMaps([]); 
        console.log("Application state reset and session cleared.");
    } else {
        console.log("Application state reset.");
    }
  };
  
  const handleResetApp = () => {
    if (window.confirm("Are you sure you want to reset the application? All current progress and persisted session data will be lost. Finalized maps will remain unless explicitly deleted.")) {
      resetAppState(true);
    }
  };


  const handleGenerateAreaDetails = useCallback(async () => {
    if (!theme.trim()) {
      setError("Please provide a theme for your area.");
      return;
    }
    clearError();
    setIsGeneratingArea(true);
    setAreaInfo(null);
    setMapData(null); 
    setActivePoiDetail(null);
    setPlacingPoiId(null);
    setLoadingMessage('Generating area details & lore...');

    try {
      const result = await generateAreaDetails({
        theme, customLore, useCustomLore
      });
      setAreaInfo(result.areaInfo);
      setMapData({
        title: result.areaInfo.name, 
        areaInfo: result.areaInfo,
        places: [], 
        usedTheme: theme,
      });
      // Update numPoisToGenerate based on new areaInfo, if prioritizing
      if (result.areaInfo && prioritizeSuggestedPoiNames) {
        setNumPoisToGenerate(result.areaInfo.suggestedPoiNames.length > 0 ? result.areaInfo.suggestedPoiNames.length : 3);
      }
      setLoadingMessage('Area details generated. Next, generate Points of Interest.');
    } catch (err: any) {
      console.error("Area generation failed:", err);
      setError(err.message || "An unexpected error occurred during area generation.");
      setAreaInfo(null);
      setMapData(null);
    } finally {
      setIsGeneratingArea(false);
    }
  }, [theme, customLore, useCustomLore, prioritizeSuggestedPoiNames]);

  const handleGeneratePois = useCallback(async () => {
    if (!areaInfo) {
      setError("Cannot generate POIs: Area Information is missing. Generate area details first.");
      return;
    }
    clearError();
    setIsGeneratingPois(true);
    setLoadingMessage("Generating Points of Interest...");
    setActivePoiDetail(null); 
    setPlacingPoiId(null); 

    try {
      const generatedPois = await fetchGeneratedPois({
        areaInfo,
        customLore: useCustomLore ? customLore : undefined,
        useCustomLore: useCustomLore,
        numberOfPois: numPoisToGenerate,
        prioritizeSuggestedNames: prioritizeSuggestedPoiNames,
      });

      setMapData(prev => {
        const existingManualPois = prev?.places.filter(p => p.isManuallyAdded) || [];
        return prev ? ({ ...prev, places: [...existingManualPois, ...generatedPois] }) : null
      });
      setLoadingMessage("Points of Interest generated! Next, generate the map image.");

    } catch (err:any) {
      console.error("POI generation failed:", err);
      setError(err.message || "An unexpected error occurred during POI generation.");
    } finally {
      setIsGeneratingPois(false);
    }
  }, [areaInfo, customLore, useCustomLore, numPoisToGenerate, prioritizeSuggestedPoiNames]);

  const handleGenerateMapImage = useCallback(async () => {
    if (!areaInfo || !mapData || mapData.places.length === 0) {
        setError("Cannot generate map image: Area Information or Points of Interest are missing. Complete previous steps.");
        return;
    }
    clearError();
    setIsGeneratingImage(true);
    setLoadingMessage("Generating map image and determining optimal map type...");

    try {
        const imageResult = await generateMapImage({
            areaInfo,
            places: mapData.places,
            theme: theme, 
            customLore: areaInfo.areaLore, 
            useCustomLore: true,
            model: imageGenerationModel,
        });

        setMapData(prev => prev ? ({
            ...prev,
            imageUrl: imageResult.imageUrl,
            mapType: imageResult.determinedMapType,
            title: imageResult.mapTitle, 
        }) : null);
        
        setMapType(imageResult.determinedMapType); 

        setLoadingMessage('Map image generated! Processing pixel grid...');
        const { pixelGrid, gridWidth, gridHeight, imageOriginalWidth, imageOriginalHeight } = await imageToPixelGrid(imageResult.imageUrl);
        
        setMapData(prev => prev ? ({
            ...prev,
            pixelGrid,
            pixelGridWidth: gridWidth,
            pixelGridHeight: gridHeight,
            imageOriginalWidth,
            imageOriginalHeight,
        }) : null);
        setLoadingMessage('Map generation complete!');

    } catch (err: any) {
        console.error("Map image generation failed:", err);
        setError(err.message || "An unexpected error occurred during map image generation.");
    } finally {
        setIsGeneratingImage(false);
    }
  }, [areaInfo, mapData, theme, imageGenerationModel]);


  const handlePixelClick = useCallback((x: number, y: number) => {
    if (placingPoiId && mapData) {
      const poiToPlace = mapData.places.find(p => p.id === placingPoiId);
      if (poiToPlace) {
        const updatedPlaces = mapData.places.map(p =>
          p.id === placingPoiId ? { ...p, gridX: x, gridY: y } : p
        );
        const newlyPlacedPoi = updatedPlaces.find(p => p.id === placingPoiId);
        setMapData({ ...mapData, places: updatedPlaces });
        setActivePoiDetail(newlyPlacedPoi || null); 
        setPlacingPoiId(null);
      }
    } else if (mapData) {
      const clickedPoiOnMap = mapData.places.find(p => p.gridX === x && p.gridY === y);
      if (clickedPoiOnMap) {
        setActivePoiDetail(clickedPoiOnMap);
        setPlacingPoiId(null);
      }
    }
  }, [placingPoiId, mapData]);

  const handlePoiItemClick = useCallback((poi: Place) => {
    if (placingPoiId === poi.id) { 
      setPlacingPoiId(null); 
      setActivePoiDetail(null); 
      return;
    }
    if (activePoiDetail?.id === poi.id) { 
        setActivePoiDetail(null); 
        setPlacingPoiId(null);
        return;
    }
    if (typeof poi.gridX === 'number' && typeof poi.gridY === 'number') {
      setActivePoiDetail(poi);
      setPlacingPoiId(null);
    } else { 
      if (!mapData?.pixelGrid) {
        setError("Please generate the map image before placing POIs.");
        return;
      }
      setPlacingPoiId(poi.id);
      setActivePoiDetail(null);
    }
  }, [placingPoiId, activePoiDetail, mapData?.pixelGrid]);

  const handleClearActivePoi = useCallback(() => {
    setActivePoiDetail(null);
    setPlacingPoiId(null); 
  }, []);

  const createExportData = useCallback((): ExportedMapData | null => {
    if (!mapData || !mapData.pixelGrid || !mapData.areaInfo) {
      return null;
    }
    return {
      appVersion: APP_VERSION,
      title: mapData.title,
      imageUrl: mapData.imageUrl,
      places: mapData.places,
      mapType: mapData.mapType,
      usedTheme: mapData.usedTheme,
      customLore: useCustomLore ? customLore : mapData.areaInfo?.areaLore,
      useCustomLore: useCustomLore || !!mapData.areaInfo?.areaLore,
      pixelGrid: mapData.pixelGrid,
      pixelGridWidth: mapData.pixelGridWidth!,
      pixelGridHeight: mapData.pixelGridHeight!,
      imageOriginalWidth: mapData.imageOriginalWidth!,
      imageOriginalHeight: mapData.imageOriginalHeight!,
      showOriginalOverlay: showOriginalOverlay,
      pixelGridOpacity: pixelGridOpacity,
      areaInfo: mapData.areaInfo,
    };
  }, [mapData, customLore, useCustomLore, showOriginalOverlay, pixelGridOpacity]);


  const handleExportMap = useCallback(() => {
    const exportData = createExportData();
    if (!exportData) {
        setError("Cannot export: Full map data (including area info and pixel grid) is incomplete.");
        return;
    }
    clearError();

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = (exportData.title.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50) || 'fantasy_map') + `_v${APP_VERSION}.json`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setLoadingMessage("Map data exported successfully!");
    setTimeout(() => setLoadingMessage(''), 3000);
  }, [createExportData]);

  const handleImportMap = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected for import.");
      return;
    }

    setLoadingMessage("Importing map data...");
    setIsGeneratingImage(true); 

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const importedData = JSON.parse(text) as Partial<ExportedMapData>; 

        if (!importedData.appVersion) {
            console.warn("Imported data is missing appVersion. It might be an older format.");
        } else if (importedData.appVersion !== APP_VERSION) {
            console.warn(`Imported data from version ${importedData.appVersion}, current app version is ${APP_VERSION}. Compatibility issues may arise.`);
        }

        if (!importedData.title || !importedData.places || !importedData.areaInfo || !importedData.usedTheme) {
          throw new Error("Imported JSON is missing essential map or area data fields (title, places, areaInfo, usedTheme).");
        }
         if (!Array.isArray(importedData.places)) {
            throw new Error("Imported 'places' field is not an array.");
        }
        
        const hasImageData = !!importedData.imageUrl && !!importedData.pixelGrid;
        resetAppState(false); 

        setAreaInfo(importedData.areaInfo);
        setMapData({
          title: importedData.title,
          imageUrl: hasImageData ? importedData.imageUrl : undefined,
          places: importedData.places as Place[], 
          mapType: hasImageData ? importedData.mapType : undefined,
          usedTheme: importedData.usedTheme,
          pixelGrid: hasImageData ? importedData.pixelGrid : undefined,
          pixelGridWidth: hasImageData ? importedData.pixelGridWidth : undefined,
          pixelGridHeight: hasImageData ? importedData.pixelGridHeight : undefined,
          imageOriginalWidth: hasImageData ? importedData.imageOriginalWidth : undefined,
          imageOriginalHeight: hasImageData ? importedData.imageOriginalHeight : undefined,
          areaInfo: importedData.areaInfo,
        });
        setTheme(importedData.usedTheme);
        setMapType(hasImageData ? (importedData.mapType || MAP_TYPES[0]) : MAP_TYPES[0]);
        setCustomLore(importedData.customLore || importedData.areaInfo.areaLore || ''); 
        setUseCustomLore(importedData.useCustomLore || !!importedData.areaInfo.areaLore);
        setShowOriginalOverlay(importedData.showOriginalOverlay !== undefined ? importedData.showOriginalOverlay : false);
        setPixelGridOpacity(importedData.pixelGridOpacity !== undefined ? importedData.pixelGridOpacity : 0.7);
        
        setActivePoiDetail(null);
        setPlacingPoiId(null);
        setAppMode(APP_MODES[0]); // Back to create mode after import
        
        setLoadingMessage(`Map data imported successfully. ${!hasImageData ? "Image and map type may need to be (re)generated." : ""}`);
        if (importFileRef.current) {
            importFileRef.current.value = ""; 
        }

      } catch (err: any) {
        console.error("Import failed:", err);
        setError(`Failed to import map data: ${err.message || "Invalid JSON format or missing critical data."}`);
      } finally {
        setIsGeneratingImage(false); 
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected file.");
      setIsGeneratingImage(false);
      setLoadingMessage('');
    };
    reader.readAsText(file);
  }, [resetAppState]);
  
  const handleOpenManualPoiForm = () => setIsManualPoiFormOpen(true);
  const handleCloseManualPoiForm = () => setIsManualPoiFormOpen(false);

  const handleSaveManualPoi = useCallback((poiData: ManualPoiFormData) => {
    const newPoi: Place = {
      ...poiData,
      id: uuidv4(),
      isManuallyAdded: true,
    };
    setMapData(prev => {
      const currentPlaces = prev?.places || [];
      if (!prev) {
        const fallbackAreaName = theme || "Unnamed Area";
        const fallbackAreaInfo: AreaInfo = {
            name: fallbackAreaName,
            description: "Area details not generated.",
            geography: "N/A",
            climate: "N/A",
            floraFauna: "N/A",
            inhabitants: "N/A",
            moodAtmosphere: "N/A",
            suggestedPoiNames: [],
            areaLore: customLore || "No specific lore provided."
        };
         if (!areaInfo) setAreaInfo(fallbackAreaInfo); 

        return {
            title: fallbackAreaName,
            places: [newPoi],
            usedTheme: theme,
            areaInfo: areaInfo || fallbackAreaInfo,
        };
      }
      return {
        ...prev,
        places: [...currentPlaces, newPoi],
      };
    });
    handleCloseManualPoiForm();
    setLoadingMessage(`POI "${newPoi.name}" added manually.`);
    setTimeout(() => setLoadingMessage(''), 3000);
  }, [theme, customLore, areaInfo]);

  const handleAutoPlacePois = useCallback(() => {
    if (!mapData || !mapData.pixelGrid || !mapData.pixelGridWidth || !mapData.pixelGridHeight) {
      setError("Cannot auto-place POIs: Map grid is not available.");
      return;
    }
    clearError();
    setLoadingMessage("Auto-placing POIs...");

    const unplacedPois = mapData.places.filter(p => typeof p.gridX !== 'number' || typeof p.gridY !== 'number');
    if (unplacedPois.length === 0) {
      setLoadingMessage("No unplaced POIs to auto-place.");
      setTimeout(() => setLoadingMessage(''), 3000);
      return;
    }

    const occupiedCoords = new Set(mapData.places
      .filter(p => typeof p.gridX === 'number' && typeof p.gridY === 'number')
      .map(p => `${p.gridX},${p.gridY}`)
    );

    const emptyCoords: {x: number, y: number}[] = [];
    for (let y = 0; y < mapData.pixelGridHeight; y++) {
      for (let x = 0; x < mapData.pixelGridWidth; x++) {
        if (!occupiedCoords.has(`${x},${y}`)) {
          emptyCoords.push({ x, y });
        }
      }
    }

    // Shuffle empty coordinates
    for (let i = emptyCoords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyCoords[i], emptyCoords[j]] = [emptyCoords[j], emptyCoords[i]];
    }

    let placedCount = 0;
    const updatedPlaces = mapData.places.map(p => {
      if ((typeof p.gridX !== 'number' || typeof p.gridY !== 'number') && emptyCoords.length > 0) {
        const coord = emptyCoords.pop();
        if (coord) {
          placedCount++;
          return { ...p, gridX: coord.x, gridY: coord.y };
        }
      }
      return p;
    });

    setMapData({ ...mapData, places: updatedPlaces });
    
    let message = `${placedCount} POI(s) auto-placed.`;
    if (unplacedPois.length > placedCount) {
      message += ` ${unplacedPois.length - placedCount} POI(s) remain unplaced due to lack of empty space.`;
    }
    setLoadingMessage(message);
    setTimeout(() => setLoadingMessage(''), 4000);

  }, [mapData]);

  const handleFinalizeMap = useCallback(() => {
    const currentExportData = createExportData();
    if (!currentExportData) {
        setError("Cannot finalize map: Map data is incomplete. Ensure all steps (Area Info, POIs, Map Image) are completed.");
        return;
    }
    clearError();
    
    const newFinalizedMap: FinalizedMapEntry = {
        id: uuidv4(),
        title: currentExportData.title,
        timestamp: Date.now(),
        mapData: currentExportData,
        // Optional: Generate a small preview image here if desired
        // previewImage: await generateSmallPreview(currentExportData.imageUrl),
    };

    setFinalizedMaps(prev => {
        const existingIndex = prev.findIndex(fm => fm.title === newFinalizedMap.title); // Simple duplicate check by title
        if (existingIndex > -1) {
            if(window.confirm(`A map named "${newFinalizedMap.title}" already exists. Overwrite it?`)) {
                const updatedMaps = [...prev];
                updatedMaps[existingIndex] = newFinalizedMap;
                return updatedMaps;
            } else {
                return prev; // Don't save
            }
        }
        return [...prev, newFinalizedMap];
    });
    setLoadingMessage(`Map "${newFinalizedMap.title}" finalized and saved! You can browse it later.`);
    setTimeout(() => setLoadingMessage(''), 4000);
    // Optionally, reset the current creation state after finalizing
    // resetAppState(false); 
  }, [createExportData, finalizedMaps]);

  const handleBrowseMaps = () => {
    setAppMode(APP_MODES[1]); // 'browse'
    setActivePoiDetail(null);
    setPlacingPoiId(null);
    // Potentially clear other 'create' mode specific states if they interfere with browsing
  };

  const handleReturnToCreateMode = () => {
    setAppMode(APP_MODES[0]); // 'create'
    setViewingFinalizedMap(null);
    // Potentially re-load or clear 'create' mode specific states
  };

  const handleViewFinalizedMap = (mapId: string) => {
    const mapToView = finalizedMaps.find(fm => fm.id === mapId);
    if (mapToView) {
        setViewingFinalizedMap(mapToView);
        // Logic to display this map will be handled in a new component (FinalizedMapViewer)
        // For now, RightPanel might show a message or be disabled
        console.log("Viewing finalized map:", mapToView.title);
    }
  };

  useEffect(() => {
    if (onPoiSelected) {
      onPoiSelected(activePoiDetail);
    }
  }, [activePoiDetail, onPoiSelected]);

  return (
    <div ref={appContainerRef} className={`h-full flex flex-col text-slate-200 font-['Inter',_sans-serif] bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden`}>
      {isRightPanelFullscreen && mapData && appMode === 'create' && ( 
        <header className="w-full px-4 py-2 bg-slate-900 text-slate-100 flex justify-between items-center z-50 flex-shrink-0 border-b border-slate-700">
           <h1 className="text-xl font-bold text-emerald-400 font-['Inter_Tight',_sans-serif] tracking-tight truncate" title={mapData.title}>
            {mapData.title}
           </h1>
           <RightPanel.Controls 
             isRightPanelFullscreen={isRightPanelFullscreen}
             onToggleFullscreen={handleToggleFullscreen}
             showCollapseToggle={false} 
             isLeftPanelCollapsed={true} 
             onToggleLeftPanel={() => {}} 
           />
        </header>
      )}

      <main className="flex-grow flex overflow-hidden h-full">
        <LeftPanel
          theme={theme}
          setTheme={setTheme}
          mapType={mapType} 
          setMapType={setMapType} 
          customLore={customLore}
          setCustomLore={setCustomLore}
          useCustomLore={useCustomLore}
          setUseCustomLore={setUseCustomLore}
          
          onGenerateAreaDetails={handleGenerateAreaDetails}
          onGeneratePois={handleGeneratePois}
          onGenerateMapImage={handleGenerateMapImage}

          isGeneratingArea={isGeneratingArea}
          isGeneratingPois={isGeneratingPois}
          isGeneratingImage={isGeneratingImage}
          
          areaInfo={areaInfo}
          mapData={mapData}
          activePoiDetail={activePoiDetail}
          onPoiItemClick={handlePoiItemClick}
          placingPoiId={placingPoiId}
          onClearActivePoi={handleClearActivePoi}
          isCollapsed={isLeftPanelCollapsed}
          onToggleCollapse={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          isRightPanelFullscreen={isRightPanelFullscreen}
          onExportMap={handleExportMap}
          onImportMap={handleImportMap}
          canExport={!!(mapData && mapData.pixelGrid && mapData.areaInfo)}
          importFileRef={importFileRef}
          onToggleHelpModal={() => setIsHelpModalOpen(true)}
          onResetApp={handleResetApp}
          numPoisToGenerate={numPoisToGenerate}
          setNumPoisToGenerate={setNumPoisToGenerate}
          prioritizeSuggestedPoiNames={prioritizeSuggestedPoiNames}
          setPrioritizeSuggestedPoiNames={setPrioritizeSuggestedPoiNames}
          onOpenManualPoiForm={handleOpenManualPoiForm}
          onAutoPlacePois={handleAutoPlacePois}
          canAutoPlace={!!(mapData?.pixelGrid && mapData.places.some(p => typeof p.gridX !== 'number' || typeof p.gridY !== 'number'))}
          appMode={appMode}
          onBrowseMaps={handleBrowseMaps}
          onReturnToCreateMode={handleReturnToCreateMode}
          onFinalizeMap={handleFinalizeMap}
          canFinalize={!!(mapData && mapData.pixelGrid && mapData.areaInfo)}
          imageGenerationModel={imageGenerationModel}
          setImageGenerationModel={setImageGenerationModel}
        />
        
        {appMode === 'create' && (
          <RightPanel
            mapData={mapData} 
            isLoading={isLoading} 
            loadingMessage={loadingMessage}
            error={error}
            activePoiIdForMapHighlight={activePoiDetail?.id || placingPoiId}
            onPixelGridClick={handlePixelClick}
            placingPoiId={placingPoiId}
            isLeftPanelCollapsed={isLeftPanelCollapsed}
            onToggleLeftPanel={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            isRightPanelFullscreen={isRightPanelFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            showOriginalOverlay={showOriginalOverlay}
            setShowOriginalOverlay={setShowOriginalOverlay}
            pixelGridOpacity={pixelGridOpacity}
            setPixelGridOpacity={setPixelGridOpacity}
          />
        )}
        {/* Placeholder for Browse Mode UI */}
        {appMode === 'browse' && (
            <div className="flex-grow flex items-center justify-center bg-slate-800/70 backdrop-blur-md p-4 text-slate-300">
                {/* This area will be replaced by MapBrowser.tsx and FinalizedMapViewer.tsx */}
                <div className="text-center">
                    <h2 className="text-2xl font-['Inter_Tight',_sans-serif] text-emerald-400 mb-4">Browse Finalized Maps</h2>
                    {finalizedMaps.length === 0 ? (
                        <p>No finalized maps yet. Create and finalize a map to see it here.</p>
                    ) : (
                        <p>Map browser content will appear here. ({finalizedMaps.length} maps available)</p>
                        // Simple list for now for testing
                        // <ul>{finalizedMaps.map(fm => <li key={fm.id}>{fm.title}</li>)}</ul>
                    )}
                </div>
            </div>
        )}
      </main>
      
      <ManualPoiForm 
        isOpen={isManualPoiFormOpen}
        onSave={handleSaveManualPoi}
        onClose={handleCloseManualPoiForm}
        isLoading={isLoading}
      />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      
      {error && !isLoading && 
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] p-4 max-w-md w-full">
          <div className="p-4 bg-red-700/80 backdrop-blur-md text-white rounded-md shadow-lg border border-red-900">
            <ErrorDisplay message={error} />
          </div>
        </div>
      }
      {loadingMessage && !error && (isGeneratingArea || isGeneratingPois || isGeneratingImage || (loadingMessage.includes("imported") || loadingMessage.includes("exported") || loadingMessage.includes("placed") || loadingMessage.includes("added") || loadingMessage.includes("finalized"))) && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] p-3 bg-sky-700/80 backdrop-blur-md text-white text-sm rounded-md shadow-lg border border-sky-900">
            {loadingMessage}
        </div>
      )}
    </div>
  );
};

export default App;
