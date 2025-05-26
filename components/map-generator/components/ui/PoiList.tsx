
import React from 'react';
import { Place } from '../../types';
import { PoiCard } from './PoiCard';

interface PoiListProps {
  places: Place[];
  activePoiId: string | null; 
  onPoiSelect: (place: Place) => void; 
  placingPoiId: string | null; 
  isLoading: boolean; 
  mapGenerated: boolean; // New prop: true if map image/pixel grid exists
}

export const PoiList: React.FC<PoiListProps> = ({
  places,
  activePoiId,
  onPoiSelect,
  placingPoiId,
  isLoading,
  mapGenerated
}) => {
  if (isLoading && (!places || places.length === 0)) { // Show loading only if list is empty
    return (
      <div className="p-3 mt-4 text-center text-sm text-stone-500 bg-amber-50 rounded-md border border-amber-200">
        Loading POIs...
      </div>
    );
  }
  if (!places || places.length === 0) {
      return (
         <div className="p-3 mt-4 text-center text-sm text-stone-500 bg-amber-50 rounded-md border border-amber-200">
            No points of interest generated for this area yet.
        </div>
      );
  }


  const unplacedPoisExist = places.some(p => typeof p.gridX !== 'number' || typeof p.gridY !== 'number');
  let titleText = "Points of Interest";
  if (!mapGenerated) {
    titleText += " (Generate map image to place)";
  } else if (placingPoiId) {
    titleText += " (Click on map to place)";
  } else if (unplacedPoisExist) {
    titleText += " (Select to place or view)";
  } else {
    titleText += " (All placed - Select to view)";
  }


  return (
    <div className="bg-amber-50/80 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-inner border border-amber-300/60 mt-1">
      <h3 className="text-sm sm:text-md font-semibold text-stone-700 mb-2 text-center">
        {titleText}
      </h3>
      <div className="space-y-2 max-h-60 md:max-h-72 lg:max-h-80 overflow-y-auto custom-scrollbar-thin pr-1">
        {places.map(place => (
          <PoiCard
            key={place.id}
            poi={place}
            onSelect={onPoiSelect}
            isPlacing={placingPoiId === place.id}
            isPlaced={typeof place.gridX === 'number' && typeof place.gridY === 'number'}
            isActive={activePoiId === place.id && !placingPoiId} 
            canPlace={mapGenerated} // Can only place if map image is generated
          />
        ))}
      </div>
       {mapGenerated && places.length > 0 && !unplacedPoisExist && !placingPoiId && (
        <p className="text-xs text-center text-green-600 mt-2">All POIs placed! Select any to view details.</p>
      )}
      {!mapGenerated && places.length > 0 && (
        <p className="text-xs text-center text-amber-700 mt-2">Generate the map image to start placing your POIs.</p>
      )}
    </div>
  );
};
