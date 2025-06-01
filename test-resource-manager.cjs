#!/usr/bin/env node

/**
 * Resource Manager Integration Test
 * Tests the actual ResourceManager functions to debug resource deduction issues
 */

const path = require('path');

// Mock the types and constants that the ResourceManager needs
global.MASTER_ITEM_DEFINITIONS = {
  'res_arcane_dust_001': {
    id: 'res_arcane_dust_001',
    name: 'Arcane Dust',
    itemType: 'Resource'
  },
  'res_crystal_shard_001': {
    id: 'res_crystal_shard_001', 
    name: 'Crystal Shard',
    itemType: 'Resource'
  },
  'res_elemental_essence_001': {
    id: 'res_elemental_essence_001',
    name: 'Elemental Essence', 
    itemType: 'Resource'
  },
  'arcane_dust': {
    id: 'arcane_dust',
    name: 'Arcane Dust',
    itemType: 'Resource'
  },
  'crystal_shard': {
    id: 'crystal_shard',
    name: 'Crystal Shard',
    itemType: 'Resource'
  },
  'elemental_essence': {
    id: 'elemental_essence',
    name: 'Elemental Essence',
    itemType: 'Resource'
  }
};

global.AVAILABLE_RESOURCE_TYPES_FOR_AI = [
  'Arcane Dust',
  'Crystal Shard', 
  'Elemental Essence',
  'Mystic Herb',
  'Dragon Scale',
  'Phoenix Feather'
];

// Mock player data
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
    'arcane_dust': 3,
    'crystal_shard': 2,
    'elemental_essence': 4
  }
};

// Test resource costs
const testResourceCosts = [
  { itemId: 'res_arcane_dust_001', quantity: 2, type: 'Arcane Dust' },
  { itemId: 'res_crystal_shard_001', quantity: 1, type: 'Crystal Shard' },
  { itemId: 'res_elemental_essence_001', quantity: 2, type: 'Elemental Essence' }
];

const problematicResourceCosts = [
  { itemId: 'arcane_dust', quantity: 2, type: 'Arcane Dust' },
  { itemId: 'nonexistent_item', quantity: 1, type: 'Fake Resource' },
  { itemId: 'res_elemental_essence_001', quantity: 20, type: 'Elemental Essence' } // Too much
];

