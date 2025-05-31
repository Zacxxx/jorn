import React, { useState, useCallback } from 'react';
import { GameItem, MasterItemDefinition, InventoryFilterType, Equipment, UniqueConsumable, MasterConsumableItem, DetailedEquipmentSlot, Player, SpellIconName } from '../../../types'; // Corrected
import Modal from '../../../ui/Modal'; // Corrected for global UI
import ActionButton from '../../../ui/ActionButton'; // Corrected for global UI
import { ItemCard } from '../../ui/ItemCard'; // Path is correct
import { GENERIC_TO_DETAILED_SLOT_MAP, MASTER_ITEM_DEFINITIONS, RESOURCE_ICONS } from '../../../constants'; // Corrected
import { GetSpellIcon } from '../../IconComponents'; // Corrected
import { getRarityColorClass } from '../../../utils'; // Corrected

// Types specific to Inventory or re-used heavily here
export type InventoryGridItemType = GameItem | { itemDef: MasterItemDefinition, quantity: number };

interface InventoryGridSlotProps {
    item: InventoryGridItemType;
    onClick: (item: InventoryGridItemType) => void;
    onMouseEnter: (event: React.MouseEvent, item: InventoryGridItemType) => void;
    onMouseLeave: () => void;
    rarity?: number;
    onLongPress: (item: InventoryGridItemType, position: { x: number; y: number }) => void;
}

const InventoryGridSlot: React.FC<InventoryGridSlotProps> = ({ item, onClick, onMouseEnter, onMouseLeave, rarity, onLongPress }) => {
    const isStackable = 'itemDef' in item;
    const displayItem = isStackable ? item.itemDef : item;
    const quantity = isStackable ? item.quantity : undefined;
    const rarityColor = getRarityColorClass(rarity || displayItem.rarity || 0);
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

    const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (e.type === 'mousedown' && (e as React.MouseEvent).button === 2) { /* Allow default context menu for mouse right click */ }
        if (e.type === 'touchstart') { onMouseLeave(); }
        longPressTimer.current = setTimeout(() => {
            const position = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
            onLongPress(item, position);
            longPressTimer.current = null;
        }, 500);
    };
    const handlePressEnd = () => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    };
    const handleClick = () => { onClick(item); };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={(e) => onMouseEnter(e, item)}
            onMouseLeave={onMouseLeave}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onContextMenu={(e) => { e.preventDefault(); handlePressStart(e); }}
            className={`h-[72px] xs:h-[76px] sm:h-[84px] bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600 hover:border-sky-400 rounded-md flex flex-col items-center justify-center p-1 shadow-sm transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-sky-400 ${rarityColor ? `border-l-4 ${rarityColor.replace('text-', 'border-')}` : 'border-l-4 border-transparent'}`}
            aria-label={displayItem.name}
        >
            <GetSpellIcon iconName={displayItem.iconName} className={`w-1/2 h-1/2 ${displayItem.itemType === 'Resource' ? 'text-amber-300' : 'text-sky-300'} mb-0.5 xs:mb-1`} />
            <span className="text-[0.5rem] xs:text-[0.55rem] sm:text-[0.6rem] text-slate-200 text-center whitespace-normal w-full px-0.5 leading-tight">{displayItem.name}</span>
            {quantity && quantity > 0 && (
                <span className="absolute bottom-0 right-0 text-[0.5rem] xs:text-[0.55rem] sm:text-[0.6rem] font-bold text-white bg-sky-600 px-1 py-0.5 rounded-tl-md rounded-br-sm shadow">
                    x{quantity}
                </span>
            )}
        </button>
    );
};

