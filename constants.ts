import { Player, Spell, SpellIconName, StatusEffectName, ResourceType, ConsumableEffectType, EquipmentSlot, Ability, DetailedEquipmentSlot, SpellComponent, TagName } from './types';
import { ALL_GAME_SPELL_COMPONENTS } from './src/research-content'; 

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const INITIAL_PLAYER_NAME = "Hero"; 
export const INITIAL_PLAYER_GOLD = 50; 
export const INITIAL_PLAYER_ESSENCE = 10; 
export const INITIAL_PLAYER_LOCATION = "loc_001"; // Starting location ID

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

// Comprehensive Tag System
export interface TagDefinition {
  name: string;
  description: string;
  category: 'damage' | 'targeting' | 'properties' | 'modifiers' | 'support' | 'control' | 'buffs' | 'debuffs' | 'dot' | 'vampiric' | 'defensive' | 'resource' | 'scaling' | 'timing' | 'environmental' | 'special' | 'meta' | 'rarity';
  color: string;
  rarity: number; // 0-10, affects how often AI includes this tag
  powerLevel: number; // 1-10, affects mana cost scaling
  conflictsWith?: TagName[];
  synergizesWith?: TagName[];
  unlockLevel?: number;
  effectType: 'passive' | 'active' | 'trigger' | 'modifier' | 'conditional';
}

