import React from 'react';
import { Player } from '../types';
import ActionButton from './ActionButton';
import { UserIcon, MessageIcon, UsersIcon, GlobeIcon, CrownIcon, SwordIcon, TrophyIcon, CalendarIcon } from './IconComponents';

interface MultiplayerViewProps {
  player: Player;
  onBack: () => void;
}

const MultiplayerView: React.FC<MultiplayerViewProps> = ({
  player,
  onBack,
}) => {
  const [chatMessage, setChatMessage] = React.useState('');
  const [selectedGuild, setSelectedGuild] = React.useState<string | null>(null);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ActionButton 
              onClick={onBack} 
              variant="secondary" 
              size="sm"
              className="text-xs"
            >
              ← Back
            </ActionButton>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-purple-300">Multiplayer Hub</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Online: 1,247</span>
            </div>
            <div className="text-slate-400">Server: NA-East</div>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Section */}
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-blue-700/60 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <MessageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-blue-300">Global Chat</h2>
          </div>
          
          {/* Chat Channels */}
          <div className="flex space-x-1 mb-4">
            <button className="px-3 py-1 text-xs bg-blue-600/50 text-blue-200 rounded border border-blue-500/30">General</button>
            <button className="px-3 py-1 text-xs bg-slate-700/50 text-slate-400 rounded border border-slate-600/30 hover:bg-slate-600/50">Trade</button>
            <button className="px-3 py-1 text-xs bg-slate-700/50 text-slate-400 rounded border border-slate-600/30 hover:bg-slate-600/50">LFG</button>
            <button className="px-3 py-1 text-xs bg-slate-700/50 text-slate-400 rounded border border-slate-600/30 hover:bg-slate-600/50">Help</button>
          </div>

          {/* Chat Messages */}
          <div className="bg-slate-800/50 rounded-lg p-3 h-80 overflow-y-auto mb-4 border border-slate-600/30">
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-300 font-medium">[Warrior]</span>
                <span className="text-yellow-300">DragonSlayer:</span>
                <span className="text-slate-200">LF2M for Shadowmere Dungeon, need healer and tank</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-300 font-medium">[Mage]</span>
                <span className="text-purple-300">ArcaneWizard:</span>
                <span className="text-slate-200">Selling rare spell components, PM me</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-300 font-medium">[Rogue]</span>
                <span className="text-cyan-300">ShadowBlade:</span>
                <span className="text-slate-200">Anyone know where to find Moonstone ore?</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-300 font-medium">[Paladin]</span>
                <span className="text-orange-300">HolyKnight:</span>
                <span className="text-slate-200">@ShadowBlade Check the Crystal Caves, level 3</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-pink-300 font-medium">[Healer]</span>
                <span className="text-emerald-300">LifeBringer:</span>
                <span className="text-slate-200">@DragonSlayer I can heal, what time?</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-indigo-300 font-medium">[Admin]</span>
                <span className="text-red-400">GameMaster:</span>
                <span className="text-slate-200">Server maintenance in 2 hours, expect 30min downtime</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..." 
              className="flex-1 bg-slate-700/50 border border-slate-600/30 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none"
            />
            <ActionButton 
              onClick={handleSendMessage}
              variant="primary" 
              size="sm"
              className="px-4"
            >
              Send
            </ActionButton>
          </div>

          {/* Online Players */}
          <div className="mt-4 pt-4 border-t border-slate-600/30">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Online Friends (3)</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">MysticMage</span>
                </div>
                <span className="text-slate-500">In Dungeon</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">IronWarrior</span>
                </div>
                <span className="text-slate-500">Crafting</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">SwiftArcher</span>
                </div>
                <span className="text-slate-500">Away</span>
              </div>
            </div>
          </div>
        </div>

        {/* Party Section */}
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-purple-700/60 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-purple-300">Party Management</h2>
          </div>

          {/* Current Party Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-600/30">
            <div className="text-center text-slate-400 mb-3">No Active Party</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <ActionButton 
                onClick={() => console.log('Create party')}
                variant="primary" 
                size="sm"
                className="text-xs"
                icon={<UsersIcon />}
              >
                Create Party
              </ActionButton>
              <ActionButton 
                onClick={() => console.log('Find party')}
                variant="secondary" 
                size="sm"
                className="text-xs"
                icon={<UserIcon />}
              >
                Find Party
              </ActionButton>
            </div>
          </div>

          {/* Party Finder */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Looking for Group</h3>
            <div className="space-y-2">
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <SwordIcon className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-slate-200">Shadowmere Dungeon</span>
                  </div>
                  <span className="text-xs text-slate-400">2/4 players</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">Need: Tank, Healer • Level 25+ • Difficulty: Hard</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Host: DragonSlayer</span>
                  <ActionButton 
                    onClick={() => console.log('Join party')}
                    variant="primary" 
                    size="sm"
                    className="text-xs px-3 py-1"
                  >
                    Join
                  </ActionButton>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-200">Arena Tournament</span>
                  </div>
                  <span className="text-xs text-slate-400">1/2 players</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">PvP • Level 20+ • Rewards: Gold, XP</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">Host: BattleMaster</span>
                  <ActionButton 
                    onClick={() => console.log('Join party')}
                    variant="primary" 
                    size="sm"
                    className="text-xs px-3 py-1"
                  >
                    Join
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton 
                onClick={() => console.log('Create LFG post')}
                variant="secondary" 
                size="sm"
                className="text-xs justify-start"
                icon={<MessageIcon />}
              >
                Post LFG Request
              </ActionButton>
              <ActionButton 
                onClick={() => console.log('View party history')}
                variant="secondary" 
                size="sm"
                className="text-xs justify-start"
                icon={<CalendarIcon />}
              >
                View Party History
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-700/60 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <GlobeIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-300">Community</h2>
          </div>

          {/* Guild Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Guild Management</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-600/30">
              <div className="text-center text-slate-400 mb-3">Not in a Guild</div>
              <ActionButton 
                onClick={() => console.log('Browse guilds')}
                variant="primary" 
                size="sm"
                className="w-full text-xs"
                icon={<CrownIcon />}
              >
                Browse Guilds
              </ActionButton>
            </div>

            {/* Top Guilds */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-400">Top Guilds</h4>
              <div className="space-y-1">
                <div 
                  className={`bg-slate-700/30 rounded-lg p-2 border border-slate-600/20 cursor-pointer transition-colors ${
                    selectedGuild === 'dragons' ? 'border-emerald-500/50 bg-emerald-900/20' : 'hover:bg-slate-600/30'
                  }`}
                  onClick={() => setSelectedGuild(selectedGuild === 'dragons' ? null : 'dragons')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CrownIcon className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-medium text-slate-200">Dragon Lords</span>
                    </div>
                    <span className="text-xs text-slate-400">247 members</span>
                  </div>
                  {selectedGuild === 'dragons' && (
                    <div className="mt-2 pt-2 border-t border-slate-600/30">
                      <div className="text-xs text-slate-400 mb-2">Elite PvP guild focused on endgame content</div>
                      <div className="flex space-x-1">
                        <ActionButton 
                          onClick={() => console.log('Apply to guild')}
                          variant="primary" 
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          Apply
                        </ActionButton>
                        <ActionButton 
                          onClick={() => console.log('View guild')}
                          variant="secondary" 
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          View
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
                
                <div 
                  className={`bg-slate-700/30 rounded-lg p-2 border border-slate-600/20 cursor-pointer transition-colors ${
                    selectedGuild === 'mystics' ? 'border-emerald-500/50 bg-emerald-900/20' : 'hover:bg-slate-600/30'
                  }`}
                  onClick={() => setSelectedGuild(selectedGuild === 'mystics' ? null : 'mystics')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CrownIcon className="w-3 h-3 text-purple-400" />
                      <span className="text-xs font-medium text-slate-200">Mystic Circle</span>
                    </div>
                    <span className="text-xs text-slate-400">189 members</span>
                  </div>
                  {selectedGuild === 'mystics' && (
                    <div className="mt-2 pt-2 border-t border-slate-600/30">
                      <div className="text-xs text-slate-400 mb-2">Casual guild welcoming all players</div>
                      <div className="flex space-x-1">
                        <ActionButton 
                          onClick={() => console.log('Apply to guild')}
                          variant="primary" 
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          Apply
                        </ActionButton>
                        <ActionButton 
                          onClick={() => console.log('View guild')}
                          variant="secondary" 
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          View
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/20">
                <div className="flex items-center space-x-2 mb-1">
                  <TrophyIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-200">Weekly Tournament</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">Starts in 2 days • Rewards: Rare items, Gold</div>
                <ActionButton 
                  onClick={() => console.log('Register for tournament')}
                  variant="primary" 
                  size="sm"
                  className="text-xs w-full"
                >
                  Register
                </ActionButton>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/20">
                <div className="flex items-center space-x-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">Double XP Weekend</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">This weekend • All activities give 2x experience</div>
                <div className="text-xs text-emerald-300 font-medium">Active Now!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerView; 