# `game-core/player/PlayerStats.ts`

## Purpose

The `PlayerStats.ts` module is responsible for calculating a player's effective statistics. These "effective" stats are derived from the player's base attributes (body, mind, reflex), their current level, bonuses granted by equipped items, and temporary modifications from active status effects (buffs and debuffs). The module provides functions to compute these dynamic stats, determine limits on spell/ability preparation based on level, and synchronize the player's current resource values (HP, MP, EP) with their calculated maximums.

## External Dependencies

*   **`../../constants`**: This module heavily relies on constants that define the foundational values and scaling factors for player statistics. These include:
    *   Base values: `BASE_HP`, `BASE_MP`, `BASE_EP`.
    *   Per-level gains: `HP_PER_LEVEL`, `MP_PER_LEVEL`, `EP_PER_LEVEL`.
    *   Attribute contributions: `HP_PER_BODY`, `MP_PER_MIND`, `EP_PER_REFLEX`, `PLAYER_BASE_SPEED_FROM_REFLEX`, `SPEED_PER_REFLEX`, `PHYSICAL_POWER_PER_BODY`, `MAGIC_POWER_PER_MIND`, `DEFENSE_PER_BODY`, `DEFENSE_PER_REFLEX`.
    *   Combat modifiers: `DEFENDING_DEFENSE_BONUS_PERCENTAGE`.
    *   Spell/Ability limits: `MAX_SPELLS_PER_LEVEL_BASE`, `PREPARED_SPELLS_PER_LEVEL_BASE`, `PREPARED_ABILITIES_PER_LEVEL_BASE`.

## Core Functionality

### `calculateEffectiveStats(player: Player): PlayerEffectiveStats`

This is the primary function of the module. It computes the player's stats as they should be in the current game context.

1.  **Initialization:**
    *   Starts with the player's base attributes: `effectiveBody = player.body`, `effectiveMind = player.mind`, `effectiveReflex = player.reflex`.
    *   Initializes accumulators for bonuses: `bonusMaxHp`, `bonusMaxMp`, `bonusMaxEp`, `bonusSpeed`, and `damageReflectionPercent` are set to 0. `effectiveDefense` is also initialized.

2.  **Equipment Bonuses:**
    *   Iterates through `player.equippedItems`. For each valid item ID, it finds the corresponding `Equipment` item in `player.items`.
    *   If the item has `statsBoost`, these values (`body`, `mind`, `reflex`, `speed`, `maxHp`, `maxMp`, `maxEp`) are added to the respective effective attributes or bonus accumulators.
    *   If the item has a `DamageReflection` tag, its `scalingFactor` (defaulting to 0.1 if not specified) is added to `damageReflectionPercent`.

3.  **Status Effect Modifiers:**
    *   Iterates through `player.activeStatusEffects`.
    *   Modifies `effectiveBody`, `effectiveMind`, `effectiveReflex` based on effects like `TEMP_BODY_UP`, `StrengthenBody`, `WeakenMind`, etc. Attribute values are clamped to a minimum of 1 if weakened.
    *   Adds to `bonusSpeed`, `bonusMaxHp`, `bonusMaxMp` for relevant temporary buffs.
    *   If an effect is named `DamageReflection`, its `magnitude` (treated as a percentage, so divided by 100) is added to `damageReflectionPercent`.

4.  **Derived Stats Calculation:**
    *   **Max HP:** `BASE_HP + (player.level * HP_PER_LEVEL) + (effectiveBody * HP_PER_BODY) + bonusMaxHp`
    *   **Max MP:** `BASE_MP + (player.level * MP_PER_LEVEL) + (effectiveMind * MP_PER_MIND) + bonusMaxMp`
    *   **Max EP:** `BASE_EP + (player.level * EP_PER_LEVEL) + (effectiveReflex * EP_PER_REFLEX) + bonusMaxEp`
    *   **Speed:** `PLAYER_BASE_SPEED_FROM_REFLEX + (effectiveReflex * SPEED_PER_REFLEX) + bonusSpeed`
    *   **Physical Power:** `floor(effectiveBody * PHYSICAL_POWER_PER_BODY)`
    *   **Magic Power:** `floor(effectiveMind * MAGIC_POWER_PER_MIND)`
    *   **Base Defense:** `floor(effectiveBody * DEFENSE_PER_BODY + effectiveReflex * DEFENSE_PER_REFLEX)`

5.  **Defending Bonus:** If the player has an active 'Defending' status effect, `effectiveDefense` is increased by `DEFENDING_DEFENSE_BONUS_PERCENTAGE`.

6.  **Damage Reflection Clamping:** `damageReflectionPercent` is clamped to be between 0 (0%) and 1 (100%).

7.  **Return Value:** Returns a `PlayerEffectiveStats` object containing all these newly computed values (`maxHp`, `maxMp`, `maxEp`, `speed`, `body`, `mind`, `reflex`, `physicalPower`, `magicPower`, `defense`, `damageReflectionPercent`).

### Spell and Ability Slot Calculations

*   **`calculateMaxRegisteredSpells(level: number): number`**
    *   Calculates the total number of spells a player can have learned: `level + MAX_SPELLS_PER_LEVEL_BASE`.
*   **`calculateMaxPreparedSpells(level: number): number`**
    *   Calculates how many spells can be readied for active use: `level + PREPARED_SPELLS_PER_LEVEL_BASE`.
*   **`calculateMaxPreparedAbilities(level: number): number`**
    *   Calculates how many abilities can be readied for active use: `level + PREPARED_ABILITIES_PER_LEVEL_BASE`.

### Prepared Spell/Ability Retrieval

*   **`getPreparedSpells(player: Player)`**
    *   Filters the `player.spells` array to return only those spells whose IDs are present in `player.preparedSpellIds`.
*   **`getPreparedAbilities(player: Player)`**
    *   Filters the `player.abilities` array to return only those abilities whose IDs are present in `player.preparedAbilityIds`.

### Synchronizing Current Player Stats

*   **`updatePlayerCurrentStats(player: Player, effectiveStats: PlayerEffectiveStats): Player`**
    *   This function is crucial for aligning the player's current resource pools (HP, MP, EP) with their newly calculated maximums from `effectiveStats`.
    *   It updates `player.maxHp`, `player.maxMp`, `player.maxEp`, and `player.speed` to the values from `effectiveStats`.
    *   For current `hp`, `mp`, and `ep`:
        *   If the current value is 0 (common on initial game load/character creation).
        *   OR if the current value exceeds the new maximum (e.g., max HP decreased due to a debuff or equipment change).
        *   OR if the previous maximum was 0 (initial setup).
        *   THEN, the current resource value is set to the new maximum (effectively a full heal/restore to the new cap).
        *   Otherwise, the current resource value is preserved (e.g., if a player has 50/100 HP and their max HP increases to 120, they remain at 50/120 HP, not automatically healed to 120).
    *   Returns the `Player` object with these updated current and maximum resource values and speed.

This module forms a critical part of the game's mechanics, as the calculated effective stats directly influence the player's performance in combat, their survivability, and their capacity to use spells and abilities.
