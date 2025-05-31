import React from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';
import { GameState, GeneratedSpellData, GeneratedConsumableData, GeneratedEquipmentData, Spell, ResourceCost, ItemType, SpellIconName } from '../../types'; // UPDATED
import { GetSpellIcon } from './IconComponents';

interface ConfirmationViewProps {
  gameState: GameState; 
  pendingSpellCraftData: GeneratedSpellData | null;
  pendingSpellEditData: GeneratedSpellData | null;
  originalSpellForEdit: Spell | null;
  pendingItemCraftData: GeneratedConsumableData | GeneratedEquipmentData | null; // UPDATED
  onConfirm: () => void;
  onCancel: () => void;
  checkResources: (costs?: ResourceCost[]) => boolean;
  renderResourceList: (costs?: ResourceCost[]) => React.ReactNode;
  isLoading: boolean;
}

const DetailRow: React.FC<{label: string; value?: string | number | null; icon?: SpellIconName; iconClass?: string; valueClass?: string; children?: React.ReactNode}> = ({label, value, icon, iconClass="text-sky-300", valueClass="", children}) => {
    if (value === undefined && !children) return null;
    return (
        <div className="flex items-start py-2 border-b border-slate-600/50 last:border-b-0">
            {icon && <GetSpellIcon iconName={icon} className={`w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 ${iconClass}`} />}
            <strong className="text-slate-300 w-28 flex-shrink-0 text-sm">{label}:</strong>
            {value !== undefined && <span className={`text-slate-100 text-sm ${valueClass}`}>{value}</span>}
            {children && <div className="text-slate-100 text-sm flex-grow">{children}</div>}
        </div>
    );
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  gameState,
  pendingSpellCraftData,
  pendingSpellEditData,
  originalSpellForEdit,
  pendingItemCraftData,
  onConfirm,
  onCancel,
  checkResources,
  renderResourceList,
  isLoading,
}) => {
  const isSpellCraft = gameState === 'SPELL_CRAFT_CONFIRMATION';
  const isSpellEdit = gameState === 'SPELL_EDIT_CONFIRMATION';
  const isItemCraft = gameState === 'ITEM_CRAFT_CONFIRMATION';

  const dataToConfirm = isSpellCraft ? pendingSpellCraftData : isSpellEdit ? pendingSpellEditData : pendingItemCraftData;

  if (!dataToConfirm) {
    console.error("ConfirmationView rendered without data to confirm.");
    return null; 
  }

  const itemTypeForConfirm: ItemType | undefined = isItemCraft 
    ? ((pendingItemCraftData as GeneratedEquipmentData).slot ? 'Equipment' : 'Consumable') // UPDATED 'Potion' to 'Consumable'
    : undefined;

  const title = isSpellCraft ? "Confirm Spell Craft" 
              : isSpellEdit ? "Confirm Spell Refinement" 
              : `Confirm ${itemTypeForConfirm} Craft`;

  const canAfford = checkResources(dataToConfirm.resourceCost);
  const itemData = dataToConfirm; 

  return (
    <Modal isOpen={true} onClose={onCancel} title={title} size="xl">
      <div className="space-y-5 text-sm">
        {isSpellEdit && originalSpellForEdit && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-md border border-slate-600/60">
            <p className="text-xs text-slate-400 mb-1">Refining spell: <span className="font-semibold text-slate-200">{originalSpellForEdit.name}</span></p>
            <p className="text-xs text-slate-400">Original Mana: {originalSpellForEdit.manaCost}, Damage: {originalSpellForEdit.damage}</p>
          </div>
        )}
        <p className="text-base text-slate-200">The AI has proposed the following:</p>
        
        <div className="p-4 bg-slate-700/80 rounded-lg text-slate-200 space-y-0.5 border-2 border-slate-600/70 shadow-inner">
          <DetailRow label="Name" value={itemData.name} icon={itemData.iconName || 'Default'} iconClass="text-sky-300"/>
          <DetailRow label="Description" value={itemData.description}/>
          
          {(isSpellCraft || isSpellEdit) && (
            <>
              <hr className="border-slate-600/50 my-1.5" />
              <DetailRow label="Mana Cost" value={(itemData as GeneratedSpellData).manaCost} icon="WandIcon" iconClass="text-blue-400"/>
              <DetailRow label="Damage" value={`${(itemData as GeneratedSpellData).damage} (${(itemData as GeneratedSpellData).damageType})`} icon="SwordSlash" iconClass="text-red-400"/>
              {(itemData as GeneratedSpellData).effect && <DetailRow label="Effect" value={(itemData as GeneratedSpellData).effect} icon="Star" iconClass="text-purple-400"/>}
              {(itemData as GeneratedSpellData).statusEffectInflict && 
                <DetailRow label="Status" value={`${(itemData as GeneratedSpellData).statusEffectInflict!.chance}% to apply ${(itemData as GeneratedSpellData).statusEffectInflict!.name} (${(itemData as GeneratedSpellData).statusEffectInflict!.duration}t${(itemData as GeneratedSpellData).statusEffectInflict!.magnitude ? `, Mag: ${(itemData as GeneratedSpellData).statusEffectInflict!.magnitude}` : ''})`} icon="StatusPoison" iconClass="text-teal-400"/>
              }
            </>
          )}

          {isItemCraft && itemTypeForConfirm === 'Consumable' && (itemData as GeneratedConsumableData).effectType && ( // UPDATED
            <>
              <hr className="border-slate-600/50 my-1.5" />
              <DetailRow label="Effect Type" value={(itemData as GeneratedConsumableData).effectType.replace('_', ' ')} icon="PotionGeneric" iconClass="text-lime-400"/>
              {(itemData as GeneratedConsumableData).magnitude !== undefined && <DetailRow label="Magnitude" value={(itemData as GeneratedConsumableData).magnitude} icon="Heal" iconClass="text-lime-400"/>}
              {(itemData as GeneratedConsumableData).duration !== undefined && <DetailRow label="Duration" value={`${(itemData as GeneratedConsumableData).duration} turns`} icon="MindIcon" iconClass="text-lime-400"/>}
              {(itemData as GeneratedConsumableData).statusToCure && <DetailRow label="Cures" value={(itemData as GeneratedConsumableData).statusToCure} icon="Shield" iconClass="text-lime-400"/>}
              {(itemData as GeneratedConsumableData).buffToApply && <DetailRow label="Applies Buff" value={(itemData as GeneratedConsumableData).buffToApply} icon="Star" iconClass="text-lime-400"/>}
            </>
          )}

          {isItemCraft && itemTypeForConfirm === 'Equipment' && (itemData as GeneratedEquipmentData).slot && (
            <>
              <hr className="border-slate-600/50 my-1.5" />
              <DetailRow label="Slot" value={(itemData as GeneratedEquipmentData).slot} icon="GearIcon" iconClass="text-orange-400"/>
              {(itemData as GeneratedEquipmentData).statsBoost && Object.keys((itemData as GeneratedEquipmentData).statsBoost).length > 0 && (
                 <DetailRow label="Stat Boosts" icon="SwordHilt" iconClass="text-orange-400">
                    <div className="space-y-0.5">
                        {Object.entries((itemData as GeneratedEquipmentData).statsBoost).map(([key, val]) => 
                            <p key={key} className="text-slate-100">{key.charAt(0).toUpperCase() + key.slice(1).replace("maxH","Max HP").replace("maxM","Max MP")}: <span className="font-semibold text-orange-300">+{val}</span></p>
                        )}
                    </div>
                </DetailRow>
              )}
            </>
          )}
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-amber-300 mb-2 mt-3">Required Resources:</h3>
          <div className="bg-slate-700/80 p-3 rounded-lg border-2 border-slate-600/70 shadow-inner">
            {renderResourceList(itemData.resourceCost)}
          </div>
        </div>

        {!canAfford && <p className="text-red-400 font-bold mt-3 text-center py-2 bg-red-900/30 rounded-md border border-red-700/50">You do not have enough resources!</p>}
        
        <div className="flex justify-end space-x-4 pt-4">
          <ActionButton onClick={onCancel} variant="secondary" size="md">Cancel</ActionButton>
          <ActionButton onClick={onConfirm} variant="primary" size="md" disabled={!canAfford || isLoading} isLoading={isLoading}>
            {isLoading ? "Processing..." : (isSpellCraft ? "Craft Spell" : isSpellEdit ? "Confirm Refinement" : `Craft ${itemTypeForConfirm}`)}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationView;