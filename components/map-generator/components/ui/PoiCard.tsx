
import React from 'react';
import { Place } from '../../types';

interface PoiCardProps {
  poi: Place;
  onSelect: (poi: Place) => void; 
  isPlacing: boolean; 
  isPlaced: boolean; 
  isActive: boolean; 
  isLoadingAction?: boolean;
  canPlace: boolean; // New prop: true if map image is generated
}

export const PoiCard: React.FC<PoiCardProps> = ({ 
  poi, onSelect, isPlacing, isPlaced, isActive, isLoadingAction, canPlace
}) => {
  const baseClasses = "p-3 rounded-lg shadow-sm border transition-all duration-150 ease-in-out";
  const interactionClasses = canPlace ? "cursor-pointer hover:bg-amber-50" : "cursor-default";
  const selectedClasses = isActive ? "bg-amber-200 border-amber-500 ring-2 ring-amber-500" : "bg-white border-amber-300";
  const placingClasses = isPlacing ? "bg-blue-100 border-blue-400 ring-2 ring-blue-400" : "";

  const handleClick = () => {
    if (isLoadingAction) return;
    // Allow selection for viewing details even if cannot place yet.
    // Placement itself is gated in App.tsx by checking mapData.pixelGrid.
    onSelect(poi);
  };

  let statusText = "";
  let statusColor = "";

  if (isPlacing) {
    statusText = "Click on map to place";
    statusColor = "text-blue-600";
  } else if (isPlaced) {
    statusText = "Placed on map";
    statusColor = "text-green-600";
  } else if (canPlace) {
    statusText = "Ready to place";
    statusColor = "text-amber-600";
  } else {
    statusText = "Awaiting map image";
    statusColor = "text-stone-500";
  }


  return (
    <div 
      className={`${baseClasses} ${placingClasses || selectedClasses} ${interactionClasses}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick();}}
      aria-pressed={isActive || isPlacing}
      aria-label={`Point of Interest: ${poi.name}. Status: ${statusText}. Click to ${isPlaced && !isActive ? 'view details' : isPlaced && isActive ? 'deselect' : canPlace ? 'place on map' : 'view details'}.`}
    >
      <h4 className="text-md font-semibold text-stone-800 truncate">{poi.name}</h4>
      <p className="text-xs text-stone-600 mt-1 line-clamp-2">{poi.description}</p>
      <div className={`mt-2 text-xs font-semibold ${statusColor}`}>
        {statusText}
      </div>
    </div>
  );
};
