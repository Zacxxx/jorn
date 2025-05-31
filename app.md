import React, { useState, useEffect, useCallback } from 'react';
import { Player, Spell, Enemy, CombatActionLog, GameState, GeneratedSpellData, Trait, Quest, ResourceCost, ActiveStatusEffect, StatusEffectName, SpellStatusEffect, ItemType, Consumable, Equipment, GameItem, GeneratedConsumableData, GeneratedEquipmentData, DetailedEquipmentSlot, PlayerEffectiveStats, Ability, CharacterSheetTab, SpellIconName, SpellComponent, LootChestItem, UniqueConsumable, MasterConsumableItem, TagName } from './types';
// Ensure TagDefinition is imported from the correct path if it's in src/types.ts
import { Homestead, HomesteadProject, TagDefinition } from './src/types';
import { INITIAL_PLAYER_STATS, STARTER_SPELL, ENEMY_DIFFICULTY_XP_REWARD, MAX_SPELLS_PER_LEVEL_BASE, PREPARED_SPELLS_PER_LEVEL_BASE, PREPARED_ABILITIES_PER_LEVEL_BASE, FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL, DEFAULT_QUEST_ICON, DEFAULT_TRAIT_ICON, INITIAL_PLAYER_INVENTORY, RESOURCE_ICONS, STATUS_EFFECT_ICONS, PLAYER_BASE_SPEED_FROM_REFLEX, INITIAL_PLAYER_EP, PLAYER_EP_REGEN_PER_TURN, STARTER_ABILITIES, PLAYER_BASE_BODY, PLAYER_BASE_MIND, PLAYER_BASE_REFLEX, HP_PER_BODY, HP_PER_LEVEL, BASE_HP, MP_PER_MIND, MP_PER_LEVEL, BASE_MP, EP_PER_REFLEX, EP_PER_LEVEL, BASE_EP, SPEED_PER_REFLEX, PHYSICAL_POWER_PER_BODY, MAGIC_POWER_PER_MIND, DEFENSE_PER_BODY, DEFENSE_PER_REFLEX, INITIAL_PLAYER_NAME, DEFENDING_DEFENSE_BONUS_PERCENTAGE, INITIAL_PLAYER_GOLD, INITIAL_PLAYER_ESSENCE, DEFAULT_SILENCE_DURATION, DEFAULT_ROOT_DURATION, AVAILABLE_SPELL_ICONS, AVAILABLE_STATUS_EFFECTS, TAG_DEFINITIONS } from './constants';
import { generateSpell, editSpell, generateEnemy, generateTrait, generateMainQuestStory, generateConsumable, generateEquipment, generateSpellFromDesign, generateSpellComponentFromResearch, generateLootFromChest, discoverRecipeFromPrompt } from './services/geminiService';
import { loadMasterItems, MASTER_ITEM_DEFINITIONS } from './services/itemService';
import { createInitialHomestead, generateProjectId, canAffordResourceCost, consumeResources, addProjectRewards, getUpgradeCosts, applyPropertyUpgrade } from './src/services/homesteadService';
import { getAllRecipes, getRecipeById, discoverRecipe } from './services/craftingService';
import { getScalingFactorFromRarity } from './utils';

// World exploration imports
import { generateBiomeEnemy } from './src/services/biomeEnemyService';
import { getLocation, updateLocationDiscovery } from './src/services/locationService';
import { getEnvironmentalEffects } from './src/data/biomes';

import ActionButton from './ui/ActionButton';
import Modal from './ui/Modal';
import LoadingSpinner from './ui/LoadingSpinner';
import { GetSpellIcon } from './components/IconComponents';
import MainLayout from './src/layouts/MainLayout';
import { CharacterSheetModal } from './components/CharacterSheetModal';
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
import CampView from './components/CampView';
import HomesteadView from './src/components/HomesteadView';
import SettlementView from './src/components/SettlementView';
import ShopView from './src/components/ShopView';
import RecipeDiscoveryView from './src/components/RecipeDiscoveryView';
import CraftingWorkshopView from './src/components/CraftingWorkshopView';
import WorldMapModal from './src/components/WorldMapModal';
import ExplorationJournalModal from './src/components/ExplorationJournalModal';
import NPCsView from './src/components/NPCsView';
import ParametersView from './components/ParametersView';


const LOCAL_STORAGE_KEY = 'rpgSpellCrafterPlayerV21';

// Create a Tag Precedence List
// This list defines the order of precedence for conflicting tags.
// Tags appearing earlier in this list take precedence over later tags.
const tagPrecedenceList: TagName[] = Object.keys(TAG_DEFINITIONS) as TagName[];

