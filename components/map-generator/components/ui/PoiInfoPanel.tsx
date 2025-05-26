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
      <h4 className="text-md font-semibold text-emerald-400 font-['Inter_Tight',_sans-serif] mb-1">{title}</h4>
      {content && <p className="whitespace-pre-wrap text-sm text-slate-300">{content}</p>}
      {children}
    </div>
  );
};


export const PoiInfoPanel: React.FC<PoiInfoPanelProps> = ({ poi, onClearSelection, onGenerateSubMap, canGenerateSubMap }) => {
  return (
    <div className="p-3 space-y-3 h-full flex flex-col bg-slate-800/70 text-slate-200 rounded-md">
      <div className="flex-shrink-0">
        <button
          onClick={onClearSelection}
          className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 font-semibold mb-2 p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-slate-700"
        >
          <span className="icon-back-arrow w-5 h-5 mr-1.5"></span>
          Back to Controls
        </button>
        <h3 className="text-xl font-bold text-emerald-300 font-['Inter_Tight',_sans-serif] truncate" title={poi.name}>
          {poi.name}
        </h3>
      </div>

      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-750 pr-2 text-slate-300 text-sm leading-relaxed">
        <Section title="Overview">
           <p className="whitespace-pre-wrap">{poi.description}</p>
        </Section>
        
        <Section title="Significance" content={poi.significance} />
        <Section title="Rumors & Legends" content={poi.rumors_legends} />
        <Section title="Potential Discoveries" content={poi.potential_discoveries} />

        <div className="mt-3 pt-3 border-t border-slate-600/70">
            {typeof poi.gridX === 'number' && typeof poi.gridY === 'number' ? (
                 <p className="text-xs text-green-400 font-semibold">This POI is placed on the map at ({poi.gridX}, {poi.gridY}).</p>
            ) : (
                 <p className="text-xs text-sky-400 font-semibold">This POI is not yet placed. Select it from the list and click on the map (after map image generation).</p>
            )}
        </div>

        {/* Placeholder for Sub-Map Generation */}
        {canGenerateSubMap && (
            <div className="mt-3 pt-3 border-t border-slate-600/70">
                <button
                    onClick={() => onGenerateSubMap(poi.id)}
                    disabled // Feature not fully implemented yet
                    className="w-full px-3 py-2 text-xs font-medium rounded-md shadow-sm text-slate-400 bg-slate-600 border border-slate-500 disabled:cursor-not-allowed"
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
