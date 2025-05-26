
import React, { useState } from 'react';
import { MapData, Place } from '../../types';
import { PixelGridDisplay } from './PixelGridDisplay';

interface MapDisplayProps {
  mapData: MapData;
  activePoiId: string | null; 
  onPixelClick: (x: number, y: number) => void; 
  placingPoiId: string | null; 
  className?: string; 
  isLoadingPixelGrid?: boolean;
  showOriginalOverlay: boolean;
  pixelGridOpacity: number;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapData, 
  activePoiId, 
  onPixelClick, 
  placingPoiId, 
  className, 
  isLoadingPixelGrid,
  showOriginalOverlay,
  pixelGridOpacity
}) => {
  const [hoveredPixel, setHoveredPixel] = useState<{x: number, y: number} | null>(null);

  const aspectRatioStyle: React.CSSProperties = (mapData.imageOriginalWidth && mapData.imageOriginalHeight && mapData.imageOriginalHeight > 0) 
    ? { aspectRatio: `${mapData.imageOriginalWidth} / ${mapData.imageOriginalHeight}` }
    // if image is loaded but pixel grid isn't, and no original dimensions yet, use 1:1 as fallback
    : mapData.imageUrl ? { aspectRatio: '1 / 1' } 
    : { aspectRatio: '1 / 1' }; // Default for placeholder

  return (
    <div 
      className={`relative rounded-md overflow-hidden shadow-inner bg-black ${className || ''}`} 
      style={aspectRatioStyle} 
    >
      {mapData.imageUrl && (
        <img 
          src={mapData.imageUrl} 
          alt={showOriginalOverlay ? `Original map background for "${mapData.title}"` : `Fantasy map titled "${mapData.title}"`}
          className="absolute top-0 left-0 w-full h-full object-contain display-block pointer-events-none" 
          style={{ 
            display: (showOriginalOverlay || (!mapData.pixelGrid && !isLoadingPixelGrid)) ? 'block' : 'none', 
            zIndex: (showOriginalOverlay || (!mapData.pixelGrid && !isLoadingPixelGrid)) ? 0 : -1 
          }}
        />
      )}
      {mapData.pixelGrid && mapData.pixelGridWidth && mapData.pixelGridHeight && mapData.imageOriginalWidth && mapData.imageOriginalHeight ? (
        <PixelGridDisplay
          pixelGrid={mapData.pixelGrid}
          gridDataWidth={mapData.pixelGridWidth}
          gridDataHeight={mapData.pixelGridHeight}
          imageOriginalWidth={mapData.imageOriginalWidth}
          imageOriginalHeight={mapData.imageOriginalHeight}
          pois={mapData.places} 
          onPixelClick={onPixelClick} 
          activePoiId={activePoiId} 
          placingPoiId={placingPoiId} 
          hoveredPixel={hoveredPixel}
          onPixelHover={setHoveredPixel}
          isLoading={isLoadingPixelGrid}
          pixelGridOpacity={pixelGridOpacity} 
          style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      ) : !mapData.imageUrl && !isLoadingPixelGrid && (
        <div className="w-full h-full flex justify-center items-center bg-amber-200/50 text-stone-600 p-4 text-center">
            Map image and pixel grid will appear here once generated.
        </div>
      )}
      {isLoadingPixelGrid && ( 
         <div className="absolute inset-0 w-full h-full flex justify-center items-center bg-amber-100/80 text-stone-700 z-10 text-lg font-medium">
            Processing pixel grid...
        </div>
      )}
      <style>{`
        .display-block { display: block; }
      `}</style>
    </div>
  );
};
