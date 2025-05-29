
import { SpellComponent } from '../types';

export const ICE_SOURCE_1: SpellComponent = {
  id: 'ice-source-1',
  name: 'Frost Spark',
  description: 'A faint chill that can be focused into a minor ice effect.',
  iconName: 'IceShard',
  category: 'ElementalCore', 
  tier: 1,
  researchRequirements: {
    gold: 15,
    essence: 7, 
    items: [
        { itemId: 'res_arcane_dust_001', type: 'Arcane Dust', quantity: 1 }, 
        { itemId: 'res_crystal_shard_001', type: 'Crystal Shard', quantity: 1 }
    ],
    requiredLevel: 2,
  },
  baseEffects: [
    { type: 'SET_ELEMENT', elementName: 'Ice' }, 
    { type: 'ADD_BASE_DAMAGE', value: 4 },
    { type: 'APPLY_STATUS_EFFECT', statusEffect: { name: 'Freeze', chance: 15, duration: 1 }, value: 0.15 },
    { type: 'SUGGEST_ICON', value: 'IceShard' },
    { type: 'ADD_NAME_FRAGMENT', value: 'Shard' },
    { type: 'ADD_DESCRIPTION_FRAGMENT', value: 'A biting shard of ice.'},
    { type: 'ADD_TAG', tagName: 'Stun'} 
  ],
  rarity: 1,
  element: 'Ice',
  tags: ['Stun', 'Ice', 'ControlTarget'],
  manaCost: 4,
  baseResourceCost: [{ itemId: 'res_crystal_shard_001', type: 'Crystal Shard', quantity: 1 }],
};
