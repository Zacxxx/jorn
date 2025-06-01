import { Player, Spell, SpellIconName, StatusEffectName, ResourceType, ConsumableEffectType, EquipmentSlot, Ability, DetailedEquipmentSlot, SpellComponent } from './types'; // Removed TagName here, will get from src/types
import { TagName, TagDefinition, TagCategory } from './src/types'; // Import new types from src/types
import { ALL_GAME_SPELL_COMPONENTS } from './src/research-content'; 

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const INITIAL_PLAYER_NAME = "Hero"; 
export const INITIAL_PLAYER_GOLD = 50; 
export const INITIAL_PLAYER_ESSENCE = 10; 
export const INITIAL_PLAYER_LOCATION = "eldergrove"; // Starting location ID, updated from src/constants.ts

export const INITIAL_PLAYER_EP = 50;
export const PLAYER_EP_REGEN_PER_TURN = 5;
export const DEFENDING_DEFENSE_BONUS_PERCENTAGE = 0.5; 

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
  // Add basic crafting ingredients for recipes
  'healing_herb': 5,
  'crystal_shard_minor': 3,
  'iron_ore': 2,
  'emberbloom_petal': 2,
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


export const INITIAL_PLAYER_STATS: Omit<Player, 'spells' | 'traits' | 'quests' | 'preparedSpellIds' | 'activeStatusEffects' | 'inventory' | 'items' | 'equippedItems' | 'ep' | 'maxEp' | 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'speed' | 'abilities' | 'preparedAbilityIds' | 'name' | 'bestiary' | 'gold' | 'discoveredComponents' | 'essence' | 'discoveredRecipes' | 'currentLocationId' | 'homestead'> = {
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
  'AtomIcon', 'FlaskIcon', 'GoldCoinIcon', 'EssenceIcon', 'MapIcon', 'TentIcon',
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
    'Silenced', 'Rooted',
    // Added for tag-based effects
    'Slow',
    'Haste',
    'Shield',
    'Invisibility'
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
  // Added for tag-based effects
  Slow: 'StatusRoot', // Placeholder: console.warn("Missing specific icon for 'Slow', using 'StatusRoot'.");
  Haste: 'SpeedIcon',
  Shield: 'Shield',
  Invisibility: 'TagGeneric', // Placeholder: console.warn("Missing specific icon for 'Invisibility', using 'TagGeneric'.");
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

// Comprehensive Tag System
// The TagDefinition interface is now imported from 'src/types.ts'
// The TagCategory enum is now imported from 'src/types.ts'

// TAG_DEFINITIONS now uses the imported TagDefinition and TagCategory.
export const TAG_DEFINITIONS: { [key in TagName]: TagDefinition } = {
  // Damage Types
  Fire: {
    name: "Fire",
    description: "Deals fire damage and may cause burning.",
    category: TagCategory.DAMAGE_TYPE,
    color: "red", // Consider using Tailwind classes like 'text-red-500' if styling is applied directly
    rarity: 2,
    powerLevel: 3,
    conflictsWith: ["Ice"],
    synergizesWith: ['Explosive', 'Burning', 'Lightning'],
    effectType: "active",
    unlockLevel: 1,
  },
  Ice: {
    name: "Ice",
    description: "Deals ice damage and may cause freezing or slowing.",
    category: TagCategory.DAMAGE_TYPE,
    color: "blue",
    rarity: 2,
    powerLevel: 3,
    conflictsWith: ["Fire"],
    synergizesWith: ['Slow', 'Freezing', 'Shattering'],
    effectType: "active",
    unlockLevel: 1,
  },
  Lightning: {
    name: "Lightning",
    description: "Deals lightning damage and may cause shock.",
    category: TagCategory.DAMAGE_TYPE,
    color: "yellow",
    rarity: 3,
    powerLevel: 4,
    synergizesWith: ['Chain', 'Stun', 'Shocking'], // Changed 'Stunning' to 'Stun'
    effectType: "active",
    unlockLevel: 3,
  },
  Physical: {
    name: "Physical",
    description: "Deals physical damage.",
    category: TagCategory.DAMAGE_TYPE,
    color: "gray",
    rarity: 1,
    powerLevel: 2,
    synergizesWith: ['Brutal', 'Cleave', 'Piercing'],
    effectType: "active",
    unlockLevel: 1,
  },
  Arcane: {
    name: "Arcane",
    description: "Pure magical energy, often bypasses conventional defenses.",
    category: TagCategory.DAMAGE_TYPE,
    color: "purple",
    rarity: 3,
    powerLevel: 5,
    synergizesWith: ['Penetrating', 'Mana_Burn'], // 'Penetrating' might need definition
    effectType: "active",
    unlockLevel: 5,
  },
  Nature: {
    name: "Nature",
    description: "Damage from natural sources, can have restorative aspects.",
    category: TagCategory.DAMAGE_TYPE,
    color: "green",
    rarity: 2,
    powerLevel: 3,
    synergizesWith: ['Regeneration', 'Healing', 'Poison'],
    effectType: "active",
    unlockLevel: 2,
  },
  Dark: {
    name: "Dark",
    description: "Shadowy energy, often with life-draining or fear effects.",
    category: TagCategory.DAMAGE_TYPE,
    color: "black", // Consider 'gray-800' for visibility
    rarity: 4, // Was 3
    powerLevel: 4,
    conflictsWith: ["Light", "Healing"],
    synergizesWith: ['Fear', 'Lifesteal', 'Curse'],
    effectType: "active",
    unlockLevel: 4,
  },
  Light: {
    name: "Light",
    description: "Holy energy, effective against dark or undead, often heals.",
    category: TagCategory.DAMAGE_TYPE,
    color: "white", // Consider 'yellow-200' for visibility
    rarity: 4, // Was 3
    powerLevel: 4,
    conflictsWith: ["Dark"],
    synergizesWith: ['Healing', 'Purify', 'Blessing'], // 'Purify', 'Blessing' might need definition
    effectType: "active",
    unlockLevel: 4,
  },
  Poison: {
    name: "Poison",
    description: "Deals damage over time and may weaken the target.",
    category: TagCategory.DAMAGE_TYPE,
    color: "darkgreen", // Was 'green-500'
    rarity: 3, // Was 2
    powerLevel: 3,
    conflictsWith: ["Healing"],
    synergizesWith: ['Corroding', 'Weakness', 'Bleeding'], // Changed 'Spreading' to 'Bleeding' for example
    effectType: "active",
    unlockLevel: 2,
  },
  Psychic: {
    name: "Psychic",
    description: "Mental force that bypasses physical armor, may confuse.",
    category: TagCategory.DAMAGE_TYPE,
    color: "pink",
    rarity: 4,
    powerLevel: 5,
    synergizesWith: ['Confusion', 'Charm', 'Control'], // 'Mind_Control' to 'Control'
    effectType: "active",
    unlockLevel: 6,
  },

  // Targeting & Range
  SingleTarget: {
    name: "SingleTarget",
    description: "Affects a single target.",
    category: TagCategory.TARGETING,
    color: "cyan",
    rarity: 1,
    powerLevel: 1, // Was 2
    conflictsWith: ["MultiTarget", "AreaOfEffect"],
    effectType: "modifier",
    unlockLevel: 1,
  },
  MultiTarget: {
    name: "MultiTarget",
    description: "Affects multiple targets.",
    category: TagCategory.TARGETING,
    color: "teal", // Was 'orange-400'
    rarity: 3,
    powerLevel: 3, // Was 4
    conflictsWith: ["SingleTarget", "SelfTarget"],
    effectType: "modifier",
    unlockLevel: 3,
  },
  AreaOfEffect: {
    name: "AreaOfEffect",
    description: "Affects all targets within a specified area.",
    category: TagCategory.TARGETING,
    color: "green", // Was 'red-400'
    rarity: 4, // Was 3
    powerLevel: 4, // Was 5
    conflictsWith: ["SingleTarget", "SelfTarget"],
    synergizesWith: ['Explosive'],
    effectType: "modifier",
    unlockLevel: 4,
  },
   SelfTarget: {
    name: "SelfTarget",
    description: "The spell affects the caster.",
    category: TagCategory.TARGETING,
    color: "silver", // Was 'green-400'
    rarity: 1,
    powerLevel: 0, // Was 1
    conflictsWith: ["MultiTarget", "AreaOfEffect", "SingleTarget"],
    effectType: "modifier",
    unlockLevel: 1,
  },
  GlobalTarget: { name: 'GlobalTarget', description: 'Affects all enemies regardless of range.', category: TagCategory.TARGETING, color: 'purple', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'modifier' },
  RandomTarget: { name: 'RandomTarget', description: 'Targets enemies randomly, may hit multiple times.', category: TagCategory.TARGETING, color: 'yellow', rarity: 4, powerLevel: 3, unlockLevel: 5, effectType: 'modifier' },
  Melee: { name: 'Melee', description: 'Close combat range.', category: TagCategory.TARGETING, color: 'red', rarity: 1, powerLevel: 1, conflictsWith: ['Ranged'], synergizesWith: ['Physical', 'Brutal'], unlockLevel: 1, effectType: 'modifier' },
  Ranged: { name: 'Ranged', description: 'Long distance attacks.', category: TagCategory.TARGETING, color: 'blue', rarity: 1, powerLevel: 1, conflictsWith: ['Melee'], synergizesWith: ['Projectile'], unlockLevel: 1, effectType: 'modifier' },
  Touch: { name: 'Touch', description: 'Requires physical contact.', category: TagCategory.TARGETING, color: 'pink', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'modifier' },
  Projectile: { name: 'Projectile', description: 'Travels through air.', category: TagCategory.TARGETING, color: 'cyan', rarity: 2, powerLevel: 2, synergizesWith: ['Piercing', 'Chain'], unlockLevel: 2, effectType: 'modifier' },
  Beam: { name: 'Beam', description: 'Continuous energy beam.', category: TagCategory.TARGETING, color: 'gold', rarity: 4, powerLevel: 5, synergizesWith: ['Piercing', 'Lightning'], unlockLevel: 6, effectType: 'modifier' },
  Cone: { name: 'Cone', description: 'Spreads out in a cone shape.', category: TagCategory.TARGETING, color: 'orange', rarity: 3, powerLevel: 4, synergizesWith: ['AreaOfEffect'], unlockLevel: 4, effectType: 'modifier' },
  Line: { name: 'Line', description: 'Affects all targets in a straight line.', category: TagCategory.TARGETING, color: 'grey', rarity: 3, powerLevel: 4, synergizesWith: ['Piercing'], unlockLevel: 3, effectType: 'modifier' },
  Circle: { name: 'Circle', description: 'Affects all targets within a circular area.', category: TagCategory.TARGETING, color: 'indigo', rarity: 3, powerLevel: 4, synergizesWith: ['AreaOfEffect'], unlockLevel: 4, effectType: 'modifier' },

  // Spell Properties
  Instant: {
    name: "Instant",
    description: "The spell takes effect immediately.",
    category: TagCategory.SPELL_PROPERTY,
    color: "purple", // Was 'yellow-400'
    rarity: 1,
    powerLevel: 1, // Was 2
    conflictsWith: ["Channeling", "Delayed", "Ritual"],
    effectType: "modifier",
    unlockLevel: 1,
  },
  Channeling: {
    name: "Channeling",
    description: "The spell requires time to cast and maintain.",
    category: TagCategory.SPELL_PROPERTY,
    color: "magenta", // Was 'purple-400'
    rarity: 3,
    powerLevel: 2, // Was 4
    conflictsWith: ["Instant", "Delayed", "Ritual"],
    synergizesWith: ['Extended_Duration', 'Concentration'],
    effectType: "active", // Was 'modifier'
    unlockLevel: 3,
  },
  Delayed: {
    name: "Delayed",
    description: "The spell's effect is triggered after a delay.",
    category: TagCategory.TIMING,
    color: "orange",
    rarity: 2,
    powerLevel: 1,
    conflictsWith: ["Instant", "Channeling"],
    effectType: "trigger",
    unlockLevel: 5, // Example
  },
  Ritual: { name: 'Ritual', description: 'Requires time to cast but has powerful effects.', category: TagCategory.SPELL_PROPERTY, color: 'indigo', rarity: 5, powerLevel: 7, conflictsWith: ['Instant'], unlockLevel: 8, effectType: 'modifier' },
  Persistent: { name: 'Persistent', description: 'Effect continues indefinitely until dispelled.', category: TagCategory.SPELL_PROPERTY, color: 'darkcyan', rarity: 6, powerLevel: 6, synergizesWith: ['Extended_Duration'], unlockLevel: 10, effectType: 'passive' },
  Toggle: { name: 'Toggle', description: 'Can be turned on and off at will.', category: TagCategory.SPELL_PROPERTY, color: 'darkblue', rarity: 4, powerLevel: 3, unlockLevel: 5, effectType: 'active' },
  Concentration: { name: 'Concentration', description: 'Requires focus; taking damage may break the effect.', category: TagCategory.SPELL_PROPERTY, color: 'darkorange', rarity: 3, powerLevel: 5, synergizesWith: ['Channeling'], unlockLevel: 4, effectType: 'conditional' },

  // Damage Modifiers
  Critical: {
    name: "Critical",
    description: "Has a chance to deal bonus damage.",
    category: TagCategory.DAMAGE_MODIFIER,
    color: "gold",
    rarity: 5, // Was 3
    powerLevel: 0, // Was 4 - powerLevel might not apply directly for some modifiers
    effectType: "trigger", // Was 'passive'
    unlockLevel: 4,
  },
  // Armor Penetration - Ordered by precedence: True_Damage > Armor_Ignoring > Piercing
  True_Damage: { name: 'True_Damage', description: 'Damage that cannot be mitigated by armor or resistances.', category: TagCategory.DAMAGE_MODIFIER, color: 'lightgrey', rarity: 7, powerLevel: 9, conflictsWith: ["Piercing", "Armor_Ignoring"], unlockLevel: 18, effectType: 'modifier' },
  Armor_Ignoring: { name: 'Armor_Ignoring', description: 'Completely bypasses all armor and resistances.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkred', rarity: 7, powerLevel: 8, conflictsWith: ["Piercing", "True_Damage"], unlockLevel: 12, effectType: 'modifier' },
  Piercing: { name: 'Piercing', description: 'Ignores a portion of target armor/resistance.', category: TagCategory.DAMAGE_MODIFIER, color: 'grey', rarity: 3, powerLevel: 4, conflictsWith: ["True_Damage", "Armor_Ignoring"], synergizesWith: ['Projectile', 'Physical'], unlockLevel: 3, effectType: 'modifier' },

  // Damage Boost - Ordered by precedence: Devastating > Brutal > Overwhelming
  Devastating: { name: 'Devastating', description: 'Massively increases damage, potentially with a drawback or high cost.', category: TagCategory.DAMAGE_MODIFIER, color: 'black', rarity: 8, powerLevel: 0, conflictsWith: ["Brutal", "Overwhelming"], effectType: 'modifier', unlockLevel: 15 },
  Brutal: { name: 'Brutal', description: 'Increases base damage significantly.', category: TagCategory.DAMAGE_MODIFIER, color: 'brown', rarity: 4, powerLevel: 0, conflictsWith: ["Devastating", "Overwhelming"], synergizesWith: ['Critical', 'Physical'], effectType: 'modifier', unlockLevel: 7 },
  Overwhelming: { name: 'Overwhelming', description: 'Slightly increases damage and may add a minor secondary effect.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkred', rarity: 3, powerLevel: 0, conflictsWith: ["Devastating", "Brutal"], effectType: 'modifier', unlockLevel: 9 },

  // Other Damage Modifiers
  Percentage_Damage: { name: 'Percentage_Damage', description: 'Deals damage equal to a percentage of the target\'s max or current health.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkpurple', rarity: 6, powerLevel: 0, unlockLevel: 10, effectType: 'modifier' },
  Explosive: { name: 'Explosive', description: 'Deals area damage around the primary target upon impact.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkorange', rarity: 5, powerLevel: 0, synergizesWith: ['Fire', 'AreaOfEffect'], effectType: 'trigger', unlockLevel: 5 },
  Cleave: { name: 'Cleave', description: 'Attack hits multiple enemies in front of the attacker.', category: TagCategory.DAMAGE_MODIFIER, color: 'maroon', rarity: 3, powerLevel: 4, synergizesWith: ['Physical', 'Melee'], unlockLevel: 3, effectType: 'modifier' },
  Penetrating: { name: 'Penetrating', description: 'Passes through magical shields and barriers.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkcyan', rarity: 5, powerLevel: 5, synergizesWith: ['Arcane'], unlockLevel: 7, effectType: 'modifier' },
  Shattering: { name: 'Shattering', description: 'Destroys armor and shields on critical hits.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkblue', rarity: 5, powerLevel: 6, synergizesWith: ['Ice', 'Critical'], unlockLevel: 8, effectType: 'trigger' },

  // Healing & Support
  Healing: {
    name: "Healing",
    description: "Restores health to the target.",
    category: TagCategory.SPELL_PROPERTY, // Or a dedicated HEALING category
    color: "lightgreen",
    rarity: 2,
    powerLevel: 3,
    conflictsWith: ["Fire", "Ice", "Lightning", "Physical", "Poison", "Dark"],
    synergizesWith: ['Light', 'Nature', 'Restoration'],
    effectType: "active",
    unlockLevel: 1,
  },
  Regeneration: { name: 'Regeneration', description: 'Gradually restores health over time.', category: TagCategory.STATUS_BUFF, color: 'green', rarity: 2, powerLevel: 3, synergizesWith: ['Healing', 'Extended_Duration'], unlockLevel: 2, effectType: 'passive' },
  Restoration: { name: 'Restoration', description: 'Significantly increases the amount of healing done.', category: TagCategory.SPELL_PROPERTY, color: 'palegreen', rarity: 4, powerLevel: 0, synergizesWith: ["Healing", "Cleanse"], effectType: 'modifier', unlockLevel: 8 },
  Revival: { name: 'Revival', description: 'Can resurrect fallen allies.', category: TagCategory.SPELL_PROPERTY, color: 'yellow', rarity: 9, powerLevel: 10, unlockLevel: 20, effectType: 'active' },
  Shield: { name: 'Shield', description: 'Provides a temporary barrier that absorbs damage.', category: TagCategory.STATUS_BUFF, color: 'cyan', rarity: 3, powerLevel: 0, synergizesWith: ['Barrier'], effectType: 'trigger', unlockLevel: 2 },
  Barrier: { name: 'Barrier', description: 'Advanced shield that can have special properties.', category: TagCategory.STATUS_BUFF, color: 'darkcyan', rarity: 4, powerLevel: 5, synergizesWith: ['Shield'], unlockLevel: 6, effectType: 'active' },
  Absorption: { name: 'Absorption', description: 'Converts incoming damage into beneficial effects.', category: TagCategory.DEFENSIVE, color: 'purple', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'passive' },
  Cleanse: { name: 'Cleanse', description: 'Removes negative status effects.', category: TagCategory.SPELL_PROPERTY, color: 'white', rarity: 3, powerLevel: 3, synergizesWith: ['Light', 'Purify', 'Restoration'], unlockLevel: 3, effectType: 'active' },
  Purify: { name: 'Purify', description: 'Removes all debuffs and prevents new ones temporarily.', category: TagCategory.SPELL_PROPERTY, color: 'lightyellow', rarity: 5, powerLevel: 5, synergizesWith: ['Cleanse', 'Light'], unlockLevel: 7, effectType: 'active' },
  Blessing: { name: 'Blessing', description: 'Provides long-term beneficial effects.', category: TagCategory.STATUS_BUFF, color: 'gold', rarity: 4, powerLevel: 4, synergizesWith: ['Light'], unlockLevel: 5, effectType: 'passive' },
  Enhancement: { name: 'Enhancement', description: 'Improves target abilities and effectiveness.', category: TagCategory.STATUS_BUFF, color: 'emerald', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  Empowerment: { name: 'Empowerment', description: 'Dramatically increases target power temporarily.', category: TagCategory.STATUS_BUFF, color: 'darkorange', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'active' },
  
  // Crowd Control
  Stun: { name: 'Stun', description: 'Target is unable to act for a duration.', category: TagCategory.CROWD_CONTROL, color: 'gold', rarity: 5, powerLevel: 0, conflictsWith: ["Freeze", "Sleep", "Taunt"], effectType: 'trigger', unlockLevel: 3 },
  Root: { name: 'Root', description: 'Target is unable to move for a duration.', category: TagCategory.CROWD_CONTROL, color: 'brown', rarity: 3, powerLevel: 0, effectType: 'trigger', unlockLevel: 2 },
  Silence: { name: 'Silence', description: 'Target is unable to cast spells for a duration.', category: TagCategory.CROWD_CONTROL, color: 'purple', rarity: 4, powerLevel: 0, effectType: 'trigger', unlockLevel: 3 },
  Disarm: { name: 'Disarm', description: 'Prevents weapon attacks and equipment use.', category: TagCategory.CROWD_CONTROL, color: 'darkred', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'active' },
  Blind: { name: 'Blind', description: 'Greatly reduces accuracy and perception.', category: TagCategory.CROWD_CONTROL, color: 'darkgrey', rarity: 3, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  Charm: { name: 'Charm', description: 'Causes the target to temporarily become an ally or be unable to attack the caster.', category: TagCategory.CROWD_CONTROL, color: 'pink', rarity: 5, powerLevel: 0, conflictsWith: ["Taunt", "Fear"], synergizesWith: ['Psychic'], effectType: 'trigger', unlockLevel: 7 },
  Fear: { name: 'Fear', description: 'Causes the target to flee in terror.', category: TagCategory.CROWD_CONTROL, color: 'darkpurple', rarity: 4, powerLevel: 0, conflictsWith: ["Taunt", "Charm"], synergizesWith: ['Dark'], effectType: 'trigger', unlockLevel: 5 },
  Taunt: { name: 'Taunt', description: 'Forces the target to attack the caster.', category: TagCategory.CROWD_CONTROL, color: 'darkred', rarity: 3, powerLevel: 0, conflictsWith: ["Stun", "Sleep", "Fear", "Charm"], effectType: 'trigger', unlockLevel: 4 },
  Sleep: { name: 'Sleep', description: 'Target is put to sleep and unable to act until damaged.', category: TagCategory.CROWD_CONTROL, color: 'lavender', rarity: 4, powerLevel: 0, conflictsWith: ["Stun", "Freeze", "Taunt"], effectType: 'trigger', unlockLevel: 5 },
  Slow: { name: 'Slow', description: 'Reduces target\'s movement speed and possibly attack speed.', category: TagCategory.CROWD_CONTROL, color: 'lightblue', rarity: 2, powerLevel: 0, synergizesWith: ['Ice', 'Freezing'], effectType: 'trigger', unlockLevel: 2 },
  Freeze: { name: "Freeze", description: "Target is encased in ice and unable to act.", category: TagCategory.CROWD_CONTROL, color: "powderblue", rarity: 5, powerLevel: 0, conflictsWith: ["Stun", "Sleep", "Burning"], synergizesWith: ["Ice"], effectType: "trigger", unlockLevel: 5 }, // Added Burning conflict

  // Status Effects (Buffs) - Many already defined in root constants, ensuring consistency
  Haste: { name: 'Haste', description: 'Increases caster\'s speed or action frequency.', category: TagCategory.STATUS_BUFF, color: 'greenyellow', rarity: 4, powerLevel: 0, effectType: 'trigger', unlockLevel: 4 },
  Strength: { name: 'Strength', description: 'Increases physical power or related stats.', category: TagCategory.STATUS_BUFF, color: 'red', rarity: 3, powerLevel: 0, effectType: 'trigger', unlockLevel: 2 },
  Intelligence: { name: 'Intelligence', description: 'Increases magical power or related stats.', category: TagCategory.STATUS_BUFF, color: 'blue', rarity: 3, powerLevel: 0, effectType: 'trigger', unlockLevel: 2 },
  Agility: { name: 'Agility', description: 'Increases speed, dodge chance, and critical hits.', category: TagCategory.STATUS_BUFF, color: 'green', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  Fortitude: { name: 'Fortitude', description: 'Increases health, defense, and status resistance.', category: TagCategory.STATUS_BUFF, color: 'grey', rarity: 3, powerLevel: 4, unlockLevel: 3, effectType: 'active' },
  Resilience: { name: 'Resilience', description: 'Reduces incoming damage and effect durations.', category: TagCategory.STATUS_BUFF, color: 'cyan', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  Accuracy: { name: 'Accuracy', description: 'Increases hit chance and critical strike chance.', category: TagCategory.STATUS_BUFF, color: 'yellow', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'passive' },
  Evasion: { name: 'Evasion', description: 'Increases dodge chance and movement speed.', category: TagCategory.STATUS_BUFF, color: 'lightblue', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  Stealth: { name: 'Stealth', description: 'Reduces detection chance, broken by attacking.', category: TagCategory.STATUS_BUFF, color: 'darkgrey', rarity: 4, powerLevel: 4, synergizesWith: ['Invisibility'], unlockLevel: 6, effectType: 'active' },
  Invisibility: { name: 'Invisibility', description: 'Caster becomes unseen by enemies.', category: TagCategory.STATUS_BUFF, color: 'lightgray', rarity: 6, powerLevel: 0, effectType: 'trigger', unlockLevel: 10 },
  Camouflage: { name: 'Camouflage', description: 'Blends with environment, hard to detect when still.', category: TagCategory.STATUS_BUFF, color: 'darkgreen', rarity: 3, powerLevel: 3, synergizesWith: ['Stealth'], unlockLevel: 5, effectType: 'conditional' },
  Phase: { name: 'Phase', description: 'Partially exists in another dimension, reduces damage.', category: TagCategory.STATUS_BUFF, color: 'darkpurple', rarity: 7, powerLevel: 7, unlockLevel: 12, effectType: 'active' },
  Flying: { name: 'Flying', description: 'Moves through air, immune to ground effects.', category: TagCategory.STATUS_BUFF, color: 'skyblue', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'active' },
  Floating: { name: 'Floating', description: 'Hovers above ground, immune to some attacks.', category: TagCategory.STATUS_BUFF, color: 'powderblue', rarity: 3, powerLevel: 4, synergizesWith: ['Flying'], unlockLevel: 4, effectType: 'active' },
  Blink: { name: 'Blink', description: 'Short-range teleportation ability.', category: TagCategory.STATUS_BUFF, color: 'violet', rarity: 4, powerLevel: 4, synergizesWith: ['Teleport'], unlockLevel: 6, effectType: 'active' },
  Teleport: { name: 'Teleport', description: 'Instantly moves to target location.', category: TagCategory.SPECIAL_MECHANIC, color: 'indigo', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'active' },
  Dash: { name: 'Dash', description: 'Rapid movement in target direction.', category: TagCategory.STATUS_BUFF, color: 'orange', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  Charge: { name: 'Charge', description: 'Rushing attack that deals extra damage.', category: TagCategory.STATUS_BUFF, color: 'darkred', rarity: 3, powerLevel: 4, synergizesWith: ['Physical'], unlockLevel: 4, effectType: 'active' },

  // Status Effects (Debuffs)
  Weakness: { name: 'Weakness', description: 'Reduces damage dealt and physical capabilities.', category: TagCategory.STATUS_DEBUFF, color: 'salmon', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  Vulnerability: { name: 'Vulnerability', description: 'Increases damage taken from all sources.', category: TagCategory.STATUS_DEBUFF, color: 'orchid', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'active' },
  Curse: { name: 'Curse', description: 'Long-lasting negative effect that\'s hard to remove.', category: TagCategory.STATUS_DEBUFF, color: 'black', rarity: 5, powerLevel: 6, synergizesWith: ['Dark'], unlockLevel: 7, effectType: 'passive' },
  Hex: { name: 'Hex', description: 'Magical curse that spreads to nearby enemies.', category: TagCategory.STATUS_DEBUFF, color: 'indigo', rarity: 6, powerLevel: 6, synergizesWith: ['Curse'], unlockLevel: 9, effectType: 'passive' },
  Mark: { name: 'Mark', description: 'Target takes increased damage from marked source.', category: TagCategory.STATUS_DEBUFF, color: 'crimson', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  Exposed: { name: 'Exposed', description: 'Reduces all resistances and defenses.', category: TagCategory.STATUS_DEBUFF, color: 'sienna', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },
  Fragile: { name: 'Fragile', description: 'Next attack deals critical damage.', category: TagCategory.STATUS_DEBUFF, color: 'khaki', rarity: 3, powerLevel: 4, synergizesWith: ['Critical'], unlockLevel: 5, effectType: 'conditional' },
  Confusion: { name: 'Confusion', description: 'May attack random targets including allies.', category: TagCategory.STATUS_DEBUFF, color: 'magenta', rarity: 4, powerLevel: 4, synergizesWith: ['Psychic'], unlockLevel: 6, effectType: 'active' },
  Madness: { name: 'Madness', description: 'Severe confusion with unpredictable effects.', category: TagCategory.STATUS_DEBUFF, color: 'firebrick', rarity: 6, powerLevel: 6, synergizesWith: ['Confusion'], unlockLevel: 10, effectType: 'active' },
  Fatigue: { name: 'Fatigue', description: 'Reduces action speed and increases ability costs.', category: TagCategory.STATUS_DEBUFF, color: 'dimgrey', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  Exhaustion: { name: 'Exhaustion', description: 'Severe fatigue that prevents some actions.', category: TagCategory.STATUS_DEBUFF, color: 'darkslategrey', rarity: 4, powerLevel: 5, synergizesWith: ['Fatigue'], unlockLevel: 6, effectType: 'active' },
  Drain: { name: 'Drain', description: 'Gradually reduces resources over time.', category: TagCategory.STATUS_DEBUFF, color: 'royalblue', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  Sap: { name: 'Sap', description: 'Reduces maximum resource pools temporarily.', category: TagCategory.STATUS_DEBUFF, color: 'teal', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },

  // Damage Over Time
  Burning: { name: 'Burning', description: 'Applies a fire-based damage over time effect.', category: TagCategory.DAMAGE_OVER_TIME, color: 'orangered', rarity: 3, powerLevel: 0, synergizesWith: ['Fire'], effectType: 'trigger', unlockLevel: 2 },
  Bleeding: { name: 'Bleeding', description: 'Applies a physical damage over time effect.', category: TagCategory.DAMAGE_OVER_TIME, color: 'darkred', rarity: 3, powerLevel: 0, synergizesWith: ['Physical'], effectType: 'trigger', unlockLevel: 2 },
  Freezing: { name: "Freezing", description: "Applies an ice-based damage over time and/or slowing effect.", category: TagCategory.DAMAGE_OVER_TIME, color: "skyblue", rarity: 3, powerLevel: 0, synergizesWith: ["Ice", "Slow"], conflictsWith: ["Freeze"], effectType: "trigger", unlockLevel: 3 },
  Shocking: { name: 'Shocking', description: 'Applies a lightning-based damage over time or minor disruption effect.', category: TagCategory.DAMAGE_OVER_TIME, color: 'yellow', rarity: 3, powerLevel: 0, synergizesWith: ['Lightning', "Chain"], effectType: 'trigger', unlockLevel: 4 },
  Corroding: { name: 'Corroding', description: 'Acid damage that reduces armor over time.', category: TagCategory.DAMAGE_OVER_TIME, color: 'olive', rarity: 4, powerLevel: 5, synergizesWith: ['Poison'], unlockLevel: 5, effectType: 'passive' },
  Dissolving: { name: 'Dissolving', description: 'Breaks down target at molecular level.', category: TagCategory.DAMAGE_OVER_TIME, color: 'limegreen', rarity: 6, powerLevel: 6, synergizesWith: ['Corroding'], unlockLevel: 9, effectType: 'passive' },
  Withering: { name: 'Withering', description: 'Life force drain that reduces maximum health.', category: TagCategory.DAMAGE_OVER_TIME, color: 'saddlebrown', rarity: 5, powerLevel: 6, synergizesWith: ['Dark'], unlockLevel: 7, effectType: 'passive' },
  Decaying: { name: 'Decaying', description: 'Spreads death and weakness to nearby enemies.', category: TagCategory.DAMAGE_OVER_TIME, color: 'peru', rarity: 6, powerLevel: 6, synergizesWith: ['Withering'], unlockLevel: 10, effectType: 'passive' },
  Rotting: { name: 'Rotting', description: 'Causes target to deteriorate and become brittle.', category: TagCategory.DAMAGE_OVER_TIME, color: 'darkolivegreen', rarity: 5, powerLevel: 5, synergizesWith: ['Poison'], unlockLevel: 8, effectType: 'passive' },
  Consuming: { name: 'Consuming', description: 'Devours target from within, growing stronger.', category: TagCategory.DAMAGE_OVER_TIME, color: 'rebeccapurple', rarity: 7, powerLevel: 7, synergizesWith: ['Stacking'], unlockLevel: 12, effectType: 'passive' },
  Draining: { name: 'Draining', description: 'Transfers life force from target to caster.', category: TagCategory.DAMAGE_OVER_TIME, color: 'indianred', rarity: 5, powerLevel: 6, synergizesWith: ['Lifesteal'], unlockLevel: 8, effectType: 'passive' },

  // Vampiric & Leeching
  Lifesteal: { name: 'Lifesteal', description: 'Heals the caster for a portion of the damage dealt.', category: TagCategory.VAMPIRIC, color: 'crimson', rarity: 4, powerLevel: 0, effectType: 'passive', unlockLevel: 6 },
  Vampiric: { name: 'Vampiric', description: 'Significantly heals the caster based on damage dealt.', category: TagCategory.VAMPIRIC, color: 'darkred', rarity: 6, powerLevel: 0, conflictsWith: ['Lifesteal'], synergizesWith: ['Dark', 'Soul_Drain'], effectType: 'passive', unlockLevel: 9 },
  Mana_Burn: { name: 'Mana_Burn', description: 'Destroys a portion of the target\'s mana.', category: TagCategory.VAMPIRIC, color: 'indigo', rarity: 5, powerLevel: 0, synergizesWith: ['Arcane'], effectType: 'active', unlockLevel: 7 },
  Soul_Drain: { name: 'Soul_Drain', description: 'Permanently steals essence and experience.', category: TagCategory.VAMPIRIC, color: 'darkviolet', rarity: 7, powerLevel: 7, synergizesWith: ['Vampiric'], unlockLevel: 12, effectType: 'active' },
  Energy_Leech: { name: 'Energy_Leech', description: 'Steals energy/stamina from target.', category: TagCategory.VAMPIRIC, color: 'goldenrod', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },
  Essence_Steal: { name: 'Essence_Steal', description: 'Steals magical essence and mana.', category: TagCategory.VAMPIRIC, color: 'mediumpurple', rarity: 5, powerLevel: 5, synergizesWith: ['Mana_Burn'], unlockLevel: 7, effectType: 'active' },
  Stat_Steal: { name: 'Stat_Steal', description: 'Temporarily steals target\'s attributes.', category: TagCategory.VAMPIRIC, color: 'chocolate', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'active' },
  Ability_Steal: { name: 'Ability_Steal', description: 'Copies and uses target\'s abilities.', category: TagCategory.VAMPIRIC, color: 'deepskyblue', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'active' },
  Experience_Steal: { name: 'Experience_Steal', description: 'Steals experience points from target.', category: TagCategory.VAMPIRIC, color: 'darkgoldenrod', rarity: 9, powerLevel: 8, unlockLevel: 18, effectType: 'active' },

  // Defensive Mechanics
  Block: { name: 'Block', description: 'Chance to completely negate incoming attacks.', category: TagCategory.DEFENSIVE, color: 'slategray', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'passive' },
  Parry: { name: 'Parry', description: 'Deflects attacks and creates counterattack opportunity.', category: TagCategory.DEFENSIVE, color: 'steelblue', rarity: 3, powerLevel: 4, synergizesWith: ['Counter'], unlockLevel: 4, effectType: 'trigger' },
  Dodge: { name: 'Dodge', description: 'Completely avoids attacks through agility.', category: TagCategory.DEFENSIVE, color: 'mediumseagreen', rarity: 2, powerLevel: 3, synergizesWith: ['Evasion'], unlockLevel: 3, effectType: 'passive' },
  Deflect: { name: 'Deflect', description: 'Redirects attacks to random targets.', category: TagCategory.DEFENSIVE, color: 'gold', rarity: 4, powerLevel: 4, unlockLevel: 5, effectType: 'trigger' },
  Counter: { name: 'Counter', description: 'Automatically retaliates when attacked.', category: TagCategory.DEFENSIVE, color: 'tomato', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'trigger' },
  Retaliate: { name: 'Retaliate', description: 'Automatically counterattacks when hit.', category: TagCategory.DEFENSIVE, color: 'orangered', rarity: 4, powerLevel: 5, synergizesWith: ['Counter'], unlockLevel: 6, effectType: 'trigger' },
  Reflect: { name: 'Reflect', description: 'Returns damage back to the attacker.', category: TagCategory.DEFENSIVE, color: 'lightgray', rarity: 5, powerLevel: 5, unlockLevel: 7, effectType: 'passive' },
  DamageReflection: { name: 'DamageReflection', description: 'Reflects a percentage of incoming damage.', category: TagCategory.DEFENSIVE, color: 'silver', rarity: 5, powerLevel: 0, effectType: 'passive', unlockLevel: 7 },
  Immune: { name: 'Immune', description: 'Complete immunity to specific damage types.', category: TagCategory.DEFENSIVE, color: 'whitesmoke', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'passive' },
  Resist: { name: 'Resist', description: 'Reduces damage from specific sources.', category: TagCategory.DEFENSIVE, color: 'darkgray', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'passive' },
  Absorb: { name: 'Absorb', description: 'Converts damage into beneficial effects.', category: TagCategory.DEFENSIVE, color: 'dodgerblue', rarity: 5, powerLevel: 5, synergizesWith: ['Absorption'], unlockLevel: 7, effectType: 'passive' },
  Nullify: { name: 'Nullify', description: 'Completely negates magical effects.', category: TagCategory.DEFENSIVE, color: 'darkslateblue', rarity: 7, powerLevel: 7, unlockLevel: 12, effectType: 'trigger' },
  Redirect: { name: 'Redirect', description: 'Forces attacks to hit different targets.', category: TagCategory.DEFENSIVE, color: 'mediumorchid', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'trigger' },

  // Resource Mechanics
  Free_Cast: { name: 'Free_Cast', description: 'Has a chance to cost no mana.', category: TagCategory.RESOURCE, color: 'gold', rarity: 6, powerLevel: 0, effectType: 'trigger', unlockLevel: 8 },
  Reduced_Cost: { name: 'Reduced_Cost', description: 'Reduces the mana cost of the spell.', category: TagCategory.RESOURCE, color: 'lightblue', rarity: 3, powerLevel: 0, effectType: 'modifier', unlockLevel: 4 },
  Cost_Refund: { name: 'Cost_Refund', description: 'Returns resources when conditions are met.', category: TagCategory.RESOURCE, color: 'turquoise', rarity: 4, powerLevel: 4, unlockLevel: 6, effectType: 'conditional' },
  Resource_Generation: { name: 'Resource_Generation', description: 'Generates additional resources over time.', category: TagCategory.RESOURCE, color: 'yellowgreen', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  Overcharge: { name: 'Overcharge', description: 'Spend extra resources for enhanced effects.', category: TagCategory.RESOURCE, color: 'coral', rarity: 5, powerLevel: 6, unlockLevel: 7, effectType: 'modifier' },
  Sacrifice: { name: 'Sacrifice', description: 'Trade health or other resources for power.', category: TagCategory.RESOURCE, color: 'maroon', rarity: 6, powerLevel: 7, unlockLevel: 9, effectType: 'modifier' },
  Channel_Health: { name: 'Channel_Health', description: 'Use health instead of mana for abilities.', category: TagCategory.RESOURCE, color: 'firebrick', rarity: 5, powerLevel: 6, synergizesWith: ['Sacrifice'], unlockLevel: 8, effectType: 'modifier' },
  Blood_Magic: { name: 'Blood_Magic', description: 'Consumes health instead of mana, or in addition to it.', category: TagCategory.RESOURCE, color: 'darkred', rarity: 5, powerLevel: 0, synergizesWith: ['Channel_Health'], effectType: 'modifier', unlockLevel: 12 },
  Soul_Power: { name: 'Soul_Power', description: 'Uses spiritual energy for devastating effects.', category: TagCategory.RESOURCE, color: 'darkmagenta', rarity: 8, powerLevel: 9, unlockLevel: 15, effectType: 'modifier' },

  // Scaling & Progression
  Scaling: { name: 'Scaling', description: 'The spell\'s effectiveness increases with player level or other stats.', category: TagCategory.SCALING, color: 'violet', rarity: 2, powerLevel: 0, effectType: 'passive', unlockLevel: 4 },
  Stacking: { name: 'Stacking', description: 'Effect increases each time it\'s applied.', category: TagCategory.SCALING, color: 'goldenrod', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  Ramping: { name: 'Ramping', description: 'Becomes stronger the longer combat continues.', category: TagCategory.SCALING, color: 'tomato', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'passive' },
  Escalating: { name: 'Escalating', description: 'Each use increases the power of the next.', category: TagCategory.SCALING, color: 'sandybrown', rarity: 5, powerLevel: 5, synergizesWith: ['Stacking'], unlockLevel: 7, effectType: 'passive' },
  Crescendo: { name: 'Crescendo', description: 'Builds to a powerful climactic effect.', category: TagCategory.SCALING, color: 'yellow', rarity: 6, powerLevel: 6, unlockLevel: 9, effectType: 'conditional' },
  Momentum: { name: 'Momentum', description: 'Gains power from consecutive actions.', category: TagCategory.SCALING, color: 'deepskyblue', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'passive' },
  Combo: { name: 'Combo', description: 'This spell can trigger or benefit from a combo sequence.', category: TagCategory.SCALING, color: 'orange', rarity: 3, powerLevel: 0, effectType: 'conditional', unlockLevel: 8 },
  Chain: { name: 'Chain', description: 'The spell jumps to additional targets after hitting the primary one.', category: TagCategory.TARGETING, color: 'yellowgreen', rarity: 4, powerLevel: 0, synergizesWith: ['Lightning', 'MultiTarget'], effectType: 'modifier', unlockLevel: 6 },
  Sequence: { name: 'Sequence', description: 'Must be used in specific order for full effect.', category: TagCategory.SCALING, color: 'mediumpurple', rarity: 5, powerLevel: 6, synergizesWith: ['Combo'], unlockLevel: 8, effectType: 'conditional' },
  Synergy: { name: 'Synergy', description: 'Enhanced effects when combined with specific other tags.', category: TagCategory.SCALING, color: 'springgreen', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'conditional' },
  Resonance: { name: 'Resonance', description: 'Amplifies effects of similar spells nearby.', category: TagCategory.SCALING, color: 'paleturquoise', rarity: 6, powerLevel: 6, synergizesWith: ['Synergy'], unlockLevel: 10, effectType: 'passive' },

  // Timing & Duration
  Extended_Duration: { name: 'Extended_Duration', description: 'Increases the duration of spell effects or status effects.', category: TagCategory.TIMING, color: 'khaki', rarity: 3, powerLevel: 0, conflictsWith: ['Shortened_Duration'], effectType: 'modifier', unlockLevel: 4 },
  Shortened_Duration: { name: 'Shortened_Duration', description: 'Decreases the duration of spell effects or status effects.', category: TagCategory.TIMING, color: 'lightcoral', rarity: 2, powerLevel: 0, conflictsWith: ['Extended_Duration'], effectType: 'modifier', unlockLevel: 3 },
  Triggered: { name: 'Triggered', description: 'Activates when specific conditions are met.', category: TagCategory.TIMING, color: 'darkviolet', rarity: 5, powerLevel: 5, unlockLevel: 7, effectType: 'conditional' },
  Conditional: { name: 'Conditional', description: 'Enhanced effects under specific circumstances.', category: TagCategory.TIMING, color: 'royalblue', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'conditional' },
  Repeating: { name: 'Repeating', description: 'Effect triggers multiple times automatically.', category: TagCategory.TIMING, color: 'gold', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'passive' },
  Echoing: { name: 'Echoing', description: 'The spell repeats its effect a second time with reduced potency.', category: TagCategory.TIMING, color: 'teal', rarity: 5, powerLevel: 0, synergizesWith: ['Delayed'], effectType: 'trigger', unlockLevel: 9 },
  Lingering: { name: 'Lingering', description: 'Leaves behind persistent aftereffects.', category: TagCategory.TIMING, color: 'seagreen', rarity: 4, powerLevel: 4, synergizesWith: ['Persistent'], unlockLevel: 6, effectType: 'passive' },
  Fading: { name: 'Fading', description: 'Effect gradually decreases in strength.', category: TagCategory.TIMING, color: 'lightslategrey', rarity: 3, powerLevel: 3, conflictsWith: ['Persistent'], unlockLevel: 4, effectType: 'modifier' },
  Burst: { name: 'Burst', description: 'Intense effect that ends quickly.', category: TagCategory.TIMING, color: 'orangered', rarity: 3, powerLevel: 6, synergizesWith: ['Shortened_Duration'], unlockLevel: 5, effectType: 'modifier' },

  // Placeholder for tags found in App.tsx that might not be fully defined yet
  // or are covered by other tags.
  // This ensures the `TagName` type remains valid.
  // These should be reviewed and properly defined or merged.
  DefensiveBuff: { name: "DefensiveBuff", description: "Generic defensive buff.", category: TagCategory.STATUS_BUFF, color: "lightblue", rarity: 1, powerLevel: 0, effectType: "trigger", unlockLevel: 1 },
  OffensiveBuff: { name: "OffensiveBuff", description: "Generic offensive buff.", category: TagCategory.STATUS_BUFF, color: "lightcoral", rarity: 1, powerLevel: 0, effectType: "trigger", unlockLevel: 1 },
  Utility: { name: "Utility", description: "Provides a utility effect.", category: TagCategory.SPELL_PROPERTY, color: "lightyellow", rarity: 1, powerLevel: 0, effectType: "active", unlockLevel: 1 },
  Movement: { name: "Movement", description: "Affects movement.", category: TagCategory.STATUS_BUFF, color: "lightgreen", rarity: 1, powerLevel: 0, effectType: "active", unlockLevel: 1 },
  Debuff: { name: "Debuff", description: "Applies a generic debuff.", category: TagCategory.STATUS_DEBUFF, color: "grey", rarity: 1, powerLevel: 0, effectType: "trigger", unlockLevel: 1 },
  Control: { name: "Control", description: "Provides a control effect.", category: TagCategory.CROWD_CONTROL, color: "purple", rarity: 1, powerLevel: 0, effectType: "trigger", unlockLevel: 1 },
  Summoning: { name: "Summoning", description: "Summons a creature or object.", category: TagCategory.ENVIRONMENTAL, color: "darkgrey", rarity: 1, powerLevel: 0, effectType: "active", unlockLevel: 1 },
  Transformation: { name: "Transformation", description: "Transforms the caster or target.", category: TagCategory.SPECIAL_MECHANIC, color: "brown", rarity: 1, powerLevel: 0, effectType: "active", unlockLevel: 1 },
  MetaMagic: { name: "MetaMagic", description: "Alters how spells function.", category: TagCategory.META_MECHANIC, color: "gold", rarity: 1, powerLevel: 0, effectType: "modifier", unlockLevel: 1 },
  LootChest: { name: "LootChest", description: "Indicates a loot chest item.", category: TagCategory.META_MECHANIC, color: "saddlebrown", rarity: 0, powerLevel: 0, effectType: "passive", unlockLevel: 0 },
  // Elements as Tags (already defined above, e.g. Fire, Ice)
  // Ensure all TagName values from types.ts are represented if they are distinct categories
  // For example, if 'ElementName' includes items not in 'Damage Types'
  PhysicalNeutral: { name: "PhysicalNeutral", description: "Neutral physical interaction.", category: TagCategory.DAMAGE_TYPE, color: "grey", rarity: 0, powerLevel: 0, effectType: "passive", unlockLevel: 0},
  PoisonSource: { name: "PoisonSource", description: "Source of poison.", category: TagCategory.DAMAGE_TYPE, color: "green", rarity: 0, powerLevel: 0, effectType: "passive", unlockLevel: 0},
  HealingSource: { name: "HealingSource", description: "Source of healing.", category: TagCategory.SPELL_PROPERTY, color: "lightgreen", rarity: 0, powerLevel: 0, effectType: "passive", unlockLevel: 0},

  // Rarity & Power category tags from src/types.ts
  Common: { name: 'Common', description: 'Basic effect, easily obtainable.', category: TagCategory.RARITY, color: 'grey', rarity: 1, powerLevel: 1, unlockLevel: 1, effectType: 'modifier' },
  Uncommon: { name: 'Uncommon', description: 'Slightly better than common.', category: TagCategory.RARITY, color: 'green', rarity: 2, powerLevel: 2, unlockLevel: 2, effectType: 'modifier' },
  Rare: { name: 'Rare', description: 'Uncommon effect with enhanced properties.', category: TagCategory.RARITY, color: 'blue', rarity: 4, powerLevel: 4, unlockLevel: 5, effectType: 'modifier' },
  Epic: { name: 'Epic', description: 'Powerful effect with unique mechanics.', category: TagCategory.RARITY, color: 'purple', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'modifier' },
  Legendary: { name: 'Legendary', description: 'Extremely rare and powerful effect.', category: TagCategory.RARITY, color: 'orange', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'modifier' },
  Mythic: { name: 'Mythic', description: 'Nearly impossible to obtain, game-changing power.', category: TagCategory.RARITY, color: 'red', rarity: 10, powerLevel: 10, unlockLevel: 20, effectType: 'modifier' },
  Divine: { name: 'Divine', description: 'Power of the gods.', category: TagCategory.RARITY, color: 'gold', rarity: 12, powerLevel: 12, unlockLevel: 25, effectType: 'modifier' },
  Forbidden: { name: 'Forbidden', description: 'Dangerous and forbidden magic.', category: TagCategory.RARITY, color: 'black', rarity: 9, powerLevel: 9, unlockLevel: 18, effectType: 'modifier' },
  Ancient: { name: 'Ancient', description: 'Magic from a bygone era.', category: TagCategory.RARITY, color: 'brown', rarity: 7, powerLevel: 7, unlockLevel: 14, effectType: 'modifier' },
  Primordial: { name: 'Primordial', description: 'Raw, untamed magical energy.', category: TagCategory.RARITY, color: 'darkgreen', rarity: 11, powerLevel: 11, unlockLevel: 22, effectType: 'modifier' },
  Cosmic: { name: 'Cosmic', description: 'Power drawn from the cosmos itself.', category: TagCategory.RARITY, color: 'darkblue', rarity: 13, powerLevel: 13, unlockLevel: 30, effectType: 'modifier' },
  
  // Additional tags for biomes and enemies
  Wise: { name: 'Wise', description: 'Possesses ancient knowledge and wisdom.', category: TagCategory.SPECIAL_MECHANIC, color: 'lightblue', rarity: 4, powerLevel: 4, unlockLevel: 8, effectType: 'passive' },
  Nature_Master: { name: 'Nature_Master', description: 'Master of natural forces and elements.', category: TagCategory.SPECIAL_MECHANIC, color: 'forestgreen', rarity: 6, powerLevel: 6, unlockLevel: 12, effectType: 'passive' },
  Web: { name: 'Web', description: 'Creates or uses web-like structures.', category: TagCategory.CROWD_CONTROL, color: 'darkgrey', rarity: 3, powerLevel: 4, unlockLevel: 5, effectType: 'active' },
  Crystal: { name: 'Crystal', description: 'Related to crystalline structures and energy.', category: TagCategory.DAMAGE_TYPE, color: 'lightcyan', rarity: 4, powerLevel: 5, unlockLevel: 7, effectType: 'modifier' },
  Incorporeal: { name: 'Incorporeal', description: 'Exists partially outside physical realm.', category: TagCategory.DEFENSIVE, color: 'lightgrey', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'passive' },
  Construct: { name: 'Construct', description: 'Artificial being or magical creation.', category: TagCategory.SPECIAL_MECHANIC, color: 'bronze', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'passive' },
  Massive: { name: 'Massive', description: 'Enormous size with corresponding power.', category: TagCategory.DAMAGE_MODIFIER, color: 'darkred', rarity: 5, powerLevel: 7, unlockLevel: 10, effectType: 'modifier' },
  Elemental: { name: 'Elemental', description: 'Pure elemental being or energy.', category: TagCategory.SPECIAL_MECHANIC, color: 'rainbow', rarity: 5, powerLevel: 6, unlockLevel: 9, effectType: 'passive' },
  Shapeshifting: { name: 'Shapeshifting', description: 'Can change form and appearance.', category: TagCategory.SPECIAL_MECHANIC, color: 'purple', rarity: 6, powerLevel: 6, unlockLevel: 11, effectType: 'active' },
  Dragon: { name: 'Dragon', description: 'Draconic heritage with immense power.', category: TagCategory.SPECIAL_MECHANIC, color: 'gold', rarity: 8, powerLevel: 9, unlockLevel: 15, effectType: 'passive' },
  Fire_Master: { name: 'Fire_Master', description: 'Master of fire and flame.', category: TagCategory.SPECIAL_MECHANIC, color: 'red', rarity: 6, powerLevel: 7, unlockLevel: 12, effectType: 'passive' },
  Undead: { name: 'Undead', description: 'Reanimated or never-living creature.', category: TagCategory.SPECIAL_MECHANIC, color: 'darkgrey', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'passive' },
  Shambling: { name: 'Shambling', description: 'Slow but relentless movement.', category: TagCategory.STATUS_DEBUFF, color: 'brown', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'passive' },
  Witch: { name: 'Witch', description: 'Practitioner of dark or nature magic.', category: TagCategory.SPECIAL_MECHANIC, color: 'darkpurple', rarity: 5, powerLevel: 6, unlockLevel: 9, effectType: 'passive' },
  Potion: { name: 'Potion', description: 'Related to alchemical brews and effects.', category: TagCategory.RESOURCE, color: 'green', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'active' },
  Ghost: { name: 'Ghost', description: 'Spectral being from beyond death.', category: TagCategory.SPECIAL_MECHANIC, color: 'lightgrey', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'passive' },
  Hunting: { name: 'Hunting', description: 'Predatory behavior and tracking.', category: TagCategory.SPECIAL_MECHANIC, color: 'darkgreen', rarity: 3, powerLevel: 4, unlockLevel: 5, effectType: 'passive' },
  Pack: { name: 'Pack', description: 'Fights better when with allies.', category: TagCategory.SPECIAL_MECHANIC, color: 'brown', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'conditional' },
  Amplification: { name: 'Amplification', description: 'Enhances and amplifies other effects.', category: TagCategory.DAMAGE_MODIFIER, color: 'yellow', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'modifier' },
};
