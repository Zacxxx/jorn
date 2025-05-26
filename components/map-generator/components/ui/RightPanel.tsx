
import React, { useState } from 'react';
import { MapData, Place } from '../../types';
import { MapDisplay } from './MapDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

interface RightPanelControlsProps {
  isLeftPanelCollapsed: boolean;
  onToggleLeftPanel: () => void;
  isRightPanelFullscreen: boolean;
  onToggleFullscreen: () => void;
  showCollapseToggle: boolean;
}

const RightPanelScreenControls: React.FC<RightPanelControlsProps> = ({
  isLeftPanelCollapsed, onToggleLeftPanel, isRightPanelFullscreen, onToggleFullscreen, showCollapseToggle
}) => (
  <div className="flex items-center space-x-2">
    {showCollapseToggle && (
      <button
        onClick={onToggleLeftPanel}
        className="p-2 text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full md:hidden"
        title={isLeftPanelCollapsed ? "Show Controls" : "Hide Controls"}
        aria-expanded={!isLeftPanelCollapsed}
        aria-controls="left-panel-content"
      >
        <span className={`block w-6 h-6 ${isLeftPanelCollapsed ? 'icon-menu' : 'icon-arrow-left-double'}`}></span>
      </button>
    )}
    <button
      onClick={onToggleFullscreen}
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isRightPanelFullscreen ? 'text-white hover:text-amber-300 focus:ring-amber-400 focus:ring-offset-black' 
                                           : 'text-amber-600 hover:text-amber-800 focus:ring-amber-500 focus:ring-offset-white'}`} /* Adjusted offset for new bg */
      title={isRightPanelFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      aria-pressed={isRightPanelFullscreen}
    >
      <span className={`block w-6 h-6 ${isRightPanelFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen-enter'}`}></span>
    </button>
  </div>
);

interface MapDisplayOverlayControlsProps {
  showOriginalOverlay: boolean;
  setShowOriginalOverlay: (show: boolean) => void;
  pixelGridOpacity: number;
  setPixelGridOpacity: (opacity: number) => void;
  isOverlayMode: boolean;
  hasPixelGrid: boolean;
}

