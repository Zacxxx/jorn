# `game-core/combat/CombatEngine.ts`

## Purpose

The `CombatEngine.ts` module is the heart of the game's combat system. It orchestrates all combat interactions, including calculating damage from various sources, applying spell effects to both enemies and the player, managing resource costs (like Mana Points), handling elemental weaknesses and resistances, processing critical hits, synergy bonuses, damage reflection, lifesteal, and a wide array of other combat mechanics determined by spell tags.

## Key Interfaces

### `DamageResult`
Describes the outcome after damage has been applied to a target.
*   `actualDamageDealt`: The amount of damage the target actually received.
*   `updatedTargetHp`: The target's HP after taking the damage.

### `SpellApplicationResult`
Details the result of applying a spell to a target.
*   `updatedTargetHp?`: Optional. The target's HP after the spell effect, if the spell caused direct HP change.
*   `synergyBonusAppliedInThisHit`: Boolean indicating if a "Synergy" tag bonus was triggered by this specific spell hit.

### `TagDamageModifierResult`
Represents the outcome of applying tag-based damage modifications to a base damage value.
*   `damage`: The damage value after tag modifiers.
*   `synergyBonusApplied`: Boolean indicating if a "Synergy" tag bonus was applied during this modification.

### `CombatContext`
A comprehensive interface providing all necessary data and functions for combat operations.
*   `player`: The current `Player` object.
*   `currentEnemies`: An array of active `Enemy` objects.
*   `effectivePlayerStats`: The player's stats after all modifiers (buffs, debuffs, gear).
*   `addLog`: Function to add entries to the combat log.
*   `setPlayer`: Function to update the player's state.
*   `setCurrentEnemies`: Function to update the state of the enemies list.
*   `setModalContent`: Function to display modal pop-ups (e.g., for defeat messages).
*   `setGameState`: Function to change the overall game state (e.g., to 'GAME_OVER_DEFEAT').
*   `handleEnemyDefeat`: Function to process logic when an enemy is defeated.

## Core Functionality

The module's functions are primarily exposed through the `CombatEngineUtils` object.

### `calculateDamage(...)`
Calculates the damage dealt by an attack or spell before defense mitigation.
*   **Parameters:** `baseDamage`, `attackerPower`, `defenderDefense`, `effectiveness` ('normal', 'weak', 'resistant'), `scalingFactor` (for stat scaling), `scalingStatValue` (value of the stat the ability scales with).
*   **Logic:** `modifiedDamage = baseDamage + attackerPower + (scalingStatValue * scalingFactor)`. Applies effectiveness multipliers (1.5x for 'weak', 0.5x for 'resistant'). Final damage is `max(1, floor(modifiedDamage - defenderDefense))`.

### `applyDamageAndReflection(...)`
Applies calculated damage to a target and handles any damage reflection effects.
*   **Parameters:** `target` (Player or Enemy), `damage` amount, `attacker` (Player or Enemy), `context`, `targetIsPlayer` (boolean).
*   **Logic:** Deducts `damage` from `target.hp`. Checks `target` for damage reflection status effects or stats. If reflection is present, calculates reflected damage and applies it to the `attacker`. Handles player defeat (game over) or enemy defeat due to reflected damage.

### `applyTagDamageModifiers(...)`
Modifies a base damage value based on various spell tags.
*   **Parameters:** `damage`, `effectiveTags` (array of `TagName`), `enemy` target, `synergyAlreadyAppliedThisCast` (boolean).
*   **Logic:** Iterates through `effectiveTags` and applies multipliers:
    *   `Critical`: 30% chance for 2x damage.
    *   `Overwhelming`: 1.5x damage.
    *   `Empowerment`: 1.3x damage.
    *   `Synergy`: 1.25x damage (if `synergyAlreadyAppliedThisCast` is false).
    *   `Brutal`: 2x damage if `enemy.hp < 25% maxHp`.
    *   `Devastating`: 1.8x damage if `enemy.hp == maxHp`.
    *   `Ramping`: Increases damage by 20% for each active DoT effect on the enemy.
*   Returns the modified damage and whether synergy was applied.

