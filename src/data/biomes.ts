import { TagName, ElementName, SpellIconName } from '../types';

export interface BiomeMonster {
  id: string;
  name: string;
  description: string;
  level: { min: number; max: number };
  iconName: SpellIconName;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weight: number; // Higher weight = more common
  // Combat stats will be generated based on level
  preferredElements?: ElementName[];
  preferredTags?: TagName[];
  weakness?: ElementName;
  resistance?: ElementName;
  specialAbilities?: string[];
  goldDrop?: { min: number; max: number };
  essenceDrop?: { min: number; max: number };
  uniqueTraits?: string[];
}

export interface BiomeData {
  id: string;
  name: string;
  description: string;
  theme: string;
  dangerLevel: { min: number; max: number };
  environmentalEffects?: {
    name: string;
    description: string;
    effects: Array<{
      type: 'damage' | 'heal' | 'statusEffect' | 'statModifier';
      amount?: number;
      chance?: number;
      duration?: number;
    }>;
  }[];
  monsters: BiomeMonster[];
  bossMonsters?: BiomeMonster[];
  resources: Array<{
    id: string;
    name: string;
    rarity: 'common' | 'uncommon' | 'rare';
    dropChance: number;
  }>;
  ambientMagic?: ElementName[];
  weatherEffects?: string[];
}