interface ItemTooltipProps {
    item: InventoryGridItemType;
    position: { x: number, y: number };
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position }) => {
    const isStackable = 'itemDef' in item;
    const displayItem = isStackable ? item.itemDef : item;
    const quantity = isStackable ? item.quantity : undefined;
    const itemAsEquipment = displayItem as Equipment;
    const itemAsConsumable = displayItem as MasterConsumableItem | UniqueConsumable;
    const uniqueItemDetails = !isStackable ? item as UniqueConsumable : undefined;
    const hasResourceCost = uniqueItemDetails?.resourceCost && uniqueItemDetails.resourceCost.length > 0;
    const resourceCostToDisplay = hasResourceCost ? uniqueItemDetails.resourceCost : [];

    const renderStatsBoost = (statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>) => {
        const boostsArray = Object.entries(statsBoost).map(([key, value]) => (
          <p key={key} className="text-[0.5rem] xs:text-[0.55rem] text-green-300">
            {`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} +${value}`}
          </p>
        ));
        return boostsArray.length > 0 ? <div className="space-y-0 mt-0.5">{boostsArray}</div> : null;
    };

    const style: React.CSSProperties = {
        position: 'fixed', top: position.y + 15, left: position.x + 15, zIndex: 1300, pointerEvents: 'none',
    };
    if (typeof window !== 'undefined') {
        const tooltipWidth = 200; const tooltipHeight = 150;
        if (position.x + 15 + tooltipWidth > window.innerWidth) { style.left = position.x - 15 - tooltipWidth; }
        if (position.y + 15 + tooltipHeight > window.innerHeight) { style.top = position.y - 15 - tooltipHeight; }
        if (style.top && (style.top as number) < 0) style.top = 5;
        if (style.left && (style.left as number) < 0) style.left = 5;
    }

    return (
        <div style={style} className="bg-slate-800/95 p-1.5 xs:p-2 rounded-lg shadow-xl border-2 border-sky-500/70 text-slate-200 backdrop-blur-sm w-max max-w-[200px] text-xs">
            <div className="flex items-center mb-1 pb-1 border-b border-slate-600/80">
                <GetSpellIcon iconName={displayItem.iconName} className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1 xs:mr-1.5 flex-shrink-0" />
                <h5 className="font-bold text-sky-300 text-[0.65rem] xs:text-[0.7rem]">{displayItem.name} {quantity && `(x${quantity})`}</h5>
            </div>
            <p className="text-[0.55rem] xs:text-[0.6rem] text-slate-300 mb-1 italic">{displayItem.description}</p>
            {displayItem.itemType === 'Resource' && <p className="text-[0.55rem] xs:text-[0.6rem] text-amber-200">Type: Resource</p>}
            {displayItem.itemType === 'Consumable' && (
                <>
                    <p className="text-[0.55rem] xs:text-[0.6rem] text-lime-300">Type: Consumable</p>
                    <p className="text-[0.5rem] xs:text-[0.55rem]">Effect: {itemAsConsumable.effectType.replace(/_/g, ' ')}
                        {itemAsConsumable.magnitude !== undefined && ` (${itemAsConsumable.magnitude})`}
                        {itemAsConsumable.duration !== undefined && `, ${itemAsConsumable.duration}t`}
                    </p>
                    {itemAsConsumable.statusToCure && <p className="text-[0.5rem] xs:text-[0.55rem]">Cures: {itemAsConsumable.statusToCure}</p>}
                    {itemAsConsumable.buffToApply && <p className="text-[0.5rem] xs:text-[0.55rem]">Buffs: {itemAsConsumable.buffToApply}</p>}
                </>
            )}
            {displayItem.itemType === 'Equipment' && (
                <>
                    <p className="text-[0.55rem] xs:text-[0.6rem] text-orange-300">Type: Equipment</p>
                    <p className="text-[0.5rem] xs:text-[0.55rem]">Slot: {itemAsEquipment.slot}</p>
                    {itemAsEquipment.statsBoost && Object.keys(itemAsEquipment.statsBoost).length > 0 && (
                        <div className="text-[0.5rem] xs:text-[0.55rem]">Stats: {renderStatsBoost(itemAsEquipment.statsBoost)}</div>
                    )}
                </>
            )}
            {displayItem.itemType === 'LootChest' && (<p className="text-[0.55rem] xs:text-[0.6rem] text-yellow-300">Level: {(displayItem as LootChestItem).level}</p>)}
            {hasResourceCost && resourceCostToDisplay && resourceCostToDisplay.length > 0 && (
                 <div className="mt-0.5 pt-0.5 border-t border-slate-700">
                    <p className="text-amber-400 font-semibold text-[0.45rem] xs:text-[0.5rem] mb-0.5">Craft Cost:</p>
                    {resourceCostToDisplay.map(rc => {
                        const resourceDef = MASTER_ITEM_DEFINITIONS[rc.itemId] as MasterResourceItem | undefined;
                        const name = resourceDef ? resourceDef.name : rc.type;
                        const icon = resourceDef ? resourceDef.iconName : RESOURCE_ICONS[rc.itemId as SpellIconName] || 'Default';
                        return(<span key={rc.itemId} className="mr-1 text-amber-200 text-[0.45rem] xs:text-[0.5rem] flex items-center"><GetSpellIcon iconName={icon} className="w-2 h-2 mr-0.5 opacity-70"/>{rc.quantity} {name}</span>)
                    })}
                 </div>
            )}
        </div>
    );
};

interface ItemContextMenuProps {
    isOpen: boolean;
    item: InventoryGridItemType | null;
    position: { x: number; y: number } | null;
    onClose: () => void;
    onUseItem: (item: MasterItemDefinition | GameItem) => void;
    onEquipItem: (item: Equipment) => void;
}

