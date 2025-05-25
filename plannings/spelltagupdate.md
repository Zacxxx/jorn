There are no TODO or FIXME comments left in the recently edited files regarding AOE/tag integration or spell display logic. This means there are no explicit reminders or unfinished code sections flagged by comments in:

SpellbookDisplay.tsx
SpellCraftingForm.tsx
SpellCraftingView.tsx
SpellEditingForm.tsx
SpellEditingView.tsx
TagSelector.tsx
Why Spell Properties Aren't Updating After Edit
The issue where the new version of the spell keeps the old properties (like AOE or tags) after editing is likely because:

The tag selection is only being used as a prompt for the AI/generation step, not actually updating the spell object’s structured data (aoe, targetType, etc.).
When you accept the changes, the backend or spell update logic does not parse the tags and set the correct properties on the spell object.
Plan for Universal Spell Display Refactor
1. Create a Universal SpellCard Component
Centralize all spell display logic (icon, tags, stats, effects, etc.) into a single SpellCard component.
This component should accept a Spell object and display all relevant info, including tags (AOE, Single Target, custom tags).
2. Replace All Spell Displays
Update SpellbookDisplay.tsx, SpellCraftingView.tsx, SpellEditingView.tsx, and any other component that displays spells to use the new SpellCard for consistency.
3. Ensure Tag/Property Sync
When a spell is created or edited, parse the selected tags and update the actual spell properties (aoe, targetType, etc.) accordingly in the spell object.
Store custom tags in a tags: string[] property on the Spell type for future extensibility.
4. Optional: Tag Parsing Utility
Create a utility function to convert between tag arrays and spell properties, and vice versa. Use this in both crafting and editing flows.
Next Steps
Update Spell Type
Add a tags: string[] property to the Spell interface.
Update Crafting/Editing Logic
When a spell is created/edited, set aoe, targetType, and tags based on the selected tags.
Create/Refactor SpellCard
Make a universal, beautiful spell display component.
Replace all in-place spell displays with this component.
(Optional) Utility for Tag ↔ Property Sync
Ensure tags and properties stay in sync.
Would you like to proceed with this refactor, and should I start by drafting the universal SpellCard component and updating the spell type? If you want to see the current spell display logic or backend update logic, let me know which file or function to review!

Feedback submitted
Generating.
