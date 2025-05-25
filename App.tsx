import React, { useState, useEffect, useCallback } from 'react';
import { Player, Spell, Enemy, CombatActionLog, GameState, GeneratedSpellData, GeneratedEnemyData, Trait, GeneratedTraitData, Quest, GeneratedQuestData, ResourceType, ResourceCost, ActiveStatusEffect, StatusEffectName, SpellStatusEffect, ItemType, Consumable, Equipment, GameItem, GeneratedConsumableData, GeneratedEquipmentData, EquipmentSlot as GenericEquipmentSlot, DetailedEquipmentSlot, PlayerEffectiveStats, Ability, AbilityEffectType, CharacterSheetTab, SpellIconName, EncyclopediaSubTabId } from './types'; 
import { INITIAL_PLAYER_STATS, STARTER_SPELL, ENEMY_DIFFICULTY_XP_REWARD, MAX_SPELLS_PER_LEVEL_BASE, PREPARED_SPELLS_PER_LEVEL_BASE, PREPARED_ABILITIES_PER_LEVEL_BASE, FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL, DEFAULT_QUEST_ICON, DEFAULT_TRAIT_ICON, INITIAL_PLAYER_INVENTORY, AVAILABLE_RESOURCES, BATTLE_RESOURCE_REWARD_TYPES, BATTLE_RESOURCE_REWARD_QUANTITY_MIN, BATTLE_RESOURCE_REWARD_QUANTITY_MAX, RESOURCE_ICONS, STATUS_EFFECT_ICONS, PLAYER_BASE_SPEED_FROM_REFLEX, INITIAL_PLAYER_EP, PLAYER_EP_REGEN_PER_TURN, STARTER_ABILITIES, PLAYER_BASE_BODY, PLAYER_BASE_MIND, PLAYER_BASE_REFLEX, HP_PER_BODY, HP_PER_LEVEL, BASE_HP, MP_PER_MIND, MP_PER_LEVEL, BASE_MP, EP_PER_REFLEX, EP_PER_LEVEL, BASE_EP, SPEED_PER_REFLEX, PHYSICAL_POWER_PER_BODY, MAGIC_POWER_PER_MIND, DEFENSE_PER_BODY, DEFENSE_PER_REFLEX, INITIAL_PLAYER_NAME, DEFAULT_ENCYCLOPEDIA_ICON, DEFENDING_DEFENSE_BONUS_PERCENTAGE } from './constants';
import { generateSpell, editSpell, generateEnemy, generateTrait, generateMainQuestStory, generateConsumable, generateEquipment } from './services/geminiService';
import { attemptEnhancement, deductResources as deductEnhancementResources, generateItemId } from './components/items/item_utils';

import ActionButton from './components/ActionButton'; 
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import { GetSpellIcon, BagIcon, CollectionIcon } from './components/IconComponents'; 
import Header from './components/Header';
import Footer from './components/Footer';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import CraftingHubModal from './components/CraftingHubModal';
import HelpWikiModal from './components/HelpWikiModal'; 
import GameMenuModal from './components/GameMenuModal'; 
import CampView from './components/CampView';
import ExploreView from './components/exploration/ExploreView';

import HomeScreenView from './components/HomeScreenView';
import SpellCraftingView from './components/SpellCraftingView';
import TraitCraftingView from './components/TraitCraftingView';
import SpellEditingView from './components/SpellEditingView';
import CombatView from './components/CombatView';
import ConfirmationView from './components/ConfirmationView';
import GameOverView from './components/GameOverView';
import ItemEnhancementModal from './components/ItemEnhancementModal';


const LOCAL_STORAGE_KEY = 'rpgSpellCrafterPlayerV13'; // Incremented version for bestiary

