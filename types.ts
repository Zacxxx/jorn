export type ElementName = 'Fire' | 'Ice' | 'Lightning' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Arcane' | 'Nature' | 'PhysicalNeutral' | 'PoisonSource' | 'HealingSource'; // Expanded placeholder
export type TagName = 
  // Status Effects (can be positive or negative)
  | 'Stun' | 'PoisonDoT' | 'BurnDoT' | 'BleedDoT' | 'CorruptionDoT' | 'FrostbiteDoT' | 'RotDoT' | 'ShockDoT' // DoTs
  | 'Silence' | 'Root' | 'Disarm' | 'Charm' | 'Taunt' | 'Fear' | 'Levitate' 
  | 'ManaDrain' | 'Invisibility' | 'DodgeChange' | 'DamageResistance' | 'DamageReflection' 
  | 'ActionSpeedIncrease' | 'ResourceGeneration' | 'StatBoost' | 'HealOverTime' | 'DamageNegation' 
  | 'Retaliation' | 'Conversion' | 'EffectDurationMod' | 'ControlTarget' | 'Amplification' | 'Haste'
  // Targeting & Delivery
  | 'MultiTarget' | 'DelayedAttack' | 'SelfTarget' | 'AreaOfEffect' | 'Projectile'
  // Utility & Meta
  | 'Scaling' // Indicates the spell/item scales with stats/rarity
  | 'Synergy' // Indicates synergy with other specific tags/elements
  | 'Counter' // Indicates it counters specific tags/elements
  | 'CostReduction'
  | 'Utility' // Added for general utility components/spells
  | 'LootChest' // Added for LootChest items
  // Elements will also be treated as tags for filtering/logic if needed
  | ElementName;


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
  | 'Silenced' 
  | 'Rooted';  


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
}

export interface CombatActionLog {
  id: string;
  turn: number;
  actor: 'Player' | 'Enemy' | 'System';
  message: string;
  type?: 'damage' | 'heal' | 'status' | 'info' | 'resource' | 'speed' | 'action' | 'error'; 
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
  | 'CAMP'; 


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

export interface GeneratedQuestData {
  title: string;
  description: string;
  objectives: string[];
  iconName: SpellIconName;
}

export type CharacterSheetTab = 'Main' | 'Inventory' | 'Spells' | 'Abilities' | 'Traits' | 'Quests' | 'Encyclopedia';


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
