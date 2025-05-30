// Foundational String Literal Types & Unions
export type ElementName = 'Fire' | 'Ice' | 'Lightning' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Arcane' | 'Nature' | 'PhysicalNeutral' | 'PoisonSource' | 'HealingSource';
export type TagName =
  // Status Effects
  | 'Stun' | 'PoisonDoT' | 'BurnDoT' | 'BleedDoT' | 'CorruptionDoT' | 'FrostbiteDoT' | 'RotDoT' | 'ShockDoT'
  | 'Silence' | 'Root' | 'Disarm' | 'Charm' | 'Taunt' | 'Fear' | 'Levitate'
  | 'ManaDrain' | 'Invisibility' | 'DodgeChange' | 'DamageResistance' | 'DamageReflection'
  | 'ActionSpeedIncrease' | 'ResourceGeneration' | 'StatBoost' | 'HealOverTime' | 'DamageNegation'
  | 'Retaliation' | 'Conversion' | 'EffectDurationMod' | 'ControlTarget' | 'Amplification' | 'Haste'
  // Targeting & Delivery
  | 'MultiTarget' | 'DelayedAttack' | 'SelfTarget' | 'AreaOfEffect' | 'Projectile'
  // Utility & Meta
  | 'Scaling' | 'Synergy' | 'Counter' | 'CostReduction'
  | 'Utility' | 'LootChest'
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
  | 'GoldCoinIcon' | 'EssenceIcon' | 'MapIcon' | 'TentIcon' | 'UploadIcon' | 'DownloadIcon' | 'ChestIcon'
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
  | 'Silenced' | 'Rooted';

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
  | 'RECIPE_DISCOVERY' | 'CRAFTING_WORKSHOP';
export type CharacterSheetTab = 'Main' | 'Inventory' | 'Spells' | 'Abilities' | 'Traits' | 'Quests' | 'Encyclopedia';
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
  status: 'active' | 'completed' | 'failed';
  isMainQuest: boolean;
  iconName: SpellIconName;
  rewards?: {
    xp?: number;
    gold?: number;
    essence?: number;
    items?: Array<{itemId: string, quantity: number}>;
    generatedLootChestLevel?: number;
  }
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
  damageReflectionPercent: number;
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
  type?: 'damage' | 'heal' | 'status' | 'info' | 'resource' | 'speed' | 'action' | 'error';
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
