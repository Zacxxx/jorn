import React from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import SpriteAnimation from './SpriteAnimation'; // Added import
import ActionButton from './ActionButton';
import ActivityCard from './ActivityCard';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon, TentIcon, HomeIcon, BuildingIcon, UserIcon, GearIcon, PlusIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

// Conditional import for PlayerStatsDisplay to avoid type conflicts
let PlayerStatsDisplay: React.ComponentType<any> | null = null;
try {
  PlayerStatsDisplay = require('./PlayerStatsDisplay').default;
} catch (error) {
  console.warn('PlayerStatsDisplay not available:', error);
}

// Rest preferences storage
const REST_PREFERENCES_KEY = 'jorn-rest-preferences';

interface RestPreferences {
  preferredRestType: 'short' | 'long' | 'custom';
  customDuration: number;
}

const DEFAULT_REST_PREFERENCES: RestPreferences = {
  preferredRestType: 'long',
  customDuration: 4
};

const loadRestPreferences = (): RestPreferences => {
  try {
    const stored = localStorage.getItem(REST_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_REST_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load rest preferences:', error);
  }
  return { ...DEFAULT_REST_PREFERENCES };
};

const saveRestPreferences = (preferences: RestPreferences): void => {
  try {
    localStorage.setItem(REST_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save rest preferences:', error);
  }
};

interface HomeScreenViewProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onFindEnemy: () => void;
  isLoading: boolean;
  onExploreMap: () => void;
  onOpenResearchArchives: () => void; 
  onOpenCamp: () => void;
  onRestComplete: (restType: 'short' | 'long', duration?: number, activity?: string) => void;
  onAccessSettlement: () => void;
  onOpenCraftingHub: () => void;
  onOpenHomestead: () => void;
  onOpenNPCs: () => void;
  onOpenQuestBook: () => void;
  onNavigateToMultiplayer: () => void;
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  player,
  effectiveStats,
  onFindEnemy,
  isLoading,
  onExploreMap,
  onOpenResearchArchives,
  onOpenCamp,
  onRestComplete,
  onAccessSettlement,
  onOpenCraftingHub,
  onOpenHomestead,
  onOpenNPCs,
  onOpenQuestBook,
  onNavigateToMultiplayer,
}) => {
  // State for activity card ordering
  const [activityOrder] = React.useState([
    'camp', 'research', 'crafting', 'npcs', 'quests', 'trading'
  ]);

  // Rest preferences state
  const [restPreferences, setRestPreferences] = React.useState<RestPreferences>(loadRestPreferences);
  const [showRestDropdown, setShowRestDropdown] = React.useState(false);

  // Calculate quest statistics
  const questStats = React.useMemo(() => {
    const activeQuests = player.quests.filter(q => q.status === 'active').length;
    const completedQuests = player.quests.filter(q => q.status === 'completed').length;
    const failedQuests = player.quests.filter(q => q.status === 'failed').length;
    
    return {
      active: activeQuests,
      completed: completedQuests,
      failed: failedQuests
    };
  }, [player.quests]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showRestDropdown) {
        const target = event.target as Element;
        if (!target.closest('.rest-dropdown-container')) {
          setShowRestDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRestDropdown]);

  // Update rest preferences and save to localStorage
  const updateRestPreferences = (newPreferences: Partial<RestPreferences>) => {
    const updated = { ...restPreferences, ...newPreferences };
    setRestPreferences(updated);
    saveRestPreferences(updated);
  };

  // Handle quick rest (using preferred settings)
  const handleQuickRest = () => {
    const { preferredRestType, customDuration } = restPreferences;
    const duration = preferredRestType === 'custom' ? customDuration : undefined;
    onRestComplete(preferredRestType === 'custom' ? 'long' : preferredRestType, duration);
  };

  // Handle rest type selection from dropdown
  const handleRestTypeSelect = (restType: 'short' | 'long' | 'custom', customDuration?: number) => {
    const preferences: Partial<RestPreferences> = { preferredRestType: restType };
    if (customDuration !== undefined) {
      preferences.customDuration = customDuration;
    }
    updateRestPreferences(preferences);
    
    const duration = restType === 'custom' ? (customDuration || restPreferences.customDuration) : undefined;
    onRestComplete(restType === 'custom' ? 'long' : restType, duration);
    setShowRestDropdown(false);
  };

  // Calculate rest benefits for display
  const getRestBenefits = (restType: 'short' | 'long' | 'custom', customDuration?: number) => {
    const duration = customDuration || restPreferences.customDuration;
    
    switch (restType) {
      case 'short':
        return {
          hp: Math.min(Math.floor(effectiveStats.maxHp * 0.25), effectiveStats.maxHp - player.hp),
          mp: Math.min(Math.floor(effectiveStats.maxMp * 0.5), effectiveStats.maxMp - player.mp),
          ep: Math.min(Math.floor(effectiveStats.maxEp * 0.75), effectiveStats.maxEp - player.ep),
          duration: '1h'
        };
      case 'long':
        return {
          hp: effectiveStats.maxHp - player.hp,
          mp: effectiveStats.maxMp - player.mp,
          ep: effectiveStats.maxEp - player.ep,
          duration: '8h'
        };
      case 'custom':
        return {
          hp: Math.min(Math.floor(effectiveStats.maxHp * (duration / 8)), effectiveStats.maxHp - player.hp),
          mp: Math.min(Math.floor(effectiveStats.maxMp * (duration / 8)), effectiveStats.maxMp - player.mp),
          ep: Math.min(Math.floor(effectiveStats.maxEp * (duration / 8)), effectiveStats.maxEp - player.ep),
          duration: `${duration}h`
        };
      default:
        return { hp: 0, mp: 0, ep: 0, duration: '0h' };
    }
  };

  const currentLocation = getLocation(player.currentLocationId);
  const locationName = currentLocation?.name || 'Unknown Location';
  const locationDescription = currentLocation?.description || 'A mysterious place...';
  const isInSettlement = currentLocation?.type === 'settlement';

  // Check if player needs rest
  const needsRest = player.hp < effectiveStats.maxHp || 
                   player.mp < effectiveStats.maxMp || 
                   player.ep < effectiveStats.maxEp;

  // Get current rest benefits for display
  const currentRestBenefits = getRestBenefits(restPreferences.preferredRestType, restPreferences.customDuration);

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
      backgroundImage: '/assets/activity-card/camp.svg',
      gifBackgroundImage: '/assets/activity-card/camp.gif'
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
      backgroundImage: '/assets/activity-card/research.svg',
      gifBackgroundImage: '/assets/activity-card/research.gif'
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
      backgroundImage: '/assets/activity-card/crafting.svg',
      gifBackgroundImage: '/assets/activity-card/crafting.gif'
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
      backgroundImage: '/assets/activity-card/npcs.svg',
      gifBackgroundImage: '/assets/activity-card/npcs.gif'
    },
    {
      id: 'quests',
      title: 'Quest Book',
      shortTitle: 'Quests',
      description: 'Track your active quests and view completed adventures.',
      icon: <BookIcon />,
      variant: 'warning' as const,
      onClick: onOpenQuestBook,
      benefits: [`Active: ${questStats.active}`, `Completed: ${questStats.completed}`, `Failed: ${questStats.failed}`],
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      backgroundImage: '/assets/activity-card/quests.svg',
      gifBackgroundImage: '/assets/activity-card/quests.gif'
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
      backgroundImage: '/assets/activity-card/trading.svg',
      gifBackgroundImage: '/assets/activity-card/trading.gif'
    }
  ];

  return (
    <div className="min-h-screen md:min-h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] w-full max-w-none mx-0 px-4 overflow-hidden">
      <SpriteAnimation
        imageUrl="assets/activity-card/camp.gif"
        altText="Animated background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          objectFit: 'cover',
        }}
      />
      {/* Player Stats Display - Conditional Rendering */}
      {PlayerStatsDisplay && (
        <div className="mb-4">
          <PlayerStatsDisplay player={player} effectiveStats={effectiveStats} />
        </div>
      )}
      
      {/* Main Bento Box Layout */}
      <div className="h-full py-2">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-3 h-full">
          
          {/* Top Row - Location Info with Details and Homestead (spans full width) */}
          {/* Mobile: order-2, Desktop: order-none (implicit first) */}
          <div className="order-2 md:order-none col-span-full md:col-span-12 md:row-span-2 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md rounded-xl shadow-xl border border-green-700/60 p-4">
            {/* Top Section - Main Location Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                  {isInSettlement ? <BuildingIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-300">{locationName}</h3>
                  <p className="text-xs sm:text-sm text-slate-300">{currentLocation?.type} • Danger Level {currentLocation?.dangerLevel || '?'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isInSettlement && (
                  <ActionButton onClick={onAccessSettlement} variant="primary" size="sm" icon={<BuildingIcon />}>
                    Settlement
                  </ActionButton>
                )}
                <ActionButton onClick={onExploreMap} variant="success" size="sm" icon={<MapIcon />}>
                  Map
                </ActionButton>
              </div>
            </div>

            {/* Bottom Section - Location Details and Homestead */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Location Details */}
              <div className="col-span-1 lg:col-span-6 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-lg p-3 border border-slate-600/30">
                <h4 className="text-base font-semibold text-slate-200 mb-3">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-slate-200 capitalize">{currentLocation?.type || 'Unknown'}</span>
                    </div>
                    {isInSettlement && currentLocation?.settlement && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Population:</span>
                        <span className="text-slate-200">{currentLocation.settlement.population.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Danger:</span>
                      <span className="text-slate-200">Level {currentLocation?.dangerLevel || '?'}</span>
                    </div>
                    {isInSettlement && currentLocation?.settlement && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">NPCs:</span>
                        <span className="text-slate-200">{currentLocation.settlement.npcs.length} available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Homestead Section */}
              <div className="col-span-1 lg:col-span-6 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-lg p-3 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-amber-300">Homestead</h4>
                      <p className="text-2xs sm:text-xs text-slate-300">Your base of operations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-1 text-2xs sm:text-xs flex-grow sm:flex-grow-0">
                      <div className="bg-slate-800/30 rounded px-1 sm:px-2 py-1 text-center">
                        <div className="text-slate-400">Garden</div>
                        <div className="text-amber-300 font-medium">Lv.1</div>
                      </div>
                      <div className="bg-slate-800/30 rounded px-2 py-1 text-center">
                        <div className="text-slate-400">Workshop</div>
                        <div className="text-amber-300 font-medium">Lv.1</div>
                      </div>
                    </div>
                    <ActionButton onClick={onOpenHomestead} variant="secondary" size="sm" icon={<HomeIcon />}>
                      Visit
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Activity Cards (3 cards) */}
          {/* Mobile: order-3, Desktop: order-none (implicit second) */}
          <div className="order-3 md:order-none col-span-full md:col-span-3 md:row-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-rows-3 gap-2">
            {activityOrder.slice(0, 3).map((activityId) => {
              const activity = activityCards.find(card => card.id === activityId);
              if (!activity) return null;
              
              return (
                <div key={activity.id} className="w-full h-full"> {/* Ensure cards take full width/height of grid cell */}
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
                    gifBackgroundImage={activity.gifBackgroundImage}
                  />
                </div>
              );
            })}
          </div>

          {/* Center Column - BATTLE SECTION (Hero/Focus Area) */}
          {/* Mobile: order-1, Desktop: order-none (implicit third) */}
          <div className="order-1 md:order-none col-span-full md:col-span-6 md:row-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-red-700/60 p-4 sm:p-6 flex flex-col">
            {/* Battle Header */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                <SkullIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-red-300">COMBAT</h2>
                <p className="text-base sm:text-lg text-slate-300">Test Your Skills</p>
              </div>
            </div>

            {/* Battle Info */}
            <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-600/50 shadow-inner mb-4 sm:mb-6 flex-1">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-1 sm:mb-2">Battle in {locationName}</h3>
                <p className="text-xs sm:text-sm text-slate-300">Danger Level: {currentLocation?.dangerLevel || '?'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
                <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                  <div className="text-slate-400">Experience</div>
                  <div className="text-green-300 font-semibold">High Gain</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                  <div className="text-slate-400">Loot</div>
                  <div className="text-blue-300 font-semibold">Valuable</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                  <div className="text-slate-400">Risk</div>
                  <div className="text-red-300 font-semibold">Moderate</div>
                </div>
              </div>
            </div>

            {/* Battle Actions */}
            <div className="space-y-3">
              <ActionButton 
                onClick={onFindEnemy} 
                variant="danger" 
                size="lg" 
                isLoading={isLoading} 
                icon={<SkullIcon />} 
                className="w-full text-lg sm:text-xl py-3 sm:py-4 hover:scale-105 transition-transform duration-200 font-bold"
              >
                SEEK BATTLE
              </ActionButton>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <ActionButton onClick={onNavigateToMultiplayer} variant="primary" size="sm" icon={<UserIcon />}>
                  Multiplayer
                </ActionButton>
                
                {/* Enhanced Rest Button with Dropdown */}
                <div className="relative rest-dropdown-container">
                  <div className="flex">
                    {/* Main Rest Button */}
                    <ActionButton 
                      onClick={handleQuickRest} 
                      variant="secondary" 
                      size="sm" 
                      icon={<TentIcon />}
                      disabled={!needsRest}
                      className="flex-1 rounded-r-none border-r-0"
                      title={`Quick ${restPreferences.preferredRestType} rest (${currentRestBenefits.duration})`}
                    >
                      <span className="hidden sm:inline">Rest</span>
                      <span className="sm:hidden">Rest</span>
                    </ActionButton>
                    
                    {/* Dropdown Arrow Button */}
                    <ActionButton
                      onClick={() => setShowRestDropdown(!showRestDropdown)}
                      variant="secondary"
                      size="sm"
                      className="px-2 rounded-l-none border-l border-slate-600/50"
                      title="Rest options"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </ActionButton>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {showRestDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-600/50 shadow-2xl z-50">
                      <div className="p-2 space-y-1">
                        {/* Short Rest Option */}
                        <button
                          onClick={() => handleRestTypeSelect('short')}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            restPreferences.preferredRestType === 'short'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'hover:bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Short Rest</span>
                            <span className="text-xs text-slate-400">1h</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            +{getRestBenefits('short').hp} HP, +{getRestBenefits('short').mp} MP, +{getRestBenefits('short').ep} EP
                          </div>
                        </button>
                        
                        {/* Long Rest Option */}
                        <button
                          onClick={() => handleRestTypeSelect('long')}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            restPreferences.preferredRestType === 'long'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'hover:bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Long Rest</span>
                            <span className="text-xs text-slate-400">8h</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            +{getRestBenefits('long').hp} HP, +{getRestBenefits('long').mp} MP, +{getRestBenefits('long').ep} EP
                          </div>
                        </button>
                        
                        {/* Custom Rest Options */}
                        <div className="border-t border-slate-600/50 pt-1 mt-1">
                          <div className="px-3 py-1 text-xs text-slate-400 font-medium">Custom Duration</div>
                          {[2, 4, 6].map(hours => (
                            <button
                              key={hours}
                              onClick={() => handleRestTypeSelect('custom', hours)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                restPreferences.preferredRestType === 'custom' && restPreferences.customDuration === hours
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'hover:bg-slate-700/50 text-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{hours}h Rest</span>
                                <span className="text-xs text-slate-400">{hours}h</span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                +{getRestBenefits('custom', hours).hp} HP, +{getRestBenefits('custom', hours).mp} MP, +{getRestBenefits('custom', hours).ep} EP
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {/* Full Camp Option */}
                        <div className="border-t border-slate-600/50 pt-1 mt-1">
                          <button
                            onClick={() => {
                              onOpenCamp();
                              setShowRestDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-slate-700/50 text-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <TentIcon className="w-4 h-4" />
                              <span className="font-medium">Full Camp Menu</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              Advanced rest options & activities
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity Cards (3 cards) */}
          {/* Mobile: order-4, Desktop: order-none (implicit fourth) */}
          <div className="order-4 md:order-none col-span-full md:col-span-3 md:row-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-rows-3 gap-2">
            {activityOrder.slice(3, 6).map((activityId) => {
              const activity = activityCards.find(card => card.id === activityId);
              if (!activity) return null;
              
              return (
                <div key={activity.id} className="w-full h-full"> {/* Ensure cards take full width/height of grid cell */}
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
                    gifBackgroundImage={activity.gifBackgroundImage}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeScreenView; 