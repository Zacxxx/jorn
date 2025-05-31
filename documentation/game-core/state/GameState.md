# `game-core/state/GameState.ts`

## 1. Purpose

The `GameState.ts` module serves as the central hub for managing the entire client-side state of the game. It utilizes a React custom hook, `useGameState`, to consolidate all individual pieces of state into a single, manageable structure. This approach aims to provide a unified way for different parts of the game's UI and logic to access and update shared data, such as the current game view, loading indicators, modal dialog content, combat status, turn information, pending player actions, and various UI settings.

## 2. Functionality

The primary functionality of this module is to:

*   **Define and Initialize State:** It declares and initializes a wide array of state variables that represent different aspects of the game.
*   **Provide State and Setters:** Through the `useGameState` hook, it exposes both the current value of each state variable and the corresponding function to update it.
*   **Centralize State Management:** By gathering all `useState` calls into one hook, it provides a single source of truth for much of the game's dynamic data. This is typically used in conjunction with React Context to make the state accessible throughout the component tree.

This module itself does **not** contain game logic (e.g., how combat is resolved, how stats are calculated). Instead, it provides the reactive state infrastructure that other logic modules would interact with.

## 3. File Contents

The file primarily consists of:

*   **Imported Types:** Various type definitions from `../../types` are imported to strongly type the state variables (e.g., `Player`, `Enemy`, `GameStateType`, `CombatActionLog`, `Spell`, `CharacterSheetTab`).
*   **`ModalContent` Interface:** Defines the structure for displaying modal dialogs.
*   **`GameStateManager` Interface:** A large interface that defines the shape of the object returned by the `useGameState` hook. This object contains all the state variables and their respective setter functions.
*   **`useGameState()` Custom Hook:** The core of the module. This function internally uses multiple `React.useState` calls to manage individual pieces of state and then returns them (along with their setters) grouped in an object that conforms to the `GameStateManager` interface.

### `ModalContent` Interface
```typescript
export interface ModalContent {
  title: string;        // The title of the modal dialog.
  message: string;      // The main message content of the modal.
  type: 'info' | 'error' | 'success'; // The type of modal, often used for styling.
}
```

### `GameStateManager` Interface
This interface defines the comprehensive structure of the game's state as managed by the `useGameState` hook. It groups related state variables and their setters:

*   **Core Game State:**
    *   `gameState: GameStateType`: Represents the current main view or screen of the game (e.g., 'HOME', 'COMBAT', 'INVENTORY').
    *   `setGameState: (state: GameStateType) => void`: Function to change the main game state/view.
*   **Loading States:**
    *   `isLoading: boolean`: A global loading flag, true if a blocking asynchronous operation is in progress.
    *   `setIsLoading: (loading: boolean) => void`.
*   **Modal State:**
    *   `modalContent: ModalContent | null`: Holds the data for a generic modal dialog, or `null` if no modal is active.
    *   `setModalContent: (content: ModalContent | null) => void`.
*   **Combat State:**
    *   `currentEnemies: Enemy[]`: Array of enemies currently engaged in combat.
    *   `setCurrentEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>`.
    *   `targetEnemyId: string | null`: ID of the enemy currently targeted by the player.
    *   `setTargetEnemyId: (id: string | null) => void`.
    *   `combatLog: CombatActionLog[]`: Log of actions and events during combat.
    *   `setCombatLog: React.Dispatch<React.SetStateAction<CombatActionLog[]>>`.
*   **Turn Management:**
    *   `turn: number`: Current turn number (e.g., in combat).
    *   `setTurn: React.Dispatch<React.SetStateAction<number>>`.
    *   `isPlayerTurn: boolean`: True if it's currently the player's turn to act.
    *   `setIsPlayerTurn: (isPlayerTurn: boolean) => void`.
    *   `currentActingEnemyIndex: number`: Index of the enemy currently taking its turn.
    *   `setCurrentActingEnemyIndex: React.Dispatch<React.SetStateAction<number>>`.
*   **Pending Actions and Confirmations:** (States for multi-step processes)
    *   `pendingTraitUnlock: boolean`: True if the player is due to unlock/select a new trait.
    *   `setPendingTraitUnlock: (pending: boolean) => void`.
    *   `pendingSpellCraftData`, `pendingSpellEditData`, `originalSpellForEdit`, `pendingItemCraftData`: Hold temporary data during spell/item crafting or editing flows.
    *   `playerActionSkippedByStun: boolean`: Flag if player's action was skipped due to stun.
    *   Associated setter functions.
*   **UI State:**
    *   `defaultCharacterSheetTab: CharacterSheetTab | undefined`: Default tab to show when opening the character sheet.
    *   `initialSpellPromptForStudio: string`: Initial text for the spell design studio.
    *   Associated setter functions.
*   **Other Modal States:** (Specific boolean flags for common modals)
    *   `isHelpWikiOpen`, `isGameMenuOpen`, `isMobileMenuOpen`: Control visibility of these specific UI elements.
    *   Associated setter functions.
*   **Settlement and Shop States:**
    *   `currentShopId`, `currentTavernId`, `currentNPCId`: IDs for currently active interaction points in a settlement.
    *   Associated setter functions.
*   **Exploration State:**
    *   `isWorldMapOpen`, `isExplorationJournalOpen`, `isTraveling`: Flags related to map and travel UI.
    *   Associated setter functions.
*   **Parameters State (Game Settings):**
    *   `useLegacyFooter`, `debugMode`, `autoSave`: Game settings flags.
    *   Associated setter functions.

### `useGameState(): GameStateManager`
This custom React hook is the heart of the module.
1.  It declares numerous individual state variables using `React.useState()`, covering all the aspects defined in the `GameStateManager` interface.
2.  Each piece of state is initialized with a sensible default value (e.g., `gameState` starts at `'HOME'`, `isLoading` at `false`, `currentEnemies` as an empty array).
3.  It then returns an object containing all these state variables and their corresponding setter functions, matching the `GameStateManager` interface.

## 4. Types (Brief Overview of Imported Types)

*   **`GameStateType`**: An enum or string literal union defining all possible main game views/screens (e.g., 'HOME', 'COMBAT', 'INVENTORY', 'CHARACTER_SHEET', 'CRAFTING_WORKSHOP', etc.). This is fundamental for controlling navigation.
*   **`Player`**: A complex type defining the entire player character's data (stats, inventory, spells, equipment, etc.).
*   **`Enemy`**: Defines the structure for enemy data.
*   **`CombatActionLog`**: Defines the structure for entries in the combat log.
*   **`GeneratedSpellData`, `GeneratedConsumableData`, `GeneratedEquipmentData`**: Types representing data for spells/items as generated by AI or crafting processes, often before they become finalized `Spell` or `GameItem` instances.
*   **`Spell`**: Defines the structure for a finalized spell known by the player.
*   **`CharacterSheetTab`**: An enum or string literal union for the different tabs within a character sheet view (e.g., 'Main', 'Inventory', 'Spells', 'Traits').

## 5. Refactoring Guide & Potential Improvements

The `useGameState` hook provides a straightforward way to manage global state, especially in smaller to medium-sized React applications. However, as the game grows, certain aspects could be considered for refactoring:

1.  **State Granularity and Performance:**
    *   **Current:** A single large hook and, typically, a single React Context provider for all game state.
    *   **Issue:** Any update to any piece of state via this context will cause all components consuming this context to potentially re-render, even if they don't care about the specific piece of state that changed. This can lead to performance issues in complex UIs.
    *   **Suggestions:**
        *   **Multiple Contexts:** Group logically related pieces of state into smaller, more focused contexts (e.g., `CombatContext`, `UIContext`, `PlayerSessionContext`). Components would then subscribe only to the contexts relevant to them.
        *   **State Management Libraries:** For very complex state interactions, consider dedicated state management libraries like Zustand, Jotai, or Recoil. These libraries often provide more optimized ways to manage global state and handle selective re-renders. Zustand and Jotai, for example, allow components to subscribe to specific slices or atoms of state.
        *   **`useReducer`:** For parts of the state that have complex update logic or many related actions (e.g., the combat state, or the pending action states), `React.useReducer` could be used within `useGameState` or in a separate, more focused hook to manage that slice of state more robustly.

2.  **`GameStateManager` Interface Size:**
    *   **Issue:** The interface is very large, making the object returned by `useGameState` also very large.
    *   **Note:** This is a direct consequence of having many `useState` calls. If state is broken into more granular contexts/hooks as suggested above, this interface would naturally shrink or be broken into multiple smaller manager-type interfaces.

3.  **Initial State Configuration:**
    *   **Current:** Initial states are hardcoded within the `useState` calls.
    *   **Suggestion:** For easier configuration or testing, consider defining the initial state for the entire `useGameState` hook as a single object. This can be useful if, for example, you want to initialize the game in a specific state for debugging or testing scenarios.

4.  **Separation of Concerns (State vs. Logic):**
    *   **Current:** The module does a good job of sticking to state management only. It defines state and setters but no game logic. This is excellent.
    *   **Reinforce:** Ensure that as the game evolves, game logic (e.g., what happens when `setGameState('COMBAT')` is called beyond just setting the state string) remains in other dedicated modules (like a `CombatManager` or `NavigationController`), which would then *use* the setters from `useGameState`.

5.  **Testing:**
    *   **Challenge:** Testing components that consume a very large context can sometimes be cumbersome as you might need to mock the entire context value.
    *   **Benefit of Granularity:** More granular contexts/hooks are often easier to mock and test in isolation.

While the current implementation is a common and valid pattern for centralizing state with React hooks, these suggestions offer paths for scaling and optimization if the game's complexity and performance requirements grow significantly. For many projects, the existing structure offers a good balance of simplicity and centralized control.
