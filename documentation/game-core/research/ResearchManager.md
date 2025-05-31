# `game-core/research/ResearchManager.ts`

## Purpose

The `ResearchManager.ts` module is dedicated to managing the in-game system for researching and creating new spell components. A core aspect of this system is its reliance on an AI-driven utility to generate these components based on player-provided descriptions and resource investments. The module provides functions to handle this creation process, calculate recommended investment levels, estimate the probability of research success, determine the player's research efficiency, and suggest available research projects based on player progression.

## External Dependencies

*   **`../../src/utils/aiUtils`**:
    *   `createSpellComponentFromPrompt(prompt: string, playerLevel: number, goldInvested: number, essenceInvested: number): Promise<SpellComponent | null>`: This is a critical external asynchronous function. It's expected to interact with an AI model or a sophisticated generation algorithm to produce a `SpellComponent` object based on a textual `prompt`, the `playerLevel`, and the amount of `goldInvested` and `essenceInvested`.

## Key Interfaces

### `ResearchContext`
Defines the necessary data and callback functions required for research operations.
*   `player`: The current `Player` object.
*   `setPlayer`: A function to update the `Player` object's state (e.g., deducting resources, adding discovered components).
*   `setIsLoading`: A function to toggle a loading indicator in the UI, useful during asynchronous AI calls.
*   `addLog`: A function for adding messages to the game's log system.
*   `showMessageModal`: A function to display prominent messages (like success or failure notifications) to the player.

### `ComponentCreationResult`
Describes the outcome of an attempt to create a new spell component.
*   `success`: Boolean, true if the component was successfully created.
*   `component?`: Optional `SpellComponent` object, present if creation was successful.
*   `message`: String providing feedback to the player.
*   `type`: Literal `'success' | 'error'` categorizing the message.
*   `goldSpent?`: Optional number, the amount of gold consumed in the attempt.
*   `essenceSpent?`: Optional number, the amount of essence consumed.

### `ResearchInvestment`
A simple structure to hold investment details for research.
*   `gold`: Amount of gold invested.
*   `essence`: Amount of essence invested.
*   `timeInvested?`: Optional number, an estimated time for the research.

## Core Functionality

All primary functions are exported via the `ResearchManagerUtils` object.

### `async createAIComponent(prompt: string, goldInvested: number, essenceInvested: number, context: ResearchContext): Promise<ComponentCreationResult>`

Manages the AI-driven creation of a new spell component.

1.  **Input Validation:** Checks if `prompt` is non-empty and if `goldInvested` and `essenceInvested` are non-negative.
2.  **Resource Check:** Verifies if `context.player` has enough gold and essence.
3.  **Initiate Research:** Sets `context.setIsLoading(true)` and logs the start of the research.
4.  **AI Call:** Invokes `await createSpellComponentFromPrompt(...)` with the provided parameters.
5.  **Handle AI Response:**
    *   If `newComponent` is null or undefined (AI failed to create a component), sets loading to false and returns a failure result.
    *   If successful:
        *   Deducts `goldInvested` and `essenceInvested` from `context.player.gold` and `context.player.essence`.
        *   Adds the `newComponent` to `context.player.discoveredComponents`.
        *   Updates the player state using `context.setPlayer`.
        *   Logs the success and displays a success modal message.
        *   Sets loading to false and returns a `ComponentCreationResult` with `success: true` and the new component.
6.  **Error Handling:** Catches any exceptions during the AI call or subsequent processing, sets loading to false, displays an error modal, and returns a failure result.

### `calculateRecommendedInvestment(prompt: string, playerLevel: number, playerGold: number, playerEssence: number): ResearchInvestment`

Calculates suggested gold and essence investment for researching a component based on various factors:

*   **Base Investment:** Scales with `playerLevel` (e.g., `playerLevel * 5` for gold).
*   **Prompt Complexity:** A multiplier is derived from the number of words in the `prompt` (more complex prompts might suggest higher investment).
*   **Resource Capping:** Recommended amounts are capped at 50% of the player's currently available `playerGold` and `playerEssence` to prevent excessive spending.
*   **Minimum Investment:** Ensures recommendations are at least 1 gold/essence.
*   Also provides an estimated `timeInvested` (in minutes), scaled by prompt complexity.

### `getResearchEfficiency(player: Player): number`

Determines a player's research efficiency, which can influence success chances or outcomes.

*   Starts with a base efficiency of `1.0`.
*   Adds a bonus derived from `player.mind` (e.g., 2% per Mind point).
*   Adds a bonus derived from `player.level` (e.g., 1% per level).
*   Includes a placeholder `equipmentBonus` (marked as TODO), suggesting future enhancements where gear could boost research.
*   The final efficiency is clamped to a minimum of `0.5`.

### `estimateSuccessChance(investment: ResearchInvestment, player: Player, prompt: string): number`

Estimates the percentage chance of successfully creating a component.

*   **Base Chance:** Starts at a fixed percentage (e.g., 60%).
*   **Investment Bonus:** Increases chance based on `investment.gold + investment.essence` (capped).
*   **Level Bonus:** Increases chance based on `player.level` (capped).
*   **Efficiency Bonus:** Adds a bonus if `getResearchEfficiency(player)` is greater than 1.0.
*   **Complexity Penalty:** Reduces chance if the `prompt` is very long (complex).
*   The final estimated chance is clamped between a minimum (e.g., 10%) and maximum (e.g., 95%).

### `getAvailableResearchProjects(player: Player): string[]`

Provides a list of suggested research project descriptions for the player.

*   Includes a set of basic project ideas always available.
*   Unlocks more advanced or thematically different project ideas as the `player.level` reaches certain milestones (e.g., levels 5, 10, 15). These are typically general concepts like "Elemental Amplifier" or "Temporal Distortion."

### `hasDiscoveredComponentType(player: Player, componentType: string): boolean`

*   Checks if the player has previously discovered a component related to the given `componentType`.
*   It does this by searching if `componentType` (case-insensitive) is included in the `name` or `description` of any component in `player.discoveredComponents`.

## `ResearchManagerUtils`

This object serves as the public API for the module:
```typescript
export const ResearchManagerUtils = {
  createAIComponent,
  calculateRecommendedInvestment,
  getResearchEfficiency,
  estimateSuccessChance,
  getAvailableResearchProjects,
  hasDiscoveredComponentType,
};
```
It centralizes all functionalities related to the AI-assisted research and creation of spell components.
