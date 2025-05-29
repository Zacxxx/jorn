


import { Player, Spell, SpellIconName, StatusEffectName, ResourceType, ConsumableEffectType, EquipmentSlot, Ability, DetailedEquipmentSlot, SpellComponent, MasterResourceItem } from './types';
import { ALL_GAME_SPELL_COMPONENTS } from './src/research-content'; 

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const INITIAL_PLAYER_NAME = "Hero"; 
export const INITIAL_PLAYER_GOLD = 50; 
export const INITIAL_PLAYER_ESSENCE = 10; 


export const STARTER_SPELL: Spell = {
  id: 'starter-strike',
  name: 'Minor Strike',
  description: 'A weak arcane bolt.',
  manaCost: 5,
  damage: 8, 
  damageType: 'Arcane',
  scalesWith: 'Mind', 
  iconName: 'ArcaneBlast',
  resourceCost: [{ itemId: 'res_arcane_dust_001', quantity: 1, type: 'Arcane Dust' }], 
  level: 1, 
  rarity: 0, 
  tags: ['Arcane', 'Projectile'], 
  scalingFactor: 0,
};

export const INITIAL_PLAYER_EP = 50;
export const PLAYER_EP_REGEN_PER_TURN = 5;
export const DEFENDING_DEFENSE_BONUS_PERCENTAGE = 0.5; 

export const STARTER_ABILITIES: Ability[] = [
  {
    id: 'ability-focus-01',
    name: 'Focus',
    description: 'Expend energy to restore a small amount of mana.',
    epCost: 15,
    effectType: 'MP_RESTORE',
    magnitude: 10,
    iconName: 'MindIcon',
    rarity: 0,
    tags: ['ResourceGeneration'],
    scalingFactor: 0,
  }
];

export const AVAILABLE_RESOURCE_TYPES_FOR_AI: ResourceType[] = ['Arcane Dust', 'Emberbloom Petal', 'Shadowsilk Thread', 'Crystal Shard', 'Verdant Leaf', 'Mystic Orb', 'Iron Ore', 'Ancient Bone'];
export const AVAILABLE_RESOURCES: ResourceType[] = AVAILABLE_RESOURCE_TYPES_FOR_AI;


