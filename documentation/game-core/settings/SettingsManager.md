# `game-core/settings/SettingsManager.ts`

## Purpose

The `SettingsManager.ts` module is responsible for managing all game-related settings and player preferences. It handles the loading of settings from the browser's `localStorage`, saving changes back to `localStorage`, allowing updates to individual settings, providing a mechanism to reset settings to their default values, and offering import/export functionalities. Additionally, it includes helper functions to interpret certain settings (like converting animation speed to delay times) and to generate a human-readable summary of current settings.

## Key Data Structures

### `GameSettings` Interface
Defines the structure for the game's configuration object. It includes properties like:
*   `useLegacyFooter: boolean`
*   `debugMode: boolean`
*   `autoSave: boolean`
*   `soundEnabled: boolean`
*   `musicEnabled: boolean`
*   `animationSpeed: 'slow' | 'normal' | 'fast'`
*   `combatLogLength: number` (e.g., number of entries to keep)
*   `autoAdvanceDialogue: boolean`
*   `showDamageNumbers: boolean`
*   `confirmActions: boolean` (e.g., require confirmation for important actions)

### `SettingsContext` Interface
An optional interface primarily used for providing user feedback.
*   `showMessageModal(title: string, message: string, type?: 'info' | 'error' | 'success')`: A function to display modal messages to the user, typically for success or error notifications during operations like settings reset or import/export.

## Key Constants

*   **`SETTINGS_STORAGE_KEY = 'jorn-game-settings'`**: The string key used when storing or retrieving the game settings object in `localStorage`.
*   **`DEFAULT_SETTINGS: GameSettings`**: An instance of `GameSettings` that holds the predefined default values for every setting. This ensures that the game always has a valid configuration to fall back on.

## Core Functionality

All primary functions are exported via the `SettingsManagerUtils` object.

### Loading and Saving

*   **`loadSettings(): GameSettings`**
    1.  Attempts to retrieve the settings JSON string from `localStorage` using `SETTINGS_STORAGE_KEY`.
    2.  If found, parses the JSON.
    3.  **Merges with Defaults:** The parsed settings are spread into a new object that itself spreads `DEFAULT_SETTINGS` first (`{ ...DEFAULT_SETTINGS, ...parsed }`). This ensures that any settings present in `DEFAULT_SETTINGS` but missing from the loaded data (e.g., due to an older save or a new setting being added) are initialized with their default values.
    4.  If no settings are stored, or if parsing fails, a fresh copy of `DEFAULT_SETTINGS` is returned.

*   **`saveSettings(settings: GameSettings): boolean`**
    1.  Serializes the provided `settings` object into a JSON string.
    2.  Stores this string in `localStorage` under `SETTINGS_STORAGE_KEY`.
    3.  Returns `true` if the save operation is successful, `false` if an error occurs (e.g., `localStorage` quota exceeded).

### Modifying Settings

*   **`updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K], context?: SettingsContext): GameSettings`**
    1.  Loads the current settings using `loadSettings()`.
    2.  Creates a new settings object by updating the specified `key` with the new `value`.
    3.  Saves the modified settings object using `saveSettings()`.
    4.  If `saveSettings` fails and a `context` is provided, it calls `context.showMessageModal` to inform the user of the error.
    5.  Returns the newly updated settings object.

*   **`resetSettings(context?: SettingsContext): GameSettings`**
    1.  Saves the `DEFAULT_SETTINGS` object to `localStorage`.
    2.  If a `context` is provided, it uses `context.showMessageModal` to notify the user of success or failure of the reset operation.
    3.  Returns a fresh copy of `DEFAULT_SETTINGS`.

### Import/Export

*   **`exportSettings(settings: GameSettings): string`**
    *   Serializes the given `settings` object into a human-readable JSON string (using `JSON.stringify(settings, null, 2)` for pretty-printing).
    *   This string can then be used for downloading as a file or copying to the clipboard.

*   **`importSettings(settingsJson: string, context?: SettingsContext): GameSettings | null`**
    1.  Attempts to parse the `settingsJson` string into an object.
    2.  Calls the internal `validateSettings()` helper on the parsed object to ensure its structure and values are valid.
    3.  If validation is successful:
        *   Saves the `validatedSettings` using `saveSettings()`.
        *   Provides feedback to the user via `context.showMessageModal` regarding the success or failure of saving the imported settings.
        *   Returns the `validatedSettings`.
    4.  If parsing or validation fails, provides error feedback via `context.showMessageModal` and returns `null`.

*   **`validateSettings(settings: any): GameSettings | null` (Internal Helper)**
    *   A private function that ensures an arbitrary `settings` object conforms to the `GameSettings` interface.
    *   It initializes a new object with `DEFAULT_SETTINGS`.
    *   Then, for each known setting property, it checks if the input `settings` has that property and if its type is correct. If valid, the value from the input is used; otherwise, the default value remains.
    *   For `animationSpeed`, it ensures the value is one of 'slow', 'normal', or 'fast'.
    *   For `combatLogLength`, it clamps the value between 10 and 200.
    *   Returns the sanitized `GameSettings` object, or `null` if the initial input `settings` is not even an object.

### Utility Functions

*   **`getAnimationDelay(speed: GameSettings['animationSpeed']): number`**
    *   Converts the `animationSpeed` setting into a numerical delay in milliseconds (e.g., 'slow' -> 2000, 'normal' -> 1000, 'fast' -> 500).

*   **`isFeatureEnabled(settings: GameSettings, feature: 'sound' | 'music' | 'animations' | 'debug' | 'autoSave'): boolean`**
    *   A helper to quickly check if a boolean-like feature is enabled.
    *   For 'animations', it considers them enabled if `animationSpeed` is not 'fast'.

*   **`getSettingsSummary(settings: GameSettings): string`**
    *   Generates a multi-line, human-readable string that lists all current settings and their values.

## `SettingsManagerUtils`

This object serves as the public API for the module:
```typescript
export const SettingsManagerUtils = {
  loadSettings,
  saveSettings,
  updateSetting,
  resetSettings,
  exportSettings,
  importSettings,
  getAnimationDelay,
  isFeatureEnabled,
  getSettingsSummary,
};
```
It provides a robust and centralized way to manage game configurations and user preferences.
