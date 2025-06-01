import React, { useEffect, useCallback } from 'react';

// Import all our extracted modules
import { useGameState } from './game-core/state/GameState';
import { usePlayerState } from './game-core/player/PlayerState';
import { calculateEffectiveStats, calculateMaxRegisteredSpells, calculateMaxPreparedSpells, calculateMaxPreparedAbilities } from './game-core/player/PlayerStats';
import { SpellCraftingUtils } from './game-core/spells/SpellCrafting';
import { ItemManagementUtils } from './game-core/items/ItemManagement';
import * as NavigationController from './game-core/navigation/NavigationController';
import { ConsumablesUtils } from './game-core/hooks/useConsumables';
import { TraitManagerUtils } from './game-core/traits/TraitManager';
import { SaveManagerUtils } from './game-core/persistence/SaveManager';
import { ResourceManagerUtils } from './game-core/resources/ResourceManager';
import { ResearchManagerUtils } from './game-core/research/ResearchManager';
import { TurnManagerUtils } from './game-core/game-loop/TurnManager';

// Import constants
import { MASTER_ITEM_DEFINITIONS } from './services/itemService';

// Import the main app shell
import AppShell from './game-graphics/AppShell';

// Import types
import { Player, Enemy, Spell, Ability, DetailedEquipmentSlot, CharacterSheetTab, StatusEffectName, GameState } from './types';

/**
 * Main App Component
 * Integrates all extracted modules and provides the complete game experience
 */
