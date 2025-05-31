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

  // Activity cards data
  const activityCards = [
    {
      id: 'camp',
      title: 'Camp & Rest',
      shortTitle: 'Camp',
      description: 'Set up camp to rest and recover your health, mana, and energy.',
      icon: <TentIcon />,
      variant: 'secondary' as const,
      onClick: onOpenCamp,
      benefits: ['Restore HP/MP/EP', 'Choose rest activities', 'Safe recovery'],
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      backgroundImage: '/assets/activity-card/camp.svg'
    },
    {
      id: 'research',
      title: 'Research Archives',
      shortTitle: 'Research',
      description: 'Study ancient texts and discover new spell components.',
      icon: <BookIcon />,
      variant: 'info' as const,
      onClick: onOpenResearchArchives,
      benefits: ['Discover components', 'Learn new techniques', 'Expand knowledge'],
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      backgroundImage: '/assets/activity-card/research.svg'
    },
    {
      id: 'crafting',
      title: 'Crafting Workshop',
      shortTitle: 'Crafting',
      description: 'Create items, discover recipes, and design powerful spells.',
      icon: <FlaskIcon />,
      variant: 'warning' as const,
      onClick: onOpenCraftingHub,
      benefits: ['Craft items', 'Discover recipes', 'Design spells'],
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
      backgroundImage: '/assets/activity-card/crafting.svg'
    },
    {
      id: 'npcs',
      title: 'NPCs & Quests',
      shortTitle: 'NPCs',
      description: 'Interact with characters and embark on exciting quests.',
      icon: <UserIcon />,
      variant: 'info' as const,
      onClick: onOpenNPCs,
      benefits: ['Meet characters', 'Accept quests', 'Build relationships'],
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      backgroundImage: '/assets/activity-card/npcs.svg'
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 overflow-hidden">
      {/* Main Content Container */}
      <div className="h-full py-2 sm:py-3 lg:py-4">
        
        {/* Desktop Layout - Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 h-full">
          
          {/* Left Column - Location & Exploration */}
          <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-4 h-full">
            {/* Current Location Section - Enhanced and Optimized */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-green-700/60 p-2 sm:p-3 lg:p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                    {isInSettlement ? <BuildingIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-400" /> : <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-400" />}
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-green-300">Current Location</h3>
                </div>
                <ActionButton 
                  onClick={onExploreMap} 
                  variant="success" 
                  size="sm"
                  icon={<MapIcon />}
                  className="text-xs"
                >
                  <span className="hidden sm:inline">Open Map</span>
                  <span className="sm:hidden">Map</span>
                </ActionButton>
              </div>
              
              <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-2 sm:p-3 border border-slate-600/50 shadow-inner">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-100 mb-1 truncate">{locationName}</h4>
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed line-clamp-2">{locationDescription}</p>
                  </div>
                  {isInSettlement && (
                    <div className="flex-shrink-0 ml-2 sm:ml-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs mb-3">
                  <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30">
                    <span className="text-slate-400 block">Type</span>
                    <div className="text-slate-200 font-medium capitalize truncate">{currentLocation?.type || 'Unknown'}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30">
                    <span className="text-slate-400 block">Danger</span>
                    <div className="text-slate-200 font-medium">Level {currentLocation?.dangerLevel || '?'}</div>
                  </div>
                  {isInSettlement && currentLocation?.settlement && (
                    <>
                      <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30">
                        <span className="text-slate-400 block">Population</span>
                        <div className="text-slate-200 font-medium text-xs">{currentLocation.settlement.population.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30">
                        <span className="text-slate-400 block">NPCs</span>
                        <div className="text-slate-200 font-medium">{currentLocation.settlement.npcs.length} available</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Location-specific Actions - Optimized */}
                {isInSettlement ? (
                  <div>
                    <div className="text-xs text-slate-300 mb-2">Settlement Services:</div>
                    {currentLocation?.settlement && (
                      <div className="grid grid-cols-3 gap-1 text-xs text-slate-400 mb-2">
                        <div><span className="text-slate-300">Shops:</span> {currentLocation.settlement.shops.length}</div>
                        <div><span className="text-slate-300">Taverns:</span> {currentLocation.settlement.taverns.length}</div>
                        <div><span className="text-slate-300">Services:</span> Available</div>
                      </div>
                    )}
                    <ActionButton 
                      onClick={onAccessSettlement} 
                      variant="primary" 
                      size="sm"
                      className="w-full text-xs"
                      icon={<BuildingIcon />}
                    >
                      <span className="hidden sm:inline">Access Settlement Services</span>
                      <span className="sm:hidden">Access Settlement</span>
                    </ActionButton>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-slate-300 mb-2">Nearby Settlements:</div>
                    <div className="space-y-1 mb-2 text-xs text-slate-400 max-h-12 overflow-y-auto">
                      {currentLocation?.connectedLocations && Object.entries(currentLocation.connectedLocations).map(([locationId, travelTime]) => {
                        const connectedLocation = getLocation(locationId);
                        if (connectedLocation?.type === 'settlement') {
                          return (
                            <div key={locationId} className="flex justify-between">
                              <span className="text-slate-300 truncate">{connectedLocation.name}</span>
                              <span className="flex-shrink-0 ml-2">{String(travelTime)}h</span>
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
                      className="w-full text-xs"
                      icon={<MapIcon />}
                    >
                      <span className="hidden sm:inline">View Travel Options</span>
                      <span className="sm:hidden">Travel Options</span>
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>

            {/* Explore World Section - Enhanced */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-slate-700/60 p-2 sm:p-3 lg:p-4 flex-1 min-h-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-blue-300">Explore World</h3>
              </div>
              
              <div className="h-full overflow-y-auto space-y-2 sm:space-y-3">
                {/* Homestead Section - Enhanced Card */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-lg p-2 sm:p-3 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                      <HomeIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-medium text-amber-300">Homestead</h4>
                  </div>
                  <p className="text-xs text-slate-300 mb-2 line-clamp-2">Your personal base of operations where you can craft, store items, and develop your properties.</p>
                  <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Garden</div>
                      <div className="text-amber-300 font-medium">Lv.1</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Workshop</div>
                      <div className="text-amber-300 font-medium">Lv.1</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Storage</div>
                      <div className="text-amber-300 font-medium">Lv.1</div>
                    </div>
                  </div>
                  <ActionButton 
                    onClick={onOpenHomestead} 
                    variant="secondary" 
                    size="sm"
                    className="w-full text-xs opacity-60"
                    disabled={true}
                  >
                    <span className="hidden sm:inline">Visit Homestead (Coming Soon)</span>
                    <span className="sm:hidden">Homestead (Soon)</span>
                  </ActionButton>
                </div>

                {/* World Map Section - New Addition for Symmetry */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-lg p-2 sm:p-3 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                      <MapIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-medium text-emerald-300">World Map</h4>
                  </div>
                  <p className="text-xs text-slate-300 mb-2 line-clamp-2">Explore the vast world, discover new locations, and plan your adventures across different regions.</p>
                  <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Discovered</div>
                      <div className="text-emerald-300 font-medium">3 Locations</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Available</div>
                      <div className="text-emerald-300 font-medium">Fast Travel</div>
                    </div>
                  </div>
                  <ActionButton 
                    onClick={onExploreMap} 
                    variant="success" 
                    size="sm"
                    className="w-full text-xs"
                    icon={<MapIcon />}
                  >
                    <span className="hidden sm:inline">Open World Map</span>
                    <span className="sm:hidden">World Map</span>
                  </ActionButton>
                </div>

                {/* Quick Stats Section - New Addition */}
                <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-lg p-2 sm:p-3 border border-slate-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-medium text-slate-300">Quick Stats</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Level</div>
                      <div className="text-slate-200 font-medium">{player.level}</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Spells</div>
                      <div className="text-slate-200 font-medium">{player.spells.length}</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Gold</div>
                      <div className="text-yellow-300 font-medium">{player.gold}</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Essence</div>
                      <div className="text-purple-300 font-medium">{player.essence}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Combat & Activities */}
          <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-4 h-full">
            {/* Combat Section - Enhanced */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-red-700/60 p-2 sm:p-3 lg:p-4 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <SkullIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-red-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-red-300">Combat</h3>
              </div>
              
              <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-2 sm:p-3 border border-slate-600/50 shadow-inner mb-2 sm:mb-3">
                <p className="text-xs text-slate-300 mb-1 sm:mb-2">
                  Test your skills against the dangers that lurk in {locationName}. 
                  {currentLocation?.dangerLevel && ` Danger Level: ${currentLocation.dangerLevel}`}
                </p>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <div>• Gain experience and loot from victories</div>
                  <div>• Risk vs reward based on location danger</div>
                  <div className="hidden lg:block">• Strategic combat with spells and abilities</div>
                </div>
              </div>

              <ActionButton 
                onClick={onFindEnemy} 
                variant="danger" 
                size="lg" 
                isLoading={isLoading} 
                icon={<SkullIcon />} 
                className="w-full text-sm hover:scale-105 transition-transform duration-200"
              >
                Seek Battle
              </ActionButton>
            </div>

            {/* Activities Section - Enhanced with Detailed Cards */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-slate-700/60 p-2 sm:p-3 lg:p-4 flex-1 min-h-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <FlaskIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-purple-300">Activities</h3>
              </div>
              
              {/* Enhanced Activity Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 h-full overflow-y-auto">
                {activityCards.map((activity) => (
                  <div
                    key={activity.id}
                    className={`relative bg-gradient-to-br ${activity.color} backdrop-blur-sm rounded-lg border ${activity.borderColor} p-2.5 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden h-fit`}
                    onClick={activity.onClick}
                  >
                    {/* Background Illustration */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                      <div className={`w-full h-full bg-gradient-to-br ${activity.color.replace('/20', '/40')} rounded-lg overflow-hidden`}>
                        <img 
                          src={activity.backgroundImage} 
                          alt={`${activity.title} background`}
                          className="w-full h-full object-cover opacity-60"
                          onError={(e) => {
                            // Fallback to icon illustration if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        {/* Fallback icon illustration */}
                        <div className="hidden w-full h-full">
                          <div className="absolute top-2 right-2 w-16 h-16 opacity-30">
                            <div className={`w-full h-full ${activity.iconColor} scale-[4] transform rotate-12`}>
                              {activity.icon}
                            </div>
                          </div>
                          <div className="absolute bottom-1 left-1 w-12 h-12 opacity-20">
                            <div className={`w-full h-full ${activity.iconColor} scale-[3] transform -rotate-12`}>
                              {activity.icon}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <div className={`w-5 h-5 bg-gradient-to-br ${activity.color} border ${activity.borderColor} rounded-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                          <div className={`w-3 h-3 ${activity.iconColor} flex items-center justify-center`}>
                            {activity.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                            <span className="hidden sm:inline">{activity.title}</span>
                            <span className="sm:hidden">{activity.shortTitle}</span>
                          </h4>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors mb-1.5 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      {/* Compact Benefits Grid */}
                      <div className="grid grid-cols-1 gap-0.5 mb-1.5">
                        {activity.benefits.slice(0, 2).map((benefit, index) => (
                          <div key={index} className="flex items-center text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                            <div className={`w-1 h-1 rounded-full ${activity.iconColor} mr-2 opacity-60 flex-shrink-0`}></div>
                            <span className="truncate">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Compact Action Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-600/20">
                        <div className={`text-xs ${activity.iconColor} font-medium group-hover:brightness-110 transition-all duration-200`}>
                          Access
                        </div>
                        <div className={`text-xs ${activity.iconColor} opacity-60 group-hover:opacity-100 transition-opacity duration-200`}>
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Additional Actions for smaller screens */}
        <div className="xl:hidden mt-2 sm:mt-3">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/60 p-2">
            <div className="text-xs text-slate-400 text-center mb-2">Additional Features</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">Coming Soon</div>
                <div className="text-xs text-slate-500">Feature 1</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">Coming Soon</div>
                <div className="text-xs text-slate-500">Feature 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenView;