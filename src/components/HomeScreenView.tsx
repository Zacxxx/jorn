import React from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon, TentIcon, HomeIcon, BuildingIcon, UserIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

interface HomeScreenViewProps {
  player: Player;
  onFindEnemy: () => void;
  isLoading: boolean;
  onExploreMap: () => void;
  onOpenResearchArchives: () => void; 
  onOpenCamp: () => void;
  onAccessSettlement: () => void;
  onOpenCraftingHub: () => void;
  onOpenHomestead: () => void;
  onOpenNPCs: () => void;
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  player,
  onFindEnemy,
  isLoading,
  onExploreMap,
  onOpenResearchArchives,
  onOpenCamp,
  onAccessSettlement,
  onOpenCraftingHub,
  onOpenHomestead,
  onOpenNPCs,
}) => {
  const currentLocation = getLocation(player.currentLocationId);
  const locationName = currentLocation?.name || 'Unknown Location';
  const locationDescription = currentLocation?.description || 'A mysterious place...';
  const isInSettlement = currentLocation?.type === 'settlement';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Welcome, {player.name}!</h2>
        <p className="text-slate-300 mb-6 max-w-xl mx-auto">Your adventure continues in the world of Jorn. Choose your next action wisely.</p>
      </div>

      {/* Current Location Section - Enhanced */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-green-300">Current Location</h3>
          </div>
          <ActionButton 
            onClick={onExploreMap} 
            variant="success" 
            size="sm"
            icon={<MapIcon />}
          >
            Open Map
          </ActionButton>
        </div>
        
        <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-5 border border-slate-600/50 shadow-inner">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-xl font-bold text-slate-100 mb-2">{locationName}</h4>
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">{locationDescription}</p>
            </div>
            {isInSettlement && (
              <div className="flex-shrink-0 ml-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <BuildingIcon className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
              <span className="text-slate-400">Type</span>
              <div className="text-slate-200 font-medium capitalize">{currentLocation?.type || 'Unknown'}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
              <span className="text-slate-400">Danger</span>
              <div className="text-slate-200 font-medium">Level {currentLocation?.dangerLevel || '?'}</div>
            </div>
            {isInSettlement && currentLocation?.settlement && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                  <span className="text-slate-400">Population</span>
                  <div className="text-slate-200 font-medium">{currentLocation.settlement.population.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                  <span className="text-slate-400">NPCs</span>
                  <div className="text-slate-200 font-medium">{currentLocation.settlement.npcs.length} available</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Explore World Section */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MapIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-blue-300">Explore World</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Homestead Section */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <HomeIcon className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-medium text-amber-300">Homestead</h4>
            </div>
            <p className="text-sm text-slate-300 mb-3">Your personal base of operations where you can craft, store items, and develop your properties.</p>
            <div className="space-y-2 mb-3">
              <div className="text-xs text-slate-400">
                <span className="text-slate-300">Garden:</span> Level 1 - Basic herb cultivation
              </div>
              <div className="text-xs text-slate-400">
                <span className="text-slate-300">Workshop:</span> Level 1 - Essential crafting tools
              </div>
              <div className="text-xs text-slate-400">
                <span className="text-slate-300">Storage:</span> Level 1 - Simple item storage
              </div>
            </div>
            <ActionButton 
              onClick={onOpenHomestead} 
              variant="secondary" 
              size="sm"
              className="w-full"
              disabled={true}
            >
              Visit Homestead (Coming Soon)
            </ActionButton>
          </div>

          {/* Settlements Section */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <BuildingIcon className="w-5 h-5 text-purple-400" />
              <h4 className="text-lg font-medium text-purple-300">Settlements</h4>
            </div>
            {isInSettlement ? (
              <div>
                <p className="text-sm text-slate-300 mb-3">You are currently in {locationName}. Access local shops, taverns, and services.</p>
                <div className="space-y-2 mb-3">
                  {currentLocation?.settlement && (
                    <>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300">Shops:</span> {currentLocation.settlement.shops.length} available
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300">Taverns:</span> {currentLocation.settlement.taverns.length} available
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300">NPCs:</span> {currentLocation.settlement.npcs.length} to meet
                      </div>
                    </>
                  )}
                </div>
                <ActionButton 
                  onClick={onAccessSettlement} 
                  variant="primary" 
                  size="sm"
                  className="w-full"
                >
                  Access Settlement
                </ActionButton>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 mb-3">You are in the wilderness. Travel to nearby settlements for trade and services.</p>
                <div className="space-y-1 mb-3 text-xs text-slate-400">
                  {currentLocation?.connectedLocations && Object.entries(currentLocation.connectedLocations).map(([locationId, travelTime]) => {
                    const connectedLocation = getLocation(locationId);
                    if (connectedLocation?.type === 'settlement') {
                      return (
                        <div key={locationId}>
                          <span className="text-slate-300">{connectedLocation.name}:</span> {travelTime}h travel
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <ActionButton 
                  onClick={onExploreMap} 
                  variant="success" 
                  size="sm"
                  className="w-full"
                >
                  View Travel Options
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <ActionButton 
            onClick={onExploreMap} 
            variant="success"
            size="lg" 
            isLoading={isLoading} 
            icon={<MapIcon />} 
            className="w-full"
          >
            Open World Map
          </ActionButton>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton 
          onClick={onFindEnemy} 
          variant="danger" 
          size="lg" 
          isLoading={isLoading} 
          icon={<SkullIcon />} 
          className="h-full !py-4"
        >
          Seek Battle
        </ActionButton>
        <ActionButton 
          onClick={onOpenCamp} 
          variant="secondary"
          size="lg" 
          isLoading={isLoading} 
          icon={<TentIcon />} 
          className="h-full !py-4"
        >
          Camp
        </ActionButton>
        <ActionButton 
          onClick={() => {/* Placeholder functionality */}} 
          variant="secondary"
          size="lg" 
          disabled={true}
          icon={<BookIcon />} 
          className="h-full !py-4 opacity-50"
        >
          Placeholder
        </ActionButton>
        <ActionButton 
          onClick={onOpenResearchArchives} 
          variant="info" 
          size="lg" 
          isLoading={isLoading} 
          icon={<BookIcon />} 
          className="h-full !py-4"
        >
          Research Archives
        </ActionButton>
        <ActionButton 
          onClick={onOpenCraftingHub} 
          variant="warning" 
          size="lg" 
          isLoading={isLoading} 
          icon={<FlaskIcon />} 
          className="h-full !py-4"
        >
          Crafting Hub
        </ActionButton>
        <ActionButton 
          onClick={onOpenNPCs} 
          variant="info" 
          size="lg" 
          isLoading={isLoading} 
          icon={<UserIcon />} 
          className="h-full !py-4"
        >
          NPCs
        </ActionButton>
      </div>
    </div>
  );
};

export default HomeScreenView;
