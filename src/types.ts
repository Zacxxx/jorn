// Foundational String Literal Types & Unions
export enum TagCategory {
  DAMAGE_TYPE = "Damage Type",
  TARGETING = "Targeting & Range",
  SPELL_PROPERTY = "Spell Property",
  DAMAGE_MODIFIER = "Damage Modifier",
  CROWD_CONTROL = "Crowd Control",
  STATUS_BUFF = "Status Effects - Buffs",
  STATUS_DEBUFF = "Status Effects - Debuffs",
  DAMAGE_OVER_TIME = "Damage Over Time",
  VAMPIRIC = "Vampiric & Leeching",
  DEFENSIVE = "Defensive Mechanics",
  RESOURCE = "Resource Mechanics",
  SCALING = "Scaling & Progression",
  TIMING = "Timing & Duration",
  RARITY = "Rarity & Power",
  ENVIRONMENTAL = "Environmental",
  SPECIAL_MECHANIC = "Special Mechanics",
  META_MECHANIC = "Meta Mechanics",
}

export interface TagDefinition {
  name: string; // Should match TagName
  description: string;
  category: TagCategory;
  color: string; // CSS color string (e.g., "red", "#FF0000")
  rarity: number; // 0-10, affects AI generation frequency
  powerLevel: number; // 1-10, affects mana cost scaling, etc.
  conflictsWith?: TagName[];
  synergizesWith?: TagName[];
  unlockLevel?: number;
  effectType: 'passive' | 'active' | 'trigger' | 'modifier' | 'conditional';
  // Future: Add specific effect parameters, e.g.
  // effectParameters?: { damageMultiplier?: number; durationChange?: number; etc. }
}

