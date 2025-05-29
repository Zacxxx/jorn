
import { SpellComponent } from '../types';

export const ARCANE_MODIFIER_1: SpellComponent = {
  id: 'arcane-modifier-1',
  name: 'Focusing Lens',
  description: 'A simple arcane lens that helps concentrate magical energies, slightly boosting power.',
  iconName: 'AtomIcon',
  category: 'PrimaryEffect',
  tier: 1,
  researchRequirements: {
    gold: 20,
    essence: 10, 
    items: [{ itemId: 'res_arcane_dust_001', type: 'Arcane Dust', quantity: 3 }],
    requiredLevel: 3,
  },
  baseEffects: [
    { type: 'ADD_BASE_DAMAGE', value: 2 },
    { type: 'SET_SCALING_STAT', value: 'Mind' },
    { type: 'ADD_NAME_FRAGMENT', value: 'Focused' },
    { type: 'ADD_DESCRIPTION_FRAGMENT', value: 'concentrated power.'},
    { type: 'ADD_TAG', tagName: 'Amplification' }
  ],
  configurableParameters: [
    { key: 'intensity', label: 'Intensity', type: 'slider', min: 1, max: 5, step: 1, defaultValue: 2, costInfluenceFactor: 0.2 }
  ],
  rarity: 2,
  element: 'Arcane', 
  tags: ['Amplification', 'Scaling'],
  manaCost: 1, 
};
