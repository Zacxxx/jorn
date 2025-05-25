// Utility functions for syncing tags <-> spell properties
import { Spell } from './types';

/**
 * Converts a tags array to spell properties (aoe, targetType, etc.)
 * Updates the spell object in-place and returns it.
 */
export function applyTagsToSpell(spell: Spell, tags: string[]): Spell {
  // Reset relevant properties
  spell.aoe = false;
  spell.targetType = undefined;
  // Interpret tags
  if (tags.includes('AOE')) {
    spell.aoe = true;
    spell.targetType = 'aoe';
  } else if (tags.includes('Single Target')) {
    spell.aoe = false;
    spell.targetType = 'single';
  }
  // Custom tags
  spell.tags = tags.filter(t => t !== 'AOE' && t !== 'Single Target');
  return spell;
}

/**
 * Converts spell properties to a tags array (for UI selectors)
 */
export function getTagsFromSpell(spell: Spell): string[] {
  const tags: string[] = [];
  if (spell.aoe || spell.targetType === 'aoe') tags.push('AOE');
  else if (spell.targetType === 'single') tags.push('Single Target');
  if (Array.isArray(spell.tags)) tags.push(...spell.tags);
  return tags;
}
