
import { ElementName, TagName, StatusEffectName } from '../../../types';

// This file defines specific effects or interactions tied to elements.
// For example, innate tags, damage modifications, or synergies/counters.

export interface ElementEffectDetails {
    innateTags?: TagName[]; // Tags inherently associated with this element
    damageMultiplierVs?: Partial<Record<ElementName, number>>; // e.g., Fire does 1.5x to Ice
    resistanceBonusFrom?: Partial<Record<ElementName, number>>; // e.g., Fire takes 0.5x damage from Fire element attacks
    statusEffectOnHit?: { // Chance to apply a status when this element hits
        status: StatusEffectName; // The status effect to apply (e.g. 'BurningDoTActive' for fire)
        chance: number; // 0-100
        duration?: number;
        magnitude?: number;
    };
    description?: string; // General description of the element's properties
}

export const ELEMENT_EFFECT_MAP: Partial<Record<ElementName, ElementEffectDetails>> = {
    Fire: {
        innateTags: ['Fire', 'BurnDoT'],
        damageMultiplierVs: { Ice: 1.5, Nature: 1.2 },
        resistanceBonusFrom: { Fire: 0.5 },
        statusEffectOnHit: { status: 'BurningDoTActive', chance: 30, duration: 2, magnitude: 3},
        description: "Deals burning damage over time and is strong against Ice and Nature."
    },
    Ice: {
        innateTags: ['Ice', 'FrostbiteDoT', 'Stun'],
        damageMultiplierVs: { Air: 1.2, Earth: 1.2 }, // Example: Ice cracks earth
        resistanceBonusFrom: { Ice: 0.5, Fire: -0.5 }, // Takes more from Fire
        statusEffectOnHit: { status: 'FrostbittenDoTActive', chance: 25, duration: 3, magnitude: 2}, // Example: Can cause Freeze (Stun)
        description: "Can slow or freeze targets, effective against Air and Earth."
    },
    Lightning: {
        innateTags: ['Lightning', 'ShockDoT'],
        damageMultiplierVs: { Air: 0.7 }, // Removed Water
        resistanceBonusFrom: { Lightning: 0.5 },
        statusEffectOnHit: { status: 'ShockedDoTActive', chance: 20, duration: 2, magnitude: 2 },
        description: "Fast and erratic, can shock enemies, disrupting actions."
    },
    Earth: {
        innateTags: ['Earth', 'PhysicalNeutral'], // Earth can be physical
        damageMultiplierVs: { Lightning: 1.3 },
        resistanceBonusFrom: { Earth: 0.5, PhysicalNeutral: 0.2, Lightning: -0.3 },
        description: "Solid and resilient, strong against Lightning."
    },
    Air: {
        innateTags: ['Air'],
        damageMultiplierVs: { Earth: 0.7 },
        resistanceBonusFrom: { Air: 0.3 },
        description: "Swift and evasive, can buffet foes."
    },
    Light: {
        innateTags: ['Light', 'HealingSource'], // Light can be tied to healing
        damageMultiplierVs: { Dark: 1.5 },
        resistanceBonusFrom: { Light: 0.3, Dark: -0.3 },
        description: "Pure energy, often associated with healing and banishing darkness."
    },
    Dark: {
        innateTags: ['Dark', 'CorruptionDoT'],
        damageMultiplierVs: { Light: 1.5, Arcane: 1.2 },
        resistanceBonusFrom: { Dark: 0.3, Light: -0.3 },
        description: "Shadowy power, often drains life or corrupts."
    },
    Arcane: {
        innateTags: ['Arcane'],
        // Arcane might be neutral or have complex interactions
        resistanceBonusFrom: { Arcane: 0.2 },
        description: "Raw magical energy, versatile and unpredictable."
    },
    Nature: {
        innateTags: ['Nature', 'PoisonDoT', 'HealOverTime'],
        damageMultiplierVs: { PoisonSource: 1.2 }, // Nature can amplify poisons
        resistanceBonusFrom: { Nature: 0.3, PoisonSource: 0.2 },
        description: "Life energy, can heal, entangle, or poison."
    },
    PhysicalNeutral: {
        innateTags: ['PhysicalNeutral'],
        // No specific elemental strengths/weaknesses by default
        description: "Represents standard physical force."
    },
    PoisonSource: {
        innateTags: ['PoisonSource', 'PoisonDoT'],
        damageMultiplierVs: { Nature: 0.8 }, // Nature might resist raw poison
        statusEffectOnHit: { status: 'PoisonDoTActive', chance: 40, duration: 3, magnitude: 4},
        description: "Concentrated toxins that inflict damage over time."
    },
    HealingSource: {
        innateTags: ['HealingSource', 'HealOverTime'],
        // Typically doesn't deal damage
        description: "Restorative energies that mend wounds."
    }
};

console.log("Element effects loaded.", ELEMENT_EFFECT_MAP);
