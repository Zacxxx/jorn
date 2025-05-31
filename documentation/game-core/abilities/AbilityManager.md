# `game-core/abilities/AbilityManager.ts`

## Purpose

The `AbilityManager.ts` module is central to handling all player abilities within the game. Its responsibilities include managing the execution of abilities, applying their diverse effects, determining if an ability can be used under current conditions, and calculating the potency of these abilities, potentially based on player stats.

## Key Interfaces

### `AbilityContext`

This interface defines the complete context required for an ability to be executed. It encapsulates:

*   `player`: The current `Player` object.
*   `currentEnemies`: An array of `Enemy` objects currently in combat.
*   `effectivePlayerStats`: The `PlayerEffectiveStats` of the player, accounting for buffs, debuffs, etc.
*   `setPlayer`: A function to update the player's state.
*   `setCurrentEnemies`: A function to update the state of current enemies.
*   `setIsPlayerTurn`: A function to set whose turn it is (typically to `false` after player action).
*   `addLog`: A function to add messages to the game log (e.g., "Player uses Fireball.").
*   `applyStatusEffect`: A function to apply a status effect (like 'Burn' or 'Boosted Strength') to a target.

### `AbilityUseResult`

This interface describes the outcome of an attempt to use an ability:

*   `success`: A boolean indicating if the ability was used successfully.
*   `message`: A string providing feedback to the player (e.g., "Insufficient EP" or "Successfully used Heal").
*   `type`: A literal type `'success' | 'error'` categorizing the message.

## Core Functionality

The module exposes several key functions, which are also bundled into the `AbilityManagerUtils` object for convenient access.

### `useAbility(abilityId: string, targetId: string | null, context: AbilityContext): AbilityUseResult`

This is the primary function for executing an ability. Its process is as follows:

1.  **Find Ability:** Locates the ability by `abilityId` within the `context.player.abilities` array.
2.  **Check Prerequisites:**
    *   Verifies if the player has enough Energy Points (EP) as per `ability.epCost`.
    *   Checks for 'Silenced' status on the player if the ability has a `Silence` tag. If so, usage is prevented.
3.  **Deduct Cost & Log:** If prerequisites are met, deducts `ability.epCost` from `context.player.ep` and logs the ability usage via `context.addLog`.
4.  **Determine Target:**
    *   If the ability has a `SelfTarget` tag, the `targetEntity` is the `context.player`.
    *   Otherwise, it attempts to find an enemy in `context.currentEnemies` matching the provided `targetId`.
5.  **Apply Effects:** Based on `ability.effectType`:
    *   **`MP_RESTORE`**: Increases player's MP, capped by `maxMp`.
    *   **`SELF_HEAL`**: Increases player's HP, capped by `maxHp`.
    *   **`TEMP_STAT_BUFF`**: If the ability has `targetStatusEffect`, `duration`, and `magnitude`, it calls `context.applyStatusEffect` to apply a buff to the player.
    *   **`ENEMY_DEBUFF`**: If the ability has `targetStatusEffect` and `duration` (and optionally `magnitude`), it calls `context.applyStatusEffect` to apply a debuff to the targeted enemy.
6.  **End Turn:** Calls `context.setIsPlayerTurn(false)` to signify the end of the player's action.
7.  **Return Result:** Returns an `AbilityUseResult` indicating the success or failure of the ability usage, along with a message.

### `canUseAbility(abilityId: string, player: Player): boolean`

Checks whether a player is currently able to use a specific ability.

1.  Finds the ability in `player.abilities`.
2.  Returns `false` if the ability is not found.
3.  Returns `true` if the player has sufficient EP (`player.ep >= ability.epCost`) AND is not 'Silenced' if the ability is tagged with `Silence`. Otherwise, returns `false`.

### `getUsableAbilities(player: Player): Ability[]`

Returns an array of `Ability` objects that the player can currently use. It filters the `player.abilities` list by calling `canUseAbility` for each ability.

### `calculateAbilityEffectiveness(ability: Ability, player: Player, effectiveStats: PlayerEffectiveStats): number`

Calculates the final magnitude of an ability's effect, taking into account any scaling with player statistics.

1.  Starts with the `ability.magnitude` (or 0 if undefined).
2.  If `ability.scalingFactor` and `ability.scalesWith` (e.g., 'Body', 'Mind') are defined, it calculates a bonus: `effectiveStats[scalesWithStat] * ability.scalingFactor`.
3.  This bonus is added to the base magnitude.
4.  Returns the `Math.floor()` of the total calculated magnitude.

## `AbilityManagerUtils`

This object serves as a convenient container, exporting all the core functions of the module:

```typescript
export const AbilityManagerUtils = {
  useAbility,
  canUseAbility,
  getUsableAbilities,
  calculateAbilityEffectiveness,
};
```

This allows other parts of the game to easily import and utilize the ability management functionalities.
