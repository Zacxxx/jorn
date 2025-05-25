import { Equipment, ResourceType, SpellIconName, EquipmentSlot, ConsumableEffectType, ItemElement } from '../../types';

export interface BaseEquipmentTemplate {
  idPrefix: string; // e.g., 'worn_leather_armor'
  name: string;
  description: string;
  iconName: SpellIconName;
  slot: EquipmentSlot;
  baseStats: Equipment['statsBoost'];
  craftingCost?: { type: ResourceType, quantity: number }[];
  defaultElement?: ItemElement;
}

export interface BaseConsumableTemplate {
  idPrefix: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  effectType: ConsumableEffectType;
  baseMagnitude?: number;
  baseDuration?: number;
  craftingCost?: { type: ResourceType, quantity: number }[];
  defaultElement?: ItemElement;
}

// Example templates (can be expanded significantly)
export const EQUIPMENT_TEMPLATES: Record<string, BaseEquipmentTemplate> = {
  RUSTY_SWORD: {
    idPrefix: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'An old, dull sword. Better than nothing.',
    iconName: 'SwordHilt',
    slot: 'Weapon',
    baseStats: { body: 1 },
    craftingCost: [{ type: 'Arcane Dust', quantity: 2 }]
  },
  LEATHER_CAP: {
    idPrefix: 'leather_cap',
    name: 'Leather Cap',
    description: 'A simple cap made of cured leather.',
    iconName: 'HelmetIcon',
    slot: 'Armor', // Generic slot, player will equip to 'Head'
    baseStats: { reflex: 1 },
    craftingCost: [{ type: 'Shadowsilk Thread', quantity: 3 }]
  }
};

export const CONSUMABLE_TEMPLATES: Record<string, BaseConsumableTemplate> = {
  MINOR_HEALING_POTION: {
    idPrefix: 'minor_healing_potion',
    name: 'Minor Healing Potion',
    description: 'Restores a small amount of health.',
    iconName: 'PotionHP',
    effectType: 'HP_RESTORE',
    baseMagnitude: 20,
    craftingCost: [{ type: 'Verdant Leaf', quantity: 2 }, { type: 'Crystal Shard', quantity: 1 }]
  }
};

// This is a starting point. You can add many more templates,
// potentially categorize them by rarity, material, etc.
// The idea is that the AI or a deterministic crafting system
// could use these templates as a base. 