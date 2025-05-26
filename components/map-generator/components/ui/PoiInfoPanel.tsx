
import React from 'react';
import { Place } from '../../types';

interface PoiInfoPanelProps {
  poi: Place;
  onClearSelection: () => void;
  onGenerateSubMap: (poiId: string) => void; // New prop for sub-map
  canGenerateSubMap: boolean; // To enable/disable the button
}

const Section: React.FC<{title: string; content?: string; children?: React.ReactNode }> = ({ title, content, children }) => {
  if (!content && !children) return null;
  return (
    <div className="mt-3">
      <h4 className="text-md font-semibold text-amber-600 font-serif mb-1">{title}</h4>
      {content && <p className="whitespace-pre-wrap text-sm">{content}</p>}
      {children}
    </div>
  );
};


export const PoiInfoPanel: React.FC<PoiInfoPanelProps> = ({ poi, onClearSelection, onGenerateSubMap, canGenerateSubMap }) => {
  return (
    <div className="p-4 space-y-4 h-full flex flex-col bg-amber-50">
      <div className="flex-shrink-0">
        <button
          onClick={onClearSelection}
          className="flex items-center text-sm text-amber-700 hover:text-amber-900 font-semibold mb-3 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-amber-100"
        >
          <span className="icon-back-arrow w-5 h-5 mr-2"></span>
          Back to Main Controls
        </button>
        <h3 className="text-2xl font-bold text-amber-700 font-serif truncate" title={poi.name}>
          {poi.name}
        </h3>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar-thin pr-2 text-stone-700 text-sm leading-relaxed">
        <Section title="Overview">
           <p className="whitespace-pre-wrap">{poi.description}</p>
        </Section>
        
        <Section title="Significance" content={poi.significance} />
        <Section title="Rumors & Legends" content={poi.rumors_legends} />
        <Section title="Potential Discoveries" content={poi.potential_discoveries} />

        <div className="mt-4 pt-3 border-t border-amber-200">
            {typeof poi.gridX === 'number' && typeof poi.gridY === 'number' ? (
                 <p className="text-xs text-green-600 font-semibold">This POI is placed on the map at ({poi.gridX}, {poi.gridY}).</p>
            ) : (
                 <p className="text-xs text-blue-600 font-semibold">This POI is not yet placed. Select it from the list and click on the map (after map image generation).</p>
            )}
        </div>

        {/* Placeholder for Sub-Map Generation */}
        {canGenerateSubMap && (
            <div className="mt-4 pt-3 border-t border-amber-200">
                <button
                    onClick={() => onGenerateSubMap(poi.id)}
                    disabled // Feature not fully implemented yet
                    className="w-full px-3 py-2 text-xs font-medium rounded-md shadow-sm text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-300 disabled:cursor-not-allowed"
                    title="Generate a detailed sub-map for this Point of Interest (Coming Soon)"
                >
                    Generate Detailed Map for "{poi.name.substring(0,20)}..." (Soon)
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
