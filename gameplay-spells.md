
# Jorn Gameplay: Spell System

Spells are the cornerstone of a hero's power in Jorn, allowing for a dynamic and customizable combat experience. This document details how spells are generated, utilized, and modified within the game.

## 1. Spell Generation (Spell Crafting)

Players can bring their magical concepts to life through an AI-assisted spell crafting process.

### 1.1. Initiation
-   **Access:** Players can access the "Spell Crafting" screen, typically from the main "Crafting Hub" or directly if guided by game progression (e.g., "Craft New Spell" button in the Character Sheet's Spells tab).
-   **Prompt Input:** On the "Describe Spell Idea" form, the player enters a textual description of the spell they envision (e.g., "A fiery explosion that burns enemies," "A shield of ice that protects me").
-   **Spell Collection Limit:** A player can only hold a certain number of spells in their collection, determined by their level (`player.level + MAX_SPELLS_PER_LEVEL_BASE`). If the collection is full, new spell ideas cannot be generated until the player levels up or (if implemented) discards an existing spell.

### 1.2. AI-Powered Generation
-   When the player submits their idea, a request is sent to the Gemini AI model (`generateSpell` service function).
-   The AI processes the prompt along with a system instruction detailing the expected JSON output format and constraints for spell properties.
-   **Generated Properties:** The AI returns a structured `GeneratedSpellData` object, which includes:
    *   `name`: A cool, concise spell name.
    *   `description`: Flavorful description.
    *   `manaCost`: The MP cost to cast the spell (integer, typically 5-30).
    *   `damage`: Base damage or healing amount (integer, typically 0-50, can be 0 for utility spells).
    *   `damageType`: Type of damage (e.g., 'Fire', 'Ice', 'Physical', 'Healing', 'Arcane').
    *   `scalesWith` (Optional): Specifies if the spell's power scales with 'Body' (usually for Physical) or 'Mind' (for magical/healing). If not provided for damaging spells, a default is assigned based on `damageType`.
    *   `effect` (Optional): Secondary flavor text or minor effect description.
    *   `iconName`: A `SpellIconName` chosen from a predefined list that visually represents the spell.
    *   `statusEffectInflict` (Optional): An object defining a status effect the spell might apply:
        *   `name`: The `StatusEffectName` (e.g., 'Poison', 'Stun', 'StrengthenBody').
        *   `duration`: How many turns the effect lasts (integer, typically 1-3).
        *   `magnitude`: The strength of the effect, if applicable (e.g., damage per turn for 'Poison', stat boost amount).
        *   `chance`: Percentage chance (20-80%) to inflict the status effect.
    *   `resourceCost` (Optional): An array of `ResourceCost` objects (`{ type: ResourceType, quantity: number }`) required to craft the spell. Max 2 resource types, quantity 1-3 per type.
-   **Validation:** The raw AI output is validated and clamped to ensure game balance (e.g., `manaCost` and `damage` within reasonable limits, valid `iconName`, valid `statusEffectInflict` properties).

### 1.3. Confirmation & Crafting
-   **Review:** The player is presented with the AI-generated spell details on a "Spell Craft Confirmation" screen. This includes its name, description, stats, effects, and importantly, the `resourceCost`.
-   **Resource Check:** The game checks if the player possesses the required resources in their inventory (`player.inventory`).
-   **Decision:**
    *   **Confirm:** If the player has sufficient resources and confirms, the resources are deducted from their inventory. The `GeneratedSpellData` is converted into a full `Spell` object (assigning a unique `id`), and this new spell is added to the player's spell collection (`player.spells`).
    *   **Cancel:** The player can choose to cancel, discarding the AI's suggestion without cost.
-   **Outcome:** A successfully crafted spell becomes part of the player's known spells.

```typescript
// Relevant Type: Spell
export interface Spell {
  id: string;             // Unique identifier
  name: string;
  description: string;
  manaCost: number;
  damage: number;         // Base damage or healing amount
  damageType: 'Fire' | 'Ice' | 'Lightning' | 'Physical' | 'Healing' | 'Dark' | 'Light' | 'Arcane' | 'Poison' | 'None';
  scalesWith?: 'Body' | 'Mind'; // Which player stat boosts the spell
  effect?: string;        // Additional flavor or minor effect
  iconName: SpellIconName;
  statusEffectInflict?: SpellStatusEffect;
  resourceCost?: ResourceCost[];
}

// Relevant Type: SpellStatusEffect
export interface SpellStatusEffect {
  name: StatusEffectName;
  duration: number;
  magnitude?: number;
  chance: number;        // Percentage
  description?: string;  // Optional description generated by AI
}
```

## 2. Using Spells

Once crafted, spells must be managed and can then be used in combat.

### 2.1. Spellbook Management
-   **Collection vs. Prepared:** Players have a "Spell Collection" (`player.spells`) containing all spells they have crafted. To use spells in combat, they must be "prepared."
-   **Preparing Spells:** In the Character Sheet ("Spells" tab), players can manage their prepared spells.
    *   They can select spells from their collection to move into their active "Prepared Spells" list (`player.preparedSpellIds`).
    *   They can also unprepare spells, moving them back to the general collection.
-   **Prepared Limit:** The number of spells a player can have prepared at any time is limited by their level (`player.level + PREPARED_SPELLS_PER_LEVEL_BASE`).

### 2.2. In Combat
-   **Selection:** During the player's turn in combat, they can choose to cast any of their currently prepared spells. The UI typically displays these spells in a dedicated "Spells" action category.
-   **Mana Cost:**
    *   Casting a spell deducts its `manaCost` from the player's current Mana Points (MP).
    *   If the player's MP is less than the spell's `manaCost`, the spell cannot be cast. The UI usually indicates this (e.g., grays out the spell, shows a "Low Mana" message).
-   **Targeting:** Most offensive spells require the player to select an enemy target. The current target is tracked by `targetEnemyId`.
-   **Spell Effects & Resolution:**
    1.  **Log:** The action of casting the spell is added to the combat log.
    2.  **Healing Spells:** If `damageType` is 'Healing':
        *   The heal amount is calculated as `spell.damage` + bonus from `player.effectiveStats.magicPower` (if `scalesWith` is 'Mind').
        *   The player's HP is increased, capped at their `maxHp`.
        *   A log message indicates the healing.
    3.  **Damaging Spells:** If `damage` > 0 and not 'Healing':
        *   **Attacker Power:** The relevant player power is determined:
            *   `player.effectiveStats.physicalPower` if `scalesWith` is 'Body'.
            *   `player.effectiveStats.magicPower` if `scalesWith` is 'Mind' (or default for most magical types).
        *   **Effectiveness:**
            *   If `targetEnemy.weakness === spell.damageType`, damage is multiplied (e.g., by 1.5x).
            *   If `targetEnemy.resistance === spell.damageType`, damage is reduced (e.g., by 0.5x).
        *   **Damage Calculation:** `finalDamage = Math.max(1, floor((baseDamage + attackerPower) * effectivenessModifier - defenderDefense))`. (Enemy's defense against the specific damage type is considered; currently simplified to `targetEnemy.mind` for magical or a derived physical defense).
        *   The target enemy's HP is reduced by `actualDamageDealt`.
        *   A log message details the damage, type, and any effectiveness.
    4.  **Status Effect Application:** If the spell has a `statusEffectInflict` property:
        *   A random check is made against `statusEffectInflict.chance`.
        *   If successful, the status effect (`name`, `duration`, `magnitude`) is applied to the target.
        *   If the target already has the same status effect, its duration and/or magnitude might be refreshed or stacked according to game rules (e.g., take the max of existing and new).
        *   A log message indicates the status effect infliction.
    5.  **Enemy Defeat:** If an enemy's HP drops to 0 or below:
        *   The enemy is marked as defeated.
        *   If all enemies are defeated, combat ends in victory, and rewards are processed.
        *   If other enemies remain, the player might need to select a new target.
    6.  **Turn End:** After the spell resolves, the player's turn typically ends, and combat proceeds to the next combatant.

## 3. Editing Spells (Spell Refinement)

Players can modify existing spells in their collection with AI assistance.

### 3.1. Initiation
-   **Access:** From the Spellbook/Collection view in the Character Sheet, players can choose an option to "Edit" a specific spell.
-   **Original Spell:** The selected spell (`originalSpellForEdit`) is identified.
-   **Refinement Prompt:** The player is taken to a "Spell Editing" screen where they can see the original spell's details and provide a textual "refinement prompt" (e.g., "Make this fireball cheaper but weaker," "Add a poison effect to this shadow bolt," "Change the damage type to Ice and increase its cost").

### 3.2. AI-Powered Refinement
-   When the player submits their refinement instructions, a request is sent to the Gemini AI model (`editSpell` service function).
-   The AI receives the original spell's JSON data and the player's refinement prompt.
-   The system instruction guides the AI to modify the spell based on the request, adhering to the same field constraints as new spell generation.
-   The AI returns a `GeneratedSpellData` object representing the proposed changes. This data might include alterations to any of the spell's properties (name, manaCost, damage, status effects, resource costs, etc.).
-   **Validation:** The AI's output is validated and clamped similar to new spell generation. Mana cost and damage might have slightly different ranges (e.g., manaCost 5-40, damage 0-60 for edits).

### 3.3. Confirmation & Update
-   **Review:** The player is presented with the "Spell Edit Confirmation" screen, showing the original spell's key stats and the AI's proposed refined version, including any new `resourceCost` for the edit.
-   **Resource Check:** The game verifies if the player has the resources required for the edit.
-   **Decision:**
    *   **Confirm:** If the player has sufficient resources and confirms, the resources are deducted. The original spell in `player.spells` is updated with the properties from the `GeneratedSpellData`.
    *   **Cancel:** The player can cancel, and the spell remains unchanged.
-   **Outcome:** A successfully refined spell replaces the old version in the player's collection. If the spell was prepared, the prepared version is also updated.

## 4. Other Spell-Related Features

### 4.1. Spell Properties & Data
-   Spells are defined by the `Spell` interface in `types.ts`.
-   Key properties directly impact gameplay:
    *   `manaCost`: Resource consumption.
    *   `damage`: Base effectiveness.
    *   `damageType`: Interaction with enemy weaknesses/resistances.
    *   `scalesWith`: How player stats enhance the spell.
    *   `statusEffectInflict`: Adds tactical depth with secondary effects.
    *   `resourceCost`: Links spell acquisition and modification to the game's economy.
    *   `iconName`: Provides visual identity.

### 4.2. Visual Representation
-   Each spell is associated with an `iconName` (a `SpellIconName`).
-   The `GetSpellIcon` component dynamically renders the correct SVG icon based on this name, ensuring a consistent visual language for different spell types and effects.

### 4.3. Player Stats Interaction
-   **Mind (`player.mind` / `effectiveStats.mind`):** Primarily influences the power of magical spells (elemental, arcane, healing, dark, light, poison) and the player's maximum MP.
-   **Body (`player.body` / `effectiveStats.body`):** Primarily influences the power of physical spells and abilities.
-   The `effectiveStats` (calculated from base stats, equipment, and status effects) are used for spell power calculations.

This comprehensive spell system allows players to creatively engage with magic, tailor their arsenal, and adapt to various combat challenges in the world of Jorn.

## 5. Key Files Involved in the Spell System

The definition, behavior, and management of spells in Jorn are primarily handled by the following files:

-   **`types.ts`**:
    *   Defines the core `Spell` interface, outlining all properties of a spell.
    *   Defines `SpellStatusEffect` for status conditions applied by spells.
    *   Defines `GeneratedSpellData` for the structure of AI-generated spell suggestions.
    *   Defines related types like `SpellIconName`, `StatusEffectName`, `ResourceCost`, `Player`, `PlayerEffectiveStats`, `Enemy`, and `CombatActionLog` which are crucial for spell interaction and effects.

-   **`constants.ts`**:
    *   Contains `STARTER_SPELL` as an initial spell for the player.
    *   Lists `AVAILABLE_SPELL_ICONS`, `AVAILABLE_STATUS_EFFECTS`, `STATUS_EFFECT_ICONS`, `AVAILABLE_RESOURCES` which constrain AI generation and define visual mappings.
    *   Includes `MAX_SPELLS_PER_LEVEL_BASE` and `PREPARED_SPELLS_PER_LEVEL_BASE` determining spell capacity.
    *   Defines constants for stat scaling (e.g., `MAGIC_POWER_PER_MIND`).

-   **`services/geminiService.ts`**:
    *   Hosts the `generateSpell` function, which constructs the prompt for the Gemini API, sends the request, and processes the AI's response to create `GeneratedSpellData`.
    *   Hosts the `editSpell` function, which handles AI-assisted modification of existing spells.
    *   Includes validation logic (`validateGeneratedSpellData`) to ensure AI-generated spell data is balanced and conforms to game rules.

-   **`App.tsx`**:
    *   Manages the `player` state, including `player.spells` (the spell collection) and `player.preparedSpellIds`.
    *   Handles the core logic for spell crafting (`handleInitiateSpellCraft`, `handleConfirmSpellCraft`) and spell editing (`handleInitiateEditSpell`, `handleInitiateSpellRefinement`, `handleConfirmSpellEdit`).
    *   Implements combat mechanics related to spells:
        *   Mana deduction (`player.mp`).
        *   Damage calculation (`calculateDamage`), considering `player.effectiveStats`, `spell.damage`, `spell.damageType`, `spell.scalesWith`, and enemy defenses/weaknesses/resistances.
        *   Healing calculation.
        *   Application of status effects from spells (`spell.statusEffectInflict`).
        *   Updating player and enemy states based on spell effects.
    *   Manages resource deduction for spell crafting/editing (`deductResources`).
    *   Controls UI flow between different game states related to spells (e.g., `SPELL_CRAFTING`, `SPELL_EDITING`, `SPELL_CRAFT_CONFIRMATION`).

-   **`components/SpellCraftingForm.tsx`**:
    *   Provides the UI for the player to input their spell idea prompt.
    *   Triggers the `handleInitiateSpellCraft` function in `App.tsx`.

-   **`components/SpellEditingForm.tsx`**:
    *   Provides the UI for the player to input their refinement instructions for an existing spell.
    *   Triggers the `handleInitiateSpellRefinement` function in `App.tsx`.

-   **`components/ConfirmationView.tsx`**:
    *   Displays the AI-generated spell (for crafting or editing) for player review.
    *   Shows resource costs and checks if the player can afford them.
    *   Handles the final confirmation or cancellation, calling `handleConfirmSpellCraft` or `handleConfirmSpellEdit` in `App.tsx`.

-   **`components/SpellbookDisplay.tsx`** (and its child `SpellCard` component):
    *   Displays lists of spells (e.g., available collection, prepared spells).
    *   `SpellCard` renders individual spell details, including icon, name, mana cost, damage, description, and effects.
    *   Provides UI interactions for preparing/unpreparing spells in the Character Sheet, and selecting spells in combat.

-   **`components/CharacterSheetModal.tsx`**:
    *   The "Spells" tab within this modal uses `SpellbookDisplay` to allow players to manage their spell collection and prepared spells.
    *   Facilitates navigation to spell crafting or editing screens.

-   **`components/CombatView.tsx`**:
    *   Displays prepared spells available for use during combat, typically via `SpellbookDisplay` or a similar mechanism.
    *   Handles player input for selecting spells and targets.
    *   Calls `onPlayerAttack` in `App.tsx` when a spell is cast.

-   **`components/IconComponents.tsx`**:
    *   Contains the `GetSpellIcon` component which dynamically renders the correct SVG icon for a spell based on its `iconName`.
    *   Defines the individual SVG components for all `SpellIconName`s.
```