export const TAG_DEFINITIONS: Record<TagName, TagDefinition> = {
  // Damage Types
  'Fire': { name: 'Fire', description: 'Deals fire damage, may cause burning. Strong vs Ice, weak vs Water.', category: 'damage', color: 'text-red-400', rarity: 1, powerLevel: 3, synergizesWith: ['Explosive', 'Burning', 'Lightning'], conflictsWith: ['Ice', 'Freezing'], unlockLevel: 1, effectType: 'modifier' },
  'Ice': { name: 'Ice', description: 'Deals cold damage, may slow or freeze targets.', category: 'damage', color: 'text-blue-400', rarity: 1, powerLevel: 3, synergizesWith: ['Slow', 'Freezing', 'Shattering'], conflictsWith: ['Fire', 'Burning'], unlockLevel: 1, effectType: 'modifier' },
  'Lightning': { name: 'Lightning', description: 'Fast electric damage that may chain between targets.', category: 'damage', color: 'text-yellow-400', rarity: 2, powerLevel: 4, synergizesWith: ['Chain', 'Stunning', 'Shocking'], unlockLevel: 3, effectType: 'modifier' },
  'Physical': { name: 'Physical', description: 'Raw physical force damage.', category: 'damage', color: 'text-gray-400', rarity: 1, powerLevel: 2, synergizesWith: ['Brutal', 'Cleave', 'Piercing'], unlockLevel: 1, effectType: 'modifier' },
  'Arcane': { name: 'Arcane', description: 'Pure magical energy, ignores most resistances.', category: 'damage', color: 'text-purple-400', rarity: 3, powerLevel: 5, synergizesWith: ['Penetrating', 'Mana_Burn'], unlockLevel: 5, effectType: 'modifier' },
  'Nature': { name: 'Nature', description: 'Life force damage that may regenerate the caster.', category: 'damage', color: 'text-green-400', rarity: 2, powerLevel: 3, synergizesWith: ['Regeneration', 'Healing', 'Poison'], unlockLevel: 2, effectType: 'modifier' },
  'Dark': { name: 'Dark', description: 'Shadow damage that may drain life or cause fear.', category: 'damage', color: 'text-gray-800', rarity: 3, powerLevel: 4, synergizesWith: ['Fear', 'Lifesteal', 'Curse'], conflictsWith: ['Light'], unlockLevel: 4, effectType: 'modifier' },
  'Light': { name: 'Light', description: 'Holy damage effective against undead and dark creatures.', category: 'damage', color: 'text-yellow-200', rarity: 3, powerLevel: 4, synergizesWith: ['Healing', 'Purify', 'Blessing'], conflictsWith: ['Dark'], unlockLevel: 4, effectType: 'modifier' },
  'Poison': { name: 'Poison', description: 'Toxic damage that spreads and weakens targets over time.', category: 'damage', color: 'text-green-500', rarity: 2, powerLevel: 3, synergizesWith: ['Corroding', 'Weakness', 'Spreading'], unlockLevel: 2, effectType: 'modifier' },
  'Psychic': { name: 'Psychic', description: 'Mental damage that bypasses armor and may cause confusion.', category: 'damage', color: 'text-pink-400', rarity: 4, powerLevel: 5, synergizesWith: ['Confusion', 'Charm', 'Mind_Control'], unlockLevel: 6, effectType: 'modifier' },

  // Targeting & Range
  'SelfTarget': { name: 'Self Target', description: 'Spell affects only the caster.', category: 'targeting', color: 'text-green-400', rarity: 1, powerLevel: 1, conflictsWith: ['MultiTarget', 'AreaOfEffect'], unlockLevel: 1, effectType: 'modifier' },
  'SingleTarget': { name: 'Single Target', description: 'Affects one target with full potency.', category: 'targeting', color: 'text-blue-400', rarity: 1, powerLevel: 2, conflictsWith: ['MultiTarget', 'AreaOfEffect'], unlockLevel: 1, effectType: 'modifier' },
  'MultiTarget': { name: 'Multi Target', description: 'Affects multiple targets with reduced potency per target.', category: 'targeting', color: 'text-orange-400', rarity: 3, powerLevel: 4, conflictsWith: ['SelfTarget', 'SingleTarget'], unlockLevel: 3, effectType: 'modifier' },
  'AreaOfEffect': { name: 'Area of Effect', description: 'Affects all targets in an area.', category: 'targeting', color: 'text-red-400', rarity: 3, powerLevel: 5, synergizesWith: ['Explosive'], unlockLevel: 4, effectType: 'modifier' },
  'GlobalTarget': { name: 'Global Target', description: 'Affects all enemies regardless of range.', category: 'targeting', color: 'text-purple-600', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'modifier' },
  'RandomTarget': { name: 'Random Target', description: 'Targets enemies randomly, may hit multiple times.', category: 'targeting', color: 'text-yellow-300', rarity: 4, powerLevel: 3, unlockLevel: 5, effectType: 'modifier' },

  // Range Types
  'Melee': { name: 'Melee', description: 'Close combat range, higher damage but requires proximity.', category: 'targeting', color: 'text-red-300', rarity: 1, powerLevel: 3, conflictsWith: ['Ranged'], synergizesWith: ['Physical', 'Brutal'], unlockLevel: 1, effectType: 'modifier' },
  'Ranged': { name: 'Ranged', description: 'Long distance attacks, safer but may have damage falloff.', category: 'targeting', color: 'text-blue-300', rarity: 1, powerLevel: 2, conflictsWith: ['Melee'], synergizesWith: ['Projectile'], unlockLevel: 1, effectType: 'modifier' },
  'Touch': { name: 'Touch', description: 'Requires physical contact, extremely potent effects.', category: 'targeting', color: 'text-pink-300', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'modifier' },
  'Projectile': { name: 'Projectile', description: 'Travels through air, may hit multiple targets in line.', category: 'targeting', color: 'text-cyan-400', rarity: 2, powerLevel: 3, synergizesWith: ['Piercing', 'Chain'], unlockLevel: 2, effectType: 'modifier' },
  'Beam': { name: 'Beam', description: 'Continuous energy beam that pierces through enemies.', category: 'targeting', color: 'text-yellow-500', rarity: 4, powerLevel: 5, synergizesWith: ['Piercing', 'Lightning'], unlockLevel: 6, effectType: 'modifier' },
  'Cone': { name: 'Cone', description: 'Spreads out in a cone shape from the caster.', category: 'targeting', color: 'text-orange-300', rarity: 3, powerLevel: 4, synergizesWith: ['AreaOfEffect'], unlockLevel: 4, effectType: 'modifier' },
  'Line': { name: 'Line', description: 'Affects all targets in a straight line.', category: 'targeting', color: 'text-gray-300', rarity: 3, powerLevel: 4, synergizesWith: ['Piercing'], unlockLevel: 3, effectType: 'modifier' },
  'Circle': { name: 'Circle', description: 'Affects all targets within a circular area.', category: 'targeting', color: 'text-indigo-300', rarity: 3, powerLevel: 4, synergizesWith: ['AreaOfEffect'], unlockLevel: 4, effectType: 'modifier' },

  // Spell Properties
  'Instant': { name: 'Instant', description: 'Takes effect immediately upon casting.', category: 'properties', color: 'text-yellow-400', rarity: 1, powerLevel: 2, conflictsWith: ['Channeling', 'Ritual'], unlockLevel: 1, effectType: 'modifier' },
  'Channeling': { name: 'Channeling', description: 'Effect continues as long as concentration is maintained.', category: 'properties', color: 'text-purple-400', rarity: 3, powerLevel: 4, conflictsWith: ['Instant'], synergizesWith: ['Extended_Duration'], unlockLevel: 3, effectType: 'active' },
  'Ritual': { name: 'Ritual', description: 'Requires time to cast but has powerful effects.', category: 'properties', color: 'text-indigo-400', rarity: 5, powerLevel: 7, conflictsWith: ['Instant'], unlockLevel: 8, effectType: 'modifier' },
  'Persistent': { name: 'Persistent', description: 'Effect continues indefinitely until dispelled.', category: 'properties', color: 'text-cyan-600', rarity: 6, powerLevel: 6, synergizesWith: ['Extended_Duration'], unlockLevel: 10, effectType: 'passive' },
  'Toggle': { name: 'Toggle', description: 'Can be turned on and off at will.', category: 'properties', color: 'text-blue-500', rarity: 4, powerLevel: 3, unlockLevel: 5, effectType: 'active' },
  'Concentration': { name: 'Concentration', description: 'Requires focus; taking damage may break the effect.', category: 'properties', color: 'text-orange-500', rarity: 3, powerLevel: 5, synergizesWith: ['Channeling'], unlockLevel: 4, effectType: 'conditional' },

  // Damage Modifiers
  'Piercing': { name: 'Piercing', description: 'Ignores a portion of target armor/resistance.', category: 'modifiers', color: 'text-gray-500', rarity: 3, powerLevel: 4, synergizesWith: ['Projectile', 'Physical'], unlockLevel: 3, effectType: 'modifier' },
  'Armor_Ignoring': { name: 'Armor Ignoring', description: 'Completely bypasses all armor and resistances.', category: 'modifiers', color: 'text-red-600', rarity: 7, powerLevel: 8, unlockLevel: 12, effectType: 'modifier' },
  'True_Damage': { name: 'True Damage', description: 'Cannot be reduced by any means.', category: 'modifiers', color: 'text-white', rarity: 9, powerLevel: 9, unlockLevel: 18, effectType: 'modifier' },
  'Percentage_Damage': { name: 'Percentage Damage', description: 'Deals damage based on target\'s maximum health.', category: 'modifiers', color: 'text-red-500', rarity: 6, powerLevel: 7, unlockLevel: 10, effectType: 'modifier' },
  'Explosive': { name: 'Explosive', description: 'Deals area damage around the primary target.', category: 'modifiers', color: 'text-orange-600', rarity: 4, powerLevel: 5, synergizesWith: ['Fire', 'AreaOfEffect'], unlockLevel: 5, effectType: 'trigger' },
  'Cleave': { name: 'Cleave', description: 'Attack hits multiple enemies in front of the attacker.', category: 'modifiers', color: 'text-red-300', rarity: 3, powerLevel: 4, synergizesWith: ['Physical', 'Melee'], unlockLevel: 3, effectType: 'modifier' },
  'Critical': { name: 'Critical', description: 'Higher chance to deal critical damage.', category: 'modifiers', color: 'text-yellow-600', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Brutal': { name: 'Brutal', description: 'Ignores critical damage reduction and deals extra damage.', category: 'modifiers', color: 'text-red-700', rarity: 5, powerLevel: 6, synergizesWith: ['Critical', 'Physical'], unlockLevel: 7, effectType: 'modifier' },
  'Overwhelming': { name: 'Overwhelming', description: 'Cannot be blocked, parried, or dodged.', category: 'modifiers', color: 'text-purple-700', rarity: 6, powerLevel: 6, unlockLevel: 9, effectType: 'modifier' },
  'Penetrating': { name: 'Penetrating', description: 'Passes through magical shields and barriers.', category: 'modifiers', color: 'text-cyan-500', rarity: 5, powerLevel: 5, synergizesWith: ['Arcane'], unlockLevel: 7, effectType: 'modifier' },
  'Shattering': { name: 'Shattering', description: 'Destroys armor and shields on critical hits.', category: 'modifiers', color: 'text-blue-600', rarity: 5, powerLevel: 6, synergizesWith: ['Ice', 'Critical'], unlockLevel: 8, effectType: 'trigger' },
  'Devastating': { name: 'Devastating', description: 'Deals massive damage but requires setup.', category: 'modifiers', color: 'text-black', rarity: 8, powerLevel: 9, unlockLevel: 15, effectType: 'conditional' },

  // Healing & Support
  'Healing': { name: 'Healing', description: 'Restores health to target.', category: 'support', color: 'text-green-300', rarity: 1, powerLevel: 2, synergizesWith: ['Light', 'Nature'], unlockLevel: 1, effectType: 'active' },
  'Regeneration': { name: 'Regeneration', description: 'Gradually restores health over time.', category: 'support', color: 'text-green-400', rarity: 2, powerLevel: 3, synergizesWith: ['Healing', 'Extended_Duration'], unlockLevel: 2, effectType: 'passive' },
  'Restoration': { name: 'Restoration', description: 'Removes debuffs and restores to full health.', category: 'support', color: 'text-cyan-300', rarity: 5, powerLevel: 6, synergizesWith: ['Cleanse'], unlockLevel: 8, effectType: 'active' },
  'Revival': { name: 'Revival', description: 'Can resurrect fallen allies.', category: 'support', color: 'text-yellow-300', rarity: 9, powerLevel: 10, unlockLevel: 20, effectType: 'active' },
  'Shield': { name: 'Shield', description: 'Creates a barrier that absorbs incoming damage.', category: 'support', color: 'text-blue-500', rarity: 2, powerLevel: 3, synergizesWith: ['Barrier'], unlockLevel: 2, effectType: 'active' },
  'Barrier': { name: 'Barrier', description: 'Advanced shield that can have special properties.', category: 'support', color: 'text-cyan-500', rarity: 4, powerLevel: 5, synergizesWith: ['Shield'], unlockLevel: 6, effectType: 'active' },
  'Absorption': { name: 'Absorption', description: 'Converts incoming damage into beneficial effects.', category: 'support', color: 'text-purple-500', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'passive' },
  'Cleanse': { name: 'Cleanse', description: 'Removes negative status effects.', category: 'support', color: 'text-white', rarity: 3, powerLevel: 3, synergizesWith: ['Light', 'Purify'], unlockLevel: 3, effectType: 'active' },
  'Purify': { name: 'Purify', description: 'Removes all debuffs and prevents new ones temporarily.', category: 'support', color: 'text-yellow-100', rarity: 5, powerLevel: 5, synergizesWith: ['Cleanse', 'Light'], unlockLevel: 7, effectType: 'active' },
  'Blessing': { name: 'Blessing', description: 'Provides long-term beneficial effects.', category: 'support', color: 'text-gold', rarity: 4, powerLevel: 4, synergizesWith: ['Light'], unlockLevel: 5, effectType: 'passive' },
  'Enhancement': { name: 'Enhancement', description: 'Improves target abilities and effectiveness.', category: 'support', color: 'text-emerald-400', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Empowerment': { name: 'Empowerment', description: 'Dramatically increases target power temporarily.', category: 'support', color: 'text-orange-400', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'active' },

  // Add more comprehensive definitions for all other tags...
  // (Continuing with the same pattern for all remaining tags)
  
  // Crowd Control
  'Stun': { name: 'Stun', description: 'Prevents target from taking any actions.', category: 'control', color: 'text-gray-400', rarity: 3, powerLevel: 5, unlockLevel: 3, effectType: 'active' },
  'Root': { name: 'Root', description: 'Prevents movement but allows other actions.', category: 'control', color: 'text-green-600', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  'Silence': { name: 'Silence', description: 'Prevents casting spells or using magical abilities.', category: 'control', color: 'text-blue-600', rarity: 3, powerLevel: 4, unlockLevel: 3, effectType: 'active' },
  'Disarm': { name: 'Disarm', description: 'Prevents weapon attacks and equipment use.', category: 'control', color: 'text-red-400', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'active' },
  'Blind': { name: 'Blind', description: 'Greatly reduces accuracy and perception.', category: 'control', color: 'text-gray-600', rarity: 3, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  'Charm': { name: 'Charm', description: 'Forces target to fight for the caster temporarily.', category: 'control', color: 'text-pink-500', rarity: 5, powerLevel: 6, synergizesWith: ['Psychic'], unlockLevel: 7, effectType: 'active' },
  'Fear': { name: 'Fear', description: 'Causes target to flee or cower in terror.', category: 'control', color: 'text-purple-800', rarity: 4, powerLevel: 4, synergizesWith: ['Dark'], unlockLevel: 5, effectType: 'active' },
  'Taunt': { name: 'Taunt', description: 'Forces enemies to attack the caster.', category: 'control', color: 'text-orange-500', rarity: 3, powerLevel: 3, unlockLevel: 4, effectType: 'active' },
  'Sleep': { name: 'Sleep', description: 'Target cannot act but takes increased damage when hit.', category: 'control', color: 'text-indigo-600', rarity: 4, powerLevel: 4, unlockLevel: 5, effectType: 'active' },
  'Slow': { name: 'Slow', description: 'Reduces movement and action speed.', category: 'control', color: 'text-blue-500', rarity: 2, powerLevel: 2, synergizesWith: ['Ice'], unlockLevel: 2, effectType: 'active' },

  // More categories would continue here...
  // For brevity, I'll define key tags from each category
  
  // Vampiric & Leeching (crucial for RPG/MOBA feel)
  'Lifesteal': { name: 'Lifesteal', description: 'Heals caster for percentage of damage dealt.', category: 'vampiric', color: 'text-red-500', rarity: 4, powerLevel: 5, synergizesWith: ['Dark', 'Vampiric'], unlockLevel: 6, effectType: 'passive' },
  'Vampiric': { name: 'Vampiric', description: 'Enhanced lifesteal with additional benefits.', category: 'vampiric', color: 'text-red-700', rarity: 6, powerLevel: 6, synergizesWith: ['Lifesteal', 'Soul_Drain'], unlockLevel: 9, effectType: 'passive' },
  'Mana_Burn': { name: 'Mana Burn', description: 'Destroys target mana and deals damage per mana destroyed.', category: 'vampiric', color: 'text-blue-700', rarity: 5, powerLevel: 5, synergizesWith: ['Arcane'], unlockLevel: 7, effectType: 'active' },

  // Scaling & Progression (key for combo system)
  'Scaling': { name: 'Scaling', description: 'Effect becomes stronger based on specific conditions.', category: 'scaling', color: 'text-green-500', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Stacking': { name: 'Stacking', description: 'Effect increases each time it\'s applied.', category: 'scaling', color: 'text-yellow-500', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  'Combo': { name: 'Combo', description: 'Stronger when used in sequence with other spells.', category: 'scaling', color: 'text-orange-500', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'conditional' },
  'Chain': { name: 'Chain', description: 'Effect jumps between multiple targets.', category: 'scaling', color: 'text-cyan-400', rarity: 4, powerLevel: 5, synergizesWith: ['Lightning'], unlockLevel: 6, effectType: 'modifier' },
  'Synergy': { name: 'Synergy', description: 'Enhanced effects when combined with specific other tags.', category: 'scaling', color: 'text-rainbow', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'conditional' },

  // Defensive Mechanics
  'Block': { name: 'Block', description: 'Chance to completely negate incoming attacks.', category: 'defensive', color: 'text-gray-500', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'passive' },
  'Counter': { name: 'Counter', description: 'Automatically retaliates when attacked.', category: 'defensive', color: 'text-red-400', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'trigger' },
  'Reflect': { name: 'Reflect', description: 'Returns damage back to the attacker.', category: 'defensive', color: 'text-silver', rarity: 5, powerLevel: 5, unlockLevel: 7, effectType: 'passive' },

  // Special Mechanics (advanced interactions)
  'Invisibility': { name: 'Invisibility', description: 'Cannot be targeted by most attacks.', category: 'special', color: 'text-transparent', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'active' },
  'Teleport': { name: 'Teleport', description: 'Instantly moves to target location.', category: 'special', color: 'text-purple-600', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'active' },
  'Time_Manipulation': { name: 'Time Manipulation', description: 'Affects the flow of time in combat.', category: 'special', color: 'text-blue-800', rarity: 9, powerLevel: 9, unlockLevel: 18, effectType: 'active' },

  // Rarity Tags
  'Common': { name: 'Common', description: 'Basic effect, easily obtainable.', category: 'rarity', color: 'text-gray-400', rarity: 1, powerLevel: 1, unlockLevel: 1, effectType: 'modifier' },
  'Rare': { name: 'Rare', description: 'Uncommon effect with enhanced properties.', category: 'rarity', color: 'text-blue-400', rarity: 4, powerLevel: 4, unlockLevel: 5, effectType: 'modifier' },
  'Epic': { name: 'Epic', description: 'Powerful effect with unique mechanics.', category: 'rarity', color: 'text-purple-400', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'modifier' },
  'Legendary': { name: 'Legendary', description: 'Extremely rare and powerful effect.', category: 'rarity', color: 'text-orange-400', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'modifier' },
  'Mythic': { name: 'Mythic', description: 'Nearly impossible to obtain, game-changing power.', category: 'rarity', color: 'text-red-400', rarity: 10, powerLevel: 10, unlockLevel: 20, effectType: 'modifier' },

  // Status Effects (Buffs) - Complete Category
  'Haste': { name: 'Haste', description: 'Increases action speed and reduces cooldowns.', category: 'buffs', color: 'text-yellow-300', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'active' },
  'Strength': { name: 'Strength', description: 'Increases physical damage and carrying capacity.', category: 'buffs', color: 'text-red-300', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  'Intelligence': { name: 'Intelligence', description: 'Increases magical damage and mana pool.', category: 'buffs', color: 'text-blue-300', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  'Agility': { name: 'Agility', description: 'Increases speed, dodge chance, and critical hits.', category: 'buffs', color: 'text-green-300', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  'Fortitude': { name: 'Fortitude', description: 'Increases health, defense, and status resistance.', category: 'buffs', color: 'text-gray-300', rarity: 3, powerLevel: 4, unlockLevel: 3, effectType: 'active' },
  'Resilience': { name: 'Resilience', description: 'Reduces incoming damage and effect durations.', category: 'buffs', color: 'text-cyan-300', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  'Accuracy': { name: 'Accuracy', description: 'Increases hit chance and critical strike chance.', category: 'buffs', color: 'text-yellow-400', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'passive' },
  'Evasion': { name: 'Evasion', description: 'Increases dodge chance and movement speed.', category: 'buffs', color: 'text-blue-300', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Stealth': { name: 'Stealth', description: 'Reduces detection chance, broken by attacking.', category: 'buffs', color: 'text-gray-500', rarity: 4, powerLevel: 4, synergizesWith: ['Invisibility'], unlockLevel: 6, effectType: 'active' },
  'Camouflage': { name: 'Camouflage', description: 'Blends with environment, hard to detect when still.', category: 'buffs', color: 'text-green-600', rarity: 3, powerLevel: 3, synergizesWith: ['Stealth'], unlockLevel: 5, effectType: 'conditional' },
  'Phase': { name: 'Phase', description: 'Partially exists in another dimension, reduces damage.', category: 'buffs', color: 'text-purple-300', rarity: 7, powerLevel: 7, unlockLevel: 12, effectType: 'active' },
  'Flying': { name: 'Flying', description: 'Moves through air, immune to ground effects.', category: 'buffs', color: 'text-sky-400', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'active' },
  'Floating': { name: 'Floating', description: 'Hovers above ground, immune to some attacks.', category: 'buffs', color: 'text-cyan-400', rarity: 3, powerLevel: 4, synergizesWith: ['Flying'], unlockLevel: 4, effectType: 'active' },
  'Blink': { name: 'Blink', description: 'Short-range teleportation ability.', category: 'buffs', color: 'text-purple-400', rarity: 4, powerLevel: 4, synergizesWith: ['Teleport'], unlockLevel: 6, effectType: 'active' },
  'Dash': { name: 'Dash', description: 'Rapid movement in target direction.', category: 'buffs', color: 'text-orange-300', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  'Charge': { name: 'Charge', description: 'Rushing attack that deals extra damage.', category: 'buffs', color: 'text-red-400', rarity: 3, powerLevel: 4, synergizesWith: ['Physical'], unlockLevel: 4, effectType: 'active' },

  // Status Effects (Debuffs) - Complete Category
  'Weakness': { name: 'Weakness', description: 'Reduces damage dealt and physical capabilities.', category: 'debuffs', color: 'text-red-600', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'active' },
  'Vulnerability': { name: 'Vulnerability', description: 'Increases damage taken from all sources.', category: 'debuffs', color: 'text-purple-600', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'active' },
  'Curse': { name: 'Curse', description: 'Long-lasting negative effect that\'s hard to remove.', category: 'debuffs', color: 'text-black', rarity: 5, powerLevel: 6, synergizesWith: ['Dark'], unlockLevel: 7, effectType: 'passive' },
  'Hex': { name: 'Hex', description: 'Magical curse that spreads to nearby enemies.', category: 'debuffs', color: 'text-purple-800', rarity: 6, powerLevel: 6, synergizesWith: ['Curse'], unlockLevel: 9, effectType: 'passive' },
  'Mark': { name: 'Mark', description: 'Target takes increased damage from marked source.', category: 'debuffs', color: 'text-red-500', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Exposed': { name: 'Exposed', description: 'Reduces all resistances and defenses.', category: 'debuffs', color: 'text-orange-600', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },
  'Fragile': { name: 'Fragile', description: 'Next attack deals critical damage.', category: 'debuffs', color: 'text-yellow-600', rarity: 3, powerLevel: 4, synergizesWith: ['Critical'], unlockLevel: 5, effectType: 'conditional' },
  'Confusion': { name: 'Confusion', description: 'May attack random targets including allies.', category: 'debuffs', color: 'text-pink-600', rarity: 4, powerLevel: 4, synergizesWith: ['Psychic'], unlockLevel: 6, effectType: 'active' },
  'Madness': { name: 'Madness', description: 'Severe confusion with unpredictable effects.', category: 'debuffs', color: 'text-red-800', rarity: 6, powerLevel: 6, synergizesWith: ['Confusion'], unlockLevel: 10, effectType: 'active' },
  'Fatigue': { name: 'Fatigue', description: 'Reduces action speed and increases ability costs.', category: 'debuffs', color: 'text-gray-600', rarity: 2, powerLevel: 3, unlockLevel: 3, effectType: 'active' },
  'Exhaustion': { name: 'Exhaustion', description: 'Severe fatigue that prevents some actions.', category: 'debuffs', color: 'text-gray-700', rarity: 4, powerLevel: 5, synergizesWith: ['Fatigue'], unlockLevel: 6, effectType: 'active' },
  'Drain': { name: 'Drain', description: 'Gradually reduces resources over time.', category: 'debuffs', color: 'text-blue-600', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'passive' },
  'Sap': { name: 'Sap', description: 'Reduces maximum resource pools temporarily.', category: 'debuffs', color: 'text-cyan-600', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },

  // Damage Over Time - Complete Category
  'Burning': { name: 'Burning', description: 'Fire damage over time, spreads to nearby enemies.', category: 'dot', color: 'text-red-500', rarity: 2, powerLevel: 3, synergizesWith: ['Fire'], unlockLevel: 2, effectType: 'passive' },
  'Bleeding': { name: 'Bleeding', description: 'Physical damage over time, worsens with movement.', category: 'dot', color: 'text-red-600', rarity: 2, powerLevel: 3, synergizesWith: ['Physical'], unlockLevel: 2, effectType: 'passive' },
  'Freezing': { name: 'Freezing', description: 'Cold damage over time, slows target.', category: 'dot', color: 'text-blue-600', rarity: 3, powerLevel: 4, synergizesWith: ['Ice', 'Slow'], unlockLevel: 3, effectType: 'passive' },
  'Shocking': { name: 'Shocking', description: 'Electric damage over time, may chain to others.', category: 'dot', color: 'text-yellow-600', rarity: 3, powerLevel: 4, synergizesWith: ['Lightning', 'Chain'], unlockLevel: 4, effectType: 'passive' },
  'Corroding': { name: 'Corroding', description: 'Acid damage that reduces armor over time.', category: 'dot', color: 'text-green-600', rarity: 4, powerLevel: 5, synergizesWith: ['Poison'], unlockLevel: 5, effectType: 'passive' },
  'Dissolving': { name: 'Dissolving', description: 'Breaks down target at molecular level.', category: 'dot', color: 'text-green-700', rarity: 6, powerLevel: 6, synergizesWith: ['Corroding'], unlockLevel: 9, effectType: 'passive' },
  'Withering': { name: 'Withering', description: 'Life force drain that reduces maximum health.', category: 'dot', color: 'text-gray-800', rarity: 5, powerLevel: 6, synergizesWith: ['Dark'], unlockLevel: 7, effectType: 'passive' },
  'Decaying': { name: 'Decaying', description: 'Spreads death and weakness to nearby enemies.', category: 'dot', color: 'text-brown-800', rarity: 6, powerLevel: 6, synergizesWith: ['Withering'], unlockLevel: 10, effectType: 'passive' },
  'Rotting': { name: 'Rotting', description: 'Causes target to deteriorate and become brittle.', category: 'dot', color: 'text-green-800', rarity: 5, powerLevel: 5, synergizesWith: ['Poison'], unlockLevel: 8, effectType: 'passive' },
  'Consuming': { name: 'Consuming', description: 'Devours target from within, growing stronger.', category: 'dot', color: 'text-purple-900', rarity: 7, powerLevel: 7, synergizesWith: ['Stacking'], unlockLevel: 12, effectType: 'passive' },
  'Draining': { name: 'Draining', description: 'Transfers life force from target to caster.', category: 'dot', color: 'text-red-700', rarity: 5, powerLevel: 6, synergizesWith: ['Lifesteal'], unlockLevel: 8, effectType: 'passive' },

  // More Vampiric & Leeching Effects
  'Soul_Drain': { name: 'Soul Drain', description: 'Permanently steals essence and experience.', category: 'vampiric', color: 'text-purple-700', rarity: 7, powerLevel: 7, synergizesWith: ['Vampiric'], unlockLevel: 12, effectType: 'active' },
  'Energy_Leech': { name: 'Energy Leech', description: 'Steals energy/stamina from target.', category: 'vampiric', color: 'text-yellow-700', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'active' },
  'Essence_Steal': { name: 'Essence Steal', description: 'Steals magical essence and mana.', category: 'vampiric', color: 'text-purple-600', rarity: 5, powerLevel: 5, synergizesWith: ['Mana_Burn'], unlockLevel: 7, effectType: 'active' },
  'Stat_Steal': { name: 'Stat Steal', description: 'Temporarily steals target\'s attributes.', category: 'vampiric', color: 'text-orange-700', rarity: 6, powerLevel: 6, unlockLevel: 10, effectType: 'active' },
  'Ability_Steal': { name: 'Ability Steal', description: 'Copies and uses target\'s abilities.', category: 'vampiric', color: 'text-cyan-700', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'active' },
  'Experience_Steal': { name: 'Experience Steal', description: 'Steals experience points from target.', category: 'vampiric', color: 'text-gold-700', rarity: 9, powerLevel: 8, unlockLevel: 18, effectType: 'active' },

  // More Defensive Mechanics
  'Parry': { name: 'Parry', description: 'Deflects attacks and creates counterattack opportunity.', category: 'defensive', color: 'text-blue-500', rarity: 3, powerLevel: 4, synergizesWith: ['Counter'], unlockLevel: 4, effectType: 'trigger' },
  'Dodge': { name: 'Dodge', description: 'Completely avoids attacks through agility.', category: 'defensive', color: 'text-green-500', rarity: 2, powerLevel: 3, synergizesWith: ['Evasion'], unlockLevel: 3, effectType: 'passive' },
  'Deflect': { name: 'Deflect', description: 'Redirects attacks to random targets.', category: 'defensive', color: 'text-yellow-500', rarity: 4, powerLevel: 4, unlockLevel: 5, effectType: 'trigger' },
  'Retaliate': { name: 'Retaliate', description: 'Automatically counterattacks when hit.', category: 'defensive', color: 'text-red-500', rarity: 4, powerLevel: 5, synergizesWith: ['Counter'], unlockLevel: 6, effectType: 'trigger' },
  'Immune': { name: 'Immune', description: 'Complete immunity to specific damage types.', category: 'defensive', color: 'text-white', rarity: 8, powerLevel: 8, unlockLevel: 15, effectType: 'passive' },
  'Resist': { name: 'Resist', description: 'Reduces damage from specific sources.', category: 'defensive', color: 'text-gray-400', rarity: 2, powerLevel: 3, unlockLevel: 2, effectType: 'passive' },
  'Absorb': { name: 'Absorb', description: 'Converts damage into beneficial effects.', category: 'defensive', color: 'text-cyan-400', rarity: 5, powerLevel: 5, synergizesWith: ['Absorption'], unlockLevel: 7, effectType: 'passive' },
  'Nullify': { name: 'Nullify', description: 'Completely negates magical effects.', category: 'defensive', color: 'text-indigo-400', rarity: 7, powerLevel: 7, unlockLevel: 12, effectType: 'trigger' },
  'Redirect': { name: 'Redirect', description: 'Forces attacks to hit different targets.', category: 'defensive', color: 'text-purple-400', rarity: 5, powerLevel: 5, unlockLevel: 8, effectType: 'trigger' },

  // Resource Mechanics
  'Free_Cast': { name: 'Free Cast', description: 'Ability doesn\'t consume resources when used.', category: 'resource', color: 'text-green-400', rarity: 5, powerLevel: 4, unlockLevel: 8, effectType: 'modifier' },
  'Reduced_Cost': { name: 'Reduced Cost', description: 'Decreases resource costs of abilities.', category: 'resource', color: 'text-blue-400', rarity: 3, powerLevel: 3, unlockLevel: 4, effectType: 'modifier' },
  'Cost_Refund': { name: 'Cost Refund', description: 'Returns resources when conditions are met.', category: 'resource', color: 'text-cyan-400', rarity: 4, powerLevel: 4, unlockLevel: 6, effectType: 'conditional' },
  'Resource_Generation': { name: 'Resource Generation', description: 'Generates additional resources over time.', category: 'resource', color: 'text-yellow-400', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'passive' },
  'Overcharge': { name: 'Overcharge', description: 'Spend extra resources for enhanced effects.', category: 'resource', color: 'text-orange-400', rarity: 5, powerLevel: 6, unlockLevel: 7, effectType: 'modifier' },
  'Sacrifice': { name: 'Sacrifice', description: 'Trade health or other resources for power.', category: 'resource', color: 'text-red-800', rarity: 6, powerLevel: 7, unlockLevel: 9, effectType: 'modifier' },
  'Channel_Health': { name: 'Channel Health', description: 'Use health instead of mana for abilities.', category: 'resource', color: 'text-red-600', rarity: 5, powerLevel: 6, synergizesWith: ['Sacrifice'], unlockLevel: 8, effectType: 'modifier' },
  'Blood_Magic': { name: 'Blood Magic', description: 'Enhanced power at the cost of life force.', category: 'resource', color: 'text-red-900', rarity: 7, powerLevel: 8, synergizesWith: ['Channel_Health'], unlockLevel: 12, effectType: 'modifier' },
  'Soul_Power': { name: 'Soul Power', description: 'Uses spiritual energy for devastating effects.', category: 'resource', color: 'text-purple-900', rarity: 8, powerLevel: 9, unlockLevel: 15, effectType: 'modifier' },

  // More Scaling & Progression
  'Ramping': { name: 'Ramping', description: 'Becomes stronger the longer combat continues.', category: 'scaling', color: 'text-red-500', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'passive' },
  'Escalating': { name: 'Escalating', description: 'Each use increases the power of the next.', category: 'scaling', color: 'text-orange-500', rarity: 5, powerLevel: 5, synergizesWith: ['Stacking'], unlockLevel: 7, effectType: 'passive' },
  'Crescendo': { name: 'Crescendo', description: 'Builds to a powerful climactic effect.', category: 'scaling', color: 'text-yellow-500', rarity: 6, powerLevel: 6, unlockLevel: 9, effectType: 'conditional' },
  'Momentum': { name: 'Momentum', description: 'Gains power from consecutive actions.', category: 'scaling', color: 'text-blue-500', rarity: 4, powerLevel: 5, unlockLevel: 6, effectType: 'passive' },
  'Sequence': { name: 'Sequence', description: 'Must be used in specific order for full effect.', category: 'scaling', color: 'text-purple-500', rarity: 5, powerLevel: 6, synergizesWith: ['Combo'], unlockLevel: 8, effectType: 'conditional' },
  'Resonance': { name: 'Resonance', description: 'Amplifies effects of similar spells nearby.', category: 'scaling', color: 'text-cyan-500', rarity: 6, powerLevel: 6, synergizesWith: ['Synergy'], unlockLevel: 10, effectType: 'passive' },

  // Timing & Duration
  'Extended_Duration': { name: 'Extended Duration', description: 'Effects last significantly longer.', category: 'timing', color: 'text-green-400', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'modifier' },
  'Shortened_Duration': { name: 'Shortened Duration', description: 'Brief but intense effects.', category: 'timing', color: 'text-red-400', rarity: 2, powerLevel: 5, conflictsWith: ['Extended_Duration'], unlockLevel: 3, effectType: 'modifier' },
  'Delayed': { name: 'Delayed', description: 'Effect triggers after a time delay.', category: 'timing', color: 'text-orange-400', rarity: 4, powerLevel: 5, unlockLevel: 5, effectType: 'conditional' },
  'Triggered': { name: 'Triggered', description: 'Activates when specific conditions are met.', category: 'timing', color: 'text-purple-400', rarity: 5, powerLevel: 5, unlockLevel: 7, effectType: 'conditional' },
  'Conditional': { name: 'Conditional', description: 'Enhanced effects under specific circumstances.', category: 'timing', color: 'text-blue-400', rarity: 3, powerLevel: 4, unlockLevel: 4, effectType: 'conditional' },
  'Repeating': { name: 'Repeating', description: 'Effect triggers multiple times automatically.', category: 'timing', color: 'text-yellow-400', rarity: 5, powerLevel: 6, unlockLevel: 8, effectType: 'passive' },
  'Echoing': { name: 'Echoing', description: 'Creates delayed copies of the original effect.', category: 'timing', color: 'text-cyan-400', rarity: 6, powerLevel: 6, synergizesWith: ['Delayed'], unlockLevel: 9, effectType: 'trigger' },
  'Lingering': { name: 'Lingering', description: 'Leaves behind persistent aftereffects.', category: 'timing', color: 'text-green-500', rarity: 4, powerLevel: 4, synergizesWith: ['Persistent'], unlockLevel: 6, effectType: 'passive' },
  'Fading': { name: 'Fading', description: 'Effect gradually decreases in strength.', category: 'timing', color: 'text-gray-500', rarity: 3, powerLevel: 3, conflictsWith: ['Persistent'], unlockLevel: 4, effectType: 'modifier' },
  'Burst': { name: 'Burst', description: 'Intense effect that ends quickly.', category: 'timing', color: 'text-orange-600', rarity: 3, powerLevel: 6, synergizesWith: ['Shortened_Duration'], unlockLevel: 5, effectType: 'modifier' },
};
