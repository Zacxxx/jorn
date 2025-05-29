
import { SpellComponent } from '../types';

export const EFFICIENCY_BOOSTER_1: SpellComponent = {
  id: 'efficiency-booster-1',
  name: 'Mana Thrifter',
  description: 'A component that slightly reduces the spell\'s mana cost through better energy channeling.',
  iconName: 'Gem',
  category: 'CostEfficiency',
  tier: 1,
  researchRequirements: {
    gold: 25,
    essence: 12, 
    items: [{ itemId: 'res_mystic_orb_001', type: 'Mystic Orb', quantity: 1 }],
    requiredLevel: 4,
  },
  baseEffects: [
    { type: 'MODIFY_MANA_COST_FLAT', value: -2 }, 
    { type: 'ADD_NAME_FRAGMENT', value: 'Efficient' }
  ],
  rarity: 2,
  tags: ['CostReduction'],
  baseResourceCost: [{ itemId: 'res_arcane_dust_001', type: 'Arcane Dust', quantity: 1 }] 
};
