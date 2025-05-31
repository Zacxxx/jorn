import React from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import ActionButton from './ActionButton';
import PlayerStatsDisplay from './PlayerStatsDisplay';
import ActivityCard from './ActivityCard';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon, TentIcon, HomeIcon, BuildingIcon, UserIcon, GearIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

interface HomeScreenViewProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onFindEnemy: () => void;
  isLoading: boolean;
  onExploreMap: () => void;
  onOpenResearchArchives: () => void; 
  onOpenCamp: () => void;
  onAccessSettlement: () => void;
  onOpenCraftingHub: () => void;
  onOpenHomestead: () => void;
  onOpenNPCs: () => void;
  onNavigateToMultiplayer: () => void; // Add this line
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  player,
  effectiveStats,
  onFindEnemy,
  isLoading,
  onExploreMap,
  onOpenResearchArchives,
  onOpenCamp,
  onAccessSettlement,
  onOpenCraftingHub,
  onOpenHomestead,
  onOpenNPCs,
  onNavigateToMultiplayer, // Add this line
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
      backgroundImage: '/assets/activity-card/camp.gif'
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
    },
    {
      id: 'quests',
      title: 'Quest Log',
      shortTitle: 'Quests',
      description: 'Track your active quests and view completed adventures.',
      icon: <BookIcon />,
      variant: 'warning' as const,
      onClick: onOpenNPCs,
      benefits: ['Active: 3', 'Completed: 12', 'New Available: 2'],
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      backgroundImage: '/assets/activity-card/quests.svg'
    },
    {
      id: 'trading',
      title: 'Trading Hub',
      shortTitle: 'Trading',
      description: 'Access the global marketplace to buy and sell items.',
      icon: <GearIcon />,
      variant: 'success' as const,
      onClick: () => console.log('Trading Hub clicked'),
      benefits: ['Market: Active', 'Listings: 5', 'Recent Sales: 8'],
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      backgroundImage: '/assets/activity-card/trading.svg'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] w-full max-w-none mx-0 -mx-3 sm:-mx-4 md:-mx-6 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 overflow-hidden">
      {/* Player Stats Display */}
      <div className="mb-4">
        <PlayerStatsDisplay player={player} effectiveStats={effectiveStats} />
      </div>
      {/* Main Content Container */}
      <div className="h-full py-2 sm:py-3 md:py-4 lg:py-5">
        
        {/* Desktop Layout - Three Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 h-full max-w-none mx-auto">
          
          {/* Left Column - Location & Exploration */}
          <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 h-full">
            {/* Current Location Section - Enhanced and Optimized */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl sm:shadow-2xl border border-green-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0">
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
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto space-y-2 sm:space-y-3 md:space-y-4">
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
                  <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Resources</div>
                      <div className="text-green-300 font-medium">Available</div>
                    </div>
                    <div className="bg-slate-800/30 rounded p-1 text-center">
                      <div className="text-slate-400">Upgrades</div>
                      <div className="text-blue-300 font-medium">Ready</div>
                    </div>
                  </div>
                  <ActionButton 
                    onClick={onOpenHomestead} 
                    variant="secondary" 
                    size="sm"
                    className="w-full text-xs hover:bg-amber-600/20 hover:border-amber-500/50"
                    icon={<HomeIcon />}
                  >
                    <span className="hidden sm:inline">Visit Homestead</span>
                    <span className="sm:hidden">Homestead</span>
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Combat & Activities */}
          <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 h-full">
            {/* Combat Section - Enhanced */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl sm:shadow-2xl border border-red-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3 md:mb-4">
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

              {/* Multiplayer Button */}
              <ActionButton 
                onClick={onNavigateToMultiplayer} // Updated onClick
                variant="primary" 
                size="sm" 
                icon={<UserIcon />} 
                className="w-full text-xs mt-2"
              >
                View Full Multiplayer {/* Updated text */}
              </ActionButton>
            </div>

            {/* Multiplayer Section - Enhanced with Detailed Interface */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl sm:shadow-2xl border border-purple-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3 md:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-400" />
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-purple-300">Multiplayer</h3>
              </div>
              
              {/* Multiplayer Tabs */}
              <div className="flex flex-col h-48">
                <div className="flex border-b border-slate-600/30 mb-3">
                  <button className="flex-1 py-2 px-3 text-xs font-medium text-purple-300 border-b-2 border-purple-500/50 bg-purple-500/10">
                    Chat
                  </button>
                  <button className="flex-1 py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors">
                    Group
                  </button>
                  <button className="flex-1 py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors">
                    Community
                  </button>
                </div>
                
                {/* Chat Content */}
                <div className="flex-1 bg-slate-800/30 rounded-lg p-2 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 text-xs text-slate-400 mb-2 overflow-y-auto">
                      <div className="space-y-1">
                        <div><span className="text-blue-300">Player1:</span> Anyone up for a dungeon run?</div>
                        <div><span className="text-green-300">Player2:</span> I'm in! What level?</div>
                        <div><span className="text-yellow-300">Player3:</span> Need help with crafting quest</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <input 
                        type="text" 
                        placeholder="Type message..." 
                        className="flex-1 bg-slate-700/50 border border-slate-600/30 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
                      />
                      <button className="bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third Column - Feature Cards */}
          <div className="flex flex-col h-full">
            {/* Feature Cards Grid - Single Column Layout */}
            <div className="grid grid-cols-1 gap-1 sm:gap-1.5 md:gap-2 h-full overflow-y-auto">
              {activityCards.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  id={activity.id}
                  title={activity.title}
                  shortTitle={activity.shortTitle}
                  description={activity.description}
                  icon={activity.icon}
                  onClick={activity.onClick}
                  benefits={activity.benefits}
                  color={activity.color}
                  borderColor={activity.borderColor}
                  iconColor={activity.iconColor}
                  backgroundImage={activity.backgroundImage}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Additional Actions for smaller screens */}
        <div className="xl:hidden mt-2 sm:mt-3 md:mt-4">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/60 p-2 sm:p-3">
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