export type ElementName = 'Fire' | 'Ice' | 'Lightning' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Arcane' | 'Nature' | 'PhysicalNeutral' | 'PoisonSource' | 'HealingSource' | 'Physical' | 'Poison' | 'Psychic';
export type TagName =
  // Damage Types
  | 'Fire' | 'Ice' | 'Lightning' | 'Physical' | 'Arcane' | 'Nature' | 'Dark' | 'Light' | 'Poison' | 'Psychic'
  
  // Targeting & Range
  | 'SelfTarget' | 'SingleTarget' | 'MultiTarget' | 'AreaOfEffect' | 'GlobalTarget' | 'RandomTarget'
  | 'Melee' | 'Ranged' | 'Touch' | 'Projectile' | 'Beam' | 'Cone' | 'Line' | 'Circle'
  
  // Spell Properties
  | 'Instant' | 'Channeling' | 'Ritual' | 'Persistent' | 'Toggle' | 'Concentration'
  | 'Interruptible' | 'Uninterruptible' | 'Counterspell' | 'Dispellable' | 'Undispellable'
  
  // Damage Modifiers
  | 'Piercing' | 'Armor_Ignoring' | 'True_Damage' | 'Percentage_Damage' | 'Explosive' | 'Cleave'
  | 'Critical' | 'Brutal' | 'Overwhelming' | 'Penetrating' | 'Shattering' | 'Devastating'
  
  // Healing & Support
  | 'Healing' | 'Regeneration' | 'Restoration' | 'Revival' | 'Shield' | 'Barrier' | 'Absorption'
  | 'Cleanse' | 'Purify' | 'Blessing' | 'Enhancement' | 'Empowerment'
  
  // Crowd Control
  | 'Stun' | 'Root' | 'Silence' | 'Disarm' | 'Blind' | 'Charm' | 'Fear' | 'Taunt' | 'Sleep'
  | 'Slow' | 'Immobilize' | 'Banish' | 'Displacement' | 'Knockback' | 'Knockdown' | 'Grab'
  
  // Status Effects (Buffs)
  | 'Haste' | 'Strength' | 'Intelligence' | 'Agility' | 'Fortitude' | 'Resilience'
  | 'Accuracy' | 'Evasion' | 'Stealth' | 'Invisibility' | 'Camouflage' | 'Phase'
  | 'Flying' | 'Floating' | 'Blink' | 'Teleport' | 'Dash' | 'Charge'
  
  // Status Effects (Debuffs)
  | 'Weakness' | 'Vulnerability' | 'Curse' | 'Hex' | 'Mark' | 'Exposed' | 'Fragile'
  | 'Confusion' | 'Madness' | 'Fatigue' | 'Exhaustion' | 'Drain' | 'Sap'
  
  // Damage Over Time
  | 'Burning' | 'Bleeding' | 'Freezing' | 'Shocking' | 'Corroding' | 'Dissolving'
  | 'Withering' | 'Decaying' | 'Rotting' | 'Consuming' | 'Draining'
  
  // Vampiric & Leeching
  | 'Lifesteal' | 'Vampiric' | 'Soul_Drain' | 'Energy_Leech' | 'Mana_Burn' | 'Essence_Steal'
  | 'Stat_Steal' | 'Ability_Steal' | 'Experience_Steal'
  
  // Defensive Mechanics
  | 'Block' | 'Parry' | 'Dodge' | 'Deflect' | 'Counter' | 'Retaliate' | 'Reflect'
  | 'Immune' | 'Resist' | 'Absorb' | 'Nullify' | 'Redirect' | 'DamageReflection'
  
  // Resource Mechanics
  | 'Free_Cast' | 'Reduced_Cost' | 'Cost_Refund' | 'Resource_Generation' | 'Overcharge'
  | 'Sacrifice' | 'Channel_Health' | 'Blood_Magic' | 'Soul_Power'
  
  // Scaling & Progression
  | 'Scaling' | 'Stacking' | 'Ramping' | 'Escalating' | 'Crescendo' | 'Momentum'
  | 'Combo' | 'Chain' | 'Sequence' | 'Synergy' | 'Resonance'
  
  // Timing & Duration
  | 'Extended_Duration' | 'Shortened_Duration' | 'Delayed' | 'Triggered' | 'Conditional'
  | 'Repeating' | 'Echoing' | 'Lingering' | 'Fading' | 'Burst'
  
  // Environmental
  | 'Weather_Control' | 'Terrain_Altering' | 'Zone_Creation' | 'Field_Effect'
  | 'Summoning' | 'Conjuration' | 'Manifestation' | 'Portal'
  
  // Special Mechanics
  | 'Transformation' | 'Shapeshift' | 'Evolution' | 'Metamorphosis'
  | 'Time_Manipulation' | 'Space_Distortion' | 'Reality_Warp' | 'Quantum'
  | 'Dimensional' | 'Ethereal' | 'Spectral' | 'Astral'
  
  // Meta Mechanics
  | 'Anti_Magic' | 'Magic_Immunity' | 'Spell_Steal' | 'Copy' | 'Mimic' | 'Learn'
  | 'Adapt' | 'Evolve' | 'Mutate' | 'Transcend'
  
  // Rarity & Power
  | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Divine'
  | 'Forbidden' | 'Ancient' | 'Primordial' | 'Cosmic'
  | 'Utility' | 'LootChest'
  
  // Additional tags for biomes and enemies
  | 'Wise' | 'Nature_Master' | 'Web' | 'Crystal' | 'Incorporeal' | 'Construct' | 'Massive'
  | 'Elemental' | 'Shapeshifting' | 'Dragon' | 'Fire_Master' | 'Undead' | 'Shambling'
  | 'Witch' | 'Potion' | 'Ghost' | 'Hunting' | 'Pack' | 'Amplification'
  
  // Elements as Tags
  | ElementName;

