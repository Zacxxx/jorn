
# Jorn Gameplay: Item System

Items in Jorn, encompassing both Consumables and Equipment, are vital for a hero's survival, enhancement, and tactical flexibility. This document outlines the generation, utilization, and management of these items.

## 1. Item Generation (Item Crafting)

Players can craft unique items using an AI-assisted process, allowing for a wide variety of useful gear and single-use effects.

### 1.1. Initiation
-   **Access:** Players access item crafting primarily through the "Crafting Hub," which is usually available from the game's main footer menu.
-   **Item Type Selection:** Within the Crafting Hub, players choose whether they want to craft a "Consumable" (e.g., potions, elixirs, enchanted food) or "Equipment" (e.g., weapons, armor, accessories).
-   **Prompt Input:** Based on the selected type, a form ("Describe Consumable Idea" or "Describe Equipment Idea") is presented. The player enters a textual description of the item they wish to create (e.g., for a Consumable: "A potion that grants temporary fire resistance," for Equipment: "A sword that crackles with lightning").

### 1.2. AI-Powered Generation
-   Upon submission, the player's prompt is sent to the Gemini AI model via specific service functions:
    *   `generateConsumable` for Consumable items.
    *   `generateEquipment` for Equipment items.
-   The AI processes the prompt along with a detailed system instruction outlining the expected JSON output format, field constraints, and balance considerations for the chosen item type.

-   **Generated Properties for Consumables (`GeneratedConsumableData`):**
    *   `name`: A creative and concise name for the consumable.
    *   `description`: Flavorful text describing the item and its general purpose.
    *   `iconName`: A `SpellIconName` selected from `AVAILABLE_ITEM_ICONS` to visually represent the consumable.
    *   `effectType`: A `ConsumableEffectType` (e.g., 'HP_RESTORE', 'MP_RESTORE', 'EP_RESTORE', 'CURE_STATUS', 'APPLY_BUFF').
    *   `magnitude` (Optional): The strength of the effect (e.g., amount of HP restored, stat increase for a buff).
    *   `duration` (Optional): How many turns a buff effect lasts.
    *   `statusToCure` (Optional): If `effectType` is 'CURE_STATUS', the specific `StatusEffectName` it removes.
    *   `buffToApply` (Optional): If `effectType` is 'APPLY_BUFF', the specific `StatusEffectName` it grants.
    *   `resourceCost` (Optional): An array of `ResourceCost` objects required to craft the consumable.

-   **Generated Properties for Equipment (`GeneratedEquipmentData`):**
    *   `name`: A distinctive name for the equipment.
    *   `description`: Descriptive text highlighting the equipment's nature or appearance.
    *   `iconName`: A `SpellIconName` from `AVAILABLE_ITEM_ICONS`, often related to the equipment's slot (e.g., 'SwordHilt', 'Breastplate').
    *   `slot`: A generic `EquipmentSlot` (e.g., 'Weapon', 'Armor', 'Accessory') that the AI targets.
    *   `statsBoost`: An object detailing passive stat increases (`body`, `mind`, `reflex`, `speed`, `maxHp`, `maxMp`, `maxEp`).
    *   `resourceCost` (Optional): An array of `ResourceCost` objects for crafting.

-   **Validation:** The AI's raw JSON output is parsed and validated:
    *   Numeric values (like magnitude, duration, stat boosts) are clamped to reasonable game-balanced ranges.
    *   `iconName` is defaulted if an invalid one is provided.
    *   `resourceCost` amounts and types are validated against `AVAILABLE_RESOURCES` and game limits (e.g., max 3 types, 1-5 quantity).

### 1.3. Confirmation & Crafting
-   **Review:** The player is shown the AI-generated item details on an "Item Craft Confirmation" screen. This includes all properties and the `resourceCost`.
-   **Resource Check:** The system verifies if the player possesses the necessary resources in `player.inventory`.
-   **Decision:**
    *   **Confirm:** If resources are sufficient and the player confirms, the `resourceCost` is deducted. The `GeneratedConsumableData` or `GeneratedEquipmentData` is converted into a full `Consumable` or `Equipment` object (assigning a unique `id` and `itemType`). This new `GameItem` is added to the player's item list (`player.items`).
    *   **Cancel:** The player can cancel, and the AI's suggestion is discarded without cost.
-   **Outcome:** Successfully crafted items are added to the player's inventory, ready for use or equipping.

