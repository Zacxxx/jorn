#!/usr/bin/env node

/**
 * Spell Crafting Test Suite
 * Tests the spell crafting system to identify resource deduction issues
 */

// Mock the required modules and types
const mockPlayer = {
  id: 'test-player',
  name: 'Test Hero',
  level: 5,
  gold: 1000,
  essence: 100,
  inventory: {
    'res_arcane_dust_001': 10,
    'res_crystal_shard_001': 5,
    'res_elemental_essence_001': 8,
    'res_mystic_herb_001': 12,
    'arcane_dust': 3,
    'crystal_shard': 2,
    'elemental_essence': 4
  },
  spells: [],
  discoveredComponents: [
    {
      id: 'comp_fire_core',
      name: 'Fire Core',
      category: 'ElementalCore',
      tier: 2,
      usageGoldCost: 50,
      usageEssenceCost: 10,
      baseResourceCost: [
        { itemId: 'res_arcane_dust_001', quantity: 2, type: 'Arcane Dust' }
      ]
    }
  ]
};

const mockDesignData = {
  level: 3,
  componentsUsed: [
    {
      componentId: 'comp_fire_core',
      configuration: {}
    }
  ],
  investedResources: [
    { itemId: 'res_crystal_shard_001', quantity: 1, type: 'Crystal Shard' }
  ],
  playerName: 'Test Fireball',
  playerDescription: 'A test spell',
  playerPrompt: 'A simple fire spell for testing'
};

// Mock AI response
const mockAISpellData = {
  name: 'Test Fireball',
  description: 'A test fire spell',
  iconName: 'FireIcon',
  manaCost: 15,
  damage: 25,
  damageType: 'Fire',
  scalesWith: 'Mind',
  resourceCost: [
    { itemId: 'res_elemental_essence_001', quantity: 2, type: 'Elemental Essence' }
  ],
  tags: ['Fire', 'Damage'],
  rarity: 2,
  level: 3
};

// Test functions
function testResourceMapping() {
  console.log('\n=== Testing Resource Mapping ===');
  
  const resourceTypes = ['Arcane Dust', 'Crystal Shard', 'Elemental Essence', 'Mystic Herb'];
  
  resourceTypes.forEach(type => {
    console.log(`\nTesting resource type: "${type}"`);
    
    // Test mapping function (simulated)
    const mappedId = mapResourceTypeToInventoryId(type);
    console.log(`  Mapped to ID: ${mappedId}`);
    
    // Check if player has this resource
    const playerHas = mockPlayer.inventory[mappedId] || 0;
    console.log(`  Player has: ${playerHas}`);
    
    // Test alternative IDs
    const alternativeIds = getAlternativeIds(type);
    console.log(`  Alternative IDs: ${alternativeIds.join(', ')}`);
    
    alternativeIds.forEach(altId => {
      const altAmount = mockPlayer.inventory[altId] || 0;
      if (altAmount > 0) {
        console.log(`    Found ${altAmount} of ${altId}`);
      }
    });
  });
}

function mapResourceTypeToInventoryId(type) {
  const mapping = {
    'Arcane Dust': 'res_arcane_dust_001',
    'Crystal Shard': 'res_crystal_shard_001', 
    'Elemental Essence': 'res_elemental_essence_001',
    'Mystic Herb': 'res_mystic_herb_001'
  };
  return mapping[type] || type.toLowerCase().replace(/\s+/g, '_');
}

function getAlternativeIds(type) {
  const alternatives = {
    'Arcane Dust': ['res_arcane_dust_001', 'arcane_dust', 'arcanedust'],
    'Crystal Shard': ['res_crystal_shard_001', 'crystal_shard', 'crystalshard'],
    'Elemental Essence': ['res_elemental_essence_001', 'elemental_essence', 'elementalessence'],
    'Mystic Herb': ['res_mystic_herb_001', 'mystic_herb', 'mysticherb']
  };
  return alternatives[type] || [type.toLowerCase().replace(/\s+/g, '_')];
}

