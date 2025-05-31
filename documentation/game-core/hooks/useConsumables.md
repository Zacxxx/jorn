# `game-core/hooks/useConsumables.ts`

## Purpose

The `useConsumables.ts` module provides a collection of functions (often referred to as "hooks" in frontend development, or simply utilities in a broader context) for managing the usage and effects of consumable items within the game. It handles the logic for a player using an item, applying its specific effects, checking item usability, listing available consumables, and offering previews of what an item will do.

## External Dependencies

*   **`../../constants`**:
    *   `MASTER_ITEM_DEFINITIONS`: This is expected to be a comprehensive data structure (e.g., an object or map) that holds the master definitions for all items in the game. For consumables, this would include their `name`, `effectType`, `magnitude`, `statusToCure`, `buffToApply`, `duration`, etc.

## Key Interfaces

### `ConsumableContext`
Defines the necessary data and callback functions required for the execution of consumable item effects.
*   `player`: The current `Player` object.
*   `currentEnemies`: An array of `Enemy` objects (though less frequently used by typical self-use consumables).
*   `effectivePlayerStats`: The player's stats after all modifiers.
*   `setPlayer`: Callback to update the player's state.
*   `setCurrentEnemies`: Callback to update enemy states.
*   `setIsPlayerTurn`: Callback to signal the end of the player's turn.
*   `addLog`: Function to add messages to the game log.
*   `applyStatusEffect`: Function to apply status effects (buffs) to the player.

### `ConsumableUseResult`
Describes the outcome of an attempt to use a consumable item.
*   `success`: Boolean, true if the item was used successfully.
*   `message`: String providing feedback to the player.
*   `type`: Literal `'success' | 'error'` categorizing the message.
*   `effectApplied?`: Optional string describing the specific effect that was applied (e.g., "Restored 50 HP").

## Core Functionality

All primary functions are exported via the `ConsumablesUtils` object.

### `useConsumable(itemId: string, targetId: string | null, context: ConsumableContext): ConsumableUseResult`

Handles the entire process of a player using a consumable item. The `targetId` parameter is included but not actively used in the provided code for effect application, suggesting most consumables are self-targeted.

1.  **Item Identification:**
    *   Attempts to find the item as a `UniqueConsumable` in `context.player.items` (items with unique instance IDs).
    *   If not found, it checks if `itemId` corresponds to a stackable `MasterConsumableItem` in `MASTER_ITEM_DEFINITIONS` and if `context.player.inventory[itemId] > 0`.
2.  **Failure Condition:** If the item cannot be found or isn't usable, returns a `ConsumableUseResult` with `success: false`.
3.  **Log Usage:** Adds a log entry indicating the player uses the item.
4.  **Effect Application (based on `itemUsed.effectType`):**
    *   **`HP_RESTORE`**: Increases `context.player.hp` by `itemUsed.magnitude`, capped at `context.effectivePlayerStats.maxHp`. Logs healing.
    *   **`MP_RESTORE`**: Increases `context.player.mp` by `itemUsed.magnitude`, capped at `context.effectivePlayerStats.maxMp`. Logs resource restoration.
    *   **`EP_RESTORE`**: Increases `context.player.ep` by `itemUsed.magnitude`, capped at `context.effectivePlayerStats.maxEp`. Logs resource restoration.
    *   **`CURE_STATUS`**: Removes `itemUsed.statusToCure` from `context.player.activeStatusEffects`. Logs the cure.
    *   **`APPLY_BUFF`**: Uses `context.applyStatusEffect` to add `itemUsed.buffToApply` (with `itemUsed.duration` and `itemUsed.magnitude`) to the player.
5.  **Item Consumption:**
    *   If the item was stackable (from `MASTER_ITEM_DEFINITIONS`), decrements its count in `context.player.inventory`.
    *   If it was a unique item, removes it from `context.player.items`.
6.  **End Turn:** Calls `context.setIsPlayerTurn(false)`.
7.  Returns a `ConsumableUseResult` indicating success and detailing the effect applied.

### `canUseConsumable(itemId: string, player: Player): boolean`

Checks if a player is currently able to use a specific consumable.
*   Returns `true` if the item is a unique consumable present in `player.items`.
*   OR, if it's a defined stackable consumable in `MASTER_ITEM_DEFINITIONS` and `player.inventory[itemId]` is greater than 0.
*   Otherwise, returns `false`.

### `getUsableConsumables(player: Player): Array<UniqueConsumable | MasterConsumableItem>`

Compiles and returns a list of all consumable items the player can currently use.
*   Includes all `UniqueConsumable` items from `player.items`.
*   Includes all stackable `MasterConsumableItem`s from `MASTER_ITEM_DEFINITIONS` for which `player.inventory` has a quantity greater than 0.

### `getConsumablePreview(itemId: string, player: Player, effectiveStats: PlayerEffectiveStats): string`

Provides a user-friendly string describing the anticipated effect of using a given consumable.
*   Finds the item (unique or stackable).
*   Based on its `effectType`, constructs a preview:
    *   For restorative items, shows how much would be restored (e.g., "Would restore X HP (Y max)").
    *   For `CURE_STATUS`, indicates if the status is present and would be cured.
    *   For `APPLY_BUFF`, describes the buff and its duration.

### `getConsumablesByEffect(player: Player, effectType: 'HP_RESTORE' | ...): Array<UniqueConsumable | MasterConsumableItem>`

Filters the player's usable consumables to return only those matching a specific `effectType`.

## `ConsumablesUtils`

This object serves as the public API for the module, centralizing access to its functionalities:

```typescript
export const ConsumablesUtils = {
  useConsumable,
  canUseConsumable,
  getUsableConsumables,
  getConsumablePreview,
  getConsumablesByEffect,
};
```
This structure is convenient for other game systems or UI components to interact with consumable item logic.
