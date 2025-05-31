# `game-core/crafting/RecipeManager.ts`

## Purpose

The `RecipeManager.ts` module is responsible for all functionalities related to item crafting recipes within the game. This includes systems for players to discover new recipes (potentially through descriptive text prompts), the process of crafting items from known recipes, checking the availability of required ingredients, and identifying any missing components for a specific recipe.

## External Dependencies

This module relies on utility functions from `../../src/utils/recipeUtils.ts`:

*   `discoverRecipeFromPrompt(prompt: string, playerLevel: number)`: This function is expected to take a text prompt and the player's level to generate or find a suitable crafting recipe. The exact mechanism (e.g., AI-based generation, lookup in a predefined list) is abstracted away in `recipeUtils.ts`.
*   `getRecipeById(recipeId: string)`: This function is used to retrieve the detailed information of a specific recipe based on its unique ID.

## Key Interfaces

### `RecipeDiscoveryResult`
Describes the outcome of an attempt to discover a new recipe.
*   `success`: Boolean, true if a recipe was successfully discovered.
*   `message`: String providing feedback to the player.
*   `type`: Literal `'success' | 'error'` categorizing the message.
*   `recipeName?`: Optional string, the name of the discovered recipe.
*   `recipeId?`: Optional string, the unique ID assigned to the discovered recipe.

### `RecipeCraftResult`
Describes the outcome of an attempt to craft an item.
*   `success`: Boolean, true if the item was successfully crafted.
*   `message`: String providing feedback to the player.
*   `type`: Literal `'success' | 'error'` categorizing the message.
*   `resultItemId?`: Optional string, the ID of the item that was crafted.
*   `resultQuantity?`: Optional number, the quantity of the item that was crafted.
*   `updatedInventory?`: Optional `Record<string, number>`, the player's inventory after the crafting operation.

### `RecipeDiscoveryContext`
Defines the necessary context and callbacks for the recipe discovery process.
*   `setPlayer`: Function to update the player's state (e.g., adding a new discovered recipe).
*   `setIsLoading`: Function to toggle a loading indicator in the UI.
*   `setModalContent`: Function to display modal messages (e.g., success or error notifications).

### `RecipeCraftContext`
Similar to `RecipeDiscoveryContext`, providing context and callbacks for the item crafting process.
*   `setPlayer`: Function to update the player's state (e.g., modifying inventory).
*   `setIsLoading`: Function to toggle a loading indicator.
*   `setModalContent`: Function to display modal messages.

## Core Functionality

All primary functions are exported via the `RecipeManagerUtils` object.

### `async discoverRecipe(prompt: string, player: Player, context: RecipeDiscoveryContext): Promise<RecipeDiscoveryResult>`

Handles the discovery of new recipes:

1.  Sets UI loading state to `true` via `context.setIsLoading(true)`.
2.  Calls `discoverRecipeFromPrompt(prompt, player.level)` (from `recipeUtils.ts`) to get a recipe based on the provided `prompt` and `player.level`.
3.  **On Success (recipe name returned):**
    *   Generates a unique `recipeId` (e.g., `recipe-${Date.now()}-${result.name}`).
    *   Updates the player's state by adding the new `recipeId` to `player.discoveredRecipes` using `context.setPlayer`.
    *   Displays a success modal message via `context.setModalContent`.
    *   Returns a `RecipeDiscoveryResult` with `success: true`, the message, recipe name, and ID.
4.  **On Failure (no recipe name returned or error):**
    *   Displays an appropriate error/failure modal message.
    *   Returns a `RecipeDiscoveryResult` with `success: false` and an error message.
5.  The loading state is set to `false` in a `finally` block, ensuring it's always reset.

### `async craftItemFromRecipe(recipeId: string, player: Player, context: RecipeCraftContext): Promise<RecipeCraftResult>`

Manages the crafting of an item from a known recipe:

1.  Sets UI loading state to `true`.
2.  Retrieves recipe details using `getRecipeById(recipeId)` (from `recipeUtils.ts`).
3.  **Validation:**
    *   If the recipe is not found, displays an error modal and returns `success: false`.
    *   Checks if the `player.inventory` contains all `recipe.ingredients` in the required quantities. If not, displays an error modal and returns `success: false`.
4.  **Crafting Process (if validation passes):**
    *   Clones the `player.inventory`.
    *   Deducts each ingredient's quantity from the cloned inventory.
    *   Adds the `recipe.resultItemId` (in `recipe.resultQuantity`) to the cloned inventory.
    *   Updates the player's actual inventory using `context.setPlayer` with the modified inventory.
    *   Displays a success modal.
    *   Returns a `RecipeCraftResult` with `success: true`, details of the crafted item, and the new inventory.
5.  **Error Handling:** Catches any errors during the process, displays an error modal, and returns `success: false`.
6.  The loading state is set to `false` in a `finally` block.

### `canCraftRecipe(recipeId: string, player: Player): boolean`

Checks if a player has the necessary ingredients to craft a given recipe:

1.  Fetches the recipe using `getRecipeById(recipeId)`.
2.  If the recipe doesn't exist, returns `false`.
3.  Iterates through `recipe.ingredients` and checks if `player.inventory[ingredient.itemId] >= ingredient.quantity` for all of them.
4.  Returns `true` if all ingredients are available in sufficient amounts, `false` otherwise.

### `getMissingIngredients(recipeId: string, player: Player): Array<{itemId: string, needed: number, have: number}>`

Identifies which ingredients are missing or insufficient for a given recipe:

1.  Fetches the recipe using `getRecipeById(recipeId)`.
2.  If the recipe doesn't exist, returns an empty array.
3.  Maps through `recipe.ingredients` to create an array of objects, each containing `itemId`, `needed` quantity (from recipe), and `have` quantity (from `player.inventory`).
4.  Filters this array to keep only items where `have < needed`.
5.  Returns the filtered array of missing ingredients.

## `RecipeManagerUtils`

This object serves as a namespace and exports the core functionalities of the module:

```typescript
export const RecipeManagerUtils = {
  discoverRecipe,
  craftItemFromRecipe,
  canCraftRecipe,
  getMissingIngredients,
};
```
This allows other parts of the game to easily integrate with the recipe and crafting system.