export type SpellIconName =
  | 'Fireball' | 'IceShard' | 'LightningBolt' | 'Heal' | 'Shield' | 'SwordSlash' | 'PoisonCloud' | 'ArcaneBlast'
  | 'ShadowBolt' | 'HolyLight' | 'Book' | 'Scroll' | 'Star' | 'StatusPoison' | 'StatusStun'
  | 'StatusSilence' | 'StatusRoot' | 'Gem' | 'Plant' | 'Dust' | 'Thread' | 'PotionHP' | 'PotionMP'
  | 'PotionGeneric' | 'SwordHilt' | 'Breastplate' | 'Amulet' | 'WandIcon' | 'UserIcon' | 'BagIcon'
  | 'GearIcon' | 'MindIcon' | 'CheckmarkCircleIcon' | 'FilterListIcon' | 'SortAlphaIcon' | 'SkullIcon'
  | 'HeroBackIcon' | 'BodyIcon' | 'ReflexIcon' | 'SpeedIcon' | 'HelmetIcon' | 'NecklaceIcon' | 'RingIcon'
  | 'BeltIcon' | 'BootsIcon' | 'GlovesIcon' | 'ShoulderArmorIcon' | 'CloakIcon' | 'BackpackIcon'
  | 'Bars3Icon' | 'SearchIcon' | 'CollectionIcon' | 'FleeIcon' | 'AtomIcon' | 'FlaskIcon'
  | 'GoldCoinIcon' | 'EssenceIcon' | 'MapIcon' | 'TentIcon' | 'UploadIcon' | 'DownloadIcon' | 'ChestIcon' | 'HomeIcon'
  | 'ElementFire' | 'ElementIce' | 'ElementLightning' | 'ElementEarth' | 'ElementAir' | 'ElementLight' | 'ElementDark' | 'ElementArcane' | 'ElementNature' | 'ElementPoison' | 'ElementHealing'
  | 'TagGeneric' | 'Default';

export type StatusEffectName =
  | 'Poison' | 'Stun' | 'Burn' | 'Freeze'
  | 'WeakenBody' | 'WeakenMind' | 'WeakenReflex'
  | 'StrengthenBody' | 'StrengthenMind' | 'StrengthenReflex'
  | 'Regeneration'
  | 'TEMP_BODY_UP' | 'TEMP_MIND_UP' | 'TEMP_REFLEX_UP' | 'TEMP_SPEED_UP'
  | 'TEMP_MAX_HP_UP' | 'TEMP_MAX_MP_UP' | 'TEMP_HP_REGEN'
  | 'Defending' | 'DamageReflection'
  | 'BurningDoTActive' | 'BleedingDoTActive' | 'CorruptedDoTActive' | 'FrostbittenDoTActive' | 'RottingDoTActive' | 'ShockedDoTActive' | 'PoisonDoTActive'
  | 'Silenced' | 'Rooted' | 'Shield'
  // Additional status effects used in tag system
  | 'Burning' | 'Bleeding' | 'Freezing' | 'Shocking' | 'Slow' | 'Haste' | 'Invisibility' | 'Strength' | 'Intelligence';

export type ResourceType = 'Arcane Dust' | 'Emberbloom Petal' | 'Shadowsilk Thread' | 'Crystal Shard' | 'Verdant Leaf' | 'Mystic Orb' | 'Iron Ore' | 'Ancient Bone';
export type ItemType = 'Consumable' | 'Equipment' | 'Resource' | 'QuestItem' | 'LootChest';
export type ConsumableEffectType = 'HP_RESTORE' | 'MP_RESTORE' | 'EP_RESTORE' | 'CURE_STATUS' | 'APPLY_BUFF';
export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory';
export type DetailedEquipmentSlot =
  | 'Head' | 'Neck' | 'Jewels'
  | 'Chest' | 'Belt' | 'Legs' | 'Feet'
  | 'WeaponLeft' | 'WeaponRight'
  | 'Hands' | 'Shoulder' | 'Back'
  | 'Accessory1' | 'Accessory2'
  | 'Followers' | 'MetaItems';
