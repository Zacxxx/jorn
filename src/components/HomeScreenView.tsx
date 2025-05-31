import React from 'react';
import { Player } from '../types';
import ActionButton from './ActionButton';
import ActivityCard from './ActivityCard';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon, TentIcon, HomeIcon, BuildingIcon, UserIcon, GearIcon, SwordsIcon } from './IconComponents';
import { getLocation } from '../services/locationService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

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
  onOpenMultiplayer: () => void;
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
  onOpenMultiplayer,
}) => {
  const [showBattleOptions, setShowBattleOptions] = React.useState(false);
  const [activeMultiplayerTab, setActiveMultiplayerTab] = React.useState('party');
  const [selectedBattleMode, setSelectedBattleMode] = React.useState<{
    type: 'quick' | 'boss' | 'arena' | 'dungeon';
    label: string;
  }>({ type: 'quick', label: 'Seek Battle' });
  const [activityOrder, setActivityOrder] = React.useState([
    'camp', 'research', 'crafting', 'npcs', 'quests', 'trading'
  ]);
  
  // DnD Kit sensors for responsive interactions
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const currentLocation = getLocation(player.currentLocationId);
  const locationName = currentLocation?.name || 'Unknown Location';
  const locationDescription = currentLocation?.description || 'A mysterious place...';
  const isInSettlement = currentLocation?.type === 'settlement';

  // Handle battle mode selection
  const handleBattleModeSelect = (mode: 'quick' | 'boss' | 'arena' | 'dungeon', label: string) => {
    setSelectedBattleMode({ type: mode, label });
    setShowBattleOptions(false);
    
    // Handle different battle modes
    switch (mode) {
      case 'quick':
        onFindEnemy();
        break;
      case 'boss':
        console.log('Boss Battle selected');
        // TODO: Implement boss battle logic
        break;
      case 'arena':
        console.log('Arena selected');
        // TODO: Implement arena logic
        break;
      case 'dungeon':
        console.log('Dungeon selected');
        // TODO: Implement dungeon logic
        break;
    }
  };

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

  // Enhanced card animation classes
  const cardBaseClasses = "backdrop-blur-md rounded-xl shadow-xl border transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl";
  const cardHoverClasses = "hover:border-opacity-80 hover:-translate-y-1";

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="min-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] w-full max-w-none mx-0 -mx-3 sm:-mx-4 md:-mx-6 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 overflow-hidden">
        {/* Main Content Container */}
        <div className="h-full py-2 sm:py-3 md:py-4 lg:py-5">
          
          {/* Responsive Grid Layout - Enhanced with dnd-kit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 h-full max-w-none mx-auto auto-rows-min">
            
            {/* Left Column - Location & Exploration */}
            <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 h-full min-h-0">
              {/* Current Location Section - Enhanced and Optimized */}
              <div className={`${cardBaseClasses} ${cardHoverClasses} bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0 relative overflow-hidden`}>
                {/* Ambient background effect based on location type */}
                <div className={`absolute inset-0 opacity-10 ${
                  isInSettlement 
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' 
                    : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                }`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12`}>
                        {isInSettlement ? <BuildingIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-400" /> : <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-400" />}
                      </div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-green-300">Current Location</h3>
                      {/* Location type badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isInSettlement 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {currentLocation?.type || 'Unknown'}
                      </span>
                    </div>
                    <ActionButton 
                      onClick={onExploreMap} 
                      variant="success" 
                      size="sm"
                      icon={<MapIcon />}
                      className="text-xs hover:scale-105 transition-transform duration-200"
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
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center animate-pulse">
                            <BuildingIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs mb-3">
                      <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200">
                        <span className="text-slate-400 block">Type</span>
                        <div className="text-slate-200 font-medium capitalize truncate">{currentLocation?.type || 'Unknown'}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200">
                        <span className="text-slate-400 block">Danger</span>
                        <div className={`font-medium ${
                          (currentLocation?.dangerLevel || 0) <= 3 ? 'text-green-300' :
                          (currentLocation?.dangerLevel || 0) <= 6 ? 'text-yellow-300' : 'text-red-300'
                        }`}>Level {currentLocation?.dangerLevel || '?'}</div>
                      </div>
                      {isInSettlement && currentLocation?.settlement && (
                        <>
                          <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200">
                            <span className="text-slate-400 block">Population</span>
                            <div className="text-slate-200 font-medium text-xs">{currentLocation.settlement.population.toLocaleString()}</div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200">
                            <span className="text-slate-400 block">NPCs</span>
                            <div className="text-slate-200 font-medium">{currentLocation.settlement.npcs.length} available</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Enhanced Points of Interest */}
                    {currentLocation?.pointsOfInterest && currentLocation.pointsOfInterest.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-slate-300 mb-2 flex items-center">
                          <MapIcon className="w-3 h-3 mr-1" />
                          Points of Interest:
                        </div>
                        <div className="grid grid-cols-1 gap-1 max-h-16 overflow-y-auto">
                          {currentLocation.pointsOfInterest.slice(0, 3).map((poi, index) => (
                            <div key={index} className="bg-slate-700/30 rounded p-1.5 text-xs hover:bg-slate-600/30 transition-colors duration-200 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 truncate">{poi.name}</span>
                                <span className={`text-xs px-1 rounded ${
                                  poi.type === 'resource' ? 'bg-green-500/20 text-green-300' :
                                  poi.type === 'danger' ? 'bg-red-500/20 text-red-300' :
                                  poi.type === 'mystery' ? 'bg-purple-500/20 text-purple-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {poi.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location-specific Actions - Enhanced */}
                    {isInSettlement ? (
                      <div>
                        <div className="text-xs text-slate-300 mb-2 flex items-center">
                          <BuildingIcon className="w-3 h-3 mr-1" />
                          Settlement Services:
                        </div>
                        {currentLocation?.settlement && (
                          <div className="grid grid-cols-3 gap-1 text-xs text-slate-400 mb-2">
                            <div className="hover:text-slate-300 transition-colors duration-200"><span className="text-slate-300">Shops:</span> {currentLocation.settlement.shops.length}</div>
                            <div className="hover:text-slate-300 transition-colors duration-200"><span className="text-slate-300">Taverns:</span> {currentLocation.settlement.taverns.length}</div>
                            <div className="hover:text-slate-300 transition-colors duration-200"><span className="text-slate-300">Services:</span> Available</div>
                          </div>
                        )}
                        <ActionButton 
                          onClick={onAccessSettlement} 
                          variant="primary" 
                          size="sm"
                          className="w-full text-xs hover:scale-105 transition-transform duration-200"
                          icon={<BuildingIcon />}
                        >
                          <span className="hidden sm:inline">Access Settlement Services</span>
                          <span className="sm:hidden">Access Settlement</span>
                        </ActionButton>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-slate-300 mb-2 flex items-center">
                          <MapIcon className="w-3 h-3 mr-1" />
                          Nearby Settlements:
                        </div>
                        <div className="space-y-1 mb-2 text-xs text-slate-400 max-h-12 overflow-y-auto">
                          {currentLocation?.connectedLocations && Object.entries(currentLocation.connectedLocations).map(([locationId, travelTime]) => {
                            const connectedLocation = getLocation(locationId);
                            if (connectedLocation?.type === 'settlement') {
                              return (
                                <div key={locationId} className="flex justify-between hover:text-slate-300 transition-colors duration-200 cursor-pointer">
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
                          className="w-full text-xs hover:scale-105 transition-transform duration-200"
                          icon={<MapIcon />}
                        >
                          <span className="hidden sm:inline">View Travel Options</span>
                          <span className="sm:hidden">Travel Options</span>
                        </ActionButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Explore World Section - Enhanced */}
              <div className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto space-y-2 sm:space-y-3 md:space-y-4">
                  {/* Homestead Section - Enhanced Card */}
                  <div className={`${cardBaseClasses} ${cardHoverClasses} bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30 p-2 sm:p-3 relative overflow-hidden`}>
                    {/* Ambient background effect */}
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12">
                          <HomeIcon className="w-4 h-4 text-amber-400" />
                        </div>
                        <h4 className="text-sm sm:text-base lg:text-lg font-medium text-amber-300">Homestead</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2 line-clamp-2">Your personal base of operations where you can craft, store items, and develop your properties.</p>
                      <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                        <div className="bg-slate-800/30 rounded p-1 text-center hover:bg-slate-700/30 transition-colors duration-200">
                          <div className="text-slate-400">Garden</div>
                          <div className="text-amber-300 font-medium">Lv.1</div>
                        </div>
                        <div className="bg-slate-800/30 rounded p-1 text-center hover:bg-slate-700/30 transition-colors duration-200">
                          <div className="text-slate-400">Workshop</div>
                          <div className="text-amber-300 font-medium">Lv.1</div>
                        </div>
                        <div className="bg-slate-800/30 rounded p-1 text-center hover:bg-slate-700/30 transition-colors duration-200">
                          <div className="text-slate-400">Storage</div>
                          <div className="text-amber-300 font-medium">Lv.1</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
                        <div className="bg-slate-800/30 rounded p-1 text-center hover:bg-slate-700/30 transition-colors duration-200">
                          <div className="text-slate-400">Resources</div>
                          <div className="text-green-300 font-medium">Available</div>
                        </div>
                        <div className="bg-slate-800/30 rounded p-1 text-center hover:bg-slate-700/30 transition-colors duration-200">
                          <div className="text-slate-400">Upgrades</div>
                          <div className="text-blue-300 font-medium">Ready</div>
                        </div>
                      </div>
                      <ActionButton 
                        onClick={onOpenHomestead} 
                        variant="secondary" 
                        size="sm"
                        className="w-full text-xs hover:scale-105 transition-transform duration-200 hover:bg-amber-600/20 hover:border-amber-500/50"
                        icon={<HomeIcon />}
                      >
                        <span className="hidden sm:inline">Visit Homestead</span>
                        <span className="sm:hidden">Homestead</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Combat & Activities */}
            <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 h-full">
              {/* Combat Section - Enhanced */}
              <div className={`${cardBaseClasses} ${cardHoverClasses} bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0 relative overflow-hidden`}>
                {/* Ambient background effect */}
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-red-500/20 to-orange-500/20" />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3 md:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12">
                      <SkullIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-red-400" />
                    </div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-red-300">Combat</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (currentLocation?.dangerLevel || 0) <= 3 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      (currentLocation?.dangerLevel || 0) <= 6 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      Danger {currentLocation?.dangerLevel || '?'}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-lg p-2 sm:p-3 border border-slate-600/50 shadow-inner mb-2 sm:mb-3">
                    <p className="text-xs text-slate-300 mb-1 sm:mb-2">
                      Test your skills against the dangers that lurk in {locationName}. 
                      {currentLocation?.dangerLevel && ` Danger Level: ${currentLocation.dangerLevel}`}
                    </p>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div className="hover:text-slate-300 transition-colors duration-200">• Gain experience and loot from victories</div>
                      <div className="hover:text-slate-300 transition-colors duration-200">• Risk vs reward based on location danger</div>
                      <div className="hidden lg:block hover:text-slate-300 transition-colors duration-200">• Strategic combat with spells and abilities</div>
                    </div>
                  </div>

                  {/* Battle Button Group with Dropdown */}
                  <div className="relative">
                    <div className="flex">
                      <ActionButton 
                        onClick={() => handleBattleModeSelect(selectedBattleMode.type, selectedBattleMode.label)} 
                        variant="danger" 
                        size="lg" 
                        isLoading={isLoading} 
                        icon={<SkullIcon />} 
                        className="flex-1 text-sm hover:scale-105 transition-transform duration-200 rounded-r-none"
                      >
                        {selectedBattleMode.label}
                      </ActionButton>
                      <button
                        onClick={() => setShowBattleOptions(!showBattleOptions)}
                        className="bg-red-600 hover:bg-red-700 border border-red-500 border-l-red-400 text-white px-3 py-2 rounded-r-lg transition-all duration-200 flex items-center justify-center hover:scale-105"
                      >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${showBattleOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Battle Options Dropdown */}
                    {showBattleOptions && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => handleBattleModeSelect('quick', 'Seek Battle')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-red-600/20 hover:text-red-300 rounded transition-all duration-200 hover:scale-105"
                          >
                            <div className="font-medium">Quick Battle</div>
                            <div className="text-slate-400">Find a random enemy</div>
                          </button>
                          <button
                            onClick={() => handleBattleModeSelect('boss', 'Boss Battle')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-red-600/20 hover:text-red-300 rounded transition-all duration-200 hover:scale-105"
                          >
                            <div className="font-medium">Boss Battle</div>
                            <div className="text-slate-400">Challenge area boss</div>
                          </button>
                          <button
                            onClick={() => handleBattleModeSelect('arena', 'Arena')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-red-600/20 hover:text-red-300 rounded transition-all duration-200 hover:scale-105"
                          >
                            <div className="font-medium">Arena</div>
                            <div className="text-slate-400">Competitive battles</div>
                          </button>
                          <button
                            onClick={() => handleBattleModeSelect('dungeon', 'Dungeon')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-red-600/20 hover:text-red-300 rounded transition-all duration-200 hover:scale-105"
                          >
                            <div className="font-medium">Dungeon</div>
                            <div className="text-slate-400">Multi-floor challenges</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PvP Arena Button */}
                  <ActionButton 
                    onClick={onOpenMultiplayer} 
                    variant="warning" 
                    size="sm" 
                    icon={<SwordsIcon />} 
                    className="w-full text-xs mt-2 bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500/90 hover:to-red-500/90 border-orange-500/50 hover:border-red-500/60 hover:scale-105 transition-all duration-200"
                  >
                    <span className="flex items-center space-x-1">
                      <span>⚔️</span>
                      <span>PvP Arena</span>
                    </span>
                  </ActionButton>
                </div>
              </div>

              {/* Multiplayer Section - Enhanced with Detailed Interface */}
              <div className={`${cardBaseClasses} ${cardHoverClasses} bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/60 p-2 sm:p-3 md:p-4 lg:p-5 flex-shrink-0 relative overflow-hidden`}>
                {/* Ambient background effect */}
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3 md:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12">
                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-400" />
                    </div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-purple-300">Multiplayer</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Online
                    </span>
                  </div>
                  
                  {/* Multiplayer Tabs */}
                  <div className="flex flex-col h-48">
                    <div className="flex border-b border-slate-600/30 mb-3">
                      <button 
                        onClick={() => setActiveMultiplayerTab('chat')}
                        className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          activeMultiplayerTab === 'chat' 
                            ? 'text-purple-300 border-b-2 border-purple-500/50 bg-purple-500/10' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Chat
                      </button>
                      <button 
                        onClick={() => setActiveMultiplayerTab('party')}
                        className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          activeMultiplayerTab === 'party' 
                            ? 'text-purple-300 border-b-2 border-purple-500/50 bg-purple-500/10' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Party
                      </button>
                      <button 
                        onClick={() => setActiveMultiplayerTab('community')}
                        className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          activeMultiplayerTab === 'community' 
                            ? 'text-purple-300 border-b-2 border-purple-500/50 bg-purple-500/10' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Community
                      </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="flex-1 bg-slate-800/30 rounded-lg p-2 overflow-hidden backdrop-blur-sm">
                      <div className="h-full flex flex-col">
                        {activeMultiplayerTab === 'chat' && (
                          <>
                            <div className="flex-1 text-xs text-slate-400 mb-2 overflow-y-auto">
                              <div className="space-y-1">
                                <div className="hover:bg-slate-700/30 p-1 rounded transition-colors duration-200"><span className="text-blue-300">Player1:</span> Anyone up for a dungeon run?</div>
                                <div className="hover:bg-slate-700/30 p-1 rounded transition-colors duration-200"><span className="text-green-300">Player2:</span> I'm in! What level?</div>
                                <div className="hover:bg-slate-700/30 p-1 rounded transition-colors duration-200"><span className="text-yellow-300">Player3:</span> Need help with crafting quest</div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <input 
                                type="text" 
                                placeholder="Type message..." 
                                className="flex-1 bg-slate-700/50 border border-slate-600/30 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500/50 focus:outline-none transition-colors duration-200"
                              />
                              <button className="bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 transition-all duration-200 hover:scale-105">
                                Send
                              </button>
                            </div>
                          </>
                        )}
                        
                        {activeMultiplayerTab === 'party' && (
                          <>
                            <div className="flex-1 text-xs text-slate-400 mb-2 overflow-y-auto">
                              <div className="space-y-1">
                                <div className="text-center text-slate-500 mb-2">No active party</div>
                                <div className="bg-slate-700/30 rounded p-2 text-center hover:bg-slate-600/30 transition-colors duration-200">
                                  <div className="text-slate-300 mb-1">Create Party</div>
                                  <div className="text-slate-500 text-xs">Invite friends to adventure together</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button className="flex-1 bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 transition-all duration-200 hover:scale-105">
                                Create Party
                              </button>
                              <button className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/30 rounded px-2 py-1 text-xs text-slate-200 transition-all duration-200 hover:scale-105">
                                Find Party
                              </button>
                            </div>
                          </>
                        )}
                        
                        {activeMultiplayerTab === 'community' && (
                          <>
                            <div className="flex-1 text-xs text-slate-400 mb-2 overflow-y-auto">
                              <div className="space-y-1">
                                <div className="text-center text-slate-500 mb-2">Community Hub</div>
                                <div className="space-y-1">
                                  <div className="bg-slate-700/30 rounded p-2 hover:bg-slate-600/30 transition-colors duration-200 cursor-pointer">
                                    <div className="text-slate-300 text-xs font-medium">Guild Recruitment</div>
                                    <div className="text-slate-500 text-xs">Join active guilds</div>
                                  </div>
                                  <div className="bg-slate-700/30 rounded p-2 hover:bg-slate-600/30 transition-colors duration-200 cursor-pointer">
                                    <div className="text-slate-300 text-xs font-medium">Events</div>
                                    <div className="text-slate-500 text-xs">Weekly tournaments</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button className="flex-1 bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 transition-all duration-200 hover:scale-105">
                                Browse Guilds
                              </button>
                              <button className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/30 rounded px-2 py-1 text-xs text-slate-200 transition-all duration-200 hover:scale-105">
                                View Events
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Full Multiplayer Button */}
                  <div className="mt-2">
                    <ActionButton 
                      onClick={onOpenMultiplayer} 
                      variant="primary" 
                      size="sm"
                      className="w-full text-xs hover:scale-105 transition-transform duration-200"
                      icon={<UserIcon />}
                    >
                      View Full Multiplayer
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Column - Feature Cards with Enhanced Responsive Layout */}
            <div className="flex flex-col h-full min-h-0">
              {/* Feature Cards Grid - Single Column Layout with SortableContext */}
              <SortableContext items={activityOrder} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 gap-1 sm:gap-1.5 md:gap-2 h-full overflow-y-auto">
                  {activityOrder.map((activityId) => {
                    const activity = activityCards.find(card => card.id === activityId);
                    if (!activity) return null;
                    
                    return (
                      <div key={activity.id} className="transition-all duration-300 ease-in-out">
                        <ActivityCard
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
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </div>
          </div>

          {/* Mobile Layout - Additional Actions for smaller screens with Enhanced Responsiveness */}
          <div className="xl:hidden mt-2 sm:mt-3 md:mt-4">
            <div className={`${cardBaseClasses} bg-slate-800/50 border-slate-700/60 p-2 sm:p-3`}>
              <div className="text-xs text-slate-400 text-center mb-2 flex items-center justify-center">
                <GearIcon className="w-3 h-3 mr-1" />
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-slate-700/30 rounded-lg p-2 text-center hover:bg-slate-600/30 transition-all duration-200 hover:scale-105">
                  <div className="text-xs text-slate-400">Settings</div>
                  <div className="text-xs text-slate-500">Customize UI</div>
                </button>
                <button className="bg-slate-700/30 rounded-lg p-2 text-center hover:bg-slate-600/30 transition-all duration-200 hover:scale-105">
                  <div className="text-xs text-slate-400">Help</div>
                  <div className="text-xs text-slate-500">Game Guide</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default HomeScreenView;
