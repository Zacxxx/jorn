import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Spell, Enemy, CombatActionLog, GameState, GeneratedSpellData, GeneratedEnemyData, Trait, GeneratedTraitData, Quest, GeneratedQuestData, ResourceType, ResourceCost, ActiveStatusEffect, StatusEffectName, SpellStatusEffect, ItemType, Consumable, Equipment, GameItem, GeneratedConsumableData, GeneratedEquipmentData, EquipmentSlot as GenericEquipmentSlot, DetailedEquipmentSlot, PlayerEffectiveStats, Ability, AbilityEffectType, CharacterSheetTab, SpellIconName, SpellComponent, ElementName, LootChestItem, GeneratedSpellComponentData, LootDrop, MasterItemDefinition, UniqueConsumable, MasterResourceItem, MasterConsumableItem } from './types';
import { INITIAL_PLAYER_STATS, STARTER_SPELL, ENEMY_DIFFICULTY_XP_REWARD, MAX_SPELLS_PER_LEVEL_BASE, PREPARED_SPELLS_PER_LEVEL_BASE, PREPARED_ABILITIES_PER_LEVEL_BASE, FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL, DEFAULT_QUEST_ICON, DEFAULT_TRAIT_ICON, INITIAL_PLAYER_INVENTORY, AVAILABLE_RESOURCE_TYPES_FOR_AI, BATTLE_RESOURCE_REWARD_TYPES, BATTLE_RESOURCE_REWARD_QUANTITY_MIN, BATTLE_RESOURCE_REWARD_QUANTITY_MAX, RESOURCE_ICONS, STATUS_EFFECT_ICONS, PLAYER_BASE_SPEED_FROM_REFLEX, INITIAL_PLAYER_EP, PLAYER_EP_REGEN_PER_TURN, STARTER_ABILITIES, PLAYER_BASE_BODY, PLAYER_BASE_MIND, PLAYER_BASE_REFLEX, HP_PER_BODY, HP_PER_LEVEL, BASE_HP, MP_PER_MIND, MP_PER_LEVEL, BASE_MP, EP_PER_REFLEX, EP_PER_LEVEL, BASE_EP, SPEED_PER_REFLEX, PHYSICAL_POWER_PER_BODY, MAGIC_POWER_PER_MIND, DEFENSE_PER_BODY, DEFENSE_PER_REFLEX, INITIAL_PLAYER_NAME, DEFAULT_ENCYCLOPEDIA_ICON, DEFENDING_DEFENSE_BONUS_PERCENTAGE, INITIAL_PLAYER_GOLD, INITIAL_PLAYER_ESSENCE, EXAMPLE_SPELL_COMPONENTS, RESEARCH_SEARCH_BASE_GOLD_COST, RESEARCH_SEARCH_BASE_ESSENCE_COST, DEFAULT_SILENCE_DURATION, DEFAULT_ROOT_DURATION, AVAILABLE_SPELL_ICONS } from './constants';
import { generateSpell, editSpell, generateEnemy, generateTrait, generateMainQuestStory, generateConsumable, generateEquipment, generateSpellFromDesign, generateSpellComponentFromResearch, generateLootFromChest } from './services/geminiService';
import { loadMasterItems, MASTER_ITEM_DEFINITIONS } from './services/itemService';
import { getScalingFactorFromRarity } from './utils';


import ActionButton from './ui/ActionButton';
import Modal from './ui/Modal';
import LoadingSpinner from './ui/LoadingSpinner';
import { GetSpellIcon, BagIcon, CollectionIcon, GoldCoinIcon, FlaskIcon, EssenceIcon } from './components/IconComponents';
import Header from './components/Header';
import Footer from './components/Footer';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import CraftingHubModal from './components/CraftingHubModal';
import HelpWikiModal from './components/HelpWikiModal';
import GameMenuModal from './components/GameMenuModal';
import SpellDesignStudioView from './components/SpellDesignStudioView';
import ResearchLabView from './components/ResearchLabView';
import ResearchView from './components/ResearchView'; // Renamed from GeneralResearch, now ResearchArchives
import MapView from './components/MapView';

import HomeScreenView from './components/HomeScreenView';
import SpellCraftingView from './components/SpellCraftingView';
import TraitCraftingView from './components/TraitCraftingView';
import SpellEditingView from './components/SpellEditingView';
import CombatView from './components/CombatView';
import ConfirmationView from './components/ConfirmationView';
import GameOverView from './components/GameOverView';
import MobileMenuModal from './components/MobileMenuModal';


const LOCAL_STORAGE_KEY = 'rpgSpellCrafterPlayerV21'; 