export type AbilityEffectType = | 'MP_RESTORE' | 'SELF_HEAL' | 'TEMP_STAT_BUFF' | 'ENEMY_DEBUFF';
export type SpellComponentCategory = 'DamageSource' | 'DeliveryMethod' | 'PrimaryEffect' | 'SecondaryModifier' | 'CostEfficiency' | 'VisualAspect' | 'EssenceInfusion' | 'ElementalCore' | 'Utility';
export type GameState =
  | 'HOME' | 'SPELL_CRAFTING' | 'SPELL_DESIGN_STUDIO' | 'RESEARCH_LAB' | 'GENERAL_RESEARCH' | 'RESEARCH_ARCHIVES'
  | 'THEORIZE_COMPONENT' | 'SPELL_EDITING' | 'TRAIT_CRAFTING' | 'ABILITY_CRAFTING' | 'MANAGE_SPELLS'
  | 'IN_COMBAT' | 'GAME_OVER_VICTORY' | 'GAME_OVER_DEFEAT' | 'SPELL_CRAFT_CONFIRMATION'
  | 'SPELL_EDIT_CONFIRMATION' | 'ITEM_CRAFTING' | 'ITEM_CRAFT_CONFIRMATION' | 'SELECTING_POTION'
  | 'CHARACTER_SHEET' | 'SELECTING_ABILITY' | 'CRAFTING_HUB' | 'EXPLORING_MAP' | 'CAMP'
  | 'SETTLEMENT_VIEW' | 'SHOP_VIEW' | 'TAVERN_VIEW' | 'NPC_DIALOGUE' | 'HOMESTEAD_VIEW'
  | 'RECIPE_DISCOVERY' | 'CRAFTING_WORKSHOP' | 'NPCS_VIEW' | 'QUEST_BOOK'
  // Added from root types.ts & ensuring MULTIPLAYER_VIEW is definitely part of the type
  | 'GAME_OVER_VICTORY'
  | 'GAME_OVER_DEFEAT'
  | 'PARAMETERS'
  | 'SPELL_DESIGN_STUDIO'
  | 'RESEARCH_LAB'
  | 'GENERAL_RESEARCH'
  | 'RESEARCH_ARCHIVES'
  | 'THEORIZE_COMPONENT'
  | 'SPELL_EDITING'
  | 'TRAIT_CRAFTING'
  | 'ABILITY_CRAFTING'
  | 'MANAGE_SPELLS'
  | 'SPELL_CRAFT_CONFIRMATION'
  | 'SPELL_EDIT_CONFIRMATION'
  | 'ITEM_CRAFTING'
  | 'ITEM_CRAFT_CONFIRMATION'
  | 'SELECTING_POTION'
  | 'MULTIPLAYER_VIEW'; // Ensured MULTIPLAYER_VIEW is here
export type CharacterSheetTab = 'Main' | 'Inventory' | 'Spells' | 'Abilities' | 'Traits' | 'Quests' | 'Encyclopedia' | 'Progress';
export type InventoryFilterType = 'All' | ItemType;
export type LootDropType = 'spell' | 'equipment' | 'consumable' | 'gold' | 'essence' | 'resource' | 'component';

// Forward declaration for Player for Equipment statsBoost (if Player type is complex and defined later)
interface PlayerStubForEquipment {
  body: number;
  mind: number;
  reflex: number;
  speed: number;
  maxHp: number;
  maxMp: number;
  maxEp: number;
}

// Core Data Structures
export interface ResourceCost {
  type: ResourceType;
  itemId: string;
  quantity: number;
}

export interface SpellStatusEffect {
  name: StatusEffectName;
  duration: number;
  magnitude?: number;
  chance: number;
  description?: string;
  tags?: TagName[];
}

export interface ActiveStatusEffect {
  id: string;
  name: StatusEffectName;
  duration: number;
  magnitude?: number;
  sourceSpellId: string;
  inflictedTurn: number;
  iconName: SpellIconName;
}

export interface SpellComponentEffect {
  type: 'SET_DAMAGE_TYPE' | 'ADD_BASE_DAMAGE' | 'APPLY_STATUS_EFFECT' | 'MODIFY_MANA_COST_FLAT' | 'MODIFY_MANA_COST_PERCENT' | 'SET_SCALING_STAT' | 'SUGGEST_ICON' | 'ADD_DESCRIPTION_FRAGMENT' | 'ADD_NAME_FRAGMENT' | 'ADD_TAG' | 'SET_ELEMENT';
  damageType?: ElementName;
  statusEffect?: Partial<SpellStatusEffect>;
  value?: number | string;
  scalesWith?: 'Body' | 'Mind';
  tagName?: TagName;
  elementName?: ElementName;
}

export interface SpellComponentParameterConfig {
  key: string;
  label: string;
  type: 'slider' | 'numberInput' | 'dropdown';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  defaultValue: number | string;
  costInfluenceFactor?: number;
}

