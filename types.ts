export interface Player {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ep: number;
  maxEp: number;
  
  body: number;    // New core stat
  mind: number;    // New core stat
  reflex: number;  // New core stat
  speed: number;   // Derived from Reflex, replaces initiative

  spells: Spell[];
  preparedSpellIds: string[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  traits: Trait[];
  quests: Quest[];
  activeStatusEffects: ActiveStatusEffect[];
  inventory: Record<ResourceType, number>;
  items: GameItem[];
  equippedItems: Partial<Record<DetailedEquipmentSlot, string | null>>; // UPDATED
  abilities: Ability[];
  preparedAbilityIds: string[];
  iconName?: SpellIconName;
  name?: string; // Added for character name display
  bestiary: Record<string, { 
    id: string; 
    name: string; 
    iconName: SpellIconName; 
    description: string; 
    vanquishedCount: number;
    level?: number;
    weakness?: Spell['damageType'];
    resistance?: Spell['damageType'];
    specialAbilityName?: string;
    // Add other relevant Enemy fields if needed for display
  }>;
}

export interface PlayerEffectiveStats {
  maxHp: number;
  maxMp: number;
  maxEp: number;
  speed: number;
  body: number;    // Effective Body (base + equip + status)
  mind: number;    // Effective Mind
  reflex: number;  // Effective Reflex
  physicalPower: number; 
  magicPower: number;
  defense: number; 
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
}

export type AbilityEffectType = 
  | 'MP_RESTORE' 
  | 'SELF_HEAL' 
  | 'TEMP_STAT_BUFF' 
  | 'ENEMY_DEBUFF';  

export type ItemType = 'Consumable' | 'Equipment'; // UPDATED
export type InventoryFilterType = 'All' | ItemType | 'Resource'; // New for inventory filtering

// Define the possible elements for items
export type ItemElement = Spell['damageType'] | 'None'; // Reusing Spell damage types

export type ConsumableEffectType = 'HP_RESTORE' | 'MP_RESTORE' | 'EP_RESTORE' | 'CURE_STATUS' | 'APPLY_BUFF'; // RENAMED

// Generic EquipmentSlot used by Item and AI generation
export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory';

// DetailedEquipmentSlot for UI paper doll and player.equippedItems
export type DetailedEquipmentSlot =
  | 'Head' | 'Neck' | 'Jewels'
  | 'Chest' | 'Belt' | 'Legs' | 'Feet'
  | 'WeaponLeft' | 'WeaponRight'
  | 'Hands' | 'Shoulder' | 'Back'
  | 'Accessory1' | 'Accessory2' // More specific than a single "Accessory"
  | 'Followers' // Placeholder
  | 'MetaItems'; // Placeholder


export interface Consumable { // RENAMED from Potion
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  itemType: 'Consumable'; // UPDATED
  effectType: ConsumableEffectType; // RENAMED
  magnitude?: number;
  duration?: number;
  statusToCure?: StatusEffectName;
  buffToApply?: StatusEffectName; 
  resourceCost?: ResourceCost[];
  element?: ItemElement; // Added element property
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  itemType: 'Equipment';
  slot: EquipmentSlot; // Generic slot type for item definition
  statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>;
  originalStatsBoost?: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>; // Added to store base stats before enhancement
  resourceCost?: ResourceCost[];
  element?: ItemElement; // Added element property
  enhancementLevel?: number; // Added for item improvement
  // Optional: could add a sub-type later for more precise mapping to DetailedEquipmentSlot
  // equipmentSubType?: 'Helmet' | 'Chestplate' | 'Greaves' | 'Boots' | 'Gloves' | 'Cloak' | 'Amulet' | 'Ring' | 'Belt' | 'Sword' | 'Staff' | 'Bow';
}

export type GameItem = Consumable | Equipment; // UPDATED


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
  | 'HelmetIcon' // New specific slot icons
  | 'NecklaceIcon'
  | 'RingIcon'
  | 'BeltIcon'
  | 'BootsIcon'
  | 'GlovesIcon'
  | 'ShoulderArmorIcon'
  | 'CloakIcon'
  | 'BackpackIcon' // For Followers/MetaItems placeholder
  | 'Bars3Icon' // For Menu
  | 'SearchIcon' // New for inventory search
  | 'CollectionIcon' // New for Encyclopedia
  | 'FleeIcon' // New for Flee action
  | 'Default';

export type StatusEffectName = 
  | 'Poison' | 'Stun' | 'Burn' | 'Freeze' 
  | 'WeakenBody' | 'WeakenMind' | 'WeakenReflex' 
  | 'StrengthenBody' | 'StrengthenMind' | 'StrengthenReflex' 
  | 'Regeneration'
  | 'TEMP_BODY_UP' | 'TEMP_MIND_UP' | 'TEMP_REFLEX_UP' | 'TEMP_SPEED_UP'
  | 'TEMP_MAX_HP_UP' | 'TEMP_MAX_MP_UP' | 'TEMP_HP_REGEN'
  | 'Defending'; // New status effect for Defend action


export type ResourceType = 'Arcane Dust' | 'Emberbloom Petal' | 'Shadowsilk Thread' | 'Crystal Shard' | 'Verdant Leaf' | 'Mystic Orb';

export interface ResourceCost {
  type: ResourceType;
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
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  damage: number; 
  damageType: 'Fire' | 'Ice' | 'Lightning' | 'Physical' | 'Healing' | 'Dark' | 'Light' | 'Arcane' | 'Poison' | 'None';
  scalesWith?: 'Body' | 'Mind'; 
  effect?: string;
  iconName: SpellIconName;
  statusEffectInflict?: SpellStatusEffect;
  resourceCost?: ResourceCost[];
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
  weakness?: Spell['damageType'];
  resistance?: Spell['damageType'];
  imagePrompt?: string;
  iconName: SpellIconName;
  activeStatusEffects: ActiveStatusEffect[];
  baseBody?: number; 
  baseMind?: number;
  baseReflex?: number;
  isTargeted?: boolean; // Optional for UI indication, managed by App.tsx through props
}

export interface CombatActionLog {
  id: string;
  turn: number;
  actor: 'Player' | 'Enemy' | 'System';
  message: string;
  type?: 'damage' | 'heal' | 'status' | 'info' | 'resource' | 'speed' | 'action'; 
}

export type GameState = 
  | 'HOME' 
  | 'SPELL_CRAFTING' 
  | 'SPELL_EDITING' 
  | 'TRAIT_CRAFTING' 
  | 'MANAGE_SPELLS' 
  | 'IN_COMBAT' 
  | 'GAME_OVER_VICTORY' 
  | 'GAME_OVER_DEFEAT' 
  | 'SPELL_CRAFT_CONFIRMATION' 
  | 'SPELL_EDIT_CONFIRMATION'
  | 'ITEM_CRAFTING' 
  | 'ITEM_CRAFT_CONFIRMATION'
  | 'SELECTING_POTION' // May become SELECTING_CONSUMABLE
  | 'CHARACTER_SHEET'
  | 'SELECTING_ABILITY'
  | 'CRAFTING_HUB'
  | 'CAMP_VIEW'
  | 'EXPLORE_VIEW'
  | 'BIOME_SELECTED'; // Added for world map interaction


export interface GeneratedSpellData {
  name: string;
  description: string;
  manaCost: number;
  damage: number;
  damageType: Spell['damageType'];
  scalesWith?: 'Body' | 'Mind';
  effect?: string;
  iconName: SpellIconName;
  statusEffectInflict?: SpellStatusEffect;
  resourceCost?: ResourceCost[];
  originalSpell?: Spell; 
}

export interface GeneratedConsumableData { // RENAMED from GeneratedPotionData
    name: string;
    description: string;
    iconName: SpellIconName;
    effectType: ConsumableEffectType; // RENAMED
    magnitude?: number;
    duration?: number;
    statusToCure?: StatusEffectName;
    buffToApply?: StatusEffectName;
    resourceCost?: ResourceCost[];
}

export interface GeneratedEquipmentData {
    name: string;
    description: string;
    iconName: SpellIconName;
    slot: EquipmentSlot; // AI generates generic slot
    statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>; 
    resourceCost?: ResourceCost[];
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
  weakness?: Spell['damageType'];
  resistance?: Spell['damageType'];
  imagePrompt?: string;
  iconName: SpellIconName;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
}

export interface GeneratedTraitData {
  name: string;
  description: string;
  iconName: SpellIconName;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  status: 'active' | 'completed' | 'failed';
  isMainQuest: boolean;
  iconName: SpellIconName;
}

export interface GeneratedQuestData {
  title: string;
  description: string;
  objectives: string[];
  iconName: SpellIconName;
}

// UPDATED CharacterSheetTab
export type CharacterSheetTab = 'Main' | 'Inventory' | 'Spells' | 'Traits' | 'Quests' | 'Abilities' | 'Encyclopedia';

export type EncyclopediaSubTabId = 'spells' | 'abilities' | 'traits' | 'items' | 'monsters' | 'elements' | 'biomes' | 'npcs';

export interface UIElementConfig {
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  zIndex: number;
  scale?: number;
}

export interface BattleLayoutConfig {
  battleArea: UIElementConfig;
  actionMenu: UIElementConfig;
  contentArea: UIElementConfig;
  playerSprite: UIElementConfig;
  enemySprites: UIElementConfig[];
  playerStatus?: UIElementConfig;
  enemyStatus?: UIElementConfig;
  actionGrid?: UIElementConfig;
  turnIndicator?: UIElementConfig;
  combatLog?: UIElementConfig;
  dynamicViewContainer?: UIElementConfig;
}

export interface BattleBackgroundConfig {
  imageUrl?: string;
  backgroundGradient?: {
    from: string;
    to: string;
  };
  backgroundColor?: string;
}

export interface JornBattleConfig {
  battleAreaHeight: number;
  useFullHeight: boolean;
  gridColumns: number;
  gridRows: number;
  canvasWidth: number | string;
  canvasHeight: string | number;
  canvasMinWidth?: number | string;
  canvasMinHeight?: number | string;
  layout: BattleLayoutConfig;
  playerPosition?: { x: number; y: number };
  enemyPositions?: Array<{ x: number; y: number }>;
  playerStatusPosition?: { x: number; y: number };
  enemyStatusPosition?: { x: number; y: number };
  background?: BattleBackgroundConfig;
  fontSizes?: {
    base?: number | string;
    small?: number | string;
    large?: number | string;
    heading?: number | string;
    ui?: number | string;
  };
  animationSpeed?: number;
  showDamageNumbers?: boolean;
  messageBoxStyle?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  menuStyle?: {
    backgroundColor?: string;
    buttonColor?: string;
    textColor?: string;
    hoverColor?: string;
    activeColor?: string;
  };
  editMode?: {
    enabled?: boolean;
    showGrid?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
  };
}

// New types for Exploration and Points of Interest

export type NPCPersonality = 'neutral' | 'aggressive' | 'savage' | 'passive';

export interface NPCDetails {
  id: string;
  name: string;
  description: string;
  personality: NPCPersonality;
  isMonster: boolean; // If true, could potentially link to Bestiary entry
  iconName: SpellIconName;
  // Potentially add stats, dialogue snippets, quest associations etc.
}

export interface PointOfInterestProperties {
  name: string;
  description: string;
  temperature?: string; // e.g., "cold", "temperate", "hot"
  pointOfInterest?: string; // Specific AI generated notable feature
  numberOfNPCs: number;
  location: { x: number; y: number }; // For map positioning
  biome: string; // e.g., "forest", "desert", "mountain"
  structures?: string[]; // e.g., ["ruined tower", "small village"]
  loot?: string[]; // Potential loot descriptors
  explored: boolean;
  // Add other relevant properties here
  ambientSounds?: string[];
  flora?: string[];
  fauna?: string[];
  primaryResources?: ResourceType[];
  encounterDifficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
}

export interface PointOfInterest {
  id: string;
  properties: PointOfInterestProperties;
  npcs: NPCDetails[];
  // Can include generated map tile data, event triggers, etc.
}

export interface BiomeDetails {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  typicalFlora: string[];
  typicalFauna: string[];
  climate: string;
  primaryResources?: ResourceType[];
  // encounteredPointsOfInterest: string[]; // IDs of PoIs found in this biome type
}

// Placeholder for WorldMap data structure if needed directly in types
export interface WorldMapData {
  pointsOfInterest: PointOfInterest[];
  // Could include overall map image, biome boundaries, etc.
}