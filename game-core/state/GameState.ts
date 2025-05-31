import { useState } from 'react';
import { 
  Player, 
  Enemy, 
  GameState as GameStateType, 
  CombatActionLog, 
  GeneratedSpellData, 
  GeneratedConsumableData, 
  GeneratedEquipmentData,
  Spell,
  CharacterSheetTab
} from '../../types';

/**
 * Game State Management Module
 * Centralizes all game state and provides hooks for state management
 */

export interface ModalContent {
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface GameStateManager {
  // Core game state
  gameState: GameStateType;
  setGameState: (state: GameStateType) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Modal state
  modalContent: ModalContent | null;
  setModalContent: (content: ModalContent | null) => void;
  
  // Combat state
  currentEnemies: Enemy[];
  setCurrentEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  targetEnemyId: string | null;
  setTargetEnemyId: (id: string | null) => void;
  combatLog: CombatActionLog[];
  setCombatLog: React.Dispatch<React.SetStateAction<CombatActionLog[]>>;
  
  // Turn management
  turn: number;
  setTurn: React.Dispatch<React.SetStateAction<number>>;
  isPlayerTurn: boolean;
  setIsPlayerTurn: (isPlayerTurn: boolean) => void;
  currentActingEnemyIndex: number;
  setCurrentActingEnemyIndex: React.Dispatch<React.SetStateAction<number>>;
  
  // Pending actions and confirmations
  pendingTraitUnlock: boolean;
  setPendingTraitUnlock: (pending: boolean) => void;
  pendingSpellCraftData: (GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }) | null;
  setPendingSpellCraftData: React.Dispatch<React.SetStateAction<(GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }) | null>>;
  pendingSpellEditData: GeneratedSpellData | null;
  setPendingSpellEditData: React.Dispatch<React.SetStateAction<GeneratedSpellData | null>>;
  originalSpellForEdit: Spell | null;
  setOriginalSpellForEdit: React.Dispatch<React.SetStateAction<Spell | null>>;
  pendingItemCraftData: GeneratedConsumableData | GeneratedEquipmentData | null;
  setPendingItemCraftData: React.Dispatch<React.SetStateAction<GeneratedConsumableData | GeneratedEquipmentData | null>>;
  playerActionSkippedByStun: boolean;
  setPlayerActionSkippedByStun: (skipped: boolean) => void;
  
  // UI state
  defaultCharacterSheetTab: CharacterSheetTab | undefined;
  setDefaultCharacterSheetTab: React.Dispatch<React.SetStateAction<CharacterSheetTab | undefined>>;
  initialSpellPromptForStudio: string;
  setInitialSpellPromptForStudio: React.Dispatch<React.SetStateAction<string>>;
  
  // Modal states
  isHelpWikiOpen: boolean;
  setIsHelpWikiOpen: (open: boolean) => void;
  isGameMenuOpen: boolean;
  setIsGameMenuOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Settlement and shop states
  currentShopId: string | null;
  setCurrentShopId: React.Dispatch<React.SetStateAction<string | null>>;
  currentTavernId: string | null;
  setCurrentTavernId: React.Dispatch<React.SetStateAction<string | null>>;
  currentNPCId: string | null;
  setCurrentNPCId: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Exploration state
  isWorldMapOpen: boolean;
  setIsWorldMapOpen: (open: boolean) => void;
  isExplorationJournalOpen: boolean;
  setIsExplorationJournalOpen: (open: boolean) => void;
  isTraveling: boolean;
  setIsTraveling: (traveling: boolean) => void;
  
  // Parameters state
  useLegacyFooter: boolean;
  setUseLegacyFooter: (value: boolean) => void;
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  
  // Utility methods
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

/**
 * Custom hook for managing all game state
 * Replaces the individual useState calls from App.tsx
 */
