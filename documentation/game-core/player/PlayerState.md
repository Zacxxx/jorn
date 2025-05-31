# `game-core/player/PlayerState.ts`

## Purpose

The `PlayerState.ts` module is responsible for the comprehensive management of the player's character data throughout the game. Its key functions include creating a new player with default attributes, loading existing player data from the browser's `localStorage`, validating the integrity and structure of loaded data, saving the current player state back to `localStorage`, and providing a React custom hook (`usePlayerState`) for easy state access and updates within UI components.

## External Dependencies

*   **React:**
    *   `useState`: For managing the player state within the custom hook.
    *   `useEffect`: For implementing the auto-save functionality when the player state changes.
*   **`../../constants`**: This module imports numerous constants that define default values for a new player, such as:
    *   `INITIAL_PLAYER_STATS`, `STARTER_SPELL`, `INITIAL_PLAYER_INVENTORY`, `STARTER_ABILITIES`, base attributes (`PLAYER_BASE_BODY`, `PLAYER_BASE_MIND`, `PLAYER_BASE_REFLEX`), `INITIAL_PLAYER_EP`, `INITIAL_PLAYER_NAME`, `INITIAL_PLAYER_GOLD`, `INITIAL_PLAYER_ESSENCE`.
    *   `STATUS_EFFECT_ICONS`, `AVAILABLE_SPELL_ICONS`: Used by `validatePlayerData` to ensure status effects reference valid icon names.
*   **`../../src/services/homesteadService`**:
    *   `createInitialHomestead`: Used to initialize the player's homestead data when a new player is created.

## Key Constants

*   **`LOCAL_STORAGE_KEY = 'rpgSpellCrafterPlayerV21'`**: This string is the unique key under which the player's serialized data is stored in `localStorage`. The version suffix (`V21`) suggests a strategy for managing data format changes across different versions of the game, potentially allowing for data migration or specific handling if an older data version is detected (though explicit migration logic isn't detailed in this file, `validatePlayerData` serves a similar role by ensuring current validity).

## Core Functionality

### `createInitialPlayer(): Player`

*   Constructs and returns a new `Player` object populated with default starting values.
*   This includes initial statistics, a starting name, gold, essence, base attributes (body, mind, reflex), inventory, a starter spell (which is also set as prepared), starter abilities (with the first one prepared), default icon, bestiary, discovered components/recipes, current location, and an initial homestead state (via `createInitialHomestead`).
*   Notably, `hp`, `maxHp`, `mp`, `maxMp`, `maxEp`, and `speed` are initialized to 0, implying these are likely calculated and updated later based on other stats, level, or equipment.

### `validatePlayerData(parsed: any): Player`

*   A crucial function for ensuring data integrity when loading player data from an external source (like `localStorage`).
*   It takes a parsed object (`parsed`) and meticulously checks its properties against the expected `Player` type structure.
*   For each property, if it's missing or of an incorrect type in `parsed`, a default value from the constants or a sensible fallback is used.
*   **Specific Validations:**
    *   `activeStatusEffects`: Filters effects to ensure they have all required fields (`id`, `name`, `duration`, etc.) and that their `name` and `iconName` correspond to predefined valid enum values/lists.
    *   `spells`, `preparedSpellIds`, `abilities`, `preparedAbilityIds`: Ensures these are arrays and that prepared IDs actually correspond to spells/abilities the player possesses. If a player has spells/abilities but none are prepared, it defaults to preparing the first one in their list.
    *   `inventory`, `items`, `equippedItems`, `traits`, `quests`, `bestiary`, `discoveredComponents`, `discoveredRecipes`, `homestead`: Ensures these fields are of the correct type (e.g., array, object) and provides defaults if they are not.
*   This function helps maintain stability by correcting potentially malformed or outdated player data.

### `loadPlayerFromStorage(): Player`

1.  Attempts to retrieve the player data string from `localStorage` using `LOCAL_STORAGE_KEY`.
2.  If data exists:
    *   Parses the JSON string into an object.
    *   Performs a basic sanity check (e.g., `parsed.level` is a number, `parsed.spells` is an array).
    *   If the basic check passes, it calls `validatePlayerData` on the parsed object to get a fully validated and sanitized `Player` object.
    *   If parsing fails or the basic check doesn't pass, it logs a warning and removes the invalid item from `localStorage`.
3.  If no data is found in `localStorage` or if loaded data is invalid, it calls `createInitialPlayer()` to return a fresh, default player state.

### `savePlayerToStorage(player: Player): void`

1.  Serializes the provided `Player` object into a JSON string using `JSON.stringify()`.
2.  Stores this JSON string in `localStorage` under `LOCAL_STORAGE_KEY`.
3.  Includes a `try-catch` block to handle potential errors during `localStorage` operations (e.g., storage quota exceeded).

### `usePlayerState()` (React Custom Hook)

*   **Initialization:** When the hook is first used in a component, it initializes its internal `player` state by calling `loadPlayerFromStorage()`. This ensures that on game load, existing player data is retrieved.
*   **Auto-Save:** It uses the `useEffect` hook to monitor changes to the `player` state. Whenever the `player` state object is updated (e.g., by `setPlayer`), the `useEffect` callback triggers, calling `savePlayerToStorage(player)` to persist the changes to `localStorage`.
*   **Return Value:** Returns an object `{ player, setPlayer }`.
    *   `player`: The current player state object.
    *   `setPlayer`: The function to update the player state (provided by `useState`).

## `PlayerStateUtils` Object

This object exports several utility functions and the `LOCAL_STORAGE_KEY` constant, making them accessible for other modules or for testing purposes:

```typescript
export const PlayerStateUtils = {
  createInitialPlayer,
  validatePlayerData,
  loadPlayerFromStorage,
  savePlayerToStorage,
  LOCAL_STORAGE_KEY,
};
```

This module provides a robust system for managing player data, ensuring defaults, handling persistence, validating data integrity, and offering a convenient hook for React-based UIs.
