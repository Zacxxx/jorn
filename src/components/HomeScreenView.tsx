import React from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import ActionButton from './ActionButton';
import ActivityCard from './ActivityCard';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon, TentIcon, HomeIcon, BuildingIcon, UserIcon, GearIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

// Conditional import for PlayerStatsDisplay to avoid type conflicts
let PlayerStatsDisplay: React.ComponentType<any> | null = null;
try {
  PlayerStatsDisplay = require('./PlayerStatsDisplay').default;
} catch (error) {
  console.warn('PlayerStatsDisplay not available:', error);
}

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
  onAccessSettlement,
  onOpenCraftingHub,
  onOpenHomestead,
  onOpenNPCs,
  onNavigateToMultiplayer,
}) => {
  // State for activity card ordering
  const [activityOrder] = React.useState([
    'camp', 'research', 'crafting', 'npcs', 'quests', 'trading'
  ]);

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
      backgroundImage: '/assets/activity-card/trading.svg',
      gifBackgroundImage: '/assets/activity-card/market.gif'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] w-full max-w-none mx-0 px-4 overflow-hidden">
      {/* Player Stats Display - Conditional Rendering */}
      {PlayerStatsDisplay && (
        <div className="mb-4">
          <PlayerStatsDisplay player={player} effectiveStats={effectiveStats} />
        </div>
      )}
      
      {/* Main Bento Box Layout */}
      <div className="h-full py-2">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-12 grid-rows-6 gap-3 h-full">
          
          {/* Top Row - Location Info with Details and Homestead (spans full width) */}
          <div className="col-span-12 row-span-2 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md rounded-xl shadow-xl border border-green-700/60 p-4">
            {/* Top Section - Main Location Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                  {isInSettlement ? <BuildingIcon className="w-6 h-6 text-green-400" /> : <MapIcon className="w-6 h-6 text-green-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-300">{locationName}</h3>
                  <p className="text-sm text-slate-300">{currentLocation?.type} • Danger Level {currentLocation?.dangerLevel || '?'}</p>
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
            <div className="grid grid-cols-12 gap-4">
              {/* Location Details */}
              <div className="col-span-6 bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-lg p-3 border border-slate-600/30">
                <h4 className="text-base font-semibold text-slate-200 mb-3">Location Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
              <div className="col-span-6 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-lg p-3 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                      <HomeIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-amber-300">Homestead</h4>
                      <p className="text-xs text-slate-300">Your base of operations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="bg-slate-800/30 rounded px-2 py-1 text-center">
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
          <div className="col-span-3 row-span-4 grid grid-rows-3 gap-2">
            {activityOrder.slice(0, 3).map((activityId) => {
              const activity = activityCards.find(card => card.id === activityId);
              if (!activity) return null;
              
              return (
                <div key={activity.id} className="w-full h-full">
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
          <div className="col-span-6 row-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-red-700/60 p-6 flex flex-col">
            {/* Battle Header */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                <SkullIcon className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-red-300">COMBAT</h2>
                <p className="text-lg text-slate-300">Test Your Skills</p>
              </div>
            </div>

            {/* Battle Info */}
            <div className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-xl p-4 border border-slate-600/50 shadow-inner mb-6 flex-1">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Battle in {locationName}</h3>
                <p className="text-slate-300">Danger Level: {currentLocation?.dangerLevel || '?'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400">Experience</div>
                  <div className="text-green-300 font-semibold">High Gain</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400">Loot</div>
                  <div className="text-blue-300 font-semibold">Valuable</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
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
                className="w-full text-xl py-4 hover:scale-105 transition-transform duration-200 font-bold"
              >
                SEEK BATTLE
              </ActionButton>
              
              <div className="grid grid-cols-2 gap-3">
                <ActionButton onClick={onNavigateToMultiplayer} variant="primary" size="sm" icon={<UserIcon />}>
                  Multiplayer
                </ActionButton>
                <ActionButton onClick={onOpenCamp} variant="secondary" size="sm" icon={<TentIcon />}>
                  Rest at Camp
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Right Column - Activity Cards (3 cards) */}
          <div className="col-span-3 row-span-4 grid grid-rows-3 gap-2">
            {activityOrder.slice(3, 6).map((activityId) => {
              const activity = activityCards.find(card => card.id === activityId);
              if (!activity) return null;
              
              return (
                <div key={activity.id} className="w-full h-full">
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