const ItemContextMenu: React.FC<ItemContextMenuProps> = ({ isOpen, item, position, onClose, onUseItem, onEquipItem }) => {
    if (!isOpen || !item || !position) return null;
    const displayItem = 'itemDef' in item ? item.itemDef : item;
    const canUse = displayItem.itemType === 'Consumable';
    const canEquip = displayItem.itemType === 'Equipment';

    const style: React.CSSProperties = {
        position: 'fixed', top: Math.min(position.y, window.innerHeight - 80), left: Math.min(position.x, window.innerWidth - 130),
        transform: 'translate(-50%, -100%)', zIndex: 1100, minWidth: '120px'
    };
    if (position.y < 80) { style.transform = 'translate(-50%, 10px)'; }

    return (
        <div style={style} className="bg-slate-800 border-2 border-sky-500 rounded-md shadow-lg p-1.5 space-y-1">
            {canUse && (<ActionButton onClick={() => onUseItem(displayItem)} size="sm" variant="success" className="w-full !py-1 text-xs">Use</ActionButton>)}
            {canEquip && (<ActionButton onClick={() => onEquipItem(displayItem as Equipment)} size="sm" variant="primary" className="w-full !py-1 text-xs">Equip</ActionButton>)}
            {(!canUse && !canEquip) && <p className="text-slate-400 text-xs italic text-center px-2 py-1">No quick actions</p>}
            <ActionButton onClick={onClose} size="sm" variant="secondary" className="w-full !py-1 text-xs mt-1">Cancel</ActionButton>
        </div>
    );
};

interface InventoryTabProps {
  player: Player;
  onEquipItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
  onUseConsumableFromInventory: (itemId: string, targetId: string | null) => void;
  onOpenLootChest?: (chestId: string) => Promise<void>; // Optional as it might not always be passed
}

