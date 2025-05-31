# `game-core/camp/CampManager.ts`

## Purpose

The `CampManager.ts` module governs the mechanics of resting and performing activities while at a camp. It handles different types of rests, the associated recovery of player statistics (Health Points - HP, Mana Points - MP, Energy Points - EP), bonuses from various camp activities, conditions for allowing rest, and recommendations for rest types and activities.

## Key Interfaces

### `CampContext`

This interface defines the necessary data and functions required for camp-related actions to be executed:

*   `player`: The current `Player` object.
*   `effectivePlayerStats`: The `PlayerEffectiveStats`, which are the player's stats after considering any active effects or modifiers.
*   `setPlayer`: A callback function to update the `Player` object's state.
*   `setGameState`: A callback function to change the overall game state (e.g., to 'HOME' after resting).
*   `addLog`: A function for adding messages to the game's log system.
*   `showMessageModal`: A function to display modal messages to the player (e.g., for important notifications).

### `RestResult`

This interface describes the outcome of a `completeRest` action:

*   `success`: Boolean indicating if the rest was successfully completed.
*   `message`: A string detailing the outcome of the rest (e.g., "Long rest completed. +50 HP. +30 MP.").
*   `type`: A literal type `'success' | 'error'` categorizing the result.
*   `hpRestored?`: Optional number indicating how much HP was actually restored.
*   `mpRestored?`: Optional number indicating how much MP was actually restored.
*   `epRestored?`: Optional number indicating how much EP was actually restored.
*   `bonusApplied?`: Optional string describing any bonus received from a camp activity.

## Key Types

### `RestType`

Defines the types of rest a player can take:
*   `'short'`: A brief rest, typically for partial recovery.
*   `'long'`: An extended rest, typically for full recovery and more significant activity bonuses.

### `RestActivity`

Defines the activities a player can engage in during a rest period:
*   `'meditation'`
*   `'training'`
*   `'study'`
*   `'crafting'`
*   `'exploration'`
*   `'socializing'`

## Core Functionality

The module's primary functions are exposed via the `CampManagerUtils` object.

### `completeRest(restType: RestType, duration?: number, activity?: string, context: CampContext): RestResult`

Manages the process of a player completing a rest:

1.  **Determine Duration:** Sets a default duration if not provided (1 hour for short rest, 8 hours for long rest).
2.  **Base Recovery:**
    *   **Short Rest:** Recovers 25% of max HP, 50% of max MP, and 100% of max EP.
    *   **Long Rest:** Recovers 100% of max HP, MP, and EP.
3.  **Activity Bonus:** If an `activity` is specified, it calls the internal `calculateActivityBonus` function to determine if any additional HP, MP, EP, or XP should be awarded. The bonus message is prepared.
4.  **Apply Recovery:** Updates the player's current HP, MP, and EP, ensuring they do not exceed their maximum values.
5.  **Clear Status Effects:** Most active status effects on the player are cleared upon resting.
6.  **Update Player State:** The `context.setPlayer` function is called to apply the changes.
7.  **Log & Game State:** A message detailing the rest outcome is added to the log via `context.addLog`, and the game state is set to 'HOME' via `context.setGameState`.
8.  **Return Result:** An object of type `RestResult` is returned, summarizing the rest outcomes.

### `calculateActivityBonus(activity: string, restType: RestType, context: CampContext): { type: 'hp' | 'mp' | 'ep' | 'xp'; bonus: number }`

An internal helper function (not directly exported by `CampManagerUtils`) that calculates the bonus from a camp activity.

*   The `baseBonus` is higher for a `long` rest than a `short` rest.
*   The specific `activity` determines the type of bonus (`hp`, `mp`, `ep`, or `xp`) and how it scales with `player.level`.
    *   Example: 'meditation' grants an MP bonus, 'training' an EP bonus, 'study' an XP bonus.

### `canRest(restType: RestType, context: CampContext): boolean`

Determines if the player is currently allowed to rest. A player can rest if:

*   Their HP, MP, or EP are below their maximum values.
*   They are suffering from certain negative status effects (e.g., 'PoisonDoTActive', 'Silenced') that resting can clear.

### `getAvailableActivities(player: Player): RestActivity[]`

Returns an array of `RestActivity` strings representing the camp activities currently available to the player.

*   `'meditation'` and `'training'` are typically always available.
*   Other activities like `'study'`, `'exploration'`, `'crafting'`, and `'socializing'` become available as the player reaches certain levels or fulfills other game-specific conditions (e.g., discovering recipes for crafting).

### `getRestRecommendations(player: Player, effectiveStats: PlayerEffectiveStats): { restType: RestType; activity?: RestActivity; reason: string }`

Provides a suggestion for the type of rest and activity the player might want to undertake, based on their current status.

*   If HP or MP percentages are low (e.g., < 30%), a `'long'` rest with `'meditation'` is recommended.
*   For moderate recovery needs (e.g., HP/MP < 70% or EP < 50%), a `'short'` rest with `'training'` is suggested.
*   If the player is in good condition, a `'short'` rest with `'study'` (for XP gain) is recommended.

## `CampManagerUtils`

This object serves as a namespace and exports the primary callable functions of the module:

```typescript
export const CampManagerUtils = {
  completeRest,
  canRest,
  getAvailableActivities,
  getRestRecommendations,
};
```
This allows other game systems to easily interact with the camp functionalities.
