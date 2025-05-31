# `game-core/progression/ProgressionManager.ts`

## Purpose

The `ProgressionManager.ts` module is responsible for overseeing all aspects of player character advancement and rewards. This includes managing experience points (XP) gain, calculating player level, handling the level-up process (awarding stat points, unlocking new game features), distributing rewards (gold, essence, items) after combat, and offering guidance on stat point allocation.

## External Dependencies

*   **`../../constants`**:
    *   `ENEMY_DIFFICULTY_XP_REWARD`: A constant data structure that defines the base XP, gold ranges (min/max), and essence ranges (min/max) for enemies based on their difficulty category (e.g., 'easy', 'medium', 'hard', 'boss'). It also includes multipliers for 'elite' enemies.
    *   `MASTER_ITEM_DEFINITIONS`: Used to retrieve the names of items when logging dropped resources for better readability.

## Key Interfaces

### `ProgressionContext`
Defines the necessary data and callback functions required for progression-related operations.
*   `player`: The current `Player` object.
*   `setPlayer`: A function to update the `Player` object's state.
*   `addLog`: A function for adding messages to the game's log system.
*   `showMessageModal`: A function to display prominent messages to the player (e.g., level-up notifications).

### `CombatRewards`
Describes the structure of rewards obtained from defeating an enemy.
*   `xp`: Number of experience points gained.
*   `gold`: Amount of gold acquired.
*   `essence`: Amount of essence acquired.
*   `items`: An array of `GameItem` objects (like loot chests) received.
*   `resources`: A record (dictionary) of other resource items and their quantities added to the inventory.

### `LevelUpResult`
Describes the outcome and benefits of a player leveling up.
*   `newLevel`: The player's new level.
*   `statPointsGained`: The number of attribute points awarded for distribution.
*   `newAbilitiesUnlocked`: An array of strings naming any new abilities unlocked (Note: This is initialized but not populated in the current code).
*   `newFeaturesUnlocked`: An array of strings naming any new game features unlocked.

## Core Functionality

All primary functions are exported via the `ProgressionManagerUtils` object.

### `awardCombatRewards(defeatedEnemy: Enemy, context: ProgressionContext): CombatRewards`

Calculates and applies rewards for defeating an enemy.

1.  **Determine Difficulty & Base Rewards:** Identifies the enemy's difficulty (easy, medium, hard, boss) based on `defeatedEnemy.level` and fetches corresponding base rewards (XP, gold/essence min-max) from `ENEMY_DIFFICULTY_XP_REWARD`.
2.  **Calculate Gold/Essence:** Randomly determines the amount of gold and essence within the defined min/max ranges.
3.  **Elite Multipliers:** If `defeatedEnemy.isElite` is true, applies configured multipliers to XP, gold, and essence. Ensures essence gained is at least 1.
4.  **Log Gains:** Adds a log entry for the XP, gold, and essence received.
5.  **Process Dropped Resources:** If `defeatedEnemy.droppedResources` exist, adds each resource to a copy of `context.player.inventory` and compiles a list of messages for items found.
6.  **Generate Loot Chests:**
    *   Elite enemies drop 2 chests.
    *   Normal enemies have a 25% chance to drop 1 chest.
    *   Creates `LootChestItem` objects with appropriate names, descriptions, rarity, and level. These are added to a `newItems` array and their names to `lootMessages`.
7.  **Log Loot:** If any resources or chests were found, logs them.
8.  **Update Player State:**
    *   Adds gained XP, gold, and essence to the player's totals.
    *   Updates `player.inventory` with new resources.
    *   Appends `newItems` (chests) to `player.items`.
    *   Increments the `vanquishedCount` for `defeatedEnemy.id` in `player.bestiary`.
    *   All updates are applied via `context.setPlayer`.
9.  **Level-Up Check:** Calculates the player's potential new level using `calculateLevelFromXP` with the updated total XP. If `newLevel > oldLevel`, calls `handleLevelUp`.
10. Returns a `CombatRewards` object summarizing all gains.

### XP and Level Calculations

*   **`calculateLevelFromXP(totalXP: number): number`**
    *   Calculates the player's level based on their `totalXP` using the formula: `level = floor(sqrt(XP / 100)) + 1`. This results in an increasing XP requirement for each subsequent level.
*   **`getXPForNextLevel(currentLevel: number): number`**
    *   Determines the total XP required to reach the level *after* `currentLevel`. Formula: `(nextLevel - 1)^2 * 100`.
*   **`getLevelProgress(currentXP: number, currentLevel: number)`**
    *   Returns an object detailing:
        *   `currentLevelXP`: XP required to reach the `currentLevel`.
        *   `nextLevelXP`: XP required for the next level.
        *   `progressXP`: XP accumulated *within* the `currentLevel`.
        *   `progressPercent`: Percentage completion towards the next level.

### Leveling Up

*   **`handleLevelUp(oldLevel: number, newLevel: number, context: ProgressionContext): LevelUpResult`**
    1.  Calculates `levelsGained` and `statPointsGained` (currently 2 points per level).
    2.  Updates `player.level` and `player.availableStatPoints` via `context.setPlayer`.
    3.  Iterates from `oldLevel + 1` to `newLevel`, calling `getUnlockedFeaturesAtLevel(level)` for each to compile a list of `newFeaturesUnlocked`.
    4.  Logs the level-up event and any unlocked features.
    5.  Displays a modal message announcing the level up, stat points gained, and new features.
    6.  Returns a `LevelUpResult` object. (Note: `newAbilitiesUnlocked` is part of the result but not currently implemented).

*   **`getUnlockedFeaturesAtLevel(level: number): string[]` (Internal Helper)**
    *   A private function that uses a `switch` statement to return an array of strings representing game features unlocked at specific player levels (e.g., "Spell Preparation" at level 2, "Trait Crafting" at level 5).

*   **`canLevelUp(player: Player): boolean`**
    *   Returns `true` if `player.xp` is sufficient to reach the next level (i.e., `player.xp >= getXPForNextLevel(player.level)`).

### Stat Allocation

*   **`getStatAllocationRecommendations(player: Player)`**
    *   Provides suggestions on how the player might allocate their `player.availableStatPoints`.
    *   If no points are available, indicates this.
    *   For a new character (stats at 0), recommends a balanced distribution.
    *   Otherwise, it analyzes the player's current `body`, `mind`, and `soul` stats to infer a build (physical, magical, soul-focused, or balanced) and suggests allocating a majority of points (e.g., 60%) to the dominant stat, with smaller amounts (e.g., 20%) to others for balance.
    *   Returns an object with point recommendations for `body`, `mind`, `soul`, and a `reasoning` string explaining the suggestion.

## `ProgressionManagerUtils`

This object serves as the public API for the module:
```typescript
export const ProgressionManagerUtils = {
  awardCombatRewards,
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  handleLevelUp,
  canLevelUp,
  getStatAllocationRecommendations,
};
```
It centralizes all functionalities related to player advancement, rewards, and leveling.
