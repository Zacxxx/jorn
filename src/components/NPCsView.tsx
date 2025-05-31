import React from 'react';
import { Player, NPC } from '../types';
import ActionButton from '../../ui/ActionButton';
import { UserIcon, HeroBackIcon, MapIcon } from './IconComponents';
import { GetSpellIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

interface NPCsViewProps {
  player: Player;
  onReturnHome: () => void;
  onTalkToNPC: (npcId: string) => void;
  onShowMessage: (title: string, message: string) => void;
}

const NPCsView: React.FC<NPCsViewProps> = ({
  player,
  onReturnHome,
  onTalkToNPC,
  onShowMessage,
}) => {
  const currentLocation = getLocation(player.currentLocationId);
  const locationName = currentLocation?.name || 'Unknown Location';
  const isInSettlement = currentLocation?.type === 'settlement';
  const npcs = currentLocation?.settlement?.npcs || [];

  // For wilderness areas, we could add wandering NPCs or special encounters
  const wildernessNPCs: NPC[] = [];
  
  // If not in settlement, check for any special NPCs in the area
  if (!isInSettlement && currentLocation?.pointsOfInterest) {
    // This could be expanded to include NPCs found at points of interest
    // For now, we'll keep it simple
  }

  const availableNPCs = isInSettlement ? npcs : wildernessNPCs;

  const renderNPCCard = (npc: NPC) => (
    <div key={npc.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <GetSpellIcon iconName={npc.iconName} className="w-12 h-12 text-sky-300" />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="text-lg font-medium text-slate-100 mb-1">{npc.name}</h4>
          <p className="text-sm text-slate-300 mb-2">{npc.description}</p>
          <div className="flex items-center space-x-4 text-xs text-slate-400 mb-3">
            <span>Occupation: {npc.occupation}</span>
            <span>Relationship: {npc.relationship >= 0 ? '+' : ''}{npc.relationship}</span>
          </div>
          <p className="text-xs text-slate-400 italic mb-3">{npc.personality}</p>
          
          {/* Services and Quests indicators */}
          <div className="flex items-center space-x-4 mb-3">
            {npc.services.length > 0 && (
              <div className="flex items-center text-xs text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                Services ({npc.services.length})
              </div>
            )}
            {npc.quests.length > 0 && (
              <div className="flex items-center text-xs text-yellow-300">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                Quests ({npc.quests.length})
              </div>
            )}
          </div>
          
          <ActionButton
            onClick={() => onTalkToNPC(npc.id)}
            variant="success"
            size="sm"
            className="w-full"
          >
            Talk to {npc.name}
          </ActionButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-green-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <UserIcon className="w-8 h-8 mr-3 text-green-400" />
          NPCs in {locationName}
        </h2>
        <p className="text-slate-300 mb-4">
          {isInSettlement 
            ? "Interact with the residents and visitors of this settlement."
            : "Look for travelers and wanderers in the wilderness."
          }
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center">
            <MapIcon className="w-4 h-4 mr-1" />
            <span>Location: {locationName}</span>
          </div>
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            <span>NPCs Available: {availableNPCs.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <ActionButton
          onClick={onReturnHome}
          variant="secondary"
          size="lg"
          icon={<HeroBackIcon />}
        >
          Return Home
        </ActionButton>
      </div>

      {/* NPCs List */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center">
          <UserIcon className="w-6 h-6 mr-2 text-green-400" />
          Available NPCs
        </h3>
        
        {availableNPCs.length > 0 ? (
          <div className="space-y-4">
            {availableNPCs.map(renderNPCCard)}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
            <h4 className="text-lg font-medium text-slate-300 mb-2">No NPCs Available</h4>
            <p className="text-slate-400 mb-4">
              {isInSettlement 
                ? "There are no residents available to talk to at the moment."
                : "You don't encounter any travelers in this wilderness area. Try visiting a settlement to meet NPCs."
              }
            </p>
            {!isInSettlement && (
              <ActionButton
                onClick={() => onShowMessage("Travel Suggestion", "Visit nearby settlements to find NPCs to interact with. Use the world map to find settlements in your area.")}
                variant="info"
                size="sm"
              >
                Get Travel Suggestions
              </ActionButton>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">About NPCs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Services</h4>
            <p className="text-slate-400">NPCs with services can provide shops, repairs, or special abilities.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Quests</h4>
            <p className="text-slate-400">NPCs with quests can give you new adventures and rewards.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Relationships</h4>
            <p className="text-slate-400">Your relationship level affects dialogue options and available services.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Locations</h4>
            <p className="text-slate-400">Most NPCs are found in settlements, but some may wander the wilderness.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCsView; 