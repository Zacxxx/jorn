# `game-core/spells/SpellCrafting.ts`

## 1. Purpose

The `SpellCrafting.ts` module is central to the game's dynamic generation and modification of learnable abilities and equippable assets. It orchestrates the processes of designing new spells using various components, confirming their creation, refining existing spells, crafting player traits, and initiating the crafting of items like consumables and equipment. A key characteristic of this module is its heavy reliance on an external AI service (e.g., `geminiService`) to generate the detailed properties of these entities based on player inputs and design choices.

## 2. Functionality

The module provides the following core functionalities:

*   **Spell Design & Creation:**
    *   `finalizeSpellDesign`: Takes player-defined spell design parameters (components, resources, descriptions) and interacts with an AI service to generate detailed spell data. It also calculates and validates component usage costs (gold/essence).
    *   `confirmSpellCraft`: Takes the AI-generated spell data, deducts all associated resource costs (including component usage costs), and adds the newly crafted spell to the player's spell list.
*   **Spell Refinement:**
    *   `initiateSpellRefinement`: Allows players to modify an existing spell by providing refinement instructions. It can optionally include an "augment level" (costing essence) to increase power or integrate a new spell component into the spell. It calls an AI service to get the new spell characteristics.
    *   `confirmSpellEdit`: Applies the changes from the AI-generated refined spell data to the original spell in the player's spell list, after deducting any final resource costs.
*   **Trait Crafting:**
    *   `craftTrait`: Enables players to craft new traits by providing a descriptive prompt. It uses an AI service to generate the trait's properties and adds it to the player's trait list.
*   **Item Crafting Initiation:**
    *   `initiateItemCraft`: Allows players to describe an item (consumable or equipment) they wish to craft. It calls an AI service to generate the item's data and resource costs. The actual confirmation and addition of the item to inventory are likely handled by a different module (e.g., `ItemManagement.ts`).

## 3. File Contents

The file defines several interfaces for structuring data and results, a collection of exported asynchronous and synchronous functions that implement the crafting logic, and a main exported object `SpellCraftingUtils` that groups these functions.

### Interfaces

*   **`SpellDesignData`**:
    *   `level: number`: Player's current level, used as input for AI generation.
    *   `componentsUsed: Array<{ componentId: string; configuration: Record<string, string | number> }>`: List of spell components and their specific configurations chosen by the player.
    *   `investedResources: ResourceCost[]`: Resources invested by the player into the spell's design (distinct from component usage costs or final crafting costs).
    *   `playerName?: string`, `playerDescription?: string`, `playerIcon?: SpellIconName`, `playerPrompt?: string`: Optional player inputs to guide AI generation.

*   **`SpellCraftResult`**:
    *   `success: boolean`: True if spell crafting was successful.
    *   `spell?: Spell`: The newly crafted `Spell` object.
    *   `updatedPlayer?: Player`: The player state after resource deduction and spell addition.
    *   `error?: string`: Error message if crafting failed.

*   **`SpellEditResult`**:
    *   `success: boolean`: True if spell editing and confirmation were successful.
    *   `spell?: Spell`: The updated `Spell` object.
    *   `updatedPlayer?: Player`: The player state after resource deduction and spell modification.
    *   `error?: string`: Error message if editing failed.

*   **`TraitCraftResult`**:
    *   `success: boolean`: True if trait crafting was successful.
    *   `trait?: Trait`: The newly crafted `Trait` object.
    *   `updatedPlayer?: Player`: The player state after trait addition.
    *   `error?: string`: Error message if trait crafting failed.

*   **`ItemCraftResult`**:
    *   `success: boolean`: True if item data generation was successful.
    *   `itemData?: GeneratedConsumableData | GeneratedEquipmentData`: The AI-generated data for the potential item (consumable or equipment).
    *   `error?: string`: Error message if item data generation failed.

### Exported Functions

*   `finalizeSpellDesign(player: Player, designData: SpellDesignData): Promise<{ success: boolean; spellData?: GeneratedSpellData & { _componentUsageGoldCost?, _componentUsageEssenceCost? }; error? }>`
*   `confirmSpellCraft(player: Player, pendingSpellData: GeneratedSpellData & { _componentUsageGoldCost?, _componentUsageEssenceCost? }): SpellCraftResult`
*   `initiateSpellRefinement(player: Player, originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string): Promise<{ success: boolean; spellData?: GeneratedSpellData; updatedPlayer?: Player; error? }>`
*   `confirmSpellEdit(player: Player, originalSpell: Spell, pendingSpellData: GeneratedSpellData): SpellEditResult`
*   `craftTrait(player: Player, promptText: string): Promise<TraitCraftResult>`
*   `initiateItemCraft(promptText: string, itemType: ItemType, playerLevel: number): Promise<ItemCraftResult>`

### Main Export

*   **`SpellCraftingUtils`**: An object that bundles all the exported functions for use by other modules.

## 4. Types and Interfaces (Detailed)

*   **`SpellDesignData`**: This interface captures all the inputs a player provides when designing a new spell in the "Spell Design Studio." It includes the player's level (influencing power), the specific spell components they've chosen along with any configurations for those components, any general resources they're investing, and optional textual or iconic prompts to guide the AI in generating the spell's theme, name, and effects.

