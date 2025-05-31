import { useState, useEffect } from 'react';
import { Player, StatusEffectName, SpellIconName, ActiveStatusEffect } from '../../types';
import { 
  INITIAL_PLAYER_STATS, 
  STARTER_SPELL, 
  INITIAL_PLAYER_INVENTORY, 
  STARTER_ABILITIES, 
  PLAYER_BASE_BODY, 
  PLAYER_BASE_MIND, 
  PLAYER_BASE_REFLEX, 
  INITIAL_PLAYER_EP, 
  INITIAL_PLAYER_NAME, 
  INITIAL_PLAYER_GOLD, 
  INITIAL_PLAYER_ESSENCE,
  STATUS_EFFECT_ICONS,
  AVAILABLE_SPELL_ICONS
} from '../../constants';
import { createInitialHomestead } from '../../src/services/homesteadService';

/**
 * Player State Management Module
 * Handles player state initialization, persistence, and management
 */

export const LOCAL_STORAGE_KEY = 'rpgSpellCrafterPlayerV21';

/**
 * Create initial player state with default values
 */
const createInitialPlayer = (): Player => {
  return {
    ...INITIAL_PLAYER_STATS,
    name: INITIAL_PLAYER_NAME,
    gold: INITIAL_PLAYER_GOLD,
    essence: INITIAL_PLAYER_ESSENCE,
    body: PLAYER_BASE_BODY,
    mind: PLAYER_BASE_MIND,
    reflex: PLAYER_BASE_REFLEX,
    hp: 0, 
    maxHp: 0, 
    mp: 0, 
    maxMp: 0, 
    ep: INITIAL_PLAYER_EP, 
    maxEp: 0, 
    speed: 0,
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
};

/**
 * Validate and sanitize loaded player data
 */
const validatePlayerData = (parsed: any): Player => {
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
    preparedSpellIds: Array.isArray(parsed.preparedSpellIds) && parsed.preparedSpellIds.length > 0 
      ? parsed.preparedSpellIds 
      : (Array.isArray(parsed.spells) && parsed.spells.length > 0 
          ? [parsed.spells[0]?.id].filter(Boolean) as string[] 
          : [STARTER_SPELL.id]),
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
    inventory: typeof parsed.inventory === 'object' && !Array.isArray(parsed.inventory) 
      ? parsed.inventory 
      : { ...INITIAL_PLAYER_INVENTORY },
    items: Array.isArray(parsed.items) ? parsed.items : [],
    equippedItems: parsed.equippedItems || {},
    abilities: Array.isArray(parsed.abilities) && parsed.abilities.length > 0 
      ? parsed.abilities 
      : STARTER_ABILITIES,
    preparedAbilityIds: Array.isArray(parsed.preparedAbilityIds) 
      ? parsed.preparedAbilityIds 
      : (STARTER_ABILITIES.length > 0 ? [STARTER_ABILITIES[0].id] : []),
    iconName: parsed.iconName || 'UserIcon',
    maxHp: parsed.maxHp || 0,
    maxMp: parsed.maxMp || 0,
    maxEp: parsed.maxEp || 0,
    speed: parsed.speed || 0,
    bestiary: parsed.bestiary || {},
    discoveredComponents: Array.isArray(parsed.discoveredComponents) 
      ? parsed.discoveredComponents.filter((comp: any) => typeof comp === 'object' && comp.id) 
      : [],
    discoveredRecipes: Array.isArray(parsed.discoveredRecipes) ? parsed.discoveredRecipes : [],
    currentLocationId: parsed.currentLocationId || 'eldergrove',
    homestead: parsed.homestead || createInitialHomestead(),
  };

  // Validate prepared spell IDs
  validatedPlayer.preparedSpellIds = validatedPlayer.preparedSpellIds.filter(id => 
    validatedPlayer.spells.some(s => s.id === id)
  );
  if (validatedPlayer.preparedSpellIds.length === 0 && validatedPlayer.spells.length > 0) {
    validatedPlayer.preparedSpellIds = [validatedPlayer.spells[0].id];
  }

  // Validate prepared ability IDs
  validatedPlayer.preparedAbilityIds = validatedPlayer.preparedAbilityIds.filter(id => 
    validatedPlayer.abilities.some(ab => ab.id === id)
  );
  if (validatedPlayer.preparedAbilityIds.length === 0 && validatedPlayer.abilities.length > 0) {
    validatedPlayer.preparedAbilityIds = [validatedPlayer.abilities[0].id];
  }

  return validatedPlayer;
};

/**
 * Load player data from localStorage
 */
const loadPlayerFromStorage = (): Player => {
  const savedPlayer = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedPlayer) {
    try {
      const parsed = JSON.parse(savedPlayer) as Player;
      if (parsed && typeof parsed.level === 'number' && Array.isArray(parsed.spells)) {
        return validatePlayerData(parsed);
      } else {
        console.warn("Invalid player data structure in localStorage. Resetting to default.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to load player data from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
  return createInitialPlayer();
};

/**
 * Save player data to localStorage
 */
const savePlayerToStorage = (player: Player): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
  } catch (e) {
    console.error("Failed to save player data to localStorage", e);
  }
};

/**
 * Custom hook for managing player state with persistence
 */
export const usePlayerState = () => {
  const [player, setPlayer] = useState<Player>(() => loadPlayerFromStorage());

  // Auto-save player data when it changes
  useEffect(() => {
    savePlayerToStorage(player);
  }, [player]);

  return {
    player,
    setPlayer,
  };
};

/**
 * Utility functions for player state management
 */
export const PlayerStateUtils = {
  createInitialPlayer,
  validatePlayerData,
  loadPlayerFromStorage,
  savePlayerToStorage,
  LOCAL_STORAGE_KEY,
}; 