export const App: React.FC<{}> = (): React.ReactElement => {
  const [player, setPlayer] = useState<Player>(() => {
    const savedPlayer = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPlayer) {
      try {
        const parsed = JSON.parse(savedPlayer) as Player;
        if (parsed && typeof parsed.level === 'number' && Array.isArray(parsed.spells)) {
            const validatedPlayer: Player = {
            ...INITIAL_PLAYER_STATS,
            name: parsed.name || INITIAL_PLAYER_NAME,
            gold: parsed.gold ?? INITIAL_PLAYER_GOLD,
            essence: parsed.essence ?? INITIAL_PLAYER_ESSENCE,
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
            activeStatusEffects: Array.isArray(parsed.activeStatusEffects)
              ? parsed.activeStatusEffects.filter(
                  (eff: any): eff is ActiveStatusEffect =>
                    eff &&
                    typeof eff.id === 'string' &&
                    typeof eff.name === 'string' && 
                    STATUS_EFFECT_ICONS.hasOwnProperty(eff.name as StatusEffectName) && 
                    typeof eff.duration === 'number' &&
                    typeof eff.sourceSpellId === 'string' &&
                    typeof eff.inflictedTurn === 'number' &&
                    typeof eff.iconName === 'string' && AVAILABLE_SPELL_ICONS.includes(eff.iconName as SpellIconName)
                )
              : [],
            inventory: typeof parsed.inventory === 'object' && !Array.isArray(parsed.inventory) ? parsed.inventory : { ...INITIAL_PLAYER_INVENTORY },
            items: Array.isArray(parsed.items) ? parsed.items : [],
            equippedItems: parsed.equippedItems || {},
            abilities: Array.isArray(parsed.abilities) && parsed.abilities.length > 0 ? parsed.abilities : STARTER_ABILITIES,
            preparedAbilityIds: Array.isArray(parsed.preparedAbilityIds) ? parsed.preparedAbilityIds : (STARTER_ABILITIES.length > 0 ? [STARTER_ABILITIES[0].id] : []),
            iconName: parsed.iconName || 'UserIcon',
            maxHp: parsed.maxHp || 0,
            maxMp: parsed.maxMp || 0,
            maxEp: parsed.maxEp || 0,
            speed: parsed.speed || 0,
            bestiary: parsed.bestiary || {},
            discoveredComponents: Array.isArray(parsed.discoveredComponents) ? parsed.discoveredComponents.filter(comp => typeof comp === 'object' && comp.id) : [],
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
        } else {
            console.warn("Invalid player data structure in localStorage. Resetting to default.");
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to load player data from localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    return {
      ...INITIAL_PLAYER_STATS,
      name: INITIAL_PLAYER_NAME,
      gold: INITIAL_PLAYER_GOLD,
      essence: INITIAL_PLAYER_ESSENCE,
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
      bestiary: {},
      discoveredComponents: [],
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

  const [pendingSpellCraftData, setPendingSpellCraftData] = useState<(GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }) | null>(null);
  const [pendingSpellEditData, setPendingSpellEditData] = useState<GeneratedSpellData | null>(null);
  const [originalSpellForEdit, setOriginalSpellForEdit] = useState<Spell | null>(null);
  const [initialSpellPromptForStudio, setInitialSpellPromptForStudio] = useState<string>('');


  const [pendingItemCraftData, setPendingItemCraftData] = useState<GeneratedConsumableData | GeneratedEquipmentData | null>(null);
  const [playerActionSkippedByStun, setPlayerActionSkippedByStun] = useState(false);

  const [isHelpWikiOpen, setIsHelpWikiOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      await loadMasterItems(); 
      setIsLoading(false);
    }
    initApp();
  }, []);


  const calculateEffectiveStats = useCallback((p: Player): PlayerEffectiveStats => {
    let effectiveBody = p.body;
    let effectiveMind = p.mind;
    let effectiveReflex = p.reflex;
    let bonusMaxHp = 0;
    let bonusMaxMp = 0;
    let bonusMaxEp = 0;
    let bonusSpeed = 0;
    let effectiveDefense = 0;
    let damageReflectionPercent = 0;


    Object.values(p.equippedItems).forEach(itemId => {
        if (!itemId) return;
        const item = p.items.find(i => i.id === itemId) as Equipment | undefined;
        if (item && item.itemType === 'Equipment') {
            if(item.statsBoost) {
                effectiveBody += item.statsBoost.body || 0;
                effectiveMind += item.statsBoost.mind || 0;
                effectiveReflex += item.statsBoost.reflex || 0;
                bonusSpeed += item.statsBoost.speed || 0;
                bonusMaxHp += item.statsBoost.maxHp || 0;
                bonusMaxMp += item.statsBoost.maxMp || 0;
                bonusMaxEp += item.statsBoost.maxEp || 0;
            }
             if (item.tags?.includes('DamageReflection')) {
                damageReflectionPercent += item.scalingFactor || 0.1; 
            }
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
             if (effect.name === 'DamageReflection') { 
                 damageReflectionPercent += (effect.magnitude / 100); 
             }
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
    damageReflectionPercent = Math.max(0, Math.min(1, damageReflectionPercent)); 

    return { maxHp, maxMp, maxEp, speed, body: effectiveBody, mind: effectiveMind, reflex: effectiveReflex, physicalPower, magicPower, defense: effectiveDefense, damageReflectionPercent };
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
  }, [effectivePlayerStats.maxHp, effectivePlayerStats.maxMp, effectivePlayerStats.maxEp, effectivePlayerStats.speed, player.level]);


  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
  }, [player]);


  const fetchInitialMainQuestIfNeeded = useCallback(async () => {
    const hasMainQuest = player.quests.some(q => q.isMainQuest && q.status === 'active');
    if (!hasMainQuest && player.level >= 1 && !isLoading) {
      setIsLoading(true);
      try {
        const questData = await generateMainQuestStory(player.level, player.quests);
        const newQuest: Quest = { ...questData, id: `quest-main-${Date.now()}`, status: 'active', isMainQuest: true, iconName: questData.iconName || DEFAULT_QUEST_ICON };
        setPlayer(prev => ({ ...prev, quests: [...prev.quests, newQuest] }));
        setModalContent({ title: "New Main Quest!", message: `You've received: ${newQuest.title}. Check your Character Sheet!`, type: 'info' });
      } catch (error) { console.error("Failed to fetch initial main quest:", error); setModalContent({ title: "Quest Error", message: "Could not fetch a new main quest.", type: 'error' }); } finally { setIsLoading(false); }
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
    return costs.every(cost => (player.inventory[cost.itemId] || 0) >= cost.quantity);
  };

  const deductResources = (costs?: ResourceCost[]): boolean => {
    if (!costs || !checkResources(costs)) return false;
    const newInventory = { ...player.inventory };
    costs.forEach(cost => { newInventory[cost.itemId] = (newInventory[cost.itemId] || 0) - cost.quantity; });
    setPlayer(prev => ({ ...prev, inventory: newInventory }));
    return true;
  };

  const handleOpenInventory = () => { setDefaultCharacterSheetTab('Inventory'); setGameState('CHARACTER_SHEET'); };
  const handleOpenSpellbook = () => { setDefaultCharacterSheetTab('Spells'); setGameState('CHARACTER_SHEET'); };
  const handleOpenCraftingHub = () => setGameState('CRAFTING_HUB');
  
  const handleOpenSpellDesignStudio = (initialPrompt?: string) => {
    setInitialSpellPromptForStudio(initialPrompt || '');
    setGameState('SPELL_DESIGN_STUDIO');
  };
  const handleExploreMap = () => setGameState('EXPLORING_MAP');
  
  // New navigation handlers for research
  const handleOpenResearchArchives = () => setGameState('RESEARCH_ARCHIVES');
  const handleOpenTheorizeComponentLab = () => setGameState('THEORIZE_COMPONENT');


  const handleOldSpellCraftInitiation = (promptText: string): Promise<void> => {
    setInitialSpellPromptForStudio(promptText);
    setGameState('SPELL_DESIGN_STUDIO');
    return Promise.resolve();
  };


  const handleOpenTraitsPage = () => {
    const expectedTraits = player.level >= FIRST_TRAIT_LEVEL ? Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 : 0;
    if ((player.level >= FIRST_TRAIT_LEVEL && player.traits.length < expectedTraits) || pendingTraitUnlock) setGameState('TRAIT_CRAFTING');
    else { setDefaultCharacterSheetTab('Traits'); setGameState('CHARACTER_SHEET'); }
  };
  const handleOpenQuestsPage = () => { setDefaultCharacterSheetTab('Quests'); setGameState('CHARACTER_SHEET'); };
  const handleOpenCharacterSheet = (tab: CharacterSheetTab = 'Main') => { setDefaultCharacterSheetTab(tab); setGameState('CHARACTER_SHEET'); };
  const handleOpenEncyclopedia = () => { setDefaultCharacterSheetTab('Encyclopedia'); setGameState('CHARACTER_SHEET'); };

  const handleOpenHelpWiki = () => setIsHelpWikiOpen(true);
  const handleCloseHelpWiki = () => setIsHelpWikiOpen(false);
  const handleOpenGameMenu = () => setIsGameMenuOpen(true);
  const handleCloseGameMenu = () => setIsGameMenuOpen(false);
  const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavigateHome = () => {
    setGameState('HOME');
    setCurrentEnemies([]);
    setTargetEnemyId(null);
    setCombatLog([]);
    setModalContent(null);
  };

  const handleFinalizeSpellDesign = async (
    designData: { level: number; componentsUsed: Array<{ componentId: string; configuration: Record<string, string | number> }>; investedResources: ResourceCost[]; playerName?: string; playerDescription?: string; playerIcon?: SpellIconName; playerPrompt?: string }
  ) => {
    if (player.spells.length >= maxRegisteredSpells) {
        setModalContent({ title: "Spell Collection Full", message: `Max ${maxRegisteredSpells} spells at level ${player.level}.`, type: 'info' });
        return;
    }
    setIsLoading(true);
    try {
        const spellDetailsFromAI = await generateSpellFromDesign(designData);
        let totalComponentGoldCost = 0;
        let totalComponentEssenceCost = 0;
        designData.componentsUsed.forEach(cu => {
            const compDef = player.discoveredComponents.find(c => c.id === cu.componentId);
            if (compDef) {
                totalComponentGoldCost += compDef.usageGoldCost || 0;
                totalComponentEssenceCost += compDef.usageEssenceCost || 0;
            }
        });

        if (player.gold < totalComponentGoldCost) {
            setModalContent({ title: "Crafting Failed", message: `Insufficient gold for component usage. Need ${totalComponentGoldCost}G. You have ${player.gold}G.`, type: 'error' });
            setIsLoading(false);
            return;
        }
        if (player.essence < totalComponentEssenceCost) {
            setModalContent({ title: "Crafting Failed", message: `Insufficient essence for component usage. Need ${totalComponentEssenceCost}Ess. You have ${player.essence}Ess.`, type: 'error' });
            setIsLoading(false);
            return;
        }
        
        const finalSpellData = {
            ...spellDetailsFromAI,
            _componentUsageGoldCost: totalComponentGoldCost,
            _componentUsageEssenceCost: totalComponentEssenceCost,
        };

        setPendingSpellCraftData(finalSpellData);
        setGameState('SPELL_CRAFT_CONFIRMATION');
    } catch (error) {
        console.error("Spell design finalization error:", error);
        setModalContent({ title: "Design Finalization Failed", message: error instanceof Error ? error.message : "Could not finalize spell design with AI.", type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };


  const handleConfirmSpellCraft = () => {
    if (!pendingSpellCraftData) {
        setModalContent({ title: "Crafting Error", message: "No spell data to confirm.", type: 'error' });
        return;
    }
    if (!checkResources(pendingSpellCraftData.resourceCost)) {
        setModalContent({ title: "Crafting Failed", message: "Insufficient final resources for this AI-balanced spell.", type: 'error' });
        return;
    }
    const componentGoldCost = pendingSpellCraftData._componentUsageGoldCost || 0;
    const componentEssenceCost = pendingSpellCraftData._componentUsageEssenceCost || 0;

    if (player.gold < componentGoldCost) {
        setModalContent({ title: "Crafting Failed", message: `Insufficient gold for component usage. Need ${componentGoldCost}G.`, type: 'error' });
        return;
    }
    if (player.essence < componentEssenceCost) {
        setModalContent({ title: "Crafting Failed", message: `Insufficient essence for component usage. Need ${componentEssenceCost}Ess.`, type: 'error' });
        return;
    }

    deductResources(pendingSpellCraftData.resourceCost);
    setPlayer(prev => ({
        ...prev,
        gold: prev.gold - componentGoldCost,
        essence: prev.essence - componentEssenceCost,
    }));


    const newSpell: Spell = {
        id: `spell-${Date.now()}`,
        name: pendingSpellCraftData.name,
        description: pendingSpellCraftData.description,
        manaCost: pendingSpellCraftData.manaCost,
        damage: pendingSpellCraftData.damage,
        damageType: pendingSpellCraftData.damageType,
        scalesWith: pendingSpellCraftData.scalesWith,
        effect: pendingSpellCraftData.effect,
        iconName: pendingSpellCraftData.iconName,
        statusEffectInflict: pendingSpellCraftData.statusEffectInflict,
        resourceCost: pendingSpellCraftData.resourceCost,
        level: pendingSpellCraftData.level || 1,
        componentsUsed: pendingSpellCraftData.componentsUsed || [],
        tags: pendingSpellCraftData.tags || [],
        rarity: pendingSpellCraftData.rarity || 0,
        epCost: pendingSpellCraftData.epCost,
        scalingFactor: getScalingFactorFromRarity(pendingSpellCraftData.rarity || 0),
        duration: pendingSpellCraftData.duration,
    };

    setPlayer(prev => ({ ...prev, spells: [...prev.spells, newSpell] }));
    setModalContent({ title: "Spell Crafted!", message: `${newSpell.name} added to your collection.`, type: 'success' });
    setPendingSpellCraftData(null);
    setInitialSpellPromptForStudio('');
    setGameState('SPELL_DESIGN_STUDIO');
  };

  const handleInitiateEditSpell = (spell: Spell) => {
    setOriginalSpellForEdit(spell);
    setGameState('SPELL_EDITING');
  };

  const handleInitiateSpellRefinement = async (originalSpell: Spell, refinementPrompt: string) => {
    setIsLoading(true);
    try {
      const editedSpellData = await editSpell(originalSpell, refinementPrompt);
      setPendingSpellEditData(editedSpellData);
      setOriginalSpellForEdit(originalSpell);
      setGameState('SPELL_EDIT_CONFIRMATION');
    }
    catch (error) { console.error("Spell refinement error:", error); setModalContent({ title: "Refinement Failed", message: error instanceof Error ? error.message : "Could not generate refinement.", type: 'error' }); }
    finally { setIsLoading(false); }
  };

  const handleConfirmSpellEdit = () => {
    if (!pendingSpellEditData || !originalSpellForEdit || !checkResources(pendingSpellEditData.resourceCost)) { setModalContent({ title: "Refinement Failed", message: "Insufficient resources.", type: 'error' }); return; }
    deductResources(pendingSpellEditData.resourceCost);
    const updatedSpell: Spell = {
      ...originalSpellForEdit,
      ...pendingSpellEditData,
      level: pendingSpellEditData.level || originalSpellForEdit.level,
      componentsUsed: pendingSpellEditData.componentsUsed || originalSpellForEdit.componentsUsed,
      tags: pendingSpellEditData.tags || originalSpellForEdit.tags,
      rarity: pendingSpellEditData.rarity ?? originalSpellForEdit.rarity,
      epCost: pendingSpellEditData.epCost ?? originalSpellForEdit.epCost,
      scalingFactor: getScalingFactorFromRarity(pendingSpellEditData.rarity ?? originalSpellForEdit.rarity),
      duration: pendingSpellEditData.duration ?? originalSpellForEdit.duration,
    };
    setPlayer(prev => ({ ...prev, spells: prev.spells.map(s => s.id === updatedSpell.id ? updatedSpell : s) }));
    setModalContent({ title: "Spell Refined!", message: `${updatedSpell.name} updated!`, type: 'success' });
    setPendingSpellEditData(null); setOriginalSpellForEdit(null); setDefaultCharacterSheetTab('Spells'); setGameState('CHARACTER_SHEET');
  };

  const handleCraftTrait = async (promptText: string) => {
    setIsLoading(true);
    try {
      const traitData = await generateTrait(promptText, player.level);
      const newTrait: Trait = {
        ...traitData,
        id: `trait-${Date.now()}`,
        iconName: traitData.iconName || DEFAULT_TRAIT_ICON,
        rarity: traitData.rarity || 0,
        scalingFactor: getScalingFactorFromRarity(traitData.rarity || 0),
      };
      setPlayer(prev => ({...prev, traits: [...prev.traits, newTrait]}));
      setModalContent({ title: "Trait Acquired!", message: `Gained: ${newTrait.name}!`, type: 'success' });
      setGameState('HOME');
      setPendingTraitUnlock(false);
    }
    catch (error) { console.error("Trait crafting error:", error); setModalContent({ title: "Trait Crafting Failed", message: error instanceof Error ? error.message : "Could not craft trait.", type: 'error' }); }
    finally { setIsLoading(false); }
  };

  const handleInitiateItemCraft = async (promptText: string, itemType: ItemType) => {
    setIsLoading(true);
    try {
      let itemData: GeneratedConsumableData | GeneratedEquipmentData;
      if (itemType === 'Consumable') itemData = await generateConsumable(promptText, player.level);
      else itemData = await generateEquipment(promptText, player.level);
      setPendingItemCraftData(itemData);
      setGameState('ITEM_CRAFT_CONFIRMATION');
    }
    catch (error) { console.error(`${itemType} idea error:`, error); setModalContent({ title: "Generation Failed", message: error instanceof Error ? error.message : `Could not generate ${itemType} idea.`, type: 'error' }); }
    finally { setIsLoading(false); }
  };

  const handleConfirmItemCraft = () => {
    if (!pendingItemCraftData) return;
    const itemTypeCrafted: ItemType = (pendingItemCraftData as GeneratedEquipmentData).slot ? 'Equipment' : 'Consumable';
    if (!checkResources(pendingItemCraftData.resourceCost)) { setModalContent({ title: "Craft Failed", message: "Insufficient resources.", type: 'error' }); return; }
    deductResources(pendingItemCraftData.resourceCost);
    const newItem: GameItem = {
        ...pendingItemCraftData,
        id: `${itemTypeCrafted.toLowerCase()}-${Date.now()}`,
        itemType: itemTypeCrafted,
        rarity: pendingItemCraftData.rarity || 0,
        stackable: false, 
        scalingFactor: (pendingItemCraftData as GeneratedEquipmentData).scalingFactor || getScalingFactorFromRarity(pendingItemCraftData.rarity || 0),
    } as GameItem;
    setPlayer(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setModalContent({ title: `${itemTypeCrafted} Crafted!`, message: `${newItem.name} added to inventory.`, type: 'success' });
    setPendingItemCraftData(null); setGameState('CRAFTING_HUB');
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

  const processPlayerTurnStartEffects = useCallback((currentTurn: number): { isDefeated: boolean, willBeStunnedThisTurn: boolean, willBeSilencedThisTurn: boolean, willBeRootedThisTurn: boolean } => {
    let playerCurrentHp = player.hp;
    let playerIsStunned = false;
    let playerIsSilenced = false;
    let playerIsRooted = false;
    let newActiveEffects: ActiveStatusEffect[] = [];

    player.activeStatusEffects.forEach(effect => {
        let effectPersists = true;
        switch (effect.name) {
            case 'PoisonDoTActive': case 'BurningDoTActive': case 'BleedingDoTActive': case 'CorruptedDoTActive': case 'FrostbittenDoTActive': case 'RottingDoTActive': case 'ShockedDoTActive':
                if (effect.magnitude) {
                    playerCurrentHp -= effect.magnitude;
                    addLog('Player', `takes ${effect.magnitude} ${effect.name.replace('DoTActive','')} damage.`, 'damage');
                }
                break;
            case 'Stun': case 'Freeze':
                playerIsStunned = true;
                break;
            case 'Silenced':
                playerIsSilenced = true;
                break;
            case 'Rooted':
                playerIsRooted = true;
                break;
            case 'Regeneration': case 'TEMP_HP_REGEN':
                if (effect.magnitude) {
                    const healAmount = Math.min(effect.magnitude, effectivePlayerStats.maxHp - playerCurrentHp);
                    if (healAmount > 0) {
                        playerCurrentHp += healAmount;
                        addLog('Player', `regenerates ${healAmount} HP.`, 'heal');
                    }
                }
                break;
            default: break;
        }
        if (effect.duration - 1 <= 0) {
            addLog('Player', `${effect.name} on Player has worn off.`, 'status');
            effectPersists = false;
        } else {
            newActiveEffects.push({ ...effect, duration: effect.duration - 1 });
        }
    });

    const regeneratedEp = Math.min(effectivePlayerStats.maxEp, player.ep + PLAYER_EP_REGEN_PER_TURN);
    if (regeneratedEp > player.ep && !playerIsStunned) {
        addLog('Player', `recovers ${regeneratedEp - player.ep} EP.`, 'resource');
    }

    setPlayer(prev => ({
        ...prev,
        hp: Math.min(effectivePlayerStats.maxHp, Math.max(0, playerCurrentHp)),
        ep: playerIsStunned ? prev.ep : regeneratedEp,
        activeStatusEffects: newActiveEffects
    }));

    if (playerCurrentHp <= 0) {
        addLog('System', 'Player succumbed to status effects!', 'info');
        setModalContent({ title: "Defeat!", message: "Overcome by status effects.", type: 'error' });
        setGameState('GAME_OVER_DEFEAT');
        return { isDefeated: true, willBeStunnedThisTurn: playerIsStunned, willBeSilencedThisTurn: playerIsSilenced, willBeRootedThisTurn: playerIsRooted };
    }

    setPlayerActionSkippedByStun(playerIsStunned);
    if (playerIsStunned) addLog('Player', `is stunned! Actions will be skipped.`, 'status');
    if (playerIsSilenced && !playerIsStunned) addLog('Player', 'is silenced! Spellcasting is prevented.', 'status');
    if (playerIsRooted && !playerIsStunned) addLog('Player', 'is rooted! Fleeing is prevented.', 'status');
    
    return { isDefeated: false, willBeStunnedThisTurn: playerIsStunned, willBeSilencedThisTurn: playerIsSilenced, willBeRootedThisTurn: playerIsRooted };
  }, [player.hp, player.ep, player.activeStatusEffects, effectivePlayerStats, addLog]);

  const handleFindEnemy = async () => {
    if (getPreparedSpells().length === 0 && getPreparedAbilities().length === 0 && !player.items.some(i => i.itemType === 'Consumable') && !Object.keys(player.inventory).some(itemId => MASTER_ITEM_DEFINITIONS[itemId]?.itemType === 'Consumable' && player.inventory[itemId] > 0)) {
        setModalContent({ title: "Unprepared", message: "Prepare spells/abilities or have consumables before seeking battle.", type: 'info'});
        return;
    }
    setIsLoading(true); setCombatLog([]); const initialTurn = 1; setTurn(initialTurn); setPlayerActionSkippedByStun(false);
    setPlayer(prev => ({ ...prev, activeStatusEffects: prev.activeStatusEffects.filter(eff => eff.name !== 'Defending') }));
    setCurrentActingEnemyIndex(0);

    try {
      const numberOfEnemies = Math.random() < 0.6 ? 1 : 2;
      const enemiesArray: Enemy[] = [];
      for (let i = 0; i < numberOfEnemies; i++) {
        const enemyData = await generateEnemy(player.level);
        const enemySpeed = enemyData.baseSpeed ?? (PLAYER_BASE_SPEED_FROM_REFLEX + Math.floor(enemyData.baseReflex * SPEED_PER_REFLEX));
        const newEnemy: Enemy = {
          ...enemyData,
          id: `enemy-${Date.now()}-${i}`,
          maxHp: enemyData.hp,
          speed: enemySpeed,
          activeStatusEffects: [],
          body: enemyData.baseBody || 10,
          mind: enemyData.baseMind || 10,
          reflex: enemyData.baseReflex || 10,
          goldDrop: enemyData.goldDrop || {min: ENEMY_DIFFICULTY_XP_REWARD.easy.goldMin, max: ENEMY_DIFFICULTY_XP_REWARD.easy.goldMax },
          essenceDrop: enemyData.essenceDrop || {min: 0, max: 1},
          isElite: enemyData.isElite || false,
          droppedResources: enemyData.droppedResources || [],
          lootTableId: enemyData.lootTableId || `default_lvl_${enemyData.level}`
        };
        enemiesArray.push(newEnemy);

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
      setTargetEnemyId(enemiesArray.length > 0 ? enemiesArray[0].id : null);

      addLog('System', `${enemiesArray.map(e => `${e.isElite ? 'ELITE ' : ''}${e.name} (Lvl ${e.level})`).join(' and ')} appear!`, 'info');

      const avgEnemySpeed = enemiesArray.reduce((sum, e) => sum + e.speed, 0) / enemiesArray.length;
      const playerSpeedRoll = effectivePlayerStats.speed + Math.floor(Math.random() * 6) + 1;
      const enemySpeedRoll = avgEnemySpeed + Math.floor(Math.random() * 6) + 1;

      addLog('System', `Player speed roll: ${playerSpeedRoll} (Effective: ${effectivePlayerStats.speed})`, 'speed');
      addLog('System', `Enemies average speed roll: ${enemySpeedRoll.toFixed(1)} (Avg Base: ${avgEnemySpeed.toFixed(1)})`, 'speed');

      setGameState('IN_COMBAT');

      if (playerSpeedRoll >= enemySpeedRoll) {
        addLog('System', `Player acts first!`, 'speed');
        setIsPlayerTurn(true);
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

  const calculateDamage = (baseDamage: number, attackerPower: number, defenderDefense: number, effectiveness: 'normal' | 'weak' | 'resistant' = 'normal', scalingFactor: number = 0, scalingStatValue: number = 0): number => {
    let modifiedDamage = baseDamage + attackerPower + (scalingStatValue * (scalingFactor || 0));
    if (effectiveness === 'weak') modifiedDamage *= 1.5;
    if (effectiveness === 'resistant') modifiedDamage *= 0.5;
    const finalDamage = Math.max(1, Math.floor(modifiedDamage - defenderDefense));
    return finalDamage;
  };

  const applyDamageAndReflection = (
    target: Player | Enemy,
    damage: number,
    attacker: Player | Enemy,
    logActorForDamage: 'Player' | 'Enemy', 
    targetIsPlayer: boolean
  ): { actualDamageDealt: number; updatedTargetHp: number } => {
    let actualDamageDealt = damage;
    let updatedTargetHp = target.hp - actualDamageDealt;
    let reflectionPercent = 0;

    if (targetIsPlayer) {
        reflectionPercent = effectivePlayerStats.damageReflectionPercent || 0;
    } else { 
        const enemyTarget = target as Enemy;
        reflectionPercent = enemyTarget.activeStatusEffects.find(eff => eff.name === 'DamageReflection')?.magnitude || 0; 
    }

    if (reflectionPercent > 0) {
        const reflectedDamage = Math.floor(actualDamageDealt * reflectionPercent);
        if (reflectedDamage > 0) {
            const reflectorName = targetIsPlayer ? player.name : (target as Enemy).name;
            const reflectTargetName = !targetIsPlayer ? player.name : (attacker as Enemy).name;
            addLog(logActorForDamage, `${reflectorName} reflects ${reflectedDamage} damage back to ${reflectTargetName}!`, 'damage');
            
            if (targetIsPlayer) { 
                const enemyAttacker = attacker as Enemy;
                setCurrentEnemies(prevEnemies => prevEnemies.map(e => e.id === enemyAttacker.id ? {...e, hp: Math.max(0, e.hp - reflectedDamage)} : e));
                 if (enemyAttacker.hp - reflectedDamage <= 0 && !currentEnemies.find(e=>e.id === enemyAttacker.id && e.hp <=0)) { 
                    handleEnemyDefeat({...enemyAttacker, hp: enemyAttacker.hp - reflectedDamage});
                }
            } else { 
                setPlayer(prevPlayer => {
                    const newPlayerHp = Math.max(0, prevPlayer.hp - reflectedDamage);
                    if (newPlayerHp <= 0) {
                        setModalContent({ title: "Defeat!", message: "Slain by reflected damage.", type: 'error' });
                        setGameState('GAME_OVER_DEFEAT');
                    }
                    return {...prevPlayer, hp: newPlayerHp};
                });
            }
        }
    }
    return { actualDamageDealt, updatedTargetHp };
  };


  const playerAttack = (spell: Spell, targetId: string) => {
    const targetEnemy = currentEnemies.find(e => e.id === targetId);
    if (!targetEnemy || player.mp < spell.manaCost) return;

    if (player.activeStatusEffects.some(eff => eff.name === 'Silenced')) {
      addLog('Player', `is Silenced and cannot cast spells!`, 'status');
      setIsPlayerTurn(false);
      return;
    }

    setPlayer(prev => ({ ...prev, mp: prev.mp - spell.manaCost }));
    addLog('Player', `casts ${spell.name} on ${targetEnemy.name}.`, 'action');

    let actualDamageDealt = 0;
    let updatedTargetHp = targetEnemy.hp;
    const scalingStatValue = spell.scalesWith === 'Mind' ? effectivePlayerStats.mind : spell.scalesWith === 'Body' ? effectivePlayerStats.body : 0;

    if (spell.tags?.includes('SelfTarget')) {
        if (spell.damageType === 'HealingSource') {
             const healAmount = calculateDamage(spell.damage, effectivePlayerStats.magicPower, 0, 'normal', spell.scalingFactor, scalingStatValue);
             const actualHeal = Math.min(healAmount, effectivePlayerStats.maxHp - player.hp);
             if (actualHeal > 0) {
                setPlayer(prev => ({ ...prev, hp: prev.hp + actualHeal }));
                addLog('Player', `heals self for ${actualHeal} HP.`, 'heal');
             }
        }
        if (spell.statusEffectInflict) applyStatusEffect('player', spell.statusEffectInflict, spell.id);

    } else if (spell.damageType === 'HealingSource') { 
      const healAmount = calculateDamage(spell.damage, effectivePlayerStats.magicPower, 0, 'normal', spell.scalingFactor, scalingStatValue);
      const actualHeal = Math.min(healAmount, effectivePlayerStats.maxHp - player.hp);
      if (actualHeal > 0) {
        setPlayer(prev => ({ ...prev, hp: prev.hp + actualHeal }));
        addLog('Player', `heals self for ${actualHeal} HP.`, 'heal');
      }
    } else if (spell.damage > 0) {
      const attackerPower = spell.scalesWith === 'Body' ? effectivePlayerStats.physicalPower : effectivePlayerStats.magicPower;
      const effectiveness = targetEnemy.weakness === spell.damageType ? 'weak' : targetEnemy.resistance === spell.damageType ? 'resistant' : 'normal';
      const calculatedDamage = calculateDamage(spell.damage, attackerPower, targetEnemy.mind, effectiveness, spell.scalingFactor, scalingStatValue);
      const damageResult = applyDamageAndReflection(targetEnemy, calculatedDamage, player, 'Enemy', false); 
      actualDamageDealt = damageResult.actualDamageDealt;
      updatedTargetHp = damageResult.updatedTargetHp;
      addLog('Player', `deals ${actualDamageDealt} ${spell.damageType} damage to ${targetEnemy.name}. ${effectiveness !== 'normal' ? `(${effectiveness})` : ''}`, 'damage');
      setCurrentEnemies(prevEnemies => prevEnemies.map(e => e.id === targetId ? { ...e, hp: updatedTargetHp } : e));
    }

    if (!spell.tags?.includes('SelfTarget') && spell.statusEffectInflict) {
      applyStatusEffect(targetEnemy.id, spell.statusEffectInflict, spell.id);
    }

    if (updatedTargetHp <= 0) {
      handleEnemyDefeat({...targetEnemy, hp: updatedTargetHp });
    }
    setIsPlayerTurn(false);
  };

  const handleUseAbility = (abilityId: string, targetId: string | null) => {
    const ability = player.abilities.find(a => a.id === abilityId);
    if (!ability || player.ep < ability.epCost) return;

    if (ability.tags?.includes('Silence') && player.activeStatusEffects.some(eff => eff.name === 'Silenced')) {
        addLog('Player', `is Silenced and cannot use this ability!`, 'status');
        setIsPlayerTurn(false);
        return;
    }

    setPlayer(prev => ({...prev, ep: prev.ep - ability.epCost}));
    addLog('Player', `uses ${ability.name}.`, 'action');

    let targetEntity: Player | Enemy | null = null;
    if (ability.tags?.includes('SelfTarget')) {
        targetEntity = player;
         if (ability.effectType === 'TEMP_STAT_BUFF' && ability.targetStatusEffect && ability.duration && ability.magnitude) {
            applyStatusEffect('player', { name: ability.targetStatusEffect, duration: ability.duration, magnitude: ability.magnitude, chance: 100 }, ability.id);
        }
    } else if (targetId) {
        targetEntity = currentEnemies.find(e => e.id === targetId);
         if (targetEntity && ability.effectType === 'ENEMY_DEBUFF' && ability.targetStatusEffect && ability.duration) {
            applyStatusEffect(targetId, { name: ability.targetStatusEffect, duration: ability.duration, magnitude: ability.magnitude, chance: 100 }, ability.id);
        }
    }

    switch(ability.effectType) {
        case 'MP_RESTORE':
            const mpRestored = Math.min(ability.magnitude || 0, effectivePlayerStats.maxMp - player.mp);
            if (mpRestored > 0) {
                setPlayer(prev => ({...prev, mp: prev.mp + mpRestored}));
                addLog('Player', `restores ${mpRestored} MP.`, 'resource');
            }
            break;
        case 'SELF_HEAL':
            const hpRestored = Math.min(ability.magnitude || 0, effectivePlayerStats.maxHp - player.hp);
            if (hpRestored > 0) {
                setPlayer(prev => ({...prev, hp: prev.hp + hpRestored}));
                addLog('Player', `heals for ${hpRestored} HP.`, 'heal');
            }
            break;
    }
    setIsPlayerTurn(false);
  };

 const handleUseConsumable = (itemId: string, targetId: string | null) => {
    let itemUsed: UniqueConsumable | MasterConsumableItem | undefined;
    let isStackable = false;

    const uniqueItem = player.items.find(i => i.id === itemId && i.itemType === 'Consumable') as UniqueConsumable | undefined;
    if (uniqueItem) {
        itemUsed = uniqueItem;
    } else {
        const masterItemDef = MASTER_ITEM_DEFINITIONS[itemId] as MasterConsumableItem | undefined;
        if (masterItemDef && masterItemDef.itemType === 'Consumable' && (player.inventory[itemId] || 0) > 0) {
            itemUsed = masterItemDef;
            isStackable = true;
        }
    }

    if (!itemUsed) {
        addLog('System', `Could not find or use item ${itemId}.`, 'error');
        return;
    }

    addLog('Player', `uses ${itemUsed.name}.`, 'action');

    switch (itemUsed.effectType) {
        case 'HP_RESTORE':
            const hpRestored = Math.min(itemUsed.magnitude || 0, effectivePlayerStats.maxHp - player.hp);
            if (hpRestored > 0) {
                setPlayer(prev => ({ ...prev, hp: prev.hp + hpRestored }));
                addLog('Player', `restores ${hpRestored} HP.`, 'heal');
            }
            break;
        case 'MP_RESTORE':
             const mpRestored = Math.min(itemUsed.magnitude || 0, effectivePlayerStats.maxMp - player.mp);
            if (mpRestored > 0) {
                setPlayer(prev => ({ ...prev, mp: prev.mp + mpRestored }));
                addLog('Player', `restores ${mpRestored} MP.`, 'resource');
            }
            break;
        case 'EP_RESTORE':
            const epRestored = Math.min(itemUsed.magnitude || 0, effectivePlayerStats.maxEp - player.ep);
            if (epRestored > 0) {
                setPlayer(prev => ({ ...prev, ep: prev.ep + epRestored }));
                addLog('Player', `restores ${epRestored} EP.`, 'resource');
            }
            break;
        case 'CURE_STATUS':
            if (itemUsed.statusToCure) {
                setPlayer(prev => ({
                    ...prev,
                    activeStatusEffects: prev.activeStatusEffects.filter(eff => eff.name !== itemUsed!.statusToCure)
                }));
                addLog('Player', `is cured of ${itemUsed.statusToCure}.`, 'status');
            }
            break;
        case 'APPLY_BUFF':
            if (itemUsed.buffToApply && itemUsed.duration) {
                applyStatusEffect('player', {
                    name: itemUsed.buffToApply,
                    duration: itemUsed.duration,
                    magnitude: itemUsed.magnitude,
                    chance: 100
                }, itemUsed.id);
            }
            break;
    }

    if (isStackable) {
        setPlayer(prev => ({
            ...prev,
            inventory: { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) - 1 }
        }));
    } else {
        setPlayer(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
    }
    setIsPlayerTurn(false);
};


  const handlePlayerBasicAttack = (targetId: string) => {
    const targetEnemy = currentEnemies.find(e => e.id === targetId);
    if (!targetEnemy) return;
    addLog('Player', `attacks ${targetEnemy.name} with a basic strike.`, 'action');

    const effectiveness = targetEnemy.weakness === 'PhysicalNeutral' ? 'weak' : targetEnemy.resistance === 'PhysicalNeutral' ? 'resistant' : 'normal';
    const calculatedDamage = calculateDamage(5, effectivePlayerStats.physicalPower, targetEnemy.body, effectiveness); 
    
    const { actualDamageDealt, updatedTargetHp } = applyDamageAndReflection(targetEnemy, calculatedDamage, player, 'Enemy', false);

    addLog('Player', `deals ${actualDamageDealt} physical damage to ${targetEnemy.name}. ${effectiveness !== 'normal' ? `(${effectiveness})` : ''}`, 'damage');
    setCurrentEnemies(prevEnemies => prevEnemies.map(e => e.id === targetId ? { ...e, hp: updatedTargetHp } : e));

    if (updatedTargetHp <= 0) handleEnemyDefeat({...targetEnemy, hp: updatedTargetHp });
    setIsPlayerTurn(false);
  };

  const handlePlayerDefend = () => {
    addLog('Player', `is defending.`, 'action');
    applyStatusEffect('player', { name: 'Defending', duration: 1, chance: 100 }, 'defend-action');
    setIsPlayerTurn(false);
  };

  const handlePlayerFlee = () => {
    if (player.activeStatusEffects.some(eff => eff.name === 'Rooted')) {
      addLog('Player', `is Rooted and cannot flee!`, 'status');
      setIsPlayerTurn(false); 
      return;
    }
    const fleeChance = 0.75; 
    if (Math.random() < fleeChance) {
      addLog('Player', `successfully flees from battle!`, 'info');
      setGameState('HOME');
      setCurrentEnemies([]);
    } else {
      addLog('Player', `failed to flee!`, 'info');
      setIsPlayerTurn(false);
    }
  };

  const handlePlayerFreestyleAction = async (actionText: string, targetId: string | null) => {
    addLog('Player', `attempts: "${actionText}"${targetId ? ` on ${currentEnemies.find(e => e.id === targetId)?.name}` : ''}.`, 'action');
    setModalContent({title: "Freestyle Action", message: "AI is processing your freestyle action... (This feature is conceptual and results are simulated)", type: "info"});
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const outcomes = [
        { success: true, message: `The action seems to have a minor positive effect! (+5 HP)`, effect: () => setPlayer(p => ({...p, hp: Math.min(p.maxHp, p.hp + 5)}))},
        { success: true, message: `The action confuses the enemy slightly! (${targetId ? currentEnemies.find(e => e.id === targetId)?.name : 'Target'} takes 3 damage)`, effect: () => { if(targetId) { const enemy = currentEnemies.find(e => e.id === targetId); if(enemy) { const newHp = Math.max(0, enemy.hp -3); setCurrentEnemies(es => es.map(e => e.id === targetId ? {...e, hp: newHp} : e)); if(newHp <=0) handleEnemyDefeat({...enemy, hp: newHp});} } } },
        { success: false, message: `The action fizzles with no noticeable effect.`, effect: () => {}},
        { success: false, message: `The action backfires slightly! (-2 MP)`, effect: () => setPlayer(p => ({...p, mp: Math.max(0, p.mp - 2)}))},
    ];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    addLog('System', randomOutcome.message, randomOutcome.success ? 'info' : 'status');
    randomOutcome.effect();
    setModalContent(null);
    setIsPlayerTurn(false);
  };


 const processEnemyTurn = useCallback(() => {
    if (currentEnemies.length === 0 || isPlayerTurn) return; 

    const actingEnemy = currentEnemies[currentActingEnemyIndex];
    if (!actingEnemy || actingEnemy.hp <= 0) {
      const nextIndex = currentActingEnemyIndex + 1;
      if (nextIndex >= currentEnemies.length || currentEnemies.every(e => e.hp <= 0)) {
        setTurn(prev => prev + 1); setIsPlayerTurn(true); setCurrentActingEnemyIndex(0);
        processPlayerTurnStartEffects(turn + 1);
      } else {
        setCurrentActingEnemyIndex(nextIndex);
      }
      return;
    }

    let enemyCurrentHp = actingEnemy.hp;
    let enemyIsStunned = false;
    let enemyIsSilenced = false;
    let enemyIsRooted = false;
    let newEnemyActiveEffects: ActiveStatusEffect[] = [];
    actingEnemy.activeStatusEffects.forEach(effect => {
        let effectPersists = true;
        switch(effect.name) {
            case 'PoisonDoTActive': case 'BurningDoTActive': case 'BleedingDoTActive': case 'CorruptedDoTActive': case 'FrostbittenDoTActive': case 'RottingDoTActive': case 'ShockedDoTActive':
                if (effect.magnitude) {
                  enemyCurrentHp -= effect.magnitude;
                  addLog('Enemy', `${actingEnemy.name} takes ${effect.magnitude} ${effect.name.replace('DoTActive','')} damage.`, 'damage');
                }
                break;
            case 'Stun': case 'Freeze': enemyIsStunned = true; break;
            case 'Silenced': enemyIsSilenced = true; break;
            case 'Rooted': enemyIsRooted = true; break; 
        }
      if (effect.duration - 1 <= 0) {
        addLog('Enemy', `${effect.name} on ${actingEnemy.name} has worn off.`, 'status');
        effectPersists = false;
      } else {
        newEnemyActiveEffects.push({ ...effect, duration: effect.duration - 1 });
      }
    });

    setCurrentEnemies(prev => prev.map(e => e.id === actingEnemy.id ? { ...e, hp: Math.max(0, enemyCurrentHp), activeStatusEffects: newEnemyActiveEffects } : e));
    if (enemyCurrentHp <= 0) {
      addLog('System', `${actingEnemy.name} succumbed to status effects!`, 'info');
      handleEnemyDefeat({...actingEnemy, hp: enemyCurrentHp});
       const nextIndex = currentActingEnemyIndex + 1;
        if (nextIndex >= currentEnemies.length || currentEnemies.filter(e => e.hp > 0).length === 0) {
            setTurn(prev => prev + 1); setIsPlayerTurn(true); setCurrentActingEnemyIndex(0); processPlayerTurnStartEffects(turn + 1);
        } else { setCurrentActingEnemyIndex(nextIndex); }
      return;
    }

    if (enemyIsStunned) {
      addLog('Enemy', `${actingEnemy.name} is stunned and cannot act!`, 'status');
    } else {
      const useSpecial = actingEnemy.specialAbilityName && !enemyIsSilenced && Math.random() < 0.5; 
      if (useSpecial) {
        addLog('Enemy', `${actingEnemy.name} uses ${actingEnemy.specialAbilityName}!`, 'action');
        const enemyPower = actingEnemy.mind + 5; 
        const damageTypeForEnemy = actingEnemy.resistance || 'Arcane'; 
        const calculatedDamage = calculateDamage(10 + actingEnemy.level * 2, enemyPower, effectivePlayerStats.defense);
        const { actualDamageDealt, updatedTargetHp: playerNewHp } = applyDamageAndReflection(player, calculatedDamage, actingEnemy, 'Player', true);
        addLog('Enemy', `deals ${actualDamageDealt} ${damageTypeForEnemy} damage to Player.`, 'damage');
        setPlayer(prev => ({ ...prev, hp: playerNewHp }));
        if (playerNewHp <= 0) { setGameState('GAME_OVER_DEFEAT'); return; }
      } else {
        if (enemyIsSilenced && actingEnemy.specialAbilityName) {
            addLog('Enemy', `${actingEnemy.name} is Silenced and resorts to a basic attack!`, 'status');
        } else {
            addLog('Enemy', `${actingEnemy.name} attacks Player!`, 'action');
        }
        const enemyPower = actingEnemy.body; 
        const damageTypeForEnemy = 'PhysicalNeutral';
        const calculatedDamage = calculateDamage(5 + actingEnemy.level, enemyPower, effectivePlayerStats.defense);
        const { actualDamageDealt, updatedTargetHp: playerNewHp } = applyDamageAndReflection(player, calculatedDamage, actingEnemy, 'Player', true);
        addLog('Enemy', `deals ${actualDamageDealt} ${damageTypeForEnemy} damage to Player.`, 'damage');
        setPlayer(prev => ({ ...prev, hp: playerNewHp }));
        if (playerNewHp <= 0) { setGameState('GAME_OVER_DEFEAT'); return; }
      }
    }
    
    const nextIndex = currentActingEnemyIndex + 1;
    if (nextIndex >= currentEnemies.length || currentEnemies.filter(e => e.hp > 0).length === 0) {
        setTurn(prev => prev + 1); setIsPlayerTurn(true); setCurrentActingEnemyIndex(0);
        processPlayerTurnStartEffects(turn + 1);
    } else {
        setCurrentActingEnemyIndex(nextIndex);
    }

  }, [currentEnemies, player, effectivePlayerStats, addLog, turn, currentActingEnemyIndex]);


  useEffect(() => {
    if (!isPlayerTurn && currentEnemies.length > 0 && currentEnemies.some(e => e.hp > 0)) {
      const timeoutId = setTimeout(() => {
        processEnemyTurn();
      }, 1000); 
      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, currentEnemies, processEnemyTurn, currentActingEnemyIndex]);

  useEffect(() => {
    if (isPlayerTurn && currentEnemies.length > 0 && player.hp > 0) {
        const { willBeStunnedThisTurn } = processPlayerTurnStartEffects(turn);
        if(willBeStunnedThisTurn) {
            setTimeout(() => {
                 setIsPlayerTurn(false);
            }, 500); 
        }
    }
  }, [isPlayerTurn, turn, player.hp, currentEnemies.length, processPlayerTurnStartEffects]); 


  const applyStatusEffect = (targetId: 'player' | string, effect: SpellStatusEffect, sourceId: string) => {
    const newEffect: ActiveStatusEffect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      name: effect.name,
      duration: effect.duration || (effect.name === 'Silenced' ? DEFAULT_SILENCE_DURATION : effect.name === 'Rooted' ? DEFAULT_ROOT_DURATION : 1),
      magnitude: effect.magnitude,
      sourceSpellId: sourceId,
      inflictedTurn: turn,
      iconName: STATUS_EFFECT_ICONS[effect.name] || 'Default'
    };

    if (Math.random() * 100 > effect.chance) {
      addLog('System', `${effect.name} failed to apply to ${targetId === 'player' ? 'Player' : currentEnemies.find(e=>e.id===targetId)?.name}.`, 'status');
      return;
    }

    if (targetId === 'player') {
      setPlayer(prev => {
        const existingEffectIndex = prev.activeStatusEffects.findIndex(ae => ae.name === newEffect.name);
        if (existingEffectIndex > -1) {
          const updatedEffects = [...prev.activeStatusEffects];
          updatedEffects[existingEffectIndex] = { ...newEffect, duration: Math.max(updatedEffects[existingEffectIndex].duration, newEffect.duration) }; 
          if(newEffect.magnitude && (!updatedEffects[existingEffectIndex].magnitude || newEffect.magnitude > updatedEffects[existingEffectIndex].magnitude!)) { 
            updatedEffects[existingEffectIndex].magnitude = newEffect.magnitude;
          }
          return { ...prev, activeStatusEffects: updatedEffects };
        }
        return { ...prev, activeStatusEffects: [...prev.activeStatusEffects, newEffect] };
      });
      addLog('Player', `is afflicted with ${newEffect.name}.`, 'status');
    } else {
      setCurrentEnemies(prevEnemies => prevEnemies.map(enemy => {
        if (enemy.id === targetId) {
          const existingEffectIndex = enemy.activeStatusEffects.findIndex(ae => ae.name === newEffect.name);
          let updatedEnemyEffects = [...enemy.activeStatusEffects];
          if (existingEffectIndex > -1) {
            updatedEnemyEffects[existingEffectIndex] = { ...newEffect, duration: Math.max(updatedEnemyEffects[existingEffectIndex].duration, newEffect.duration) };
            if(newEffect.magnitude && (!updatedEnemyEffects[existingEffectIndex].magnitude || newEffect.magnitude > updatedEnemyEffects[existingEffectIndex].magnitude!)) {
                updatedEnemyEffects[existingEffectIndex].magnitude = newEffect.magnitude;
            }
          } else {
            updatedEnemyEffects.push(newEffect);
          }
          return { ...enemy, activeStatusEffects: updatedEnemyEffects };
        }
        return enemy;
      }));
      addLog('Enemy', `${currentEnemies.find(e=>e.id===targetId)?.name} is afflicted with ${newEffect.name}.`, 'status');
    }
  };

  const awardCombatRewards = (defeatedEnemy: Enemy) => {
    const difficultyKey = defeatedEnemy.level < 3 ? 'easy' : defeatedEnemy.level < 7 ? 'medium' : defeatedEnemy.level < 10 ? 'hard' : 'boss';
    const baseRewards = ENEMY_DIFFICULTY_XP_REWARD[difficultyKey] || ENEMY_DIFFICULTY_XP_REWARD.easy;
    
    let xpGained = baseRewards.xp;
    let goldGained = Math.floor(Math.random() * (baseRewards.goldMax - baseRewards.goldMin + 1)) + baseRewards.goldMin;
    let essenceGained = Math.floor(Math.random() * (baseRewards.essenceMax - baseRewards.essenceMin + 1)) + baseRewards.essenceMin;

    if (defeatedEnemy.isElite && ENEMY_DIFFICULTY_XP_REWARD.elite) {
        xpGained = Math.floor(xpGained * ENEMY_DIFFICULTY_XP_REWARD.elite.xp_multiplier);
        goldGained = Math.floor(goldGained * ENEMY_DIFFICULTY_XP_REWARD.elite.gold_multiplier);
        essenceGained = Math.floor(essenceGained * ENEMY_DIFFICULTY_XP_REWARD.elite.essence_multiplier);
        essenceGained = Math.max(1, essenceGained); 
    }
    
    addLog('System', `Player gains ${xpGained} XP, ${goldGained} Gold, and ${essenceGained} Essence.`, 'info');

    const newInventory = { ...player.inventory };
    const newItems: GameItem[] = [];
    let lootMessages: string[] = [];

    if (defeatedEnemy.droppedResources) {
        defeatedEnemy.droppedResources.forEach(rc => {
            newInventory[rc.itemId] = (newInventory[rc.itemId] || 0) + rc.quantity;
            const itemDef = MASTER_ITEM_DEFINITIONS[rc.itemId];
            lootMessages.push(`${rc.quantity}x ${itemDef ? itemDef.name : rc.type}`);
        });
    }
    
    let chestsToDrop = 0;
    if (defeatedEnemy.isElite) chestsToDrop = 2;
    else if (Math.random() < 0.25) chestsToDrop = 1; 

    for (let i = 0; i < chestsToDrop; i++) {
        const chest: LootChestItem = {
            id: `lootchest-${Date.now()}-${i}`,
            name: defeatedEnemy.isElite ? "Elite Treasure Chest" : "Common Loot Chest",
            description: defeatedEnemy.isElite ? "A sturdy chest dropped by an elite foe." : "A simple chest containing some minor valuables.",
            iconName: 'ChestIcon',
            itemType: 'LootChest',
            rarity: defeatedEnemy.isElite ? (3 + Math.floor(defeatedEnemy.level / 5)) : (1 + Math.floor(defeatedEnemy.level / 10)),
            level: defeatedEnemy.level,
            stackable: false,
        };
        newItems.push(chest);
        lootMessages.push(chest.name);
    }


    if (lootMessages.length > 0) {
        addLog('System', `Found: ${lootMessages.join(', ')}.`, 'resource');
    }

    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
      gold: prev.gold + goldGained,
      essence: prev.essence + essenceGained,
      inventory: newInventory,
      items: [...prev.items, ...newItems],
      bestiary: {
        ...prev.bestiary,
        [defeatedEnemy.id]: {
          ...prev.bestiary[defeatedEnemy.id],
          vanquishedCount: (prev.bestiary[defeatedEnemy.id]?.vanquishedCount || 0) + 1,
        }
      }
    }));
  };

  const handleEnemyDefeat = (enemy: Enemy) => {
    addLog('System', `${enemy.name} has been defeated!`, 'info');
    awardCombatRewards(enemy);
    const remainingEnemies = currentEnemies.filter(e => e.id !== enemy.id && e.hp > 0);
    if (remainingEnemies.length === 0) {
      setModalContent({ title: "Victory!", message: "All enemies defeated!", type: 'success' });
      setGameState('GAME_OVER_VICTORY');
    } else {
      if (targetEnemyId === enemy.id) {
        setTargetEnemyId(remainingEnemies[0].id);
      }
    }
  };

  const handleLevelUp = useCallback(() => {
    const newLevel = player.level + 1;
    const newXpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
    addLog('System', `Player reached Level ${newLevel}!`, 'info');

    const expectedTraits = newLevel >= FIRST_TRAIT_LEVEL ? Math.floor((newLevel - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 : 0;
    if (newLevel >= FIRST_TRAIT_LEVEL && player.traits.length < expectedTraits) {
      setPendingTraitUnlock(true);
      setModalContent({ title: "Trait Unlocked!", message: `You can define a new Trait at level ${newLevel}!`, type: 'success'});
    } else {
        setModalContent({ title: "Level Up!", message: `You are now level ${newLevel}! Stats improved.`, type: 'success'});
    }
    
    const tempPlayerForStatCalc = {...player, level: newLevel};
    const newStats = calculateEffectiveStats(tempPlayerForStatCalc);

    setPlayer(prev => ({
      ...prev,
      level: newLevel,
      xp: prev.xp - prev.xpToNextLevel,
      xpToNextLevel: newXpToNextLevel,
      hp: newStats.maxHp, 
      mp: newStats.maxMp,
      ep: newStats.maxEp,
    }));
  }, [player.level, player.xp, player.xpToNextLevel, player.traits.length, addLog, calculateEffectiveStats]);

  useEffect(() => {
    if (player.xp >= player.xpToNextLevel) {
      handleLevelUp();
    }
  }, [player.xp, player.xpToNextLevel, handleLevelUp]);


  const handleAICreateComponent = async (prompt: string, goldInvested: number, essenceInvested: number): Promise<SpellComponent | null> => {
    setIsLoading(true);
    try {
        if (player.gold < goldInvested || player.essence < essenceInvested) {
            setModalContent({ title: "Research Failed", message: "Insufficient gold or essence for this research investment.", type: 'error' });
            return null;
        }
        const generatedData = await generateSpellComponentFromResearch(prompt, goldInvested, essenceInvested, player.level, player.discoveredComponents.length);
        
        const newComponent: SpellComponent = {
            ...generatedData,
            id: `comp-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            researchRequirements: { 
                gold: goldInvested, 
                essence: essenceInvested, 
                requiredLevel: generatedData.researchRequirements.requiredLevel || player.level, 
                items: generatedData.researchRequirements.items?.map(item => ({
                    itemId: item.itemId!, 
                    quantity: item.quantity!,
                    type: item.type, 
                })).filter(item => item.itemId && item.quantity) as Partial<ResourceCost>[] || [],
            }
        };

        setPlayer(prev => ({
            ...prev,
            gold: prev.gold - goldInvested,
            essence: prev.essence - essenceInvested,
            discoveredComponents: [...prev.discoveredComponents, newComponent]
        }));
        setModalContent({ title: "Research Success!", message: `Discovered new component: ${newComponent.name}!`, type: 'success' });
        return newComponent;
    } catch (error) {
        console.error("AI Component Research Error:", error);
        setModalContent({ title: "Research Failed", message: error instanceof Error ? error.message : "Could not generate component.", type: 'error' });
        return null;
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleOpenLootChest = async (chestId: string) => {
    const chest = player.items.find(item => item.id === chestId && item.itemType === 'LootChest') as LootChestItem | undefined;
    if (!chest) {
        addLog('System', 'Could not find the specified loot chest.', 'error');
        return;
    }
    setIsLoading(true);
    addLog('Player', `opens ${chest.name}...`, 'action');
    try {
        const lootDrops = await generateLootFromChest(chest.level, chest.rarity, player.level);
        
        let newGold = player.gold;
        let newEssence = player.essence;
        let newInventory = { ...player.inventory };
        let newUniqueItems: GameItem[] = [];
        let newSpells: Spell[] = [];
        let newComponents: SpellComponent[] = [];
        let foundMessages: string[] = [];

        for (const drop of lootDrops) {
            switch(drop.type) {
                case 'gold':
                    newGold += drop.amount || 0;
                    foundMessages.push(`${drop.amount} Gold`);
                    break;
                case 'essence':
                    newEssence += drop.amount || 0;
                    foundMessages.push(`${drop.amount} Essence`);
                    break;
                case 'resource':
                    if (drop.itemId && drop.quantity && drop.type) { 
                        newInventory[drop.itemId] = (newInventory[drop.itemId] || 0) + drop.quantity;
                        const itemDef = MASTER_ITEM_DEFINITIONS[drop.itemId];
                        foundMessages.push(`${drop.quantity}x ${itemDef ? itemDef.name : drop.itemId}`);
                    }
                    break;
                case 'consumable':
                    if (drop.itemId && drop.quantity) { 
                        newInventory[drop.itemId] = (newInventory[drop.itemId] || 0) + drop.quantity;
                        const itemDef = MASTER_ITEM_DEFINITIONS[drop.itemId];
                        foundMessages.push(`${drop.quantity}x ${itemDef ? itemDef.name : drop.itemId}`);
                    } else if (drop.consumableData) { 
                        const uniqueCon: UniqueConsumable = {
                             ...drop.consumableData, 
                             id: `con-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, 
                             itemType: 'Consumable', 
                             stackable: false,
                             rarity: drop.consumableData.rarity || drop.rarityHint || 0
                        };
                        newUniqueItems.push(uniqueCon);
                        foundMessages.push(uniqueCon.name);
                    }
                    break;
                case 'equipment':
                     if (drop.equipmentData) {
                        const newEquip: Equipment = { 
                            ...drop.equipmentData, 
                            id: `equip-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, 
                            itemType: 'Equipment', 
                            stackable: false,
                            rarity: drop.equipmentData.rarity || drop.rarityHint || 0,
                            scalingFactor: getScalingFactorFromRarity(drop.equipmentData.rarity || drop.rarityHint || 0)
                        };
                        newUniqueItems.push(newEquip);
                        foundMessages.push(newEquip.name);
                    }
                    break;
                case 'spell':
                     if (drop.spellData) {
                        const genSpell: Spell = {
                            ...drop.spellData,
                            id: `spell-loot-${Date.now()}`,
                            level: Math.max(1, player.level - 2 + Math.floor(Math.random() * 3)), 
                            rarity: drop.spellData.rarity || drop.rarityHint || 0,
                            scalingFactor: getScalingFactorFromRarity(drop.spellData.rarity || drop.rarityHint || 0),
                        };
                        newSpells.push(genSpell);
                        foundMessages.push(genSpell.name);
                    }
                    break;
                case 'component':
                    if (drop.componentData) {
                        const comp: SpellComponent = {
                            ...drop.componentData,
                            id: `comp-loot-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                            researchRequirements: { 
                                gold: drop.componentData.researchRequirements.gold,
                                essence: drop.componentData.researchRequirements.essence,
                                items: drop.componentData.researchRequirements.items?.map(partialItem => ({
                                    itemId: partialItem.itemId!, 
                                    type: partialItem.type,  
                                    quantity: partialItem.quantity!
                                })).filter(item => item.itemId && item.quantity && item.type) as ResourceCost[] || [],
                                time: drop.componentData.researchRequirements.time,
                                requiredLevel: drop.componentData.researchRequirements.requiredLevel,
                            }
                        };
                        newComponents.push(comp);
                        foundMessages.push(comp.name);
                    }
                    break;
            }
        }

        setPlayer(prev => ({
            ...prev,
            gold: newGold,
            essence: newEssence,
            inventory: newInventory,
            items: [...prev.items.filter(i => i.id !== chestId), ...newUniqueItems],
            spells: [...prev.spells, ...newSpells],
            discoveredComponents: [...prev.discoveredComponents, ...newComponents]
        }));

        if (foundMessages.length > 0) {
            setModalContent({ title: `${chest.name} Contents`, message: `You found: ${foundMessages.join(', ')}!`, type: 'success' });
        } else {
            setModalContent({ title: `${chest.name} Contents`, message: "The chest was empty...", type: 'info' });
        }

    } catch (error) {
        console.error("Error opening loot chest:", error);
        setModalContent({ title: "Chest Error", message: "Failed to open the chest.", type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };

  const renderResourceList = (costs?: ResourceCost[]) => {
    if (!costs || costs.length === 0) return <p className="text-slate-400 italic">No resources required.</p>;
    return (
      <ul className="space-y-1">
        {costs.map(cost => {
          const itemDef = MASTER_ITEM_DEFINITIONS[cost.itemId];
          const name = itemDef ? itemDef.name : cost.type;
          const icon = itemDef ? itemDef.iconName : RESOURCE_ICONS[cost.itemId] || 'Default';
          return (
            <li key={cost.itemId} className="flex items-center text-sm">
              <GetSpellIcon iconName={icon} className="w-4 h-4 mr-2 text-amber-300" />
              {cost.quantity}x {name}
            </li>
          );
        })}
      </ul>
    );
  };

  const handleExportSave = () => {
    const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saveData) {
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jorn_save_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setModalContent({ title: "Save Exported", message: "Your game data has been downloaded.", type: 'success' });
    } else {
      setModalContent({ title: "Export Failed", message: "No save data found to export.", type: 'error' });
    }
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const fileContent = await file.text();
          const parsedContent = JSON.parse(fileContent);
          if (parsedContent && typeof parsedContent.level === 'number') {
            localStorage.setItem(LOCAL_STORAGE_KEY, fileContent);
            setModalContent({ title: "Save Imported", message: "Game data imported successfully. Please refresh the page to apply.", type: 'success' });
          } else {
            setModalContent({ title: "Import Failed", message: "Invalid save file format.", type: 'error' });
          }
        } catch (e) {
          console.error("Error importing save file:", e);
          setModalContent({ title: "Import Failed", message: "Could not read or parse the save file.", type: 'error' });
        }
      }
    };
    input.click();
  };


  const showMessageModal = (title: string, message: string, type: 'info'|'error'|'success' = 'info') => {
    setModalContent({title, message, type});
  }


  const renderCurrentView = () => {
    if (isLoading && gameState !== 'IN_COMBAT' && gameState !== 'HOME' && gameState !== 'SPELL_DESIGN_STUDIO' && gameState !== 'THEORIZE_COMPONENT' && gameState !== 'RESEARCH_ARCHIVES') { 
      return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading..." size="lg"/></div>;
    }
    switch (gameState) {
      case 'HOME': return <HomeScreenView onFindEnemy={handleFindEnemy} isLoading={isLoading} onExploreMap={handleExploreMap} onOpenResearchArchives={handleOpenResearchArchives}/>;
      case 'SPELL_CRAFTING': return <SpellCraftingView onInitiateSpellCraft={handleOldSpellCraftInitiation} isLoading={isLoading} currentSpells={player.spells.length} maxSpells={maxRegisteredSpells} onReturnHome={handleNavigateHome} />;
      case 'SPELL_DESIGN_STUDIO': return <SpellDesignStudioView player={player} availableComponents={player.discoveredComponents} onFinalizeDesign={handleFinalizeSpellDesign} isLoading={isLoading} onReturnHome={handleNavigateHome} maxSpells={maxRegisteredSpells} initialPrompt={initialSpellPromptForStudio}/>;
      case 'THEORIZE_COMPONENT': return <ResearchLabView player={player} onAICreateComponent={handleAICreateComponent} isLoading={isLoading} onReturnHome={() => setGameState('RESEARCH_ARCHIVES')}/>;
      case 'RESEARCH_ARCHIVES': return <ResearchView player={player} onReturnHome={handleNavigateHome} onOpenTheorizeLab={handleOpenTheorizeComponentLab} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'EXPLORING_MAP': return <MapView player={player} onReturnHome={handleNavigateHome} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'SPELL_EDITING': return originalSpellForEdit ? <SpellEditingView originalSpell={originalSpellForEdit} onInitiateSpellRefinement={handleInitiateSpellRefinement} isLoading={isLoading} onCancel={() => { setGameState('CHARACTER_SHEET'); setDefaultCharacterSheetTab('Spells');}}/> : <p>Error: No spell selected for editing.</p>;
      case 'TRAIT_CRAFTING': return <TraitCraftingView onCraftTrait={handleCraftTrait} isLoading={isLoading} currentTraits={player.traits.length} playerLevel={player.level} onReturnHome={handleNavigateHome} />;
      case 'IN_COMBAT': return <CombatView player={player} effectivePlayerStats={effectivePlayerStats} currentEnemies={currentEnemies} targetEnemyId={targetEnemyId} onSetTargetEnemy={setTargetEnemyId} preparedSpells={getPreparedSpells()} onPlayerAttack={playerAttack} onPlayerBasicAttack={handlePlayerBasicAttack} onPlayerDefend={handlePlayerDefend} onPlayerFlee={handlePlayerFlee} onPlayerFreestyleAction={handlePlayerFreestyleAction} combatLog={combatLog} isPlayerTurn={isPlayerTurn} playerActionSkippedByStun={playerActionSkippedByStun} onSetGameState={setGameState} onUseConsumable={handleUseConsumable} onUseAbility={handleUseAbility} consumables={player.items.filter(i => i.itemType === 'Consumable') as Consumable[] } abilities={getPreparedAbilities()} />;
      case 'SPELL_CRAFT_CONFIRMATION': case 'SPELL_EDIT_CONFIRMATION': case 'ITEM_CRAFT_CONFIRMATION':
        return <ConfirmationView gameState={gameState} pendingSpellCraftData={pendingSpellCraftData} pendingSpellEditData={pendingSpellEditData} originalSpellForEdit={originalSpellForEdit} pendingItemCraftData={pendingItemCraftData} onConfirm={gameState === 'SPELL_CRAFT_CONFIRMATION' ? handleConfirmSpellCraft : gameState === 'SPELL_EDIT_CONFIRMATION' ? handleConfirmSpellEdit : handleConfirmItemCraft} onCancel={() => { setPendingSpellCraftData(null); setPendingSpellEditData(null); setPendingItemCraftData(null); setGameState(gameState.includes('SPELL') ? 'SPELL_DESIGN_STUDIO' : 'CRAFTING_HUB'); }} checkResources={checkResources} renderResourceList={renderResourceList} isLoading={isLoading}/>;
      case 'GAME_OVER_VICTORY': case 'GAME_OVER_DEFEAT': return <GameOverView gameState={gameState} modalMessage={modalContent?.message} currentEnemy={currentEnemies.length > 0 ? currentEnemies[0] : null} combatLog={combatLog} onReturnHome={handleNavigateHome} onFindEnemy={handleFindEnemy} isLoading={isLoading}/>;
      
      // Deprecated states, should ideally not be reached if navigation is correct
      case 'RESEARCH_LAB': return <ResearchLabView player={player} onAICreateComponent={handleAICreateComponent} isLoading={isLoading} onReturnHome={() => setGameState('CRAFTING_HUB')}/>;
      case 'GENERAL_RESEARCH': return <ResearchView player={player} onReturnHome={handleNavigateHome} onOpenTheorizeLab={handleOpenTheorizeComponentLab} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;


      default: return <p>Unknown game state: {gameState}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col" style={{fontFamily: "'Inter', sans-serif"}}>
      <Header player={player} onOpenCharacterSheet={() => handleOpenCharacterSheet('Main')} onNavigateHome={handleNavigateHome} onOpenMobileMenu={handleOpenMobileMenu}/>
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 max-w-6xl">
        {renderCurrentView()}
      </main>
       <Footer 
            onOpenSpellbook={() => handleOpenCharacterSheet('Spells')} 
            onOpenCraftingHub={handleOpenCraftingHub}
            onOpenInventory={() => handleOpenCharacterSheet('Inventory')}
            onOpenTraitsPage={() => handleOpenCharacterSheet('Traits')}
            onOpenQuestsPage={() => handleOpenCharacterSheet('Quests')}
            onOpenEncyclopedia={() => handleOpenCharacterSheet('Encyclopedia')}
            onOpenGameMenu={handleOpenGameMenu}
        />
      {modalContent && <Modal isOpen={true} onClose={() => setModalContent(null)} title={modalContent.title} size="md"><p>{modalContent.message}</p></Modal>}
      {gameState === 'CHARACTER_SHEET' && <CharacterSheetModal isOpen={true} onClose={() => setGameState('HOME')} player={player} effectiveStats={effectivePlayerStats} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} maxRegisteredSpells={maxRegisteredSpells} maxPreparedSpells={maxPreparedSpells} maxPreparedAbilities={maxPreparedAbilities} onEditSpell={handleInitiateEditSpell} onPrepareSpell={handlePrepareSpell} onUnprepareSpell={handleUnprepareSpell} onPrepareAbility={handlePrepareAbility} onUnprepareAbility={handleUnprepareAbility} isLoading={isLoading} initialTab={defaultCharacterSheetTab} onOpenSpellCraftingScreen={ () => {setGameState('HOME'); setTimeout(() => handleOpenSpellDesignStudio(),0);}} onOpenTraitCraftingScreen={() => {setGameState('HOME'); setTimeout(() => handleOpenTraitsPage(),0);}} canCraftNewTrait={pendingTraitUnlock || (player.level >= FIRST_TRAIT_LEVEL && player.traits.length < (Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) +1) )} onOpenLootChest={handleOpenLootChest} onUseConsumableFromInventory={handleUseConsumable}/>}
      {gameState === 'CRAFTING_HUB' && <CraftingHubModal isOpen={true} onClose={() => setGameState('HOME')} onInitiateAppItemCraft={handleInitiateItemCraft} isLoading={isLoading} onOpenSpellDesignStudio={() => handleOpenSpellDesignStudio()} onOpenTheorizeLab={handleOpenTheorizeComponentLab} />}
      <HelpWikiModal isOpen={isHelpWikiOpen} onClose={handleCloseHelpWiki} />
      <GameMenuModal isOpen={isGameMenuOpen} onClose={handleCloseGameMenu} onOpenCharacterSheet={() => handleOpenCharacterSheet('Main')} onOpenHelpWiki={handleOpenHelpWiki} onShowMessage={(t,m) => showMessageModal(t,m,'info')} onExportSave={handleExportSave} onImportSave={handleImportSave}/>
      <MobileMenuModal 
        isOpen={isMobileMenuOpen} 
        onClose={handleCloseMobileMenu}
        onOpenSpellbook={() => {handleOpenCharacterSheet('Spells'); handleCloseMobileMenu();}}
        onOpenCraftingHub={() => {handleOpenCraftingHub(); handleCloseMobileMenu();}}
        onOpenInventory={() => {handleOpenCharacterSheet('Inventory'); handleCloseMobileMenu();}}
        onOpenTraitsPage={() => {handleOpenCharacterSheet('Traits'); handleCloseMobileMenu();}}
        onOpenQuestsPage={() => {handleOpenCharacterSheet('Quests'); handleCloseMobileMenu();}}
        onOpenEncyclopedia={() => {handleOpenCharacterSheet('Encyclopedia'); handleCloseMobileMenu();}}
        onOpenGameOptions={() => {handleOpenGameMenu(); handleCloseMobileMenu();}}
      />
    </div>
  );
};