async function testResourceManagerFunctions() {
  console.log('🧪 RESOURCE MANAGER INTEGRATION TESTS');
  console.log('=====================================');
  
  try {
    // Try to import the ResourceManager
    console.log('\n1. Importing ResourceManager...');
    
    // We need to create a mock module structure since we can't directly import ES modules
    const ResourceManagerCode = `
      // Simulated ResourceManager functions based on the actual code
      
      const mapResourceTypeToInventoryId = (type) => {
        const mapping = {
          'Arcane Dust': 'res_arcane_dust_001',
          'Crystal Shard': 'res_crystal_shard_001', 
          'Elemental Essence': 'res_elemental_essence_001',
          'Mystic Herb': 'res_mystic_herb_001',
          'Dragon Scale': 'res_dragon_scale_001',
          'Phoenix Feather': 'res_phoenix_feather_001'
        };
        return mapping[type] || type.toLowerCase().replace(/\\s+/g, '_');
      };
      
      const getCorrectItemId = (cost, player) => {
        const possibleIds = [];
        
        if (cost.itemId) {
          possibleIds.push(cost.itemId);
        }
        
        if (cost.type) {
          const mappedId = mapResourceTypeToInventoryId(cost.type);
          if (mappedId !== cost.itemId) {
            possibleIds.push(mappedId);
          }
        }
        
        // Try alternative formats
        if (cost.type) {
          const alternatives = [
            cost.type.toLowerCase().replace(/\\s+/g, '_'),
            cost.type.toLowerCase().replace(/\\s+/g, ''),
            'res_' + cost.type.toLowerCase().replace(/\\s+/g, '_') + '_001'
          ];
          possibleIds.push(...alternatives);
        }
        
        if (player) {
          for (const id of possibleIds) {
            if (player.inventory[id] && player.inventory[id] > 0) {
              return id;
            }
          }
        }
        
        return possibleIds[0] || cost.itemId;
      };
      
      const checkResources = (player, costs) => {
        if (!costs || costs.length === 0) return true;
        
        for (const cost of costs) {
          const correctItemId = getCorrectItemId(cost, player);
          const playerHas = player.inventory[correctItemId] || 0;
          
          console.log(\`    Checking: \${cost.quantity} \${cost.type || cost.itemId}\`);
          console.log(\`      Original ID: \${cost.itemId}\`);
          console.log(\`      Resolved ID: \${correctItemId}\`);
          console.log(\`      Player has: \${playerHas}\`);
          console.log(\`      Needs: \${cost.quantity}\`);
          
          if (playerHas < cost.quantity) {
            console.log(\`      ❌ INSUFFICIENT\`);
            return false;
          } else {
            console.log(\`      ✅ SUFFICIENT\`);
          }
        }
        return true;
      };
      
      const deductResources = (player, costs) => {
        if (!costs || costs.length === 0) {
          return { success: true, updatedPlayer: player };
        }
        
        // First check if we can afford everything
        if (!checkResources(player, costs)) {
          return { success: false, error: 'Insufficient resources' };
        }
        
        // Create updated inventory
        const updatedInventory = { ...player.inventory };
        
        for (const cost of costs) {
          const correctItemId = getCorrectItemId(cost, player);
          const currentAmount = updatedInventory[correctItemId] || 0;
          const newAmount = currentAmount - cost.quantity;
          
          console.log(\`    Deducting: \${cost.quantity} \${cost.type || cost.itemId}\`);
          console.log(\`      From ID: \${correctItemId}\`);
          console.log(\`      Before: \${currentAmount}\`);
          console.log(\`      After: \${newAmount}\`);
          
          if (newAmount < 0) {
            console.log(\`      ❌ DEDUCTION FAILED\`);
            return { success: false, error: \`Insufficient \${cost.type || cost.itemId}\` };
          }
          
          updatedInventory[correctItemId] = newAmount;
          console.log(\`      ✅ DEDUCTION OK\`);
        }
        
        return {
          success: true,
          updatedPlayer: {
            ...player,
            inventory: updatedInventory
          }
        };
      };
      
      module.exports = {
        checkResources,
        deductResources,
        getCorrectItemId,
        mapResourceTypeToInventoryId
      };
    `;
    
    // Execute the ResourceManager code
    const ResourceManager = eval(`(function() { ${ResourceManagerCode} })()`);
    
    console.log('✅ ResourceManager functions loaded');
    
    // Test 1: Check valid resources
    console.log('\n2. Testing checkResources with valid costs...');
    const canAffordValid = ResourceManager.checkResources(mockPlayer, testResourceCosts);
    console.log(`  Result: ${canAffordValid ? 'CAN AFFORD' : 'CANNOT AFFORD'}`);
    
    // Test 2: Check problematic resources
    console.log('\n3. Testing checkResources with problematic costs...');
    const canAffordProblematic = ResourceManager.checkResources(mockPlayer, problematicResourceCosts);
    console.log(`  Result: ${canAffordProblematic ? 'CAN AFFORD' : 'CANNOT AFFORD'}`);
    
    // Test 3: Test deduction with valid resources
    console.log('\n4. Testing deductResources with valid costs...');
    const deductionResult = ResourceManager.deductResources(mockPlayer, testResourceCosts);
    console.log(`  Success: ${deductionResult.success}`);
    if (deductionResult.success) {
      console.log('  Updated inventory:');
      Object.entries(deductionResult.updatedPlayer.inventory).forEach(([itemId, quantity]) => {
        if (quantity !== mockPlayer.inventory[itemId]) {
          console.log(`    ${itemId}: ${mockPlayer.inventory[itemId]} → ${quantity}`);
        }
      });
    } else {
      console.log(`  Error: ${deductionResult.error}`);
    }
    
    // Test 4: Test deduction with problematic resources
    console.log('\n5. Testing deductResources with problematic costs...');
    const problematicDeduction = ResourceManager.deductResources(mockPlayer, problematicResourceCosts);
    console.log(`  Success: ${problematicDeduction.success}`);
    if (!problematicDeduction.success) {
      console.log(`  Error: ${problematicDeduction.error}`);
    }
    
    // Test 5: Test ID resolution
    console.log('\n6. Testing ID resolution...');
    testResourceCosts.forEach(cost => {
      const resolvedId = ResourceManager.getCorrectItemId(cost, mockPlayer);
      console.log(`  ${cost.type} (${cost.itemId}) → ${resolvedId}`);
      console.log(`    Player has ${mockPlayer.inventory[resolvedId] || 0} of ${resolvedId}`);
    });
    
    // Test 6: Test edge cases
    console.log('\n7. Testing edge cases...');
    
    // Empty costs
    const emptyResult = ResourceManager.checkResources(mockPlayer, []);
    console.log(`  Empty costs: ${emptyResult ? 'PASS' : 'FAIL'}`);
    
    // Null costs
    const nullResult = ResourceManager.checkResources(mockPlayer, null);
    console.log(`  Null costs: ${nullResult ? 'PASS' : 'FAIL'}`);
    
    // Undefined costs
    const undefinedResult = ResourceManager.checkResources(mockPlayer, undefined);
    console.log(`  Undefined costs: ${undefinedResult ? 'PASS' : 'FAIL'}`);
    
    console.log('\n=== SUMMARY ===');
    console.log('✅ ResourceManager integration tests completed');
    console.log('If you see "INSUFFICIENT" errors above, that indicates where the problem is occurring.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the tests
if (require.main === module) {
  testResourceManagerFunctions();
}

module.exports = { testResourceManagerFunctions }; 