import React from 'react';
import { Player, Settlement, Shop, Tavern, NPC, PointOfInterest } from '../types';
import ActionButton from '../../ui/ActionButton';
import { BuildingIcon, UserIcon, FlaskIcon, BookIcon, MapIcon, HeroBackIcon, GoldCoinIcon } from './IconComponents';
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
  const currentLocation = getLocation(player.currentLocationId);
  const settlement = currentLocation?.settlement;

  if (!settlement) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">No Settlement Found</h2>
        <p className="text-slate-300 mb-6">You are not currently in a settlement.</p>
        <ActionButton onClick={onReturnHome} variant="secondary" icon={<HeroBackIcon />}>
          Return Home
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settlement Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          {settlement.name}
        </h2>
        <p className="text-slate-300 mb-4 max-w-2xl mx-auto">{settlement.description}</p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <BuildingIcon className="w-4 h-4 mr-1" />
            {settlement.type.charAt(0).toUpperCase() + settlement.type.slice(1)}
          </span>
          <span className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            {settlement.population.toLocaleString()} residents
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton 
          onClick={onReturnHome} 
          variant="secondary" 
          size="lg"
          icon={<HeroBackIcon />}
          className="h-full !py-4"
        >
          Leave Settlement
        </ActionButton>
        <ActionButton 
          onClick={() => onShowMessage('Settlement Info', `${settlement.name} is a ${settlement.type} with ${settlement.population.toLocaleString()} residents. It offers ${settlement.shops.length} shops, ${settlement.taverns.length} taverns, and ${settlement.npcs.length} NPCs to interact with.`)} 
          variant="info" 
          size="lg"
          icon={<BookIcon />}
          className="h-full !py-4"
        >
          Settlement Info
        </ActionButton>
        <ActionButton 
          onClick={() => onShowMessage('Your Gold', `You currently have ${player.gold} gold coins.`)} 
          variant="warning" 
          size="lg"
          icon={<GoldCoinIcon />}
          className="h-full !py-4"
        >
          Gold: {player.gold}
        </ActionButton>
        <ActionButton 
          onClick={() => onShowMessage('Coming Soon', 'Settlement map and detailed exploration coming in future updates!')} 
          variant="success" 
          size="lg"
          icon={<MapIcon />}
          className="h-full !py-4"
          disabled={true}
        >
          Settlement Map
        </ActionButton>
      </div>

      {/* Shops Section */}
      {settlement.shops.length > 0 && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FlaskIcon className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-semibold text-amber-300">Shops & Services</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.shops.map((shop) => (
              <div key={shop.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-slate-100">{shop.name}</h4>
                  <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                    {shop.type}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{shop.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {shop.items.length} items • {shop.services.length} services
                  </div>
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
        </div>
      )}

      {/* Taverns Section */}
      {settlement.taverns.length > 0 && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BuildingIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-green-300">Taverns & Inns</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.taverns.map((tavern) => (
              <div key={tavern.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <h4 className="text-lg font-medium text-slate-100 mb-2">{tavern.name}</h4>
                <p className="text-sm text-slate-300 mb-3">{tavern.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {tavern.rooms.length} room types • {tavern.services.length} services
                  </div>
                  <ActionButton 
                    onClick={() => onOpenTavern(tavern.id)} 
                    variant="success" 
                    size="sm"
                  >
                    Enter Tavern
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPCs Section */}
      {settlement.npcs.length > 0 && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-300">Notable Residents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settlement.npcs.map((npc) => (
              <div key={npc.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <UserIcon className="w-8 h-8 text-slate-400" />
                  <div>
                    <h4 className="text-md font-medium text-slate-100">{npc.name}</h4>
                    <p className="text-xs text-slate-400">{npc.occupation}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">{npc.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {npc.quests.length > 0 && <span className="text-yellow-400">Has quests</span>}
                    {npc.services.length > 0 && <span className="text-green-400">Offers services</span>}
                  </div>
                  <ActionButton 
                    onClick={() => onTalkToNPC(npc.id)} 
                    variant="info" 
                    size="sm"
                  >
                    Talk
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points of Interest */}
      {settlement.pointsOfInterest.length > 0 && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-300">Points of Interest</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.pointsOfInterest.map((poi) => (
              <div key={poi.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-slate-100">{poi.name}</h4>
                  <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                    {poi.type}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{poi.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {poi.interactionType} • {poi.rewards?.length || 0} rewards
                  </div>
                  <ActionButton 
                    onClick={() => onExplorePointOfInterest(poi.id)} 
                    variant="secondary" 
                    size="sm"
                    disabled={true}
                  >
                    Explore (Soon)
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementView; 