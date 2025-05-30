import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal';
import ActionButton from '../../ui/ActionButton';
import { Player, Location } from '../types';
import { getAllLocations, getDiscoveredLocations } from '../services/locationService';
import { getBiomeForLocation, BIOMES } from '../data/biomes';
import { BookIcon, MapIcon, SkullIcon, TrophyIcon, BuildingIcon, EyeIcon, ClockIcon, TreasureIcon } from './IconComponents';

interface ExplorationJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
}

const ExplorationJournalModal: React.FC<ExplorationJournalModalProps> = ({ 
  isOpen, 
  onClose, 
  player 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'bestiary' | 'achievements'>('overview');

  const allLocations = getAllLocations();
  const discoveredLocations = getDiscoveredLocations();
  const explorationProgress = discoveredLocations.length / allLocations.length;

  // Group locations by biome
  const locationsByBiome = useMemo(() => {
    const grouped: Record<string, Location[]> = {};
    
    discoveredLocations.forEach(location => {
      const biome = getBiomeForLocation(location.id);
      const biomeName = biome ? biome.name : 'Unknown Biome';
      
      if (!grouped[biomeName]) {
        grouped[biomeName] = [];
      }
      grouped[biomeName].push(location);
    });
    
    return grouped;
  }, [discoveredLocations]);

  // Bestiary statistics
  const bestiaryStats = useMemo(() => {
    const totalDefeated = Object.values(player.bestiary).reduce((sum, entry) => sum + entry.vanquishedCount, 0);
    const uniqueSpecies = Object.keys(player.bestiary).length;
    const elite = Object.values(player.bestiary).filter(entry => entry.name.includes('Elite') || entry.name.includes('Ancient')).length;
    
    return {
      totalDefeated,
      uniqueSpecies,
      elite
    };
  }, [player.bestiary]);

  // Exploration achievements
  const achievements = useMemo(() => {
    const results = [];
    
    // Location-based achievements
    if (discoveredLocations.length >= 1) results.push({ name: 'First Steps', description: 'Discover your first location', completed: true });
    if (discoveredLocations.length >= 3) results.push({ name: 'Wanderer', description: 'Discover 3 locations', completed: true });
    if (discoveredLocations.length >= 5) results.push({ name: 'Explorer', description: 'Discover 5 locations', completed: true });
    if (discoveredLocations.length >= allLocations.length) results.push({ name: 'World Traveler', description: 'Discover all locations', completed: true });
    
    // Biome achievements
    const biomeCount = Object.keys(locationsByBiome).length;
    if (biomeCount >= 2) results.push({ name: 'Biome Explorer', description: 'Visit 2 different biomes', completed: true });
    if (biomeCount >= 4) results.push({ name: 'Ecosystem Master', description: 'Visit 4 different biomes', completed: true });
    
    // Combat achievements
    if (bestiaryStats.totalDefeated >= 10) results.push({ name: 'Monster Hunter', description: 'Defeat 10 creatures', completed: true });
    if (bestiaryStats.totalDefeated >= 50) results.push({ name: 'Beast Slayer', description: 'Defeat 50 creatures', completed: true });
    if (bestiaryStats.uniqueSpecies >= 5) results.push({ name: 'Naturalist', description: 'Encounter 5 different species', completed: true });
    if (bestiaryStats.elite >= 1) results.push({ name: 'Elite Hunter', description: 'Defeat an elite creature', completed: true });
    
    // Settlement achievements
    const visitedSettlements = discoveredLocations.filter(loc => loc.type === 'settlement').length;
    if (visitedSettlements >= 1) results.push({ name: 'Civilized', description: 'Visit a settlement', completed: true });
    if (visitedSettlements >= 2) results.push({ name: 'Diplomat', description: 'Visit multiple settlements', completed: true });
    
    return results;
  }, [discoveredLocations, allLocations.length, locationsByBiome, bestiaryStats]);

  const getLocationTypeIcon = (location: Location) => {
    switch (location.type) {
      case 'settlement': return <BuildingIcon className="w-4 h-4" />;
      case 'dungeon': return <SkullIcon className="w-4 h-4" />;
      case 'landmark': return <TreasureIcon className="w-4 h-4" />;
      case 'wilderness': 
      default: return <MapIcon className="w-4 h-4" />;
    }
  };

  const getDangerLevelColor = (dangerLevel: number) => {
    if (dangerLevel <= 2) return 'text-green-400';
    if (dangerLevel <= 4) return 'text-yellow-400';
    if (dangerLevel <= 6) return 'text-orange-400';
    if (dangerLevel <= 8) return 'text-red-400';
    return 'text-purple-400';
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Exploration Journal" 
      size="xl"
      className="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: <BookIcon className="w-4 h-4" /> },
            { id: 'locations', label: 'Locations', icon: <MapIcon className="w-4 h-4" /> },
            { id: 'bestiary', label: 'Bestiary', icon: <SkullIcon className="w-4 h-4" /> },
            { id: 'achievements', label: 'Achievements', icon: <TrophyIcon className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Exploration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <MapIcon className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-slate-200">{discoveredLocations.length}</span>
                </div>
                <div className="text-sm text-slate-400">Locations Discovered</div>
                <div className="text-xs text-slate-500 mt-1">of {allLocations.length} total</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <SkullIcon className="w-8 h-8 text-red-400" />
                  <span className="text-2xl font-bold text-slate-200">{bestiaryStats.totalDefeated}</span>
                </div>
                <div className="text-sm text-slate-400">Creatures Defeated</div>
                <div className="text-xs text-slate-500 mt-1">{bestiaryStats.uniqueSpecies} unique species</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <TreasureIcon className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-slate-200">{Object.keys(locationsByBiome).length}</span>
                </div>
                <div className="text-sm text-slate-400">Biomes Explored</div>
                <div className="text-xs text-slate-500 mt-1">of {Object.keys(BIOMES).length} total</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrophyIcon className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-slate-200">{achievements.filter(a => a.completed).length}</span>
                </div>
                <div className="text-sm text-slate-400">Achievements</div>
                <div className="text-xs text-slate-500 mt-1">exploration milestones</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-200">World Exploration Progress</h3>
                <span className="text-sm text-slate-400">
                  {Math.round(explorationProgress * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${explorationProgress * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Discoveries */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2 text-green-400" />
                Recent Discoveries
              </h3>
              <div className="space-y-3">
                {discoveredLocations.slice(-5).reverse().map((location) => {
                  const biome = getBiomeForLocation(location.id);
                  return (
                    <div key={location.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      {getLocationTypeIcon(location)}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">{location.name}</div>
                        <div className="text-xs text-slate-400">
                          {location.type} • {biome?.name || 'Unknown Biome'}
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${getDangerLevelColor(location.dangerLevel)}`}>
                        Danger: {location.dangerLevel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Discovered Locations</h3>
              <span className="text-sm text-slate-400">
                {discoveredLocations.length} of {allLocations.length} locations discovered
              </span>
            </div>

            {/* Group by Biome */}
            {Object.entries(locationsByBiome).map(([biomeName, locations]) => (
              <div key={biomeName} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                <h4 className="text-md font-semibold text-slate-200 mb-3 flex items-center">
                  <TreasureIcon className="w-4 h-4 mr-2 text-amber-400" />
                  {biomeName}
                  <span className="ml-2 text-sm text-slate-400">({locations.length} locations)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {locations.map((location) => (
                    <div key={location.id} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getLocationTypeIcon(location)}
                          <span className="text-sm font-medium text-slate-200">{location.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${getDangerLevelColor(location.dangerLevel)}`}>
                          Lv. {location.dangerLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{location.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{location.type}</span>
                        {location.settlement && (
                          <span>Population: {location.settlement.population.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bestiary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Creature Bestiary</h3>
              <div className="text-sm text-slate-400">
                {bestiaryStats.uniqueSpecies} species • {bestiaryStats.totalDefeated} total defeated
              </div>
            </div>

            {Object.keys(player.bestiary).length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
                <SkullIcon className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-50" />
                <p className="text-slate-400">No creatures encountered yet.</p>
                <p className="text-sm text-slate-500 mt-1">Engage in combat to start building your bestiary!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(player.bestiary).map((entry) => (
                  <div key={entry.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-200">{entry.name}</h4>
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        ×{entry.vanquishedCount}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-3">{entry.description}</p>
                    
                    <div className="space-y-1 text-xs text-slate-500">
                      {entry.level && <div>Level: {entry.level}</div>}
                      {entry.weakness && <div>Weakness: {entry.weakness}</div>}
                      {entry.resistance && <div>Resistance: {entry.resistance}</div>}
                      {entry.specialAbilityName && <div>Special: {entry.specialAbilityName}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Exploration Achievements</h3>
              <span className="text-sm text-slate-400">
                {achievements.filter(a => a.completed).length} of {achievements.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, idx) => (
                <div 
                  key={idx} 
                  className={`
                    p-4 rounded-xl border transition-all
                    ${achievement.completed 
                      ? 'bg-amber-900/20 border-amber-600/30' 
                      : 'bg-slate-800/50 border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${achievement.completed ? 'bg-amber-600' : 'bg-slate-600'}
                    `}>
                      <TrophyIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${
                        achievement.completed ? 'text-amber-200' : 'text-slate-300'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-xs ${
                        achievement.completed ? 'text-amber-300' : 'text-slate-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.completed && (
                      <div className="text-amber-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExplorationJournalModal; 