```typescript
// Relevant Type: GameItem (Union Type)
export type GameItem = Consumable | Equipment;

// Relevant Type: Consumable
export interface Consumable {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  itemType: 'Consumable';
  effectType: ConsumableEffectType;
  magnitude?: number;
  duration?: number;
  statusToCure?: StatusEffectName;
  buffToApply?: StatusEffectName;
  resourceCost?: ResourceCost[];
}

// Relevant Type: Equipment
export interface Equipment {
  id: string;
  name: string;
  description: string;
  iconName: SpellIconName;
  itemType: 'Equipment';
  slot: EquipmentSlot; // Generic slot for AI generation
  statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>;
  resourceCost?: ResourceCost[];
}

// Other relevant types:
// GeneratedConsumableData, GeneratedEquipmentData, ItemType, ConsumableEffectType,
// EquipmentSlot, DetailedEquipmentSlot, ResourceCost, ResourceType
```

## 2. Using Items

Items serve various purposes, from in-combat aid to passive character enhancement.

### 2.1. Inventory Management
-   **Storage:**
    *   Crafting resources (`ResourceType`) are stored with their quantities in `player.inventory`.
    *   Crafted items (`GameItem` objects: `Consumable` or `Equipment`) are stored in the `player.items` array.
-   **Access:** The player manages their items and resources via the "Inventory" tab in the Character Sheet.
-   **Interface:**
    *   The inventory UI typically displays items in a grid.
    *   **Filtering:** Players can filter the view by item type ('All', 'Consumable', 'Equipment', 'Resource').
    *   **Searching:** A search bar allows players to find items by name.
    *   **Tooltips:** Hovering over an item or resource in the grid displays a detailed tooltip with its properties.
    *   **Detail View:** Clicking an item can open a modal showing its full card and details.
-   **Limits:** There's generally no hard limit on the number of distinct item types or resources a player can possess, only stack limits for resources if applicable (not explicitly defined currently but common in RPGs).

### 2.2. Consuming Items (Consumables)
-   **Usage:** Consumables are single-use items.
-   **In Combat:**
    *   During their turn, players can select a "Items" action category, which lists available consumables.
    *   Selecting a consumable triggers its effect immediately.
    *   The action is logged in the combat log.
-   **Out of Combat:** (If implemented) Consumables might be usable from the inventory screen for effects like healing outside of battle.
-   **Effects Application:**
    *   `HP_RESTORE`, `MP_RESTORE`, `EP_RESTORE`: The player's respective stat is increased by `magnitude`, capped at `maxHp/maxMp/maxEp`.
    *   `CURE_STATUS`: If `statusToCure` is specified, that active status effect is removed from the player.
    *   `APPLY_BUFF`: If `buffToApply`, `duration`, and `magnitude` are specified, a new active status effect is added to the player.
-   **Removal:** Once used, the consumable is removed from the `player.items` array.

### 2.3. Equipping Items (Equipment)
-   **Mechanism:** Equipment items provide passive benefits by being worn by the player.
-   **Character Sheet:**
    *   The "Main" tab of the Character Sheet displays a "paper doll" interface with various `DetailedEquipmentSlot`s (e.g., 'Head', 'Chest', 'WeaponLeft', 'Accessory1').
    *   Clicking an empty slot opens a sub-modal listing compatible equipment from `player.items` that are not already equipped.
    *   Clicking an equipped item in a slot unequips it, returning it to the general `player.items` pool.
-   **`player.equippedItems`:** This object maps `DetailedEquipmentSlot`s to the `id` of the equipped `GameItem` (or `null` if empty).
-   **Stat Impact:** When equipment is equipped or unequipped, the `calculateEffectiveStats` function is triggered. The `statsBoost` property of equipped items modifies the player's base stats (Body, Mind, Reflex) and derived stats (MaxHP, MaxMP, MaxEP, Speed, etc.).
-   **Compatibility:** The `GENERIC_TO_DETAILED_SLOT_MAP` constant helps determine which generic `EquipmentSlot` (generated by AI) can fit into which `DetailedEquipmentSlot` (used in UI). For example, an AI-generated 'Weapon' can be equipped in 'WeaponLeft' or 'WeaponRight'.

## 3. Item Properties & Data

-   Items are defined by the `Consumable` and `Equipment` interfaces in `types.ts`.
-   **Key `Consumable` properties:**
    *   `effectType`: Determines the primary action of the item.
    *   `magnitude`, `duration`, `statusToCure`, `buffToApply`: Define the specifics of the effect.
-   **Key `Equipment` properties:**
    *   `slot`: Generic category for AI generation and basic categorization.
    *   `statsBoost`: The core benefit of wearing the equipment.
