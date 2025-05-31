# `game-core/test-extraction.ts`

## Purpose

The `game-core/test-extraction.ts` file serves as a test suite designed to verify the correct functionality of various modules that have been extracted into the `game-core` directory. It acts as a basic integration test, ensuring that components from different development phases (explicitly mentioned as Phase 1, 2, 3, 4 & 5 extractions) are working as expected.

## Functionality

The script performs the following key actions:

1.  **Imports Core Modules:** It imports a comprehensive set of utility functions, objects, and types from numerous modules within the `game-core`. These modules represent core gameplay systems, including:
    *   `spells/TagSystem`: Manages tags and their effective combinations.
    *   `state/GameState`: Handles the overall game state.
    *   `player/PlayerState` & `player/PlayerStats`: Manages player data, statistics, and calculations like max prepared spells.
    *   `resources/ResourceManager`: Manages player resources (e.g., gold), including checking and deducting them.
    *   `spells/SpellCrafting`: Utilities related to spell crafting.
    *   `items/ItemManagement`: Utilities for managing items.
    *   `homestead/HomesteadManager`: Manages player homestead functionalities.
    *   `settlement/SettlementManager`: Manages settlement-related functionalities.
    *   `combat/CombatEngine`: Handles combat calculations, such as damage.
    *   `navigation/NavigationController`: Manages game navigation.
    *   `persistence/SaveManager`: Handles game saving and loading logic.
    *   `crafting/RecipeManager`: Manages crafting recipes and their requirements.
    *   `abilities/AbilityManager`: Manages player abilities.
    *   `game-loop/TurnManager`: Manages game turns and flow.
    *   `camp/CampManager`: Manages camping actions and conditions.
    *   `progression/ProgressionManager`: Handles player progression, like calculating levels from XP.
    *   `research/ResearchManager`: Manages research-related mechanics.
    *   `settings/SettingsManager`: Manages game settings.
    *   `traits/TraitManager`: Manages player traits.
    *   `hooks/useConsumables`: Provides utilities for using consumable items.

2.  **Executes Basic Tests:** For each imported module or group of related functions, the script executes simple tests. These tests primarily involve:
    *   Invoking functions with sample data (e.g., creating an initial player state, calculating effective stats, checking if a player has certain resources, calculating damage).
    *   Logging the output of these function calls to the console for verification.
    *   Confirming the availability of utility collections by logging the keys of imported utility objects (e.g., `Object.keys(SpellCraftingUtils)`).

3.  **Confirms Test Completion:** After running all the tests, it logs the message "All Phase 1, 2, 3, 4 & 5 modules tested successfully!" to the console, indicating that all test routines have been executed.

4.  **Exports Modules:** The script exports all the imported utility functions and objects. This makes them accessible for other parts of the application, potentially for more in-depth testing frameworks or for direct use in the game logic.

## How it Works (Example Flow)

*   **Tag System Test:**
    *   Defines a sample array of `TagName` (e.g., `['Fire', 'Ice', 'Lightning']`).
    *   Calls `getEffectiveTags()` with these tags.
    *   Logs the resulting effective tags and the length of `tagPrecedenceList`.
*   **Player State Test:**
    *   Calls `PlayerStateUtils.createInitialPlayer()` to generate a new player object.
    *   Logs the created player's name and level.
*   **Combat Engine Test:**
    *   Calls `CombatEngineUtils.calculateDamage()` with sample base damage, power, and defense values.
    *   Logs the calculated damage.

This pattern of calling a utility and logging its output or checking its structure is repeated for all tested modules. The file essentially acts as a smoke test for the integrated `game-core` systems.
