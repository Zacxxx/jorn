
import { TagName } from '../../../types';

// This file will export all defined tags and potentially a master list.

export const ALL_TAG_NAMES: TagName[] = [
  // Status Effects
  'Stun', 'PoisonDoT', 'BurnDoT', 'BleedDoT', 'CorruptionDoT', 'FrostbiteDoT', 'RotDoT', 'ShockDoT',
  'Silence', 'Root', 'Disarm', 'Charm', 'Taunt', 'Fear', 'Levitate',
  'ManaDrain', 'Invisibility', 'DodgeChange', 'DamageResistance', 'DamageReflection',
  'ActionSpeedIncrease', 'ResourceGeneration', 'StatBoost', 'HealOverTime', 'DamageNegation',
  'Retaliation', 'Conversion', 'EffectDurationMod', 'ControlTarget', 'Amplification', 'Haste',
  // Targeting & Delivery
  'MultiTarget', 'DelayedAttack', 'SelfTarget', 'AreaOfEffect', 'Projectile',
  // Utility & Meta
  'Scaling', 'Synergy', 'Counter', 'CostReduction',
  // Elements (also treated as tags)
  'Fire', 'Ice', 'Lightning', 'Earth', 'Air', 'Light', 'Dark', 'Arcane', 'Nature',
  'PhysicalNeutral', 'PoisonSource', 'HealingSource'
];

// Example (will be moved to individual files later):
// export * from './stun';
// export * from './poisonDoT';

console.log("Tag system loaded. ALL_TAG_NAMES count:", ALL_TAG_NAMES.length);