function testResourceChecking() {
  console.log('\n=== Testing Resource Checking ===');
  
  const testCosts = [
    { itemId: 'res_arcane_dust_001', quantity: 2, type: 'Arcane Dust' },
    { itemId: 'res_crystal_shard_001', quantity: 1, type: 'Crystal Shard' },
    { itemId: 'res_elemental_essence_001', quantity: 2, type: 'Elemental Essence' },
    { itemId: 'nonexistent_item', quantity: 1, type: 'Fake Resource' }
  ];
  
  testCosts.forEach(cost => {
    console.log(`\nChecking cost: ${cost.quantity} ${cost.type} (${cost.itemId})`);
    
    const playerHas = mockPlayer.inventory[cost.itemId] || 0;
    const canAfford = playerHas >= cost.quantity;
    
    console.log(`  Player has: ${playerHas}`);
    console.log(`  Needs: ${cost.quantity}`);
    console.log(`  Can afford: ${canAfford ? 'YES' : 'NO'}`);
    
    if (!canAfford) {
      console.log(`  ❌ INSUFFICIENT: Need ${cost.quantity - playerHas} more`);
    } else {
      console.log(`  ✅ SUFFICIENT: ${playerHas - cost.quantity} remaining after use`);
    }
  });
}

function testSpellCraftingFlow() {
  console.log('\n=== Testing Spell Crafting Flow ===');
  
  // Step 1: Calculate component costs
  console.log('\n1. Calculating component costs...');
  let totalGold = 0;
  let totalEssence = 0;
  let totalResourceCosts = [...mockDesignData.investedResources];
  
  mockDesignData.componentsUsed.forEach(cu => {
    const component = mockPlayer.discoveredComponents.find(c => c.id === cu.componentId);
    if (component) {
      totalGold += component.usageGoldCost || 0;
      totalEssence += component.usageEssenceCost || 0;
      
      if (component.baseResourceCost) {
        component.baseResourceCost.forEach(cost => {
          const existingIndex = totalResourceCosts.findIndex(c => c.itemId === cost.itemId);
          if (existingIndex > -1) {
            totalResourceCosts[existingIndex].quantity += cost.quantity;
          } else {
            totalResourceCosts.push({ ...cost });
          }
        });
      }
    }
  });
  
  console.log(`  Component gold cost: ${totalGold}`);
  console.log(`  Component essence cost: ${totalEssence}`);
  console.log(`  Total resource costs:`, totalResourceCosts);
  
  // Step 2: Check if player can afford component costs
  console.log('\n2. Checking component affordability...');
  const canAffordGold = mockPlayer.gold >= totalGold;
  const canAffordEssence = mockPlayer.essence >= totalEssence;
  
  console.log(`  Player gold: ${mockPlayer.gold}, needs: ${totalGold}, can afford: ${canAffordGold ? 'YES' : 'NO'}`);
  console.log(`  Player essence: ${mockPlayer.essence}, needs: ${totalEssence}, can afford: ${canAffordEssence ? 'YES' : 'NO'}`);
  
  // Step 3: Check resource costs
  console.log('\n3. Checking resource costs...');
  let canAffordResources = true;
  totalResourceCosts.forEach(cost => {
    const playerHas = mockPlayer.inventory[cost.itemId] || 0;
    const canAfford = playerHas >= cost.quantity;
    canAffordResources = canAffordResources && canAfford;
    
    console.log(`  ${cost.type}: need ${cost.quantity}, have ${playerHas}, can afford: ${canAfford ? 'YES' : 'NO'}`);
  });
  
  // Step 4: Simulate AI generation
  console.log('\n4. Simulating AI spell generation...');
  console.log(`  AI generated spell: ${mockAISpellData.name}`);
  console.log(`  AI resource costs:`, mockAISpellData.resourceCost);
  
  // Step 5: Check AI-generated resource costs
  console.log('\n5. Checking AI-generated resource costs...');
  let canAffordAIResources = true;
  if (mockAISpellData.resourceCost) {
    mockAISpellData.resourceCost.forEach(cost => {
      const playerHas = mockPlayer.inventory[cost.itemId] || 0;
      const canAfford = playerHas >= cost.quantity;
      canAffordAIResources = canAffordAIResources && canAfford;
      
      console.log(`  AI ${cost.type}: need ${cost.quantity}, have ${playerHas}, can afford: ${canAfford ? 'YES' : 'NO'}`);
    });
  }
  
  // Step 6: Final check
  console.log('\n6. Final affordability check...');
  const overallCanAfford = canAffordGold && canAffordEssence && canAffordResources && canAffordAIResources;
  console.log(`  Overall can afford: ${overallCanAfford ? 'YES' : 'NO'}`);
  
  if (!overallCanAfford) {
    console.log('  ❌ SPELL CRAFTING SHOULD FAIL');
    if (!canAffordGold) console.log('    - Insufficient gold');
    if (!canAffordEssence) console.log('    - Insufficient essence');
    if (!canAffordResources) console.log('    - Insufficient component resources');
    if (!canAffordAIResources) console.log('    - Insufficient AI-generated resources');
  } else {
    console.log('  ✅ SPELL CRAFTING SHOULD SUCCEED');
  }
  
  return overallCanAfford;
}