export const INITIAL_PLAYER_INVENTORY: Record<string, number> = {
  'res_arcane_dust_001': 5,
  'res_emberbloom_petal_001': 2,
  'res_shadowsilk_thread_001': 2,
  'res_crystal_shard_001': 1,
  'res_verdant_leaf_001': 2,
  'res_mystic_orb_001': 0,
  'res_iron_ore_001': 3, 
  'res_ancient_bone_001': 0,
  'con_minor_healing_potion_001': 3, 
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


export const INITIAL_PLAYER_STATS: Omit<Player, 'spells' | 'traits' | 'quests' | 'preparedSpellIds' | 'activeStatusEffects' | 'inventory' | 'items' | 'equippedItems' | 'ep' | 'maxEp' | 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'speed' | 'abilities' | 'preparedAbilityIds' | 'name' | 'bestiary' | 'gold' | 'discoveredComponents' | 'essence' > = {
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
  'StatusPoison', 'StatusStun', 'StatusSilence', 'StatusRoot',
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
  'AtomIcon', 'FlaskIcon', 'GoldCoinIcon', 'EssenceIcon', 'MapIcon', 
  'UploadIcon', 'DownloadIcon', 'ChestIcon',
  'ElementFire', 'ElementIce', 'ElementLightning', 'ElementEarth', 'ElementAir', 'ElementLight', 'ElementDark', 'ElementArcane', 'ElementNature', 'ElementPoison', 'ElementHealing',
  'TagGeneric',
  'Default'
];

export const AVAILABLE_ITEM_ICONS: SpellIconName[] = [ 
  'PotionHP', 'PotionMP', 'PotionGeneric', 'Scroll', 'Star', 
  'SwordHilt', 'Breastplate', 'Amulet', 'HelmetIcon', 'NecklaceIcon', 'RingIcon', 'BeltIcon', 'BootsIcon', 'GlovesIcon', 'ShoulderArmorIcon', 'CloakIcon', 
  'Gem', 'Plant', 'Dust', 'Thread', 
  'WandIcon', 'MindIcon', 'CollectionIcon', 'GoldCoinIcon', 'EssenceIcon', 'ChestIcon', 'FlaskIcon',
  'Default'
];

export const RESOURCE_ICONS: Record<string, SpellIconName> = {
  'res_arcane_dust_001': 'Dust',
  'res_emberbloom_petal_001': 'Plant', 
  'res_shadowsilk_thread_001': 'Thread',
  'res_crystal_shard_001': 'Gem',
  'res_verdant_leaf_001': 'Plant',
  'res_mystic_orb_001': 'ArcaneBlast',
  'res_iron_ore_001': 'GearIcon', 
  'res_ancient_bone_001': 'SkullIcon', 
  'con_minor_healing_potion_001': 'PotionHP',
  'con_minor_mana_potion_001': 'PotionMP',
  'con_antidote_001': 'PotionGeneric',
  'con_strength_draught_001': 'FlaskIcon',
  'con_energy_bar_001': 'EssenceIcon',
  'con_scroll_warding_001': 'Scroll',
};

export const AVAILABLE_STATUS_EFFECTS: StatusEffectName[] = [
    'Poison', 'Stun', 'Burn', 'Freeze', 
    'WeakenBody', 'WeakenMind', 'WeakenReflex',
    'StrengthenBody', 'StrengthenMind', 'StrengthenReflex',
    'Regeneration',
    'TEMP_BODY_UP', 'TEMP_MIND_UP', 'TEMP_REFLEX_UP', 'TEMP_SPEED_UP',
    'TEMP_MAX_HP_UP', 'TEMP_MAX_MP_UP', 'TEMP_HP_REGEN',
    'Defending',
    'DamageReflection',
    'BurningDoTActive', 'BleedingDoTActive', 'CorruptedDoTActive', 'FrostbittenDoTActive', 'RottingDoTActive', 'ShockedDoTActive', 'PoisonDoTActive',
    'Silenced', 'Rooted'
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
  Defending: 'Shield',
  DamageReflection: 'Shield', 
  BurningDoTActive: 'Fireball',
  BleedingDoTActive: 'SwordSlash',
  CorruptedDoTActive: 'ShadowBolt',
  FrostbittenDoTActive: 'IceShard',
  RottingDoTActive: 'PoisonCloud',
  ShockedDoTActive: 'LightningBolt',
  PoisonDoTActive: 'StatusPoison',
  Silenced: 'StatusSilence',
  Rooted: 'StatusRoot',
};

export const CONSUMABLE_EFFECT_TYPES: ConsumableEffectType[] = ['HP_RESTORE', 'MP_RESTORE', 'EP_RESTORE', 'CURE_STATUS', 'APPLY_BUFF']; 
export const AVAILABLE_EQUIPMENT_SLOTS: EquipmentSlot[] = ['Weapon', 'Armor', 'Accessory'];

export const CONSUMABLE_EFFECT_ICONS: Record<ConsumableEffectType, SpellIconName> = { 
    HP_RESTORE: 'PotionHP',
    MP_RESTORE: 'PotionMP',
    EP_RESTORE: 'PotionGeneric', 
    CURE_STATUS: 'PotionGeneric', 
    APPLY_BUFF: 'Star', 
};

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
  easy: { xp: 25, goldMin: 2, goldMax: 5, essenceMin: 0, essenceMax: 1 },
  medium: { xp: 50, goldMin: 5, goldMax: 10, essenceMin: 1, essenceMax: 2 },
  hard: { xp: 100, goldMin: 10, goldMax: 20, essenceMin: 2, essenceMax: 3 },
  boss: { xp: 250, goldMin: 50, goldMax: 100, essenceMin: 5, essenceMax: 10 },
  elite: { xp_multiplier: 2, gold_multiplier: 1.5, essence_multiplier: 2.5} 
};

export const BATTLE_RESOURCE_REWARD_TYPES = 1; 
export const BATTLE_RESOURCE_REWARD_QUANTITY_MIN = 1;
export const BATTLE_RESOURCE_REWARD_QUANTITY_MAX = 2;

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
  Followers: 'UserIcon', 
  MetaItems: 'Star', 
};

export const GENERIC_TO_DETAILED_SLOT_MAP: Record<EquipmentSlot, DetailedEquipmentSlot[]> = {
    Weapon: ['WeaponLeft', 'WeaponRight'],
    Armor: ['Head', 'Chest', 'Legs', 'Feet', 'Hands', 'Shoulder', 'Back'], 
    Accessory: ['Neck', 'Jewels', 'Belt', 'Accessory1', 'Accessory2', 'Back'],
};

export const EXAMPLE_SPELL_COMPONENTS: SpellComponent[] = ALL_GAME_SPELL_COMPONENTS;

export const RESEARCH_SEARCH_BASE_GOLD_COST = 50;
export const RESEARCH_SEARCH_BASE_ESSENCE_COST = 20;
export const DEFAULT_SILENCE_DURATION = 2; 
export const DEFAULT_ROOT_DURATION = 2; 
