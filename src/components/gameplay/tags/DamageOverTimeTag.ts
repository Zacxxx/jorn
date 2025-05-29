
import { ElementName, StatusEffectName, TagName } from '../../../../types';

export interface DamageOverTimeEffectConfig {
    id: string; // Unique ID for this specific DoT type, e.g., "burn_low_armor_shred"
    tagName: TagName; // e.g., 'BurnDoT'
    statusEffectName: StatusEffectName; // e.g., 'BurningDoTActive'
    baseDamagePerTurn: number;
    baseDuration: number;
    damageType: ElementName;
    scalingStat?: 'Mind' | 'Body'; // How the damage scales
    
    // Optional additional effects triggered by this DoT
    additionalEffects?: {
        chance?: number; // 0-100
        effect: () => void; // Placeholder for more complex effects like stat reduction
        description?: string;
    }[];
    
    flavorText?: string; // e.g., "Engulfs the target in searing flames."
    iconName?: string; // Suggest an icon for the status effect
}

// This file defines the structure. Specific instances (like BurningDoT) will be created
// or the AI will generate parameters for a generic DoT effect based on this.

// Example of how it might be used conceptually (not for direct execution here):
// const basicBurn: DamageOverTimeEffectConfig = {
//   id: 'basic_burn',
//   tagName: 'BurnDoT',
//   statusEffectName: 'BurningDoTActive',
//   baseDamagePerTurn: 3,
//   baseDuration: 2,
//   damageType: 'Fire',
//   scalingStat: 'Mind',
//   flavorText: 'Sears the foe with clinging fire.',
//   iconName: 'Fireball'
// };

console.log("DamageOverTimeTag.ts loaded (defines structure for DoT effects).");