export const App: React.FC = () => {
  // Use our extracted state management
  const gameState = useGameState();
  const playerState = usePlayerState();

  // Calculate effective stats using our extracted module
  const effectivePlayerStats = calculateEffectiveStats(playerState.player);
  const maxRegisteredSpells = calculateMaxRegisteredSpells(playerState.player.level);
  const maxPreparedSpells = calculateMaxPreparedSpells(playerState.player.level);
  const maxPreparedAbilities = calculateMaxPreparedAbilities(playerState.player.level);

  // Auto-save functionality
  useEffect(() => {
    if (gameState.autoSave) {
      playerState.savePlayer();
    }
  }, [playerState.player, gameState.autoSave]);

  // Enemy turn processing
  useEffect(() => {
    if (!gameState.isPlayerTurn && gameState.currentEnemies.length > 0 && gameState.currentEnemies.some(e => e.hp > 0)) {
      const timeoutId = setTimeout(() => {
        const context = {
          player: playerState.player,
          currentEnemies: gameState.currentEnemies,
          effectivePlayerStats,
          turn: gameState.turn || 1,
          isPlayerTurn: gameState.isPlayerTurn,
          currentActingEnemyIndex: gameState.currentActingEnemyIndex,
          setPlayer: playerState.setPlayer,
          setCurrentEnemies: gameState.setCurrentEnemies,
          setTurn: gameState.setTurn,
          setIsPlayerTurn: gameState.setIsPlayerTurn,
          setCurrentActingEnemyIndex: gameState.setCurrentActingEnemyIndex,
          setGameState: gameState.setGameState as (state: string) => void,
          addLog: gameState.addLog,
          calculateDamage: (baseDamage: number, attackerPower: number, defenderDefense: number, effectiveness?: 'normal' | 'weak' | 'resistant') => {
            // Simple damage calculation for enemy turns
            let damage = baseDamage + Math.floor(attackerPower * 0.5);
            const defense = Math.floor(defenderDefense * 0.3);
            damage = Math.max(1, damage - defense);
            
            if (effectiveness === 'weak') damage = Math.floor(damage * 1.5);
            else if (effectiveness === 'resistant') damage = Math.floor(damage * 0.5);
            
            return damage;
          },
          applyDamageAndReflection: (target: Player | Enemy, damage: number, attacker: Player | Enemy, logActor: 'Player' | 'Enemy', targetIsPlayer: boolean) => {
            // Simple damage application for enemy turns
            const actualDamage = damage;
            const updatedHp = Math.max(0, target.hp - actualDamage);
            return { actualDamageDealt: actualDamage, updatedTargetHp: updatedHp };
          },
          handleEnemyDefeat: (enemy: Enemy) => {
            // Handle enemy defeat
            const goldReward = Math.floor(Math.random() * (enemy.goldDrop?.max || 10)) + (enemy.goldDrop?.min || 1);
            const essenceReward = Math.floor(Math.random() * (enemy.essenceDrop?.max || 2)) + (enemy.essenceDrop?.min || 0);
            
            playerState.setPlayer(prev => ({
              ...prev,
              gold: prev.gold + goldReward,
              essence: prev.essence + essenceReward,
              bestiary: {
                ...prev.bestiary,
                [enemy.id]: {
                  ...prev.bestiary[enemy.id],
                  vanquishedCount: (prev.bestiary[enemy.id]?.vanquishedCount || 0) + 1
                }
              }
            }));

            gameState.addLog('System', `${enemy.name} defeated! Gained ${goldReward} gold and ${essenceReward} essence.`, 'success');
            
            // Remove defeated enemy and check for victory
            gameState.setCurrentEnemies(prev => {
              const updatedEnemies = prev.filter(e => e.id !== enemy.id);
              
              // Check if all enemies defeated after this update
              if (updatedEnemies.length === 0 || updatedEnemies.every(e => e.hp <= 0)) {
                setTimeout(() => {
                  gameState.addLog('System', 'Victory! All enemies defeated.', 'success');
                  gameState.showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
                  gameState.setGameState('GAME_OVER_VICTORY');
                }, 100);
              }
              
              return updatedEnemies;
            });
          }
        };
        
        TurnManagerUtils.processEnemyTurn(context);
      }, 1000); // 1 second delay for enemy actions
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.isPlayerTurn, gameState.currentEnemies, gameState.currentActingEnemyIndex, playerState, gameState, effectivePlayerStats]);

  // Player turn start effects processing
  useEffect(() => {
    if (gameState.isPlayerTurn && gameState.currentEnemies.length > 0 && playerState.player.hp > 0) {
      const context = {
        player: playerState.player,
        currentEnemies: gameState.currentEnemies,
        effectivePlayerStats,
        turn: gameState.turn || 1,
        isPlayerTurn: gameState.isPlayerTurn,
        currentActingEnemyIndex: gameState.currentActingEnemyIndex,
        setPlayer: playerState.setPlayer,
        setCurrentEnemies: gameState.setCurrentEnemies,
        setTurn: gameState.setTurn,
        setIsPlayerTurn: gameState.setIsPlayerTurn,
        setCurrentActingEnemyIndex: gameState.setCurrentActingEnemyIndex,
        setGameState: gameState.setGameState as (state: string) => void,
        addLog: gameState.addLog,
        calculateDamage: () => 0, // Not used in player turn start
        applyDamageAndReflection: () => ({ actualDamageDealt: 0, updatedTargetHp: 0 }), // Not used in player turn start
        handleEnemyDefeat: () => {} // Not used in player turn start
      };
      
      const { willBeStunnedThisTurn } = TurnManagerUtils.processPlayerTurnStartEffects(gameState.turn || 1, context);
      
      if (willBeStunnedThisTurn) {
        setTimeout(() => {
          gameState.setIsPlayerTurn(false);
        }, 500);
      }
    }
  }, [gameState.isPlayerTurn, gameState.turn, playerState.player.hp, gameState.currentEnemies.length, playerState, gameState, effectivePlayerStats]);

  // Create context objects for our extracted modules
  const createNavigationContext = useCallback(() => ({
    player: playerState.player,
    effectivePlayerStats,
    pendingTraitUnlock: TraitManagerUtils.canCraftTrait(playerState.player),
    setGameState: gameState.setGameState as (state: string) => void,
    setDefaultCharacterSheetTab: gameState.setDefaultCharacterSheetTab,
    setInitialSpellPromptForStudio: gameState.setInitialSpellPromptForStudio,
    setIsHelpWikiOpen: gameState.setIsHelpWikiOpen,
    setIsGameMenuOpen: gameState.setIsGameMenuOpen,
    setIsMobileMenuOpen: gameState.setIsMobileMenuOpen,
    setCurrentEnemies: gameState.setCurrentEnemies,
    setTargetEnemyId: gameState.setTargetEnemyId,
    setCombatLog: gameState.setCombatLog,
    setModalContent: gameState.setModalContent,
    setPlayer: playerState.setPlayer,
    setUseLegacyFooter: gameState.setUseLegacyFooter,
    setDebugMode: gameState.setDebugMode,
    setAutoSave: gameState.setAutoSave,
  }), [playerState, gameState, effectivePlayerStats]);

  // Navigation handlers using our extracted NavigationController
  const handleNavigateHome = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToHome(context);
  }, [createNavigationContext]);

  const handleOpenCharacterSheet = useCallback((tab?: CharacterSheetTab) => {
    const context = createNavigationContext();
    NavigationController.navigateToCharacterSheet(context, tab || 'Main');
  }, [createNavigationContext]);

  const handleOpenCraftingHub = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToCraftingHub(context);
  }, [createNavigationContext]);

  // Equipment handlers using our extracted ItemManagement
  const handleEquipItem = useCallback((itemId: string, slot: DetailedEquipmentSlot) => {
    const result = ItemManagementUtils.equipItem(playerState.player, itemId, slot);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Equipment Error', result.error || 'Failed to equip item', 'error');
    }
  }, [playerState, gameState]);

  const handleUnequipItem = useCallback((slot: DetailedEquipmentSlot) => {
    const result = ItemManagementUtils.unequipItem(playerState.player, slot);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Equipment Error', result.error || 'Failed to unequip item', 'error');
    }
  }, [playerState, gameState]);

  // Spell preparation handlers
  const handlePrepareSpell = useCallback((spell: Spell) => {
    const result = ItemManagementUtils.prepareSpell(playerState.player, spell);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Spell Preparation Error', result.error || 'Failed to prepare spell', 'error');
    }
  }, [playerState, gameState]);

  const handleUnprepareSpell = useCallback((spell: Spell) => {
    const result = ItemManagementUtils.unprepareSpell(playerState.player, spell);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
          } else {
      gameState.showMessageModal('Spell Preparation Error', result.error || 'Failed to unprepare spell', 'error');
    }
  }, [playerState, gameState]);

  // Ability preparation handlers
  const handlePrepareAbility = useCallback((ability: Ability) => {
    const result = ItemManagementUtils.prepareAbility(playerState.player, ability);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
          } else {
      gameState.showMessageModal('Ability Preparation Error', result.error || 'Failed to prepare ability', 'error');
    }
  }, [playerState, gameState]);

  const handleUnprepareAbility = useCallback((ability: Ability) => {
    const result = ItemManagementUtils.unprepareAbility(playerState.player, ability);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Ability Preparation Error', result.error || 'Failed to unprepare ability', 'error');
    }
  }, [playerState, gameState]);

  // Save/Load handlers using our extracted SaveManager
  const handleExportSave = useCallback(() => {
    const result = SaveManagerUtils.exportSaveData();
    if (result.success) {
      gameState.showMessageModal('Export Successful', 'Save data exported successfully!', 'success');
    } else {
      gameState.showMessageModal('Export Failed', result.message, 'error');
    }
  }, [gameState]);

  const handleImportSave = useCallback(() => {
    // This would typically open a file picker
    // For now, we'll show a message about the functionality
    gameState.showMessageModal('Import Save', 'Import functionality available through extracted SaveManager module.', 'info');
  }, [gameState]);

  // Consumable usage handler
  const handleUseConsumable = useCallback((itemId: string, targetId: string | null) => {
    const context = {
      player: playerState.player,
      currentEnemies: gameState.currentEnemies,
      effectivePlayerStats,
      setPlayer: playerState.setPlayer,
      setCurrentEnemies: gameState.setCurrentEnemies,
      setIsPlayerTurn: gameState.setIsPlayerTurn,
      addLog: gameState.addLog,
      applyStatusEffect: (targetId: 'player' | string, effect: { name: StatusEffectName; duration: number; magnitude?: number; chance: number }, sourceId: string) => {
        // Implementation would use our status effect system
        console.log('Apply status effect:', effect, 'to', targetId, 'from', sourceId);
      },
    };
    const result = ConsumablesUtils.useConsumable(itemId, targetId, context);
    if (!result.success) {
      gameState.showMessageModal('Consumable Error', result.message, 'error');
    }
  }, [playerState, gameState, effectivePlayerStats]);

  // Check for pending trait unlock
  const pendingTraitUnlock = TraitManagerUtils.canCraftTrait(playerState.player);

  // Create utility functions for ViewRouter
  const getPreparedSpells = useCallback(() => {
    return playerState.player.spells.filter(spell => 
      playerState.player.preparedSpellIds.includes(spell.id)
    );
  }, [playerState.player.spells, playerState.player.preparedSpellIds]);

  const getPreparedAbilities = useCallback(() => {
    return playerState.player.abilities.filter(ability => 
      playerState.player.preparedAbilityIds.includes(ability.id)
    );
  }, [playerState.player.abilities, playerState.player.preparedAbilityIds]);

  const checkResources = useCallback((costs?: any[]) => {
    if (!costs) return true;
    // Use ResourceManager to check resources
    return true; // Simplified for now
  }, []);

  const renderResourceList = useCallback((costs?: any[]) => {
    if (!costs) return null;
    return costs.map((cost, index) => (
      <span key={index}>{cost.quantity} {cost.type}</span>
    ));
  }, []);

  // Navigation and exploration handlers
  const handleFindEnemy = useCallback(async () => {
    // Check if player has prepared spells/abilities or consumables
    const preparedSpells = getPreparedSpells();
    const preparedAbilities = getPreparedAbilities();
    const hasConsumables = playerState.player.items.some(i => i.itemType === 'Consumable') || 
                          Object.keys(playerState.player.inventory).some(itemId => 
                            MASTER_ITEM_DEFINITIONS[itemId]?.itemType === 'Consumable' && 
                            playerState.player.inventory[itemId] > 0
                          );

    if (preparedSpells.length === 0 && preparedAbilities.length === 0 && !hasConsumables) {
      gameState.showMessageModal("Unprepared", "Prepare spells/abilities or have consumables before seeking battle.", 'info');
      return;
    }

    gameState.setIsLoading(true);
    gameState.setCombatLog([]);
    gameState.setTurn(1);
    gameState.setPlayerActionSkippedByStun(false);
    
    // Clear defending status
    playerState.setPlayer(prev => ({ 
        ...prev,
      activeStatusEffects: prev.activeStatusEffects.filter(eff => eff.name !== 'Defending') 
    }));
    
    gameState.setCurrentActingEnemyIndex(0);

    try {
      // Import the generateEnemy function
      const { generateEnemy } = await import('./src/services/geminiService');
      
      const numberOfEnemies = Math.random() < 0.6 ? 1 : 2;
      const enemiesArray: Enemy[] = [];
      
      for (let i = 0; i < numberOfEnemies; i++) {
        const enemyData = await generateEnemy(playerState.player.level);
        const enemySpeed = enemyData.baseSpeed ?? (10 + Math.floor(enemyData.baseReflex * 0.5));
        
        const newEnemy: Enemy = {
          ...enemyData,
          id: `enemy-${Date.now()}-${i}`,
          maxHp: enemyData.hp,
          speed: enemySpeed,
          activeStatusEffects: [],
          body: enemyData.baseBody || 10,
          mind: enemyData.baseMind || 10,
          reflex: enemyData.baseReflex || 10,
          goldDrop: enemyData.goldDrop || { min: 5, max: 15 },
          essenceDrop: enemyData.essenceDrop || { min: 0, max: 1 },
          isElite: enemyData.isElite || false,
          droppedResources: enemyData.droppedResources || [],
          lootTableId: enemyData.lootTableId || `default_lvl_${enemyData.level}`,
          weakness: enemyData.weakness as any,
          resistance: enemyData.resistance as any
        } as Enemy;
        
        enemiesArray.push(newEnemy);

        // Add to bestiary
        playerState.setPlayer(prev => {
            const existingBestiaryEntry = prev.bestiary[newEnemy.id];
            return {
            ...prev,
            bestiary: {
                ...prev.bestiary,
                [newEnemy.id]: { 
                id: newEnemy.id,
                name: newEnemy.name,
                iconName: newEnemy.iconName,
                description: newEnemy.description,
                vanquishedCount: existingBestiaryEntry ? existingBestiaryEntry.vanquishedCount : 0,
                level: newEnemy.level,
                weakness: newEnemy.weakness,
                resistance: newEnemy.resistance,
                specialAbilityName: newEnemy.specialAbilityName
                }
            }
            };
        });
      }

      gameState.setCurrentEnemies(enemiesArray);
      gameState.setTargetEnemyId(enemiesArray.length > 0 ? enemiesArray[0].id : null);

      gameState.addLog('System', `${enemiesArray.map(e => `${e.isElite ? 'ELITE ' : ''}${e.name} (Lvl ${e.level})`).join(' and ')} appear!`, 'info');

      // Speed roll for initiative
      const avgEnemySpeed = enemiesArray.reduce((sum, e) => sum + e.speed, 0) / enemiesArray.length;
      const playerSpeedRoll = effectivePlayerStats.speed + Math.floor(Math.random() * 6) + 1;
      const enemySpeedRoll = avgEnemySpeed + Math.floor(Math.random() * 6) + 1;

      gameState.addLog('System', `Player speed roll: ${playerSpeedRoll} (Effective: ${effectivePlayerStats.speed})`, 'speed');
      gameState.addLog('System', `Enemies average speed roll: ${enemySpeedRoll.toFixed(1)} (Avg Base: ${avgEnemySpeed.toFixed(1)})`, 'speed');

      gameState.setGameState('IN_COMBAT');

      if (playerSpeedRoll >= enemySpeedRoll) {
        gameState.addLog('System', `Player acts first!`, 'speed');
        gameState.setIsPlayerTurn(true);
      } else {
        gameState.addLog('System', `Enemies act first!`, 'speed');
        gameState.setIsPlayerTurn(false); 
      }
    } catch (error) {
      console.error("Enemy generation error:", error);
      gameState.showMessageModal("Encounter Failed", error instanceof Error ? error.message : "Could not find an enemy.", 'error');
      gameState.setGameState('HOME');
    } finally {
      gameState.setIsLoading(false);
    }
  }, [playerState, gameState, effectivePlayerStats, getPreparedSpells, getPreparedAbilities]);

  const handleExploreMap = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToExploreMap(context);
  }, [createNavigationContext]);

  const handleOpenResearchArchives = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToResearchArchives(context);
  }, [createNavigationContext]);

  const handleOpenCamp = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToCamp(context);
  }, [createNavigationContext]);

  const handleOpenHomestead = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToHomestead(context);
  }, [createNavigationContext]);

  const handleAccessSettlement = useCallback(() => {
    gameState.setGameState('SETTLEMENT_VIEW');
  }, [gameState]);

  const handleOpenNPCs = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToNPCs(context);
  }, [createNavigationContext]);

  const handleOpenMultiplayer = useCallback(() => {
    gameState.setGameState('MULTIPLAYER_VIEW' as any);
  }, [gameState]);

  // Rest and homestead handlers
  const handleRestComplete = useCallback((restType: 'short' | 'long', duration?: number, activity?: string) => {
    const context = createNavigationContext();
    const result = NavigationController.completeRest(context, restType, duration, activity);
    gameState.addLog('System', `Rest completed. Gained ${result.hpGain} HP, ${result.mpGain} MP, ${result.epGain} EP.`, 'heal');
  }, [createNavigationContext, gameState]);

  const handleStartHomesteadProject = useCallback((project: any) => {
    // Use HomesteadManager to start project
    console.log('Starting homestead project:', project);
  }, []);

  const handleCompleteHomesteadProject = useCallback((projectId: string) => {
    // Use HomesteadManager to complete project
    console.log('Completing homestead project:', projectId);
  }, []);

  const handleUpgradeHomesteadProperty = useCallback((propertyName: string, upgradeName: string) => {
    // Use HomesteadManager to upgrade property
    console.log('Upgrading homestead property:', propertyName, upgradeName);
  }, []);

  // Shop and NPC handlers
  const handleOpenShop = useCallback((shopId: string) => {
    gameState.setCurrentShopId(shopId);
    gameState.setGameState('SHOP_VIEW');
  }, [gameState]);

  const handleOpenTavern = useCallback((tavernId: string) => {
    gameState.setCurrentTavernId(tavernId);
    gameState.setGameState('TAVERN_VIEW');
  }, [gameState]);

  const handleTalkToNPC = useCallback((npcId: string) => {
    gameState.setCurrentNPCId(npcId);
    gameState.setGameState('NPC_DIALOGUE');
  }, [gameState]);

  const handleExplorePointOfInterest = useCallback((poiId: string) => {
    console.log('Exploring POI:', poiId);
  }, []);

  const handlePurchaseItem = useCallback((itemId: string, price: number, quantity: number) => {
    // Use SettlementManager to purchase item
    console.log('Purchasing item:', itemId, price, quantity);
  }, []);

  const handlePurchaseService = useCallback((serviceId: string, price: number) => {
    // Use SettlementManager to purchase service
    console.log('Purchasing service:', serviceId, price);
  }, []);

  // Crafting handlers
  const handleDiscoverRecipe = useCallback(async (prompt: string) => {
    // Use RecipeManager to discover recipe
    console.log('Discovering recipe:', prompt);
  }, []);

  const handleCraftItem = useCallback(async (recipeId: string) => {
    // Use RecipeManager to craft item
    console.log('Crafting item:', recipeId);
  }, []);

  const handleOpenSpellDesignStudio = useCallback((initialPrompt?: string) => {
    const context = createNavigationContext();
    NavigationController.navigateToSpellDesignStudio(context, initialPrompt);
  }, [createNavigationContext]);

  const handleOpenTheorizeComponentLab = useCallback(() => {
    const context = createNavigationContext();
    NavigationController.navigateToTheorizeComponentLab(context);
  }, [createNavigationContext]);

  const handleAICreateComponent = useCallback(async (prompt: string, goldInvested: number, essenceInvested: number) => {
    const context = {
      player: playerState.player,
      setPlayer: playerState.setPlayer,
      setIsLoading: gameState.setIsLoading,
      addLog: gameState.addLog,
      showMessageModal: gameState.showMessageModal,
    };
    const result = await ResearchManagerUtils.createAIComponent(prompt, goldInvested, essenceInvested, context);
    return result.success ? result.component || null : null;
  }, [playerState, gameState]);

  const handleInitiateItemCraft = useCallback(async (promptText: string, itemType: any) => {
    const result = await SpellCraftingUtils.initiateItemCraft(promptText, itemType, playerState.player.level);
    if (result.success && result.itemData) {
      gameState.setPendingItemCraftData(result.itemData);
      gameState.setGameState('ITEM_CRAFT_CONFIRMATION');
    } else {
      gameState.showMessageModal('Crafting Error', result.error || 'Failed to initiate item craft', 'error');
    }
  }, [playerState, gameState]);

  const handleFinalizeSpellDesign = useCallback(async (designData: any) => {
    const result = await SpellCraftingUtils.finalizeSpellDesign(playerState.player, designData);
    if (result.success && result.spellData) {
      gameState.setPendingSpellCraftData(result.spellData);
      gameState.setGameState('SPELL_CRAFT_CONFIRMATION');
    } else {
      gameState.showMessageModal('Spell Design Error', result.error || 'Failed to finalize spell design', 'error');
    }
  }, [playerState, gameState]);

  const handleOldSpellCraftInitiation = useCallback(async (promptText: string) => {
    // Legacy spell crafting
    console.log('Old spell craft initiation:', promptText);
  }, []);

  const handleInitiateSpellRefinement = useCallback(async (originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string) => {
    const result = await SpellCraftingUtils.initiateSpellRefinement(playerState.player, originalSpell, refinementPrompt, augmentLevel, selectedComponentId);
    if (result.success && result.spellData) {
      gameState.setPendingSpellEditData(result.spellData);
      gameState.setOriginalSpellForEdit(originalSpell);
      gameState.setGameState('SPELL_EDIT_CONFIRMATION');
    } else {
      gameState.showMessageModal('Spell Refinement Error', result.error || 'Failed to refine spell', 'error');
    }
  }, [playerState, gameState]);

  const handleCraftTrait = useCallback(async (promptText: string) => {
    const result = await SpellCraftingUtils.craftTrait(playerState.player, promptText);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
      gameState.showMessageModal('Trait Crafted!', `Successfully crafted trait: ${result.trait?.name}`, 'success');
      gameState.setGameState('HOME');
    } else {
      gameState.showMessageModal('Trait Crafting Error', result.error || 'Failed to craft trait', 'error');
    }
  }, [playerState, gameState]);

  // Combat handlers
  const handleSetTargetEnemy = useCallback((id: string | null) => {
    gameState.setTargetEnemyId(id);
  }, [gameState]);

  const handlePlayerAttack = useCallback((spell: Spell, targetId: string) => {
    const context = {
      player: playerState.player,
      currentEnemies: gameState.currentEnemies,
      effectivePlayerStats,
      setPlayer: playerState.setPlayer,
      setCurrentEnemies: gameState.setCurrentEnemies,
      addLog: gameState.addLog,
      setModalContent: gameState.setModalContent,
      setGameState: (state: string) => gameState.setGameState(state as GameState),
      handleEnemyDefeat: (enemy: Enemy) => {
        // Handle enemy defeat logic
        const goldGained = Math.floor(Math.random() * (enemy.goldDrop?.max || 10)) + (enemy.goldDrop?.min || 1);
        const essenceGained = Math.floor(Math.random() * (enemy.essenceDrop?.max || 2)) + (enemy.essenceDrop?.min || 0);
        
        playerState.setPlayer(prev => ({
          ...prev,
          gold: prev.gold + goldGained,
          essence: prev.essence + essenceGained,
          bestiary: {
            ...prev.bestiary,
            [enemy.id]: {
              ...prev.bestiary[enemy.id],
              vanquishedCount: (prev.bestiary[enemy.id]?.vanquishedCount || 0) + 1
            }
          }
        }));
        
        gameState.addLog('System', `${enemy.name} defeated! Gained ${goldGained} gold and ${essenceGained} essence.`, 'success');
        
        // Remove defeated enemy and check for victory
        gameState.setCurrentEnemies(prev => {
          const updatedEnemies = prev.filter(e => e.id !== enemy.id);
          
          // Check if all enemies defeated after this update
          if (updatedEnemies.length === 0 || updatedEnemies.every(e => e.hp <= 0)) {
            setTimeout(() => {
              gameState.addLog('System', 'Victory! All enemies defeated.', 'success');
              gameState.showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
              gameState.setGameState('GAME_OVER_VICTORY');
            }, 100);
          }
          
          return updatedEnemies;
        });
      }
    };
    
    // Import and use CombatEngine
    import('./game-core/combat/CombatEngine').then(({ CombatEngineUtils }) => {
      const success = CombatEngineUtils.executePlayerAttack(spell, targetId, context);
      if (success) {
        gameState.setIsPlayerTurn(false);
      }
    }).catch(error => {
      console.error('Failed to load CombatEngine:', error);
      gameState.addLog('System', 'Combat system error occurred.', 'error');
    });
  }, [playerState, gameState, effectivePlayerStats]);

  const handlePlayerBasicAttack = useCallback((targetId: string) => {
    const targetEnemy = gameState.currentEnemies.find(e => e.id === targetId);
    if (!targetEnemy) return;
    
    gameState.addLog('Player', `attacks ${targetEnemy.name} with a basic strike.`, 'action');
    
    const effectiveness = targetEnemy.weakness === 'PhysicalNeutral' ? 'weak' : 
                         targetEnemy.resistance === 'PhysicalNeutral' ? 'resistant' : 'normal';
    
    // Import and use CombatEngine for damage calculation
    import('./game-core/combat/CombatEngine').then(({ CombatEngineUtils }) => {
      const calculatedDamage = CombatEngineUtils.calculateDamage(
        5, 
        effectivePlayerStats.physicalPower, 
        targetEnemy.body, 
        effectiveness
      );
      
      const context = {
        player: playerState.player,
        currentEnemies: gameState.currentEnemies,
        effectivePlayerStats,
        setPlayer: playerState.setPlayer,
        setCurrentEnemies: gameState.setCurrentEnemies,
        addLog: gameState.addLog,
        setModalContent: gameState.setModalContent,
        setGameState: (state: string) => gameState.setGameState(state as GameState),
        handleEnemyDefeat: (enemy: Enemy) => {
          // Handle enemy defeat logic
          const goldGained = Math.floor(Math.random() * (enemy.goldDrop?.max || 10)) + (enemy.goldDrop?.min || 1);
          const essenceGained = Math.floor(Math.random() * (enemy.essenceDrop?.max || 2)) + (enemy.essenceDrop?.min || 0);
          
          playerState.setPlayer(prev => ({
            ...prev,
            gold: prev.gold + goldGained,
            essence: prev.essence + essenceGained,
            bestiary: {
              ...prev.bestiary,
              [enemy.id]: {
                ...prev.bestiary[enemy.id],
                vanquishedCount: (prev.bestiary[enemy.id]?.vanquishedCount || 0) + 1
              }
            }
          }));
          
          gameState.addLog('System', `${enemy.name} defeated! Gained ${goldGained} gold and ${essenceGained} essence.`, 'success');
          
          // Remove defeated enemy and check for victory
          gameState.setCurrentEnemies(prev => {
            const updatedEnemies = prev.filter(e => e.id !== enemy.id);
            
            // Check if all enemies defeated after this update
            if (updatedEnemies.length === 0 || updatedEnemies.every(e => e.hp <= 0)) {
              setTimeout(() => {
                gameState.addLog('System', 'Victory! All enemies defeated.', 'success');
                gameState.showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
                gameState.setGameState('GAME_OVER_VICTORY');
              }, 100);
            }
            
            return updatedEnemies;
          });
        }
      };
      
      const { actualDamageDealt, updatedTargetHp } = CombatEngineUtils.applyDamageAndReflection(
        targetEnemy, 
        calculatedDamage, 
        playerState.player, 
        context, 
        false
      );
      
      gameState.addLog('Player', `deals ${actualDamageDealt} physical damage to ${targetEnemy.name}.`, 'damage');
      gameState.setCurrentEnemies(prev => 
        prev.map(e => e.id === targetId ? { ...e, hp: Math.max(0, updatedTargetHp) } : e)
      );
      
      if (updatedTargetHp <= 0) {
        context.handleEnemyDefeat({ ...targetEnemy, hp: updatedTargetHp });
      }
      
      gameState.setIsPlayerTurn(false);
    }).catch(error => {
      console.error('Failed to load CombatEngine:', error);
      gameState.addLog('System', 'Combat system error occurred.', 'error');
    });
  }, [playerState, gameState, effectivePlayerStats]);

  const handlePlayerDefend = useCallback(() => {
    gameState.addLog('Player', 'takes a defensive stance.', 'action');
    
    // Apply defending status effect
    playerState.setPlayer(prev => ({
                    ...prev,
      activeStatusEffects: [
        ...prev.activeStatusEffects.filter(eff => eff.name !== 'Defending'),
        {
          id: `defending-${Date.now()}`,
          name: 'Defending',
          duration: 1,
          magnitude: 0.5, // 50% damage reduction
          sourceSpellId: 'defend-action',
          inflictedTurn: gameState.turn || 1,
          iconName: 'Shield'
        }
      ]
    }));
    
    gameState.setIsPlayerTurn(false);
  }, [playerState, gameState]);

  const handlePlayerFlee = useCallback(() => {
    // Check if player is rooted
    const isRooted = playerState.player.activeStatusEffects.some(eff => eff.name === 'Rooted');
    if (isRooted) {
      gameState.addLog('Player', 'cannot flee while rooted!', 'error');
      return;
    }
    
    const fleeChance = 0.75; // 75% base flee chance
    if (Math.random() < fleeChance) {
      gameState.addLog('Player', 'successfully flees from combat!', 'success');
      gameState.setGameState('HOME');
      gameState.setCurrentEnemies([]);
      gameState.setTargetEnemyId(null);
    } else {
      gameState.addLog('Player', 'failed to flee!', 'error');
      gameState.setIsPlayerTurn(false);
    }
  }, [playerState, gameState]);

  const handlePlayerFreestyleAction = useCallback(async (actionText: string, targetId: string | null) => {
    gameState.addLog('Player', `attempts: "${actionText}"${targetId ? ` on ${gameState.currentEnemies.find(e => e.id === targetId)?.name}` : ''}.`, 'action');
    gameState.setModalContent({
      title: "Freestyle Action", 
      message: "AI is processing your freestyle action... (This feature is conceptual and results are simulated)", 
      type: "info"
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const outcomes = [
      { 
        success: true, 
        message: `The action seems to have a minor positive effect! (+5 HP)`, 
        effect: () => playerState.setPlayer(p => ({...p, hp: Math.min(effectivePlayerStats.maxHp, p.hp + 5)}))
      },
      { 
        success: true, 
        message: `The action confuses the enemy slightly! (${targetId ? gameState.currentEnemies.find(e => e.id === targetId)?.name : 'Target'} takes 3 damage)`, 
        effect: () => { 
          if(targetId) { 
            const enemy = gameState.currentEnemies.find(e => e.id === targetId); 
            if(enemy) { 
              const newHp = Math.max(0, enemy.hp - 3); 
              gameState.setCurrentEnemies(es => es.map(e => e.id === targetId ? {...e, hp: newHp} : e)); 
              if(newHp <= 0) {
                // Handle enemy defeat
                gameState.addLog('System', `${enemy.name} defeated!`, 'success');
                gameState.setCurrentEnemies(prev => {
                  const updatedEnemies = prev.filter(e => e.id !== targetId);
                  
                  // Check if all enemies defeated after this update
                  if (updatedEnemies.length === 0 || updatedEnemies.every(e => e.hp <= 0)) {
                    setTimeout(() => {
                      gameState.addLog('System', 'Victory! All enemies defeated.', 'success');
                      gameState.showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
                      gameState.setGameState('GAME_OVER_VICTORY');
                    }, 100);
                  }
                  
                  return updatedEnemies;
                });
              }
            } 
          } 
        } 
      },
      { 
        success: false, 
        message: `The action fizzles with no noticeable effect.`, 
        effect: () => {}
      },
      { 
        success: false, 
        message: `The action backfires slightly! (-2 MP)`, 
        effect: () => playerState.setPlayer(p => ({...p, mp: Math.max(0, p.mp - 2)}))
      },
    ];
    
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    gameState.addLog('System', randomOutcome.message, randomOutcome.success ? 'info' : 'status');
    randomOutcome.effect();
    gameState.setModalContent(null);
    gameState.setIsPlayerTurn(false);
  }, [playerState, gameState, effectivePlayerStats]);

  const handleUseAbility = useCallback((abilityId: string, targetId: string | null) => {
    const ability = playerState.player.abilities.find(a => a.id === abilityId);
    if (!ability) {
      gameState.addLog('Player', 'ability not found.', 'error');
      return;
    }
    
    if (playerState.player.ep < ability.epCost) {
      gameState.addLog('Player', `cannot use ${ability.name} (insufficient EP).`, 'error');
      return;
    }
    
    // Check for status effects that prevent ability use
    if (playerState.player.activeStatusEffects.some(eff => ['Stun', 'Sleep'].includes(eff.name))) {
      const statusEffect = playerState.player.activeStatusEffects.find(eff => ['Stun', 'Sleep'].includes(eff.name));
      gameState.addLog('Player', `cannot use abilities due to ${statusEffect?.name}!`, 'status');
      return;
    }
    
    // Deduct EP cost
    playerState.setPlayer(prev => ({ ...prev, ep: prev.ep - ability.epCost }));
    
    gameState.addLog('Player', `uses ${ability.name}!`, 'action');
    
    // Simple ability effect simulation
    switch (ability.effectType) {
      case 'SELF_HEAL':
        const healAmount = 15 + Math.floor(effectivePlayerStats.mind * 0.5);
        playerState.setPlayer(prev => ({ 
          ...prev, 
          hp: Math.min(effectivePlayerStats.maxHp, prev.hp + healAmount) 
        }));
        gameState.addLog('Player', `heals ${healAmount} HP.`, 'heal');
        break;
        
      case 'ENEMY_DEBUFF':
        if (targetId) {
          const targetEnemy = gameState.currentEnemies.find(e => e.id === targetId);
          if (targetEnemy) {
            const damage = 10 + Math.floor(effectivePlayerStats.body * 0.8);
            const newHp = Math.max(0, targetEnemy.hp - damage);
            gameState.setCurrentEnemies(prev => 
              prev.map(e => e.id === targetId ? { ...e, hp: newHp } : e)
            );
            gameState.addLog('Player', `deals ${damage} ability damage to ${targetEnemy.name}.`, 'damage');
            
            if (newHp <= 0) {
              gameState.addLog('System', `${targetEnemy.name} defeated!`, 'success');
              gameState.setCurrentEnemies(prev => {
                const updatedEnemies = prev.filter(e => e.id !== targetId);
                
                // Check if all enemies defeated after this update
                if (updatedEnemies.length === 0 || updatedEnemies.every(e => e.hp <= 0)) {
                  setTimeout(() => {
                    gameState.addLog('System', 'Victory! All enemies defeated.', 'success');
                    gameState.showMessageModal('Victory!', 'All enemies have been defeated!', 'success');
                    gameState.setGameState('GAME_OVER_VICTORY');
                  }, 100);
                }
                
                return updatedEnemies;
              });
            }
          }
        }
        break;
        
      default:
        gameState.addLog('System', `${ability.name} effect applied.`, 'info');
    }
    
    gameState.setIsPlayerTurn(false);
  }, [playerState, gameState, effectivePlayerStats]);

  // Confirmation handlers
  const handleConfirmSpellCraft = useCallback(() => {
    if (gameState.pendingSpellCraftData) {
      const result = SpellCraftingUtils.confirmSpellCraft(playerState.player, gameState.pendingSpellCraftData);
      if (result.success && result.updatedPlayer) {
        playerState.setPlayer(() => result.updatedPlayer!);
        gameState.setPendingSpellCraftData(null);
        gameState.showMessageModal('Spell Crafted!', `Successfully crafted spell: ${result.spell?.name}`, 'success');
        gameState.setGameState('HOME');
    } else {
        gameState.showMessageModal('Spell Crafting Error', result.error || 'Failed to craft spell', 'error');
      }
    }
  }, [playerState, gameState]);

  const handleConfirmSpellEdit = useCallback(() => {
    if (gameState.pendingSpellEditData && gameState.originalSpellForEdit) {
      const result = SpellCraftingUtils.confirmSpellEdit(playerState.player, gameState.originalSpellForEdit, gameState.pendingSpellEditData);
      if (result.success && result.updatedPlayer) {
        playerState.setPlayer(() => result.updatedPlayer!);
        gameState.setPendingSpellEditData(null);
        gameState.setOriginalSpellForEdit(null);
        gameState.showMessageModal('Spell Edited!', `Successfully edited spell: ${result.spell?.name}`, 'success');
        gameState.setGameState('HOME');
    } else {
        gameState.showMessageModal('Spell Editing Error', result.error || 'Failed to edit spell', 'error');
      }
    }
  }, [playerState, gameState]);

  const handleConfirmItemCraft = useCallback(() => {
    if (gameState.pendingItemCraftData) {
      const result = ItemManagementUtils.confirmItemCraft(playerState.player, gameState.pendingItemCraftData);
      if (result.success && result.updatedPlayer) {
        playerState.setPlayer(() => result.updatedPlayer!);
        gameState.setPendingItemCraftData(null);
        gameState.showMessageModal('Item Crafted!', `Successfully crafted item: ${result.item?.name}`, 'success');
        gameState.setGameState('HOME');
        } else {
        gameState.showMessageModal('Item Crafting Error', result.error || 'Failed to craft item', 'error');
      }
    }
  }, [playerState, gameState]);

  const handleCancelCrafting = useCallback(() => {
    gameState.setPendingSpellCraftData(null);
    gameState.setPendingSpellEditData(null);
    gameState.setPendingItemCraftData(null);
    gameState.setOriginalSpellForEdit(null);
    gameState.setGameState('HOME');
  }, [gameState]);

  // Settings handlers
  const handleToggleLegacyFooter = useCallback((value: boolean) => {
    gameState.setUseLegacyFooter(value);
  }, [gameState]);

  const handleToggleDebugMode = useCallback((value: boolean) => {
    gameState.setDebugMode(value);
  }, [gameState]);

  const handleToggleAutoSave = useCallback((value: boolean) => {
    gameState.setAutoSave(value);
  }, [gameState]);

  const handleSetGameState = useCallback((state: string) => {
    gameState.setGameState(state as any);
  }, [gameState]);

  const handleSetDefaultCharacterSheetTab = useCallback((tab: CharacterSheetTab) => {
    gameState.setDefaultCharacterSheetTab(tab);
  }, [gameState]);

  const handleOpenLootChest = useCallback(async (chestId: string) => {
    // Handle loot chest opening
    console.log('Opening loot chest:', chestId);
  }, []);

  // Prepare props for AppShell
  const appShellProps = {
    // Game state
    gameState: gameState.gameState,
    player: playerState.player,
    effectivePlayerStats,
    modalContent: gameState.modalContent,
    defaultCharacterSheetTab: gameState.defaultCharacterSheetTab || 'Main',
    useLegacyFooter: gameState.useLegacyFooter,
    maxRegisteredSpells,
    maxPreparedSpells,
    maxPreparedAbilities,
    pendingTraitUnlock,
    
    // Modal state
    isHelpWikiOpen: gameState.isHelpWikiOpen,
    isGameMenuOpen: gameState.isGameMenuOpen,
    isMobileMenuOpen: gameState.isMobileMenuOpen,
    
    // Navigation handlers
    onNavigateHome: handleNavigateHome,
    onOpenMobileMenu: () => gameState.setIsMobileMenuOpen(true),
    onOpenCraftingHub: handleOpenCraftingHub,
    
    // Modal handlers
    onOpenCharacterSheet: handleOpenCharacterSheet,
    onCloseHelpWiki: () => gameState.setIsHelpWikiOpen(false),
    onOpenHelpWiki: () => gameState.setIsHelpWikiOpen(true),
    onCloseGameMenu: () => gameState.setIsGameMenuOpen(false),
    onOpenGameMenu: () => gameState.setIsGameMenuOpen(true),
    onCloseMobileMenu: () => gameState.setIsMobileMenuOpen(false),
    onOpenParameters: () => {
      const context = createNavigationContext();
      NavigationController.navigateToParameters(context);
    },
    onExportSave: handleExportSave,
    onImportSave: handleImportSave,
    
    // Character sheet handlers
    onEquipItem: handleEquipItem,
    onUnequipItem: handleUnequipItem,
    onEditSpell: (spell: Spell) => {
      // Navigate to spell editing
      gameState.setGameState('SPELL_EDITING');
    },
    onPrepareSpell: handlePrepareSpell,
    onUnprepareSpell: handleUnprepareSpell,
    onPrepareAbility: handlePrepareAbility,
    onUnprepareAbility: handleUnprepareAbility,
    onOpenLootChest: handleOpenLootChest,
    onUseConsumable: handleUseConsumable,
    
    // Modal close handlers
    onCloseModal: () => gameState.setModalContent(null),
    onCloseCharacterSheet: () => gameState.setGameState('HOME'),
    onOpenSpellDesignStudio: () => {
      const context = createNavigationContext();
      NavigationController.navigateToSpellDesignStudio(context);
    },
    onOpenTraitsPage: () => {
      const context = createNavigationContext();
      NavigationController.navigateToTraitsPage(context);
    },
    
    // Utility functions
    showMessageModal: gameState.showMessageModal,
    
    // Combat state helpers
    isInCombatButNotOnCombatScreen: gameState.isInCombatButNotOnCombatScreen(),
    isInAnyCombat: gameState.isInAnyCombat(),
    onReturnToCombat: () => gameState.setGameState('IN_COMBAT'),
    
    // All ViewRouter props
    isLoading: gameState.isLoading,
    currentEnemies: gameState.currentEnemies,
    targetEnemyId: gameState.targetEnemyId,
    combatLog: gameState.combatLog,
    turn: gameState.turn,
    isPlayerTurn: gameState.isPlayerTurn,
    currentActingEnemyIndex: gameState.currentActingEnemyIndex,
    playerActionSkippedByStun: false, // This should come from game state if needed
    pendingSpellCraftData: gameState.pendingSpellCraftData,
    pendingItemCraftData: gameState.pendingItemCraftData,
    pendingSpellEditData: gameState.pendingSpellEditData,
    originalSpellForEdit: gameState.originalSpellForEdit,
    initialSpellPromptForStudio: gameState.initialSpellPromptForStudio,
    currentShopId: gameState.currentShopId,
    currentTavernId: gameState.currentTavernId,
    currentNPCId: gameState.currentNPCId,
    isWorldMapOpen: gameState.isWorldMapOpen,
    isExplorationJournalOpen: gameState.isExplorationJournalOpen,
    isTraveling: gameState.isTraveling,
    debugMode: gameState.debugMode,
    autoSave: gameState.autoSave,
    
    // All the ViewRouter event handlers
    onFindEnemy: handleFindEnemy,
    onExploreMap: handleExploreMap,
    onOpenResearchArchives: handleOpenResearchArchives,
    onOpenCamp: handleOpenCamp,
    onOpenHomestead: handleOpenHomestead,
    onAccessSettlement: handleAccessSettlement,
    onOpenNPCs: handleOpenNPCs,
    onOpenMultiplayer: handleOpenMultiplayer,
    onRestComplete: handleRestComplete,
    onStartHomesteadProject: handleStartHomesteadProject,
    onCompleteHomesteadProject: handleCompleteHomesteadProject,
    onUpgradeHomesteadProperty: handleUpgradeHomesteadProperty,
    onOpenShop: handleOpenShop,
    onOpenTavern: handleOpenTavern,
    onTalkToNPC: handleTalkToNPC,
    onExplorePointOfInterest: handleExplorePointOfInterest,
    onPurchaseItem: handlePurchaseItem,
    onPurchaseService: handlePurchaseService,
    onDiscoverRecipe: handleDiscoverRecipe,
    onCraftItem: handleCraftItem,
    onOpenTheorizeComponentLab: handleOpenTheorizeComponentLab,
    onAICreateComponent: handleAICreateComponent,
    onInitiateItemCraft: handleInitiateItemCraft,
    onFinalizeSpellDesign: handleFinalizeSpellDesign,
    onOldSpellCraftInitiation: handleOldSpellCraftInitiation,
    onInitiateSpellRefinement: handleInitiateSpellRefinement,
    onCraftTrait: handleCraftTrait,
    onSetTargetEnemy: handleSetTargetEnemy,
    onPlayerAttack: handlePlayerAttack,
    onPlayerBasicAttack: handlePlayerBasicAttack,
    onPlayerDefend: handlePlayerDefend,
    onPlayerFlee: handlePlayerFlee,
    onPlayerFreestyleAction: handlePlayerFreestyleAction,
    onUseAbility: handleUseAbility,
    onConfirmSpellCraft: handleConfirmSpellCraft,
    onConfirmSpellEdit: handleConfirmSpellEdit,
    onConfirmItemCraft: handleConfirmItemCraft,
    onCancelCrafting: handleCancelCrafting,
    onToggleLegacyFooter: handleToggleLegacyFooter,
    onToggleDebugMode: handleToggleDebugMode,
    onToggleAutoSave: handleToggleAutoSave,
    onSetGameState: handleSetGameState,
    onSetDefaultCharacterSheetTab: handleSetDefaultCharacterSheetTab,
    
    // Utility functions for ViewRouter
    getPreparedSpells,
    getPreparedAbilities,
    checkResources,
    renderResourceList,
  };

  return <AppShell {...appShellProps} />;
};

export default App;
