import React from 'react';
import { PointOfInterestProperties } from '../../types'; // Adjusted path
import { GetSpellIcon } from '../IconComponents'; // Adjusted path

interface WorldMapCardProps {
  pointOfInterest: PointOfInterestProperties;
}

const WorldMapCard: React.FC<WorldMapCardProps> = ({ pointOfInterest }) => {
  if (!pointOfInterest) return null;

  return (
    <div className="absolute z-10 p-3 bg-slate-800/95 text-white rounded-lg shadow-xl border border-sky-500/70 backdrop-blur-sm w-64 text-sm">
      <h3 className="text-md font-bold text-sky-300 mb-1.5 border-b border-slate-600 pb-1">{pointOfInterest.name}</h3>
      <p className="text-xs text-slate-300 italic mb-1">{pointOfInterest.description.substring(0, 100)}{pointOfInterest.description.length > 100 ? '...' : ''}</p>
      <p className="text-xs"><span className="font-semibold text-slate-400">Biome:</span> {pointOfInterest.biome}</p>
      <p className="text-xs"><span className="font-semibold text-slate-400">NPCs:</span> {pointOfInterest.numberOfNPCs}</p>
      {pointOfInterest.pointOfInterest && 
        <p className="text-xs mt-1 pt-1 border-t border-slate-700"><span className="font-semibold text-slate-400">Notable Feature:</span> {pointOfInterest.pointOfInterest}</p>
      }
      <p className={`text-xs mt-1 ${pointOfInterest.explored ? 'text-green-400' : 'text-yellow-400'}`}>
        {pointOfInterest.explored ? 'Explored' : 'Unexplored'}
      </p>
      {/* Add more details as needed, e.g., difficulty, primary resources */}
    </div>
  );
};

export default WorldMapCard; 