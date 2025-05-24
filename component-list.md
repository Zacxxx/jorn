# Component Documentation

This document provides a detailed overview of all components in the Jorn RPG game, their relationships, and their purposes.

## Core Components

### Layout Components

#### Header.tsx
- **Purpose**: Main navigation header component
- **Dependencies**: None
- **Features**: Navigation menu, game title display
- **Usage**: Present at the top of all main views

#### Footer.tsx
- **Purpose**: Application footer with additional information
- **Dependencies**: None
- **Features**: Version info, links, copyright
- **Usage**: Present at the bottom of all main views

#### Modal.tsx
- **Purpose**: Reusable modal component
- **Dependencies**: None
- **Features**: Backdrop, close functionality, customizable content
- **Usage**: Used by various modal components for consistent UI

### Battle System Components

#### CombatView.tsx
- **Purpose**: Main combat interface
- **Dependencies**: 
  - PlayerBattleDisplay
  - EnemyBattleDisplay
  - CombatLogDisplay
- **Features**: Turn-based combat system, action selection
- **Usage**: Primary combat screen

#### PlayerBattleDisplay.tsx
- **Purpose**: Player character display during combat
- **Dependencies**: PlayerStatsDisplay
- **Features**: Health, mana, status effects display
- **Usage**: Used in CombatView

#### EnemyBattleDisplay.tsx
- **Purpose**: Enemy character display during combat
- **Dependencies**: EnemyDisplay
- **Features**: Enemy stats, status effects
- **Usage**: Used in CombatView

#### CombatLogDisplay.tsx
- **Purpose**: Combat action and event logging
- **Dependencies**: None
- **Features**: Scrollable combat history
- **Usage**: Used in CombatView

### Character Management

#### CharacterSheetModal.tsx
- **Purpose**: Detailed character information display
- **Dependencies**: 
  - PlayerStatsDisplay
  - SpellbookDisplay
- **Features**: Character stats, equipment, abilities
- **Usage**: Accessible from main menu

#### PlayerStatsDisplay.tsx
- **Purpose**: Player statistics display
- **Dependencies**: None
- **Features**: Stats, attributes, experience
- **Usage**: Used in CharacterSheetModal and combat

### Spell System

#### SpellbookDisplay.tsx
- **Purpose**: Spell management interface
- **Dependencies**: None
- **Features**: Spell list, casting interface
- **Usage**: Used in CharacterSheetModal

#### AbilityBookDisplay.tsx
- **Purpose**: Ability management interface
- **Dependencies**: None
- **Features**: Ability list, usage interface
- **Usage**: Used in CharacterSheetModal

#### SpellCraftingView.tsx
- **Purpose**: Spell creation interface
- **Dependencies**: SpellCraftingForm
- **Features**: Spell customization, effects
- **Usage**: Accessible from crafting hub

#### SpellEditingView.tsx
- **Purpose**: Spell modification interface
- **Dependencies**: SpellEditingForm
- **Features**: Spell editing, effect modification
- **Usage**: Accessible from spell management

### Crafting System

#### CraftingHubModal.tsx
- **Purpose**: Central crafting interface
- **Dependencies**: 
  - ItemCraftingForm
  - SpellCraftingForm
  - TraitCraftingForm
- **Features**: Access to all crafting systems
- **Usage**: Main crafting screen

#### ItemCraftingForm.tsx
- **Purpose**: Item creation interface
- **Dependencies**: None
- **Features**: Item customization, requirements
- **Usage**: Used in CraftingHubModal

#### TraitCraftingForm.tsx
- **Purpose**: Trait creation interface
- **Dependencies**: None
- **Features**: Trait customization, effects
- **Usage**: Used in CraftingHubModal

### Game Management

#### GameMenuModal.tsx
- **Purpose**: Main game menu
- **Dependencies**: None
- **Features**: Save, load, settings, quit
- **Usage**: Accessible from main game screen

#### HelpWikiModal.tsx
- **Purpose**: Game help and documentation
- **Dependencies**: None
- **Features**: Game guides, tutorials
- **Usage**: Accessible from main menu

#### GameOverView.tsx
- **Purpose**: Game over screen
- **Dependencies**: None
- **Features**: Score display, restart options
- **Usage**: Shown on player death

### Utility Components

#### ActionButton.tsx
- **Purpose**: Reusable button component
- **Dependencies**: None
- **Features**: Customizable styles, states
- **Usage**: Throughout the application

#### LoadingSpinner.tsx
- **Purpose**: Loading indicator
- **Dependencies**: None
- **Features**: Animated loading display
- **Usage**: During async operations

#### IconComponents.tsx
- **Purpose**: Game icon library
- **Dependencies**: None
- **Features**: Reusable game icons
- **Usage**: Throughout the application

## Component Relationships

### Main Flow
```
HomeScreenView
├── GameMenuModal
├── CharacterSheetModal
│   ├── PlayerStatsDisplay
│   ├── SpellbookDisplay
│   └── AbilityBookDisplay
└── CombatView
    ├── PlayerBattleDisplay
    ├── EnemyBattleDisplay
    └── CombatLogDisplay
```

### Crafting System
```
CraftingHubModal
├── ItemCraftingForm
├── SpellCraftingForm
└── TraitCraftingForm
```

## Development Guidelines

1. **Component Creation**
   - Follow existing naming conventions
   - Implement TypeScript interfaces
   - Use existing styling patterns
   - Document props and usage

2. **State Management**
   - Use React hooks for local state
   - Follow established patterns for global state
   - Document state dependencies

3. **Performance Considerations**
   - Implement proper memoization
   - Use lazy loading where appropriate
   - Optimize re-renders

4. **Testing**
   - Write unit tests for new components
   - Test component interactions
   - Verify accessibility

## Future Considerations

1. **Potential Improvements**
   - Implement component lazy loading
   - Add more comprehensive error boundaries
   - Enhance accessibility features
   - Add animation system

2. **Scalability**
   - Consider breaking down larger components
   - Implement better state management solutions
   - Add performance monitoring

3. **Maintenance**
   - Regular dependency updates
   - Code quality improvements
   - Documentation updates 