
import React from 'react';
import ActionButton from './ActionButton';
import { Player } from '../../types';
import { MapIcon } from './IconComponents';

interface MapViewProps {
  player: Player;
  onReturnHome: () => void;
  onShowMessage: (title: string, message: string) => void;
  // Add more props as the map functionality grows, e.g., discovered locations, event handlers
}

const MapView: React.FC<MapViewProps> = ({ player, onReturnHome, onShowMessage }) => {
  
  // Placeholder for map regions/locations
  const mapLocations = [
    { id: 'forest', name: 'Whispering Woods', description: 'A dense forest, rumored to hold ancient secrets and dangerous beasts.', discovered: true },
    { id: 'mountains', name: 'Dragonspine Peaks', description: 'Treacherous mountains, home to rare minerals and territorial griffins.', discovered: false },
    { id: 'ruins', name: 'Sunken City of Eldoria', description: 'The flooded ruins of an ancient civilization, now teeming with aquatic life and forgotten magic.', discovered: false },
  ];

  const handleLocationClick = (locationId: string) => {
    const location = mapLocations.find(loc => loc.id === locationId);
    if (location) {
        if (location.discovered) {
            onShowMessage(location.name, `You are exploring ${location.name}. (Exploration events and interactions coming soon!)`);
        } else {
            onShowMessage("Undiscovered", "This area is shrouded in mystery. You must find a way to reveal it first. (Discovery mechanic coming soon!)");
        }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-slate-100">
      <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6 text-center flex items-center justify-center" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        <MapIcon className="w-8 h-8 mr-3 text-green-400" />
        World Map
      </h2>
      
      <p className="text-sm text-slate-300 mb-6 text-center">
        Welcome, {player.name}. The world of Jorn awaits. Click on a location to learn more or interact.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mapLocations.map(loc => (
          <button
            key={loc.id}
            onClick={() => handleLocationClick(loc.id)}
            className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-150 transform hover:scale-105
                        ${loc.discovered 
                            ? 'bg-green-700/60 border-green-500/80 hover:bg-green-600/70 hover:border-green-400' 
                            : 'bg-slate-700/70 border-slate-600/80 hover:bg-slate-600/70 hover:border-slate-500 cursor-not-allowed opacity-70'}`}
            disabled={!loc.discovered && false} // Can disable undiscovered later, for now allow click for message
          >
            <h3 className={`text-lg font-semibold mb-1 ${loc.discovered ? 'text-green-200' : 'text-slate-400'}`}>{loc.name}</h3>
            <p className={`text-xs ${loc.discovered ? 'text-green-100/90' : 'text-slate-500'}`}>{loc.description}</p>
            {!loc.discovered && <p className="text-[0.65rem] mt-2 text-center text-yellow-400/80 italic">(Undiscovered)</p>}
          </button>
        ))}
      </div>

      {/* Placeholder for actual map visuals - could be an SVG, a canvas, or tile-based */}
      <div className="my-6 p-4 bg-slate-700/50 rounded-md border border-slate-600 text-center text-slate-400 italic">
        Interactive map visuals will be implemented here.
      </div>

      <div className="mt-8 text-center">
        <ActionButton onClick={onReturnHome} variant="secondary" size="lg">
          Return to Home
        </ActionButton>
      </div>
    </div>
  );
};

export default MapView;
