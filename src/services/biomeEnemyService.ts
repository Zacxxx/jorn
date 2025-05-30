import { GeneratedEnemyData, SpellIconName, ElementName } from '../types';
import { getBiomeForLocation, selectRandomMonster, BiomeMonster, BiomeData } from '../data/biomes';
import { ENEMY_DIFFICULTY_XP_REWARD } from '../../constants';

// Enhanced enemy generation that uses biome data
export async function generateBiomeEnemy(playerLevel: number, locationId: string): Promise<GeneratedEnemyData> {
  const biome = getBiomeForLocation(locationId);
  
  if (!biome) {
    // Fallback to standard generation if no biome found
    return generateStandardEnemy(playerLevel);
  }

  const selectedMonster = selectRandomMonster(biome, playerLevel);
  
  if (!selectedMonster) {
    // Fallback if no suitable monster found
    return generateStandardEnemy(playerLevel);
  }

  return generateEnemyFromBiomeMonster(selectedMonster, playerLevel, biome);
}

// Generate enemy from biome monster template
function generateEnemyFromBiomeMonster(
  monster: BiomeMonster, 
  playerLevel: number, 
  biome: BiomeData
): GeneratedEnemyData {
  // Calculate level within monster's range, influenced by player level
  const monsterLevel = Math.max(
    monster.level.min,
    Math.min(monster.level.max, playerLevel + Math.floor(Math.random() * 3) - 1)
  );

  // Determine if this is an elite variant
  const isElite = monster.rarity === 'epic' || monster.rarity === 'legendary' || 
                  (monster.rarity === 'rare' && Math.random() < 0.3) ||
                  Math.random() < 0.05; // Small chance for any monster to be elite

  // Calculate base stats influenced by level and rarity
  const statMultiplier = getStatMultiplierForRarity(monster.rarity);
  const eliteMultiplier = isElite ? 1.5 : 1.0;
  
  const baseBody = Math.floor((8 + monsterLevel * 1.5) * statMultiplier * eliteMultiplier);
  const baseMind = Math.floor((8 + monsterLevel * 1.2) * statMultiplier * eliteMultiplier);
  const baseReflex = Math.floor((6 + monsterLevel * 1.0) * statMultiplier * eliteMultiplier);
  
  // Calculate HP based on level and body stat
  const baseHp = Math.floor((40 + monsterLevel * 15 + baseBody * 2) * eliteMultiplier);
  
  // Generate name with potential elite prefix
  const name = isElite ? generateEliteName(monster.name, monster.rarity) : generateVariantName(monster.name);
  
  // Enhanced description incorporating biome theme
  const description = enhanceDescription(monster.description, biome.theme, isElite);
  
  // Determine special abilities
  const specialAbilities = generateSpecialAbilities(monster, biome, isElite);
  
  // Calculate rewards
  const rewards = calculateRewards(monsterLevel, monster.rarity, isElite);
  
  return {
    name,
    description,
    hp: baseHp,
    level: monsterLevel,
    baseBody,
    baseMind,
    baseReflex,
    baseSpeed: 5 + Math.floor(baseReflex * 0.4),
    specialAbilityName: specialAbilities.name,
    specialAbilityDescription: specialAbilities.description,
    weakness: monster.weakness,
    resistance: monster.resistance,
    iconName: monster.iconName,
    goldDrop: rewards.gold,
    essenceDrop: rewards.essence,
    isElite,
    droppedResources: generateBiomeResources(biome, monster.rarity, isElite)
  };
}

// Generate variant names for monsters
function generateVariantName(baseName: string): string {
  const prefixes = [
    'Young', 'Adult', 'Elder', 'Wild', 'Fierce', 'Cunning', 'Stalking', 'Prowling',
    'Hungry', 'Territorial', 'Aggressive', 'Wounded', 'Veteran', 'Battle-scarred'
  ];
  
  const suffixes = [
    '', '', '', '', // Empty strings for no suffix (higher probability)
    ' Scout', ' Hunter', ' Guardian', ' Sentinel', ' Warrior'
  ];
  
  if (Math.random() < 0.3) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix} ${baseName}`;
  }
  
  if (Math.random() < 0.2) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${baseName}${suffix}`;
  }
  
  return baseName;
}

