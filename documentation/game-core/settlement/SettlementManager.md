# `game-core/settlement/SettlementManager.ts`

## 1. Purpose

The `SettlementManager.ts` module is designed to handle all player interactions that occur within game settlements. This includes activities like trading with shops (buying and selling items), utilizing various services offered in settlements (e.g., taverns, training grounds), interacting with Non-Player Characters (NPCs), and managing the player's reputation with different settlements. It aims to centralize the logic for these common town-based activities.

## 2. Functionality

The module provides the following key functionalities:

*   **Item Trading:**
    *   Allows the player to purchase items from shops, deducting gold and adding items to their inventory.
    *   Allows the player to sell items from their inventory to shops, adding gold and removing items.
*   **Service Utilization:**
    *   Provides a mechanism for players to purchase services within a settlement, deducting gold. (Specific service effects are marked as TODO).
*   **Pre-Transaction Checks:**
    *   Functions to check if the player can afford a purchase.
    *   Functions to check if the player has enough of an item to sell.
*   **Information Retrieval:**
    *   Functions to get the player's current gold amount and the quantity of a specific item in their inventory.
*   **Reputation Management (Planned):**
    *   Includes a function placeholder for applying reputation changes with a settlement. (Marked as TODO).
*   **Availability Checks (Planned):**
    *   Includes function placeholders for checking if specific shops or services are available based on player level or progress. (Marked as TODO).
*   **Settlement Information (Planned):**
    *   Includes function placeholders to list available shops and services for a given settlement. (Marked as TODO).

## 3. File Contents

The file consists of several interfaces, a collection of exported utility functions, and a main exported object `SettlementManagerUtils` that groups these functions.

### Interfaces

*   **`PurchaseResult`**:
    *   `success: boolean`: Indicates if the purchase or sale was successful.
    *   `updatedPlayer?: Player`: The player object with updated gold and inventory, if the transaction was successful.
    *   `error?: string`: An error message if the transaction failed.
    *   `message?: string`: A success message if the transaction was completed.

*   **`ServiceResult`**:
    *   `success: boolean`: Indicates if the service purchase was successful.
    *   `updatedPlayer?: Player`: The player object with updated gold, if successful.
    *   `error?: string`: An error message if the purchase failed.
    *   `message?: string`: A success message.

### Exported Functions

*   `purchaseItem(player: Player, itemId: string, price: number, quantity: number): PurchaseResult`: Handles buying items.
*   `purchaseService(player: Player, serviceId: string, price: number): ServiceResult`: Handles purchasing services.
*   `sellItem(player: Player, itemId: string, price: number, quantity: number): PurchaseResult`: Handles selling items.
*   `canAffordPurchase(player: Player, price: number, quantity: number): boolean`: Checks if the player has enough gold for a purchase.
*   `canSellItem(player: Player, itemId: string, quantity: number): boolean`: Checks if the player has enough of an item to sell.
*   `getPlayerGold(player: Player): number`: Returns the player's current gold.
*   `getItemQuantity(player: Player, itemId: string): number`: Returns the quantity of a specific item in the player's inventory.
*   `applyReputationChange(player: Player, settlementId: string, reputationChange: number): Player`: Placeholder for reputation changes.
*   `isShopAvailable(player: Player, shopId: string): boolean`: Placeholder for checking shop availability.
*   `isServiceAvailable(player: Player, serviceId: string): boolean`: Placeholder for checking service availability.
*   `getAvailableShops(settlementId: string): string[]`: Placeholder for listing shops in a settlement.
*   `getAvailableServices(settlementId: string): string[]`: Placeholder for listing services in a settlement.

### Main Export

*   **`SettlementManagerUtils`**: An object that bundles all the exported functions for easy importation and use by other modules.

## 4. Types and Interfaces (Detailed)

### `PurchaseResult`
This interface is used as the return type for operations involving buying or selling items.
*   `success: boolean`: A mandatory boolean flag. `true` if the transaction (buy or sell) was completed successfully, `false` otherwise (e.g., insufficient gold, not enough items to sell).
*   `updatedPlayer?: Player`: An optional `Player` object. If the transaction was successful, this field should contain the player's state *after* the transaction (e.g., gold adjusted, inventory updated). It's optional to allow for returning just `{ success: false }` on failure without needing a player object.
*   `error?: string`: An optional string. If `success` is `false`, this field should contain a user-friendly error message explaining why the transaction failed.
*   `message?: string`: An optional string. If `success` is `true`, this field can contain a message confirming the transaction (e.g., "Purchased 5x Health Potion for 50 gold!").

