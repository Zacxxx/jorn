
import { SpellComponent } from '../types';

export const FIRE_SOURCE_1: SpellComponent = {
  id: 'fire-source-1',
  name: 'Minor Ember',
  description: 'A small, flickering flame that provides a basic source of fire magic.',
  iconName: 'Fireball',
  category: 'ElementalCore', 
  tier: 1,
  researchRequirements: {
    gold: 10,
    essence: 5, 
    items: [{ itemId: 'res_arcane_dust_001', type: 'Arcane Dust', quantity: 2 }], // Assuming 'res_arcane_dust_001' is its ID
    requiredLevel: 1,
  },
  baseEffects: [
    { type: 'SET_ELEMENT', elementName: 'Fire' }, 
    { type: 'ADD_BASE_DAMAGE', value: 5 },
    { type: 'SUGGEST_ICON', value: 'Fireball' },
    { type: 'ADD_NAME_FRAGMENT', value: 'Ember' },
    { type: 'ADD_DESCRIPTION_FRAGMENT', value: 'A burst of small flames.'},
    { type: 'ADD_TAG', tagName: 'BurnDoT'} 
  ],
  rarity: 1, 
  element: 'Fire', 
  tags: ['BurnDoT', 'Fire'], 
  manaCost: 3, 
  baseResourceCost: [{ itemId: 'res_emberbloom_petal_001', type: 'Emberbloom Petal', quantity: 1 }], 
};