### `getElementalEffectiveness(...)`
Calculates the elemental effectiveness multiplier for a spell against an enemy.
*   **Parameters:** `effectiveTags`, `enemy`.
*   **Logic:** Checks elemental tags (Fire, Ice, etc.) against `enemy.weakness` (1.5x per weakness) and `enemy.resistance` (0.5x per resistance).
    *   `Resonance`: 1.2x effectiveness.
    *   `Penetrating`: 1.3x effectiveness if already hitting a weakness.

### `applySpellToEnemy(...)`
Core logic for applying a spell's effects from the player to an enemy.
*   **Parameters:** `spell`, `enemy`, `powerMultiplier` (for multi-target spells), `effectiveSpellTags`, `synergyAlreadyAppliedThisCast`, `context`.
*   **Process:**
    1.  Calculates base damage using `calculateDamage` (factors in spell's base damage, player's power/magicPower, enemy's mind defense, spell scaling).
    2.  Applies tag-based damage modifiers using `applyTagDamageModifiers`. Updates `synergyBonusJustApplied`.
    3.  Calculates and applies `getElementalEffectiveness`.
    4.  Applies armor/defense modifiers based on tags (`Armor_Ignoring`, `True_Damage`, `Piercing`).
    5.  Applies final damage and handles reflection using `applyDamageAndReflection`.
    6.  Logs damage dealt. Updates enemy HP in `context`.
    7.  Handles `Lifesteal` / `Vampiric` tags: heals player based on damage dealt.
*   Returns `updatedTargetHp` and `synergyBonusAppliedInThisHit`.

### `applySpellToSelf(...)`
Applies spell effects when the player is the target (e.g., healing, buffs).
*   **Parameters:** `spell`, `effectiveSpellTags`, `context`.
*   **Logic:**
    *   If `spell.damageType === 'HealingSource'` or tag `Healing`: heals player HP, considering scaling.
    *   Placeholder logic for `Shield` and `Enhancement` tags.

### `executePlayerAttack(...)`
Orchestrates the entire process of a player casting a spell.
*   **Parameters:** `spell`, `targetId` (enemy ID), `context`.
*   **Process:**
    1.  Retrieves `effectiveSpellTags` for the spell (using `getEffectiveTags` from `TagSystem`).
    2.  **Pre-cast Checks:** Valid target, player MP, player status effects (Silenced, Stun, Sleep).
    3.  **Mana Cost Calculation:** Modifies `spell.manaCost` based on `Reduced_Cost` (70% cost) or `Free_Cast` (30% chance for 0 cost) tags.
    4.  **Blood Magic:** If `Blood_Magic` tag is present, health is sacrificed (50% of mana cost). If player HP is insufficient, cast fails. Mana cost might also be partially reduced.
    5.  Deducts MP/HP. Logs spell cast.
    6.  **Targeting:** Determines all actual `Enemy` targets based on tags:
        *   `SingleTarget` (or default): The specified `targetId`.
        *   `MultiTarget`: Up to first 3 enemies.
        *   `AreaOfEffect` / `GlobalTarget`: All current enemies.
        *   `RandomTarget`: 1 random enemy (or 3 if `Chain` tag is also present).
    7.  **Apply to Targets:** Iterates through determined `targets`:
        *   Calls `applySpellToEnemy` for each.
        *   `powerMultiplier` is adjusted for `MultiTarget` spells (diminishing returns for subsequent targets).
        *   Tracks `hasSynergyBonusAppliedThisCast` to ensure synergy bonus is applied only once per complete spell cast.
    8.  **Self Effects:** If `SelfTarget` tag or `HealingSource` type, calls `applySpellToSelf`.
    9.  **Enemy Defeat Check:** After all effects, checks each targeted enemy's HP and calls `context.handleEnemyDefeat` if HP <= 0.
*   Returns `true` if attack executed, `false` if prevented by checks.

## `CombatEngineUtils`

This object serves as a namespace and exports the primary public functions of the module, allowing other game systems to easily interact with combat functionalities:
```typescript
export const CombatEngineUtils = {
  calculateDamage,
  applyDamageAndReflection,
  applyTagDamageModifiers,
  getElementalEffectiveness,
  applySpellToEnemy,
  applySpellToSelf,
  executePlayerAttack,
};
```
