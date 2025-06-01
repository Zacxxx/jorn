import { Homestead } from './src/types';

export type ElementName = 'Fire' | 'Ice' | 'Lightning' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Arcane' | 'Nature' | 'PhysicalNeutral' | 'PoisonSource' | 'HealingSource';
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
  // Elements as Tags
  | ElementName;


export type CharacterSheetTab = 'Main' | 'Inventory' | 'Spells' | 'Abilities' | 'Traits' | 'Quests' | 'Encyclopedia' | 'Progress';

// Class System Types
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
  inventory: Record<string, number>; // Item ID (from master list) -> quantity for stackable items
  items: GameItem[]; // For unique, AI-generated items, and instances of LootChests
  equippedItems: Partial<Record<DetailedEquipmentSlot, string | null>>; 
  abilities: Ability[];
  preparedAbilityIds: string[];
  iconName?: SpellIconName;
  name?: string; 
  title?: string; // Player's title (displayed before name)
  classId?: string; // Reference to PlayerClass
  specializationId?: string; // Reference to PlayerSpecialization
  hasCustomizedCharacter?: boolean; // Track if player has customized their character
  bestiary: Record<string, { 
    id: string; 
    name: string; 
    iconName: SpellIconName; 
    description: string; 
    vanquishedCount: number;
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
  damageReflectionPercent: number; // Percentage (0-1)
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
  scalingFactor?: number; // Multiplier e.g., 0.1 for 10%
  scalesWith?: 'Body' | 'Mind'; 
  level?: number; 
  rarity?: number; 
}

export type AbilityEffectType = 
  | 'MP_RESTORE' 
  | 'SELF_HEAL' 
  | 'TEMP_STAT_BUFF' 
  | 'ENEMY_DEBUFF';  

export type ItemType = 'Consumable' | 'Equipment' | 'Resource' | 'QuestItem' | 'LootChest'; 
export type InventoryFilterType = 'All' | ItemType;


export type ConsumableEffectType = 'HP_RESTORE' | 'MP_RESTORE' | 'EP_RESTORE' | 'CURE_STATUS' | 'APPLY_BUFF';

export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory';

export type DetailedEquipmentSlot =
  | 'Head' | 'Neck' | 'Jewels'
  | 'Chest' | 'Belt' | 'Legs' | 'Feet'
  | 'WeaponLeft' | 'WeaponRight'
  | 'Hands' | 'Shoulder' | 'Back'
  | 'Accessory1' | 'Accessory2' 
  | 'Followers' 
  | 'MetaItems'; 


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
  statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>; 
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


export type SpellIconName = 
  | 'Fireball' 
  | 'IceShard' 
  | 'LightningBolt' 
  | 'Heal' 
  | 'Shield' 
  | 'SwordSlash' 
  | 'PoisonCloud' 
  | 'ArcaneBlast'
  | 'ShadowBolt'
  | 'HolyLight'
  | 'Book' 
  | 'Scroll' 
  | 'Star' 
  | 'StatusPoison'
  | 'StatusStun'
  | 'StatusSilence'
  | 'StatusRoot'
  | 'Gem' 
  | 'Plant' 
  | 'Dust' 
  | 'Thread' 
  | 'PotionHP'
  | 'PotionMP'
  | 'PotionGeneric'
  | 'SwordHilt'
  | 'Breastplate'
  | 'Amulet'
  | 'WandIcon' 
  | 'UserIcon' 
  | 'BagIcon' 
  | 'GearIcon' 
  | 'MindIcon' 
  | 'CheckmarkCircleIcon' 
  | 'FilterListIcon' 
  | 'SortAlphaIcon'
  | 'SkullIcon'
  | 'HeroBackIcon'
  | 'BodyIcon'   
  | 'ReflexIcon' 
  | 'SpeedIcon'
  | 'HelmetIcon' 
  | 'NecklaceIcon'
  | 'RingIcon'
  | 'BeltIcon'
  | 'BootsIcon'
  | 'GlovesIcon'
  | 'ShoulderArmorIcon'
  | 'CloakIcon'
  | 'BackpackIcon' 
  | 'Bars3Icon' 
  | 'SearchIcon' 
  | 'CollectionIcon' 
  | 'FleeIcon'
  | 'AtomIcon' 
  | 'FlaskIcon' 
  | 'GoldCoinIcon' 
  | 'EssenceIcon' 
  | 'MapIcon' 
  | 'TentIcon'
  | 'UploadIcon' 
  | 'DownloadIcon' 
  | 'ChestIcon' 
  | 'HomeIcon'
  | 'ElementFire' | 'ElementIce' | 'ElementLightning' | 'ElementEarth' | 'ElementAir' | 'ElementLight' | 'ElementDark' | 'ElementArcane' | 'ElementNature' | 'ElementPoison' | 'ElementHealing'
  | 'TagGeneric' 
  | 'Default';

export type StatusEffectName = 
  | 'Poison' | 'Stun' | 'Burn' | 'Freeze' 
  | 'WeakenBody' | 'WeakenMind' | 'WeakenReflex' 
  | 'StrengthenBody' | 'StrengthenMind' | 'StrengthenReflex' 
  | 'Regeneration'
  | 'TEMP_BODY_UP' | 'TEMP_MIND_UP' | 'TEMP_REFLEX_UP' | 'TEMP_SPEED_UP'
  | 'TEMP_MAX_HP_UP' | 'TEMP_MAX_MP_UP' | 'TEMP_HP_REGEN'
  | 'Defending'
  | 'DamageReflection' // Added for reflection status
  | 'BurningDoTActive' | 'BleedingDoTActive' | 'CorruptedDoTActive' | 'FrostbittenDoTActive' | 'RottingDoTActive' | 'ShockedDoTActive' | 'PoisonDoTActive'
  | 'Silenced' | 'Rooted'
  // Additional status effects used in tag system
  | 'Burning' | 'Bleeding' | 'Freezing' | 'Shocking' | 'Slow' | 'Haste' | 'Shield' | 'Invisibility' | 'Strength' | 'Intelligence';