export const BIOMES: Record<string, BiomeData> = {
  peaceful_valley: {
    id: 'peaceful_valley',
    name: 'Peaceful Valley',
    description: 'Rolling green hills dotted with wildflowers, where gentle creatures roam freely.',
    theme: 'A serene landscape perfect for beginners to learn the basics of combat.',
    dangerLevel: { min: 1, max: 2 },
    monsters: [
      {
        id: 'meadow_rabbit',
        name: 'Meadow Rabbit',
        description: 'A fluffy white rabbit with unusually sharp teeth, more curious than dangerous.',
        level: { min: 1, max: 2 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 40,
        preferredElements: ['Nature'],
        preferredTags: ['Quick', 'Dodge'],
        goldDrop: { min: 1, max: 3 },
        essenceDrop: { min: 1, max: 2 },
        uniqueTraits: ['Extremely fast movement', 'Timid nature']
      },
      {
        id: 'flower_sprite',
        name: 'Flower Sprite',
        description: 'A tiny winged creature that tends to the valley\'s flowers, occasionally mischievous.',
        level: { min: 1, max: 3 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 30,
        preferredElements: ['Nature', 'Light'],
        preferredTags: ['Heal', 'Flying'],
        goldDrop: { min: 2, max: 5 },
        essenceDrop: { min: 2, max: 4 },
        uniqueTraits: ['Can cast minor healing spells', 'Weakness to cold']
      },
      {
        id: 'grazing_deer',
        name: 'Startled Deer',
        description: 'A graceful deer that becomes aggressive only when cornered or protecting its young.',
        level: { min: 2, max: 3 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 20,
        preferredElements: ['Nature', 'Physical'],
        preferredTags: ['Charge', 'Swift'],
        goldDrop: { min: 3, max: 8 },
        essenceDrop: { min: 2, max: 5 },
        uniqueTraits: ['Powerful charging attack', 'Keen senses']
      },
      {
        id: 'crystal_butterfly',
        name: 'Crystal Butterfly',
        description: 'A beautiful butterfly with crystalline wings that shimmer with magical energy.',
        level: { min: 2, max: 4 },
        iconName: 'UserIcon',
        rarity: 'rare',
        weight: 10,
        preferredElements: ['Arcane', 'Light'],
        preferredTags: ['Barrier', 'Reflect'],
        weakness: 'Dark',
        goldDrop: { min: 5, max: 12 },
        essenceDrop: { min: 4, max: 8 },
        specialAbilities: ['Crystal Shield', 'Dazzling Dust'],
        uniqueTraits: ['Magical resistance', 'Produces valuable crystal dust']
      }
    ],
    resources: [
      { id: 'wildflower', name: 'Wildflower', rarity: 'common', dropChance: 0.6 },
      { id: 'healing_herb', name: 'Healing Herb', rarity: 'common', dropChance: 0.4 },
      { id: 'soft_fur', name: 'Soft Fur', rarity: 'uncommon', dropChance: 0.3 },
      { id: 'crystal_dust', name: 'Crystal Dust', rarity: 'rare', dropChance: 0.1 }
    ],
    ambientMagic: ['Nature', 'Light'],
    weatherEffects: ['Gentle breeze', 'Warm sunshine', 'Light rain']
  },

  whispering_woods: {
    id: 'whispering_woods',
    name: 'Whispering Woods',
    description: 'Ancient trees that seem to murmur secrets in languages long forgotten.',
    theme: 'A mystical forest where nature magic runs deep and shadows hold mysteries.',
    dangerLevel: { min: 2, max: 4 },
    environmentalEffects: [
      {
        name: 'Whispering Winds',
        description: 'The voices of the forest provide cryptic guidance.',
        effects: [
          { type: 'heal', amount: 2, chance: 0.2 },
          { type: 'statusEffect', chance: 0.1, duration: 3 }
        ]
      }
    ],
    monsters: [
      {
        id: 'shadow_wolf',
        name: 'Shadow Wolf',
        description: 'A wolf that phases in and out of shadows, its eyes glowing with ethereal light.',
        level: { min: 2, max: 4 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 35,
        preferredElements: ['Dark', 'Nature'],
        preferredTags: ['Stealth', 'Pack'],
        resistance: 'Dark',
        weakness: 'Light',
        goldDrop: { min: 4, max: 10 },
        essenceDrop: { min: 3, max: 6 },
        specialAbilities: ['Shadow Step', 'Howl of the Pack'],
        uniqueTraits: ['Can become briefly incorporeal', 'Hunts in coordinated packs']
      },
      {
        id: 'treant_sapling',
        name: 'Angry Treant Sapling',
        description: 'A young tree awakened by forest magic, fiercely protective of its grove.',
        level: { min: 3, max: 5 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 25,
        preferredElements: ['Nature', 'Earth'],
        preferredTags: ['Root', 'Regeneration'],
        resistance: 'Physical',
        weakness: 'Fire',
        goldDrop: { min: 6, max: 15 },
        essenceDrop: { min: 4, max: 8 },
        specialAbilities: ['Entangling Roots', 'Bark Armor'],
        uniqueTraits: ['Slow but incredibly durable', 'Regenerates health over time']
      },
      {
        id: 'will_o_wisp',
        name: 'Will O\' Wisp',
        description: 'A mysterious ball of ghostly light that leads travelers astray.',
        level: { min: 2, max: 4 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 20,
        preferredElements: ['Arcane', 'Light'],
        preferredTags: ['Illusion', 'Confusion'],
        resistance: 'Physical',
        goldDrop: { min: 3, max: 8 },
        essenceDrop: { min: 5, max: 10 },
        specialAbilities: ['Misdirection', 'Phantom Light'],
        uniqueTraits: ['Immune to physical attacks', 'Can create false images']
      },
      {
        id: 'forest_guardian',
        name: 'Ancient Forest Guardian',
        description: 'A massive, ancient protector of the forest, awakened only by great disturbance.',
        level: { min: 6, max: 8 },
        iconName: 'UserIcon',
        rarity: 'epic',
        weight: 5,
        preferredElements: ['Nature', 'Earth', 'Arcane'],
        preferredTags: ['Guardian', 'Massive', 'Ancient'],
        resistance: 'Physical',
        weakness: 'Fire',
        goldDrop: { min: 20, max: 50 },
        essenceDrop: { min: 15, max: 25 },
        specialAbilities: ['Nature\'s Wrath', 'Ancient Wisdom', 'Forest Sanctuary'],
        uniqueTraits: ['Enormous size and power', 'Commands lesser forest creatures', 'Ancient magical knowledge']
      }
    ],
    bossMonsters: [
      {
        id: 'elderoak_spirit',
        name: 'Spirit of the Elderoak',
        description: 'The ancient spirit that dwells within the great Elderoak tree, rarely seen by mortals.',
        level: { min: 8, max: 10 },
        iconName: 'UserIcon',
        rarity: 'legendary',
        weight: 1,
        preferredElements: ['Nature', 'Arcane', 'Light'],
        preferredTags: ['Ancient', 'Wise', 'Nature_Master'],
        resistance: 'Dark',
        goldDrop: { min: 50, max: 100 },
        essenceDrop: { min: 25, max: 40 },
        specialAbilities: ['Elder\'s Blessing', 'Nature\'s Judgment', 'Spirit Form'],
        uniqueTraits: ['Immense wisdom and power', 'Can phase between physical and spirit realms', 'Speaks in ancient tongues']
      }
    ],
    resources: [
      { id: 'enchanted_bark', name: 'Enchanted Bark', rarity: 'common', dropChance: 0.5 },
      { id: 'moonlit_moss', name: 'Moonlit Moss', rarity: 'uncommon', dropChance: 0.3 },
      { id: 'shadow_essence', name: 'Shadow Essence', rarity: 'rare', dropChance: 0.2 },
      { id: 'ancient_seed', name: 'Ancient Seed', rarity: 'rare', dropChance: 0.1 }
    ],
    ambientMagic: ['Nature', 'Dark', 'Arcane'],
    weatherEffects: ['Filtered sunlight', 'Mysterious fog', 'Ethereal whispers']
  },

  crystal_caves: {
    id: 'crystal_caves',
    name: 'Crystal Caves',
    description: 'Subterranean caverns where massive crystals pulse with raw magical energy.',
    theme: 'A dangerous underground realm where arcane magic flows freely and crystalline creatures dwell.',
    dangerLevel: { min: 4, max: 7 },
    environmentalEffects: [
      {
        name: 'Arcane Resonance',
        description: 'The crystals amplify magical energies, affecting spellcasting.',
        effects: [
          { type: 'statModifier', amount: 1, chance: 1.0 }, // +1 to spell damage
          { type: 'damage', amount: 1, chance: 0.1 } // Occasional magical feedback
        ]
      }
    ],
    monsters: [
      {
        id: 'crystal_spider',
        name: 'Crystal Weaver Spider',
        description: 'A large spider with a crystalline exoskeleton that spins webs of pure magic.',
        level: { min: 4, max: 6 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 30,
        preferredElements: ['Arcane', 'Earth'],
        preferredTags: ['Web', 'Crystal'],
        resistance: 'Physical',
        weakness: 'Lightning',
        goldDrop: { min: 8, max: 18 },
        essenceDrop: { min: 6, max: 12 },
        specialAbilities: ['Crystal Web', 'Shard Shot'],
        uniqueTraits: ['Creates magical web traps', 'Crystalline armor provides protection']
      },
      {
        id: 'mana_wraith',
        name: 'Mana Wraith',
        description: 'A ghostly entity formed from concentrated magical energy, hungry for more mana.',
        level: { min: 5, max: 7 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 25,
        preferredElements: ['Arcane', 'Dark'],
        preferredTags: ['Drain', 'Incorporeal'],
        resistance: 'Physical',
        weakness: 'Light',
        goldDrop: { min: 5, max: 12 },
        essenceDrop: { min: 8, max: 15 },
        specialAbilities: ['Mana Drain', 'Spectral Touch'],
        uniqueTraits: ['Feeds on magical energy', 'Partially incorporeal']
      },
      {
        id: 'crystal_golem',
        name: 'Crystal Golem',
        description: 'An animated construct of pure crystal, powered by the cave\'s magical energies.',
        level: { min: 6, max: 8 },
        iconName: 'UserIcon',
        rarity: 'rare',
        weight: 15,
        preferredElements: ['Earth', 'Arcane'],
        preferredTags: ['Construct', 'Massive', 'Crystal'],
        resistance: 'Arcane',
        weakness: 'Physical',
        goldDrop: { min: 15, max: 30 },
        essenceDrop: { min: 10, max: 18 },
        specialAbilities: ['Crystal Slam', 'Arcane Overload'],
        uniqueTraits: ['Extremely durable crystalline body', 'Can channel cave\'s magical energy']
      },
      {
        id: 'arcane_elemental',
        name: 'Primordial Arcane Elemental',
        description: 'A being of pure magical force, constantly shifting between different arcane manifestations.',
        level: { min: 7, max: 9 },
        iconName: 'UserIcon',
        rarity: 'epic',
        weight: 10,
        preferredElements: ['Arcane', 'Lightning', 'Fire', 'Ice'],
        preferredTags: ['Elemental', 'Shapeshifting', 'Primordial'],
        resistance: 'Arcane',
        goldDrop: { min: 25, max: 50 },
        essenceDrop: { min: 20, max: 30 },
        specialAbilities: ['Elemental Shift', 'Arcane Storm', 'Mana Burn'],
        uniqueTraits: ['Changes elemental affinity mid-combat', 'Pure magical essence', 'Ancient and powerful']
      }
    ],
    bossMonsters: [
      {
        id: 'crystal_dragon',
        name: 'Prismatic Crystal Dragon',
        description: 'An ancient dragon whose scales have crystallized over millennia, now one with the cave itself.',
        level: { min: 12, max: 15 },
        iconName: 'UserIcon',
        rarity: 'legendary',
        weight: 1,
        preferredElements: ['Arcane', 'Earth', 'Light'],
        preferredTags: ['Dragon', 'Ancient', 'Crystal_Master'],
        resistance: 'Physical',
        weakness: 'Dark',
        goldDrop: { min: 100, max: 200 },
        essenceDrop: { min: 50, max: 75 },
        specialAbilities: ['Prismatic Breath', 'Crystal Meteor', 'Draconic Presence'],
        uniqueTraits: ['Legendary dragon with crystalline powers', 'Master of all crystal magic', 'Guardian of the deepest caves']
      }
    ],
    resources: [
      { id: 'raw_crystal', name: 'Raw Crystal', rarity: 'common', dropChance: 0.7 },
      { id: 'arcane_crystal', name: 'Arcane Crystal', rarity: 'uncommon', dropChance: 0.4 },
      { id: 'mana_shard', name: 'Mana Shard', rarity: 'rare', dropChance: 0.2 },
      { id: 'prismatic_gem', name: 'Prismatic Gem', rarity: 'rare', dropChance: 0.05 }
    ],
    ambientMagic: ['Arcane', 'Earth', 'Lightning'],
    weatherEffects: ['Pulsing crystal light', 'Magical echoes', 'Arcane energy surges']
  },

  mountain_peaks: {
    id: 'mountain_peaks',
    name: 'Dragonspine Peaks',
    description: 'Towering mountain peaks where the air is thin and dragons are said to nest.',
    theme: 'A harsh, high-altitude environment where only the strongest creatures survive.',
    dangerLevel: { min: 5, max: 9 },
    environmentalEffects: [
      {
        name: 'Thin Air',
        description: 'The high altitude makes breathing difficult and magic unstable.',
        effects: [
          { type: 'statModifier', amount: -1, chance: 1.0 }, // -1 to speed
          { type: 'damage', amount: 2, chance: 0.15 } // Altitude sickness
        ]
      }
    ],
    monsters: [
      {
        id: 'frost_giant',
        name: 'Mountain Frost Giant',
        description: 'A towering giant adapted to the freezing mountain climate, wielding massive ice weapons.',
        level: { min: 6, max: 8 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 20,
        preferredElements: ['Ice', 'Physical'],
        preferredTags: ['Giant', 'Frost', 'Massive'],
        resistance: 'Ice',
        weakness: 'Fire',
        goldDrop: { min: 20, max: 40 },
        essenceDrop: { min: 15, max: 25 },
        specialAbilities: ['Frost Slam', 'Ice Armor'],
        uniqueTraits: ['Enormous size and strength', 'Natural resistance to cold']
      },
      {
        id: 'wind_elemental',
        name: 'Howling Wind Elemental',
        description: 'A creature of pure wind and storm, manifesting in the mountain\'s fierce weather.',
        level: { min: 5, max: 7 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 25,
        preferredElements: ['Air', 'Lightning'],
        preferredTags: ['Elemental', 'Flying', 'Storm'],
        resistance: 'Physical',
        weakness: 'Earth',
        goldDrop: { min: 10, max: 25 },
        essenceDrop: { min: 12, max: 20 },
        specialAbilities: ['Gust Attack', 'Lightning Strike'],
        uniqueTraits: ['Moves with incredible speed', 'Can control local weather patterns']
      },
      {
        id: 'stone_wyvern',
        name: 'Stone-scaled Wyvern',
        description: 'A lesser dragon with stone-like scales, making its lair in the mountain crags.',
        level: { min: 7, max: 9 },
        iconName: 'UserIcon',
        rarity: 'rare',
        weight: 15,
        preferredElements: ['Earth', 'Fire'],
        preferredTags: ['Dragon', 'Flying', 'Stone'],
        resistance: 'Physical',
        weakness: 'Ice',
        goldDrop: { min: 30, max: 60 },
        essenceDrop: { min: 20, max: 35 },
        specialAbilities: ['Stone Breath', 'Aerial Dive'],
        uniqueTraits: ['Flight capabilities', 'Incredibly tough stone scales']
      }
    ],
    bossMonsters: [
      {
        id: 'ancient_dragon',
        name: 'Pyrethon the Ancient',
        description: 'An ancient red dragon that has claimed these peaks as its domain for centuries.',
        level: { min: 15, max: 18 },
        iconName: 'UserIcon',
        rarity: 'legendary',
        weight: 1,
        preferredElements: ['Fire', 'Physical'],
        preferredTags: ['Ancient', 'Dragon', 'Fire_Master'],
        resistance: 'Fire',
        weakness: 'Ice',
        goldDrop: { min: 200, max: 500 },
        essenceDrop: { min: 75, max: 100 },
        specialAbilities: ['Inferno Breath', 'Dragon Fear', 'Ancient Magic'],
        uniqueTraits: ['Legendary ancient dragon', 'Immense magical and physical power', 'Centuries of accumulated treasure']
      }
    ],
    resources: [
      { id: 'mountain_stone', name: 'Mountain Stone', rarity: 'common', dropChance: 0.6 },
      { id: 'wind_essence', name: 'Wind Essence', rarity: 'uncommon', dropChance: 0.3 },
      { id: 'dragon_scale', name: 'Dragon Scale', rarity: 'rare', dropChance: 0.1 },
      { id: 'ancient_fossil', name: 'Ancient Fossil', rarity: 'rare', dropChance: 0.08 }
    ],
    ambientMagic: ['Fire', 'Earth', 'Air'],
    weatherEffects: ['Howling winds', 'Snow storms', 'Brilliant sunlight on peaks']
  },

  shadowy_marshland: {
    id: 'shadowy_marshland',
    name: 'Shadowmere Marshlands',
    description: 'Dark, misty swamplands where the boundary between life and death grows thin.',
    theme: 'A haunted wetland filled with undead creatures and poisonous flora.',
    dangerLevel: { min: 3, max: 6 },
    environmentalEffects: [
      {
        name: 'Toxic Miasma',
        description: 'Poisonous gases seep from the marsh, affecting the living.',
        effects: [
          { type: 'damage', amount: 1, chance: 0.2 },
          { type: 'statusEffect', chance: 0.15, duration: 2 }
        ]
      }
    ],
    monsters: [
      {
        id: 'bog_zombie',
        name: 'Marsh Zombie',
        description: 'The reanimated corpse of a traveler who perished in the treacherous marshland.',
        level: { min: 3, max: 5 },
        iconName: 'UserIcon',
        rarity: 'common',
        weight: 35,
        preferredElements: ['Dark', 'Poison'],
        preferredTags: ['Undead', 'Shambling', 'Poison'],
        resistance: 'Poison',
        weakness: 'Light',
        goldDrop: { min: 2, max: 8 },
        essenceDrop: { min: 4, max: 8 },
        specialAbilities: ['Infectious Bite', 'Shambling Swarm'],
        uniqueTraits: ['Immune to poison', 'Slow but relentless']
      },
      {
        id: 'swamp_witch',
        name: 'Bog Witch',
        description: 'A hag who has made the marsh her domain, brewing potions from its toxic flora.',
        level: { min: 5, max: 7 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 20,
        preferredElements: ['Dark', 'Poison', 'Nature'],
        preferredTags: ['Witch', 'Curse', 'Potion'],
        resistance: 'Poison',
        weakness: 'Light',
        goldDrop: { min: 15, max: 30 },
        essenceDrop: { min: 10, max: 18 },
        specialAbilities: ['Poison Brew', 'Hex Curse', 'Swamp Control'],
        uniqueTraits: ['Master of marsh magic', 'Creates powerful curses and potions']
      },
      {
        id: 'spectral_hound',
        name: 'Spectral Marsh Hound',
        description: 'The ghostly remains of a hunting dog, forever searching the marsh for its lost master.',
        level: { min: 4, max: 6 },
        iconName: 'UserIcon',
        rarity: 'uncommon',
        weight: 25,
        preferredElements: ['Dark', 'Psychic'],
        preferredTags: ['Ghost', 'Hunting', 'Pack'],
        resistance: 'Physical',
        weakness: 'Light',
        goldDrop: { min: 5, max: 15 },
        essenceDrop: { min: 8, max: 16 },
        specialAbilities: ['Spectral Howl', 'Phase Strike'],
        uniqueTraits: ['Partially incorporeal', 'Can track across dimensions']
      }
    ],
    resources: [
      { id: 'marsh_gas', name: 'Marsh Gas', rarity: 'common', dropChance: 0.5 },
      { id: 'bog_flower', name: 'Poisonous Bog Flower', rarity: 'uncommon', dropChance: 0.3 },
      { id: 'spectral_essence', name: 'Spectral Essence', rarity: 'rare', dropChance: 0.2 },
      { id: 'witch_ingredient', name: 'Rare Witch Ingredient', rarity: 'rare', dropChance: 0.1 }
    ],
    ambientMagic: ['Dark', 'Poison', 'Psychic'],
    weatherEffects: ['Thick fog', 'Drizzling rain', 'Eerie silence']
  }
};

// Helper function to get a biome by location
export const getBiomeForLocation = (locationId: string): BiomeData | null => {
  // Map locations to biomes
  const locationBiomeMap: Record<string, string> = {
    'eldergrove': 'peaceful_valley',
    'whispering_woods': 'whispering_woods',
    'crystal_caves': 'crystal_caves',
    'ironhold': 'mountain_peaks',
    'dragonspine_peaks': 'mountain_peaks',
    'ancient_battlefield': 'shadowy_marshland',
    'shadowmere_marsh': 'shadowy_marshland'
  };

  const biomeId = locationBiomeMap[locationId];
  return biomeId ? BIOMES[biomeId] : null;
};

// Helper function to select a random monster from a biome
export const selectRandomMonster = (biome: BiomeData, playerLevel: number): BiomeMonster | null => {
  const suitableMonsters = biome.monsters.filter(monster => 
    monster.level.min <= playerLevel + 2 && monster.level.max >= playerLevel - 1
  );

  if (suitableMonsters.length === 0) return null;

  // Weighted random selection
  const totalWeight = suitableMonsters.reduce((sum, monster) => sum + monster.weight, 0);
  let random = Math.random() * totalWeight;

  for (const monster of suitableMonsters) {
    random -= monster.weight;
    if (random <= 0) {
      return monster;
    }
  }

  return suitableMonsters[0]; // Fallback
};

// Helper function to generate environmental effects for a location
export const getEnvironmentalEffects = (locationId: string): string[] => {
  const biome = getBiomeForLocation(locationId);
  if (!biome) return [];

  const effects: string[] = [];
  
  if (biome.environmentalEffects) {
    biome.environmentalEffects.forEach(effect => {
      if (Math.random() < 0.3) { // 30% chance for each environmental effect
        effects.push(`${effect.name}: ${effect.description}`);
      }
    });
  }

  if (biome.weatherEffects && biome.weatherEffects.length > 0) {
    const randomWeather = biome.weatherEffects[Math.floor(Math.random() * biome.weatherEffects.length)];
    effects.push(`Weather: ${randomWeather}`);
  }

  return effects;
}; 