export const App: React.FC<{}> = (): React.ReactElement => {

  // Develop getEffectiveTags(spellTags: TagName[]): TagName[] function
  const getEffectiveTags = useCallback((spellTags: TagName[] | undefined): TagName[] => {
    if (!spellTags || spellTags.length === 0) {
      return [];
    }

    const effectiveTags: TagName[] = [];
    const tagsToRemove = new Set<TagName>();

    // Initial pass to gather all tags and identify potential conflicts
    for (const tagName of spellTags) {
      if (tagsToRemove.has(tagName)) {
        continue; // Already marked for removal by a higher precedence tag
      }

      const tagDef = TAG_DEFINITIONS[tagName];
      if (!tagDef) {
        console.warn(`Tag definition not found for: ${tagName}`);
        effectiveTags.push(tagName); // Keep it if undefined, though this shouldn't happen
        continue;
      }

      if (tagDef.conflictsWith && tagDef.conflictsWith.length > 0) {
        for (const conflictingTagName of tagDef.conflictsWith) {
          // Check if the conflicting tag is also present in the original spellTags
          if (spellTags.includes(conflictingTagName)) {
            const currentTagIndex = tagPrecedenceList.indexOf(tagName);
            const conflictingTagIndex = tagPrecedenceList.indexOf(conflictingTagName);

            if (currentTagIndex === -1 || conflictingTagIndex === -1) {
              console.warn(`Tag precedence not found for: ${tagName} or ${conflictingTagName}`);
              // Default behavior: if one is not in precedence, keep current, remove conflicting if current is "known"
              if(currentTagIndex !== -1 && !tagsToRemove.has(tagName) && !effectiveTags.includes(tagName)) {
                 if(!tagsToRemove.has(conflictingTagName)) tagsToRemove.add(conflictingTagName);
              }
              continue;
            }

            // If currentTag has higher precedence (lower index), mark conflictingTag for removal
            if (currentTagIndex < conflictingTagIndex) {
              if (!tagsToRemove.has(conflictingTagName)) {
                tagsToRemove.add(conflictingTagName);
                console.warn(`Tag Conflict: '${tagName}' (precedence ${currentTagIndex}) takes precedence over '${conflictingTagName}' (precedence ${conflictingTagIndex}). '${conflictingTagName}' will be removed.`);
              }
            } else if (conflictingTagIndex < currentTagIndex) { // If conflictingTag has higher precedence
              if (!tagsToRemove.has(tagName)) {
                tagsToRemove.add(tagName);
                console.warn(`Tag Conflict: '${conflictingTagName}' (precedence ${conflictingTagIndex}) takes precedence over '${tagName}' (precedence ${currentTagIndex}). '${tagName}' will be removed.`);
                // No need to check other conflicts for tagName, as it's being removed
                break;
              }
            }
            // If indices are equal, it implies a setup error or the same tag, do nothing here.
          }
        }
      }
      // If the tag survived conflict checks so far (i.e., not added to tagsToRemove)
      if (!tagsToRemove.has(tagName) && !effectiveTags.includes(tagName)) {
        effectiveTags.push(tagName);
      }
    }

    // Second pass to construct the final list, excluding those marked for removal
    const finalEffectiveTags = spellTags.filter(tag => !tagsToRemove.has(tag));

    // Ensure the order from original spellTags is preserved for non-conflicting tags as much as possible,
    // then add any tags that were pushed to effectiveTags but might have been re-ordered by the set logic.
    // A simpler way is to filter the original list.
    const trulyEffectiveTags = spellTags.filter(tag => !tagsToRemove.has(tag));

    if (spellTags.length !== trulyEffectiveTags.length) {
        console.warn(`Original Tags: [${spellTags.join(', ')}], Effective Tags: [${trulyEffectiveTags.join(', ')}]`);
    }

    return trulyEffectiveTags;
  }, []); // Assuming TAG_DEFINITIONS and tagPrecedenceList are stable and defined outside.

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
            discoveredRecipes: Array.isArray(parsed.discoveredRecipes) ? parsed.discoveredRecipes : [],
            currentLocationId: parsed.currentLocationId || 'eldergrove',
            homestead: parsed.homestead || createInitialHomestead(),
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
      discoveredRecipes: ['basic_health_potion', 'iron_sword_basic'], // Add some starter recipes
      currentLocationId: 'eldergrove',
      homestead: createInitialHomestead(),
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
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentTavernId, setCurrentTavernId] = useState<string | null>(null);
  const [currentNPCId, setCurrentNPCId] = useState<string | null>(null);
  
  // New exploration state
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isExplorationJournalOpen, setIsExplorationJournalOpen] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);

  // Parameters state
  const [useLegacyFooter, setUseLegacyFooter] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

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
  const handleOpenCraftingHub = () => setGameState('CRAFTING_WORKSHOP');
  
  const handleOpenRecipeDiscovery = () => setGameState('RECIPE_DISCOVERY');
  const handleOpenCraftingWorkshop = () => setGameState('CRAFTING_WORKSHOP');
  
  const handleOpenSpellDesignStudio = (initialPrompt?: string) => {
    setInitialSpellPromptForStudio(initialPrompt || '');
    setGameState('SPELL_DESIGN_STUDIO');
  };
  const handleExploreMap = () => setGameState('EXPLORING_MAP');
  
  const handleOpenCamp = () => setGameState('CAMP');

  const handleOpenNPCs = () => setGameState('NPC_DIALOGUE');

  const handleRestComplete = (restType: 'short' | 'long', duration?: number, activity?: string) => {
    const hpGain = restType === 'short' 
      ? Math.floor(effectivePlayerStats.maxHp * 0.25)
      : effectivePlayerStats.maxHp - player.hp;
    
    const mpGain = restType === 'short' 
      ? Math.floor(effectivePlayerStats.maxMp * 0.5)
      : effectivePlayerStats.maxMp - player.mp;
    
    const epGain = restType === 'short' 
      ? Math.floor(effectivePlayerStats.maxEp * 0.75)
      : effectivePlayerStats.maxEp - player.ep;

    // Apply custom duration scaling if specified
    const finalHpGain = duration ? Math.min(Math.floor(effectivePlayerStats.maxHp * (duration / 8)), effectivePlayerStats.maxHp - player.hp) : hpGain;
    const finalMpGain = duration ? Math.min(Math.floor(effectivePlayerStats.maxMp * (duration / 8)), effectivePlayerStats.maxMp - player.mp) : mpGain;
    const finalEpGain = duration ? Math.min(Math.floor(effectivePlayerStats.maxEp * (duration / 8)), effectivePlayerStats.maxEp - player.ep) : epGain;

    // Apply rest benefits
    setPlayer(prev => ({
      ...prev,
      hp: Math.min(prev.hp + finalHpGain, effectivePlayerStats.maxHp),
      mp: Math.min(prev.mp + finalMpGain, effectivePlayerStats.maxMp),
      ep: Math.min(prev.ep + finalEpGain, effectivePlayerStats.maxEp)
    }));

    // Apply activity bonuses
    let bonusMessage = '';
    if (activity) {
      switch (activity) {
        case 'meditation':
          const bonusMp = Math.floor(effectivePlayerStats.maxMp * 0.1);
          setPlayer(prev => ({
            ...prev,
            mp: Math.min(prev.mp + bonusMp, effectivePlayerStats.maxMp)
          }));
          bonusMessage = ` Meditation granted ${bonusMp} bonus MP!`;
          break;
        case 'training':
          bonusMessage = ' Training provided inspiration for future battles!';
          break;
        case 'crafting':
          if (Math.random() < 0.3) {
            const bonusGold = Math.floor(Math.random() * 5) + 1;
            setPlayer(prev => ({
              ...prev,
              gold: prev.gold + bonusGold
            }));
            bonusMessage = ` Crafting yielded ${bonusGold} bonus gold!`;
          } else {
            bonusMessage = ' Crafting was peaceful and restorative.';
          }
          break;
        case 'socializing':
          bonusMessage = ' Socializing improved your reputation in the area.';
          break;
        case 'exploring':
          if (Math.random() < 0.25) {
            const bonusEssence = 1;
            setPlayer(prev => ({
              ...prev,
              essence: prev.essence + bonusEssence
            }));
            bonusMessage = ` Exploring discovered ${bonusEssence} essence!`;
          } else {
            bonusMessage = ' Exploring revealed interesting sights nearby.';
          }
          break;
      }
    }

    const restDuration = duration || (restType === 'short' ? 1 : 8);
    setModalContent({
      title: 'Rest Complete',
      message: `You rested for ${restDuration} hour${restDuration !== 1 ? 's' : ''} and recovered ${finalHpGain} HP, ${finalMpGain} MP, and ${finalEpGain} EP.${bonusMessage}`,
      type: 'success'
    });
  };

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

  // Parameters handlers
  const handleOpenParameters = () => setGameState('PARAMETERS');
  const handleToggleLegacyFooter = (value: boolean) => setUseLegacyFooter(value);
  const handleToggleDebugMode = (value: boolean) => setDebugMode(value);
  const handleToggleAutoSave = (value: boolean) => setAutoSave(value);

  // Homestead handlers
  const handleOpenHomestead = () => setGameState('HOMESTEAD_VIEW');

  const handleStartHomesteadProject = (project: Omit<HomesteadProject, 'id' | 'startTime'>) => {
    if (!canAffordResourceCost(player.inventory, project.resourceCost)) {
      setModalContent({ title: "Insufficient Resources", message: "You don't have the required resources for this project.", type: 'error' });
      return;
    }

    const newProject: HomesteadProject = {
      ...project,
      id: generateProjectId(),
      startTime: Date.now()
    };

    setPlayer(prev => ({
      ...prev,
      inventory: consumeResources(prev.inventory, project.resourceCost),
      homestead: {
        ...prev.homestead,
        activeProjects: [...prev.homestead.activeProjects, newProject]
      }
    }));

    setModalContent({ title: "Project Started", message: `${project.name} has begun! It will take ${project.duration} hours to complete.`, type: 'success' });
  };

  const handleCompleteHomesteadProject = (projectId: string) => {
    const project = player.homestead.activeProjects.find(p => p.id === projectId);
    if (!project) return;

    setPlayer(prev => ({
      ...prev,
      inventory: addProjectRewards(prev.inventory, project.rewards),
      homestead: {
        ...prev.homestead,
        activeProjects: prev.homestead.activeProjects.filter(p => p.id !== projectId)
      }
    }));

    const rewardMessages = project.rewards?.map(reward => {
      if (reward.type === 'resource' || reward.type === 'item') {
        const item = MASTER_ITEM_DEFINITIONS[reward.itemId!];
        return `${reward.quantity}x ${item?.name || reward.itemId}`;
      }
      return reward.type;
    }) || [];

    setModalContent({ 
      title: "Project Complete!", 
      message: `${project.name} finished! ${rewardMessages.length > 0 ? `Received: ${rewardMessages.join(', ')}` : ''}`, 
      type: 'success' 
    });
  };

  const handleUpgradeHomesteadProperty = (propertyName: string, upgradeName: string) => {
    const property = player.homestead.properties[propertyName];
    if (!property) return;

    const costs = getUpgradeCosts(upgradeName);
    if (!canAffordResourceCost(player.inventory, costs)) {
      setModalContent({ title: "Upgrade Failed", message: "Insufficient resources for this upgrade.", type: 'error' });
      return;
    }

    setPlayer(prev => ({
      ...prev,
      inventory: consumeResources(prev.inventory, costs),
      homestead: {
        ...prev.homestead,
        properties: {
          ...prev.homestead.properties,
          [propertyName]: applyPropertyUpgrade(property, upgradeName)
        }
      }
    }));

    setModalContent({ title: "Upgrade Complete!", message: `${propertyName} has been upgraded with ${upgradeName.replace('_', ' ')}!`, type: 'success' });
  };

  // Settlement handlers
  const handleAccessSettlement = () => {
    setGameState('SETTLEMENT_VIEW');
  };

  const handleOpenShop = (shopId: string) => {
    setCurrentShopId(shopId);
    setGameState('SHOP_VIEW');
  };

  const handleOpenTavern = (tavernId: string) => {
    setCurrentTavernId(tavernId);
    setGameState('TAVERN_VIEW');
  };

  const handleTalkToNPC = (npcId: string) => {
    setCurrentNPCId(npcId);
    setGameState('NPC_DIALOGUE');
  };

  const handleExplorePointOfInterest = (poiId: string) => {
    // TODO: Implement POI exploration logic
    setModalContent({ title: "Point of Interest", message: "POI exploration coming soon!", type: 'info' });
  };

  const handlePurchaseItem = (itemId: string, price: number, quantity: number) => {
    if (player.gold < price * quantity) {
      setModalContent({ title: "Purchase Failed", message: "Not enough gold!", type: 'error' });
      return;
    }

    // TODO: Add item to inventory
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - (price * quantity),
      inventory: {
        ...prev.inventory,
        [itemId]: (prev.inventory[itemId] || 0) + quantity
      }
    }));

    setModalContent({ title: "Purchase Complete", message: `Purchased ${quantity}x item for ${price * quantity} gold!`, type: 'success' });
  };

  const handlePurchaseService = (serviceId: string, price: number) => {
    if (player.gold < price) {
      setModalContent({ title: "Service Failed", message: "Not enough gold!", type: 'error' });
      return;
    }

    // TODO: Implement service logic
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - price
    }));

    setModalContent({ title: "Service Complete", message: `Service purchased for ${price} gold!`, type: 'success' });
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

  const handleInitiateSpellRefinement = async (originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string) => {
    setIsLoading(true);
    try {
      // Build enhanced prompt based on new features
      let enhancedPrompt = refinementPrompt;
      
      if (augmentLevel && augmentLevel > 0) {
        enhancedPrompt += ` AUGMENT LEVEL: Increase spell power level by ${augmentLevel} (using ${augmentLevel * 10} essence). Make the spell significantly more powerful.`;
        // Deduct essence for augment
        const essenceCost = augmentLevel * 10;
        const playerEssence = player.inventory['essence'] || 0;
        if (playerEssence < essenceCost) {
          throw new Error('Not enough essence for augment level');
        }
        setPlayer(prev => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            essence: Math.max(0, (prev.inventory['essence'] || 0) - essenceCost)
          }
        }));
      }
      
      if (selectedComponentId) {
        const component = player.discoveredComponents.find((c: SpellComponent) => c.id === selectedComponentId);
        if (component) {
          enhancedPrompt += ` COMPONENT INTEGRATION: Integrate the component "${component.name}" (${component.category}, Tier ${component.tier}) into this spell. Component description: ${component.description}. Component tags: ${component.tags?.join(', ') || 'none'}.`;
        }
      }
      
      const editedSpellData = await editSpell(originalSpell, enhancedPrompt);
      setPendingSpellEditData(editedSpellData);
      setOriginalSpellForEdit(originalSpell);
      setGameState('SPELL_EDIT_CONFIRMATION');
    }
    catch (error) { 
      console.error("Spell refinement error:", error); 
      setModalContent({ title: "Refinement Failed", message: error instanceof Error ? error.message : "Could not generate refinement.", type: 'error' }); 
    }
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
    setPendingItemCraftData(null); setGameState('CRAFTING_WORKSHOP');
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

  const handlePrepareSpell = (spell: Spell) => { if (player.preparedSpellIds.length < maxPreparedSpells) setPlayer(prev => ({ ...prev, preparedSpellIds: Array.from(new Set([...prev.preparedSpellIds, spell.id])) })); };
  const handleUnprepareSpell = (spell: Spell) => setPlayer(prev => ({ ...prev, preparedSpellIds: prev.preparedSpellIds.filter(id => id !== spell.id) }));
  const handlePrepareAbility = (ability: Ability) => { if (player.preparedAbilityIds.length < maxPreparedAbilities) setPlayer(prev => ({ ...prev, preparedAbilityIds: Array.from(new Set([...prev.preparedAbilityIds, ability.id])) })); };
  const handleUnprepareAbility = (ability: Ability) => setPlayer(prev => ({ ...prev, preparedAbilityIds: prev.preparedAbilityIds.filter(id => id !== ability.id) }));

  const processPlayerTurnStartEffects = useCallback((_currentTurn: number): { isDefeated: boolean, willBeStunnedThisTurn: boolean, willBeSilencedThisTurn: boolean, willBeRootedThisTurn: boolean } => {
    let playerCurrentHp = player.hp;
    let playerIsStunned = false;
    let playerIsSilenced = false;
    let playerIsRooted = false;
    let newActiveEffects: ActiveStatusEffect[] = [];

    player.activeStatusEffects.forEach(effect => {
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
    let hasSynergyBonusAppliedThisCast = false; // Initialize synergy flag for this spell cast

    // Get effective tags *before* mana cost or any other checks
    const effectiveSpellTags = getEffectiveTags(spell.tags);

    if (!targetEnemy || player.mp < spell.manaCost) { // Original mana cost check, can be refined later if tags affect cost
        addLog('Player', `cannot cast ${spell.name} (insufficient MP or no target).`, 'error');
        return;
    }

    // Enhanced silence and control checks
    if (player.activeStatusEffects.some(eff => ['Silenced', 'Stun', 'Sleep'].includes(eff.name))) {
      addLog('Player', `cannot cast spells due to ${player.activeStatusEffects.find(eff => ['Silenced', 'Stun', 'Sleep'].includes(eff.name))?.name}!`, 'status');
      setIsPlayerTurn(false);
      return;
    }

    // Calculate actual mana cost with tag modifiers using *effectiveSpellTags*
    let actualManaCost = spell.manaCost;
    if (effectiveSpellTags.includes('Reduced_Cost')) {
      actualManaCost = Math.floor(actualManaCost * 0.7);
    }
    if (effectiveSpellTags.includes('Free_Cast') && Math.random() < 0.3) {
      actualManaCost = 0;
      addLog('System', 'Free cast activated!', 'success');
    }

    // Check MP again after cost modification
    if (player.mp < actualManaCost && !effectiveSpellTags.includes('Blood_Magic')) {
        addLog('Player', `cannot cast ${spell.name} (insufficient MP after modifiers).`, 'error');
        return;
    }

    if (effectiveSpellTags.includes('Blood_Magic')) {
      const healthCost = Math.floor(spell.manaCost * 0.5); // Base mana cost for health sacrifice
      if (player.hp <= healthCost && actualManaCost > 0) { // If can't pay health and it's not a free cast
         addLog('Player', `cannot cast ${spell.name} (not enough HP for Blood Magic).`, 'error');
         return;
      }
      setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - healthCost) }));
      if (actualManaCost > 0) { // Only reduce MP if there's still a mana component
        setPlayer(prev => ({ ...prev, mp: prev.mp - Math.floor(actualManaCost * 0.5) }));
      }
      addLog('System', `Blood magic: ${healthCost} health sacrificed for ${spell.name}.`, 'warning');
    } else {
      setPlayer(prev => ({ ...prev, mp: prev.mp - actualManaCost }));
    }

    addLog('Player', `casts ${spell.name} on ${targetEnemy.name}. Effective Tags: [${effectiveSpellTags.join(', ')}]`, 'action');

    // Determine all targets based on targeting tags using *effectiveSpellTags*
    let targets: Enemy[] = [];
    if (effectiveSpellTags.includes('SingleTarget') || (!effectiveSpellTags.some(tag => ['MultiTarget', 'AreaOfEffect', 'GlobalTarget', 'RandomTarget'].includes(tag)))) {
      targets = [targetEnemy];
    } else if (effectiveSpellTags.includes('MultiTarget')) {
      targets = currentEnemies.slice(0, 3); // Hit up to 3 enemies
    } else if (effectiveSpellTags.includes('AreaOfEffect')) {
      targets = [...currentEnemies]; // Hit all enemies
    } else if (effectiveSpellTags.includes('GlobalTarget')) {
      targets = [...currentEnemies]; // Hit all enemies globally
    } else if (effectiveSpellTags.includes('RandomTarget')) {
      const count = effectiveSpellTags.includes('Chain') ? 3 : 1;
      targets = [...currentEnemies].sort(() => Math.random() - 0.5).slice(0, count);
    }


    // Apply spell to each target using *effectiveSpellTags*
    targets.forEach((enemy, index) => {
      const powerMultiplier = effectiveSpellTags.includes('MultiTarget') ? Math.max(0.4, 1 - index * 0.2) : 1.0;
      // Pass and potentially update hasSynergyBonusAppliedThisCast
      // For simplicity, applyTagDamageModifiers will directly use and update a shared state or rely on its single-call-per-enemy nature for now.
      // A more robust way if multiple functions under applySpellToEnemy could grant synergy would be to pass a callback to update the flag.
      // Let's assume for now that applyTagDamageModifiers is the sole place this specific damage synergy is checked per enemy.
      // The flag's true purpose is one bonus *per spell cast*, not per enemy hit by an AoE.
      // So, applyTagDamageModifiers will need to know if the bonus was *already applied for this cast*.
      const result = applySpellToEnemy(spell, enemy, powerMultiplier, effectiveSpellTags, hasSynergyBonusAppliedThisCast);
      if (result.synergyBonusAppliedInThisHit) {
        hasSynergyBonusAppliedThisCast = true;
      }
    });

    // Handle self-target effects using *effectiveSpellTags*
    if (effectiveSpellTags.includes('SelfTarget') || spell.damageType === 'HealingSource') { // damageType check is intrinsic to spell, not a tag for this specific logic part
      applySpellToSelf(spell, effectiveSpellTags);
    }

    // Handle special mechanics using *effectiveSpellTags*
    handleSpecialSpellMechanics(spell, targets, effectiveSpellTags);

    // Check for enemy defeats
    targets.forEach(enemy => {
      const updatedEnemy = currentEnemies.find(e => e.id === enemy.id); // Re-fetch to ensure HP is current
      if (updatedEnemy && updatedEnemy.hp <= 0 && !currentEnemies.find(e=>e.id === updatedEnemy.id && e.hp <=0)) { // ensure defeat not already processed
        handleEnemyDefeat(updatedEnemy);
      }
    });
    const anyPlayerDefeated = player.hp <= 0; // Check if player was defeated by reflect or other mechanics
    if (!anyPlayerDefeated) {
       setIsPlayerTurn(false);
    }
  };

  const applySpellToEnemy = (spell: Spell, enemy: Enemy, powerMultiplier: number = 1.0, effectiveSpellTags: TagName[], synergyAlreadyAppliedThisCast: boolean): { updatedTargetHp?: number, synergyBonusAppliedInThisHit: boolean } => {
    let synergyBonusJustApplied = false;
    if (spell.damage <= 0 && !effectiveSpellTags.some(tag => tag === 'Healing' || tag === 'Shield')) return { synergyBonusAppliedInThisHit: false }; // Allow non-damaging utility spells

    const scalingStatValue = spell.scalesWith === 'Mind' ? effectivePlayerStats.mind : spell.scalesWith === 'Body' ? effectivePlayerStats.body : 0;
    const attackerPower = spell.scalesWith === 'Body' ? effectivePlayerStats.physicalPower : effectivePlayerStats.magicPower;
    
    let baseDamage = calculateDamage(spell.damage * powerMultiplier, attackerPower, enemy.mind, 'normal', spell.scalingFactor, scalingStatValue);
    
    const damageModifiersResult = applyTagDamageModifiers(baseDamage, effectiveSpellTags, enemy, synergyAlreadyAppliedThisCast);
    baseDamage = damageModifiersResult.damage;
    if (damageModifiersResult.synergyBonusApplied) {
        synergyBonusJustApplied = true;
    }
    
    const elementalEffectiveness = getElementalEffectiveness(effectiveSpellTags, enemy);
    baseDamage = Math.floor(baseDamage * elementalEffectiveness);
    
    if (effectiveSpellTags.includes('Armor_Ignoring') || effectiveSpellTags.includes('True_Damage')) {
      // No change to baseDamage from enemy defenses
    } else if (effectiveSpellTags.includes('Piercing')) {
      baseDamage = Math.max(1, Math.floor(baseDamage - (enemy.mind * 0.5))); // Example: Piercing halves defense effect
    } else {
      const effectivenessType = enemy.weakness === spell.damageType ? 'weak' : enemy.resistance === spell.damageType ? 'resistant' : 'normal';
      if (effectivenessType === 'weak') baseDamage = Math.floor(baseDamage * 1.5);
      else if (effectivenessType === 'resistant') baseDamage = Math.floor(baseDamage * 0.5);
    }
    
    const damageResult = applyDamageAndReflection(enemy, baseDamage, player, 'Enemy', false);
    const actualDamage = damageResult.actualDamageDealt;
    
    addLog('Player', `deals ${actualDamage} ${spell.damageType} damage to ${enemy.name}.`, 'damage');
    setCurrentEnemies(prevEnemies => prevEnemies.map(e => e.id === enemy.id ? { ...e, hp: Math.max(0, damageResult.updatedTargetHp) } : e));
    
    if (effectiveSpellTags.includes('Lifesteal') || effectiveSpellTags.includes('Vampiric')) {
      const healPercent = effectiveSpellTags.includes('Vampiric') ? 0.5 : 0.25;
      const healAmount = Math.floor(actualDamage * healPercent);
      if (healAmount > 0) {
        setPlayer(prev => ({ ...prev, hp: Math.min(effectivePlayerStats.maxHp, prev.hp + healAmount) }));
        addLog('Player', `heals ${healAmount} HP from lifesteal.`, 'heal');
      }
    }
    
    if (effectiveSpellTags.includes('Mana_Burn')) {
      const manaBurned = Math.floor(actualDamage * 0.3); // Example scaling
      addLog('System', `${manaBurned} mana burned from ${enemy.name}.`, 'magic');
      // Note: Enemy mana not tracked, this is flavor or for future implementation
    }
    
    if (spell.statusEffectInflict) {
      applyStatusEffect(enemy.id, spell.statusEffectInflict, spell.id);
    }
    applyTagStatusEffects(spell, enemy.id, effectiveSpellTags); // Pass effectiveSpellTags
    
    if (effectiveSpellTags.includes('Explosive')) {
      const explosiveDamage = Math.floor(actualDamage * 0.3); // Example scaling
      if (explosiveDamage > 0) {
        currentEnemies.forEach(otherEnemy => {
          if (otherEnemy.id !== enemy.id && otherEnemy.hp > 0) {
            const explosionDmgResult = applyDamageAndReflection(otherEnemy, explosiveDamage, player, 'Enemy', false);
            addLog('System', `Explosive damage hits ${otherEnemy.name} for ${explosionDmgResult.actualDamageDealt}!`, 'damage');
            setCurrentEnemies(prev => prev.map(e => e.id === otherEnemy.id ? {...e, hp: Math.max(0, explosionDmgResult.updatedTargetHp)} : e));
            if (explosionDmgResult.updatedTargetHp <= 0 && !currentEnemies.find(e=>e.id === otherEnemy.id && e.hp <=0) ) handleEnemyDefeat({...otherEnemy, hp: explosionDmgResult.updatedTargetHp});
          }
        });
      }
    }
    return { updatedTargetHp: damageResult.updatedTargetHp, synergyBonusAppliedInThisHit: synergyBonusJustApplied };
  };

  const applySpellToSelf = (spell: Spell, effectiveSpellTags: TagName[]) => {
    if (spell.damageType === 'HealingSource' || effectiveSpellTags.includes('Healing')) {
      const scalingStatValue = spell.scalesWith === 'Mind' ? effectivePlayerStats.mind : spell.scalesWith === 'Body' ? effectivePlayerStats.body : 0;
      let healAmount = calculateDamage(spell.damage, effectivePlayerStats.magicPower, 0, 'normal', spell.scalingFactor, scalingStatValue);
      
      if (effectiveSpellTags.includes('Restoration')) healAmount = Math.floor(healAmount * 1.5); // Example Restoration boost
      if (effectiveSpellTags.includes('Scaling')) healAmount += player.level * 2; // Example Scaling boost
      
      const actualHeal = Math.min(healAmount, effectivePlayerStats.maxHp - player.hp);
      if (actualHeal > 0) {
        setPlayer(prev => ({ ...prev, hp: prev.hp + actualHeal }));
        addLog('Player', `heals self for ${actualHeal} HP.`, 'heal');
      }
    }
    
    if (spell.statusEffectInflict) {
      applyStatusEffect('player', spell.statusEffectInflict, spell.id);
    }
    applyTagStatusEffects(spell, 'player', effectiveSpellTags); // Pass effectiveSpellTags
  };

  const applyTagDamageModifiers = (
    damage: number,
    effectiveTags: TagName[],
    enemy: Enemy,
    synergyAlreadyAppliedThisCast: boolean
  ): { damage: number, synergyBonusApplied: boolean } => {
    let modifiedDamage = damage;
    let synergyBonusApplied = false;

    // Synergy Check (apply only once per spell cast)
    if (!synergyAlreadyAppliedThisCast) {
      for (const tagName of effectiveTags) {
        const tagDef = TAG_DEFINITIONS[tagName];
        if (tagDef?.synergizesWith) {
          for (const synergisticPartner of tagDef.synergizesWith) {
            if (effectiveTags.includes(synergisticPartner)) {
              const partnerDef = TAG_DEFINITIONS[synergisticPartner];
              modifiedDamage = Math.floor(modifiedDamage * 1.10); // 10% damage bonus for synergy
              addLog('System', `Synergy bonus! '${tagDef.name}' and '${partnerDef.name}' increased damage by 10%.`, 'success');
              synergyBonusApplied = true;
              break; // Apply bonus once
            }
          }
        }
        if (synergyBonusApplied) break; // Emerge from outer loop as well
      }
    }
    
    if (effectiveTags.includes('Critical') && Math.random() < 0.3) { // Example crit chance
      modifiedDamage = Math.floor(modifiedDamage * 1.5); // Example crit bonus
      addLog('System', 'Critical hit!', 'success');
    }
    
    if (effectiveTags.includes('True_Damage')) {
       // True_Damage often implies it bypasses positive modifiers too, or is flat.
       // For this example, let's say it's just not reduced by enemy defenses.
       // If it should also bypass player's own damage buffs, logic would be different.
    }
    if (effectiveTags.includes('Brutal')) modifiedDamage = Math.floor(modifiedDamage * 1.3);
    if (effectiveTags.includes('Devastating')) modifiedDamage = Math.floor(modifiedDamage * 1.7); // Adjusted from 2.0
    if (effectiveTags.includes('Overwhelming')) modifiedDamage = Math.floor(modifiedDamage * 1.15); // Adjusted from 1.2
    
    if (effectiveTags.includes('Percentage_Damage')) {
      modifiedDamage += Math.floor(enemy.maxHp * 0.1); // Example: 10% of max HP
    }
    
    if (effectiveTags.includes('Scaling')) {
      modifiedDamage += player.level * 2; // Example scaling with player level
    }
    
    return { damage: Math.max(1, Math.floor(modifiedDamage)), synergyBonusApplied };
  };

  const getElementalEffectiveness = (effectiveTags: TagName[], enemy: Enemy): number => {
    let effectiveness = 1.0;
    
    // This function primarily uses the spell's intrinsic damageType, but tags can augment this.
    // Example: A 'Fire' tag could make a Physical spell deal some fire damage or interact with fire weaknesses.
    // For now, this function is simple and mostly relies on spell.damageType vs enemy weakness/resistance.
    // Tags like 'Fire' could slightly boost damage if not already the spell's main type.

    if (effectiveTags.includes('Fire') && enemy.weakness === 'Fire') effectiveness *= 1.2;
    else if (effectiveTags.includes('Fire') && enemy.resistance === 'Fire') effectiveness *= 0.8;
    if (effectiveTags.includes('Ice') && enemy.weakness === 'Ice') effectiveness *= 1.2;
    else if (effectiveTags.includes('Ice') && enemy.resistance === 'Ice') effectiveness *= 0.8;
    // Add more specific tag-based elemental interactions if needed.
    
    // Generic bonuses from tags if the spell isn't already that element type
    // (spell.damageType would be the primary factor for weakness/resistance)
    if (effectiveTags.includes('Arcane')) effectiveness *= 1.05;
    if (effectiveTags.includes('Psychic')) effectiveness *= 1.05;

    return effectiveness;
  };

  const applyTagStatusEffects = (spell: Spell, targetId: string, effectiveSpellTags: TagName[]) => {
    const duration = effectiveSpellTags.includes('Extended_Duration') ? 4 : effectiveSpellTags.includes('Shortened_Duration') ? 1 : 2;
    
    // Ensure magnitude is always positive for DoTs if spell.damage is positive, otherwise 0.
    const calculateDoTMagnitude = (baseMultiplier: number) => {
      return spell.damage > 0 ? Math.max(1, Math.floor(spell.damage * baseMultiplier)) : 0;
    };

    if (effectiveSpellTags.includes('Burning')) {
      applyStatusEffect(targetId, { name: 'BurningDoTActive', duration, magnitude: calculateDoTMagnitude(0.15), chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Bleeding')) {
      applyStatusEffect(targetId, { name: 'BleedingDoTActive', duration, magnitude: calculateDoTMagnitude(0.10), chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Freezing')) { // This is the DoT/Slow tag
      applyStatusEffect(targetId, { name: 'FrostbittenDoTActive', duration, magnitude: calculateDoTMagnitude(0.05), chance: 100 }, spell.id);
      applyStatusEffect(targetId, { name: 'Slow', duration, magnitude: 25, chance: 80 }, spell.id); // Freezing often implies slow
    }
    if (effectiveSpellTags.includes('Shocking')) {
      applyStatusEffect(targetId, { name: 'ShockedDoTActive', duration, magnitude: calculateDoTMagnitude(0.05), chance: 100 }, spell.id);
      // Shocking might also have a small chance to briefly stun or interrupt
    }
    
    // Control effects from effectiveSpellTags
    if (effectiveSpellTags.includes('Stun') && Math.random() < 0.35) {
      applyStatusEffect(targetId, { name: 'Stun', duration: Math.min(2, duration), magnitude: 0, chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Silence') && Math.random() < 0.45) {
      applyStatusEffect(targetId, { name: 'Silenced', duration: Math.min(3, duration), magnitude: 0, chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Root') && Math.random() < 0.55) {
      applyStatusEffect(targetId, { name: 'Rooted', duration, magnitude: 0, chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Slow') && Math.random() < 0.65) { // If not applied by Freezing
      applyStatusEffect(targetId, { name: 'Slow', duration, magnitude: 35, chance: 100 }, spell.id);
    }
    if (effectiveSpellTags.includes('Freeze') && Math.random() < 0.3) { // Hard CC Freeze applied by 'Freeze' tag
      applyStatusEffect(targetId, { name: 'Freeze', duration: Math.min(2, duration), magnitude: 0, chance: 100 }, spell.id);
    }

    // Chance for 'Ice' tag (usually a damage type tag) to also apply 'Freeze' (hard CC)
    // This is separate from the 'Freezing' DoT/Slow tag.
    if (effectiveSpellTags.includes('Ice') && targetId !== 'player') { // Don't freeze self with an Ice damage spell
      const freezeApplyChanceFromIceTag = 25; // 25% chance
      if (Math.random() * 100 < freezeApplyChanceFromIceTag) {
        // Check if target is already Frozen by the 'Freeze' tag to avoid double application or immediate overwrite by this one if durations differ.
        // However, applyStatusEffect handles stacking/duration updates, so direct application is fine.
        // We ensure 'Freeze' is a valid StatusEffectName (it is, and has an icon).
        console.warn(`Synergy: 'Ice' tag applying 'Freeze' CC to ${targetId}`);
        applyStatusEffect(targetId, {
          name: 'Freeze',
          duration: 1, // Standard duration for this hard CC from Ice tag synergy
          magnitude: undefined, // Freeze CC typically doesn't have a magnitude
          chance: 100 // The probabilistic check was already done by freezeApplyChanceFromIceTag
        }, spell.id);
      }

     if (effectiveSpellTags.includes('Freeze') && Math.random() < 0.3) { // Hard CC Freeze
      applyStatusEffect(targetId, { name: 'Freeze', duration: Math.min(2, duration), magnitude: 0, chance: 100 }, spell.id);
    }
    
    if (targetId === 'player') {
      if (effectiveSpellTags.includes('Haste')) {
        applyStatusEffect('player', { name: 'Haste', duration: duration * 2, magnitude: 25, chance: 100 }, spell.id);
      }
      if (effectiveSpellTags.includes('Shield')) {
        // Shield magnitude could scale with spell.damage, player.mind, or be flat
        const shieldAmount = spell.damage > 0 ? Math.floor(spell.damage * 0.5) + effectivePlayerStats.magicPower : effectivePlayerStats.magicPower * 2;
        applyStatusEffect('player', { name: 'Shield', duration: duration * 2, magnitude: shieldAmount, chance: 100 }, spell.id);
      }
      if (effectiveSpellTags.includes('Invisibility')) {
        applyStatusEffect('player', { name: 'Invisibility', duration: duration + 1, magnitude: 0, chance: 100 }, spell.id);
      }
      if (effectiveSpellTags.includes('Strength')) {
        applyStatusEffect('player', { name: 'StrengthenBody', duration: duration * 2, magnitude: Math.max(1, Math.floor(effectivePlayerStats.body * 0.1) + 2), chance: 100 }, spell.id);
      }
      if (effectiveSpellTags.includes('Intelligence')) {
        applyStatusEffect('player', { name: 'StrengthenMind', duration: duration * 2, magnitude: Math.max(1, Math.floor(effectivePlayerStats.mind * 0.1) + 2), chance: 100 }, spell.id);
      }
    }
  };

  function handleSpecialSpellMechanics(spell: Spell, targets: Enemy[], effectiveSpellTags: TagName[]) {
    // Delayed effects
    if (effectiveSpellTags.includes('Delayed')) {
      setTimeout(() => {
        addLog('System', `${spell.name} delayed effect triggers!`, 'magic');
        targets.forEach(enemy => {
          const currentEnemyTarget = currentEnemies.find(e => e.id === enemy.id); // Re-fetch state
          if (currentEnemyTarget && currentEnemyTarget.hp > 0) {
            // Re-fetch effective tags for the delayed application? Or use original ones?
            // For simplicity, using original effectiveSpellTags for the delayed part.
            applySpellToEnemy(spell, currentEnemyTarget, 0.5, effectiveSpellTags, false); // Reduced power for delayed
             if (currentEnemyTarget.hp <= 0) handleEnemyDefeat(currentEnemyTarget);
          }
        });
      }, 2000); // Reduced delay for snappier feel
    }
    
    // Echoing effects
    if (effectiveSpellTags.includes('Echoing')) {
      setTimeout(() => {
        addLog('System', `${spell.name} echoes!`, 'magic');
        targets.forEach(enemy => {
          const currentEnemyTarget = currentEnemies.find(e => e.id === enemy.id);
          if (currentEnemyTarget && currentEnemyTarget.hp > 0) {
            applySpellToEnemy(spell, currentEnemyTarget, 0.3, effectiveSpellTags, false); // Reduced power for echo
            if (currentEnemyTarget.hp <= 0) handleEnemyDefeat(currentEnemyTarget);
          }
        });
      }, 1000); // Reduced delay
    }
    
    // Chain effects
    if (effectiveSpellTags.includes('Chain') && targets.length > 0) {
      const mainTarget = targets[0]; // Chain usually originates from a primary target
      const additionalChainTargets = currentEnemies.filter(e => e.id !== mainTarget.id && e.hp > 0).sort(() => 0.5 - Math.random()).slice(0, 2); // Hit up to 2 more random living enemies
      additionalChainTargets.forEach(chainTarget => {
        addLog('System', `${spell.name} chains to ${chainTarget.name}!`, 'magic');
        applySpellToEnemy(spell, chainTarget, 0.6, effectiveSpellTags, false); // Reduced power for chain
        if (chainTarget.hp <= 0) handleEnemyDefeat(chainTarget);
      });
    }
    
    // Combo tracking
    if (effectiveSpellTags.includes('Combo')) {
      // For now, this just sets a flag. Could be expanded for specific combo points/effects.
      // setPlayer(prev => ({ ...prev, lastActionType: 'combo-spell' })); // Assuming lastActionType is a player prop
      addLog('System', `${spell.name} is a combo-initiating spell!`, 'info');
    }
  }

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
        const foundEnemy = currentEnemies.find((e: Enemy) => e.id === targetId);
        if (foundEnemy) {
            targetEntity = foundEnemy;
            if (ability.effectType === 'ENEMY_DEBUFF' && ability.targetStatusEffect && ability.duration) {
            applyStatusEffect(targetId, { name: ability.targetStatusEffect, duration: ability.duration, magnitude: ability.magnitude, chance: 100 }, ability.id);
            }
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

 const handleUseConsumable = (itemId: string, _targetId: string | null) => {
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


  function applyStatusEffect(targetId: 'player' | string, effect: SpellStatusEffect, sourceId: string) {
    if (targetId === 'player') {
      setPlayer(prev => {
        const existingEffect = prev.activeStatusEffects.find(eff => eff.name === effect.name && eff.sourceId === sourceId);
        if (existingEffect) {
          return {
            ...prev,
            activeStatusEffects: prev.activeStatusEffects.map(eff => 
              eff.name === effect.name && eff.sourceId === sourceId 
                ? { ...eff, duration: effect.duration, magnitude: Math.max(eff.magnitude || 0, effect.magnitude || 0) }
                : eff
            )
          };
        } else {
          return {
            ...prev,
            activeStatusEffects: [...prev.activeStatusEffects, { ...effect, sourceId }]
          };
        }
      });
    } else {
      setCurrentEnemies(prevEnemies => prevEnemies.map(enemy => {
        if (enemy.id === targetId) {
          const existingEffect = enemy.activeStatusEffects?.find(eff => eff.name === effect.name && eff.sourceId === sourceId);
          if (existingEffect) {
            return {
              ...enemy,
              activeStatusEffects: enemy.activeStatusEffects?.map(eff => 
                eff.name === effect.name && eff.sourceId === sourceId 
                  ? { ...eff, duration: effect.duration, magnitude: Math.max(eff.magnitude || 0, effect.magnitude || 0) }
                  : eff
              ) || []
            };
          } else {
            return {
              ...enemy,
              activeStatusEffects: [...(enemy.activeStatusEffects || []), { ...effect, sourceId }]
            };
          }
        }
        return enemy;
      }));
    }
  }

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

  function handleEnemyDefeat(enemy: Enemy) {
    addLog('System', `${enemy.name} is defeated!`, 'victory');
    awardCombatRewards(enemy);
    setCurrentEnemies(prevEnemies => prevEnemies.filter(e => e.id !== enemy.id));
    
    if (currentEnemies.filter(e => e.id !== enemy.id).length === 0) {
      setModalContent({ title: "Victory!", message: "All enemies defeated!", type: 'success' });
      setGameState('GAME_OVER_VICTORY');
    }
  }

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
                    if (drop.itemId && drop.quantity) { 
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

  const handleDiscoverRecipe = async (prompt: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await discoverRecipeFromPrompt(
        prompt,
        player.level
      );
      
      if (result.name) {
        // Add the discovered recipe to player's known recipes
        const recipeId = `recipe-${Date.now()}-${result.name.toLowerCase().replace(/\s+/g, '_')}`;
        setPlayer(prev => ({
          ...prev,
          discoveredRecipes: [...prev.discoveredRecipes, recipeId]
        }));
        
        setModalContent({ 
          title: "Recipe Discovered!", 
          message: `You discovered: ${result.name}! Visit the Crafting Workshop to create it.`, 
          type: 'success' 
        });
      } else {
        setModalContent({ 
          title: "Discovery Failed", 
          message: "No suitable recipe could be discovered from that prompt.", 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error("Recipe discovery error:", error);
      setModalContent({ 
        title: "Discovery Error", 
        message: error instanceof Error ? error.message : "Failed to discover recipe.", 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCraftItem = async (recipeId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const recipe = getRecipeById(recipeId);
      if (!recipe) {
        setModalContent({ title: "Craft Failed", message: "Recipe not found.", type: 'error' });
        setIsLoading(false);
        return;
      }
      
      // Check if player has required ingredients
      const hasIngredients = recipe.ingredients.every((ingredient: any) => 
        (player.inventory[ingredient.itemId] || 0) >= ingredient.quantity
      );
      
      if (!hasIngredients) {
        setModalContent({ title: "Craft Failed", message: "You don't have all the required ingredients.", type: 'error' });
        setIsLoading(false);
        return;
      }
      
      // Deduct ingredients
      const newInventory = { ...player.inventory };
      recipe.ingredients.forEach((ingredient: any) => {
        newInventory[ingredient.itemId] = (newInventory[ingredient.itemId] || 0) - ingredient.quantity;
      });
      
      // Add result item
      newInventory[recipe.resultItemId] = (newInventory[recipe.resultItemId] || 0) + recipe.resultQuantity;
      
      setPlayer(prev => ({
        ...prev,
        inventory: newInventory
      }));
      
      setModalContent({ 
        title: "Crafting Complete!", 
        message: `Successfully crafted ${recipe.resultQuantity}x ${recipe.name}!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error("Crafting error:", error);
      setModalContent({ 
        title: "Craft Error", 
        message: error instanceof Error ? error.message : "Failed to craft item.", 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentView = () => {
    if (isLoading && gameState !== 'IN_COMBAT' && gameState !== 'HOME' && gameState !== 'SPELL_DESIGN_STUDIO' && gameState !== 'THEORIZE_COMPONENT' && gameState !== 'RESEARCH_ARCHIVES') { 
      return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading..." size="lg"/></div>;
    }
    switch (gameState) {
      case 'HOME': return <HomeScreenView player={player} onFindEnemy={handleFindEnemy} isLoading={isLoading} onExploreMap={handleExploreMap} onOpenResearchArchives={handleOpenResearchArchives} onOpenCamp={handleOpenCamp} onOpenHomestead={handleOpenHomestead} onAccessSettlement={handleAccessSettlement} onOpenCraftingHub={handleOpenCraftingHub} onOpenNPCs={handleOpenNPCs} />;
      case 'CAMP': return <CampView player={player} effectiveStats={effectivePlayerStats} onReturnHome={handleNavigateHome} onRestComplete={handleRestComplete} />;
      case 'HOMESTEAD_VIEW': return <HomesteadView player={player} onReturnHome={handleNavigateHome} onStartProject={handleStartHomesteadProject} onCompleteProject={handleCompleteHomesteadProject} onUpgradeProperty={handleUpgradeHomesteadProperty} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'SETTLEMENT_VIEW': return <SettlementView player={player} onReturnHome={handleNavigateHome} onOpenShop={handleOpenShop} onOpenTavern={handleOpenTavern} onTalkToNPC={handleTalkToNPC} onExplorePointOfInterest={handleExplorePointOfInterest} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'SHOP_VIEW': return <ShopView player={player} shopId={currentShopId || ''} onReturnToSettlement={() => setGameState('SETTLEMENT_VIEW')} onPurchaseItem={handlePurchaseItem} onPurchaseService={handlePurchaseService} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'TAVERN_VIEW': return <div>Tavern View - Coming Soon</div>;
      case 'NPC_DIALOGUE': return <NPCsView player={player} onReturnHome={handleNavigateHome} onTalkToNPC={handleTalkToNPC} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'RECIPE_DISCOVERY': return <RecipeDiscoveryView player={player} onReturnHome={handleNavigateHome} onDiscoverRecipe={handleDiscoverRecipe} isLoading={isLoading} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'CRAFTING_WORKSHOP': return <CraftingWorkshopView player={player} onReturnHome={handleNavigateHome} onCraftItem={handleCraftItem} onDiscoverRecipe={handleDiscoverRecipe} onOpenSpellDesignStudio={handleOpenSpellDesignStudio} onOpenTheorizeLab={handleOpenTheorizeComponentLab} onAICreateComponent={handleAICreateComponent} onInitiateAppItemCraft={handleInitiateItemCraft} isLoading={isLoading} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'SPELL_CRAFTING': return <SpellCraftingView onInitiateSpellCraft={handleOldSpellCraftInitiation} isLoading={isLoading} currentSpells={player.spells.length} maxSpells={maxRegisteredSpells} onReturnHome={handleNavigateHome} />;
      case 'SPELL_DESIGN_STUDIO': return <SpellDesignStudioView player={player} availableComponents={player.discoveredComponents} onFinalizeDesign={handleFinalizeSpellDesign} isLoading={isLoading} onReturnHome={handleNavigateHome} maxSpells={maxRegisteredSpells} initialPrompt={initialSpellPromptForStudio}/>;
      case 'THEORIZE_COMPONENT': return <ResearchLabView player={player} onAICreateComponent={handleAICreateComponent} isLoading={isLoading} onReturnHome={() => setGameState('RESEARCH_ARCHIVES')}/>;
      case 'RESEARCH_ARCHIVES': return <ResearchView player={player} onReturnHome={handleNavigateHome} onOpenTheorizeLab={handleOpenTheorizeComponentLab} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'EXPLORING_MAP': return <MapView player={player} onReturnHome={handleNavigateHome} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;
      case 'PARAMETERS': return <ParametersView onReturnHome={handleNavigateHome} useLegacyFooter={useLegacyFooter} onToggleLegacyFooter={handleToggleLegacyFooter} debugMode={debugMode} onToggleDebugMode={handleToggleDebugMode} autoSave={autoSave} onToggleAutoSave={handleToggleAutoSave} />;
      case 'SPELL_EDITING': return originalSpellForEdit ? <SpellEditingView originalSpell={originalSpellForEdit} onInitiateSpellRefinement={handleInitiateSpellRefinement} isLoading={isLoading} onCancel={() => { setGameState('CHARACTER_SHEET'); setDefaultCharacterSheetTab('Spells');}} player={player} availableComponents={player.discoveredComponents}/> : <p>Error: No spell selected for editing.</p>;
      case 'TRAIT_CRAFTING': return <TraitCraftingView onCraftTrait={handleCraftTrait} isLoading={isLoading} currentTraits={player.traits.length} playerLevel={player.level} onReturnHome={handleNavigateHome} />;
      case 'IN_COMBAT': return <CombatView player={player} effectivePlayerStats={effectivePlayerStats} currentEnemies={currentEnemies} targetEnemyId={targetEnemyId} onSetTargetEnemy={setTargetEnemyId} preparedSpells={getPreparedSpells()} onPlayerAttack={playerAttack} onPlayerBasicAttack={handlePlayerBasicAttack} onPlayerDefend={handlePlayerDefend} onPlayerFlee={handlePlayerFlee} onPlayerFreestyleAction={handlePlayerFreestyleAction} combatLog={combatLog} isPlayerTurn={isPlayerTurn} playerActionSkippedByStun={playerActionSkippedByStun} onSetGameState={setGameState} onUseConsumable={handleUseConsumable} onUseAbility={handleUseAbility} consumables={player.items.filter(i => i.itemType === 'Consumable') as Consumable[] } abilities={getPreparedAbilities()} />;
      case 'SPELL_CRAFT_CONFIRMATION': case 'SPELL_EDIT_CONFIRMATION': case 'ITEM_CRAFT_CONFIRMATION':
        return <ConfirmationView gameState={gameState} pendingSpellCraftData={pendingSpellCraftData} pendingSpellEditData={pendingSpellEditData} originalSpellForEdit={originalSpellForEdit} pendingItemCraftData={pendingItemCraftData} onConfirm={gameState === 'SPELL_CRAFT_CONFIRMATION' ? handleConfirmSpellCraft : gameState === 'SPELL_EDIT_CONFIRMATION' ? handleConfirmSpellEdit : handleConfirmItemCraft} onCancel={() => { setPendingSpellCraftData(null); setPendingSpellEditData(null); setPendingItemCraftData(null); setGameState(gameState.includes('SPELL') ? 'SPELL_DESIGN_STUDIO' : 'CRAFTING_WORKSHOP'); }} checkResources={checkResources} renderResourceList={renderResourceList} isLoading={isLoading}/>;
      case 'GAME_OVER_VICTORY': case 'GAME_OVER_DEFEAT': return <GameOverView gameState={gameState} modalMessage={modalContent?.message} currentEnemy={currentEnemies.length > 0 ? currentEnemies[0] : null} combatLog={combatLog} onReturnHome={handleNavigateHome} onFindEnemy={handleFindEnemy} isLoading={isLoading}/>;
      
      // Deprecated states, should ideally not be reached if navigation is correct
      case 'RESEARCH_LAB': return <ResearchLabView player={player} onAICreateComponent={handleAICreateComponent} isLoading={isLoading} onReturnHome={() => setGameState('CRAFTING_WORKSHOP')}/>;
      case 'GENERAL_RESEARCH': return <ResearchView player={player} onReturnHome={handleNavigateHome} onOpenTheorizeLab={handleOpenTheorizeComponentLab} onShowMessage={(t,m) => showMessageModal(t,m,'info')} />;


      default: return <p>Unknown game state: {gameState}</p>;
    }
  };

  return (
    <>
      <MainLayout
        player={player}
        onOpenCharacterSheet={() => handleOpenCharacterSheet('Main')}
        onNavigateHome={handleNavigateHome}
        onOpenMobileMenu={handleOpenMobileMenu}
        onOpenSpellbook={() => handleOpenCharacterSheet('Spells')}
        onOpenCraftingHub={handleOpenCraftingHub}
        onOpenInventory={() => handleOpenCharacterSheet('Inventory')}
        onOpenTraitsPage={() => handleOpenCharacterSheet('Traits')}
        onOpenQuestsPage={() => handleOpenCharacterSheet('Quests')}
        onOpenEncyclopedia={() => handleOpenCharacterSheet('Encyclopedia')}
        onOpenGameMenu={handleOpenGameMenu}
        useLegacyFooter={useLegacyFooter}
      >
        {renderCurrentView()}
      </MainLayout>
      {modalContent && <Modal isOpen={true} onClose={() => setModalContent(null)} title={modalContent.title} size="md"><p>{modalContent.message}</p></Modal>}
      {gameState === 'CHARACTER_SHEET' && <CharacterSheetModal isOpen={true} onClose={() => setGameState('HOME')} player={player} effectiveStats={effectivePlayerStats} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} maxRegisteredSpells={maxRegisteredSpells} maxPreparedSpells={maxPreparedSpells} maxPreparedAbilities={maxPreparedAbilities} onEditSpell={handleInitiateEditSpell} onPrepareSpell={handlePrepareSpell} onUnprepareSpell={handleUnprepareSpell} onPrepareAbility={handlePrepareAbility} onUnprepareAbility={handleUnprepareAbility} initialTab={defaultCharacterSheetTab} onOpenSpellCraftingScreen={ () => {setGameState('HOME'); setTimeout(() => handleOpenSpellDesignStudio(),0);}} onOpenTraitCraftingScreen={() => {setGameState('HOME'); setTimeout(() => handleOpenTraitsPage(),0);}} canCraftNewTrait={pendingTraitUnlock || (player.level >= FIRST_TRAIT_LEVEL && player.traits.length < (Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) +1) )} onOpenLootChest={handleOpenLootChest} onUseConsumableFromInventory={handleUseConsumable}/>}
      <HelpWikiModal isOpen={isHelpWikiOpen} onClose={handleCloseHelpWiki} />
      <GameMenuModal isOpen={isGameMenuOpen} onClose={handleCloseGameMenu} onOpenCharacterSheet={() => handleOpenCharacterSheet('Main')} onOpenHelpWiki={handleOpenHelpWiki} onShowMessage={(t,m) => showMessageModal(t,m,'info')} onExportSave={handleExportSave} onImportSave={handleImportSave} onOpenParameters={handleOpenParameters}/>
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
    </>
  );
};

}
