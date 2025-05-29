
import { DamageOverTimeEffectConfig } from './DamageOverTimeTag';
import { ElementName, StatusEffectName, TagName } from '../../../../types'; // Fixed import path

// This file could define specific, pre-designed Burning DoT effects
// or serve as a more concrete example for AI generation.

export const MILD_BURN_EFFECT: DamageOverTimeEffectConfig = {
    id: 'mild_burn_effect_01',
    tagName: 'BurnDoT',
    statusEffectName: 'BurningDoTActive',
    baseDamagePerTurn: 2,
    baseDuration: 3,
    damageType: 'Fire',
    scalingStat: 'Mind',
    flavorText: 'A persistent, irritating burn.',
    iconName: 'Fireball',
    // Example of an additional effect
    // additionalEffects: [
    //     {
    //         chance: 25, // 25% chance
    //         effect: () => { /* TODO: Implement logic to reduce target's Fire Resistance */ },
    //         description: "May slightly reduce Fire Resistance."
    //     }
    // ]
};

export const INTENSE_BURN_EFFECT: DamageOverTimeEffectConfig = {
    id: 'intense_burn_effect_01',
    tagName: 'BurnDoT',
    statusEffectName: 'BurningDoTActive',
    baseDamagePerTurn: 5,
    baseDuration: 2,
    damageType: 'Fire',
    scalingStat: 'Mind',
    flavorText: 'Engulfs the target in searing flames that cling stubbornly.',
    iconName: 'Fireball',
};

// We might not export an array if these are just examples for the AI.
// If they are usable pre-defined effects, an array might be useful.
// export const ALL_BURNING_DOT_EFFECTS = [MILD_BURN_EFFECT, INTENSE_BURN_EFFECT];

console.log("BurningDoTTag.ts loaded (example burning DoT configurations).");