const InventoryTab: React.FC<InventoryTabProps> = ({
  player,
  onEquipItem,
  onUseConsumableFromInventory,
  onOpenLootChest,
}) => {
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilterType>('All');
  const [selectedInventoryItemDetail, setSelectedInventoryItemDetail] = useState<InventoryGridItemType | null>(null);
  const [hoveredInventoryItem, setHoveredInventoryItem] = useState<InventoryGridItemType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
      isOpen: boolean;
      item: InventoryGridItemType | null;
      position: { x: number; y: number } | null;
  }>({ isOpen: false, item: null, position: null });

  const getInventoryGridItems = useCallback((): InventoryGridItemType[] => {
    let items: InventoryGridItemType[] = [];
    Object.entries(player.inventory).forEach(([itemId, quantity]) => {
        if (quantity > 0) {
            const itemDef = MASTER_ITEM_DEFINITIONS[itemId];
            if (itemDef && (inventoryFilter === 'All' || itemDef.itemType === inventoryFilter) &&
                (!inventorySearchTerm || itemDef.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()))) {
                 items.push({ itemDef, quantity, rarity: itemDef.rarity });
            }
        }
    });
    player.items.forEach(item => {
        if ((inventoryFilter === 'All' || item.itemType === inventoryFilter) &&
            (!inventorySearchTerm || item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()))) {
            items.push({ ...item, rarity: item.rarity });
        }
    });
    items.sort((a, b) => {
        const typeA = 'itemDef' in a ? a.itemDef.itemType : a.itemType;
        const typeB = 'itemDef' in b ? b.itemDef.itemType : b.itemType;
        const nameA = 'itemDef' in a ? a.itemDef.name : a.name;
        const nameB = 'itemDef' in b ? b.itemDef.name : b.name;
        const typeOrder = ['Resource', 'Consumable', 'Equipment', 'LootChest', 'QuestItem'];
        if (typeA !== typeB) { return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB); }
        return nameA.localeCompare(nameB);
    });
    return items;
  }, [player.inventory, player.items, inventoryFilter, inventorySearchTerm]);

  const handleInventoryGridSlotClick = (item: InventoryGridItemType) => {
    if (contextMenuState.isOpen && contextMenuState.item === item) {
        setContextMenuState({ isOpen: false, item: null, position: null }); return;
    }
    setSelectedInventoryItemDetail(item);
    setTooltipPosition(null);
    setContextMenuState({ isOpen: false, item: null, position: null });
  };

  const handleInventoryItemMouseEnter = (event: React.MouseEvent, item: InventoryGridItemType) => {
    if (!contextMenuState.isOpen) { // Don't show tooltip if context menu is open
        setHoveredInventoryItem(item);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleInventoryItemMouseLeave = () => {
    setHoveredInventoryItem(null);
    setTooltipPosition(null);
  };

  const handleContextMenu = (item: InventoryGridItemType, position: { x: number; y: number }) => {
    setContextMenuState({ isOpen: true, item, position });
    setSelectedInventoryItemDetail(null);
    setTooltipPosition(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-2 mb-2 p-1.5 bg-slate-700/50 rounded-md border border-slate-600">
        <div className="relative w-full flex-grow">
          <input type="text" placeholder="Search inventory..." value={inventorySearchTerm} onChange={e => setInventorySearchTerm(e.target.value)}
            className="w-full p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-xs pr-7"
          />
          {inventorySearchTerm && (
            <button onClick={() => setInventorySearchTerm('')} className="absolute inset-y-0 right-0 flex items-center justify-center w-7 h-full text-slate-400 hover:text-slate-200" aria-label="Clear search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <select value={inventoryFilter} onChange={e => setInventoryFilter(e.target.value as InventoryFilterType)} className="w-full sm:w-auto p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-xs">
          {(['All', 'Resource', 'Consumable', 'Equipment', 'LootChest', 'QuestItem'] as InventoryFilterType[]).map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <ActionButton onClick={() => console.log("Sort & Filter TBD")} variant="secondary" size="sm" className="w-full sm:w-auto !py-1.5 text-xs">Sort & Filter</ActionButton>
      </div>
      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5 xs:gap-2 flex-grow overflow-y-auto styled-scrollbar p-1 sm:p-1.5 bg-slate-800/40 rounded-md border border-slate-600/50 min-h-[200px]">
        {getInventoryGridItems().map((gridItem, index) => (
            <InventoryGridSlot key={('itemDef' in gridItem ? gridItem.itemDef.id : gridItem.id) + '-' + index} item={gridItem}
              onClick={handleInventoryGridSlotClick} onMouseEnter={handleInventoryItemMouseEnter} onMouseLeave={handleInventoryItemMouseLeave}
              rarity={'itemDef' in gridItem ? gridItem.itemDef.rarity : gridItem.rarity} onLongPress={handleContextMenu}
            />
        ))}
        {getInventoryGridItems().length === 0 && <p className="col-span-full text-center text-slate-400 italic py-4">Inventory is empty or no items match filter.</p>}
      </div>
      {hoveredInventoryItem && tooltipPosition && !contextMenuState.isOpen && (
          <ItemTooltip item={hoveredInventoryItem} position={tooltipPosition} masterItemDefinitions={MASTER_ITEM_DEFINITIONS} />
      )}
      {selectedInventoryItemDetail && (
        <Modal isOpen={true} onClose={() => setSelectedInventoryItemDetail(null)} title={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.itemDef.name : selectedInventoryItemDetail.name} size="md">
          <ItemCard item={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.itemDef : selectedInventoryItemDetail}
            quantity={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.quantity : undefined}
            onUseItemFromInventory={onUseConsumableFromInventory} onOpenLootChest={onOpenLootChest}
            onQuickEquip={(equip) => {
              const slotType = equip.slot;
              const availableSlots = GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.filter(s => !player.equippedItems[s]);
              if (availableSlots && availableSlots.length > 0) { onEquipItem(equip.id, availableSlots[0]); }
              else { const fallbackSlot = GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.[0]; if (fallbackSlot) { onEquipItem(equip.id, fallbackSlot); }
              else { console.warn("No valid detailed slot for generic slot:", slotType, "for item:", equip.name); }}
              setSelectedInventoryItemDetail(null);
            }}
            isDetailView={true}
          />
        </Modal>
      )}
      {contextMenuState.isOpen && contextMenuState.item && contextMenuState.position && (
          <>
            <div className="fixed inset-0 bg-black/0 z-[1090]" onClick={() => setContextMenuState({ isOpen: false, item: null, position: null })}/>
            <ItemContextMenu isOpen={contextMenuState.isOpen} item={contextMenuState.item} position={contextMenuState.position}
              onClose={() => setContextMenuState({ isOpen: false, item: null, position: null })}
              onUseItem={(itemToUse) => {
                if (itemToUse.itemType === 'Consumable') {
                  const idToUse = (itemToUse as GameItem).id || (itemToUse as MasterItemDefinition).id;
                  onUseConsumableFromInventory(idToUse, null);
                }
                setContextMenuState({ isOpen: false, item: null, position: null });
              }}
              onEquipItem={(itemToEquip) => {
                const slotType = itemToEquip.slot;
                let targetDetailedSlot = GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.[0];
                if (targetDetailedSlot && player.equippedItems[targetDetailedSlot]) {
                  const availableSlots = GENERIC_TO_DETAILED_SLOT_MAP[slotType].filter(s => !player.equippedItems[s]);
                  targetDetailedSlot = availableSlots.length > 0 ? availableSlots[0] : GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.[0];
                }
                if (targetDetailedSlot) { onEquipItem(itemToEquip.id, targetDetailedSlot); }
                else { console.warn("No valid detailed slot for:", slotType); setSelectedInventoryItemDetail(contextMenuState.item); }
                setContextMenuState({ isOpen: false, item: null, position: null });
              }}
            />
          </>
      )}
    </div>
  );
};

export default InventoryTab;
