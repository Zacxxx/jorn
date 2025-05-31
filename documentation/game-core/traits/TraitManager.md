# `game-core/traits/TraitManager.ts`

## 1. Purpose

The `TraitManager.ts` module is responsible for managing all aspects of player traits within the game. Traits are unique characteristics or passive abilities that players can acquire to customize their character. This module handles the AI-driven crafting of new traits based on player descriptions, determines the number of trait slots available based on player level, provides information about trait progression, and offers utilities for validating and suggesting trait ideas.

## 2. Functionality

The module provides the following core functionalities:

*   **Trait Crafting:** Allows players to craft new traits by providing a textual prompt. An AI service is used to generate the specifics of the trait based on this prompt and the player's level.
*   **Progression and Slot Management:**
    *   Calculates the maximum number of traits a player can have based on their level and predefined constants (`FIRST_TRAIT_LEVEL`, `TRAIT_LEVEL_INTERVAL`).
    *   Determines if a player is currently eligible to craft a new trait.
    *   Calculates the player level at which the next trait slot will unlock.
    *   Provides a summary of total, used, and available trait slots.
*   **Trait Information & Utilities:**
    *   Checks if a proposed trait name is already in use by the player.
    *   Filters and retrieves player traits by category.
    *   Estimates the general effectiveness of a trait (currently basic, with planned expansion for stat-based scaling).
*   **Player Guidance:**
    *   Suggests trait prompts based on the player's current statistical build (e.g., body, mind, soul focused) and level.
    *   Validates player-written trait prompts for basic issues like length, inappropriate content, or vagueness.

## 3. File Contents

The file defines interfaces for operation results and contextual data, a set of exported functions implementing the trait management logic, and a main exported object `TraitManagerUtils` that groups these functions. It also imports constants related to trait progression.

### Interfaces

*   **`TraitContext`**:
    *   `player: Player`: The current player object.
    *   `setPlayer: (updater: (prev: Player) => Player)`: Function to update the player's state (e.g., adding a new trait).
    *   `setIsLoading: (loading: boolean) => void`: Function to toggle a global loading state, especially during AI calls.
    *   `addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: ...)`: Function to add entries to the game log.
    *   `showMessageModal: (title: string, message: string, type?: ...)`: Function to display modal messages to the player.

*   **`TraitCraftResult`**:
    *   `success: boolean`: True if trait crafting was successful.
    *   `trait?: Trait`: The newly crafted `Trait` object, if successful.
    *   `message: string`: Feedback message for the player.
    *   `type: 'success' | 'error'`: Type of the message.

*   **`TraitSlotInfo`**:
    *   `totalSlots: number`: Total trait slots unlocked at the player's current level.
    *   `usedSlots: number`: Number of traits the player currently possesses.
    *   `availableSlots: number`: Number of empty trait slots.
    *   `nextSlotLevel: number | null`: The player level required to unlock the next trait slot, or `null` if all slots up to a certain cap (e.g., level 100) are unlocked.

### Imported Constants
*   `FIRST_TRAIT_LEVEL` (from `../../constants`): The player level at which the first trait slot becomes available.
*   `TRAIT_LEVEL_INTERVAL` (from `../../constants`): The number of player levels required to unlock each subsequent trait slot after the first.

### External Dependencies
*   `createTraitFromPrompt` (from `../../src/utils/aiUtils`): An asynchronous function expected to call an AI service to generate `Trait` data based on a prompt and player level.

### Exported Functions
*   `craftTrait(promptText: string, context: TraitContext): Promise<TraitCraftResult>`
*   `canCraftTrait(player: Player): boolean`
*   `getMaxTraits(level: number): number`
*   `getNextTraitLevel(player: Player): number | null`
*   `getTraitSlotInfo(player: Player): TraitSlotInfo`
*   `isTraitNameTaken(player: Player, traitName: string): boolean`
*   `getTraitsByCategory(player: Player, category?: string): Trait[]`
*   `getTraitEffectiveness(trait: Trait, player: Player): number`
*   `getSuggestedTraitPrompts(player: Player): string[]`
*   `validateTraitPrompt(prompt: string): { isValid: boolean; issues: string[]; suggestions: string[] }`

### Main Export
*   **`TraitManagerUtils`**: An object that bundles all the exported functions for convenient use.

## 4. Types and Interfaces (Detailed)

### `TraitContext`
This interface provides the necessary environment for trait operations, especially `craftTrait`.
*   `player: Player`: The current state of the player, used to check eligibility, existing traits, and to be updated with new traits.
*   `setPlayer`: The callback function to apply updates to the player's state once a trait is crafted.
*   `setIsLoading`: Used to signal the start and end of potentially long-running asynchronous operations like AI calls.
*   `addLog` and `showMessageModal`: Standard feedback mechanisms to inform the player about the outcome of operations.