*   **`SpellCraftResult`, `SpellEditResult`, `TraitCraftResult`**: These interfaces follow a common pattern for returning the outcome of an operation. The `success` flag is paramount. If `true`, they include the newly created or modified entity (`spell` or `trait`) and the `updatedPlayer` object reflecting any consumed resources or additions to their abilities. If `false`, an `error` string explains the failure.

*   **`ItemCraftResult`**: This is specific to the *initiation* phase of item crafting. A successful result here means the AI has generated the data (`itemData`) for a potential consumable or piece of equipment, including its prospective stats and resource costs. The actual crafting confirmation and addition to player inventory would typically occur in a subsequent step, likely managed by a different module (e.g., `ItemManagement.ts`).

*   **`GeneratedSpellData`, `GeneratedConsumableData`, `GeneratedEquipmentData`, `Trait`**: These are imported types representing the structured data returned by the AI service for spells, consumables, equipment, and traits, respectively. They contain all the detailed attributes of the generated entities. The `GeneratedSpellData` is augmented with internal `_componentUsageGoldCost` and `_componentUsageEssenceCost` fields during the `finalizeSpellDesign` step.

## 5. Refactoring Guide & Potential Improvements

The `SpellCrafting.ts` module's heavy reliance on external AI services (`geminiService`) is its most defining characteristic and also a primary area for consideration during refactoring or future development.

### AI Service Interaction:

1.  **Reliability & Cost:** The success of this module is directly tied to the performance, reliability, and potential cost of the `geminiService` calls (`generateSpellFromDesign`, `editSpell`, etc.). Any issues with the AI service will directly impact spell, trait, and item generation. Error handling for AI service unavailability or unexpected responses should be robust.
2.  **Prompt Engineering:** The quality of generated entities will heavily depend on how well the `playerDescription`, `playerPrompt`, and component data are translated into effective prompts for the AI. This is an ongoing area for refinement.
3.  **Transparency of AI:** Consider how much of the AI's decision-making process is exposed to the player. While full transparency is likely too complex, providing some insight into *why* a spell got certain stats based on inputs could be beneficial.

### Resource Management:

1.  **Two-Step Cost Deduction (Spells):**
    *   `finalizeSpellDesign`: Calculates and validates `_componentUsageGoldCost` and `_componentUsageEssenceCost`.
    *   `confirmSpellCraft`: Deducts these component costs *and* any final `pendingSpellData.resourceCost` (which might be determined by the AI based on overall power).
    *   **Clarity:** This two-step process is logical (pay for components, then pay for final enchantment) but must be clearly communicated to the player in the UI to avoid confusion.
2.  **Essence Cost for Augmentation (`initiateSpellRefinement`):**
    *   Essence for `augmentLevel` is deducted *before* the `editSpell` AI call. If the AI call fails, the player loses this essence.
    *   **Suggestion:** Consider if this is the desired behavior. An alternative would be to calculate the AI-refined spell first and then present the total cost (refinement cost + augment cost) for confirmation, similar to the new spell crafting flow. This would prevent resource loss on AI failure.
    *   The augment cost (`augmentLevel * 10`) is hardcoded. This could be made a configurable constant or a more complex formula.

### Object Creation and Data Flow:

1.  **ID Generation:** IDs like `spell-${Date.now()}` and `trait-${Date.now()}` are simple and generally effective for client-side uniqueness but might not be universally unique if data were ever merged from multiple clients without a proper UUID system.
2.  **`getScalingFactorFromRarity`:** This utility is consistently used for spells, traits, (and likely items via `ItemManagement.ts`). This indicates a good, centralized approach to rarity-to-power scaling.
3.  **Underscore Prefixed Fields:** Fields like `_componentUsageGoldCost` in `GeneratedSpellData` correctly indicate they are intermediate values primarily for internal use between `finalizeSpellDesign` and `confirmSpellCraft`.

### Error Handling:

1.  **String-Based Errors:** Current error messages are strings.
    *   **Suggestion:** For more sophisticated error handling in the UI or for logging, consider using structured error objects or error codes. This allows for easier localization and more specific error recovery or display logic.

### Modularity:

1.  **Scope:** The module currently handles AI-driven generation for spells, traits, and the *initiation* of item crafting.
    *   **Item Crafting:** If item crafting (especially the confirmation and detailed effect generation beyond basic stats) becomes very complex, its AI interaction logic might warrant being moved to a more specialized item crafting module. However, keeping the AI *initiation* part here is reasonable if the prompt engineering and AI service calls are similar to those for spells and traits.
2.  **Separation of AI Interaction:** The direct calls to `geminiService` are spread throughout the module.
    *   **Alternative:** Consider creating a dedicated `AIServiceAdapter` module that wraps all calls to `geminiService`. `SpellCrafting.ts` would then call this adapter. This can make it easier to swap out the AI service, mock it for testing, or add common pre/post-processing to all AI calls (like standardized error handling or request formatting).

### Validation:

1.  **Spell Collection Limit:** The check in `finalizeSpellDesign` against `calculateMaxRegisteredSpells` is a good validation to prevent players from exceeding their spell limits.
2.  **Resource Checks:** Consistent use of `checkResources` and `deductResources` (from `ResourceManager`) is good practice.

By focusing on robust interaction with the AI service, clear resource management for the player, and potentially enhancing error handling and modularity, the `SpellCrafting.ts` module can be made even more powerful and maintainable.
