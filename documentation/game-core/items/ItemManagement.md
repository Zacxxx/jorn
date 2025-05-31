# `game-core/items/ItemManagement.ts`

## Purpose

The `ItemManagement.ts` module provides a suite of functions to handle various aspects of item interactions for the player. This includes the confirmation step of item crafting (consuming resources and adding the item to inventory), equipping and unequipping gear, and managing the preparation (readying for use) and unpreparation of spells and abilities.

## External Dependencies

This module relies on several external utilities and services:

*   **`../../utils`**:
    *   `getScalingFactorFromRarity`: A utility to determine an item's scaling factor based on its rarity level.
*   **`../resources/ResourceManager`**:
    *   `checkResources`: Function to verify if the player possesses the required resources for an action (e.g., crafting).
    *   `deductResources`: Function to remove specified resources from the player's inventory.
*   **`../player/PlayerStats`**:
    *   `calculateMaxPreparedSpells`: Function to determine the maximum number of spells a player can have prepared at their current level.
    *   `calculateMaxPreparedAbilities`: Similar to above, but for abilities.

## Key Interfaces

### `ItemCraftConfirmResult`
Defines the outcome of confirming an item craft.
*   `success`: Boolean, true if crafting was successful.
*   `item?`: Optional `GameItem` object representing the newly crafted item.
*   `updatedPlayer?`: Optional `Player` object reflecting changes post-crafting.
*   `error?`: Optional string containing an error message if crafting failed.

### `EquipmentResult`
Defines the outcome of equipping or unequipping an item.
*   `success`: Boolean.
*   `updatedPlayer?`: Optional `Player` object.
*   `error?`: Optional error message.

### `SpellPreparationResult`
Defines the outcome of preparing or unpreparing a spell or ability. (Note: The interface name might be more generic like `PreparationResult` as it's used for both spells and abilities).
*   `success`: Boolean.
*   `updatedPlayer?`: Optional `Player` object.
*   `error?`: Optional error message.

## Core Functionality

All primary functions are exported via the `ItemManagementUtils` object.

### Item Crafting

*   **`confirmItemCraft(player: Player, pendingItemData: GeneratedConsumableData | GeneratedEquipmentData): ItemCraftConfirmResult`**
    1.  Validates `pendingItemData`.
    2.  Determines `itemTypeCrafted` ('Equipment' or 'Consumable') based on whether `pendingItemData` includes a `slot` property.
    3.  Uses `checkResources` to ensure the player has `pendingItemData.resourceCost`.
    4.  Calls `deductResources` to consume the crafting costs. If this fails, returns an error.
    5.  Creates a `newItem` object (as `GameItem`), assigning a unique ID (e.g., `itemtype-timestamp`), `itemType`, `rarity`, and `scalingFactor` (using `getScalingFactorFromRarity` if not directly provided).
    6.  Adds the `newItem` to the `player.items` array.
    7.  Returns a success result with the `item` and `updatedPlayer`.

### Equipment Management

*   **`equipItem(player: Player, itemId: string, slot: DetailedEquipmentSlot): EquipmentResult`**
    1.  Finds the `itemToEquip` in `player.items` by `itemId`.
    2.  Validates that the item exists and its `itemType` is 'Equipment'.
    3.  Updates `player.equippedItems` by setting the `slot` property to `itemToEquip.id`.
    4.  Returns a success result with `updatedPlayer`.

*   **`unequipItem(player: Player, slot: DetailedEquipmentSlot): EquipmentResult`**
    1.  Checks if `player.equippedItems[slot]` actually has an item ID.
    2.  Updates `player.equippedItems` by setting the `slot` property to `null`.
    3.  Returns a success result with `updatedPlayer`.

*   **`getEquippedItem(player: Player, slot: DetailedEquipmentSlot): Equipment | undefined`**
    *   Retrieves the item ID from `player.equippedItems[slot]`.
    *   If an ID exists, finds and returns the corresponding `Equipment` item from `player.items`. Otherwise, returns `undefined`.

*   **`isItemEquipped(player: Player, itemId: string): boolean`**
    *   Checks if any of the values in `player.equippedItems` (across all slots) matches the given `itemId`.

*   **`getAllEquippedItems(player: Player): Equipment[]`**
    *   Iterates over the `player.equippedItems` object. For each slot containing an item ID, it retrieves the full item object from `player.items` (if it's of type 'Equipment') and adds it to a list.
    *   Returns an array of all currently equipped `Equipment` items.

### Spell and Ability Preparation

*   **`prepareSpell(player: Player, spell: Spell): SpellPreparationResult`**
    1.  Checks if `player.preparedSpellIds.length` is less than `calculateMaxPreparedSpells(player.level)`.
    2.  Ensures the `spell.id` is not already in `player.preparedSpellIds`.
    3.  If checks pass, adds `spell.id` to `player.preparedSpellIds` (using `Set` to ensure uniqueness then converting back to array).
    4.  Returns a success result with `updatedPlayer`.

*   **`unprepareSpell(player: Player, spell: Spell): SpellPreparationResult`**
    1.  Ensures `spell.id` is currently in `player.preparedSpellIds`.
    2.  If so, filters `spell.id` out of `player.preparedSpellIds`.
    3.  Returns a success result with `updatedPlayer`.

*   **`prepareAbility(player: Player, ability: Ability): SpellPreparationResult`**
    *   Functions identically to `prepareSpell`, but uses `player.preparedAbilityIds` and `calculateMaxPreparedAbilities`.

*   **`unprepareAbility(player: Player, ability: Ability): SpellPreparationResult`**
    *   Functions identically to `unprepareSpell`, but for `player.preparedAbilityIds`.

## `ItemManagementUtils`

This object serves as the public API for the module:
```typescript
export const ItemManagementUtils = {
  confirmItemCraft,
  equipItem,
  unequipItem,
  prepareSpell,
  unprepareSpell,
  prepareAbility,
  unprepareAbility,
  getEquippedItem,
  isItemEquipped,
  getAllEquippedItems,
};
```
It provides a centralized way for other game systems to manage player items, equipment, and prepared skills.
