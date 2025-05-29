
import { SpellComponent } from '../types';

export const DELIVERY_PROJECTILE_1: SpellComponent = {
  id: 'delivery-projectile-1',
  name: 'Basic Projectile',
  description: 'Shapes the spell into a simple magical bolt.',
  iconName: 'ArcaneBlast',
  category: 'DeliveryMethod',
  tier: 1,
  researchRequirements: {
    gold: 5,
    essence: 2, // Added essence cost
    requiredLevel: 1,
  },
  baseEffects: [
    { type: 'ADD_NAME_FRAGMENT', value: 'Bolt' },
    { type: 'ADD_DESCRIPTION_FRAGMENT', value: 'It flies towards the target as a bolt.'}
  ],
  // New fields for component rework:
  rarity: 0, // Basic component
  tags: ['Projectile'],
  manaCost: 1,
  // baseResourceCost: []
};