export interface SpellComponent {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  category: SpellComponentCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  researchRequirements: {
    gold: number;
    essence?: number;
    items?: Partial<ResourceCost>[]; // Partial because type might be inferred if itemId maps to a resource
    time?: number;
    requiredLevel?: number;
  };
  baseEffects: SpellComponentEffect[];
  configurableParameters?: SpellComponentParameterConfig[];
  rarity: number;
  element?: ElementName;
  tags?: TagName[];
  manaCost?: number;
  energyCost?: number;
  baseResourceCost?: ResourceCost[];
  usageGoldCost?: number;
  usageEssenceCost?: number;
  exclusiveWith?: string[];
  synergiesWith?: string[];
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  damage: number;
  damageType: ElementName;
  scalesWith?: 'Body' | 'Mind';
  effect?: string;
  iconName: SpellIconName;
  statusEffectInflict?: SpellStatusEffect;
  resourceCost?: ResourceCost[];
  level: number;
  componentsUsed?: Array<{ componentId: string; configuration: Record<string, number | string> }>;
  tags?: TagName[];
  rarity: number;
  scalingFactor?: number;
  epCost?: number;
  duration?: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  epCost: number;
  effectType: AbilityEffectType;
  magnitude?: number;
  duration?: number;
  targetStatusEffect?: StatusEffectName;
  iconName: SpellIconName;
  isGenerallyPrepared?: boolean;
  tags?: TagName[];
  scalingFactor?: number;
  scalesWith?: 'Body' | 'Mind';
  level?: number;
  rarity?: number;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  tags?: TagName[];
  scalingFactor?: number;
  level?: number;
  rarity: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  status: 'active' | 'completed' | 'failed' | 'available' | 'locked';
  isMainQuest: boolean;
  iconName: SpellIconName;
  
  // Enhanced quest properties
  category: 'main' | 'side' | 'daily' | 'guild' | 'exploration' | 'crafting' | 'combat' | 'social';
  difficulty: 'trivial' | 'easy' | 'normal' | 'hard' | 'epic' | 'legendary';
  estimatedTime: string; // e.g., "30 minutes", "2 hours", "Multiple sessions"
  location?: string;
  questGiver?: string;
  level?: number; // Recommended level
  
  // Progress tracking
  progress?: {
    current: number;
    total: number;
    description?: string;
  };
  
  // Quest chain information
  chainId?: string;
  chainPosition?: number;
  chainTotal?: number;
  prerequisiteQuestIds?: string[]; // Kept from src/types.ts (vs prerequisiteQuests in root)
  // unlocksQuests from root is covered by unlockQuestIds below
  
  // Timestamps from root (dateAccepted from root is dateStarted here)
  dateStarted?: number; // timestamp (equivalent to dateAccepted in root)
  dateCompleted?: number; // timestamp
  deadline?: string; // Added from root

  // Rewards - Merged from both
  rewards?: {
    xp?: number;
    gold?: number;
    essence?: number;
    items?: Array<{itemId: string, quantity: number}>;
    generatedLootChestLevel?: number;
    title?: string; // Kept from src/types.ts
    unlockQuestIds?: string[]; // Kept from src/types.ts (covers unlocksQuests from root)
    reputation?: Array<{faction: string, amount: number}>; // Added from root
    unlocks?: Array<{type: 'location' | 'npc' | 'quest' | 'feature', id: string}>; // Added from root
  };
  
  // Metadata & Journaling
  notes?: string[]; // Present in both, kept
  tags?: string[]; // Kept from src/types.ts
  journalEntries?: Array<{ // Added from root
    timestamp: string;
    entry: string;
    type: 'progress' | 'discovery' | 'dialogue' | 'completion';
  }>;
}

// Items
export interface BaseItem {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  itemType: ItemType;
  rarity: number;
  goldValue?: number;
  tags?: TagName[];
  stackable?: boolean;
}

export interface MasterResourceItem extends BaseItem {
  itemType: 'Resource';
  stackable: true;
}

export interface MasterConsumableItem extends BaseItem {
  itemType: 'Consumable';
  effectType: ConsumableEffectType;
  magnitude?: number;
  duration?: number;
  statusToCure?: StatusEffectName;
  buffToApply?: StatusEffectName;
  stackable: true;
}

export interface UniqueConsumable extends BaseItem {
  itemType: 'Consumable';
  effectType: ConsumableEffectType;
  magnitude?: number;
  duration?: number;
  statusToCure?: StatusEffectName;
  buffToApply?: StatusEffectName;
  resourceCost?: ResourceCost[];
  scalingFactor?: number;
  stackable: false;
}

