import React, { useState } from 'react';
import { Player, PlayerEffectiveStats } from '../types';
import ActionButton from '../ui/ActionButton';
import { 
  TentIcon, 
  UserIcon, 
  MapIcon, 
  HeroBackIcon,
  PlusIcon
} from './components/IconComponents';
import SpriteAnimation from './components/SpriteAnimation';

interface CampViewProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onReturnHome: () => void;
  onRestComplete: (restType: 'short' | 'long', duration?: number, activity?: string) => void;
}

type RestType = 'short' | 'long' | 'custom';
type RestActivity = 'meditation' | 'training' | 'crafting' | 'socializing' | 'exploring' | 'none';

const CampView: React.FC<CampViewProps> = ({
  player,
  effectiveStats,
  onReturnHome,
  onRestComplete,
}) => {
  const [selectedRestType, setSelectedRestType] = useState<RestType>('short');
  const [customDuration, setCustomDuration] = useState<number>(4);
  const [selectedActivity, setSelectedActivity] = useState<RestActivity>('none');
  const [showJourneyMap, setShowJourneyMap] = useState(false);
  const [showCharacterManagement, setShowCharacterManagement] = useState(false);

  const handleRest = () => {
    let duration = selectedRestType === 'short' ? 1 : selectedRestType === 'long' ? 8 : customDuration;
    const activity = selectedActivity !== 'none' ? selectedActivity : undefined;
    
    onRestComplete(selectedRestType === 'custom' ? 'long' : selectedRestType, duration, activity);
  };

  const isPlayerInjured = player.hp < effectiveStats.maxHp;
  const isPlayerFatigued = player.mp < effectiveStats.maxMp || player.ep < effectiveStats.maxEp;

  const restBenefits = {
    short: {
      hp: Math.min(Math.floor(effectiveStats.maxHp * 0.25), effectiveStats.maxHp - player.hp),
      mp: Math.min(Math.floor(effectiveStats.maxMp * 0.5), effectiveStats.maxMp - player.mp),
      ep: Math.min(Math.floor(effectiveStats.maxEp * 0.75), effectiveStats.maxEp - player.ep),
      duration: '1 hour'
    },
    long: {
      hp: effectiveStats.maxHp - player.hp,
      mp: effectiveStats.maxMp - player.mp,
      ep: effectiveStats.maxEp - player.ep,
      duration: '8 hours'
    },
    custom: {
      hp: Math.min(Math.floor(effectiveStats.maxHp * (customDuration / 8)), effectiveStats.maxHp - player.hp),
      mp: Math.min(Math.floor(effectiveStats.maxMp * (customDuration / 8)), effectiveStats.maxMp - player.mp),
      ep: Math.min(Math.floor(effectiveStats.maxEp * (customDuration / 8)), effectiveStats.maxEp - player.ep),
      duration: `${customDuration} hours`
    }
  };

  const activityBenefits = {
    meditation: 'Extra MP recovery',
    training: 'Temporary stat boost',
    crafting: 'Chance for bonus materials',
    socializing: 'Improved quest opportunities',
    exploring: 'Chance to discover resources',
    none: 'Standard rest benefits'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TentIcon className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-sky-300">Camp</h1>
          <SpriteAnimation imageUrl="assets/activity-card/camp.gif" altText="Camp Animation" />
        </div>
        <ActionButton onClick={onReturnHome} variant="secondary" size="sm">
          Return Home
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rest Options */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/60">
          <h2 className="text-xl font-semibold text-sky-300 mb-4 flex items-center">
            <TentIcon className="w-5 h-5 mr-2" />
            Rest & Recovery
          </h2>

          {/* Player Status */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-medium text-slate-200 mb-3">Current Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-red-400 font-semibold">HP</div>
                <div className={player.hp < effectiveStats.maxHp * 0.5 ? 'text-red-400' : 'text-green-400'}>
                  {player.hp}/{effectiveStats.maxHp}
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">MP</div>
                <div className={player.mp < effectiveStats.maxMp * 0.5 ? 'text-blue-300' : 'text-blue-400'}>
                  {player.mp}/{effectiveStats.maxMp}
                </div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">EP</div>
                <div className={player.ep < effectiveStats.maxEp * 0.5 ? 'text-yellow-300' : 'text-yellow-400'}>
                  {player.ep}/{effectiveStats.maxEp}
                </div>
              </div>
            </div>
            
            {isPlayerInjured && (
              <div className="mt-2 text-red-300 text-sm text-center">
                ⚠️ You need medical attention
              </div>
            )}
            {isPlayerFatigued && (
              <div className="mt-2 text-yellow-300 text-sm text-center">
                😴 You are fatigued
              </div>
            )}
          </div>

          {/* Rest Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Rest Duration</h3>
            
            <div className="space-y-3">
              {(['short', 'long', 'custom'] as RestType[]).map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="restType"
                    value={type}
                    checked={selectedRestType === type}
                    onChange={(e) => setSelectedRestType(e.target.value as RestType)}
                    className="text-sky-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 capitalize font-medium">
                        {type} Rest
                      </span>
                      <span className="text-slate-400 text-sm">
                        {restBenefits[type].duration}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      HP: +{restBenefits[type].hp} | MP: +{restBenefits[type].mp} | EP: +{restBenefits[type].ep}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedRestType === 'custom' && (
              <div className="ml-6 space-y-2">
                <label className="block text-sm text-slate-300">
                  Duration (hours): {customDuration}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Rest Activity Selection */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Rest Activity (Optional)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(activityBenefits) as RestActivity[]).map((activity) => (
                <label key={activity} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="activity"
                    value={activity}
                    checked={selectedActivity === activity}
                    onChange={(e) => setSelectedActivity(e.target.value as RestActivity)}
                    className="text-sky-500"
                  />
                  <span className="text-slate-200 capitalize text-sm">
                    {activity === 'none' ? 'Just Rest' : activity}
                  </span>
                </label>
              ))}
            </div>
            
            {selectedActivity !== 'none' && (
              <div className="text-sm text-slate-300 italic">
                {activityBenefits[selectedActivity]}
              </div>
            )}
          </div>

          <ActionButton
            onClick={handleRest}
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={!isPlayerInjured && !isPlayerFatigued}
          >
            {!isPlayerInjured && !isPlayerFatigued ? 'Fully Rested' : 'Begin Rest'}
          </ActionButton>
        </div>

        {/* Camp Management */}
        <div className="space-y-6">
          {/* Character Management */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/60">
            <h2 className="text-xl font-semibold text-sky-300 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Party Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <HeroBackIcon className="w-8 h-8 text-sky-400" />
                  <div>
                    <div className="font-medium text-slate-200">{player.name || 'Hero'}</div>
                    <div className="text-sm text-slate-400">Level {player.level} Adventurer</div>
                  </div>
                </div>
                <div className="text-sm text-green-400">
                  In Party
                </div>
              </div>

              {/* Placeholder for additional characters */}
              <div className="text-center p-4 border-2 border-dashed border-slate-600 rounded-lg">
                <PlusIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-slate-400 text-sm">
                  No additional party members
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  (Feature coming soon)
                </div>
              </div>
            </div>

            <ActionButton
              onClick={() => setShowCharacterManagement(!showCharacterManagement)}
              variant="secondary"
              size="sm"
              className="w-full mt-4"
            >
              {showCharacterManagement ? 'Hide' : 'Show'} Character Details
            </ActionButton>

            {showCharacterManagement && (
              <div className="mt-4 p-4 bg-slate-700/30 rounded-lg space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400">Body:</span>
                    <span className="text-slate-200 ml-2">{player.body}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Mind:</span>
                    <span className="text-slate-200 ml-2">{player.mind}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reflex:</span>
                    <span className="text-slate-200 ml-2">{player.reflex}</span>
                  </div>
                </div>
                <div className="text-slate-400">
                  Gold: <span className="text-yellow-400">{player.gold}</span> | 
                  Essence: <span className="text-purple-400 ml-2">{player.essence}</span>
                </div>
              </div>
            )}
          </div>

          {/* Journey Map */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/60">
            <h2 className="text-xl font-semibold text-sky-300 mb-4 flex items-center">
              <MapIcon className="w-5 h-5 mr-2" />
              Current Journey
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-200 font-medium">Current Location</span>
                  <span className="text-green-400 text-sm">Safe Zone</span>
                </div>
                <div className="text-slate-300">Adventurer's Camp</div>
                <div className="text-slate-400 text-sm mt-1">
                  A peaceful clearing perfect for rest and recovery
                </div>
              </div>

              <ActionButton
                onClick={() => setShowJourneyMap(!showJourneyMap)}
                variant="info"
                size="sm"
                className="w-full"
              >
                {showJourneyMap ? 'Hide' : 'View'} Journey Map
              </ActionButton>

              {showJourneyMap && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center text-slate-300 mb-4">
                    Journey Progress
                  </div>
                  
                  {/* Simple journey visualization */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="text-xs text-slate-400 mt-1">Start</div>
                    </div>
                    
                    <div className="flex-1 h-0.5 bg-slate-600 mx-2 relative">
                      <div className="absolute left-1/2 top-0 w-4 h-4 bg-sky-500 rounded-full transform -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-sky-400 whitespace-nowrap">
                          Camp
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                      <div className="text-xs text-slate-400 mt-1">Goal</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-400 text-center">
                    Progress through your adventures and quests
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampView; 