
export const APP_VERSION = "1.1.0"; // Current application version

export interface Place {
  id: string; 
  name: string;
  description: string; 
  significance?: string; 
  rumors_legends?: string; 
  potential_discoveries?: string; 
  gridX?: number; 
  gridY?: number; 
  isManuallyAdded?: boolean; // Flag for manually added POIs
}

export interface AreaInfo {
  name: string; // e.g., "The Sunken City of Aethel"
  description: string; // General overview of the entire area
  geography: string; // Mountains, rivers, forests, etc.
  climate: string; // Prevailing weather conditions
  floraFauna: string; // Notable plants and animals
  inhabitants: string; // Dominant races, cultures, factions
  moodAtmosphere: string; // Overall feeling: mysterious, dangerous, peaceful
  suggestedPoiNames: string[]; // AI suggested names for POIs within this area
  areaLore: string; // Key historical events, myths, or unique aspects of the area
}

export interface MapData {
  title: string; // Can be derived from AreaInfo.name or refined
  imageUrl?: string; 
  places: Place[]; 
  mapType?: MapType; 
  usedTheme?: string; 
  pixelGrid?: string[][];
  pixelGridWidth?: number;  
  pixelGridHeight?: number; 
  imageOriginalWidth?: number; 
  imageOriginalHeight?: number; 
  
  areaInfo?: AreaInfo | null; // Newly added for detailed area context

  // For sub-map functionality (future enhancement)
  parentPoiId?: string | null; // ID of the POI this map is a sub-map of
  mapLevel?: number; // 0 for main map, 1 for POI sub-map, etc.
}

// Response from AI for initial area information
export interface AreaInfoResponse extends AreaInfo {}

// Response from AI for initial map info (title, map type) - title might be optional if derived from AreaInfo
export interface InitialMapInfoResponse {
  title?: string; // Title might now be derived from AreaInfo or generated during POI/Map Image stage
  chosenMapType?: string; 
}

export interface OptimalMapTypeResponse {
  determinedMapType: MapType;
  reasoning?: string; // Optional: AI's reasoning for choosing this map type
}

// Response from AI for generating points of interest
export interface PointsOfInterestResponse {
  places: Array<{
    id: string; // AI can suggest an ID, but we will overwrite with UUID
    name: string;
    description: string;
    significance: string;
    rumors_legends: string;
    potential_discoveries: string;
  }>;
}


// Combined structure for initial parsing, though services will be more specific
export interface GeneratedTextResponse {
  title?:string; 
  places?: Array<{ 
    id: string; 
    name: string; 
    description: string;
    significance?: string;
    rumors_legends?: string;
    potential_discoveries?: string;
  }>; 
  chosenMapType?: string; 
  areaInfo?: AreaInfo; // For parsing area info responses
}


export const MAP_TYPES = [
  'Automatic', // This will now be primarily for AI's internal decision, less for user direct choice
  'World', 'Continent', 'Region', 'Area', 'City', 'Interior',
  'Archipelago', 'Underdark Realm', 'Celestial Chart', 'Battlemap',
  'Trade Route Map', 'Wilderness Expanse', 'Lost Temple Complex',
  'Floating Island Network', 'Desert Oasis Cluster', 'Swamp/Marshland',
  'Mountain Range', 'Capital City District Map', 'Ancient Ruins Site',
  'Wizard\'s Tower (Multi-level)', 'Volcanic Region', 'Coastal Kingdom',
  'Fortress/Stronghold', 'Sacred Grove', 'Island Nation', 'Dimensional Rift Zone',
  'Detailed Area Feature' // New type for POI sub-maps or specific locations
] as const;

export type MapType = typeof MAP_TYPES[number];

export const MAX_GRID_DIMENSION = 64; 

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ExportedMapData {
  appVersion: string; // Added application version
  title: string;
  imageUrl?: string; 
  places: Place[]; 
  mapType?: MapType; 
  usedTheme?: string; 
  customLore?: string;
  useCustomLore?: boolean;
  pixelGrid?: string[][];
  pixelGridWidth?: number;
  pixelGridHeight?: number;
  imageOriginalWidth?: number;
  imageOriginalHeight?: number;
  showOriginalOverlay?: boolean;
  pixelGridOpacity?: number;
  areaInfo?: AreaInfo | null; // Include AreaInfo in export
}

export const APP_MODES = ['create', 'browse'] as const;
export type AppMode = typeof APP_MODES[number];

export interface FinalizedMapEntry {
  id: string;
  title: string;
  timestamp: number;
  mapData: ExportedMapData; // Use ExportedMapData for consistent structure
  previewImage?: string; // Optional: small base64 preview for quick display
}

export const FINALIZED_MAPS_KEY = 'aiFantasyMapGeneratorFinalizedMaps';


// Interface for session persistence in localStorage
export interface SessionState {
  appVersion: string;
  theme: string;
  customLore: string;
  useCustomLore: boolean;
  areaInfo: AreaInfo | null;
  mapData: MapData | null;
  isLeftPanelCollapsed: boolean;
  showOriginalOverlay: boolean;
  pixelGridOpacity: number;
  numPoisToGenerate?: number; // Added for persisting POI generation options
  prioritizeSuggestedPoiNames?: boolean; // Added for persisting POI generation options
  appMode?: AppMode; // Added for app mode persistence
  finalizedMaps?: FinalizedMapEntry[]; // Added for finalized maps persistence
}

// Props for ManualPoiForm
export type ManualPoiFormData = Omit<Place, 'id' | 'gridX' | 'gridY' | 'isManuallyAdded'>;

export interface ManualPoiFormProps {
  isOpen: boolean;
  onSave: (data: ManualPoiFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}