export const App: React.FC<{}> = (): React.ReactElement => {
  const [player, setPlayer] = useState<Player>(() => {
    const savedPlayer = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPlayer) {
      try {
        const parsed = JSON.parse(savedPlayer) as Player;
        const validatedPlayer: Player = {
          ...INITIAL_PLAYER_STATS, 
          name: parsed.name || INITIAL_PLAYER_NAME,
          body: parsed.body ?? PLAYER_BASE_BODY,
          mind: parsed.mind ?? PLAYER_BASE_MIND,
          reflex: parsed.reflex ?? PLAYER_BASE_REFLEX,
          hp: parsed.hp, 
          mp: parsed.mp, 
          ep: parsed.ep ?? INITIAL_PLAYER_EP,
          level: parsed.level ?? 1,
          xp: parsed.xp ?? 0,
          xpToNextLevel: parsed.xpToNextLevel ?? 100,
          spells: Array.isArray(parsed.spells) && parsed.spells.length > 0 ? parsed.spells : [STARTER_SPELL],
          preparedSpellIds: Array.isArray(parsed.preparedSpellIds) && parsed.preparedSpellIds.length > 0 ? parsed.preparedSpellIds : (Array.isArray(parsed.spells) && parsed.spells.length > 0 ? [parsed.spells[0]?.id].filter(Boolean) as string[] : [STARTER_SPELL.id]),
          traits: Array.isArray(parsed.traits) ? parsed.traits : [],
          quests: Array.isArray(parsed.quests) ? parsed.quests : [],
          activeStatusEffects: Array.isArray(parsed.activeStatusEffects) ? parsed.activeStatusEffects : [],
          inventory: parsed.inventory || { ...INITIAL_PLAYER_INVENTORY },
          items: Array.isArray(parsed.items) ? parsed.items : [],
          equippedItems: parsed.equippedItems || {}, 
          abilities: Array.isArray(parsed.abilities) && parsed.abilities.length > 0 ? parsed.abilities : STARTER_ABILITIES,
          preparedAbilityIds: Array.isArray(parsed.preparedAbilityIds) ? parsed.preparedAbilityIds : (STARTER_ABILITIES.length > 0 ? [STARTER_ABILITIES[0].id] : []),
          iconName: parsed.iconName || 'UserIcon',
          maxHp: parsed.maxHp || 0, 
          maxMp: parsed.maxMp || 0,
          maxEp: parsed.maxEp || 0,
          speed: parsed.speed || 0,
          bestiary: parsed.bestiary || {}, // Initialize bestiary
        };
        validatedPlayer.preparedSpellIds = validatedPlayer.preparedSpellIds.filter(id => validatedPlayer.spells.some(s => s.id === id));
        if (validatedPlayer.preparedSpellIds.length === 0 && validatedPlayer.spells.length > 0) {
            validatedPlayer.preparedSpellIds = [validatedPlayer.spells[0].id];
        }
        validatedPlayer.preparedAbilityIds = validatedPlayer.preparedAbilityIds.filter(id => validatedPlayer.abilities.some(ab => ab.id === id));
        if (validatedPlayer.preparedAbilityIds.length === 0 && validatedPlayer.abilities.length > 0) {
            validatedPlayer.preparedAbilityIds = [validatedPlayer.abilities[0].id];
        }
        return validatedPlayer;
      } catch (e) {
        console.error("Failed to load player data from localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    return {
      ...INITIAL_PLAYER_STATS,
      name: INITIAL_PLAYER_NAME,
      body: PLAYER_BASE_BODY,
      mind: PLAYER_BASE_MIND,
      reflex: PLAYER_BASE_REFLEX,
      hp: 0, maxHp: 0, mp: 0, maxMp: 0, ep: INITIAL_PLAYER_EP, maxEp: 0, speed: 0,
      inventory: { ...INITIAL_PLAYER_INVENTORY },
      spells: [STARTER_SPELL],
      preparedSpellIds: [STARTER_SPELL.id],
      traits: [],
      quests: [],
      activeStatusEffects: [],
      items: [],
      equippedItems: {},
      abilities: STARTER_ABILITIES,
      preparedAbilityIds: STARTER_ABILITIES.length > 0 ? [STARTER_ABILITIES[0].id] : [],
      iconName: 'UserIcon',
      bestiary: {}, // Initialize bestiary for new player
    };
  });

  const [currentEnemies, setCurrentEnemies] = useState<Enemy[]>([]);
  const [targetEnemyId, setTargetEnemyId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [combatLog, setCombatLog] = useState<CombatActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [pendingTraitUnlock, setPendingTraitUnlock] = useState(false);
  const [defaultCharacterSheetTab, setDefaultCharacterSheetTab] = useState<CharacterSheetTab | undefined>('Main');
  const [currentActingEnemyIndex, setCurrentActingEnemyIndex] = useState(0);

  // States for Item Enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementMessage, setEnhancementMessage] = useState<string | null>(null);

  const [pendingSpellCraftData, setPendingSpellCraftData] = useState<GeneratedSpellData | null>(null);
  const [pendingSpellEditData, setPendingSpellEditData] = useState<GeneratedSpellData | null>(null);
  const [originalSpellForEdit, setOriginalSpellForEdit] = useState<Spell | null>(null);

  // Updated type for pendingItemCraftData to include quantity
  const [pendingItemCraftData, setPendingItemCraftData] = useState<{ data: GeneratedConsumableData | GeneratedEquipmentData; quantity: number; } | null>(null);
  const [playerActionSkippedByStun, setPlayerActionSkippedByStun] = useState(false);

  const [isHelpWikiOpen, setIsHelpWikiOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  // State for opening ItemEnhancementModal directly from inventory
  const [directEnhanceItem, setDirectEnhanceItem] = useState<Equipment | null>(null);
  const [isDirectEnhanceModalOpen, setIsDirectEnhanceModalOpen] = useState(false);
  const [targetEncyclopediaSubTab, setTargetEncyclopediaSubTab] = useState<EncyclopediaSubTabId | undefined>(undefined); // Added state

  const handleRest = () => setGameState('CAMP_VIEW');
  const handleExplore = () => setGameState('EXPLORE_VIEW'); // Updated
  const handleGuild = () => console.log("Guild action triggered"); // Placeholder
  const handleCommunity = () => console.log("Community action triggered"); // Placeholder
  const handleResearch = () => console.log("Research action triggered"); // Placeholder
  const handleBoutique = () => console.log("Boutique action triggered"); // Placeholder

  const handleSleep = () => {
    setIsLoading(true);
    // Simulate a short delay for resting
    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        hp: effectivePlayerStats.maxHp, // Restore HP to full
        mp: effectivePlayerStats.maxMp, // Restore MP to full
        activeStatusEffects: prev.activeStatusEffects.filter(effect => 
          // Remove temporary negative effects, keep persistent or positive ones
          // This is a basic example; you might want more nuanced logic here
          effect.name === 'Regeneration' || 
          effect.name === 'StrengthenBody' || 
          effect.name === 'StrengthenMind' || 
          effect.name === 'StrengthenReflex'
          // Add other positive/persistent effects to keep after resting
        )
      }));
      setModalContent({
        title: "Rested",
        message: `You feel refreshed! HP and MP have been fully restored. Some temporary effects have worn off.`,
        type: 'success'
      });
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate resting
  };

  const calculateEffectiveStats = useCallback((p: Player): PlayerEffectiveStats => {
    let effectiveBody = p.body;
    let effectiveMind = p.mind;
    let effectiveReflex = p.reflex;
    let bonusMaxHp = 0;
    let bonusMaxMp = 0;
    let bonusMaxEp = 0;
    let bonusSpeed = 0;
    let effectiveDefense = 0;


    Object.values(p.equippedItems).forEach(itemId => {
        if (!itemId) return;
        const item = p.items.find(i => i.id === itemId) as Equipment | undefined; 
        if (item && item.itemType === 'Equipment' && item.statsBoost) {
            effectiveBody += item.statsBoost.body || 0;
            effectiveMind += item.statsBoost.mind || 0;
            effectiveReflex += item.statsBoost.reflex || 0;
            bonusSpeed += item.statsBoost.speed || 0;
            bonusMaxHp += item.statsBoost.maxHp || 0;
            bonusMaxMp += item.statsBoost.maxMp || 0;
            bonusMaxEp += item.statsBoost.maxEp || 0;
        }
    });

    p.activeStatusEffects.forEach(effect => {
        if (effect.magnitude) {
            if (effect.name === 'TEMP_BODY_UP' || effect.name === 'StrengthenBody') effectiveBody += effect.magnitude;
            if (effect.name === 'TEMP_MIND_UP' || effect.name === 'StrengthenMind') effectiveMind += effect.magnitude;
            if (effect.name === 'TEMP_REFLEX_UP' || effect.name === 'StrengthenReflex') effectiveReflex += effect.magnitude;
            if (effect.name === 'TEMP_SPEED_UP') bonusSpeed += effect.magnitude;
            if (effect.name === 'WeakenBody') effectiveBody = Math.max(1, effectiveBody - effect.magnitude);
            if (effect.name === 'WeakenMind') effectiveMind = Math.max(1, effectiveMind - effect.magnitude);
            if (effect.name === 'WeakenReflex') effectiveReflex = Math.max(1, effectiveReflex - effect.magnitude);
            if (effect.name === 'TEMP_MAX_HP_UP') bonusMaxHp += effect.magnitude;
            if (effect.name === 'TEMP_MAX_MP_UP') bonusMaxMp += effect.magnitude;
        }
    });

    const maxHp = BASE_HP + (p.level * HP_PER_LEVEL) + (effectiveBody * HP_PER_BODY) + bonusMaxHp;
    const maxMp = BASE_MP + (p.level * MP_PER_LEVEL) + (effectiveMind * MP_PER_MIND) + bonusMaxMp;
    const maxEp = BASE_EP + (p.level * EP_PER_LEVEL) + (effectiveReflex * EP_PER_REFLEX) + bonusMaxEp;
    const speed = PLAYER_BASE_SPEED_FROM_REFLEX + (effectiveReflex * SPEED_PER_REFLEX) + bonusSpeed;
    
    const physicalPower = Math.floor(effectiveBody * PHYSICAL_POWER_PER_BODY);
    const magicPower = Math.floor(effectiveMind * MAGIC_POWER_PER_MIND);
    effectiveDefense = Math.floor(effectiveBody * DEFENSE_PER_BODY + effectiveReflex * DEFENSE_PER_REFLEX);
    
    if (p.activeStatusEffects.some(eff => eff.name === 'Defending')) {
        effectiveDefense += Math.floor(effectiveDefense * DEFENDING_DEFENSE_BONUS_PERCENTAGE);
    }

    return { maxHp, maxMp, maxEp, speed, body: effectiveBody, mind: effectiveMind, reflex: effectiveReflex, physicalPower, magicPower, defense: effectiveDefense };
  }, []);
  
  const effectivePlayerStats = calculateEffectiveStats(player);
  
  useEffect(() => {
    setPlayer(prev => ({
      ...prev,
      maxHp: effectivePlayerStats.maxHp,
      hp: prev.hp === 0 || prev.hp > effectivePlayerStats.maxHp || (prev.maxHp === 0 && effectivePlayerStats.maxHp > 0) ? effectivePlayerStats.maxHp : prev.hp,
      maxMp: effectivePlayerStats.maxMp,
      mp: prev.mp === 0 || prev.mp > effectivePlayerStats.maxMp || (prev.maxMp === 0 && effectivePlayerStats.maxMp > 0) ? effectivePlayerStats.maxMp : prev.mp,
      maxEp: effectivePlayerStats.maxEp,
      ep: prev.ep === 0 || prev.ep > effectivePlayerStats.maxEp || (prev.maxEp === 0 && effectivePlayerStats.maxEp > 0) ? effectivePlayerStats.maxEp : prev.ep,
      speed: effectivePlayerStats.speed,
    }));
  }, [effectivePlayerStats.maxHp, effectivePlayerStats.maxMp, effectivePlayerStats.maxEp, effectivePlayerStats.speed, player.activeStatusEffects]); // Added player.activeStatusEffects for Defending status

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
    if (gameState !== 'CHARACTER_SHEET') { // Reset target sub-tab when not in character sheet
      setTargetEncyclopediaSubTab(undefined);
    }
  }, [player, gameState]); // Added gameState to dependencies


  const fetchInitialMainQuestIfNeeded = useCallback(async () => {
    const hasMainQuest = player.quests.some(q => q.isMainQuest && q.status === 'active');
    if (!hasMainQuest && player.level >= 1 && !isLoading) {
      setIsLoading(true);
      try {
        const questData = await generateMainQuestStory(player.level, player.quests);
        const newQuest: Quest = { 
          ...questData, 
          id: `quest-main-${Date.now()}`, 
          status: 'active', 
          isMainQuest: true, 
          iconName: questData.iconName || DEFAULT_QUEST_ICON 
        };
        setPlayer(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
        setModalContent({ 
          title: "New Main Quest!", 
          message: `You've received: ${newQuest.title}. Check your Character Sheet!`, 
          type: 'info' 
        });
      } catch (error) {
        console.error("Failed to fetch initial main quest:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setModalContent({ 
          title: "Quest Error", 
          message: `Could not fetch a new main quest: ${errorMessage}. Please try again later or contact support if the issue persists.`, 
          type: 'error' 
        });
        
        // Log detailed error information
        const errorDetails = {
          playerLevel: player.level,
          hasMainQuest,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          quests: player.quests.length
        };
        console.error("Quest fetch error details:", errorDetails);
      } finally {
        setIsLoading(false);
      }
    }
  }, [player.level, player.quests, isLoading]);

  useEffect(() => { if (gameState === 'HOME') fetchInitialMainQuestIfNeeded(); }, [gameState, fetchInitialMainQuestIfNeeded]);

  const addLog = useCallback((actor: CombatActionLog['actor'], message: string, type?: CombatActionLog['type']) => {
    setCombatLog(prevLog => [...prevLog, { id: `${Date.now()}-${Math.random()}`, turn, actor, message, type }]);
  }, [turn]);

  const maxRegisteredSpells = player.level + MAX_SPELLS_PER_LEVEL_BASE;
  const maxPreparedSpells = player.level + PREPARED_SPELLS_PER_LEVEL_BASE;
  const maxPreparedAbilities = player.level + PREPARED_ABILITIES_PER_LEVEL_BASE;

  const getPreparedSpells = useCallback((): Spell[] => player.spells.filter(spell => player.preparedSpellIds.includes(spell.id)), [player.spells, player.preparedSpellIds]);
  const getPreparedAbilities = useCallback((): Ability[] => player.abilities.filter(ability => player.preparedAbilityIds.includes(ability.id)), [player.abilities, player.preparedAbilityIds]);

  const checkResources = (costs?: ResourceCost[]): boolean => {
    if (!costs || costs.length === 0) return true;
    return costs.every(cost => (player.inventory[cost.type] || 0) >= cost.quantity);
  };

  const deductResources = (costs?: ResourceCost[]): boolean => {
    if (!costs || !checkResources(costs)) return false;
    const newInventory = { ...player.inventory };
    costs.forEach(cost => { newInventory[cost.type] = (newInventory[cost.type] || 0) - cost.quantity; });
    setPlayer(prev => ({ ...prev, inventory: newInventory }));
    return true;
  };
  
  const handleOpenInventory = () => { setDefaultCharacterSheetTab('Inventory'); setGameState('CHARACTER_SHEET'); };
  const handleOpenSpellbook = () => { setDefaultCharacterSheetTab('Spells'); setGameState('CHARACTER_SHEET'); };
  const handleOpenCraftingHub = () => setGameState('CRAFTING_HUB');
  const handleOpenTraitsPage = () => {
    const expectedTraits = player.level >= FIRST_TRAIT_LEVEL ? Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 : 0;
    if ((player.level >= FIRST_TRAIT_LEVEL && player.traits.length < expectedTraits) || pendingTraitUnlock) setGameState('TRAIT_CRAFTING');
    else { setDefaultCharacterSheetTab('Traits'); setGameState('CHARACTER_SHEET'); }
  };
  const handleOpenQuestsPage = () => { setDefaultCharacterSheetTab('Quests'); setGameState('CHARACTER_SHEET'); };
  const handleOpenCharacterSheet = (tab: CharacterSheetTab = 'Main') => { setDefaultCharacterSheetTab(tab); setGameState('CHARACTER_SHEET'); };
  const handleOpenEncyclopedia = () => { setDefaultCharacterSheetTab('Encyclopedia'); setGameState('CHARACTER_SHEET'); };

  // Handler to open enhancement modal from inventory
  const handleOpenEnhancementModalFromInventory = (item: Equipment) => {
    setDirectEnhanceItem(item);
    setIsDirectEnhanceModalOpen(true);
  };

  const handleOpenHelpWiki = () => setIsHelpWikiOpen(true);
  const handleCloseHelpWiki = () => setIsHelpWikiOpen(false);
  const handleOpenGameMenu = () => setIsGameMenuOpen(true);
  const handleCloseGameMenu = () => setIsGameMenuOpen(false);
  
  const handleNavigateHome = () => {
    setGameState('HOME');
    setCurrentEnemies([]); // Clear combat state
    setTargetEnemyId(null);
    setCombatLog([]);
    setModalContent(null); // Clear any lingering modals
  };


  const handleInitiateSpellCraft = async (promptText: string) => {
    if (player.spells.length >= maxRegisteredSpells) { setModalContent({ title: "Spell Collection Full", message: `Max ${maxRegisteredSpells} spells at level ${player.level}.`, type: 'info' }); return; }
    setIsLoading(true);
    try { const spellData = await generateSpell(promptText); setPendingSpellCraftData(spellData); setGameState('SPELL_CRAFT_CONFIRMATION'); } 
    catch (error) { console.error("Spell idea error:", error); setModalContent({ title: "Generation Failed", message: error instanceof Error ? error.message : "Could not generate spell idea.", type: 'error' }); } 
    finally { setIsLoading(false); }
  };

  const handleConfirmSpellCraft = () => {
    if (!pendingSpellCraftData || !checkResources(pendingSpellCraftData.resourceCost)) { setModalContent({ title: "Crafting Failed", message: "Insufficient resources.", type: 'error' }); return; }
    deductResources(pendingSpellCraftData.resourceCost);
    const newSpell: Spell = { ...pendingSpellCraftData, id: `spell-${Date.now()}` };
    setPlayer(prev => ({ ...prev, spells: [...prev.spells, newSpell] }));
    setModalContent({ title: "Spell Crafted!", message: `${newSpell.name} added to collection.`, type: 'success' });
    setPendingSpellCraftData(null); setGameState('SPELL_CRAFTING'); 
  };

  const handleInitiateEditSpell = (spell: Spell) => { setOriginalSpellForEdit(spell); setGameState('SPELL_EDITING'); };

  const handleInitiateSpellRefinement = async (originalSpell: Spell, refinementPrompt: string) => {
    setIsLoading(true);
    try { const editedSpellData = await editSpell(originalSpell, refinementPrompt); setPendingSpellEditData(editedSpellData); setOriginalSpellForEdit(originalSpell); setGameState('SPELL_EDIT_CONFIRMATION'); } 
    catch (error) { console.error("Spell refinement error:", error); setModalContent({ title: "Refinement Failed", message: error instanceof Error ? error.message : "Could not generate refinement.", type: 'error' }); } 
    finally { setIsLoading(false); }
  };

  const handleConfirmSpellEdit = () => {
    if (!pendingSpellEditData || !originalSpellForEdit || !checkResources(pendingSpellEditData.resourceCost)) { setModalContent({ title: "Refinement Failed", message: "Insufficient resources.", type: 'error' }); return; }
    deductResources(pendingSpellEditData.resourceCost);
    const updatedSpell: Spell = { ...originalSpellForEdit, ...pendingSpellEditData };
    setPlayer(prev => ({ ...prev, spells: prev.spells.map(s => s.id === updatedSpell.id ? updatedSpell : s) }));
    setModalContent({ title: "Spell Refined!", message: `${updatedSpell.name} updated!`, type: 'success' });
    setPendingSpellEditData(null); setOriginalSpellForEdit(null); setDefaultCharacterSheetTab('Spells'); setGameState('CHARACTER_SHEET');
  };

  const handleCraftTrait = async (promptText: string) => {
    setIsLoading(true);
    try { const traitData = await generateTrait(promptText, player.level); const newTrait: Trait = { ...traitData, id: `trait-${Date.now()}`, iconName: traitData.iconName || DEFAULT_TRAIT_ICON }; setPlayer(prev => ({...prev, traits: [...prev.traits, newTrait]})); setModalContent({ title: "Trait Acquired!", message: `Gained: ${newTrait.name}!`, type: 'success' }); setGameState('HOME'); setPendingTraitUnlock(false); } 
    catch (error) { console.error("Trait crafting error:", error); setModalContent({ title: "Trait Crafting Failed", message: error instanceof Error ? error.message : "Could not craft trait.", type: 'error' }); } 
    finally { setIsLoading(false); }
  };

  const handleInitiateItemCraft = async (promptText: string, itemType: ItemType, quantity: number) => {
    setIsLoading(true);
    try { 
      let itemData: GeneratedConsumableData | GeneratedEquipmentData; 
      if (itemType === 'Consumable') itemData = await generateConsumable(promptText, player.level); 
      else itemData = await generateEquipment(promptText, player.level); 
      // Store data along with quantity
      setPendingItemCraftData({ data: itemData, quantity }); 
      setGameState('ITEM_CRAFT_CONFIRMATION'); 
    } 
    catch (error) { console.error(`${itemType} idea error:`, error); setModalContent({ title: "Generation Failed", message: error instanceof Error ? error.message : `Could not generate ${itemType} idea.`, type: 'error' }); } 
    finally { setIsLoading(false); }
  };

  const handleConfirmItemCraft = () => {
    if (!pendingItemCraftData || !pendingItemCraftData.data) return;

    const { data: itemBlueprint, quantity } = pendingItemCraftData;
    const itemTypeCrafted: ItemType = (itemBlueprint as GeneratedEquipmentData).slot ? 'Equipment' : 'Consumable';

    // Calculate total resource cost for the given quantity
    const totalResourceCost: ResourceCost[] = [];
    if (itemBlueprint.resourceCost) {
      itemBlueprint.resourceCost.forEach(cost => {
        totalResourceCost.push({ type: cost.type, quantity: cost.quantity * quantity });
      });
    }

    if (!checkResources(totalResourceCost)) { 
      setModalContent({ title: "Craft Failed", message: "Insufficient resources for the requested quantity.", type: 'error' }); 
      return; 
    }
    deductResources(totalResourceCost);

    const newItemsArray: GameItem[] = [];
    for (let i = 0; i < quantity; i++) {
      let newItemEntry: GameItem;
      if (itemTypeCrafted === 'Equipment') {
        const equipmentData = itemBlueprint as GeneratedEquipmentData;
        newItemEntry = {
          id: generateItemId('equip'), // Unique ID for each item
          name: equipmentData.name,
          description: equipmentData.description,
          iconName: equipmentData.iconName,
          itemType: 'Equipment',
          slot: equipmentData.slot,
          statsBoost: equipmentData.statsBoost,
          originalStatsBoost: { ...equipmentData.statsBoost },
          resourceCost: equipmentData.resourceCost, // This is cost per item, for reference
          enhancementLevel: 0
        } as Equipment;
      } else {
        const consumableData = itemBlueprint as GeneratedConsumableData;
        newItemEntry = {
          id: generateItemId('consum'), // Unique ID for each item
          name: consumableData.name,
          description: consumableData.description,
          iconName: consumableData.iconName,
          itemType: 'Consumable',
          effectType: consumableData.effectType,
          magnitude: consumableData.magnitude,
          duration: consumableData.duration,
          statusToCure: consumableData.statusToCure,
          buffToApply: consumableData.buffToApply,
          resourceCost: consumableData.resourceCost // Cost per item
        } as Consumable;
      }
      newItemsArray.push(newItemEntry);
    }

    setPlayer(prev => ({ ...prev, items: [...prev.items, ...newItemsArray] }));
    const firstItemName = newItemsArray[0]?.name || 'item';
    setModalContent({ 
      title: `${itemTypeCrafted}${quantity > 1 ? 's' : ''} Crafted!`, 
      message: `${quantity}x ${firstItemName} added to inventory.`, 
      type: 'success' 
    });
    setPendingItemCraftData(null); setGameState('CRAFTING_HUB');
  };

  const handleAttemptEnhanceItem = (itemToEnhance: Equipment) => {
    if (!itemToEnhance) return;
    setIsEnhancing(true);
    setEnhancementMessage(null);

    const result = attemptEnhancement(itemToEnhance, player.inventory);
    let newInventoryResources = player.inventory;

    if (result.consumedResources.length > 0) {
        newInventoryResources = deductEnhancementResources(player.inventory, result.consumedResources);
    }

    let newPlayerItems = [...player.items];
    if (result.success && result.newItem) {
      newPlayerItems = player.items.map(item => 
        item.id === result.newItem!.id ? result.newItem! : item
      );
    }

    setPlayer(prevPlayer => ({
      ...prevPlayer,
      items: newPlayerItems,
      inventory: newInventoryResources,
    }));

    if (result.message) {
      setModalContent({
        title: 'Enhancement Result',
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
    }
    setIsEnhancing(false);
  };

  const handleEquipItem = (itemId: string, slot: DetailedEquipmentSlot) => {
    const itemToEquip = player.items.find(i => i.id === itemId) as Equipment | undefined;
    if (!itemToEquip || itemToEquip.itemType !== 'Equipment') return;
    setPlayer(prev => ({ ...prev, equippedItems: { ...prev.equippedItems, [slot]: itemToEquip.id } }));
  };
  const handleUnequipItem = (slot: DetailedEquipmentSlot) => {
    if (!player.equippedItems[slot]) return;
    setPlayer(prev => ({ ...prev, equippedItems: { ...prev.equippedItems, [slot]: null } }));
  };

  const handlePrepareSpell = (spell: Spell) => { if (player.preparedSpellIds.length < maxPreparedSpells) setPlayer(prev => ({ ...prev, preparedSpellIds: [...new Set([...prev.preparedSpellIds, spell.id])] })); };
  const handleUnprepareSpell = (spell: Spell) => setPlayer(prev => ({ ...prev, preparedSpellIds: prev.preparedSpellIds.filter(id => id !== spell.id) }));
  const handlePrepareAbility = (ability: Ability) => { if (player.preparedAbilityIds.length < maxPreparedAbilities) setPlayer(prev => ({ ...prev, preparedAbilityIds: [...new Set([...prev.preparedAbilityIds, ability.id])] })); };
  const handleUnprepareAbility = (ability: Ability) => setPlayer(prev => ({ ...prev, preparedAbilityIds: prev.preparedAbilityIds.filter(id => id !== ability.id) }));

  const processPlayerTurnStartEffects = useCallback((currentTurn: number): { isDefeated: boolean, isStunned: boolean } => {
    const playerEffectsResult = processStatusEffects(player, true, `player-start-${currentTurn}`);
    let playerCurrentHp = player.hp + playerEffectsResult.hpChange;
    const regeneratedEp = Math.min(effectivePlayerStats.maxEp, player.ep + PLAYER_EP_REGEN_PER_TURN);
    
    if (playerEffectsResult.hpChange > 0) addLog('Player', `regenerates ${playerEffectsResult.hpChange} HP from status effects.`, 'status');
    else if (playerEffectsResult.hpChange < 0) addLog('Player', `takes ${-playerEffectsResult.hpChange} damage from status effects.`, 'status');
    
    if (regeneratedEp > player.ep) addLog('Player', `recovers ${regeneratedEp - player.ep} EP.`, 'heal');
    
    setPlayer(prev => ({ ...prev, hp: Math.min(effectivePlayerStats.maxHp, Math.max(0, playerCurrentHp)), ep: regeneratedEp, activeStatusEffects: playerEffectsResult.newActiveEffects }));
    
    if (playerCurrentHp <= 0) { 
        addLog('System', 'Player succumbed to status effects!', 'info'); 
        setModalContent({ title: "Defeat!", message: "Overcome by status effects.", type: 'error' }); 
        setGameState('GAME_OVER_DEFEAT'); 
        return { isDefeated: true, isStunned: playerEffectsResult.isStunned }; 
    }

    if (playerEffectsResult.isStunned) { 
        addLog('Player', `is stunned! Turn skipped.`, 'status'); 
        setPlayerActionSkippedByStun(true); 
    }
    // No explicit setPlayerActionSkippedByStun(false) here; handled by useEffect.
    return { isDefeated: false, isStunned: playerEffectsResult.isStunned };
  }, [player, effectivePlayerStats, addLog, setGameState, setPlayerActionSkippedByStun]); 

  const handleFindEnemy = async () => {
    if (getPreparedSpells().length === 0 && getPreparedAbilities().length === 0 && !player.items.some(i => i.itemType === 'Consumable')) { 
        setModalContent({ title: "Unprepared", message: "Prepare spells/abilities or have consumables before seeking battle.", type: 'info'}); 
        return; 
    }
    setIsLoading(true); setCombatLog([]); const initialTurn = 1; setTurn(initialTurn); setPlayerActionSkippedByStun(false); 
    setPlayer(prev => ({ ...prev, activeStatusEffects: [] })); // Clear player status effects at start of new combat
    setCurrentActingEnemyIndex(0); // Reset acting enemy index

    try {
      const numberOfEnemies = Math.random() < 0.6 ? 1 : 2; // 60% chance for 1 enemy, 40% for 2
      const enemiesArray: Enemy[] = [];
      for (let i = 0; i < numberOfEnemies; i++) {
        const enemyData = await generateEnemy(player.level);
        const enemySpeed = enemyData.baseSpeed ?? (PLAYER_BASE_SPEED_FROM_REFLEX + Math.floor(enemyData.baseReflex * SPEED_PER_REFLEX));
        const newEnemy: Enemy = { ...enemyData, id: `enemy-${Date.now()}-${i}`, maxHp: enemyData.hp, speed: enemySpeed, activeStatusEffects: [], body: enemyData.baseBody, mind: enemyData.baseMind, reflex: enemyData.baseReflex };
        enemiesArray.push(newEnemy);

        // Add/Update enemy in bestiary
        setPlayer(prev => {
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
      
      setCurrentEnemies(enemiesArray);
      setTargetEnemyId(enemiesArray.length > 0 ? enemiesArray[0].id : null); // Target first enemy by default
      setGameState('IN_COMBAT'); 
      addLog('System', `${enemiesArray.map(e => `${e.name} (Lvl ${e.level})`).join(' and ')} appear!`, 'info');
      
      // Initiative: Player vs average speed of enemies
      const avgEnemySpeed = enemiesArray.reduce((sum, e) => sum + e.speed, 0) / enemiesArray.length;
      const playerSpeedRoll = effectivePlayerStats.speed + Math.floor(Math.random() * 6) + 1;
      const enemySpeedRoll = avgEnemySpeed + Math.floor(Math.random() * 6) + 1;

      addLog('System', `Player speed roll: ${playerSpeedRoll} (Effective: ${effectivePlayerStats.speed})`, 'speed');
      addLog('System', `Enemies average speed roll: ${enemySpeedRoll.toFixed(1)} (Avg Base: ${avgEnemySpeed.toFixed(1)})`, 'speed');
      
      if (playerSpeedRoll >= enemySpeedRoll) { 
        addLog('System', `Player acts first!`, 'speed'); 
        setIsPlayerTurn(true); 
        // processPlayerTurnStartEffects will be called by the main combat useEffect when isPlayerTurn becomes true
      } else { 
        addLog('System', `Enemies act first!`, 'speed'); 
        setIsPlayerTurn(false); 
      }
    } catch (error) { 
      console.error("Enemy generation error:", error); 
      setModalContent({ title: "Encounter Failed", message: error instanceof Error ? error.message : "Could not find an enemy.", type: 'error' }); 
      setGameState('HOME'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const calculateDamage = (baseDamage: number, attackerPower: number, defenderDefense: number, effectiveness: 'normal' | 'weak' | 'resistant' = 'normal') => {
    let modifiedDamage = baseDamage + attackerPower; 
    if (effectiveness === 'weak') modifiedDamage *= 1.5;
    if (effectiveness === 'resistant') modifiedDamage *= 0.5;
    const finalDamage = Math.max(1, Math.floor(modifiedDamage - defenderDefense));
    return finalDamage;
  };

  const processStatusEffects = (character: Player | Enemy, isPlayerCharacter: boolean, logIdPrefix: string): { hpChange: number; isStunned: boolean; newActiveEffects: ActiveStatusEffect[] } => {
    let totalHpChange = 0; let isStunnedThisTurn = false; const remainingEffects: ActiveStatusEffect[] = [];
    const charEffStats = isPlayerCharacter ? effectivePlayerStats : null; 
    const charMaxHp = isPlayerCharacter ? charEffStats!.maxHp : (character as Enemy).maxHp;

    const charName = isPlayerCharacter ? (character as Player).name || "Player" : (character as Enemy).name;

    character.activeStatusEffects.forEach(effect => {
      let currentHpForRegen = isPlayerCharacter ? (character as Player).hp : (character as Enemy).hp;
      switch (effect.name) {
        case 'Poison': case 'Burn': if (effect.magnitude) { totalHpChange -= effect.magnitude; 
addLog(isPlayerCharacter ? 'Player' : 'Enemy', `${charName} takes ${effect.magnitude} ${effect.name} damage.`, 'status'); } break;
        case 'Stun': case 'Freeze': isStunnedThisTurn = true; break;
        case 'Regeneration': case 'TEMP_HP_REGEN': if (effect.magnitude) { const actualHeal = Math.min(effect.magnitude, charMaxHp - (currentHpForRegen + totalHpChange) ); if(actualHeal > 0) { totalHpChange += actualHeal; 
addLog(isPlayerCharacter ? 'Player' : 'Enemy', `${charName} regenerates ${actualHeal} HP.`, 'status'); } } break;
        default: break;
      }
      const newDuration = effect.duration - 1;
      if (newDuration > 0) remainingEffects.push({ ...effect, duration: newDuration });
      else 
addLog(isPlayerCharacter ? 'Player' : 'Enemy', `${effect.name} on ${charName} has worn off.`, 'status');
    });
    return { hpChange: totalHpChange, isStunned: isStunnedThisTurn, newActiveEffects: remainingEffects };
  };

  const awardCombatRewards = (defeatedEnemies: Enemy[]) => {
    const totalXpGained = defeatedEnemies.reduce((sum, enemy) => sum + (ENEMY_DIFFICULTY_XP_REWARD.medium), 0); // Simplified XP for now
    addLog('System', `Player gains ${totalXpGained} XP!`, 'info');
    let newPlayerXp = player.xp + totalXpGained;
    let newPlayerLevel = player.level;
    let newXpToNextLevel = player.xpToNextLevel;
    let leveledUp = false;

    while (newPlayerXp >= newXpToNextLevel) {
      newPlayerLevel++;
      newPlayerXp -= newXpToNextLevel;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5); 
      leveledUp = true;
      addLog('System', `Player reached Level ${newPlayerLevel}!`, 'info');
      const expectedTraits = newPlayerLevel >= FIRST_TRAIT_LEVEL ? Math.floor((newPlayerLevel - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 : 0;
      if (player.traits.length < expectedTraits) setPendingTraitUnlock(true);
    }

    const awardedResources: ResourceCost[] = [];
    defeatedEnemies.forEach(() => { // Award resources per enemy
        for (let i = 0; i < BATTLE_RESOURCE_REWARD_TYPES; i++) {
            const randomResourceType = AVAILABLE_RESOURCES[Math.floor(Math.random() * AVAILABLE_RESOURCES.length)];
            const randomQuantity = Math.floor(Math.random() * (BATTLE_RESOURCE_REWARD_QUANTITY_MAX - BATTLE_RESOURCE_REWARD_QUANTITY_MIN + 1)) + BATTLE_RESOURCE_REWARD_QUANTITY_MIN;
            awardedResources.push({ type: randomResourceType, quantity: randomQuantity });
            addLog('System', `Found ${randomQuantity} ${randomResourceType}!`, 'resource');
        }
    });
    
    const newInventory = { ...player.inventory };
    awardedResources.forEach(res => { newInventory[res.type] = (newInventory[res.type] || 0) + res.quantity; });
    
    const updatedBestiary = { ...player.bestiary };
    defeatedEnemies.forEach(enemy => {
        if (updatedBestiary[enemy.id]) {
            updatedBestiary[enemy.id] = {
                ...updatedBestiary[enemy.id],
                vanquishedCount: (updatedBestiary[enemy.id].vanquishedCount || 0) + 1,
            };
        }
    });

    setPlayer(prev => ({ ...prev, xp: newPlayerXp, level: newPlayerLevel, xpToNextLevel: newXpToNextLevel, inventory: newInventory, bestiary: updatedBestiary }));
    if (leveledUp) setModalContent({ title: "Level Up!", message: `You reached level ${newPlayerLevel}! Your stats have improved.`, type: 'success' });
  };


  const endPlayerTurn = () => {
    // Remove Defending status if present
    setPlayer(prev => ({...prev, activeStatusEffects: prev.activeStatusEffects.filter(eff => eff.name !== 'Defending')}));
    
    setTurn(prev => prev + 1);
    setIsPlayerTurn(false);
    setCurrentActingEnemyIndex(0); // Reset for enemies' turn
  };

  const playerAttack = (spell: Spell, currentTargetId: string) => {
    const targetEnemy = currentEnemies.find(e => e.id === currentTargetId);
    if (!targetEnemy || player.mp < spell.manaCost || !isPlayerTurn || playerActionSkippedByStun) return;
    setPlayerActionSkippedByStun(false); 
    addLog('Player', `casts ${spell.name} at ${targetEnemy.name}!`); 
    setPlayer(prev => ({ ...prev, mp: prev.mp - spell.manaCost }));
    
    let actualDamageDealt = 0;
    let newEnemyHp = targetEnemy.hp;
    let newEnemyEffects = [...targetEnemy.activeStatusEffects];

    if (spell.damageType === 'Healing') {
      const healAmount = spell.damage + (spell.scalesWith === 'Mind' ? effectivePlayerStats.magicPower : 0);
      const actualHeal = Math.min(healAmount, effectivePlayerStats.maxHp - player.hp);
      setPlayer(prev => ({ ...prev, hp: prev.hp + actualHeal }));
      addLog('Player', `heals for ${actualHeal} HP.`, 'heal');
    } else if (spell.damage > 0) {
      const power = spell.scalesWith === 'Body' ? effectivePlayerStats.physicalPower : effectivePlayerStats.magicPower;
      let effectiveness: 'normal' | 'weak' | 'resistant' = 'normal';
      if (targetEnemy.weakness === spell.damageType) effectiveness = 'weak';
      if (targetEnemy.resistance === spell.damageType) effectiveness = 'resistant';
      
      actualDamageDealt = calculateDamage(spell.damage, power, targetEnemy.mind, effectiveness); // Assume mind for magic defense for now
      newEnemyHp = Math.max(0, targetEnemy.hp - actualDamageDealt);
      let logMessage = `${targetEnemy.name} takes ${actualDamageDealt} ${spell.damageType} damage.`;
      if (effectiveness === 'weak') logMessage += " (Weakness!)";
      if (effectiveness === 'resistant') logMessage += " (Resisted!)";
      addLog('Player', logMessage, 'damage');
    }

    if (spell.statusEffectInflict) {
      const { name, duration, magnitude, chance } = spell.statusEffectInflict;
      if (Math.random() * 100 < chance) {
        const existingEffectIndex = newEnemyEffects.findIndex(e => e.name === name);
        if (existingEffectIndex > -1) {
            newEnemyEffects[existingEffectIndex] = { ...newEnemyEffects[existingEffectIndex], duration: Math.max(newEnemyEffects[existingEffectIndex].duration, duration), magnitude: Math.max(newEnemyEffects[existingEffectIndex].magnitude || 0, magnitude || 0) };
        } else {
            newEnemyEffects.push({ id: `eff-${Date.now()}`, name, duration, magnitude, sourceSpellId: spell.id, inflictedTurn: turn, iconName: STATUS_EFFECT_ICONS[name] || 'Default' });
        }
        addLog('Player', `inflicts ${name} on ${targetEnemy.name}.`, 'status');
      }
    }
    
    const updatedEnemies = currentEnemies.map(e => e.id === currentTargetId ? {...e, hp: newEnemyHp, activeStatusEffects: newEnemyEffects} : e);
    setCurrentEnemies(updatedEnemies);

    if (newEnemyHp <= 0) {
        addLog('System', `${targetEnemy.name} defeated!`, 'info');
        const livingEnemies = updatedEnemies.filter(e => e.hp > 0);
        if (livingEnemies.length === 0) {
            awardCombatRewards(currentEnemies); // Award for all defeated in this combat
            setModalContent({ title: "Victory!", message: `You defeated all enemies!`, type: 'success' });
            setGameState('GAME_OVER_VICTORY');
            return; 
        } else {
             // If there are other living enemies, set next target
             setTargetEnemyId(livingEnemies[0].id);
        }
    }
    endPlayerTurn();
  };

  const handlePlayerBasicAttack = (currentTargetId: string) => {
    const targetEnemy = currentEnemies.find(e => e.id === currentTargetId);
    if (!targetEnemy || !isPlayerTurn || playerActionSkippedByStun) return;

    setPlayerActionSkippedByStun(false);
    addLog('Player', `attacks ${targetEnemy.name} with a basic strike!`);

    const damageDealt = calculateDamage(0, effectivePlayerStats.physicalPower, Math.floor(targetEnemy.body * DEFENSE_PER_BODY + targetEnemy.reflex * DEFENSE_PER_REFLEX)); // Basic physical attack, enemy defense
    const newEnemyHp = Math.max(0, targetEnemy.hp - damageDealt);
    addLog('Player', `${targetEnemy.name} takes ${damageDealt} physical damage.`, 'damage');

    const updatedEnemies = currentEnemies.map(e => e.id === currentTargetId ? {...e, hp: newEnemyHp} : e);
    setCurrentEnemies(updatedEnemies);

    if (newEnemyHp <= 0) {
        addLog('System', `${targetEnemy.name} defeated!`, 'info');
        const livingEnemies = updatedEnemies.filter(e => e.hp > 0);
        if (livingEnemies.length === 0) {
            awardCombatRewards(currentEnemies);
            setModalContent({ title: "Victory!", message: `All enemies defeated!`, type: 'success' });
            setGameState('GAME_OVER_VICTORY');
            return;
        } else {
            setTargetEnemyId(livingEnemies[0].id);
        }
    }
    endPlayerTurn();
  };

  const handlePlayerDefend = () => {
    if (!isPlayerTurn || playerActionSkippedByStun) return;
    setPlayerActionSkippedByStun(false);
    addLog('Player', 'assumes a defensive stance.');
    setPlayer(prev => ({
        ...prev,
        activeStatusEffects: [...prev.activeStatusEffects.filter(e => e.name !== 'Defending'), { // Remove old, add new
            id: `defending-${Date.now()}`,
            name: 'Defending',
            duration: 1, // Lasts until player's next turn effectively (removed at end of player turn)
            sourceSpellId: 'action-defend',
            inflictedTurn: turn,
            iconName: 'Shield'
        }]
    }));
    endPlayerTurn();
  };

  const handlePlayerFlee = () => {
    if (!isPlayerTurn || playerActionSkippedByStun) return;
    setPlayerActionSkippedByStun(false);
    addLog('Player', 'attempts to flee!');

    const highestEnemySpeed = Math.max(...currentEnemies.map(e => e.speed), 0);
    const fleeChance = ((effectivePlayerStats.speed + effectivePlayerStats.reflex / 2) / (highestEnemySpeed + 5)) * 50 + 20; // Base 20% + scaled
    
    if (Math.random() * 100 < fleeChance) {
        addLog('System', 'Player successfully fled from combat!', 'info');
        setModalContent({title: "Escaped!", message: "You managed to flee the battle.", type: "info"});
        setGameState('HOME');
        setCurrentEnemies([]);
        setTargetEnemyId(null);
    } else {
        addLog('System', 'Player failed to flee!', 'info');
        endPlayerTurn();
    }
  };
  
  const enemyTurnLogic = useCallback(async () => {
    if (gameState !== 'IN_COMBAT' || isPlayerTurn || currentEnemies.length === 0) return;

    const enemy = currentEnemies[currentActingEnemyIndex];
    if (!enemy || enemy.hp <= 0) { // If current enemy is already defeated or doesn't exist, try next
        const nextEnemyIndex = currentActingEnemyIndex + 1;
        if (nextEnemyIndex < currentEnemies.length) {
            setCurrentActingEnemyIndex(nextEnemyIndex);
        } else { // All enemies acted
            setIsPlayerTurn(true);
            // Player turn start effects will be handled by the main useEffect
        }
        return;
    }
    
    // Process status effects for the acting enemy
    const enemyEffectsResult = processStatusEffects(enemy, false, `enemy-${enemy.id}-${turn}`);
    let enemyCurrentHp = enemy.hp + enemyEffectsResult.hpChange;
    
    const updatedEnemiesAfterEffects = currentEnemies.map(e => 
        e.id === enemy.id ? {...e, hp: Math.max(0, enemyCurrentHp), activeStatusEffects: enemyEffectsResult.newActiveEffects} : e
    );
    setCurrentEnemies(updatedEnemiesAfterEffects);

    if (enemyEffectsResult.hpChange !== 0) {
        addLog('Enemy', `${enemy.name} ${enemyEffectsResult.hpChange > 0 ? `regenerates ${enemyEffectsResult.hpChange}` : `takes ${-enemyEffectsResult.hpChange} damage from status effects`}.`, 'status');
    }

    if (enemyCurrentHp <= 0) {
        addLog('System', `${enemy.name} succumbed to status effects!`, 'info');
        const livingEnemies = updatedEnemiesAfterEffects.filter(e => e.hp > 0);
        if (livingEnemies.length === 0) {
            awardCombatRewards(currentEnemies);
            setModalContent({ title: "Victory!", message: "All enemies defeated by status effects!", type: 'success' });
            setGameState('GAME_OVER_VICTORY');
            return;
        } else {
            // Move to next enemy or player turn
            const nextEnemyIndex = currentActingEnemyIndex + 1;
            if (nextEnemyIndex < currentEnemies.length) {
                setCurrentActingEnemyIndex(nextEnemyIndex);
                 // Auto-target next living enemy if current target was defeated
                if (targetEnemyId === enemy.id) setTargetEnemyId(livingEnemies[0]?.id || null);
            } else {
                setIsPlayerTurn(true);
            }
            return;
        }
    }

    if (enemyEffectsResult.isStunned) {
        addLog('Enemy', `${enemy.name} is stunned and cannot act!`, 'status');
    } else {
        // Enemy attacks
        addLog('Enemy', `${enemy.name} attacks!`, 'action');
        const enemyBaseDamage = Math.max(5, Math.floor(enemy.body / 2)); // Simplified damage
        const damageDealt = calculateDamage(enemyBaseDamage, enemy.body, effectivePlayerStats.defense);
        
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - damageDealt) }));
        addLog('Enemy', `deals ${damageDealt} damage to Player.`, 'damage');

        if (player.hp - damageDealt <= 0) {
            addLog('System', 'Player has been defeated!', 'info');
            setModalContent({ title: "Defeat!", message: `You were defeated by ${enemy.name}.`, type: 'error' });
            setGameState('GAME_OVER_DEFEAT');
            return;
        }
    }

    // Move to next enemy or player turn
    const nextEnemyIndex = currentActingEnemyIndex + 1;
    if (nextEnemyIndex < currentEnemies.length) {
        setCurrentActingEnemyIndex(nextEnemyIndex);
    } else {
        setIsPlayerTurn(true);
    }

  }, [currentEnemies, currentActingEnemyIndex, isPlayerTurn, gameState, turn, addLog, player.hp, effectivePlayerStats, processStatusEffects, awardCombatRewards, targetEnemyId]);


  const handleUseConsumable = (consumableId: string, currentTargetId: string | null) => {
    // TargetId currently unused for consumables, but added for future-proofing
    if (!isPlayerTurn || playerActionSkippedByStun) return;
    const consumable = player.items.find(item => item.id === consumableId && item.itemType === 'Consumable') as Consumable | undefined;
    if (!consumable) return;

    setPlayerActionSkippedByStun(false);
    addLog('Player', `uses ${consumable.name}.`);
    
    let newHp = player.hp;
    let newMp = player.mp;
    let newEp = player.ep;
    let newActiveEffects = [...player.activeStatusEffects];

    switch (consumable.effectType) {
        case 'HP_RESTORE':
            newHp = Math.min(effectivePlayerStats.maxHp, player.hp + (consumable.magnitude || 0));
            addLog('Player', `restores ${newHp - player.hp} HP.`, 'heal');
            break;
        case 'MP_RESTORE':
            newMp = Math.min(effectivePlayerStats.maxMp, player.mp + (consumable.magnitude || 0));
            addLog('Player', `restores ${newMp - player.mp} MP.`, 'heal');
            break;
        case 'EP_RESTORE':
            newEp = Math.min(effectivePlayerStats.maxEp, player.ep + (consumable.magnitude || 0));
            addLog('Player', `restores ${newEp - player.ep} EP.`, 'heal');
            break;
        case 'CURE_STATUS':
            if (consumable.statusToCure) {
                newActiveEffects = newActiveEffects.filter(eff => eff.name !== consumable.statusToCure);
                addLog('Player', `cures ${consumable.statusToCure}.`, 'status');
            }
            break;
        case 'APPLY_BUFF':
            if (consumable.buffToApply && consumable.duration && consumable.magnitude) {
                const existingBuffIndex = newActiveEffects.findIndex(e => e.name === consumable.buffToApply);
                if(existingBuffIndex > -1){
                    newActiveEffects[existingBuffIndex] = { ...newActiveEffects[existingBuffIndex], duration: Math.max(newActiveEffects[existingBuffIndex].duration, consumable.duration), magnitude: Math.max(newActiveEffects[existingBuffIndex].magnitude || 0, consumable.magnitude || 0)};
                } else {
                    newActiveEffects.push({ id: `buff-${Date.now()}`, name: consumable.buffToApply, duration: consumable.duration, magnitude: consumable.magnitude, sourceSpellId: consumable.id, inflictedTurn: turn, iconName: STATUS_EFFECT_ICONS[consumable.buffToApply] || 'Star'});
                }
                addLog('Player', `gains ${consumable.buffToApply}.`, 'status');
            }
            break;
    }
    
    setPlayer(prev => ({
        ...prev,
        hp: newHp,
        mp: newMp,
        ep: newEp,
        activeStatusEffects: newActiveEffects,
        items: prev.items.filter(item => item.id !== consumableId) 
    }));
    endPlayerTurn();
  };

  const handleUseAbility = (abilityId: string, currentTargetId: string | null) => {
    if (!isPlayerTurn || playerActionSkippedByStun) return;
    const ability = player.abilities.find(ab => ab.id === abilityId);
    const targetEnemy = currentTargetId ? currentEnemies.find(e => e.id === currentTargetId) : null;

    if (!ability || player.ep < ability.epCost) return;
    if (ability.effectType === 'ENEMY_DEBUFF' && !targetEnemy) {
        alert("Select a target for this ability!"); return;
    }


    setPlayerActionSkippedByStun(false);
    addLog('Player', `uses ${ability.name}!`);
    setPlayer(prev => ({ ...prev, ep: prev.ep - ability.epCost }));

    let newHp = player.hp;
    let newMp = player.mp;
    let newPlayerActiveEffects = [...player.activeStatusEffects];
    let newEnemyEffectsArray = [...currentEnemies];


    switch (ability.effectType) {
        case 'MP_RESTORE':
            newMp = Math.min(effectivePlayerStats.maxMp, player.mp + (ability.magnitude || 0));
            addLog('Player', `restores ${newMp - player.mp} MP.`, 'heal');
            break;
        case 'SELF_HEAL':
            newHp = Math.min(effectivePlayerStats.maxHp, player.hp + (ability.magnitude || 0));
            addLog('Player', `heals for ${newHp - player.hp} HP.`, 'heal');
            break;
        case 'TEMP_STAT_BUFF':
            if (ability.targetStatusEffect && ability.duration && ability.magnitude) {
                const existingBuffIndex = newPlayerActiveEffects.findIndex(e => e.name === ability.targetStatusEffect);
                 if(existingBuffIndex > -1){
                    newPlayerActiveEffects[existingBuffIndex] = { ...newPlayerActiveEffects[existingBuffIndex], duration: Math.max(newPlayerActiveEffects[existingBuffIndex].duration, ability.duration), magnitude: Math.max(newPlayerActiveEffects[existingBuffIndex].magnitude || 0, ability.magnitude || 0)};
                } else {
                    newPlayerActiveEffects.push({ id: `buff-${Date.now()}`, name: ability.targetStatusEffect, duration: ability.duration, magnitude: ability.magnitude, sourceSpellId: ability.id, inflictedTurn: turn, iconName: STATUS_EFFECT_ICONS[ability.targetStatusEffect] || 'Star' });
                }
                addLog('Player', `gains ${ability.targetStatusEffect}.`, 'status');
            }
            break;
        case 'ENEMY_DEBUFF':
             if (targetEnemy && ability.targetStatusEffect && ability.duration && ability.magnitude) {
                const enemyToUpdate = newEnemyEffectsArray.find(e => e.id === targetEnemy.id);
                if (enemyToUpdate) {
                    let enemySpecificEffects = [...enemyToUpdate.activeStatusEffects];
                    const existingDebuffIndex = enemySpecificEffects.findIndex(e => e.name === ability.targetStatusEffect);
                    if(existingDebuffIndex > -1){
                        enemySpecificEffects[existingDebuffIndex] = { ...enemySpecificEffects[existingDebuffIndex], duration: Math.max(enemySpecificEffects[existingDebuffIndex].duration, ability.duration), magnitude: Math.max(enemySpecificEffects[existingDebuffIndex].magnitude || 0, ability.magnitude || 0)};
                    } else {
                        enemySpecificEffects.push({ id: `debuff-${Date.now()}`, name: ability.targetStatusEffect, duration: ability.duration, magnitude: ability.magnitude, sourceSpellId: ability.id, inflictedTurn: turn, iconName: STATUS_EFFECT_ICONS[ability.targetStatusEffect] || 'Default' });
                    }
                    addLog('Player', `applies ${ability.targetStatusEffect} to ${targetEnemy.name}.`, 'status');
                    setCurrentEnemies(newEnemyEffectsArray.map(e => e.id === targetEnemy.id ? {...e, activeStatusEffects: enemySpecificEffects} : e));
                }
            }
            break;
    }
    setPlayer(prev => ({...prev, hp: newHp, mp: newMp, activeStatusEffects: newPlayerActiveEffects }));
    endPlayerTurn();
  };

  const handlePlayerFreestyleAction = (actionText: string, currentTargetId: string | null) => {
    if (!isPlayerTurn || playerActionSkippedByStun || !actionText.trim()) return;
    setPlayerActionSkippedByStun(false);
    const targetName = currentTargetId ? currentEnemies.find(e=> e.id === currentTargetId)?.name : null;
    addLog('Player', `attempts: "${actionText}"${targetName ? ` on ${targetName}`: ''}.`, 'action');
    setModalContent({title: "Action Noted", message: "Your freestyle action has been noted. (Full AI interpretation coming soon!)", type: "info"});
    endPlayerTurn();
  };

 useEffect(() => {
    if (gameState === 'IN_COMBAT') {
        if (!isPlayerTurn && currentEnemies.some(e => e.hp > 0) && player.hp > 0) {
            // Enemy's turn
            const enemyTurnTimeout = setTimeout(() => {
                enemyTurnLogic(); 
            }, 750); 
            return () => clearTimeout(enemyTurnTimeout);
        } else if (isPlayerTurn && player.hp > 0 && currentEnemies.some(e => e.hp > 0)) {
            // Player's turn
            setPlayerActionSkippedByStun(false); // Preemptive reset

            const turnEffectsResult = processPlayerTurnStartEffects(turn);

            if (turnEffectsResult.isDefeated) { return; }

            // playerActionSkippedByStun is set to true by processPlayerTurnStartEffects if stun occurs
            // The CombatView component will consume playerActionSkippedByStun prop.
            // If turnEffectsResult.isStunned is true, it means playerActionSkippedByStun was just set to true.
            if (turnEffectsResult.isStunned) {
                const stunSkipTimeout = setTimeout(() => {
                    if (isPlayerTurn && gameState === 'IN_COMBAT') { // Double check state before ending turn
                        endPlayerTurn();
                    }
                }, 500);
                return () => clearTimeout(stunSkipTimeout);
            }
            // If not stunned, playerActionSkippedByStun remains false (from the preemptive set). Player can act.
        }
    }
// Removed playerActionSkippedByStun from dependencies as its update within this effect
// followed by an immediate check was problematic. The state is set and then consumed by CombatView.
// processPlayerTurnStartEffects's identity changes if its deps change.
}, [gameState, isPlayerTurn, turn, processPlayerTurnStartEffects, enemyTurnLogic, currentActingEnemyIndex, player.activeStatusEffects, currentEnemies, player.hp, combatLog.length]);


  return (
    <div className="flex flex-col min-h-screen h-screen bg-slate-900 text-slate-100 antialiased overflow-hidden" style={{fontFamily: "'Inter', sans-serif"}}>
      <Header player={player} onOpenCharacterSheet={() => handleOpenCharacterSheet()} onNavigateHome={handleNavigateHome} />
      <main className="flex-grow container mx-auto px-2 py-3 sm:px-3 sm:py-4 md:py-6 max-w-5xl w-full overflow-y-auto styled-scrollbar">
        {gameState === 'HOME' && <HomeScreenView 
          onFindEnemy={handleFindEnemy}
          isLoading={isLoading} 
          onRest={handleRest}
          onExplore={handleExplore}
          onGuild={handleGuild}
          onCommunity={handleCommunity}
          onResearch={handleResearch}
          onBoutique={handleBoutique}
        />}
        {gameState === 'CAMP_VIEW' && (
          <CampView 
            playerName={player.name}
            onSleep={handleSleep}
            onReturnToMap={handleNavigateHome}
            isLoading={isLoading}
          />
        )}
        {gameState === 'EXPLORE_VIEW' && (
          <ExploreView
            onPlay={handleFindEnemy} // Assuming 'PLAY' will trigger finding an enemy for now
            onReturnHome={handleNavigateHome}
            isLoading={isLoading}
            onSetGameState={setGameState} // Added
            onSetEncyclopediaSubTab={(subTab) => { // Renamed from onOpenCharacterSheet to be more specific to its new role
              setDefaultCharacterSheetTab('Encyclopedia');
              setTargetEncyclopediaSubTab(subTab); // Set the target sub-tab
              setGameState('CHARACTER_SHEET');
            }}
            onOpenCharacterSheet={(tabId) => { // This prop in ExploreView is for general opening, let's ensure it's used if WorldMap needs it. 
                                            // WorldMap uses onSetEncyclopediaSubTab now for 'Learn More'.
                                            // This can be a generic open if ExploreView itself has other buttons for char sheet tabs.
                handleOpenCharacterSheet(tabId as CharacterSheetTab); // Original broader functionality
            }}
          />
        )}
        {gameState === 'SPELL_CRAFTING' && (
          <SpellCraftingView
            onInitiateSpellCraft={handleInitiateSpellCraft}
            isLoading={isLoading}
            currentSpells={player.spells.length}
            maxSpells={maxRegisteredSpells}
            onReturnHome={() => setGameState('HOME')}
          />
        )}
        {gameState === 'TRAIT_CRAFTING' && (
          <TraitCraftingView
            onCraftTrait={handleCraftTrait}
            isLoading={isLoading}
            currentTraits={player.traits.length}
            playerLevel={player.level}
            onReturnHome={() => setGameState('HOME')}
          />
        )}
        {gameState === 'SPELL_EDITING' && originalSpellForEdit && (
          <SpellEditingView
            originalSpell={originalSpellForEdit}
            onInitiateSpellRefinement={handleInitiateSpellRefinement}
            isLoading={isLoading}
            onCancel={() => { setGameState('CHARACTER_SHEET'); setDefaultCharacterSheetTab('Spells'); }}
          />
        )}
        {gameState === 'SPELL_CRAFT_CONFIRMATION' && pendingSpellCraftData && (
          <ConfirmationView
            gameState={gameState}
            pendingSpellCraftData={pendingSpellCraftData}
            pendingSpellEditData={null}
            originalSpellForEdit={null}
            pendingItemCraftData={null}
            onConfirm={handleConfirmSpellCraft}
            onCancel={() => { setPendingSpellCraftData(null); setGameState('SPELL_CRAFTING'); }}
            checkResources={checkResources}
            renderResourceList={(costs) => costs ? costs.map(c => <span key={c.type} className="text-xs text-amber-200 mr-2 p-1 bg-slate-600/70 rounded"><GetSpellIcon iconName={RESOURCE_ICONS[c.type] || 'Default'} className="inline w-3 h-3 mr-1"/>{c.quantity} {c.type}</span>) : 'None'}
            isLoading={isLoading}
          />
        )}
        {gameState === 'SPELL_EDIT_CONFIRMATION' && pendingSpellEditData && originalSpellForEdit && (
          <ConfirmationView
            gameState={gameState}
            pendingSpellCraftData={null}
            pendingSpellEditData={pendingSpellEditData}
            originalSpellForEdit={originalSpellForEdit}
            pendingItemCraftData={null}
            onConfirm={handleConfirmSpellEdit}
            onCancel={() => { setPendingSpellEditData(null); setOriginalSpellForEdit(null); setGameState('SPELL_EDITING'); }}
            checkResources={checkResources}
            renderResourceList={(costs) => costs ? costs.map(c => <span key={c.type} className="text-xs text-amber-200 mr-2 p-1 bg-slate-600/70 rounded"><GetSpellIcon iconName={RESOURCE_ICONS[c.type] || 'Default'} className="inline w-3 h-3 mr-1"/>{c.quantity} {c.type}</span>) : 'None'}
            isLoading={isLoading}
          />
        )}
         {gameState === 'ITEM_CRAFT_CONFIRMATION' && pendingItemCraftData && (
          <ConfirmationView
            gameState={gameState}
            pendingSpellCraftData={null}
            pendingSpellEditData={null}
            originalSpellForEdit={null}
            // Pass the whole pendingItemCraftData object which includes quantity
            pendingItemCraftData={pendingItemCraftData}
            onConfirm={handleConfirmItemCraft}
            onCancel={() => { setPendingItemCraftData(null); setGameState('CRAFTING_HUB'); }}
            checkResources={checkResources} // This checkResources in App.tsx needs to be aware of total cost
            renderResourceList={(costs, itemQuantity) => 
              costs ? costs.map(c => 
                <span key={c.type} className="text-xs text-amber-200 mr-2 p-1 bg-slate-600/70 rounded">
                  <GetSpellIcon iconName={RESOURCE_ICONS[c.type] || 'Default'} className="inline w-3 h-3 mr-1"/>
                  {/* If renderResourceList in ConfirmationView now handles total quantity, this is fine.
                      Otherwise, App.tsx's renderResourceList may need to adjust what `c.quantity` it shows or take `itemQuantity` 
                      from ConfirmationView. For now, assuming ConfirmationView's displayResourceCost is passed here. */}
                  {c.quantity} {c.type}
                </span>
              ) : 'None'
            }
            isLoading={isLoading}
          />
        )}
        {gameState === 'IN_COMBAT' && currentEnemies.length > 0 && (
          <CombatView
            player={player}
            effectivePlayerStats={effectivePlayerStats}
            currentEnemies={currentEnemies}
            targetEnemyId={targetEnemyId}
            onSetTargetEnemy={setTargetEnemyId}
            preparedSpells={getPreparedSpells()}
            onPlayerAttack={playerAttack}
            onPlayerBasicAttack={handlePlayerBasicAttack}
            onPlayerDefend={handlePlayerDefend}
            onPlayerFlee={handlePlayerFlee}
            onPlayerFreestyleAction={handlePlayerFreestyleAction}
            combatLog={combatLog}
            isPlayerTurn={isPlayerTurn}
            playerActionSkippedByStun={playerActionSkippedByStun}
            onSetGameState={setGameState}
            onUseConsumable={handleUseConsumable}
            onUseAbility={handleUseAbility}
            consumables={player.items.filter(item => item.itemType === 'Consumable') as Consumable[]}
            abilities={getPreparedAbilities()}
            config={{
              // Custom positioning for enemies based on count
              enemyPositions: currentEnemies.length > 1 
                ? [{ x: 20, y: 25 }, { x: 35, y: 20 }, { x: 25, y: 35 }]
                : [{ x: 25, y: 30 }]
            }}
          />
        )}
        {(gameState === 'GAME_OVER_VICTORY' || gameState === 'GAME_OVER_DEFEAT') && (
          <GameOverView 
            gameState={gameState} 
            modalMessage={modalContent?.message} 
            currentEnemy={currentEnemies[0]} // Show first enemy for simplicity, or could be last targeted
            combatLog={combatLog} 
            onReturnHome={() => { setGameState('HOME'); setCurrentEnemies([]); setTargetEnemyId(null); setCombatLog([]); }} 
            onFindEnemy={handleFindEnemy}
            isLoading={isLoading}
          />
        )}
        {isLoading && (gameState !== 'IN_COMBAT' && gameState !== 'GAME_OVER_VICTORY' && gameState !== 'GAME_OVER_DEFEAT') && <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[2000]"><LoadingSpinner text="AI Thinking..." size="lg"/></div>}
      </main>
      <Footer
        onOpenSpellbook={() => handleOpenCharacterSheet('Spells')}
        onOpenCraftingHub={handleOpenCraftingHub}
        onOpenInventory={() => handleOpenCharacterSheet('Inventory')}
        onOpenTraitsPage={() => handleOpenCharacterSheet('Traits')}
        onOpenQuestsPage={() => handleOpenCharacterSheet('Quests')}
        onOpenEncyclopedia={handleOpenEncyclopedia}
        onOpenGameMenu={handleOpenGameMenu}
      />
      {modalContent && (
        <Modal isOpen={true} onClose={() => setModalContent(null)} title={modalContent.title} size="md">
          <p className={modalContent.type === 'error' ? 'text-red-400' : modalContent.type === 'success' ? 'text-green-400' : 'text-sky-300'}>
            {modalContent.message}
          </p>
           <div className="mt-5 text-right">
            <ActionButton onClick={() => setModalContent(null)} variant={modalContent.type === 'error' ? 'danger' : 'primary'}>
              OK
            </ActionButton>
          </div>
        </Modal>
      )}
      <CharacterSheetModal 
        isOpen={gameState === 'CHARACTER_SHEET'}
        onClose={() => setGameState('HOME')}
        player={player}
        effectiveStats={effectivePlayerStats}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        maxRegisteredSpells={maxRegisteredSpells}
        maxPreparedSpells={maxPreparedSpells}
        maxPreparedAbilities={maxPreparedAbilities}
        onEditSpell={handleInitiateEditSpell}
        onPrepareSpell={handlePrepareSpell}
        onUnprepareSpell={handleUnprepareSpell}
        onPrepareAbility={handlePrepareAbility}
        onUnprepareAbility={handleUnprepareAbility}
        isLoading={isLoading}
        initialTab={defaultCharacterSheetTab}
        initialEncyclopediaSubTab={targetEncyclopediaSubTab} // Pass the new state here
        onOpenSpellCraftingScreen={() => setGameState('SPELL_CRAFTING')}
        onOpenTraitCraftingScreen={() => setGameState('TRAIT_CRAFTING')}
        canCraftNewTrait={player.level >= FIRST_TRAIT_LEVEL && player.traits.length < (Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1)}
        onOpenEnhancementModal={handleOpenEnhancementModalFromInventory} // Pass the handler
      />
      <CraftingHubModal 
        isOpen={gameState === 'CRAFTING_HUB'}
        onClose={() => setGameState('HOME')}
        onInitiateAppItemCraft={handleInitiateItemCraft}
        isLoading={isLoading}
        playerItems={player.items}
        playerInventory={player.inventory}
        onAttemptEnhanceItem={handleAttemptEnhanceItem}
        isEnhancing={isEnhancing}
      />
      {directEnhanceItem && (
        <ItemEnhancementModal
          isOpen={isDirectEnhanceModalOpen}
          onClose={() => { setIsDirectEnhanceModalOpen(false); setDirectEnhanceItem(null); }}
          itemToEnhance={directEnhanceItem}
          playerInventory={player.inventory}
          onAttemptEnhance={(item) => {
            handleAttemptEnhanceItem(item); // Reuse the existing enhancement logic
            // Decide if the modal should close or update for next level
            // For now, let App.tsx's handleAttemptEnhanceItem show a global message
            // And this modal will simply close if the enhancement attempt happens
            // setIsDirectEnhanceModalOpen(false); // Or manage this based on result/isEnhancing
          }}
          isLoading={isEnhancing} // Use the global isEnhancing state
        />
      )}
      <HelpWikiModal isOpen={isHelpWikiOpen} onClose={handleCloseHelpWiki} />
      <GameMenuModal 
        isOpen={isGameMenuOpen} 
        onClose={handleCloseGameMenu} 
        onOpenCharacterSheet={() => { handleCloseGameMenu(); handleOpenCharacterSheet(); }}
        onOpenHelpWiki={() => { handleCloseGameMenu(); handleOpenHelpWiki(); }}
        onShowMessage={(title, msg) => setModalContent({title, message: msg, type: 'info'})}
      />
    </div>
  );
};
