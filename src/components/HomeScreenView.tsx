import React from 'react';
import { Player, PlayerEffectiveStats, Enemy } from '../types';
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

// Video background configuration
const VIDEO_PLAYBACK_RATE = 1; // Normal speed (1.0 = 100% speed)
// Alternative rates: 0.1 (ultra slow), 0.5 (slow), 0.75 (slightly slow), 1.0 (normal)

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
  currentEnemies: Enemy[];
  onReturnToCombat: () => void;
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
  currentEnemies,
  onReturnToCombat,
}) => {
  // Video ref for controlling playback
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // State for activity card ordering
  const [activityOrder] = React.useState([
    'camp', 'research', 'crafting', 'npcs', 'quests', 'trading'
  ]);

  // Rest preferences state
  const [restPreferences, setRestPreferences] = React.useState<RestPreferences>(loadRestPreferences);
  const [showRestDropdown, setShowRestDropdown] = React.useState(false);

  // Combat area hover state
  const [isCombatHovered, setIsCombatHovered] = React.useState(false);
  const [combatGifLoaded, setCombatGifLoaded] = React.useState(false);
  const [combatGifError, setCombatGifError] = React.useState(false);

  // Battle dropdown state
  const [showBattleDropdown, setShowBattleDropdown] = React.useState(false);
  const [selectedBattleType, setSelectedBattleType] = React.useState<'normal' | 'elite' | 'boss' | 'arena'>('normal');

  // Exploration area hover state
  const [isExplorationHovered, setIsExplorationHovered] = React.useState(false);
  const [explorationGifLoaded, setExplorationGifLoaded] = React.useState(false);
  const [explorationGifError, setExplorationGifError] = React.useState(false);

  // Homestead area hover state
  const [isHomesteadHovered, setIsHomesteadHovered] = React.useState(false);
  const [homesteadGifLoaded, setHomesteadGifLoaded] = React.useState(false);
  const [homesteadGifError, setHomesteadGifError] = React.useState(false);

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
      const target = event.target as Element;
      
      if (showRestDropdown && !target.closest('.rest-dropdown-container')) {
        setShowRestDropdown(false);
      }
      
      if (showBattleDropdown && !target.closest('.battle-dropdown-container')) {
        setShowBattleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRestDropdown, showBattleDropdown]);

  // Preload all GIFs on page load instead of on hover
  React.useEffect(() => {
    const preloadGifs = [
      '/assets/activity-card/battle-2.gif',
      '/assets/activity-card/research.gif',
      '/assets/activity-card/camp.gif'
    ];

    preloadGifs.forEach(src => {
      const img = new Image();
      img.onload = () => {
        if (src.includes('battle-2')) setCombatGifLoaded(true);
        if (src.includes('research')) setExplorationGifLoaded(true);
        if (src.includes('camp')) setHomesteadGifLoaded(true);
      };
      img.onerror = () => {
        if (src.includes('battle-2')) setCombatGifError(true);
        if (src.includes('research')) setExplorationGifError(true);
        if (src.includes('camp')) setHomesteadGifError(true);
      };
      img.src = src;
    });
  }, []); // Run once on component mount

  // Set video playback rate to be very slow
  React.useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        // Set playback rate to be very slow (0.25 = 25% of normal speed)
        video.playbackRate = VIDEO_PLAYBACK_RATE;
      };

      video.addEventListener('loadeddata', handleLoadedData);
      
      // If video is already loaded, set the rate immediately
      if (video.readyState >= 2) {
        video.playbackRate = VIDEO_PLAYBACK_RATE;
      }

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

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

  // Handle battle type selection
  const handleBattleTypeSelect = (battleType: 'normal' | 'elite' | 'boss' | 'arena') => {
    setSelectedBattleType(battleType);
    setShowBattleDropdown(false);
  };

  // Handle battle launch with selected type
  const handleLaunchBattle = () => {
    // Check if there's an active battle (living enemies)
    if (isInBattle) {
      // Return to active battle
      onReturnToCombat();
    } else {
      // Start new battle
      console.log('Launching battle type:', selectedBattleType);
      onFindEnemy();
    }
  };

  // Get battle type information
  const getBattleTypeInfo = (battleType: 'normal' | 'elite' | 'boss' | 'arena') => {
    switch (battleType) {
      case 'normal':
        return {
          name: 'Normal Battle',
          description: 'Standard encounter',
          difficulty: 'Normal',
          rewards: 'Standard XP & Loot',
          color: 'text-green-300'
        };
      case 'elite':
        return {
          name: 'Elite Battle',
          description: 'Challenging encounter',
          difficulty: 'Hard',
          rewards: 'Bonus XP & Rare Loot',
          color: 'text-blue-300'
        };
      case 'boss':
        return {
          name: 'Boss Battle',
          description: 'Epic encounter',
          difficulty: 'Very Hard',
          rewards: 'High XP & Epic Loot',
          color: 'text-purple-300'
        };
      case 'arena':
        return {
          name: 'Arena Battle',
          description: 'Endless waves',
          difficulty: 'Scaling',
          rewards: 'Progressive Rewards',
          color: 'text-orange-300'
        };
    }
  };

  const currentBattleInfo = getBattleTypeInfo(selectedBattleType);

  // Check if there's an active battle (living enemies)
  const isInBattle = currentEnemies.length > 0 && currentEnemies.some(enemy => enemy.hp > 0);

  // Check if player needs rest and is not in combat
  const needsRest = (player.hp < effectiveStats.maxHp || 
                    player.mp < effectiveStats.maxMp || 
                    player.ep < effectiveStats.maxEp) && 
                    !isInBattle; // Cannot rest while in active combat

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

  // Get current rest benefits for display
  const currentRestBenefits = getRestBenefits(restPreferences.preferredRestType, restPreferences.customDuration);

  // Activity cards data
  const activityCards = [
    {
      id: 'camp',
      title: 'Camp',
      shortTitle: 'Camp',
      description: isInBattle 
        ? 'Cannot rest while enemies are present!' 
        : 'Set up camp to rest and recover your health, mana, and energy.',
      icon: <TentIcon />,
      variant: 'secondary' as const,
      onClick: isInBattle ? () => {} : onOpenCamp, // Disable if in combat
      benefits: isInBattle 
        ? ['Defeat enemies first', 'Or flee from combat', 'Then rest safely'] 
        : ['Restore HP/MP/EP', 'Choose rest activities', 'Safe recovery'],
      color: isInBattle 
        ? 'from-red-500/20 to-red-600/20' 
        : 'from-amber-500/20 to-amber-600/20',
      borderColor: isInBattle 
        ? 'border-red-500/30' 
        : 'border-amber-500/30',
      iconColor: isInBattle 
        ? 'text-red-400' 
        : 'text-amber-400',
      backgroundImage: '/assets/activity-card/camp.svg',
      gifBackgroundImage: '/assets/activity-card/camp.gif'
    },
    {
      id: 'research',
      title: 'Research',
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
      title: 'Workshop',
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
      title: 'NPCs',
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
      title: 'Quests',
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
      gifBackgroundImage: '/assets/activity-card/questbook.gif'
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
      gifBackgroundImage: '/assets/activity-card/market.gif'
    }
  ];

  return (
    <div className="min-h-screen md:min-h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] w-full max-w-none mx-0 px-4 overflow-hidden relative">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -20,
          objectFit: 'cover',
          // Video filters for darker, blurry background effect
          // Current: Heavy blur, quite dark, enhanced contrast, reduced saturation
          // Playback rate is set to 0.25 (25% speed) via useEffect for slow motion
          filter: 'blur(25px) brightness(0.4) contrast(1.3) saturate(0.8)',
          // Alternative filter options:
          // Subtle: 'blur(1px) brightness(0.6) contrast(1.05) saturate(0.9)'
          // Heavy: 'blur(3px) brightness(0.3) contrast(1.2) saturate(0.7)'
          // Cinematic: 'blur(2px) brightness(0.5) contrast(1.3) saturate(0.6) sepia(0.1)'
          // Alternative playback rates:
          // Very slow: 0.1 (10% speed), Slow: 0.5 (50% speed), Normal: 1.0 (100% speed)
        }}
        onError={() => {
          console.warn('Video background failed to load');
        }}
      >
        <source src="/assets/background/jorn-background-2.mp4" type="video/webm" />
      </video>
      
      {/* Fallback background for when video doesn't load */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -25,
          filter: 'brightness(0.6)',
        }}
      />
      
      {/* Dark overlay to ensure text readability */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-black/10"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -15,
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
          <div 
            className="order-2 md:order-none col-span-full md:col-span-12 md:row-span-2 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md rounded-xl shadow-xl border border-green-700/60 p-4 relative overflow-hidden transition-all duration-300 hover:shadow-3xl"
            onMouseEnter={() => setIsExplorationHovered(true)}
            onMouseLeave={() => setIsExplorationHovered(false)}
          >
            {/* Background Animation Layer */}
            <div className={`absolute inset-0 transition-all duration-500 rounded-xl overflow-hidden ${
              isExplorationHovered ? 'opacity-20' : 'opacity-0'
            }`}>
              {/* Static preview image - always visible when hovered */}
              <img
                src="/assets/activity-card/research.svg"
                alt="Exploration preview"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isExplorationHovered && explorationGifLoaded && !explorationGifError && !isHomesteadHovered ? 'opacity-0' : 'opacity-60'
                }`}
                style={{
                  filter: 'brightness(0.6) contrast(0.9) hue-rotate(-30deg)',
                }}
              />
              
              {/* GIF animation - only visible when hovered and loaded */}
              <img
                src={isExplorationHovered && !isHomesteadHovered ? '/assets/activity-card/research.gif' : ''}
                alt="Exploration animation"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isExplorationHovered && explorationGifLoaded && !explorationGifError && !isHomesteadHovered ? 'opacity-70 scale-110' : 'opacity-0'
                }`}
                style={{
                  filter: isExplorationHovered && explorationGifLoaded && !isHomesteadHovered ? 'brightness(0.8) contrast(1.1) saturate(1.2) hue-rotate(-30deg)' : 'brightness(0.6) contrast(0.9)',
                }}
                onLoad={() => setExplorationGifLoaded(true)}
                onError={() => setExplorationGifError(true)}
              />
              
              {/* Loading indicator for GIF */}
              {isExplorationHovered && !explorationGifLoaded && !explorationGifError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-300/30 border-t-green-300/80 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Exploration-specific overlay effects */}
              <div className={`absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-green-900/40 transition-all duration-500 ${
                isExplorationHovered ? 'opacity-70' : 'opacity-90'
              }`} />
              <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 transition-opacity duration-500 ${
                isExplorationHovered ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>

            {/* Top Section - Main Location Info */}
            <div className={`relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 transition-all duration-300 ${
              isExplorationHovered ? 'drop-shadow-lg' : ''
            }`}>
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isExplorationHovered ? 'shadow-lg shadow-green-500/30' : ''
                }`}>
                  {isInSettlement ? <BuildingIcon className={`w-5 h-5 sm:w-6 sm:h-6 text-green-400 transition-all duration-300 ${
                    isExplorationHovered ? 'text-green-300' : ''
                  }`} /> : <MapIcon className={`w-5 h-5 sm:w-6 sm:h-6 text-green-400 transition-all duration-300 ${
                    isExplorationHovered ? 'text-green-300' : ''
                  }`} />}
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold text-green-300 transition-all duration-300 ${
                    isExplorationHovered ? 'text-white drop-shadow-md' : ''
                  }`}>{locationName}</h3>
                  <p className={`text-xs sm:text-sm text-slate-300 transition-all duration-300 ${
                    isExplorationHovered ? 'text-slate-200 drop-shadow-sm' : ''
                  }`}>{currentLocation?.type} • Danger Level {currentLocation?.dangerLevel || '?'}</p>
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
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Location Details */}
              <div className={`col-span-1 lg:col-span-6 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-lg p-3 border border-slate-600/30 transition-all duration-300 ${
                isExplorationHovered ? 'bg-gradient-to-r from-slate-700/60 to-slate-800/60 border-slate-500/50' : ''
              }`}>
                <h4 className={`text-base font-semibold text-slate-200 mb-3 transition-all duration-300 ${
                  isExplorationHovered ? 'text-white drop-shadow-sm' : ''
                }`}>Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-slate-400 transition-all duration-300 ${
                        isExplorationHovered ? 'text-slate-300' : ''
                      }`}>Type:</span>
                      <span className={`text-slate-200 capitalize transition-all duration-300 ${
                        isExplorationHovered ? 'text-white drop-shadow-sm' : ''
                      }`}>{currentLocation?.type || 'Unknown'}</span>
                    </div>
                    {isInSettlement && currentLocation?.settlement && (
                      <div className="flex justify-between">
                        <span className={`text-slate-400 transition-all duration-300 ${
                          isExplorationHovered ? 'text-slate-300' : ''
                        }`}>Population:</span>
                        <span className={`text-slate-200 transition-all duration-300 ${
                          isExplorationHovered ? 'text-white drop-shadow-sm' : ''
                        }`}>{currentLocation.settlement.population.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-slate-400 transition-all duration-300 ${
                        isExplorationHovered ? 'text-slate-300' : ''
                      }`}>Danger:</span>
                      <span className={`text-slate-200 transition-all duration-300 ${
                        isExplorationHovered ? 'text-white drop-shadow-sm' : ''
                      }`}>Level {currentLocation?.dangerLevel || '?'}</span>
                    </div>
                    {isInSettlement && currentLocation?.settlement && (
                      <div className="flex justify-between">
                        <span className={`text-slate-400 transition-all duration-300 ${
                          isExplorationHovered ? 'text-slate-300' : ''
                        }`}>NPCs:</span>
                        <span className={`text-slate-200 transition-all duration-300 ${
                          isExplorationHovered ? 'text-white drop-shadow-sm' : ''
                        }`}>{currentLocation.settlement.npcs.length} available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Homestead Section */}
              <div 
                className="col-span-1 lg:col-span-6 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-lg p-3 border border-amber-500/30 relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                onMouseEnter={() => setIsHomesteadHovered(true)}
                onMouseLeave={() => setIsHomesteadHovered(false)}
              >
                {/* Background Animation Layer */}
                <div className={`absolute inset-0 transition-all duration-500 rounded-lg overflow-hidden ${
                  isHomesteadHovered ? 'opacity-40' : 'opacity-0'
                }`}>
                  {/* Static preview image - always visible when hovered */}
                  <img
                    src="/assets/activity-card/camp.svg"
                    alt="Homestead preview"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                      isHomesteadHovered && homesteadGifLoaded && !homesteadGifError ? 'opacity-0' : 'opacity-80'
                    }`}
                    style={{
                      filter: 'brightness(0.7) contrast(1.0) hue-rotate(10deg)',
                    }}
                  />
                  
                  {/* GIF animation - only visible when hovered and loaded */}
                  <img
                    src={isHomesteadHovered ? '/assets/activity-card/camp.gif' : ''}
                    alt="Homestead animation"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                      isHomesteadHovered && homesteadGifLoaded && !homesteadGifError ? 'opacity-85 scale-110' : 'opacity-0'
                    }`}
                    style={{
                      filter: isHomesteadHovered && homesteadGifLoaded ? 'brightness(0.9) contrast(1.2) saturate(1.3) hue-rotate(10deg)' : 'brightness(0.6) contrast(0.9)',
                    }}
                    onLoad={() => setHomesteadGifLoaded(true)}
                    onError={() => setHomesteadGifError(true)}
                  />
                  
                  {/* Loading indicator for GIF */}
                  {isHomesteadHovered && !homesteadGifLoaded && !homesteadGifError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300/80 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Homestead-specific overlay effects */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-amber-900/50 via-transparent to-amber-900/30 transition-all duration-500 ${
                    isHomesteadHovered ? 'opacity-60' : 'opacity-80'
                  }`} />
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/15 to-orange-500/15 transition-opacity duration-500 ${
                    isHomesteadHovered ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>

                <div className={`relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 ${
                  isHomesteadHovered ? 'drop-shadow-lg' : ''
                }`}>
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isHomesteadHovered ? 'shadow-lg shadow-amber-500/30' : ''
                    }`}>
                      <HomeIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-all duration-300 ${
                        isHomesteadHovered ? 'text-amber-300' : ''
                      }`} />
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-semibold text-amber-300 transition-all duration-300 ${
                        isHomesteadHovered ? 'text-white drop-shadow-md' : ''
                      }`}>Homestead</h4>
                      <p className={`text-2xs sm:text-xs text-slate-300 transition-all duration-300 ${
                        isHomesteadHovered ? 'text-slate-200 drop-shadow-sm' : ''
                      }`}>Your base of operations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-1 text-2xs sm:text-xs flex-grow sm:flex-grow-0">
                      <div className={`bg-slate-800/30 rounded px-1 sm:px-2 py-1 text-center transition-all duration-300 ${
                        isHomesteadHovered ? 'bg-slate-800/50' : ''
                      }`}>
                        <div className={`text-slate-400 transition-all duration-300 ${
                          isHomesteadHovered ? 'text-slate-300' : ''
                        }`}>Garden</div>
                        <div className={`text-amber-300 font-medium transition-all duration-300 ${
                          isHomesteadHovered ? 'text-amber-200 drop-shadow-sm' : ''
                        }`}>Lv.1</div>
                      </div>
                      <div className={`bg-slate-800/30 rounded px-2 py-1 text-center transition-all duration-300 ${
                        isHomesteadHovered ? 'bg-slate-800/50' : ''
                      }`}>
                        <div className={`text-slate-400 transition-all duration-300 ${
                          isHomesteadHovered ? 'text-slate-300' : ''
                        }`}>Workshop</div>
                        <div className={`text-amber-300 font-medium transition-all duration-300 ${
                          isHomesteadHovered ? 'text-amber-200 drop-shadow-sm' : ''
                        }`}>Lv.1</div>
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
          <div 
            className="order-1 md:order-none col-span-full md:col-span-6 md:row-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-red-700/60 p-4 sm:p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-3xl"
            onMouseEnter={() => setIsCombatHovered(true)}
            onMouseLeave={() => setIsCombatHovered(false)}
          >
            {/* Background Animation Layer */}
            <div className={`absolute inset-0 transition-all duration-500 rounded-xl overflow-hidden ${
              isCombatHovered ? 'opacity-30' : 'opacity-0'
            }`}>
              {/* Static preview image - always visible when hovered */}
              <img
                src="/assets/activity-card/quests.svg"
                alt="Combat preview"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isCombatHovered && combatGifLoaded && !combatGifError ? 'opacity-0' : 'opacity-60'
                }`}
                style={{
                  filter: 'brightness(0.6) contrast(0.9) hue-rotate(15deg)',
                }}
              />
              
              {/* GIF animation - only visible when hovered and loaded */}
              <img
                src={isCombatHovered ? (currentEnemies.length > 0 ? '/assets/activity-card/battle-2.gif' : '/assets/activity-card/battle.gif') : ''}
                alt="Combat animation"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isCombatHovered && combatGifLoaded && !combatGifError ? 'opacity-70 scale-110' : 'opacity-0'
                }`}
                style={{
                  filter: isCombatHovered && combatGifLoaded ? 'brightness(0.8) contrast(1.1) saturate(1.2) hue-rotate(15deg)' : 'brightness(0.6) contrast(0.9)',
                }}
                onLoad={() => setCombatGifLoaded(true)}
                onError={() => setCombatGifError(true)}
              />
              
              {/* Loading indicator for GIF */}
              {isCombatHovered && !combatGifLoaded && !combatGifError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-red-300/30 border-t-red-300/80 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Combat-specific overlay effects */}
              <div className={`absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-red-900/40 transition-all duration-500 ${
                isCombatHovered ? 'opacity-70' : 'opacity-90'
              }`} />
              <div className={`absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 transition-opacity duration-500 ${
                isCombatHovered ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>

            {/* Battle Header */}
            <div className={`relative z-10 flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 transition-all duration-300 ${
              isCombatHovered ? 'drop-shadow-lg' : ''
            }`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isCombatHovered ? 'shadow-lg shadow-red-500/30' : ''
              }`}>
                <SkullIcon className={`w-6 h-6 sm:w-8 sm:h-8 text-red-400 transition-all duration-300 ${
                  isCombatHovered ? 'text-red-300' : ''
                }`} />
              </div>
              <div className="text-center">
                <h2 className={`text-2xl sm:text-3xl font-bold text-red-300 transition-all duration-300 ${
                  isCombatHovered ? 'text-white drop-shadow-md' : ''
                }`}>COMBAT</h2>
                <p className={`text-base sm:text-lg text-slate-300 transition-all duration-300 ${
                  isCombatHovered ? 'text-slate-200 drop-shadow-sm' : ''
                }`}>Test Your Skills</p>
              </div>
            </div>

            {/* Battle Info */}
            <div className={`relative z-10 bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-600/50 shadow-inner mb-4 sm:mb-6 flex-1 transition-all duration-300 ${
              isCombatHovered ? 'bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-slate-500/60' : ''
            }`}>
              <div className="text-center mb-3 sm:mb-4">
                <h3 className={`text-lg sm:text-xl font-semibold text-slate-200 mb-1 sm:mb-2 transition-all duration-300 ${
                  isCombatHovered ? 'text-white drop-shadow-sm' : ''
                }`}>
                  {currentBattleInfo.name} in {locationName}
                </h3>
                <p className={`text-xs sm:text-sm text-slate-300 transition-all duration-300 ${
                  isCombatHovered ? 'text-slate-200' : ''
                }`}>
                  Difficulty: <span className={currentBattleInfo.color}>{currentBattleInfo.difficulty}</span> | Danger Level: {currentLocation?.dangerLevel || '?'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
                <div className={`bg-slate-800/50 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
                  isCombatHovered ? 'bg-slate-800/70' : ''
                }`}>
                  <div className={`text-slate-400 transition-all duration-300 ${
                    isCombatHovered ? 'text-slate-300' : ''
                  }`}>Experience</div>
                  <div className={`text-green-300 font-semibold transition-all duration-300 ${
                    isCombatHovered ? 'text-green-200 drop-shadow-sm' : ''
                  }`}>High Gain</div>
                </div>
                <div className={`bg-slate-800/50 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
                  isCombatHovered ? 'bg-slate-800/70' : ''
                }`}>
                  <div className={`text-slate-400 transition-all duration-300 ${
                    isCombatHovered ? 'text-slate-300' : ''
                  }`}>Loot</div>
                  <div className={`text-blue-300 font-semibold transition-all duration-300 ${
                    isCombatHovered ? 'text-blue-200 drop-shadow-sm' : ''
                  }`}>Valuable</div>
                </div>
                <div className={`bg-slate-800/50 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
                  isCombatHovered ? 'bg-slate-800/70' : ''
                }`}>
                  <div className={`text-slate-400 transition-all duration-300 ${
                    isCombatHovered ? 'text-slate-300' : ''
                  }`}>Risk</div>
                  <div className={`text-red-300 font-semibold transition-all duration-300 ${
                    isCombatHovered ? 'text-red-200 drop-shadow-sm' : ''
                  }`}>Moderate</div>
                </div>
              </div>
            </div>

            {/* Battle Actions */}
            <div className="relative z-10 space-y-3">
              {/* Enhanced Battle Button with Dropdown */}
              <div className="relative battle-dropdown-container">
                <div className="flex">
                  {/* Main Battle Button */}
                  <ActionButton 
                    onClick={handleLaunchBattle} 
                    variant="danger" 
                    size="lg" 
                    isLoading={isLoading} 
                    icon={<SkullIcon />} 
                    className={`flex-1 text-lg sm:text-xl py-3 sm:py-4 hover:scale-105 transition-transform duration-200 font-bold ${
                      isInBattle ? 'rounded-lg' : 'rounded-r-none border-r-0'
                    }`}
                    title={isInBattle ? "Return to active battle" : `Launch ${currentBattleInfo.name}`}
                  >
                    {isInBattle ? "RETURN TO BATTLE" : "SEEK BATTLE"}
                  </ActionButton>
                  
                  {/* Dropdown Arrow Button - Only show when not in battle */}
                  {!isInBattle && (
                    <ActionButton 
                      onClick={() => setShowBattleDropdown(!showBattleDropdown)}
                      variant="danger"
                      size="lg"
                      className="px-3 sm:px-4 py-3 sm:py-4 rounded-l-none border-l border-red-600/50 hover:scale-105 transition-transform duration-200"
                      title="Battle options"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </ActionButton>
                  )}
                </div>
                
                {/* Dropdown Menu - Only show when not in battle */}
                {showBattleDropdown && !isInBattle && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/40 backdrop-blur-3xl rounded-lg border border-white/30 shadow-2xl shadow-black/40 z-[1001] overflow-hidden">
                    {/* Extra blur overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl"></div>
                    <div className="relative p-2 space-y-1">
                      {/* Normal Battle Option */}
                      <button
                        onClick={() => handleBattleTypeSelect('normal')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-sm ${
                          selectedBattleType === 'normal'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'text-white/90 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Normal Battle</span>
                            <span className="text-xs text-white/60">Standard</span>
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            Standard XP & Loot | Balanced difficulty
                          </div>
                        </div>
                      </button>
                      
                      {/* Elite Battle Option */}
                      <button
                        onClick={() => handleBattleTypeSelect('elite')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-sm ${
                          selectedBattleType === 'elite'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'text-white/90 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Elite Battle</span>
                            <span className="text-xs text-white/60">Hard</span>
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            Bonus XP & Rare Loot | Challenging encounter
                          </div>
                        </div>
                      </button>
                      
                      {/* Boss Battle Option */}
                      <button
                        onClick={() => handleBattleTypeSelect('boss')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-sm ${
                          selectedBattleType === 'boss'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'text-white/90 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Boss Battle</span>
                            <span className="text-xs text-white/60">Very Hard</span>
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            High XP & Epic Loot | Epic encounter
                          </div>
                        </div>
                      </button>
                      
                      {/* Arena Battle Option */}
                      <button
                        onClick={() => handleBattleTypeSelect('arena')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-sm ${
                          selectedBattleType === 'arena'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'text-white/90 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Arena Battle</span>
                            <span className="text-xs text-white/60">Scaling</span>
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            Progressive Rewards | Endless waves
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
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
                      title={isInBattle 
                        ? "Cannot rest while enemies are present" 
                        : `Quick ${restPreferences.preferredRestType} rest (${currentRestBenefits.duration})`}
                    >
                      <span className="hidden sm:inline">Rest</span>
                      <span className="sm:hidden">Rest</span>
                    </ActionButton>
                    
                    {/* Dropdown Arrow Button */}
                    <ActionButton 
                      onClick={() => setShowRestDropdown(!showRestDropdown)}
                      variant="secondary"
                      size="sm"
                      disabled={isInBattle} // Disable if in combat
                      className="px-2 rounded-l-none border-l border-slate-600/50"
                      title={isInBattle 
                        ? "Cannot rest while enemies are present" 
                        : "Rest options"}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </ActionButton>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {showRestDropdown && !isInBattle && (
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