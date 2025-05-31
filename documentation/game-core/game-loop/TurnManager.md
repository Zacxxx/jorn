# `game-core/game-loop/TurnManager.ts`

## Purpose

The `TurnManager.ts` module is responsible for orchestrating the turn-based combat sequence within the game. It manages the progression of turns, processes status effects for both the player and enemies at appropriate times, dictates enemy AI behavior during their turns, and determines the conditions under which combat concludes.

## Key Interfaces

### `TurnContext`
This comprehensive interface provides all the necessary data and callback functions required for processing turns. It includes:

*   **Current State:**
    *   `player`: The `Player` object.
    *   `currentEnemies`: An array of `Enemy` objects currently in combat.
    *   `effectivePlayerStats`: The player's stats after all modifiers.
    *   `turn`: The current turn number.
    *   `isPlayerTurn`: Boolean flag indicating if it's the player's turn.
    *   `currentActingEnemyIndex`: Index of the enemy whose turn it currently is.
*   **State Update Callbacks:**
    *   `setPlayer`: Function to update the player's state.
    *   `setCurrentEnemies`: Function to update the state of the enemies array.
    *   `setTurn`: Function to update the current turn number.
    *   `setIsPlayerTurn`: Function to set whether it's the player's turn.
    *   `setCurrentActingEnemyIndex`: Function to set the index of the currently acting enemy.
    *   `setGameState`: Function to change the overall game state (e.g., to 'GAME_OVER_DEFEAT').
*   **Utility Callbacks:**
    *   `addLog`: Function to add messages to the combat log.
    *   `calculateDamage`: Function (likely delegated) to calculate damage values.
    *   `applyDamageAndReflection`: Function (likely delegated) to apply damage to a target and handle reflection.
    *   `handleEnemyDefeat`: Function to process logic when an enemy is defeated.

### `PlayerTurnStartResult`
Defines the output of the `processPlayerTurnStartEffects` function.
*   `willBeStunnedThisTurn`: Boolean, true if the player will be stunned or incapacitated during their upcoming turn due to status effects.

## Core Functionality

The module's primary operations are exposed through the `TurnManagerUtils` object.

### `processPlayerTurnStartEffects(turn: number, context: TurnContext): PlayerTurnStartResult`

This function is called at the beginning of the player's turn to apply and manage status effects:

1.  Iterates through `context.player.activeStatusEffects`.
2.  **Applies Effects:**
    *   **Damage over Time (DoT):** For effects like `PoisonDoTActive`, `BurningDoTActive`, etc., it subtracts `effect.magnitude` from player's HP and logs the damage.
    *   **Healing over Time (HoT):** For effects like `Regeneration` or `TEMP_HP_REGEN`, it adds `effect.magnitude` to player's HP (capped by max HP) and logs the healing.
    *   **Incapacitating Effects:** For `Stun`, `Freeze`, `Sleep`, it sets `willBeStunnedThisTurn` to `true` and logs that the player cannot act.
3.  **Effect Duration:** Decrements the `duration` of each effect by 1. If an effect's duration reaches 0, it's removed from `activeStatusEffects`, and a log message indicates it has worn off.
4.  **State Update:** Updates the player's HP, MP, EP, and `activeStatusEffects` via `context.setPlayer`.
5.  **Player Defeat Check:** If player HP drops to 0 or below due to these effects, logs the event and sets the game state to `GAME_OVER_DEFEAT` via `context.setGameState`.
6.  Returns an object `{ willBeStunnedThisTurn }`.

### `processEnemyTurn(context: TurnContext)`

Manages an individual enemy's turn:

1.  **Pre-conditions:** Exits if no enemies are present or if `context.isPlayerTurn` is true.
2.  Identifies the `actingEnemy` using `context.currentActingEnemyIndex`. If the enemy is invalid or already defeated, it calls `advanceToNextEnemyOrPlayerTurn`.
3.  **Process Enemy Status Effects:** Similar to player effects:
    *   Applies DoT effects, reducing `actingEnemy.hp`.
    *   Checks for `Stun`, `Freeze` (sets `enemyIsStunned`), `Silenced` (sets `enemyIsSilenced`), `Rooted`.
    *   Decrements effect durations and removes expired ones.
4.  Updates the specific enemy's state (HP, `activeStatusEffects`) within `context.currentEnemies`.
5.  **Enemy Defeat Check (from status):** If enemy HP drops to 0 or below, logs it, calls `context.handleEnemyDefeat`, and then calls `advanceToNextEnemyOrPlayerTurn`.
6.  **Execute Action:** If the enemy is not stunned (`!enemyIsStunned`), calls the internal `executeEnemyAction` function.
7.  Calls `advanceToNextEnemyOrPlayerTurn` to proceed to the next combatant or end the enemy phase.

### `executeEnemyAction(enemy: Enemy, isSilenced: boolean, context: TurnContext)` (Internal Helper)

Determines and executes the acting enemy's move:

1.  **Decision:** 50% chance to use a special ability if the `enemy` has one and is not `isSilenced`. Otherwise, performs a basic attack.
2.  **Special Ability:**
    *   Logs the ability name.
    *   Calculates damage (base + level scaling, using enemy `mind` for power, against player `defense`).
    *   Calls `context.applyDamageAndReflection` to deal damage to the player.
    *   Logs damage dealt. Updates player HP via `context.setPlayer`.
    *   If player HP <= 0, sets game state to `GAME_OVER_DEFEAT`.
3.  **Basic Attack:**
    *   Logs the attack (mentions if silenced and falling back to basic).
    *   Calculates damage (base + level scaling, using enemy `body` for power, against player `defense`).
    *   Applies damage and updates player state similarly to a special ability.

### `advanceToNextEnemyOrPlayerTurn(context: TurnContext)` (Internal Helper)

Manages the transition between turns:

1.  Increments `context.currentActingEnemyIndex`.
2.  **End of Enemy Phase Check:** If the new index is out of bounds for `context.currentEnemies` or if all `livingEnemies` (HP > 0) are defeated:
    *   Increments `context.turn` (the main turn counter).
    *   Sets `context.isPlayerTurn = true`.
    *   Resets `context.currentActingEnemyIndex = 0`.
3.  **Next Enemy's Turn:** Otherwise, updates `context.currentActingEnemyIndex` to the new index, effectively passing the turn to the next enemy in sequence.

### `shouldEndCombat(context: TurnContext): boolean`

Checks if the conditions to end the current combat encounter are met:

*   Returns `true` if the number of `livingEnemies` (enemies with HP > 0) is zero.
*   Returns `true` if `context.player.hp <= 0`.
*   Otherwise, returns `false`.

## `TurnManagerUtils`

This object serves as a public interface for the module, exporting key functionalities:

```typescript
export const TurnManagerUtils = {
  processPlayerTurnStartEffects,
  processEnemyTurn,
  shouldEndCombat,
};
```
These utilities are intended to be called by a higher-level game loop or combat management system to drive the combat flow.