export type ResourceType = 'Arcane Dust' | 'Emberbloom Petal' | 'Shadowsilk Thread' | 'Crystal Shard' | 'Verdant Leaf' | 'Mystic Orb' | 'Iron Ore' | 'Ancient Bone'; 

export interface ResourceCost {
  type: ResourceType; 
  itemId: string; 
  quantity: number;
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

export interface SpellStatusEffect { 
  name: StatusEffectName;
  duration: number; 
  magnitude?: number;
  chance: number;
  description?: string;
  tags?: TagName[];
}

export type SpellComponentCategory = 'DamageSource' | 'DeliveryMethod' | 'PrimaryEffect' | 'SecondaryModifier' | 'CostEfficiency' | 'VisualAspect' | 'EssenceInfusion' | 'ElementalCore' | 'Utility'; 

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

export interface SpellComponentEffect {
  type: 'SET_DAMAGE_TYPE' | 'ADD_BASE_DAMAGE' | 'APPLY_STATUS_EFFECT' | 'MODIFY_MANA_COST_FLAT' | 'MODIFY_MANA_COST_PERCENT' | 'SET_SCALING_STAT' | 'SUGGEST_ICON' | 'ADD_DESCRIPTION_FRAGMENT' | 'ADD_NAME_FRAGMENT' | 'ADD_TAG' | 'SET_ELEMENT';
  damageType?: ElementName; 
  statusEffect?: Partial<SpellStatusEffect>; 
  value?: number | string; 
  scalesWith?: 'Body' | 'Mind';
  tagName?: TagName;
  elementName?: ElementName;
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
    items?: Partial<ResourceCost>[]; 
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
  isDefeated?: boolean; // Track if enemy is defeated but still visible
}

export interface CombatActionLog {
  id: string;
  turn: number;
  actor: 'Player' | 'Enemy' | 'System';
  message: string;
  type?: 'damage' | 'heal' | 'status' | 'info' | 'resource' | 'speed' | 'action' | 'error' | 'success' | 'warning' | 'magic'; 
}

export type GameState = 
  | 'HOME' 
  | 'SPELL_CRAFTING' 
  | 'SPELL_DESIGN_STUDIO' 
  | 'RESEARCH_LAB' // Will be deprecated or renamed to THEORIZE_COMPONENT
  | 'GENERAL_RESEARCH' // Will be deprecated or renamed to RESEARCH_ARCHIVES
  | 'RESEARCH_ARCHIVES' // New: For viewing known components
  | 'THEORIZE_COMPONENT' // New: For creating/discovering new components (uses ResearchLabView)
  | 'SPELL_EDITING' 
  | 'TRAIT_CRAFTING' 
  | 'ABILITY_CRAFTING' 
  | 'MANAGE_SPELLS' 
  | 'IN_COMBAT' 
  | 'GAME_OVER_VICTORY' 
  | 'GAME_OVER_DEFEAT' 
  | 'SPELL_CRAFT_CONFIRMATION' 
  | 'SPELL_EDIT_CONFIRMATION'
  | 'ITEM_CRAFTING' 
  | 'ITEM_CRAFT_CONFIRMATION'
  | 'SELECTING_POTION' 
  | 'CHARACTER_SHEET'
  | 'SELECTING_ABILITY'
  | 'CRAFTING_HUB'
  | 'EXPLORING_MAP'
  | 'HOMESTEAD_VIEW'
  | 'SETTLEMENT_VIEW'
  | 'SHOP_VIEW'
  | 'TAVERN_VIEW'
  | 'NPC_DIALOGUE'
  | 'RECIPE_DISCOVERY'
  | 'CRAFTING_WORKSHOP'
  | 'CAMP'
  | 'QUEST_BOOK'
  | 'PARAMETERS'; 


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
  originalSpell?: Spell; 
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
    statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>; 
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

export interface GeneratedTraitData {
  name: string;
  description: string;
  iconName: SpellIconName;
  tags?: TagName[]; 
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
  prerequisiteQuests?: string[];
  unlocksQuests?: string[];
  
  // Timestamps
  dateAccepted?: number;
  dateCompleted?: number;
  deadline?: number;
  
  // Enhanced rewards
  rewards?: {
    xp?: number;
    gold?: number;
    essence?: number;
    items?: Array<{itemId: string, quantity: number}>;
    generatedLootChestLevel?: number;
    reputation?: Array<{faction: string, amount: number}>;
    unlocks?: Array<{type: 'location' | 'npc' | 'quest' | 'feature', id: string}>;
  };
  
  // Quest notes and journal entries
  notes?: string[];
  journalEntries?: Array<{
    timestamp: string;
    entry: string;
    type: 'progress' | 'discovery' | 'dialogue' | 'completion';
  }>;
}

export interface GeneratedQuestData {
  title: string;
  description: string;
  objectives: string[];
  iconName: SpellIconName;
}

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

export type LootDropType = 'spell' | 'equipment' | 'consumable' | 'gold' | 'essence' | 'resource' | 'component';
export interface LootDrop {
    type: LootDropType;
    promptHint?: string; 
    rarityHint?: number; 
    itemId?: string; 
    quantity?: number;
    amount?: number;
    componentData?: GeneratedSpellComponentData;
    spellData?: GeneratedSpellData;
    equipmentData?: GeneratedEquipmentData;
    consumableData?: GeneratedConsumableData;
}

export interface Character {
  id: number;
  name: string;
  race: string;
  class: string;
  level: number;
}
