import { Player, Spell, SpellIconName, StatusEffectName, ResourceType, ConsumableEffectType, EquipmentSlot, Ability, DetailedEquipmentSlot } from './types'; // UPDATED PotionEffectType

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const INITIAL_PLAYER_NAME = "Hero"; // Default player name

export const STARTER_SPELL: Spell = {
  id: 'starter-strike',
  name: 'Minor Strike',
  description: 'A weak arcane bolt.',
  manaCost: 5,
  damage: 8, 
  damageType: 'Arcane',
  scalesWith: 'Mind', 
  iconName: 'ArcaneBlast',
  resourceCost: [{ type: 'Arcane Dust', quantity: 1 }],
};

export const INITIAL_PLAYER_EP = 50;
export const PLAYER_EP_REGEN_PER_TURN = 5;
export const DEFENDING_DEFENSE_BONUS_PERCENTAGE = 0.5; // Player takes 50% less damage when defending

export const STARTER_ABILITIES: Ability[] = [
  {
    id: 'ability-focus-01',
    name: 'Focus',
    description: 'Expend energy to restore a small amount of mana.',
    epCost: 15,
    effectType: 'MP_RESTORE',
    magnitude: 10,
    iconName: 'MindIcon',
  }
];

export const AVAILABLE_RESOURCES: ResourceType[] = ['Arcane Dust', 'Emberbloom Petal', 'Shadowsilk Thread', 'Crystal Shard', 'Verdant Leaf', 'Mystic Orb'];

export const INITIAL_PLAYER_INVENTORY: Record<ResourceType, number> = {
  'Arcane Dust': 5,
  'Emberbloom Petal': 2,
  'Shadowsilk Thread': 2,
  'Crystal Shard': 1,
  'Verdant Leaf': 2,
  'Mystic Orb': 0,
};

export const PLAYER_BASE_BODY = 10;
export const PLAYER_BASE_MIND = 10;
export const PLAYER_BASE_REFLEX = 10;
export const PLAYER_BASE_SPEED_FROM_REFLEX = 10; 

export const HP_PER_BODY = 5;
export const HP_PER_LEVEL = 10;
export const BASE_HP = 50;

export const MP_PER_MIND = 5;
export const MP_PER_LEVEL = 5;
export const BASE_MP = 30;

export const EP_PER_REFLEX = 5;
export const EP_PER_LEVEL = 5;
export const BASE_EP = 30;

export const SPEED_PER_REFLEX = 1; 

export const PHYSICAL_POWER_PER_BODY = 1;
export const MAGIC_POWER_PER_MIND = 1;
export const DEFENSE_PER_BODY = 0.3; 
export const DEFENSE_PER_REFLEX = 0.2; 


export const INITIAL_PLAYER_STATS: Omit<Player, 'spells' | 'traits' | 'quests' | 'preparedSpellIds' | 'activeStatusEffects' | 'inventory' | 'items' | 'equippedItems' | 'ep' | 'maxEp' | 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'speed' | 'abilities' | 'preparedAbilityIds' | 'name' | 'bestiary'> = {
  body: PLAYER_BASE_BODY,
  mind: PLAYER_BASE_MIND,
  reflex: PLAYER_BASE_REFLEX,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
};


export const AVAILABLE_SPELL_ICONS: SpellIconName[] = [
  'Fireball', 'IceShard', 'LightningBolt', 'Heal', 'Shield', 
  'SwordSlash', 'PoisonCloud', 'ArcaneBlast', 'ShadowBolt', 'HolyLight',
  'Book', 'Scroll', 'Star', 
  'StatusPoison', 'StatusStun',
  'Gem', 'Plant', 'Dust', 'Thread', 
  'PotionHP', 'PotionMP', 'PotionGeneric', 'SwordHilt', 'Breastplate', 'Amulet', 
  'WandIcon',
  'UserIcon', 'HeroBackIcon', 'BagIcon', 'GearIcon', 
  'MindIcon', 'BodyIcon', 'ReflexIcon', 'SpeedIcon',
  'CheckmarkCircleIcon', 
  'FilterListIcon', 
  'SortAlphaIcon',
  'SkullIcon',
  'HelmetIcon', 'NecklaceIcon', 'RingIcon', 'BeltIcon', 'BootsIcon', 'GlovesIcon', 'ShoulderArmorIcon', 'CloakIcon', 'BackpackIcon',
  'Bars3Icon', 'SearchIcon', 'CollectionIcon', 'FleeIcon',
  'Default'
];

