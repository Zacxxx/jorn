
import React, { useState } from 'react';
import { ThemeInput } from './ThemeInput';
import { MapCustomization } from './MapCustomization';
import { PoiList } from './PoiList';
import { PoiInfoPanel } from './PoiInfoPanel';
import { MapData, MapType, Place, AreaInfo, AppMode } from '../../types';

// --- Collapsible Section Component ---
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
  className?: string;
  titleClassName?: string;
  icon?: React.ReactNode; 
  isLoading?: boolean; 
  badge?: string | number; 
  defaultOpen?: boolean; 
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, children, initiallyOpen = false, className = '', titleClassName = '', icon, isLoading, badge, defaultOpen
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen !== undefined ? defaultOpen : initiallyOpen);

  React.useEffect(() => {
    if (defaultOpen !== undefined) {
      setIsOpen(defaultOpen);
    }
  }, [defaultOpen]);

  return (
    <div className={`border border-amber-300/70 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-3 text-left bg-amber-100/60 hover:bg-amber-200/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${titleClassName}`}
        aria-expanded={isOpen}
        aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2 w-5 h-5 text-amber-700">{icon}</span>}
          <span className="font-semibold text-amber-700 text-sm tracking-wide">{title}</span>
          {badge !== undefined && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-300 rounded-full">{badge}</span>
          )}
        </div>
        <div className="flex items-center">
            {isLoading && <span className="icon-spinner w-4 h-4 mr-2 text-amber-600"></span>}
            <span className={`w-5 h-5 text-amber-600 transform transition-transform duration-200 ${isOpen ? 'icon-chevron-up' : 'icon-chevron-down'}`}></span>
        </div>
      </button>
      {isOpen && (
        <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="p-3 bg-white/80 border-t border-amber-300/50">
          {children}
        </div>
      )}
    </div>
  );
};


