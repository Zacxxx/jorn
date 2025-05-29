
import { ElementName } from '../../../types';

// This file defines the canonical list of all available elements in the game.
// These names are used for damage types, resistances, weaknesses, and elemental tags.

export const ALL_ELEMENTS: ElementName[] = [
    'Fire', 
    'Ice', 
    'Lightning', 
    'Earth', 
    'Air', 
    'Light', 
    'Dark', 
    'Arcane', 
    'Nature', 
    'PhysicalNeutral', // For non-elemental physical damage
    'PoisonSource',    // Represents the source of poison, distinct from the DoT effect itself
    'HealingSource'    // Represents the source of healing effects
];

console.log("Element list loaded. ALL_ELEMENTS count:", ALL_ELEMENTS.length);