// Generate elite names
function generateEliteName(baseName: string, rarity: string): string {
  const elitePrefixes = {
    common: ['Veteran', 'Elite'],
    uncommon: ['Champion', 'Elite', 'Alpha'],
    rare: ['Ancient', 'Mighty', 'Legendary'],
    epic: ['Legendary', 'Mythic', 'Ancient'],
    legendary: ['Primordial', 'Divine', 'Eternal']
  };
  
  const prefixList = elitePrefixes[rarity as keyof typeof elitePrefixes] || elitePrefixes.common;
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  
  return `${prefix} ${baseName}`;
}

// Get stat multiplier based on rarity
function getStatMultiplierForRarity(rarity: string): number {
  switch (rarity) {
    case 'legendary': return 2.0;
    case 'epic': return 1.7;
    case 'rare': return 1.4;
    case 'uncommon': return 1.2;
    case 'common':
    default: return 1.0;
  }
}

// Enhance description with biome and elite information
function enhanceDescription(baseDescription: string, biomeTheme: string, isElite: boolean): string {
  let enhanced = baseDescription;
  
  // Add biome context
  if (Math.random() < 0.5) {
    const biomeAdditions = [
      `This creature has adapted well to ${biomeTheme.toLowerCase()}.`,
      `Living in ${biomeTheme.toLowerCase()} has shaped its nature.`,
      `The environment of ${biomeTheme.toLowerCase()} has influenced its behavior.`
    ];
    enhanced += ` ${biomeAdditions[Math.floor(Math.random() * biomeAdditions.length)]}`;
  }
  
  // Add elite context
  if (isElite) {
    const eliteAdditions = [
      ' This specimen is particularly powerful and experienced.',
      ' Years of survival have made this creature exceptionally dangerous.',
      ' This is a rare and formidable example of its species.',
      ' Its presence commands respect and fear from lesser creatures.'
    ];
    enhanced += eliteAdditions[Math.floor(Math.random() * eliteAdditions.length)];
  }
  
  return enhanced;
}

// Generate special abilities based on monster and biome
function generateSpecialAbilities(monster: BiomeMonster, biome: BiomeData, isElite: boolean): { name: string; description: string } {
  // Use existing special abilities if available
  if (monster.specialAbilities && monster.specialAbilities.length > 0) {
    const ability = monster.specialAbilities[Math.floor(Math.random() * monster.specialAbilities.length)];
    return {
      name: ability,
      description: `A special ability unique to ${monster.name.toLowerCase()}s.`
    };
  }
  
  // Generate abilities based on preferred elements and tags
  if (monster.preferredElements && monster.preferredElements.length > 0) {
    const element = monster.preferredElements[Math.floor(Math.random() * monster.preferredElements.length)];
    return generateElementalAbility(element, isElite);
  }
  
  // Generate abilities based on preferred tags
  if (monster.preferredTags && monster.preferredTags.length > 0) {
    const tag = monster.preferredTags[Math.floor(Math.random() * monster.preferredTags.length)];
    return generateTagBasedAbility(tag, isElite);
  }
  
  // Fallback generic ability
  return {
    name: isElite ? 'Elite Strike' : 'Natural Attack',
    description: isElite ? 'A devastating attack honed through experience.' : 'A basic natural attack.'
  };
}

// Generate elemental abilities
function generateElementalAbility(element: ElementName, isElite: boolean): { name: string; description: string } {
  const abilities = {
    Fire: { name: 'Flame Burst', description: 'Erupts with intense fire damage.' },
    Ice: { name: 'Frost Bite', description: 'Freezes enemies with chilling cold.' },
    Lightning: { name: 'Lightning Strike', description: 'Channels electricity for shocking damage.' },
    Earth: { name: 'Stone Slam', description: 'Strikes with the force of stone.' },
    Air: { name: 'Wind Gust', description: 'Creates powerful wind attacks.' },
    Light: { name: 'Radiant Beam', description: 'Channels pure light energy.' },
    Dark: { name: 'Shadow Drain', description: 'Drains life force with dark magic.' },
    Arcane: { name: 'Mana Burn', description: 'Burns away magical energy.' },
    Nature: { name: 'Thorn Volley', description: 'Launches sharp natural projectiles.' },
    Poison: { name: 'Toxic Cloud', description: 'Spreads poisonous miasma.' }
  };
  
  const baseAbility = abilities[element] || abilities.Fire;
  
  if (isElite) {
    return {
      name: `Greater ${baseAbility.name}`,
      description: `An enhanced version: ${baseAbility.description.toLowerCase()}`
    };
  }
  
  return baseAbility;
}

