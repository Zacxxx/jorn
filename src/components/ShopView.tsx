import React, { useState } from 'react';
import { Player } from '../types';
import ActionButton from '../../ui/ActionButton';
import { GearIcon, HeroBackIcon, GoldCoinIcon, FlaskIcon, CheckmarkCircleIcon } from './IconComponents';
import { GetSpellIcon } from './IconComponents';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

interface ShopViewProps {
  player: Player;
  shopId: string;
  onReturnToSettlement: () => void;
  onPurchaseItem: (itemId: string, price: number, quantity: number) => void;
  onPurchaseService: (serviceId: string, price: number) => void;
  onShowMessage: (title: string, message: string) => void;
}

// Mock shop data - in a real implementation, this would come from a service based on shopId
const mockShopData = {
  id: 'general_store',
  name: 'General Store',
  description: 'A well-stocked shop with essential supplies for adventurers.',
  type: 'general',
  items: [
    { itemId: 'health_potion_minor', price: 25, quantity: 10 },
    { itemId: 'mana_potion_minor', price: 30, quantity: 8 },
    { itemId: 'verdant_leaf', price: 5, quantity: 20 },
    { itemId: 'crystal_shard', price: 15, quantity: 5 },
    { itemId: 'iron_ore', price: 10, quantity: 15 },
    { itemId: 'arcane_dust', price: 12, quantity: 12 }
  ],
  services: [
    { id: 'repair', name: 'Equipment Repair', description: 'Restore your equipment to full durability.', price: 50 },
    { id: 'identify', name: 'Item Identification', description: 'Reveal the properties of mysterious items.', price: 25 }
  ]
};

const ShopView: React.FC<ShopViewProps> = ({
  player,
  shopId,
  onReturnToSettlement,
  onPurchaseItem,
  onPurchaseService,
  onShowMessage,
}) => {
  const [selectedTab, setSelectedTab] = useState<'items' | 'services'>('items');
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});

  const shop = mockShopData; // In real implementation, fetch by shopId

  const canAffordItem = (price: number, quantity: number = 1): boolean => {
    return player.gold >= price * quantity;
  };

  const canAffordService = (price: number): boolean => {
    return player.gold >= price;
  };

  const handlePurchaseItem = (itemId: string, price: number) => {
    const quantity = purchaseQuantities[itemId] || 1;
    if (!canAffordItem(price, quantity)) {
      onShowMessage('Insufficient Gold', `You need ${price * quantity} gold to purchase this item.`);
      return;
    }
    onPurchaseItem(itemId, price, quantity);
    setPurchaseQuantities(prev => ({ ...prev, [itemId]: 1 }));
  };

  const handlePurchaseService = (serviceId: string, price: number) => {
    if (!canAffordService(price)) {
      onShowMessage('Insufficient Gold', `You need ${price} gold to purchase this service.`);
      return;
    }
    onPurchaseService(serviceId, price);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setPurchaseQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(10, quantity))
    }));
  };

  const getQuantity = (itemId: string): number => {
    return purchaseQuantities[itemId] || 1;
  };

  const renderItems = () => (
    <div>
      <h4 className="text-lg font-semibold text-slate-200 mb-4">Items for Sale</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shop.items.map((shopItem) => {
          const item = MASTER_ITEM_DEFINITIONS[shopItem.itemId];
          const quantity = getQuantity(shopItem.itemId);
          const totalPrice = shopItem.price * quantity;
          const canAfford = canAffordItem(shopItem.price, quantity);
          
          return (
            <div key={shopItem.itemId} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center space-x-3 mb-3">
                <GetSpellIcon iconName={item?.iconName || 'Default'} className="w-8 h-8 text-amber-400" />
                <div className="flex-1">
                  <h5 className="text-md font-medium text-slate-100">{item?.name || shopItem.itemId}</h5>
                  <p className="text-sm text-slate-300">{item?.description || 'A useful item.'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-400">
                  <span>Price: {shopItem.price}g each</span>
                  <br />
                  <span>Stock: {shopItem.quantity}</span>
                </div>
                <div className="text-sm text-slate-300">
                  Total: <span className={canAfford ? 'text-green-400' : 'text-red-400'}>{totalPrice}g</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateQuantity(shopItem.itemId, quantity - 1)}
                    className="w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded text-slate-200 text-sm"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm text-slate-200">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(shopItem.itemId, quantity + 1)}
                    className="w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded text-slate-200 text-sm"
                    disabled={quantity >= 10 || quantity >= shopItem.quantity}
                  >
                    +
                  </button>
                </div>
                <ActionButton
                  onClick={() => handlePurchaseItem(shopItem.itemId, shopItem.price)}
                  variant={canAfford ? "success" : "secondary"}
                  size="sm"
                  disabled={!canAfford || shopItem.quantity <= 0}
                  icon={<GoldCoinIcon className="w-4 h-4" />}
                  className="flex-1"
                >
                  {canAfford ? 'Buy' : 'Too Expensive'}
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderServices = () => (
    <div>
      <h4 className="text-lg font-semibold text-slate-200 mb-4">Services Available</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shop.services.map((service) => {
          const canAfford = canAffordService(service.price);
          
          return (
            <div key={service.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center space-x-3 mb-3">
                <GearIcon className="w-8 h-8 text-blue-400" />
                <div className="flex-1">
                  <h5 className="text-md font-medium text-slate-100">{service.name}</h5>
                  <p className="text-sm text-slate-300">{service.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Price: <span className={canAfford ? 'text-green-400' : 'text-red-400'}>{service.price}g</span>
                </div>
                <ActionButton
                  onClick={() => handlePurchaseService(service.id, service.price)}
                  variant={canAfford ? "primary" : "secondary"}
                  size="sm"
                  disabled={!canAfford}
                  icon={<CheckmarkCircleIcon className="w-4 h-4" />}
                >
                  {canAfford ? 'Purchase' : 'Too Expensive'}
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-amber-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <FlaskIcon className="w-8 h-8 mr-3 text-amber-400" />
          {shop.name}
        </h2>
        <p className="text-slate-300 mb-4">{shop.description}</p>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
          <span className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1" />
            Your Gold: {player.gold}
          </span>
          <span className="flex items-center">
            <GearIcon className="w-4 h-4 mr-1" />
            Shop Type: {shop.type}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <ActionButton
          onClick={onReturnToSettlement}
          variant="secondary"
          size="lg"
          icon={<HeroBackIcon />}
        >
          Return to Settlement
        </ActionButton>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <div className="flex border-b border-slate-600">
          <button
            onClick={() => setSelectedTab('items')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedTab === 'items'
                ? 'bg-slate-700 text-amber-300 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Items ({shop.items.length})
          </button>
          <button
            onClick={() => setSelectedTab('services')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              selectedTab === 'services'
                ? 'bg-slate-700 text-blue-300 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Services ({shop.services.length})
          </button>
        </div>
        
        <div className="p-6">
          {selectedTab === 'items' && renderItems()}
          {selectedTab === 'services' && renderServices()}
        </div>
      </div>
    </div>
  );
};

export default ShopView; 