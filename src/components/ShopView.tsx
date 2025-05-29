import React, { useState } from 'react';
import { Player, Shop, ShopItem, ShopService } from '../types';
import ActionButton from '../ui/ActionButton';
import { FlaskIcon, GoldCoinIcon, HeroBackIcon, UserIcon, GearIcon } from './IconComponents';
import { getShopById, getNPCById } from '../services/locationService';
import { MASTER_ITEM_DEFINITIONS } from '../services/itemService';

interface ShopViewProps {
  player: Player;
  shopId: string;
  onReturnToSettlement: () => void;
  onPurchaseItem: (itemId: string, price: number, quantity: number) => void;
  onPurchaseService: (serviceId: string, price: number) => void;
  onShowMessage: (title: string, message: string) => void;
}

const ShopView: React.FC<ShopViewProps> = ({
  player,
  shopId,
  onReturnToSettlement,
  onPurchaseItem,
  onPurchaseService,
  onShowMessage,
}) => {
  const [selectedTab, setSelectedTab] = useState<'items' | 'services'>('items');
  const shop = getShopById(shopId);
  const shopkeeper = shop ? getNPCById(shop.keeper) : null;

  if (!shop) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Shop Not Found</h2>
        <p className="text-slate-300 mb-6">The requested shop could not be found.</p>
        <ActionButton onClick={onReturnToSettlement} variant="secondary" icon={<HeroBackIcon />}>
          Return to Settlement
        </ActionButton>
      </div>
    );
  }

  const canAfford = (price: number) => player.gold >= price;

  const handlePurchase = (item: ShopItem) => {
    if (!canAfford(item.price)) {
      onShowMessage('Insufficient Funds', `You need ${item.price} gold but only have ${player.gold} gold.`);
      return;
    }
    if (item.stock === 0) {
      onShowMessage('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    onPurchaseItem(item.itemId, item.price, 1);
  };

  const handleServicePurchase = (service: ShopService) => {
    if (!canAfford(service.price)) {
      onShowMessage('Insufficient Funds', `You need ${service.price} gold but only have ${player.gold} gold.`);
      return;
    }
    onPurchaseService(service.id, service.price);
  };

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          {shop.name}
        </h2>
        <p className="text-slate-300 mb-4 max-w-2xl mx-auto">{shop.description}</p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <FlaskIcon className="w-4 h-4 mr-1" />
            {shop.type.charAt(0).toUpperCase() + shop.type.slice(1)} Shop
          </span>
          {shopkeeper && (
            <span className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              {shopkeeper.name}
            </span>
          )}
          <span className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1" />
            Your Gold: {player.gold}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4">
        <ActionButton
          onClick={() => setSelectedTab('items')}
          variant={selectedTab === 'items' ? 'primary' : 'secondary'}
          size="lg"
          icon={<FlaskIcon />}
        >
          Items ({shop.items.length})
        </ActionButton>
        <ActionButton
          onClick={() => setSelectedTab('services')}
          variant={selectedTab === 'services' ? 'primary' : 'secondary'}
          size="lg"
          icon={<GearIcon />}
        >
          Services ({shop.services.length})
        </ActionButton>
        <ActionButton
          onClick={onReturnToSettlement}
          variant="secondary"
          size="lg"
          icon={<HeroBackIcon />}
        >
          Back to Settlement
        </ActionButton>
      </div>

      {/* Items Tab */}
      {selectedTab === 'items' && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <h3 className="text-xl font-semibold text-amber-300 mb-4">Available Items</h3>
          {shop.items.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No items available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shop.items.map((item) => {
                const itemDef = MASTER_ITEM_DEFINITIONS[item.itemId];
                const isAffordable = canAfford(item.price);
                const isInStock = item.stock > 0;
                
                return (
                  <div key={item.itemId} className={`bg-slate-700/50 rounded-lg p-4 border ${isAffordable && isInStock ? 'border-slate-600 hover:border-slate-500' : 'border-red-600/50'} transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-slate-100">
                        {itemDef?.name || item.itemId}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <GoldCoinIcon className="w-4 h-4 text-yellow-400" />
                        <span className={`text-sm font-medium ${isAffordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          {item.price}
                        </span>
                      </div>
                    </div>
                    
                    {itemDef && (
                      <p className="text-sm text-slate-300 mb-3">{itemDef.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        Stock: {item.stock === -1 ? '∞' : item.stock}
                        {item.restockTime && item.stock === 0 && (
                          <span className="block text-orange-400">Restocks in {item.restockTime}h</span>
                        )}
                      </div>
                      <ActionButton
                        onClick={() => handlePurchase(item)}
                        variant={isAffordable && isInStock ? 'success' : 'danger'}
                        size="sm"
                        disabled={!isAffordable || !isInStock}
                      >
                        {!isInStock ? 'Out of Stock' : !isAffordable ? 'Too Expensive' : 'Buy'}
                      </ActionButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {selectedTab === 'services' && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
          <h3 className="text-xl font-semibold text-green-300 mb-4">Available Services</h3>
          {shop.services.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No services available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shop.services.map((service) => {
                const isAffordable = canAfford(service.price);
                
                return (
                  <div key={service.id} className={`bg-slate-700/50 rounded-lg p-4 border ${isAffordable ? 'border-slate-600 hover:border-slate-500' : 'border-red-600/50'} transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-slate-100">{service.name}</h4>
                      <div className="flex items-center space-x-2">
                        <GoldCoinIcon className="w-4 h-4 text-yellow-400" />
                        <span className={`text-sm font-medium ${isAffordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          {service.price}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-3">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                        {service.type}
                      </span>
                      <ActionButton
                        onClick={() => handleServicePurchase(service)}
                        variant={isAffordable ? 'success' : 'danger'}
                        size="sm"
                        disabled={!isAffordable}
                      >
                        {!isAffordable ? 'Too Expensive' : 'Purchase'}
                      </ActionButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopView; 