### `TraitCraftResult`
Represents the outcome of the `craftTrait` operation.
*   `success: boolean`: A clear indicator of whether the trait was successfully generated and added to the player.
*   `trait?: Trait`: If `success` is `true`, this field contains the newly created `Trait` object. The `Trait` type itself (imported from `../../types`) would define the structure of a trait (e.g., name, description, effects, icon, rarity).
*   `message: string`: A user-facing message describing the result (e.g., "Successfully crafted trait: Quick Learner!").
*   `type: 'success' | 'error'`: Categorizes the message for appropriate UI styling or handling.

### `TraitSlotInfo`
Provides a snapshot of the player's trait slot status.
*   `totalSlots: number`: The maximum number of traits the player is entitled to at their current level.
*   `usedSlots: number`: The number of traits the player currently possesses.
*   `availableSlots: number`: The difference between `totalSlots` and `usedSlots`, indicating how many new traits can be crafted or acquired.
*   `nextSlotLevel: number | null`: Tells the player at what level they will gain their next trait slot. It's `null` if they have reached a predefined maximum progression point for trait slots (e.g., level 100 as per the current code).

## 5. Refactoring Guide & Potential Improvements

The `TraitManager.ts` module effectively uses an AI utility for dynamic trait creation and manages trait progression. Here are areas for consideration:

1.  **AI Service Dependency (`createTraitFromPrompt`):**
    *   **Criticality:** The success of trait crafting is entirely dependent on this external AI call. Its reliability, the quality of its output, and any associated costs are major factors.
    *   **Prompt Engineering:** The effectiveness of the `promptText` in generating desired traits is key. Continuous refinement of how prompts are structured or guided might be necessary.
    *   **Error Handling:** Robustly handle failures or unexpected responses from the AI service. The current `try-catch` is good, but ensure messages to the player are clear if the AI fails.

2.  **Trait Effectiveness (`getTraitEffectiveness`):**
    *   **Current TODO:** The function includes a `// TODO: Implement stat-based effectiveness when trait requirements are defined`. This is a significant unimplemented feature.
    *   **Suggestion:** Define how trait requirements (e.g., minimum Body stat) or scaling (e.g., "Effectiveness increases by X% per Mind point") should be structured within the `Trait` type. Then, implement the logic in this function to calculate effectiveness based on these definitions and the player's current stats. This would make traits feel more integrated with character builds.

3.  **Trait Uniqueness and Naming:**
    *   **`isTraitNameTaken`:** Provides a case-insensitive check for duplicate names.
    *   **Consideration:** If many traits are generated, ensuring truly unique and interesting names might become challenging for the AI. Could the AI be prompted to avoid themes or names already present in `player.traits`? Or, could there be a user-driven renaming step if a collision occurs?

4.  **Prompt Validation (`validateTraitPrompt`):**
    *   **Current:** Basic checks for length and some keywords.
    *   **Suggestion:**
        *   Could be expanded with more sophisticated natural language processing (NLP) checks for clarity or to identify potentially problematic requests if prompts are complex.
        *   If prompts can be seen or shared by other players, integrating a more robust content moderation system/AI might be necessary.
        *   The "suggestions" provided on invalid prompts are helpful and could be expanded.

5.  **Trait Categories:**
    *   **`getTraitsByCategory`:** Relies on a `category` string within the `Trait` type.
    *   **Consideration:** Ensure a well-defined list of possible categories. These categories could be used by the AI during generation or assigned post-generation. The source and management of these categories should be clear.

6.  **Trait Slot Progression:**
    *   The logic using `FIRST_TRAIT_LEVEL` and `TRAIT_LEVEL_INTERVAL` is clear and constant-driven, which is good for configurability.
    *   The hardcoded `nextSlotLevel > 100` check in `getNextTraitLevel` implies a soft cap on trait progression related to player level. Ensure this aligns with the game's overall maximum level and progression design.

7.  **Actual Trait Effects:**
    *   This module is primarily concerned with the *creation* and *management* of trait metadata. The actual implementation of how a trait's effects modify gameplay (e.g., altering player stats, changing combat mechanics, providing passive bonuses) would reside in other relevant modules (e.g., `PlayerStats.ts`, `CombatEngine.ts`, specific event handlers). The `Trait` type needs to clearly define how these effects are structured so other modules can interpret them.

8.  **User Experience for Crafting:**
    *   The flow involves an async AI call. Clear UI feedback (loading states, messages) managed via `TraitContext` is important.
    *   If AI generation takes significant time, consider ways to make this process non-blocking or provide progress indicators if the AI service supports it.

By addressing the TODO for trait effectiveness and continually refining the AI interaction and player guidance mechanisms, this module can provide a very dynamic and engaging trait system.I have successfully created the detailed markdown documentation file `/documentation/game-core/traits/TraitManager.md` with the summary of `game-core/traits/TraitManager.ts`, including its purpose, functionality, file contents, types, and a refactoring guide.

My subtask is complete. I will now submit the subtask report.