export const AVAILABLE_ITEM_ICONS: SpellIconName[] = [ // Includes icons for consumables and equipment
  'PotionHP', 'PotionMP', 'PotionGeneric', 'Scroll', 'Star', // Consumable-ish
  'SwordHilt', 'Breastplate', 'Amulet', 'HelmetIcon', 'NecklaceIcon', 'RingIcon', 'BeltIcon', 'BootsIcon', 'GlovesIcon', 'ShoulderArmorIcon', 'CloakIcon', // Equipment-ish
  'Gem', 'Plant', 'Dust', 'Thread', // Resources might be shown as items too
  'WandIcon', 'MindIcon', 'CollectionIcon',
  'Default'
];


export const RESOURCE_ICONS: Record<ResourceType, SpellIconName> = {
  'Arcane Dust': 'Dust',
  'Emberbloom Petal': 'Plant', 
  'Shadowsilk Thread': 'Thread',
  'Crystal Shard': 'Gem',
  'Verdant Leaf': 'Plant',
  'Mystic Orb': 'ArcaneBlast', 
};

export const AVAILABLE_STATUS_EFFECTS: StatusEffectName[] = [
    'Poison', 'Stun', 'Burn', 'Freeze', 
    'WeakenBody', 'WeakenMind', 'WeakenReflex',
    'StrengthenBody', 'StrengthenMind', 'StrengthenReflex',
    'Regeneration',
    'TEMP_BODY_UP', 'TEMP_MIND_UP', 'TEMP_REFLEX_UP', 'TEMP_SPEED_UP',
    'TEMP_MAX_HP_UP', 'TEMP_MAX_MP_UP', 'TEMP_HP_REGEN',
    'Defending' // New status effect
];

export const STATUS_EFFECT_ICONS: Record<StatusEffectName, SpellIconName> = {
  Poison: 'StatusPoison',
  Stun: 'StatusStun',
  Burn: 'Fireball', 
  Freeze: 'IceShard', 
  WeakenBody: 'Shield', 
  WeakenMind: 'MindIcon', 
  WeakenReflex: 'ReflexIcon', 
  StrengthenBody: 'BodyIcon', 
  StrengthenMind: 'MindIcon', 
  StrengthenReflex: 'ReflexIcon', 
  Regeneration: 'Heal', 
  TEMP_BODY_UP: 'BodyIcon',
  TEMP_MIND_UP: 'MindIcon',
  TEMP_REFLEX_UP: 'ReflexIcon',
  TEMP_SPEED_UP: 'SpeedIcon',
  TEMP_MAX_HP_UP: 'Heal', 
  TEMP_MAX_MP_UP: 'WandIcon', 
  TEMP_HP_REGEN: 'Heal',
  Defending: 'Shield', // New icon mapping
};

export const CONSUMABLE_EFFECT_TYPES: ConsumableEffectType[] = ['HP_RESTORE', 'MP_RESTORE', 'EP_RESTORE', 'CURE_STATUS', 'APPLY_BUFF']; // RENAMED
// Generic equipment slots used for item generation by AI
export const AVAILABLE_EQUIPMENT_SLOTS: EquipmentSlot[] = ['Weapon', 'Armor', 'Accessory'];

export const CONSUMABLE_EFFECT_ICONS: Record<ConsumableEffectType, SpellIconName> = { // RENAMED
    HP_RESTORE: 'PotionHP',
    MP_RESTORE: 'PotionMP',
    EP_RESTORE: 'PotionGeneric', 
    CURE_STATUS: 'PotionGeneric', 
    APPLY_BUFF: 'Star', 
};

// Mapping generic AI-generated slots to default icons for those generic types
export const GENERIC_EQUIPMENT_SLOT_ICONS: Record<EquipmentSlot, SpellIconName> = {
    Weapon: 'SwordHilt',
    Armor: 'Breastplate',
    Accessory: 'Amulet',
};

