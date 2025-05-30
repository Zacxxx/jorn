import React, { useState } from 'react';
import { Player, Settlement, Shop, Tavern, NPC, PointOfInterest } from '../types';
import ActionButton from '../../ui/ActionButton';
import { BuildingIcon, UserIcon, FlaskIcon, BookIcon, MapIcon, HeroBackIcon, GoldCoinIcon, GearIcon } from './IconComponents';
import { getLocation } from '../services/locationService';

interface SettlementViewProps {
  player: Player;
  onReturnHome: () => void;
  onOpenShop: (shopId: string) => void;
  onOpenTavern: (tavernId: string) => void;
  onTalkToNPC: (npcId: string) => void;
  onExplorePointOfInterest: (poiId: string) => void;
  onShowMessage: (title: string, message: string) => void;
}

const SettlementView: React.FC<SettlementViewProps> = ({
  player,
  onReturnHome,
  onOpenShop,
  onOpenTavern,
  onTalkToNPC,
  onExplorePointOfInterest,
  onShowMessage,
}) => {
  const [selectedTab, setSelectedTab] = useState<'services' | 'npcs' | 'explore'>('services');

  const currentLocation = getLocation(player.currentLocationId);
  const settlement = currentLocation?.settlement;

  if (!settlement) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
          <h2 className="text-3xl font-bold text-red-300 mb-2">Not in Settlement</h2>
          <p className="text-slate-300 mb-4">You are not currently in a settlement.</p>
          <ActionButton onClick={onReturnHome} variant="secondary" size="lg" icon={<HeroBackIcon />}>
            Return Home
          </ActionButton>
        </div>
      </div>
    );
  }

  const renderServices = () => (
    <div className="space-y-4">
      {/* Shops */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
          <GearIcon className="w-5 h-5 mr-2 text-blue-400" />
          Shops ({settlement.shops.length})
        </h4>
        {settlement.shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.shops.map((shop) => (
              <div key={shop.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h5 className="text-md font-medium text-slate-100 mb-2">{shop.name}</h5>
                <p className="text-sm text-slate-300 mb-3">{shop.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Type: {shop.type}</span>
                  <ActionButton
                    onClick={() => onOpenShop(shop.id)}
                    variant="primary"
                    size="sm"
                  >
                    Visit Shop
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">No shops available in this settlement.</p>
        )}
      </div>

      {/* Taverns */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
          <FlaskIcon className="w-5 h-5 mr-2 text-amber-400" />
          Taverns ({settlement.taverns.length})
        </h4>
        {settlement.taverns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.taverns.map((tavern) => (
              <div key={tavern.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h5 className="text-md font-medium text-slate-100 mb-2">{tavern.name}</h5>
                <p className="text-sm text-slate-300 mb-3">{tavern.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Services: Rest, Food, Info</span>
                  <ActionButton
                    onClick={() => onOpenTavern(tavern.id)}
                    variant="warning"
                    size="sm"
                  >
                    Enter Tavern
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">No taverns available in this settlement.</p>
        )}
      </div>
    </div>
  );

  const renderNPCs = () => (
    <div>
      <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
        <UserIcon className="w-5 h-5 mr-2 text-green-400" />
        Notable Residents ({settlement.npcs.length})
      </h4>
      {settlement.npcs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settlement.npcs.map((npc) => (
            <div key={npc.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h5 className="text-md font-medium text-slate-100 mb-2">{npc.name}</h5>
              <p className="text-sm text-slate-300 mb-3">{npc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Role: {npc.role}</span>
                <ActionButton
                  onClick={() => onTalkToNPC(npc.id)}
                  variant="success"
                  size="sm"
                >
                  Talk
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic">No notable residents to interact with.</p>
      )}
    </div>
  );

  const renderExploration = () => (
    <div>
      <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
        <BuildingIcon className="w-5 h-5 mr-2 text-purple-400" />
        Points of Interest ({settlement.pointsOfInterest.length})
      </h4>
      {settlement.pointsOfInterest.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settlement.pointsOfInterest.map((poi) => (
            <div key={poi.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h5 className="text-md font-medium text-slate-100 mb-2">{poi.name}</h5>
              <p className="text-sm text-slate-300 mb-3">{poi.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Type: {poi.type}</span>
                <ActionButton
                  onClick={() => onExplorePointOfInterest(poi.id)}
                  variant="info"
                  size="sm"
                >
                  Explore
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic">No special locations to explore.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-purple-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <BuildingIcon className="w-8 h-8 mr-3 text-purple-400" />
          {settlement.name}
        </h2>
        <p className="text-slate-300 mb-4">{settlement.description}</p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            Population: {settlement.population.toLocaleString()}
          </span>
          <span className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1" />
            Your Gold: {player.gold}
          </span>
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
          Leave Settlement
        </ActionButton>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <div className="flex border-b border-slate-600">
          <button
            onClick={() => setSelectedTab('services')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedTab === 'services'
                ? 'bg-slate-700 text-blue-300 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setSelectedTab('npcs')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedTab === 'npcs'
                ? 'bg-slate-700 text-green-300 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Residents
          </button>
          <button
            onClick={() => setSelectedTab('explore')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedTab === 'explore'
                ? 'bg-slate-700 text-purple-300 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explore
          </button>
        </div>
        
        <div className="p-6">
          {selectedTab === 'services' && renderServices()}
          {selectedTab === 'npcs' && renderNPCs()}
          {selectedTab === 'explore' && renderExploration()}
        </div>
      </div>
    </div>
  );
};

export default SettlementView; 