// Generate tag-based abilities
function generateTagBasedAbility(tag: string, isElite: boolean): { name: string; description: string } {
  const abilities = {
    Stealth: { name: 'Shadow Step', description: 'Becomes briefly invisible.' },
    Pack: { name: 'Pack Call', description: 'Calls for aid from nearby allies.' },
    Flying: { name: 'Aerial Dive', description: 'Attacks from above with great force.' },
    Regeneration: { name: 'Rapid Healing', description: 'Quickly regenerates health.' },
    Web: { name: 'Entangling Web', description: 'Traps enemies in sticky webs.' },
    Crystal: { name: 'Crystal Armor', description: 'Hardens crystalline defenses.' },
    Poison: { name: 'Venom Spit', description: 'Spits toxic venom at enemies.' },
    Undead: { name: 'Life Drain', description: 'Drains life force from the living.' }
  };
  
  const baseAbility = abilities[tag as keyof typeof abilities] || { name: 'Special Attack', description: 'A unique natural ability.' };
  
  if (isElite) {
    return {
      name: `Enhanced ${baseAbility.name}`,
      description: `An empowered version: ${baseAbility.description.toLowerCase()}`
    };
  }
  
  return baseAbility;
}

// Calculate rewards based on level, rarity, and elite status
function calculateRewards(level: number, rarity: string, isElite: boolean) {
  const difficulty = level < 3 ? 'easy' : level < 7 ? 'medium' : 'hard';
  const baseRewards = ENEMY_DIFFICULTY_XP_REWARD[difficulty];
  
  // Rarity multipliers
  const rarityMultipliers = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0
  };
  
  const rarityMult = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1.0;
  const eliteMult = isElite ? (ENEMY_DIFFICULTY_XP_REWARD.elite?.gold_multiplier || 1.5) : 1.0;
  
  const goldMin = Math.floor(baseRewards.goldMin * rarityMult * eliteMult);
  const goldMax = Math.floor(baseRewards.goldMax * rarityMult * eliteMult);
  const essenceMin = Math.floor(baseRewards.essenceMin * rarityMult * eliteMult);
  const essenceMax = Math.floor(baseRewards.essenceMax * rarityMult * eliteMult);
  
  return {
    gold: { min: goldMin, max: goldMax },
    essence: { min: Math.max(1, essenceMin), max: Math.max(2, essenceMax) }
  };
}

// Generate biome-specific resources
function generateBiomeResources(biome: BiomeData, rarity: string, isElite: boolean) {
  const resourceCount = isElite ? 3 : (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') ? 2 : 1;
  const resources = [];
  
  // Select appropriate resources from biome
  const availableResources = biome.resources.filter(resource => {
    if (rarity === 'common' && resource.rarity === 'rare') return false;
    if (rarity === 'uncommon' && resource.rarity === 'rare' && !isElite) return false;
    return true;
  });
  
  for (let i = 0; i < resourceCount && i < availableResources.length; i++) {
    const resource = availableResources[Math.floor(Math.random() * availableResources.length)];
    if (Math.random() < resource.dropChance) {
      resources.push({
        itemId: resource.id,
        quantity: isElite ? 2 : 1,
        type: resource.name
      });
    }
  }
  
  return resources;
}

// Fallback standard enemy generation
function generateStandardEnemy(playerLevel: number): GeneratedEnemyData {
  const difficulty = playerLevel < 3 ? 'easy' : playerLevel < 7 ? 'medium' : 'hard';
  const isElite = Math.random() < 0.1;
  
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);
  const baseRewards = ENEMY_DIFFICULTY_XP_REWARD[difficulty];
  
  return {
    name: 'Wandering Creature',
    description: 'A mysterious creature found wandering the lands.',
    hp: 30 + level * 10,
    level,
    baseBody: 8 + level,
    baseMind: 8 + level,
    baseReflex: 6 + level,
    baseSpeed: 8 + Math.floor(level * 0.5),
    iconName: 'UserIcon' as SpellIconName,
    goldDrop: { min: baseRewards.goldMin, max: baseRewards.goldMax },
    essenceDrop: { min: baseRewards.essenceMin, max: baseRewards.essenceMax },
    isElite,
    droppedResources: []
  };
} 