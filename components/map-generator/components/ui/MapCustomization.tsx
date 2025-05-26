import React from 'react';
import { MapType, MAP_TYPES } from '../../types'; // MAP_TYPES might be used for display only

interface MapCustomizationProps {
  mapType: MapType; // For display, actual type might be AI determined
  setMapType: (mapType: MapType) => void; // May be disabled
  isMapTypeAIDetermined?: boolean; // New prop
  customLore: string;
  setCustomLore: (lore: string) => void;
  useCustomLore: boolean;
  setUseCustomLore: (use: boolean) => void;
  
  onGeneratePrimary: () => void; // Generic primary action (e.g., Generate Area, Generate Image)
  primaryGenerateText: string; // Text for the primary button
  isLoading: boolean;
  
  onExportMap: () => void;
  onImportMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canExport: boolean;
  importFileRef: React.RefObject<HTMLInputElement>;
  step: number; // Current generation step
}

export const MapCustomization: React.FC<MapCustomizationProps> = ({
  mapType, setMapType, isMapTypeAIDetermined, customLore, setCustomLore, useCustomLore, setUseCustomLore, 
  onGeneratePrimary, primaryGenerateText, isLoading,
  onExportMap, onImportMap, canExport, importFileRef, step
}) => {
  return (
    <div className="space-y-4">
      {/* Map Type selection is now mostly AI driven, so this might be for display or advanced override */}
      <div>
        <label htmlFor="mapTypeDisplay" className="block text-sm font-medium text-slate-300 mb-1">
          Map Type (AI Determined)
        </label>
        <input
          type="text"
          id="mapTypeDisplay"
          value={mapType === 'Automatic' && step < 3 ? 'AI Will Determine' : mapType}
          readOnly
          className="block w-full p-2 border border-slate-600 rounded-md shadow-sm bg-slate-700 text-slate-400 sm:text-sm"
          aria-label="Current or AI determined map type"
        />
         {isMapTypeAIDetermined && step < 3 && (
             <p className="mt-1 text-xs text-slate-400">The AI will select the most appropriate map type based on the area details and POIs during image generation.</p>
         )}
         {step >=3 && mapType !== 'Automatic' && (
            <p className="mt-1 text-xs text-slate-400">Map type determined by AI: {mapType}.</p>
         )}
      </div>

      <div>
        <div className="flex items-center mb-1">
          <input
            id="useCustomLore"
            name="useCustomLore"
            type="checkbox"
            checked={useCustomLore}
            onChange={(e) => setUseCustomLore(e.target.checked)}
            className="h-4 w-4 text-emerald-500 border-slate-500 rounded focus:ring-emerald-500 disabled:opacity-70"
            disabled={isLoading || step > 1} // Disable after area gen, as lore is baked in
          />
          <label htmlFor="useCustomLore" className="ml-2 block text-sm font-medium text-slate-300">
            Add Custom Lore (for Area Generation)
          </label>
        </div>
        {useCustomLore && (
          <textarea
            id="customLore"
            name="customLore"
            rows={4}
            className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:opacity-70"
            placeholder="e.g., The ancient war of the Twin Dragons reshaped this land..."
            value={customLore}
            onChange={(e) => setCustomLore(e.target.value)}
            disabled={isLoading || step > 1}
            aria-describedby="lore-description"
          />
        )}
        <p id="lore-description" className="mt-1 text-xs text-slate-400">
          {step > 1 ? "Area lore is now established. Regenerate area to change." : (useCustomLore ? "This lore will heavily influence the initial area generation." : "Check box to add lore for initial area generation.")}
        </p>
      </div>

      {step === 1 && ( // Only show primary generate button in step 1 via this component
          <button
            onClick={onGeneratePrimary}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-500/70 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <>
                <span className="icon-spinner w-5 h-5 mr-2"></span>
                Generating...
              </>
            ) : (
              primaryGenerateText
            )}
          </button>
      )}
    </div>
  );
};