export interface Equipment extends BaseItem {
  itemType: 'Equipment';
  slot: EquipmentSlot;
  statsBoost: Partial<Pick<PlayerStubForEquipment, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>;
  resourceCost?: ResourceCost[];
  scalingFactor?: number;
  scalesWith?: 'Body' | 'Mind';
  stackable: false;
}

export interface QuestItem extends BaseItem {
  itemType: 'QuestItem';
  questId?: string;
  stackable?: boolean;
}

export interface LootChestItem extends BaseItem {
  itemType: 'LootChest';
  level: number;
  stackable: false;
}

export type GameItem = UniqueConsumable | Equipment | QuestItem | LootChestItem;
export type MasterItemDefinition = MasterResourceItem | MasterConsumableItem;
export type Consumable = UniqueConsumable | MasterConsumableItem;

// Player related types (Player must be after its dependencies)
export interface Player {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ep: number;
  maxEp: number;
  gold: number;
  essence: number;
  body: number;
  mind: number;
  reflex: number;
  speed: number;
  spells: Spell[];
  preparedSpellIds: string[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  traits: Trait[];
  quests: Quest[];
  activeStatusEffects: ActiveStatusEffect[];
  inventory: Record<string, number>;
  items: GameItem[];
  equippedItems: Partial<Record<DetailedEquipmentSlot, string | null>>;
  abilities: Ability[];
  preparedAbilityIds: string[];
  iconName?: SpellIconName;
  name?: string;
  // Added from root types.ts
  title?: string;
  classId?: string;
  specializationId?: string;
  hasCustomizedCharacter?: boolean;
  bestiary: Record<string, {
    id: string;
    name: string;
    iconName: SpellIconName;
    description: string;
    vanquishedCount: number;
    // Fields below added/updated from root types.ts bestiary definition
    level?: number;
    weakness?: ElementName;
    resistance?: ElementName;
    specialAbilityName?: string;
  }>;
  discoveredComponents: SpellComponent[];
  discoveredRecipes: string[];
  currentLocationId: string;
  homestead: Homestead;
}

export interface PlayerEffectiveStats {
  maxHp: number;
  maxMp: number;
  maxEp: number;
  speed: number;
  body: number;
  mind: number;
  reflex: number;
  physicalPower: number;
  magicPower: number;
  defense: number;
  damageReflectionPercent: number;
}

// Added from root types.ts: PlayerClass, PlayerSpecialization, Character
export interface PlayerClass {
  id: string;
  name: string;
  description: string;
  specializations: PlayerSpecialization[];
}

export interface PlayerSpecialization {
  id: string;
  name: string;
  description: string;
  bonuses?: {
    body?: number;
    mind?: number;
    reflex?: number;
    maxHp?: number;
    maxMp?: number;
    maxEp?: number;
  };
}

export interface Character {
  id: number; // Note: original in types.ts was id: number. Consider if string is more consistent. For now, keeping as number.
  name: string;
  race: string;
  class: string; // Consider mapping to PlayerClass.id if appropriate
  level: number;
}

// Generated Data types
export interface GeneratedSpellData {
  name: string;
  description: string;
  manaCost: number;
  damage: number;
  damageType: ElementName;
  scalesWith?: 'Body' | 'Mind';
  effect?: string;
  iconName: SpellIconName;
  statusEffectInflict?: SpellStatusEffect;
  resourceCost?: ResourceCost[];
  originalSpell?: Spell; // Used in edit context
  level?: number;
  componentsUsed?: Array<{ componentId: string; configuration: Record<string, number | string> }>;
  tags?: TagName[];
  rarity: number;
  epCost?: number;
  scalingFactor?: number;
  duration?: number;
}

export interface GeneratedConsumableData {
    name: string;
    description: string;
    iconName: SpellIconName;
    effectType: ConsumableEffectType;
    magnitude?: number;
    duration?: number;
    statusToCure?: StatusEffectName;
    buffToApply?: StatusEffectName;
    resourceCost?: ResourceCost[];
    rarity: number;
    tags?: TagName[];
}

export interface GeneratedEquipmentData {
    name: string;
    description: string;
    iconName: SpellIconName;
    slot: EquipmentSlot;
    statsBoost: Partial<Pick<PlayerStubForEquipment, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>;
    resourceCost?: ResourceCost[];
    rarity: number;
    tags?: TagName[];
    scalingFactor?: number;
    scalesWith?: 'Body' | 'Mind';
}

export interface GeneratedSpellComponentData extends Omit<SpellComponent, 'id' | 'researchRequirements'> {
  researchRequirements: {
    gold: number;
    essence?: number;
    items?: Partial<ResourceCost>[];
    time?: number;
    requiredLevel?: number;
  };
  usageGoldCost?: number;
  usageEssenceCost?: number;
}

export interface GeneratedEnemyData {
  name: string;
  description: string;
  hp: number;
  level: number;
  baseBody: number;
  baseMind: number;
  baseReflex: number;
  baseSpeed?: number;
  specialAbilityName?: string;
  specialAbilityDescription?: string;
  weakness?: ElementName;
  resistance?: ElementName;
  imagePrompt?: string;
  iconName: SpellIconName;
  goldDrop?: { min: number, max: number };
  essenceDrop?: { min: number, max: number };
  isElite?: boolean;
  droppedResources?: ResourceCost[];
  lootTableId?: string;
}

export interface GeneratedTraitData {
  name: string;
  description: string;
  iconName: SpellIconName;
  tags?: TagName[];
  rarity: number;
}

export interface GeneratedQuestData {
  title: string;
  description: string;
  objectives: string[];
  iconName: SpellIconName;
}

// Enemy and Combat types
export interface Enemy {
  id:string;
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  body: number;
  mind: number;
  reflex: number;
  speed: number;
  level: number;
  specialAbilityName?: string;
  specialAbilityDescription?: string;
  weakness?: ElementName;
  resistance?: ElementName;
  imagePrompt?: string;
  iconName: SpellIconName;
  activeStatusEffects: ActiveStatusEffect[];
  baseBody?: number;
  baseMind?: number;
  baseReflex?: number;
  isTargeted?: boolean;
  goldDrop?: { min: number, max: number };
  essenceDrop?: { min: number, max: number };
  lootTableId?: string;
  isElite?: boolean;
  droppedResources?: ResourceCost[];
}

export interface CombatActionLog {
  id: string;
  turn: number;
  actor: 'Player' | 'Enemy' | 'System';
  message: string;
  type?: 'damage' | 'heal' | 'status' | 'info' | 'resource' | 'speed' | 'action' | 'error' | 'success' | 'warning' | 'magic';
}

// Loot related types
export interface LootTableEntry {
    itemId: string;
    quantityMin: number;
    quantityMax: number;
    weight: number;
}

export interface LootTable {
    id: string;
    entries: LootTableEntry[];
}

export interface LootDrop {
    type: LootDropType;
    promptHint?: string;
    rarityHint?: number;
    itemId?: string;
    quantity?: number;
    resourceTypeName?: ResourceType; // For "resource" type drops to specify the name
    amount?: number;
    componentData?: GeneratedSpellComponentData;
    spellData?: GeneratedSpellData;
    equipmentData?: GeneratedEquipmentData;
    consumableData?: GeneratedConsumableData;
}

// Location System Types
export interface Settlement {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'town' | 'village' | 'outpost';
  population: number;
  shops: Shop[];
  taverns: Tavern[];
  npcs: NPC[];
  pointsOfInterest: PointOfInterest[];
  quests: string[]; // Quest IDs available in this settlement
  travelTimeFromOtherSettlements: Record<string, number>; // Settlement ID -> hours
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'wilderness' | 'settlement' | 'dungeon' | 'landmark';
  settlement?: Settlement; // Only if type is 'settlement'
  pointsOfInterest: PointOfInterest[];
  connectedLocations: Record<string, number>; // Location ID -> travel time in hours
  discovered: boolean;
  dangerLevel: number; // 1-10
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'weapons' | 'armor' | 'magic' | 'alchemy' | 'crafting';
  keeper: string; // NPC ID
  items: ShopItem[];
  services: ShopService[];
}

export interface ShopItem {
  itemId: string; // References master item definitions or unique items
  price: number;
  stock: number; // -1 for unlimited
  restockTime?: number; // Hours until restock
}

export interface ShopService {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'repair' | 'enchant' | 'identify' | 'craft' | 'train';
}

export interface Tavern {
  id: string;
  name: string;
  description: string;
  keeper: string; // NPC ID
  rooms: TavernRoom[];
  services: TavernService[];
  rumors: Rumor[];
}

export interface TavernRoom {
  type: 'common' | 'private' | 'luxury';
  pricePerNight: number;
  available: boolean;
}

export interface TavernService {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'meal' | 'drink' | 'information' | 'entertainment';
}

export interface Rumor {
  id: string;
  text: string;
  source: string; // NPC name
  truthfulness: number; // 0-1, how accurate the rumor is
  relatedQuestId?: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  occupation: string;
  personality: string;
  iconName: SpellIconName;
  dialogue: NPCDialogue[];
  quests: string[]; // Quest IDs this NPC can give
  services: string[]; // Service IDs this NPC provides
  relationship: number; // -100 to 100, player's standing with this NPC
}

export interface NPCDialogue {
  id: string;
  trigger: 'greeting' | 'quest' | 'trade' | 'information' | 'farewell';
  text: string;
  responses?: NPCDialogueResponse[];
  conditions?: DialogueCondition[];
}

export interface NPCDialogueResponse {
  text: string;
  action: 'continue' | 'quest' | 'trade' | 'end';
  nextDialogueId?: string;
  questId?: string;
  requirements?: DialogueCondition[];
}

export interface DialogueCondition {
  type: 'level' | 'item' | 'quest' | 'relationship' | 'gold';
  value: string | number;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'has';
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  type: 'landmark' | 'resource' | 'danger' | 'mystery' | 'crafting';
  interactionType: 'explore' | 'gather' | 'fight' | 'puzzle' | 'craft';
  requirements?: DialogueCondition[];
  rewards?: POIReward[];
  cooldown?: number; // Hours before can interact again
  lastInteraction?: number; // Timestamp of last interaction
}

export interface POIReward {
  type: 'xp' | 'gold' | 'item' | 'resource' | 'quest';
  amount?: number;
  itemId?: string;
  questId?: string;
}

// Crafting Recipe System
export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'equipment' | 'component' | 'misc';
  resultItemId: string;
  resultQuantity: number;
  ingredients: RecipeIngredient[];
  requirements: CraftingRequirement[];
  craftingTime: number; // In hours
  discoveryPrompt?: string; // Prompt used to discover this recipe
  discovered: boolean;
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  type: ResourceType;
}

