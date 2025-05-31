import React from 'react';
import { Player } from '../types';
import ActionButton from './ActionButton';
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
    <div className="min-h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Main Content Container */}
      <div className="h-full space-y-3 sm:space-y-4 lg:space-y-6">
        
        {/* Desktop Layout - Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 h-full">
          
          {/* Left Column - Location & Exploration */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Current Location Section - Enhanced and Unified */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                    {isInSettlement ? <BuildingIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" /> : <MapIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-300">Current Location</h3>
                </div>
                <ActionButton 
                  onClick={onExploreMap} 
                  variant="success" 
                  size="sm"
                  icon={<MapIcon />}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Open Map</span>
                  <span className="sm:hidden">Map</span>
                </ActionButton>
              </div>
              
              <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-3 sm:p-4 border border-slate-600/50 shadow-inner flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-100 mb-2 truncate">{locationName}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed line-clamp-2 sm:line-clamp-none">{locationDescription}</p>
                  </div>
                  {isInSettlement && (
                    <div className="flex-shrink-0 ml-3 sm:ml-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs mb-3 sm:mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                    <span className="text-slate-400 block">Type</span>
                    <div className="text-slate-200 font-medium capitalize truncate">{currentLocation?.type || 'Unknown'}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                    <span className="text-slate-400 block">Danger</span>
                    <div className="text-slate-200 font-medium">Level {currentLocation?.dangerLevel || '?'}</div>
                  </div>
                  {isInSettlement && currentLocation?.settlement && (
                    <>
                      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                        <span className="text-slate-400 block">Population</span>
                        <div className="text-slate-200 font-medium text-xs sm:text-sm">{currentLocation.settlement.population.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/30">
                        <span className="text-slate-400 block">NPCs</span>
                        <div className="text-slate-200 font-medium">{currentLocation.settlement.npcs.length} available</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Location-specific Actions */}
                {isInSettlement ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-xs sm:text-sm text-slate-300 mb-2">Settlement Services:</div>
                    {currentLocation?.settlement && (
                      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs text-slate-400 mb-2 sm:mb-3">
                        <div><span className="text-slate-300">Shops:</span> {currentLocation.settlement.shops.length}</div>
                        <div><span className="text-slate-300">Taverns:</span> {currentLocation.settlement.taverns.length}</div>
                        <div><span className="text-slate-300">Services:</span> Available</div>
                      </div>
                    )}
                    <ActionButton 
                      onClick={onAccessSettlement} 
                      variant="primary" 
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      icon={<BuildingIcon />}
                    >
                      <span className="hidden sm:inline">Access Settlement Services</span>
                      <span className="sm:hidden">Access Settlement</span>
                    </ActionButton>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-xs sm:text-sm text-slate-300 mb-2">Nearby Settlements:</div>
                    <div className="space-y-1 mb-2 sm:mb-3 text-xs text-slate-400 max-h-20 sm:max-h-none overflow-y-auto">
                      {currentLocation?.connectedLocations && Object.entries(currentLocation.connectedLocations).map(([locationId, travelTime]) => {
                        const connectedLocation = getLocation(locationId);
                        if (connectedLocation?.type === 'settlement') {
                          return (
                            <div key={locationId} className="flex justify-between">
                              <span className="text-slate-300 truncate">{connectedLocation.name}</span>
                              <span className="flex-shrink-0 ml-2">{travelTime}h</span>
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
                      className="w-full text-xs sm:text-sm"
                      icon={<MapIcon />}
                    >
                      <span className="hidden sm:inline">View Travel Options</span>
                      <span className="sm:hidden">Travel Options</span>
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>

            {/* Explore World Section */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-slate-700/60 p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-300">Explore World</h3>
              </div>
              
              {/* Homestead Section */}
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 border border-slate-600">
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <h4 className="text-base sm:text-lg font-medium text-amber-300">Homestead</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">Your personal base of operations where you can craft, store items, and develop your properties.</p>
                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3 text-xs text-slate-400">
                  <div><span className="text-slate-300">Garden:</span> Lv.1</div>
                  <div><span className="text-slate-300">Workshop:</span> Lv.1</div>
                  <div><span className="text-slate-300">Storage:</span> Lv.1</div>
                </div>
                <ActionButton 
                  onClick={onOpenHomestead} 
                  variant="secondary" 
                  size="sm"
                  className="w-full text-xs sm:text-sm"
                  disabled={true}
                >
                  <span className="hidden sm:inline">Visit Homestead (Coming Soon)</span>
                  <span className="sm:hidden">Homestead (Soon)</span>
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Right Column - Combat & Activities */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Combat Section */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-red-700/60 p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <SkullIcon className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-red-300">Combat</h3>
              </div>
              
              <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-3 sm:p-4 border border-slate-600/50 shadow-inner mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3">
                  Test your skills against the dangers that lurk in {locationName}. 
                  {currentLocation?.dangerLevel && ` Danger Level: ${currentLocation.dangerLevel}`}
                </p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>• Gain experience and loot from victories</div>
                  <div>• Risk vs reward based on location danger</div>
                  <div className="hidden sm:block">• Strategic combat with spells and abilities</div>
                </div>
              </div>

              <ActionButton 
                onClick={onFindEnemy} 
                variant="danger" 
                size="lg" 
                isLoading={isLoading} 
                icon={<SkullIcon />} 
                className="w-full text-sm sm:text-base"
              >
                Seek Battle
              </ActionButton>
            </div>

            {/* Activities Section */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-slate-700/60 p-3 sm:p-4 flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <BookIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-purple-300">Activities</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <ActionButton 
                  onClick={onOpenCamp} 
                  variant="secondary"
                  size="sm" 
                  isLoading={isLoading} 
                  icon={<TentIcon />} 
                  className="h-full !py-2 sm:!py-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Camp & Rest</span>
                  <span className="sm:hidden">Camp</span>
                </ActionButton>
                <ActionButton 
                  onClick={onOpenResearchArchives} 
                  variant="info" 
                  size="sm" 
                  isLoading={isLoading} 
                  icon={<BookIcon />} 
                  className="h-full !py-2 sm:!py-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Research Archives</span>
                  <span className="sm:hidden">Research</span>
                </ActionButton>
                <ActionButton 
                  onClick={onOpenCraftingHub} 
                  variant="warning" 
                  size="sm" 
                  isLoading={isLoading} 
                  icon={<FlaskIcon />} 
                  className="h-full !py-2 sm:!py-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Crafting Hub</span>
                  <span className="sm:hidden">Crafting</span>
                </ActionButton>
                <ActionButton 
                  onClick={onOpenNPCs} 
                  variant="info" 
                  size="sm" 
                  isLoading={isLoading} 
                  icon={<UserIcon />} 
                  className="h-full !py-2 sm:!py-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">NPCs & Quests</span>
                  <span className="sm:hidden">NPCs</span>
                </ActionButton>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Additional Actions for smaller screens */}
        <div className="xl:hidden">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <ActionButton 
              onClick={() => {/* Placeholder functionality */}} 
              variant="secondary"
              size="sm" 
              disabled={true}
              icon={<BookIcon />} 
              className="h-full !py-2 sm:!py-3 opacity-50 text-xs sm:text-sm"
            >
              Placeholder
            </ActionButton>
            <ActionButton 
              onClick={() => {/* Additional placeholder */}} 
              variant="secondary"
              size="sm" 
              disabled={true}
              icon={<BookIcon />} 
              className="h-full !py-2 sm:!py-3 opacity-50 text-xs sm:text-sm"
            >
              Placeholder
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenView;