# `game-core/navigation/NavigationController.ts`

## Purpose

The `NavigationController.ts` module serves as the central hub for managing all game state transitions and user interface navigation. It provides a collection of utility functions to direct the player to various game screens (e.g., inventory, crafting, map), control the visibility of modal dialogs (like help menus), toggle game-wide settings, and handle actions such as resting. Its design heavily relies on a "context" object that provides access to and modification of the game's state.

## Key Interfaces

### `NavigationContext`
This is a comprehensive interface that encapsulates a significant portion of the game's current state and the functions needed to update it. It is passed as an argument to nearly every function within this module. Key aspects include:

*   **Player Data:** `player` (current player object), `effectivePlayerStats`, `pendingTraitUnlock` (boolean indicating if a trait selection is pending).
*   **Core State Setters:**
    *   `setGameState(state: string)`: Crucial for changing the main view or section of the game.
    *   `setDefaultCharacterSheetTab(tab: CharacterSheetTab | undefined)`: Sets the default tab to open when navigating to the character sheet.
    *   `setInitialSpellPromptForStudio(prompt: string)`: Sets an initial text prompt for the spell design interface.
    *   `setIsHelpWikiOpen(open: boolean)`, `setIsGameMenuOpen(open: boolean)`, `setIsMobileMenuOpen(open: boolean)`: Control the visibility of various modal views.
    *   `setCurrentEnemies(enemies: Enemy[])`, `setTargetEnemyId(id: string | null)`, `setCombatLog(log: CombatActionLog[])`: Manage combat-related state.
    *   `setModalContent(content: { title: string; message: string; type: 'info' | 'error' | 'success' } | null)`: Displays informational or alert modals.
    *   `setPlayer(updater: (prev: Player) => Player)`: Updates the player object.
*   **Settings Setters:**
    *   `setUseLegacyFooter(value: boolean)`, `setDebugMode(value: boolean)`, `setAutoSave(value: boolean)`: Modify game settings.

### `RestResult`
Defines the structure of the data returned after a player completes a rest action.
*   `hpGain`: Number of health points restored.
*   `mpGain`: Number of mana points restored.
*   `epGain`: Number of energy points restored.
*   `bonusMessage`: String describing any additional bonus received from a rest activity.

## Core Functionality

All functions are exported via the `NavigationControllerUtils` object.

### View Navigation Functions
A large set of functions dedicated to changing the active game view by calling `context.setGameState("NEW_STATE_NAME")`. Examples:

*   `navigateToInventory()`, `navigateToSpellbook()`, `navigateToCraftingHub()`, `navigateToRecipeDiscovery()`, `navigateToCraftingWorkshop()`, `navigateToSpellDesignStudio(initialPrompt?: string)`, `navigateToExploreMap()`, `navigateToCamp()`, `navigateToNPCs()`, `navigateToResearchArchives()`, `navigateToTheorizeComponentLab()`, `navigateToQuestsPage()`, `navigateToCharacterSheet(tab?: CharacterSheetTab)`, `navigateToEncyclopedia()`, `navigateToHomestead()`, `navigateToParameters()`.
*   **Special Cases:**
    *   `navigateToTraitsPage()`: Checks if the player is due for a trait unlock (based on `player.level`, `FIRST_TRAIT_LEVEL`, `TRAIT_LEVEL_INTERVAL`, and `pendingTraitUnlock`). If so, navigates to `'TRAIT_CRAFTING'`; otherwise, to the 'Traits' tab of the `'CHARACTER_SHEET'`.
    *   `navigateToHome()`: Navigates to the `'HOME'` state and also resets combat-related states (`currentEnemies`, `targetEnemyId`, `combatLog`) and clears any active `modalContent`.

### Modal Management
Functions to control the display of overlay modals:
*   `openHelpWiki(context)` / `closeHelpWiki(context)`: Uses `context.setIsHelpWikiOpen`.
*   `openGameMenu(context)` / `closeGameMenu(context)`: Uses `context.setIsGameMenuOpen`.
*   `openMobileMenu(context)` / `closeMobileMenu(context)`: Uses `context.setIsMobileMenuOpen`.

### Settings Toggles
Functions to change boolean game settings:
*   `toggleLegacyFooter(context, value: boolean)`: Uses `context.setUseLegacyFooter`.
*   `toggleDebugMode(context, value: boolean)`: Uses `context.setDebugMode`.
*   `toggleAutoSave(context, value: boolean)`: Uses `context.setAutoSave`.

### Rest Action
*   **`completeRest(context: NavigationContext, restType: 'short' | 'long', duration?: number, activity?: string): RestResult`**
    1.  Calculates base HP, MP, and EP recovery:
        *   Short rest: 25% max HP, 50% max MP, 75% max EP.
        *   Long rest: Full HP, MP, EP recovery (to max values).
    2.  If a custom `duration` (in hours) is provided, scales the gains proportionally (based on an 8-hour full rest).
    3.  Updates `player` stats (HP, MP, EP) via `context.setPlayer`, ensuring they don't exceed maximums.
    4.  If an `activity` (e.g., 'meditation', 'training', 'crafting', 'socializing', 'exploring') is provided, applies a corresponding bonus. This might include extra MP, gold, essence, or simply a descriptive message.
    5.  Displays a modal message via `context.setModalContent` summarizing the HP/MP/EP recovered and any activity bonus.
    6.  Returns a `RestResult` object containing `hpGain`, `mpGain`, `epGain`, and the `bonusMessage`.

## `NavigationControllerUtils`

This object serves as the public API for the module, centralizing all navigation and related UI control functions:
```typescript
export const NavigationControllerUtils = {
  // ... all navigation functions listed above
  navigateToHome,
  openHelpWiki,
  // ... all modal and settings functions
  completeRest,
};
```
This module is fundamental for controlling the player's journey through different parts of the game interface and managing some overarching game actions.