export interface CraftingRequirement {
  type: 'level' | 'skill' | 'location' | 'tool';
  value: string | number;
}

export type Recipe = CraftingRecipe;

// Homestead related types
export interface HomesteadProperty {
  level: number;
  description: string;
  upgrades: string[];
  currentUpgrade?: string;
  nextUpgradeCost?: ResourceCost[];
  activeProjects?: HomesteadProject[];
}

export interface HomesteadProject {
  id: string;
  name: string;
  description: string;
  type: 'upgrade' | 'production' | 'research';
  targetProperty: string;
  duration: number; // in hours
  startTime: number; // timestamp
  resourceCost: ResourceCost[];
  rewards?: {
    type: 'item' | 'resource' | 'upgrade';
    itemId?: string;
    quantity?: number;
  }[];
}

export interface Homestead {
  id: string;
  name: string;
  description: string;
  properties: Record<string, HomesteadProperty>;
  activeProjects: HomesteadProject[];
  totalInvestment: number; // total gold invested
  unlocked: boolean;
}

// Saved Game Data Structures
export interface SavedCombatState {
  currentEnemies: Enemy[];
  combatLog: CombatActionLog[];
  currentGameState: GameState; // The string like 'IN_COMBAT', 'HOME'
  turn: number;
  isPlayerTurn: boolean;
  currentActingEnemyIndex: number;
  targetEnemyId: string | null;
}

export interface FullSavedGameData {
  player: Player;
  combatState?: SavedCombatState; // Optional, as a game might be saved when not in combat
  // We can add other global states here later if needed, e.g., worldEventStates, etc.
}
