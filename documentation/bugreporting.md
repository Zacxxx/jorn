# Bug Report & Tag System Analysis Summary

This document summarizes key findings from an analysis of the Tag System, primarily focusing on `constants.ts` (TAG_DEFINITIONS) and its interaction with `TagSystem.ts` and `CombatEngine.ts`.

## Major Issues Requiring Fixes:

### 1. Precedence and Conflict Issues in `TAG_DEFINITIONS`

The order of tags in `TAG_DEFINITIONS` dictates precedence. Several categories have logical errors:

*   **Damage Modifiers (Partially Addressed):**
    *   **Issue:** `Piercing` (weaker armor penetration) had precedence over `Armor_Ignoring` and `True_Damage`. `Brutal`/`Overwhelming` (weaker damage boosts) had precedence over `Devastating`.
    *   **Attempted Fix (in this task):** Reordered these specific tags (`True_Damage`, `Armor_Ignoring`, `Piercing` and `Devastating`, `Brutal`, `Overwhelming`) to reflect logical hierarchy. Ensured their `conflictsWith` properties are robust.
    *   **Further Action:** Verify these changes thoroughly in testing.

*   **Rarity Tags (Critical):**
    *   **Issue:** Tags like `Common`, `Rare`, `Legendary`, etc., do **not** conflict with each other. They should be mutually exclusive.
    *   **Recommendation:** Add `conflictsWith` to each rarity tag, listing all other rarity tags. Then, reorder these tags within `constants.ts` so that the highest actual rarity (e.g., `Cosmic`) has the highest game precedence (appears earliest in the Rarity block).

*   **Tiered Debuffs (e.g., Confusion/Madness):**
    *   **Issue:** Weaker versions (`Confusion`, `Fatigue`) have higher precedence than stronger versions (`Madness`, `Exhaustion`).
    *   **Recommendation:** Reorder these pairs and ensure they conflict with each other. Stronger version should have higher precedence.

*   **Tiered Vampiric Tags (Lifesteal/Vampiric):**
    *   **Issue:** `Lifesteal` (weaker) has higher precedence than `Vampiric` (stronger).
    *   **Recommendation:** Reorder and ensure they conflict (conflict already exists).

*   **Tiered Damage Over Time Tags (e.g., Corroding/Dissolving):**
    *   **Issue:** Weaker versions can have higher precedence than stronger versions.
    *   **Recommendation:** Review pairs like `Corroding`/`Dissolving` and `Withering`/`Decaying`. Reorder and ensure they conflict if tiered.

### 2. Missing `conflictsWith` Entries

*   **Targeting Tags:** `GlobalTarget`, `RandomTarget`, `Touch` are missing logical conflicts with more specific or contradictory targeting types (e.g., `GlobalTarget` should likely conflict with `Melee`; `Touch` with `Ranged`).
*   **Spell Property Tags:** `Persistent`, `Toggle`, `Concentration` lack some logical conflicts with other casting/duration modes (e.g., an `Instant` direct damage spell probably shouldn't also have `Concentration`). `Ritual` could also conflict with `Channeling`/`Delayed`.
*   **Defensive Mechanics:** `Block`, `Parry`, `Dodge` should likely conflict as they are distinct defensive actions.

### 3. Missing Tag Definitions

*   **Crowd Control:** Several tags listed in `TAG_SYSTEM_IMPLEMENTATION.md` (`Immobilize`, `Banish`, `Displacement`, `Knockback`, `Knockdown`, `Grab`) are **not defined** in `constants.ts`. These need to be defined to be used.

### 4. Redundancy or Clarity Issues

*   **Defensive Tags:** `Counter` vs. `Retaliate`; `Reflect` vs. `DamageReflection`; `Absorb` vs. `Absorption`. These pairs need review for redundancy. One of each pair might be sufficient or needs clearer distinction.
*   **Resource Mechanics:** `Channel_Health` vs. `Blood_Magic` are very similar and need clear differentiation or consolidation.
*   **Placeholder Tags:** Generic tags like `DefensiveBuff`, `OffensiveBuff`, `Debuff`, `Control` have high game precedence due to their file order but lack specific mechanics. Their use on gameplay-affecting spells should be avoided or their definitions refined and precedence lowered.

## Implementation Status in `CombatEngine.ts` (Initial Observations)

A full verification of every tag in `CombatEngine.ts` was not completed, but initial review shows:

*   Many core tags related to damage calculation, basic targeting, and some resource mechanics ARE implemented (e.g., `Critical`, `Piercing`, `Armor_Ignoring`, `True_Damage`, `Lifesteal`, `Vampiric`, `Reduced_Cost`, `Blood_Magic`, targeting types like `SingleTarget`, `AreaOfEffect`, etc.).
*   Several tags have `// TODO` comments or lack explicit handling in `CombatEngine.ts` despite being defined (e.g., `Shield`, `Enhancement`, and likely many specific CCs, Buffs, Debuffs beyond generic stat changes).
*   The behavior of implemented tags needs to be compared against their `powerLevel` and `description` in `TAG_DEFINITIONS` to ensure consistency.

## General Recommendations

1.  **Systematic Reordering in `constants.ts`:** Adjust tag order to fix precedence issues, especially for tiered effects and rarities.
2.  **Add Missing `conflictsWith`:** Ensure mutually exclusive tags correctly conflict.
3.  **Define Missing Tags:** Add documented but undefined tags (especially CCs).
4.  **Resolve Redundancies:** Consolidate or clearly differentiate similar tags.
5.  **Refine or Relocate Placeholder Tags:** Avoid using generic tags with high precedence for specific spell effects.
6.  **Implement Tag Logic in `CombatEngine.ts`:** Add game mechanics for defined tags that currently have no effect.
7.  **Thorough Testing:** All changes require extensive testing.

This report should guide further refactoring and bug fixing efforts for the tag system.
