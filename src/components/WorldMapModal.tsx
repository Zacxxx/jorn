import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal';
import ActionButton from '../../ui/ActionButton';
import { Player, Location } from '../types';
import { getLocation, getAllLocations, getAccessibleLocations, getTravelTime, updateLocationDiscovery } from '../services/locationService';
import { getBiomeForLocation, getEnvironmentalEffects } from '../data/biomes';
import { MapIcon, ClockIcon, SkullIcon, TreasureIcon, HomeIcon, BuildingIcon, EyeIcon, LockIcon } from './IconComponents';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onTravelToLocation: (locationId: string) => void;
  onStartCombat: (locationId: string) => void;
}

const WorldMapModal: React.FC<WorldMapModalProps> = ({ 
  isOpen, 
  onClose, 
  player, 
  onTravelToLocation,
  onStartCombat 
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(player.currentLocationId);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterType, setFilterType] = useState<'all' | 'discovered' | 'accessible'>('all');

  const currentLocation = getLocation(player.currentLocationId);
  const selectedLocation = selectedLocationId ? getLocation(selectedLocationId) : null;
  const selectedBiome = selectedLocationId ? getBiomeForLocation(selectedLocationId) : null;
  const allLocations = getAllLocations();
  const accessibleLocations = getAccessibleLocations(player.currentLocationId);

  // Filter locations based on current filter
  const filteredLocations = useMemo(() => {
    switch (filterType) {
      case 'discovered':
        return allLocations.filter(loc => loc.discovered);
      case 'accessible':
        return accessibleLocations;
      case 'all':
      default:
        return allLocations;
    }
  }, [allLocations, accessibleLocations, filterType]);

  const getDangerLevelColor = (dangerLevel: number) => {
    if (dangerLevel <= 2) return 'text-green-400';
    if (dangerLevel <= 4) return 'text-yellow-400';
    if (dangerLevel <= 6) return 'text-orange-400';
    if (dangerLevel <= 8) return 'text-red-400';
    return 'text-purple-400';
  };

  const getLocationTypeIcon = (location: Location) => {
    switch (location.type) {
      case 'settlement': return <BuildingIcon className="w-4 h-4" />;
      case 'dungeon': return <SkullIcon className="w-4 h-4" />;
      case 'landmark': return <TreasureIcon className="w-4 h-4" />;
      case 'wilderness': 
      default: return <MapIcon className="w-4 h-4" />;
    }
  };

  const handleTravelToLocation = () => {
    if (selectedLocationId && selectedLocationId !== player.currentLocationId) {
      // Mark as discovered if not already
      if (selectedLocation && !selectedLocation.discovered) {
        updateLocationDiscovery(selectedLocationId, true);
      }
      onTravelToLocation(selectedLocationId);
      onClose();
    }
  };

  const handleStartCombatAtLocation = () => {
    if (selectedLocationId) {
      onStartCombat(selectedLocationId);
      onClose();
    }
  };

  const isAccessible = (locationId: string) => {
    return accessibleLocations.some(loc => loc.id === locationId);
  };

  const travelTime = selectedLocationId && selectedLocationId !== player.currentLocationId 
    ? getTravelTime(player.currentLocationId, selectedLocationId) 
    : 0;

  const environmentalEffects = selectedLocationId ? getEnvironmentalEffects(selectedLocationId) : [];

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="World Map" 
      size="xl"
      className="max-w-7xl"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <HomeIcon className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-sm text-slate-400">Current Location:</span>
              <span className="ml-2 text-slate-200 font-medium">
                {currentLocation?.name || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                List View
              </button>
            </div>
            
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-slate-200"
            >
              <option value="all">All Locations</option>
              <option value="discovered">Discovered</option>
              <option value="accessible">Accessible</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location List/Map */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <MapIcon className="w-5 h-5 mr-2 text-blue-400" />
                {viewMode === 'map' ? 'World Map' : 'Location List'}
                <span className="ml-2 text-sm text-slate-400">
                  ({filteredLocations.length} locations)
                </span>
              </h3>
              
              {viewMode === 'map' ? (
                // Map View - Interactive Grid
                <div className="grid grid-cols-4 gap-3 min-h-[400px]">
                  {filteredLocations.map((location) => {
                    const isSelected = selectedLocationId === location.id;
                    const isCurrent = player.currentLocationId === location.id;
                    const isLocationAccessible = isAccessible(location.id);
                    const biome = getBiomeForLocation(location.id);
                    
                    return (
                      <div
                        key={location.id}
                        onClick={() => setSelectedLocationId(location.id)}
                        className={`
                          relative p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-blue-400 bg-blue-900/30' 
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }
                          ${isCurrent ? 'ring-2 ring-green-400' : ''}
                          ${!location.discovered ? 'opacity-60' : ''}
                        `}
                      >
                        {/* Location Status Indicators */}
                        <div className="absolute top-1 right-1 flex space-x-1">
                          {isCurrent && (
                            <div className="w-2 h-2 bg-green-400 rounded-full" title="Current Location" />
                          )}
                          {!location.discovered ? (
                            <LockIcon className="w-3 h-3 text-slate-400" title="Undiscovered" />
                          ) : (
                            <EyeIcon className="w-3 h-3 text-slate-400" title="Discovered" />
                          )}
                          {!isLocationAccessible && (
                            <div className="w-2 h-2 bg-red-400 rounded-full" title="Not Accessible" />
                          )}
                        </div>
                        
                        {/* Location Icon & Type */}
                        <div className="flex items-center mb-2">
                          {getLocationTypeIcon(location)}
                          <span className="ml-2 text-xs text-slate-400">
                            {location.type}
                          </span>
                        </div>
                        
                        {/* Location Name */}
                        <div className="text-sm font-medium text-slate-200 mb-1">
                          {location.name}
                        </div>
                        
                        {/* Danger Level */}
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${getDangerLevelColor(location.dangerLevel)}`}>
                            Danger: {location.dangerLevel}
                          </span>
                          {biome && (
                            <span className="text-slate-400">
                              {biome.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // List View
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredLocations.map((location) => {
                    const isSelected = selectedLocationId === location.id;
                    const isCurrent = player.currentLocationId === location.id;
                    const isLocationAccessible = isAccessible(location.id);
                    const biome = getBiomeForLocation(location.id);
                    
                    return (
                      <div
                        key={location.id}
                        onClick={() => setSelectedLocationId(location.id)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-blue-400 bg-blue-900/20' 
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                          }
                          ${isCurrent ? 'ring-1 ring-green-400' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getLocationTypeIcon(location)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-200">{location.name}</span>
                                {isCurrent && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                                {!location.discovered && (
                                  <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">
                                    Undiscovered
                                  </span>
                                )}
                                {!isLocationAccessible && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                                    Inaccessible
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-400 mt-1">
                                {location.type} • Danger Level {location.dangerLevel}
                                {biome && ` • ${biome.name}`}
                              </div>
                            </div>
                          </div>
                          
                          {selectedLocationId === location.id && selectedLocationId !== player.currentLocationId && (
                            <div className="text-sm text-slate-400">
                              {getTravelTime(player.currentLocationId, location.id)}h travel
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Location Details Panel */}
          <div className="space-y-4">
            {selectedLocation ? (
              <>
                {/* Location Info */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center">
                      {getLocationTypeIcon(selectedLocation)}
                      <span className="ml-2">{selectedLocation.name}</span>
                    </h3>
                    <span className={`text-sm font-medium ${getDangerLevelColor(selectedLocation.dangerLevel)}`}>
                      Danger: {selectedLocation.dangerLevel}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-3">
                    {selectedLocation.description}
                  </p>
                  
                  {selectedBiome && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">Biome: {selectedBiome.name}</h4>
                      <p className="text-xs text-slate-400">{selectedBiome.theme}</p>
                    </div>
                  )}

                  {/* Travel Info */}
                  {selectedLocationId !== player.currentLocationId && (
                    <div className="border-t border-slate-600 pt-3 mt-3">
                      <div className="flex items-center text-sm text-slate-400 mb-2">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Travel Time: {travelTime}h
                      </div>
                      {!isAccessible(selectedLocationId!) && (
                        <div className="text-xs text-red-400 mb-2">
                          ⚠️ Not directly accessible from current location
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settlement Info */}
                  {selectedLocation.settlement && (
                    <div className="border-t border-slate-600 pt-3 mt-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Settlement Services</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>Shops: {selectedLocation.settlement.shops.length}</div>
                        <div>Taverns: {selectedLocation.settlement.taverns.length}</div>
                        <div>NPCs: {selectedLocation.settlement.npcs.length}</div>
                        <div>Population: {selectedLocation.settlement.population.toLocaleString()}</div>
                      </div>
                    </div>
                  )}

                  {/* Environmental Effects */}
                  {environmentalEffects.length > 0 && (
                    <div className="border-t border-slate-600 pt-3 mt-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Environmental Effects</h4>
                      <div className="space-y-1">
                        {environmentalEffects.map((effect, idx) => (
                          <div key={idx} className="text-xs text-slate-400">
                            • {effect}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Biome Monsters Preview */}
                  {selectedBiome && (
                    <div className="border-t border-slate-600 pt-3 mt-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Local Creatures</h4>
                      <div className="space-y-1">
                        {selectedBiome.monsters.slice(0, 3).map((monster, idx) => (
                          <div key={idx} className="text-xs text-slate-400">
                            • {monster.name} (Lvl {monster.level.min}-{monster.level.max})
                          </div>
                        ))}
                        {selectedBiome.monsters.length > 3 && (
                          <div className="text-xs text-slate-500">
                            ...and {selectedBiome.monsters.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {selectedLocationId === player.currentLocationId ? (
                    <ActionButton
                      onClick={handleStartCombatAtLocation}
                      variant="danger"
                      icon={<SkullIcon />}
                      className="w-full"
                    >
                      Seek Battle Here
                    </ActionButton>
                  ) : (
                    <>
                      <ActionButton
                        onClick={handleTravelToLocation}
                        variant="success"
                        icon={<MapIcon />}
                        className="w-full"
                        disabled={!isAccessible(selectedLocationId!)}
                      >
                        {isAccessible(selectedLocationId!) ? 'Travel Here' : 'Not Accessible'}
                      </ActionButton>
                      
                      {isAccessible(selectedLocationId!) && (
                        <ActionButton
                          onClick={handleStartCombatAtLocation}
                          variant="warning"
                          icon={<SkullIcon />}
                          className="w-full"
                        >
                          Travel & Battle
                        </ActionButton>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="text-center text-slate-400">
                  <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a location to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/30 rounded-lg p-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-200 mb-2">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Current Location
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-3 h-3 mr-2" />
              Discovered
            </div>
            <div className="flex items-center">
              <LockIcon className="w-3 h-3 mr-2" />
              Undiscovered
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              Not Accessible
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WorldMapModal; 