function testResourceDeduction() {
  console.log('\n=== Testing Resource Deduction ===');
  
  // Simulate the deduction process
  const allResourceCosts = [
    ...mockDesignData.investedResources,
    ...(mockAISpellData.resourceCost || [])
  ];
  
  // Merge duplicate costs
  const mergedCosts = [];
  allResourceCosts.forEach(cost => {
    const existingIndex = mergedCosts.findIndex(c => c.itemId === cost.itemId);
    if (existingIndex > -1) {
      mergedCosts[existingIndex].quantity += cost.quantity;
    } else {
      mergedCosts.push({ ...cost });
    }
  });
  
  console.log('\nMerged resource costs to deduct:', mergedCosts);
  
  // Test deduction
  const updatedInventory = { ...mockPlayer.inventory };
  let deductionSuccess = true;
  
  mergedCosts.forEach(cost => {
    const currentAmount = updatedInventory[cost.itemId] || 0;
    const newAmount = currentAmount - cost.quantity;
    
    console.log(`\nDeducting ${cost.quantity} ${cost.type} (${cost.itemId})`);
    console.log(`  Before: ${currentAmount}`);
    console.log(`  After: ${newAmount}`);
    
    if (newAmount < 0) {
      console.log(`  ❌ DEDUCTION FAILED: Would result in negative amount`);
      deductionSuccess = false;
    } else {
      console.log(`  ✅ DEDUCTION OK`);
      updatedInventory[cost.itemId] = newAmount;
    }
  });
  
  console.log(`\nOverall deduction success: ${deductionSuccess ? 'YES' : 'NO'}`);
  
  if (deductionSuccess) {
    console.log('\nUpdated inventory:');
    Object.entries(updatedInventory).forEach(([itemId, quantity]) => {
      if (quantity !== mockPlayer.inventory[itemId]) {
        console.log(`  ${itemId}: ${mockPlayer.inventory[itemId]} → ${quantity}`);
      }
    });
  }
  
  return deductionSuccess;
}

function testInventoryItemIds() {
  console.log('\n=== Testing Inventory Item IDs ===');
  
  console.log('\nPlayer inventory:');
  Object.entries(mockPlayer.inventory).forEach(([itemId, quantity]) => {
    console.log(`  ${itemId}: ${quantity}`);
  });
  
  console.log('\nTesting common resource ID patterns:');
  const commonPatterns = [
    'res_arcane_dust_001',
    'arcane_dust', 
    'res_crystal_shard_001',
    'crystal_shard',
    'res_elemental_essence_001',
    'elemental_essence'
  ];
  
  commonPatterns.forEach(pattern => {
    const amount = mockPlayer.inventory[pattern] || 0;
    console.log(`  ${pattern}: ${amount > 0 ? `${amount} ✅` : '0 ❌'}`);
  });
}

// Main test runner
function runAllTests() {
  console.log('🧪 SPELL CRAFTING DEBUG TESTS');
  console.log('================================');
  
  try {
    testInventoryItemIds();
    testResourceMapping();
    testResourceChecking();
    const canCraft = testSpellCraftingFlow();
    const canDeduct = testResourceDeduction();
    
    console.log('\n=== SUMMARY ===');
    console.log(`Can craft spell: ${canCraft ? 'YES' : 'NO'}`);
    console.log(`Can deduct resources: ${canDeduct ? 'YES' : 'NO'}`);
    
    if (canCraft && canDeduct) {
      console.log('✅ All tests passed - spell crafting should work');
    } else {
      console.log('❌ Tests failed - spell crafting has issues');
      
      if (canCraft && !canDeduct) {
        console.log('🔍 Issue: Spell passes initial checks but fails during deduction');
        console.log('   This suggests a mismatch between checking and deduction logic');
      }
      
      if (!canCraft) {
        console.log('🔍 Issue: Spell fails initial affordability checks');
      }
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResourceMapping,
  testResourceChecking,
  testSpellCraftingFlow,
  testResourceDeduction,
  testInventoryItemIds
}; 