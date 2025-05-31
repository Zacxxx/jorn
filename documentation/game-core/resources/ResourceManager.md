# `game-core/resources/ResourceManager.ts`

## Purpose

The `ResourceManager.ts` module provides a set of utility functions for managing player resources. These resources are typically items tracked as quantities within the `player.inventory` object (a key-value store where keys are item IDs and values are their counts). The module facilitates common operations such as checking if the player possesses sufficient resources for an action, deducting resources as a cost, adding new resources to the inventory, and querying the current quantity of a specific resource.

## Key Data Types

*   **`Player`**: The standard player object, which crucially contains the `inventory: Record<string, number>` field.
*   **`ResourceCost`**: An interface representing a specific amount of a particular resource. It is typically defined as:
    ```typescript
    interface ResourceCost {
      itemId: string; // The unique identifier of the resource item
      quantity: number; // The amount of this resource required or awarded
    }
    ```

## Core Functionality

All functions are exported via the `ResourceManagerUtils` object.

### `checkResources(player: Player, costs?: ResourceCost[]): boolean`

Verifies if the player has enough resources to cover a list of specified costs.

*   **Parameters:**
    *   `player`: The `Player` object whose inventory is to be checked.
    *   `costs?`: An optional array of `ResourceCost` objects.
*   **Behavior:**
    *   If `costs` is undefined or an empty array, the function returns `true` (as there's no cost to meet).
    *   Otherwise, it iterates through each `ResourceCost` in the `costs` array. For every `cost`, it checks if `player.inventory[cost.itemId]` (or 0 if the item isn't in the inventory) is greater than or equal to `cost.quantity`.
*   **Returns:** `true` if all resource costs in the `costs` array can be met by the player's inventory; `false` otherwise.

### `deductResources(player: Player, costs?: ResourceCost[]): { success: boolean; updatedPlayer?: Player }`

Attempts to deduct a list of specified resources from the player's inventory.

*   **Parameters:**
    *   `player`: The `Player` object from whose inventory resources will be deducted.
    *   `costs?`: An optional array of `ResourceCost` objects to deduct.
*   **Behavior:**
    1.  It first calls `checkResources(player, costs)` to ensure the player can afford all costs.
    2.  If `checkResources` returns `false` or `costs` is undefined, the function immediately returns `{ success: false }`.
    3.  If resources are sufficient:
        *   It creates a shallow copy of `player.inventory`.
        *   It iterates through the `costs` array, subtracting `cost.quantity` from the corresponding `itemId` in the copied inventory.
        *   It creates a new `updatedPlayer` object by spreading the original `player` properties and replacing the `inventory` with the modified copy.
*   **Returns:** An object `{ success: true, updatedPlayer }` if deduction was successful, or `{ success: false }` if resources were insufficient.

### `addResources(player: Player, resources: ResourceCost[]): Player`

Adds a list of specified resources to the player's inventory.

*   **Parameters:**
    *   `player`: The `Player` object to whose inventory resources will be added.
    *   `resources`: An array of `ResourceCost` objects representing the resources to add.
*   **Behavior:**
    *   Creates a shallow copy of `player.inventory`.
    *   Iterates through the `resources` array. For each `resource`, it adds `resource.quantity` to the `newInventory[resource.itemId]` (or initializes it if the item wasn't present).
*   **Returns:** A new `Player` object with the updated `inventory`.

### `getResourceQuantity(player: Player, itemId: string): number`

Retrieves the current quantity of a specific resource item in the player's inventory.

*   **Parameters:**
    *   `player`: The `Player` object.
    *   `itemId`: The ID of the resource item to query.
*   **Returns:** The quantity of the specified `itemId` in `player.inventory`. Returns `0` if the item is not found.

### `canAffordResource(player: Player, itemId: string, quantity: number): boolean`

A convenience function to check if the player has at least a certain quantity of a single resource item.

*   **Parameters:**
    *   `player`: The `Player` object.
    *   `itemId`: The ID of the resource item.
    *   `quantity`: The required quantity.
*   **Returns:** `true` if `getResourceQuantity(player, itemId)` is greater than or equal to `quantity`; `false` otherwise.

### `calculateTotalCosts(costs: ResourceCost[]): Record<string, number>`

Aggregates a list of `ResourceCost` objects, which may contain multiple entries for the same `itemId`, into a single record summarizing the total quantity needed for each unique item.

*   **Parameters:**
    *   `costs`: An array of `ResourceCost` objects.
*   **Behavior:**
    *   Initializes an empty object `totalCosts`.
    *   Iterates through the input `costs` array. For each `cost`, it adds `cost.quantity` to `totalCosts[cost.itemId]`, accumulating the total for each item.
*   **Returns:** A `Record<string, number>` where keys are `itemId`s and values are their summed quantities from the input list.

## `ResourceManagerUtils`

This object serves as the public API for the module, centralizing all resource management utilities:
```typescript
export const ResourceManagerUtils = {
  checkResources,
  deductResources,
  addResources,
  getResourceQuantity,
  canAffordResource,
  calculateTotalCosts,
};
```
This module is a foundational component for game systems involving resource expenditure or acquisition, such as crafting, spell casting, shop interactions, or quest rewards.