export const useGameState = (): GameStateManager => {
  // Core game state
  const [gameState, setGameState] = useState<GameStateType>('HOME');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  
  // Combat state
  const [currentEnemies, setCurrentEnemies] = useState<Enemy[]>([]);
  const [targetEnemyId, setTargetEnemyId] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<CombatActionLog[]>([]);
  
  // Turn management
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [currentActingEnemyIndex, setCurrentActingEnemyIndex] = useState(0);
  
  // Pending actions and confirmations
  const [pendingTraitUnlock, setPendingTraitUnlock] = useState(false);
  const [pendingSpellCraftData, setPendingSpellCraftData] = useState<(GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }) | null>(null);
  const [pendingSpellEditData, setPendingSpellEditData] = useState<GeneratedSpellData | null>(null);
  const [originalSpellForEdit, setOriginalSpellForEdit] = useState<Spell | null>(null);
  const [pendingItemCraftData, setPendingItemCraftData] = useState<GeneratedConsumableData | GeneratedEquipmentData | null>(null);
  const [playerActionSkippedByStun, setPlayerActionSkippedByStun] = useState(false);
  
  // UI state
  const [defaultCharacterSheetTab, setDefaultCharacterSheetTab] = useState<CharacterSheetTab | undefined>('Main');
  const [initialSpellPromptForStudio, setInitialSpellPromptForStudio] = useState<string>('');
  
  // Modal states
  const [isHelpWikiOpen, setIsHelpWikiOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Settlement and shop states
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentTavernId, setCurrentTavernId] = useState<string | null>(null);
  const [currentNPCId, setCurrentNPCId] = useState<string | null>(null);
  
  // Exploration state
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isExplorationJournalOpen, setIsExplorationJournalOpen] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  
  // Parameters state
  const [useLegacyFooter, setUseLegacyFooter] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return {
    // Core game state
    gameState,
    setGameState,
    
    // Loading states
    isLoading,
    setIsLoading,
    
    // Modal state
    modalContent,
    setModalContent,
    
    // Combat state
    currentEnemies,
    setCurrentEnemies,
    targetEnemyId,
    setTargetEnemyId,
    combatLog,
    setCombatLog,
    
    // Turn management
    turn,
    setTurn,
    isPlayerTurn,
    setIsPlayerTurn,
    currentActingEnemyIndex,
    setCurrentActingEnemyIndex,
    
    // Pending actions and confirmations
    pendingTraitUnlock,
    setPendingTraitUnlock,
    pendingSpellCraftData,
    setPendingSpellCraftData,
    pendingSpellEditData,
    setPendingSpellEditData,
    originalSpellForEdit,
    setOriginalSpellForEdit,
    pendingItemCraftData,
    setPendingItemCraftData,
    playerActionSkippedByStun,
    setPlayerActionSkippedByStun,
    
    // UI state
    defaultCharacterSheetTab,
    setDefaultCharacterSheetTab,
    initialSpellPromptForStudio,
    setInitialSpellPromptForStudio,
    
    // Modal states
    isHelpWikiOpen,
    setIsHelpWikiOpen,
    isGameMenuOpen,
    setIsGameMenuOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    
    // Settlement and shop states
    currentShopId,
    setCurrentShopId,
    currentTavernId,
    setCurrentTavernId,
    currentNPCId,
    setCurrentNPCId,
    
    // Exploration state
    isWorldMapOpen,
    setIsWorldMapOpen,
    isExplorationJournalOpen,
    setIsExplorationJournalOpen,
    isTraveling,
    setIsTraveling,
    
    // Parameters state
    useLegacyFooter,
    setUseLegacyFooter,
    debugMode,
    setDebugMode,
    autoSave,
    setAutoSave,
    
    // Utility methods
    addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => {
      const newLogEntry: CombatActionLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        actor,
        message,
        type,
        timestamp: Date.now()
      };
      setCombatLog(prev => [...prev, newLogEntry]);
    },
    
    showMessageModal: (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
      setModalContent({ title, message, type });
    },
  };
}; 