-   **Shared properties:**
    *   `id`, `name`, `description`, `iconName`: For identification and presentation.
    *   `itemType`: Distinguishes 'Consumable' from 'Equipment'.
    *   `resourceCost`: For crafting.
-   **Visuals:** `iconName` and `GetSpellIcon` provide visual cues. Icons are often chosen from `AVAILABLE_ITEM_ICONS` which include `PotionHP`, `SwordHilt`, `Breastplate`, etc.

## 4. Key Files Involved in the Item System

The item system's functionality is distributed across several key files:

-   **`types.ts`**:
    *   Defines `ItemType`, `ConsumableEffectType`, `EquipmentSlot`, `DetailedEquipmentSlot`.
    *   Defines the `Consumable`, `Equipment`, and `GameItem` (union) interfaces.
    *   Defines `GeneratedConsumableData` and `GeneratedEquipmentData` for AI interactions.
    *   Contains `ResourceType`, `ResourceCost` used for crafting.
    *   `Player` interface includes `inventory: Record<ResourceType, number>`, `items: GameItem[]`, and `equippedItems: Partial<Record<DetailedEquipmentSlot, string | null>>`.

-   **`constants.ts`**:
    *   `AVAILABLE_ITEM_ICONS`: List of icons suitable for items.
    *   `CONSUMABLE_EFFECT_TYPES`, `AVAILABLE_EQUIPMENT_SLOTS`: Constrain AI generation and define item behaviors.
    *   `RESOURCE_ICONS`: Maps resource types to icons.
    *   `INITIAL_PLAYER_INVENTORY`, `AVAILABLE_RESOURCES`: Define starting resources and possible types.
    *   `DETAILED_EQUIPMENT_SLOTS_LEFT_COL`, `DETAILED_EQUIPMENT_SLOTS_RIGHT_COL`, `DETAILED_SLOT_PLACEHOLDER_ICONS`, `GENERIC_TO_DETAILED_SLOT_MAP`: For Character Sheet paper doll UI and equipment slot logic.

-   **`services/geminiService.ts`**:
    *   `generateConsumable`: Creates prompts for Gemini API for consumables, sends requests, validates and processes responses into `GeneratedConsumableData`.
    *   `generateEquipment`: Similar to `generateConsumable` but for `GeneratedEquipmentData`.
    *   Includes validation for resource costs and generated item properties.

-   **`App.tsx`**:
    *   Manages player state related to items (`player.items`, `player.inventory`, `player.equippedItems`).
    *   Handles core logic for item crafting (`handleInitiateItemCraft`, `handleConfirmItemCraft`).
    *   Manages equipping/unequipping items (`handleEquipItem`, `handleUnequipItem`) and updates `effectiveStats`.
    *   Implements logic for using consumables (`handleUseConsumable`) and applying their effects in combat.
    *   Controls UI flow related to item crafting and inventory management states (e.g., `ITEM_CRAFTING`, `ITEM_CRAFT_CONFIRMATION`, `CHARACTER_SHEET` with 'Inventory' tab).
    *   `checkResources` and `deductResources` are used for crafting.

-   **`components/CraftingHubModal.tsx`**:
    *   Provides the UI for selecting between Consumable or Equipment crafting.
    *   Contains or conditionally renders `ItemCraftingForm`.
    *   Triggers `handleInitiateItemCraft` in `App.tsx`.

-   **`components/ItemCraftingForm.tsx`**:
    *   UI for players to input their item idea prompt (for either Consumable or Equipment).

-   **`components/ConfirmationView.tsx`**:
    *   Displays AI-generated item details for player review before crafting.
    *   Shows resource costs and checks affordability.
    *   Calls `handleConfirmItemCraft` in `App.tsx`.

-   **`components/CharacterSheetModal.tsx`**:
    *   **"Inventory" Tab:** Displays all `GameItem`s and resources. Allows filtering, searching, and viewing item details. This is where items might be selected for equipping.
    *   **"Main" Tab:** Displays the paper doll UI for `player.equippedItems`, showing currently worn gear. Interacts with `handleEquipItem` and `handleUnequipItem`.

-   **`components/CombatView.tsx`**:
    *   Allows players to select and use `Consumable` items from their inventory during their turn via an "Items" action category.
    *   Calls `onUseConsumable` in `App.tsx`.

-   **`components/IconComponents.tsx`**:
    *   `GetSpellIcon` is used to render icons for items based on their `iconName`.
    *   Contains SVG definitions for all item-related icons.
```

This documentation for the item system, located in `gameplay-systems/items/gameplay-items.md`, should provide a solid foundation for understanding and iterating on this aspect of Jorn.