// --- Area Info Display Component ---
interface AreaInfoDisplayProps {
  areaInfo: AreaInfo;
}
const AreaInfoDisplay: React.FC<AreaInfoDisplayProps> = ({ areaInfo }) => {
  const DetailItem: React.FC<{label: string, value?: string | string[]}> = ({label, value}) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="mb-2">
        <h5 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-0.5">{label}</h5>
        {Array.isArray(value) ? (
          <ul className="list-disc list-inside pl-1 text-sm text-stone-700">
            {value.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{value}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2 text-sm">
      <h4 className="text-lg font-bold text-amber-700 font-serif mb-2" title={areaInfo.name}>{areaInfo.name}</h4>
      <DetailItem label="Overall Description" value={areaInfo.description} />
      <DetailItem label="Geography" value={areaInfo.geography} />
      <DetailItem label="Climate" value={areaInfo.climate} />
      <DetailItem label="Flora & Fauna" value={areaInfo.floraFauna} />
      <DetailItem label="Inhabitants & Cultures" value={areaInfo.inhabitants} />
      <DetailItem label="Mood & Atmosphere" value={areaInfo.moodAtmosphere} />
      <DetailItem label="Area Lore" value={areaInfo.areaLore} />
      <DetailItem label="Suggested POI Names" value={areaInfo.suggestedPoiNames} />
    </div>
  );
};


// --- LeftPanel Props ---
interface LeftPanelProps {
  theme: string;
  setTheme: (theme: string) => void;
  mapType: MapType; 
  setMapType: (mapType: MapType) => void; 
  customLore: string;
  setCustomLore: (lore: string) => void;
  useCustomLore: boolean;
  setUseCustomLore: (use: boolean) => void;
  
  onGenerateAreaDetails: () => void;
  onGeneratePois: () => void;
  onGenerateMapImage: () => void;

  isGeneratingArea: boolean;
  isGeneratingPois: boolean;
  isGeneratingImage: boolean;
  
  areaInfo: AreaInfo | null;
  mapData: MapData | null;
  activePoiDetail: Place | null; 
  onPoiItemClick: (poi: Place) => void;
  placingPoiId: string | null;
  onClearActivePoi: () => void; 

  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isRightPanelFullscreen: boolean;

  onExportMap: () => void;
  onImportMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canExport: boolean;
  importFileRef: React.RefObject<HTMLInputElement>;
  onToggleHelpModal: () => void;
  onResetApp: () => void;

  numPoisToGenerate: number;
  setNumPoisToGenerate: (num: number) => void;
  prioritizeSuggestedPoiNames: boolean;
  setPrioritizeSuggestedPoiNames: (p: boolean) => void;
  onOpenManualPoiForm: () => void;
  onAutoPlacePois: () => void;
  canAutoPlace: boolean;

  appMode: AppMode;
  onBrowseMaps: () => void;
  onReturnToCreateMode: () => void;
  onFinalizeMap: () => void;
  canFinalize: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  theme, setTheme, mapType, setMapType, customLore, setCustomLore,
  useCustomLore, setUseCustomLore, 
  onGenerateAreaDetails, onGeneratePois, onGenerateMapImage,
  isGeneratingArea, isGeneratingPois, isGeneratingImage,
  areaInfo, mapData, activePoiDetail, onPoiItemClick, placingPoiId, onClearActivePoi,
  isCollapsed, onToggleCollapse, isRightPanelFullscreen,
  onExportMap, onImportMap, canExport, importFileRef, onToggleHelpModal, onResetApp,
  numPoisToGenerate, setNumPoisToGenerate, prioritizeSuggestedPoiNames, setPrioritizeSuggestedPoiNames,
  onOpenManualPoiForm, onAutoPlacePois, canAutoPlace,
  appMode, onBrowseMaps, onReturnToCreateMode, onFinalizeMap, canFinalize
}) => {
  if (isRightPanelFullscreen && appMode === 'create') { // Fullscreen only for create mode map
    return null; 
  }

  const isLoading = isGeneratingArea || isGeneratingPois || isGeneratingImage;
  const unplacedPoisCount = mapData?.places.filter(p => typeof p.gridX !== 'number' || typeof p.gridY !== 'number').length || 0;


  const step = !areaInfo ? 1 : (!mapData?.places || mapData.places.length === 0) ? 2 : !mapData?.imageUrl ? 3 : 4;

  const renderCreateModeControls = () => (
    <div className="space-y-3 p-1">
      <CollapsibleSection title="Step 1: Define Your Area" initiallyOpen={step === 1} isLoading={isGeneratingArea} 
        icon={<span className="font-bold text-xl">①</span>}
      >
        <ThemeInput theme={theme} setTheme={setTheme} isLoading={isLoading} />
        <MapCustomization 
          mapType={mapType} 
          setMapType={setMapType} 
          isMapTypeAIDetermined={true} 
          customLore={customLore}
          setCustomLore={setCustomLore}
          useCustomLore={useCustomLore}
          setUseCustomLore={setUseCustomLore}
          onGeneratePrimary={onGenerateAreaDetails} 
          primaryGenerateText="Generate Area Details"
          isLoading={isLoading}
          onExportMap={onExportMap}
          onImportMap={onImportMap} 
          canExport={canExport && step === 4} 
          importFileRef={importFileRef}
          step={step}
        />
      </CollapsibleSection>

      {areaInfo && (
        <CollapsibleSection title="Area Information" initiallyOpen={true} 
            icon={<span className="font-bold text-xl">❖</span>} 
        >
          <AreaInfoDisplay areaInfo={areaInfo} />
        </CollapsibleSection>
      )}

      {areaInfo && (
        <CollapsibleSection 
          title="Step 2: Points of Interest (POIs)" 
          initiallyOpen={step === 2 || (mapData?.places && mapData.places.length > 0 && step < 3)} 
          isLoading={isGeneratingPois}
          icon={<span className="font-bold text-xl">②</span>}
          badge={mapData?.places?.length || 0}
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="numPoisToGenerate" className="block text-sm font-medium text-stone-700 mb-1">
                Number of POIs to Generate (1-10)
              </label>
              <input
                type="number"
                id="numPoisToGenerate"
                name="numPoisToGenerate"
                value={numPoisToGenerate}
                onChange={(e) => setNumPoisToGenerate(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
                min="1"
                max="10"
                className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white disabled:bg-stone-100"
                disabled={isLoading || !areaInfo}
              />
            </div>
            <div className="flex items-center">
              <input
                id="prioritizeSuggestedNames"
                name="prioritizeSuggestedNames"
                type="checkbox"
                checked={prioritizeSuggestedPoiNames}
                onChange={(e) => setPrioritizeSuggestedPoiNames(e.target.checked)}
                className="h-4 w-4 text-amber-600 border-amber-400 rounded focus:ring-amber-500 disabled:opacity-70"
                disabled={isLoading || !areaInfo || !areaInfo.suggestedPoiNames || areaInfo.suggestedPoiNames.length === 0}
              />
              <label htmlFor="prioritizeSuggestedNames" className="ml-2 block text-sm font-medium text-stone-700">
                Prioritize suggested names from Area Info
                {areaInfo?.suggestedPoiNames?.length === 0 && " (None available)"}
              </label>
            </div>
            <button
              onClick={onGeneratePois}
              disabled={isLoading || !areaInfo}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isGeneratingPois ? ( <><span className="icon-spinner w-5 h-5 mr-2"></span>Generating POIs...</>
              ) : mapData?.places && mapData.places.filter(p => !p.isManuallyAdded).length > 0 ? `Regenerate AI POIs (${numPoisToGenerate})` : `Generate AI POIs (${numPoisToGenerate})`}
            </button>
             <p className="mt-1 text-xs text-stone-500">
                {prioritizeSuggestedPoiNames && areaInfo?.suggestedPoiNames && areaInfo.suggestedPoiNames.length > 0 
                ? `Will use up to ${numPoisToGenerate} of the ${areaInfo.suggestedPoiNames.length} suggested names, generating others if needed.` 
                : `Will generate ${numPoisToGenerate} new POIs based on the area.`}
                Manually added POIs will be preserved.
            </p>
          </div>
        </CollapsibleSection>
      )}
      
      {areaInfo && mapData?.places && mapData.places.length > 0 && (
         <CollapsibleSection title="Step 3: Generate Map Image" initiallyOpen={step === 3} 
            isLoading={isGeneratingImage}
            icon={<span className="font-bold text-xl">③</span>}
            >
            <button
                onClick={onGenerateMapImage}
                disabled={isLoading || !areaInfo || !mapData.places || mapData.places.length === 0}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
                {isGeneratingImage ? (<><span className="icon-spinner w-5 h-5 mr-2"></span>Generating Image...</>) : 'Generate Map Image'}
            </button>
             <p className="mt-1 text-xs text-stone-500">
                AI will determine the best map type and create the image.
            </p>
         </CollapsibleSection>
      )}
      
      {mapData?.places && mapData.places.length > 0 && (
          <CollapsibleSection 
            title="POI List & Tools" 
            initiallyOpen={step === 4 && !activePoiDetail}
            badge={`${unplacedPoisCount}/${mapData.places.length} unplaced`}
          >
            <div className="space-y-3">
              <PoiList
                places={mapData.places}
                activePoiId={activePoiDetail?.id || null}
                onPoiSelect={onPoiItemClick}
                placingPoiId={placingPoiId}
                isLoading={isGeneratingPois || isGeneratingImage} 
                mapGenerated={!!mapData.pixelGrid}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 <button
                    onClick={onOpenManualPoiForm}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    title="Add a new Point of Interest manually"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add POI Manually
                  </button>
                  <button
                    onClick={onAutoPlacePois}
                    disabled={isLoading || !canAutoPlace}
                    className="w-full flex items-center justify-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300"
                    title={canAutoPlace ? "Automatically place all unplaced POIs on the map" : "Generate map image or add unplaced POIs to enable"}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 10.5H3.375A1.125 1.125 0 0 0 2.25 11.625v2.25c0 .621.504 1.125 1.125 1.125H3.75m1.5-4.5h13.5m-13.5 0v4.5m13.5-4.5v4.5m0-4.5H16.5m-1.5 4.5H7.5m0-4.5H5.25m5.25 0h3.75" /></svg>
                    Auto-Place POIs
                  </button>
              </div>
              {mapData?.pixelGrid && unplacedPoisCount > 0 && !placingPoiId && (
                 <div className="p-1 mt-0 text-center text-xs text-stone-500">
                    Select POIs from the list to place them, or use Auto-Place.
                  </div>
              )}
            </div>
          </CollapsibleSection>
      )}
      
       <CollapsibleSection title="Utilities" initiallyOpen={appMode === 'browse'}>
            <div className="p-2 space-y-2">
                {appMode === 'create' && (
                  <>
                  <button
                      onClick={onFinalizeMap}
                      disabled={isLoading || !canFinalize}
                      className="w-full flex items-center justify-center px-3 py-2 border border-purple-500 text-sm font-medium rounded-md shadow-sm text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                      title={canFinalize ? "Save current map to finalized maps gallery" : "Complete all generation steps to finalize"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      Finalize Current Map
                  </button>
                  <button
                      onClick={onBrowseMaps}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-3 py-2 border border-indigo-500 text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-50 transition duration-150 ease-in-out"
                      title="Browse your finalized maps"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
                      Browse Finalized Maps
                  </button>
                  </>
                )}
                {appMode === 'browse' && (
                   <button
                      onClick={onReturnToCreateMode}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-3 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 transition duration-150 ease-in-out"
                      title="Return to map creation mode"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                      Return to Create Mode
                  </button>
                )}
                <button
                    onClick={onToggleHelpModal}
                    className="w-full flex items-center justify-center px-3 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition duration-150 ease-in-out"
                >
                    <span className="icon-help w-4 h-4 mr-2"></span>
                    Help & Guide
                </button>
                 <button
                    onClick={onExportMap}
                    disabled={isLoading || !canExport || appMode === 'browse'}
                    className="w-full flex items-center justify-center px-3 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    title={canExport ? "Download current map data as JSON" : "Complete all generation steps to enable export"}
                  >
                    <span className="icon-download w-4 h-4 mr-2"></span>
                    Export Map
                  </button>
                  
                  <label 
                    htmlFor="import-map-input-leftpanel"
                    className={`w-full flex items-center justify-center px-3 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition duration-150 ease-in-out ${isLoading || appMode === 'browse' ? 'disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    title="Import map data from JSON file (Switches to Create Mode)"
                  >
                    <span className="icon-upload w-4 h-4 mr-2"></span>
                    Import Map
                  </label>
                  <input 
                    type="file" 
                    id="import-map-input-leftpanel" 
                    ref={importFileRef}
                    className="sr-only" 
                    accept=".json" 
                    onChange={onImportMap}
                    disabled={isLoading || appMode === 'browse'} 
                  />
                  <button
                    onClick={onResetApp}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-3 py-2 border border-red-500 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    title="Reset application state and clear saved session data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reset Application
                  </button>
            </div>
        </CollapsibleSection>
    </div>
  );

  const renderPoiDetailView = () => (
    activePoiDetail && appMode === 'create' && ( // Only show POI details in create mode
        <CollapsibleSection title="POI Details" initiallyOpen={true}>
            <PoiInfoPanel 
                poi={activePoiDetail} 
                onClearSelection={onClearActivePoi} 
                onGenerateSubMap={() => alert("Sub-map generation coming soon!")} 
                canGenerateSubMap={!!mapData?.pixelGrid} 
            />
        </CollapsibleSection>
    )
  );

  const renderBrowseModePanel = () => (
    <div className="p-3 space-y-4">
      <h2 className="text-lg font-semibold text-amber-700 font-serif">Browse Mode</h2>
      <p className="text-sm text-stone-600">Map browser will be displayed in the main area.</p>
       <button
            onClick={onReturnToCreateMode}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-amber-600 text-base font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Return to Map Creation
        </button>
        <CollapsibleSection title="Utilities" initiallyOpen={true}>
            <div className="p-2 space-y-2">
                <button
                    onClick={onToggleHelpModal}
                    className="w-full flex items-center justify-center px-3 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition duration-150 ease-in-out"
                >
                    <span className="icon-help w-4 h-4 mr-2"></span>
                    Help & Guide
                </button>
                 <button
                    onClick={onResetApp}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-3 py-2 border border-red-500 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    title="Reset application state and clear saved session data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reset Application
                  </button>
            </div>
        </CollapsibleSection>
    </div>
  );


  return (
    <aside 
      className={`
        flex-shrink-0 bg-white/60 backdrop-blur-md shadow-lg
        transition-all duration-300 ease-in-out
        relative 
        ${isCollapsed ? 'w-12 sm:w-14' : 'w-full sm:w-80 md:w-96 lg:w-[420px]'}
        h-full flex flex-col
        border-r border-amber-400/60 
        order-first 
      `}
      aria-label="Controls and Information Panel"
    >
        <div className={`p-3 flex justify-between items-center border-b border-amber-300/50 ${isCollapsed ? 'hidden' : ''}`}>
            <h1 className="text-lg font-bold text-amber-800 font-serif tracking-tight">
              {appMode === 'browse' ? 'Map Browser' : 'AI Map Generator'}
            </h1>
        </div>
      <div 
        id="left-panel-content"
        className={`flex-grow overflow-y-auto custom-scrollbar-thin ${isCollapsed ? 'hidden' : 'block'} 
                    ${appMode === 'create' && activePoiDetail && !placingPoiId && mapData?.pixelGrid ? 'p-1' : 'p-2'}`}
      >
        {appMode === 'create' ? 
            (activePoiDetail && !placingPoiId && mapData?.pixelGrid ? renderPoiDetailView() : renderCreateModeControls()) :
            renderBrowseModePanel()
        }
      </div>
      
      <button
        onClick={onToggleCollapse}
        className={`
          absolute top-1/2 -translate-y-1/2 
          ${isCollapsed ? 'right-1/2 translate-x-1/2 sm:right-1/2 sm:translate-x-1/2' : '-right-3 translate-x-0'} 
          z-20 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
          transition-all duration-300 ease-in-out
        `}
        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        aria-expanded={!isCollapsed}
        aria-controls="left-panel-content" 
      >
        <span className={`block w-5 h-5 sm:w-6 sm:h-6 transform transition-transform duration-300 ${isCollapsed ? 'icon-arrow-right-double' : 'icon-arrow-left-double'}`}></span>
      </button>
    </aside>
  );
};
