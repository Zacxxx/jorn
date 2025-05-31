# `game-core/homestead/HomesteadManager.ts`

## Purpose

The `HomesteadManager.ts` module is designed to manage all aspects of the player's homestead within the game. This includes initiating and completing various homestead projects, handling upgrades to homestead properties, and providing utility functions to check the status, costs, and completion of these activities.

## External Dependencies

This module interacts with services defined elsewhere, primarily:

*   **`../../src/services/homesteadService.ts`**: Provides core logic for:
    *   `canAffordResourceCost`: Checking if a player's inventory meets specified resource costs.
    *   `consumeResources`: Deducting resources from a player's inventory.
    *   `addProjectRewards`: Adding items or resources from project completion to a player's inventory.
    *   `getUpgradeCosts`: Retrieving the defined resource costs for a particular property upgrade.
    *   `applyPropertyUpgrade`: Modifying a property object to reflect an applied upgrade.
    *   `generateProjectId`: Creating unique identifiers for new homestead projects.
*   **`../../services/itemService.ts`**:
    *   `MASTER_ITEM_DEFINITIONS`: A mapping or dictionary used to look up item details (like names) based on their IDs, primarily for constructing user-facing messages about rewards.

## Key Interfaces

### `HomesteadProjectResult`
Defines the structure of the result returned when starting or completing a homestead project.
*   `success`: Boolean, indicating if the operation was successful.
*   `updatedPlayer?`: Optional `Player` object representing the player's state after the operation.
*   `error?`: Optional string containing an error message if the operation failed.
*   `message?`: Optional string containing a success message.

### `HomesteadUpgradeResult`
Similar to `HomesteadProjectResult`, but specifically for operations involving upgrading homestead properties.
*   `success`: Boolean.
*   `updatedPlayer?`: Optional `Player` object.
*   `error?`: Optional error message.
*   `message?`: Optional success message.

## Core Functionality

All primary functions are grouped and exported via the `HomesteadManagerUtils` object.

### `startHomesteadProject(player: Player, project: Omit<HomesteadProject, 'id' | 'startTime'>): HomesteadProjectResult`

Initiates a new homestead project for the player.

1.  **Cost Check:** Uses `canAffordResourceCost` to verify if `player.inventory` meets `project.resourceCost`. If not, returns `{ success: false, error: "..." }`.
2.  **Project Creation:** Creates a full `HomesteadProject` object by:
    *   Spreading the input `project` data.
    *   Assigning a unique `id` using `generateProjectId()`.
    *   Setting `startTime` to `Date.now()`.
3.  **Player State Update:**
    *   Deducts `project.resourceCost` from `player.inventory` using `consumeResources`.
    *   Adds the newly created project to the `player.homestead.activeProjects` array.
4.  Returns `{ success: true, updatedPlayer: ..., message: "..." }` indicating the project has started and its duration.

### `completeHomesteadProject(player: Player, projectId: string): HomesteadProjectResult`

Finalizes an active homestead project and grants rewards.

1.  **Find Project:** Locates the project in `player.homestead.activeProjects` using `projectId`. If not found, returns `{ success: false, error: "Project not found." }`.
2.  **Player State Update:**
    *   Adds `project.rewards` to `player.inventory` using `addProjectRewards`.
    *   Removes the completed project from `player.homestead.activeProjects`.
3.  **Message Construction:** Creates a message detailing the completed project and lists rewards (using `MASTER_ITEM_DEFINITIONS` to get item names).
4.  Returns `{ success: true, updatedPlayer: ..., message: "..." }`.

### `upgradeHomesteadProperty(player: Player, propertyName: string, upgradeName: string): HomesteadUpgradeResult`

Applies an upgrade to a specified homestead property.

1.  **Find Property:** Checks if `player.homestead.properties[propertyName]` exists. If not, returns `{ success: false, error: "Property not found." }`.
2.  **Cost Check:** Retrieves upgrade costs using `getUpgradeCosts(upgradeName)` and then checks if `player.inventory` can afford them using `canAffordResourceCost`. If not, returns `{ success: false, error: "..." }`.
3.  **Player State Update:**
    *   Deducts upgrade costs from `player.inventory` using `consumeResources`.
    *   Applies the upgrade to the property object using `applyPropertyUpgrade(property, upgradeName)` and updates it within `player.homestead.properties`.
4.  Returns `{ success: true, updatedPlayer: ..., message: "..." }` confirming the upgrade.

### Utility Functions

*   **`canStartProject(player: Player, project: Omit<HomesteadProject, 'id' | 'startTime'>): boolean`**
    *   Returns `true` if the player's inventory can cover the `project.resourceCost`.

*   **`canUpgradeProperty(player: Player, propertyName: string, upgradeName: string): boolean`**
    *   Returns `true` if the property exists and the player can afford the costs (obtained via `getUpgradeCosts`) for the `upgradeName`.

*   **`getActiveProjects(player: Player): HomesteadProject[]`**
    *   Returns the array of `player.homestead.activeProjects`.

*   **`getCompletedProjects(player: Player): string[]`**
    *   Filters `player.homestead.activeProjects` to find projects where the current time (`Date.now()`) has surpassed the project's `startTime` plus its `duration` (converted from hours to milliseconds).
    *   Returns an array of `id`s for these completed projects.

*   **`getProjectTimeRemaining(project: HomesteadProject): number`**
    *   Calculates and returns the remaining time for a project in milliseconds. Returns `0` if the project is already completed.
    *   Formula: `max(0, (project.startTime + project.durationHours * 3600000) - Date.now())`.

*   **`isProjectCompleted(project: HomesteadProject): boolean`**
    *   Returns `true` if `getProjectTimeRemaining(project)` is `0`.

## `HomesteadManagerUtils`

This object serves as the public API for the module:

```typescript
export const HomesteadManagerUtils = {
  startHomesteadProject,
  completeHomesteadProject,
  upgradeHomesteadProperty,
  canStartProject,
  canUpgradeProperty,
  getActiveProjects,
  getCompletedProjects,
  getProjectTimeRemaining,
  isProjectCompleted,
};
```
It allows other game systems to interact with homestead functionalities in a structured way.