export const MAX_SPELLS_PER_LEVEL_BASE = 2; 
export const PREPARED_SPELLS_PER_LEVEL_BASE = 1;
export const PREPARED_ABILITIES_PER_LEVEL_BASE = 1;

export const FIRST_TRAIT_LEVEL = 1; 
export const TRAIT_LEVEL_INTERVAL = 3; 

export const DEFAULT_QUEST_ICON: SpellIconName = 'Book';
export const DEFAULT_TRAIT_ICON: SpellIconName = 'Star';
export const DEFAULT_ENCYCLOPEDIA_ICON: SpellIconName = 'CollectionIcon';


export const ENEMY_DIFFICULTY_XP_REWARD = {
  easy: 25,
  medium: 50,
  hard: 100,
  boss: 250,
};

export const BATTLE_RESOURCE_REWARD_TYPES = 1; 
export const BATTLE_RESOURCE_REWARD_QUANTITY_MIN = 1;
export const BATTLE_RESOURCE_REWARD_QUANTITY_MAX = 2;

// For Character Sheet Layout
export const DETAILED_EQUIPMENT_SLOTS_LEFT_COL: DetailedEquipmentSlot[] = ['Head', 'Neck', 'Jewels', 'Chest', 'Belt', 'Legs', 'Feet'];
export const DETAILED_EQUIPMENT_SLOTS_RIGHT_COL: DetailedEquipmentSlot[] = ['Hands', 'Shoulder', 'Back', 'Accessory1', 'Accessory2', 'Followers', 'MetaItems'];

export const DETAILED_SLOT_PLACEHOLDER_ICONS: Record<DetailedEquipmentSlot, SpellIconName> = {
  Head: 'HelmetIcon',
  Neck: 'NecklaceIcon',
  Jewels: 'RingIcon',
  Chest: 'Breastplate',
  Belt: 'BeltIcon',
  Legs: 'BootsIcon', 
  Feet: 'BootsIcon',
  WeaponLeft: 'SwordHilt',
  WeaponRight: 'SwordHilt',
  Hands: 'GlovesIcon',
  Shoulder: 'ShoulderArmorIcon',
  Back: 'CloakIcon',
  Accessory1: 'Amulet',
  Accessory2: 'RingIcon', 
  Followers: 'BackpackIcon', 
  MetaItems: 'Gem' 
};

// Mapping from generic EquipmentSlot to compatible DetailedEquipmentSlots
export const GENERIC_TO_DETAILED_SLOT_MAP: Record<EquipmentSlot, DetailedEquipmentSlot[]> = {
  Weapon: ['WeaponLeft', 'WeaponRight'],
  Armor: ['Head', 'Chest', 'Legs', 'Feet', 'Hands', 'Shoulder', 'Back'], 
  Accessory: ['Neck', 'Jewels', 'Belt', 'Accessory1', 'Accessory2', 'Back'], 
};

// Define data for each element
export const ELEMENT_DATA = [
  { id: 'Fire', name: 'Fire', description: 'Deals burning damage over time.', iconName: 'Fireball' },
  { id: 'Ice', name: 'Ice', description: 'Slows enemies and can freeze them.', iconName: 'IceShard' },
  { id: 'Lightning', name: 'Lightning', description: 'Deals high burst damage and can stun.', iconName: 'LightningBolt' },
  { id: 'Physical', name: 'Physical', description: 'Standard physical damage.', iconName: 'SwordSlash' },
  { id: 'Healing', name: 'Healing', description: 'Restores health.', iconName: 'Heal' },
  { id: 'Dark', name: 'Dark', description: 'Drains life or applies curses.', iconName: 'ShadowBolt' },
  { id: 'Light', name: 'Light', description: 'Heals or harms undead and demons.', iconName: 'HolyLight' },
  { id: 'Arcane', name: 'Arcane', description: 'Raw magical energy.', iconName: 'ArcaneBlast' },
  { id: 'Poison', name: 'Poison', description: 'Deals damage over time and weakens.', iconName: 'StatusPoison' },
  { id: 'None', name: 'None', description: 'Has no elemental alignment.', iconName: 'Default' },
];