### `ServiceResult`
This interface is used as the return type for operations involving the purchase of services.
*   `success: boolean`: Similar to `PurchaseResult`, indicates the success or failure of the service purchase.
*   `updatedPlayer?: Player`: Similar to `PurchaseResult`, the player's state after paying for the service. Effects of the service itself (beyond gold deduction) are noted as a TODO in the `purchaseService` function.
*   `error?: string`: An error message if the service could not be purchased (e.g., insufficient gold).
*   `message?: string`: A success message confirming the service purchase.

## 5. Refactoring Guide & Potential Improvements

The `SettlementManager.ts` module provides a good foundation for settlement interactions, but several areas are marked with `// TODO:` comments and offer opportunities for refactoring or enhancement as the game develops.

### Addressing TODOs:

1.  **`purchaseService(serviceId: string, ...)`**:
    *   **Current:** Only deducts gold.
    *   **Refactor:** Implement a switch-case or a more data-driven approach (e.g., a service registry) to handle the specific effects of different `serviceId`s. This might involve:
        *   Healing the player (e.g., resting at an inn).
        *   Applying temporary buffs.
        *   Granting information or quest progression.
        *   Modifying player stats or skills (e.g., training).
        *   The `ServiceResult` might need to be expanded to reflect varied outcomes, or this function might need to call other managers (e.g., `PlayerStatsManager`, `StatusEffectManager`).

2.  **`applyReputationChange(settlementId: string, ...)`**:
    *   **Current:** Returns the player unchanged.
    *   **Refactor:**
        *   The `Player` type needs a field to store reputation, likely a record: `reputation: Record<string, number>`.
        *   This function should then update `player.reputation[settlementId]` by `reputationChange`.
        *   Consider adding clamps for min/max reputation levels.

3.  **`isShopAvailable(shopId: string, ...)` / `isServiceAvailable(serviceId: string, ...)`**:
    *   **Current:** Always return `true`.
    *   **Refactor:** Implement actual logic. This could depend on:
        *   Player level.
        *   Quest completion.
        *   Game progression flags.
        *   Reputation with the settlement.
        *   A master list of shops/services and their unlock conditions would be needed.

4.  **`getAvailableShops(settlementId: string)` / `getAvailableServices(settlementId: string)`**:
    *   **Current:** Return fixed default arrays.
    *   **Refactor:**
        *   Define data structures that map `settlementId`s to lists of their specific shops and services.
        *   These functions should then look up the `settlementId` and return the appropriate list.
        *   Optionally, combine with `isShopAvailable`/`isServiceAvailable` to filter the list based on player progress before returning.

### General Improvements:

1.  **Item Validation:**
    *   In `purchaseItem` and `sellItem`, the `itemId` is used directly. Consider validating it against a master item definition list (similar to `MASTER_ITEM_DEFINITIONS` used elsewhere) to ensure the item exists and is tradeable. This prevents potential errors if an invalid `itemId` is passed.

2.  **Pricing Models:**
    *   Currently, `price` is passed directly into functions. For more dynamic economies:
        *   Prices could be stored in a data structure associated with each shop or settlement.
        *   Prices could be influenced by player reputation, bartering skills, or game events.

3.  **Error Handling:**
    *   Error messages are simple strings (e.g., "Not enough gold!").
    *   **Refactor:** Consider using more structured error objects or error codes, which can be more easily handled and localized by the UI or other systems.

4.  **State Management Paradigm:**
    *   Functions like `purchaseItem`, `sellItem`, and `purchaseService` directly create and return an `updatedPlayer` object. This is a common and straightforward approach.
    *   **Consideration for larger systems:** If the game uses a more centralized state management pattern (like Redux or a similar flux-like architecture with immutable state), these functions might instead be designed to return only the *changes* or *events* (e.g., `{ type: 'DEDUCT_GOLD', amount: 50 }`, `{ type: 'ADD_ITEM_TO_INVENTORY', itemId: 'potion', quantity: 1 }`). A central reducer would then apply these changes to the state. This is not a necessary refactor for all project sizes but is a common pattern for larger, more complex applications.

5.  **Extensibility of Services:**
    *   The `purchaseService` function is a key point for extensibility. Using a registry pattern where services can be defined and their effects implemented in separate modules could make adding new services cleaner.

6.  **Magic Strings for IDs:**
    *   IDs like `'general_store'`, `'rest'` are used.
    *   **Consideration:** For larger projects, defining these as constants or enums can improve type safety and reduce the risk of typos.

By addressing the TODOs and considering these improvements, the `SettlementManager` can become a more robust and flexible component of the game.I have read the content of `game-core/settlement/SettlementManager.ts` and the plan for the documentation. I will now create the detailed markdown documentation file `/documentation/game-core/settlement/SettlementManager.md`.