const MapDisplayOverlayControls: React.FC<MapDisplayOverlayControlsProps> = ({
  showOriginalOverlay,
  setShowOriginalOverlay,
  pixelGridOpacity,
  setPixelGridOpacity,
  isOverlayMode,
  hasPixelGrid
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const wrapperClasses = isOverlayMode
    ? "absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg shadow-xl text-white z-20 w-60 sm:w-72 border border-amber-500/60"
    : "flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-md shadow-sm border border-amber-400/50 mb-2 sm:mb-3"; /* Lighter bg for non-overlay */
  
  const headerBg = isOverlayMode ? "bg-black/20 hover:bg-black/40" : "bg-amber-200/30 hover:bg-amber-200/60"; /* Lighter bg */
  const titleColor = isOverlayMode ? "text-amber-200" : "text-stone-700";
  const labelColor = isOverlayMode ? "text-gray-200" : "text-stone-600";
  const valueColor = isOverlayMode ? "text-gray-300" : "text-stone-500";
  const contentPadding = isOverlayMode ? "p-3" : "p-2 sm:p-3";

  return (
    <div className={`${wrapperClasses}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full flex justify-between items-center text-left ${headerBg} ${contentPadding} rounded-t-lg ${isCollapsed ? 'rounded-b-lg' : ''} transition-colors`}
        aria-expanded={!isCollapsed}
        aria-controls="display-options-content"
      >
        <h4 className={`text-sm font-semibold ${titleColor}`}>Display Options</h4>
        <span className={`w-5 h-5 ${isCollapsed ? 'icon-chevron-down' : 'icon-chevron-up'} ${titleColor}`}></span>
      </button>
      {!isCollapsed && (
        <div id="display-options-content" className={`${contentPadding} space-y-2 border-t ${isOverlayMode ? 'border-amber-500/30' : 'border-amber-400/50'}`}>
          {hasPixelGrid && (
            <>
            <div className="flex items-center justify-between">
                <label htmlFor="showOriginalOverlayCheckbox" className={`text-xs sm:text-sm ${labelColor} cursor-pointer flex items-center`}>
                <input
                    type="checkbox"
                    id="showOriginalOverlayCheckbox"
                    checked={showOriginalOverlay}
                    onChange={(e) => setShowOriginalOverlay(e.target.checked)}
                    className="h-4 w-4 text-amber-600 border-amber-400 rounded focus:ring-amber-500 mr-2 cursor-pointer"
                    aria-describedby="showOriginalOverlayDescription"
                />
                Show Original Background
                </label>
            </div>
            <p id="showOriginalOverlayDescription" className="sr-only">Toggles the visibility of the unpixelated map image behind the pixel grid.</p>
            
            <div className="flex items-center justify-between gap-2">
                <label htmlFor="pixelGridOpacitySlider" className={`text-xs sm:text-sm ${labelColor} whitespace-nowrap`}>Pixel Grid Opacity:</label>
                <input
                type="range"
                id="pixelGridOpacitySlider"
                min="0"
                max="100"
                value={pixelGridOpacity * 100}
                onChange={(e) => setPixelGridOpacity(parseFloat(e.target.value) / 100)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer flex-grow ${isOverlayMode ? 'bg-gray-700 accent-amber-500' : 'bg-amber-300 accent-amber-600'}`} /* Adjusted slider bg */
                aria-label="Pixel Grid Opacity"
                aria-describedby="pixelGridOpacityValue"
                />
                <span id="pixelGridOpacityValue" className={`text-xs ${valueColor} w-8 text-right`}>{Math.round(pixelGridOpacity * 100)}%</span>
            </div>
            <p id="pixelGridOpacityDescription" className="sr-only">Controls the transparency of the pixelated grid overlay. 0% is fully transparent, 100% is fully opaque.</p>
            </>
          )}
          {!hasPixelGrid && (
            <p className={`text-xs ${labelColor}`}>Pixel grid not yet available for these options.</p>
          )}
        </div>
      )}
    </div>
  );
};


interface RightPanelProps {
  mapData: MapData | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  activePoiIdForMapHighlight: string | null; 
  onPixelGridClick: (x: number, y: number) => void; 
  placingPoiId: string | null; 
  isLeftPanelCollapsed: boolean;
  onToggleLeftPanel: () => void;
  isRightPanelFullscreen: boolean;
  onToggleFullscreen: () => void;
  showOriginalOverlay: boolean;
  setShowOriginalOverlay: (show: boolean) => void;
  pixelGridOpacity: number;
  setPixelGridOpacity: (opacity: number) => void;
}

type RightPanelComponentType = React.FC<RightPanelProps>;
interface RightPanelWithControls extends RightPanelComponentType {
  Controls: React.FC<RightPanelControlsProps>;
}

const RightPanelBase: RightPanelComponentType = ({
  mapData, isLoading, loadingMessage, error, 
  activePoiIdForMapHighlight, onPixelGridClick, placingPoiId,
  isLeftPanelCollapsed, onToggleLeftPanel, isRightPanelFullscreen, onToggleFullscreen, 
  showOriginalOverlay, setShowOriginalOverlay, pixelGridOpacity, setPixelGridOpacity
}) => {
  
  const panelBaseClasses = "flex-grow flex flex-col overflow-hidden transition-all duration-300 ease-in-out";
  const panelPadding = isRightPanelFullscreen ? "p-0 sm:p-0 md:p-0" : "p-2 sm:p-3 md:p-4";
  const panelBg = isRightPanelFullscreen ? "bg-black" : "bg-white/40 backdrop-blur-sm"; /* Lighter, translucent for non-fullscreen */

  const isLoadingPixelGridOnly = isLoading && mapData?.imageUrl && !mapData?.pixelGrid; 

  return (
    <section className={`${panelBaseClasses} ${panelBg} ${panelPadding}`} aria-label="Map Display Area">
      <div className={`flex-shrink-0 flex justify-between items-center mb-2 ${isRightPanelFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center">
           <button
            onClick={onToggleLeftPanel}
            className="p-1.5 text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full mr-2 hidden md:block"
            title={isLeftPanelCollapsed ? "Show Controls" : "Hide Controls"}
            aria-expanded={!isLeftPanelCollapsed}
            aria-controls="left-panel-content"
           >
            <span className={`block w-5 h-5 ${isLeftPanelCollapsed ? 'icon-arrow-right-double' : 'icon-arrow-left-double'}`}></span>
          </button>
        </div>
        {!isRightPanelFullscreen && (
          <RightPanelScreenControls 
            isLeftPanelCollapsed={isLeftPanelCollapsed}
            onToggleLeftPanel={onToggleLeftPanel}
            isRightPanelFullscreen={isRightPanelFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            showCollapseToggle={true} 
          />
        )}
      </div>

      {isLoading && <div className="flex-grow flex items-center justify-center"><LoadingSpinner message={loadingMessage} /></div>}
      {error && !isLoading && <div className="my-2"><ErrorDisplay message={error} /></div>}
      
      {mapData && !isLoading && ( 
        <div className="flex-grow flex flex-col overflow-hidden min-h-0">
          {!isRightPanelFullscreen && (
            <>
              <div className="flex-shrink-0 text-center mb-1 sm:mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-700 font-serif" title={mapData.title}>{mapData.title}</h2>
                {mapData.mapType && mapData.usedTheme && (
                  <p className="text-xs sm:text-sm text-stone-500 italic">
                    A '{mapData.mapType}' map. Theme: "{mapData.usedTheme?.length > 40 ? mapData.usedTheme.substring(0,37) + '...' : mapData.usedTheme }"
                  </p>
                )}
              </div>
              <MapDisplayOverlayControls
                showOriginalOverlay={showOriginalOverlay}
                setShowOriginalOverlay={setShowOriginalOverlay}
                pixelGridOpacity={pixelGridOpacity}
                setPixelGridOpacity={setPixelGridOpacity}
                isOverlayMode={false}
                hasPixelGrid={!!mapData.pixelGrid}
              />
            </>
          )}

          <div className={`relative my-1 sm:my-2 flex justify-center items-center
            ${isRightPanelFullscreen ? 'flex-grow h-full w-full' : 'w-full max-w-[300px] h-[300px] sm:max-w-[400px] sm:h-[400px] mx-auto'}`}>
            <MapDisplay 
              mapData={mapData} 
              activePoiId={activePoiIdForMapHighlight} 
              onPixelClick={onPixelGridClick} 
              placingPoiId={placingPoiId} 
              isLoadingPixelGrid={isLoadingPixelGridOnly}
              showOriginalOverlay={showOriginalOverlay}
              pixelGridOpacity={pixelGridOpacity}
              className={"w-full h-full"} 
            />
             {isRightPanelFullscreen && mapData && (
              <MapDisplayOverlayControls
                showOriginalOverlay={showOriginalOverlay}
                setShowOriginalOverlay={setShowOriginalOverlay}
                pixelGridOpacity={pixelGridOpacity}
                setPixelGridOpacity={setPixelGridOpacity}
                isOverlayMode={true}
                hasPixelGrid={!!mapData.pixelGrid}
              />
            )}
          </div>
          
        </div>
      )}
      {!mapData && !isLoading && !error && (
        <div className="flex-grow flex flex-col items-center justify-center text-stone-500 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-amber-400/70 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v2.25m0-2.25h1.5m-1.5 0H8.25m0 0H6.75m0 0H5.25m0 0H3.75m0 0V7.5A2.25 2.25 0 0 1 6 5.25h12A2.25 2.25 0 0 1 20.25 7.5v7.5m0 0H18.75m0 0H17.25m0 0H15.75m0 0H14.25m0 0h-1.5m0 0H11.25m0 0H9.75m0 0H8.25m0 0H6.75m3-3.75h3.75M14.25 9h3.75M3.75 15h3.75M3.75 18h3.75m0 0h3.75m0 0h3.75m0 0h3.75M12 12v3.75m0 0H9.75M12 15.75H14.25" />
          </svg>
          <h3 className="text-2xl font-serif text-amber-600 mb-2">Welcome, Cartographer!</h3>
          <p className="max-w-md">
            Use the controls on the left to describe your world and generate a unique fantasy map.
          </p>
        </div>
      )}
    </section>
  );
};

export const RightPanel = RightPanelBase as RightPanelWithControls;
RightPanel.Controls = RightPanelScreenControls;