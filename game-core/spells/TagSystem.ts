import { TagName, TagDefinition } from '../../types';
import { TAG_DEFINITIONS } from '../../constants';

/**
 * Tag System Module
 * Handles tag precedence, conflicts, and effective tag calculation for spells
 */

// Create a Tag Precedence List
// This list defines the order of precedence for conflicting tags.
// Tags appearing earlier in this list take precedence over later tags.
export const tagPrecedenceList: TagName[] = Object.keys(TAG_DEFINITIONS) as TagName[];

/**
 * Calculate effective tags for a spell, resolving conflicts based on precedence
 * @param spellTags - Array of tag names from a spell
 * @returns Array of effective tags after conflict resolution
 */
export const getEffectiveTags = (spellTags: TagName[] | undefined): TagName[] => {
  if (!spellTags || spellTags.length === 0) {
    return [];
  }

  const effectiveTags: TagName[] = [];
  const tagsToRemove = new Set<TagName>();

  // Initial pass to gather all tags and identify potential conflicts
  for (const tagName of spellTags) {
    if (tagsToRemove.has(tagName)) {
      continue; // Already marked for removal by a higher precedence tag
    }

    const tagDef = TAG_DEFINITIONS[tagName];
    if (!tagDef) {
      console.warn(`Tag definition not found for: ${tagName}`);
      effectiveTags.push(tagName); // Keep it if undefined, though this shouldn't happen
      continue;
    }

    if (tagDef.conflictsWith && tagDef.conflictsWith.length > 0) {
      for (const conflictingTagName of tagDef.conflictsWith) {
        // Check if the conflicting tag is also present in the original spellTags
        if (spellTags.includes(conflictingTagName)) {
          const currentTagIndex = tagPrecedenceList.indexOf(tagName);
          const conflictingTagIndex = tagPrecedenceList.indexOf(conflictingTagName);

          if (currentTagIndex === -1 || conflictingTagIndex === -1) {
            console.warn(`Tag precedence not found for: ${tagName} or ${conflictingTagName}`);
            // Default behavior: if one is not in precedence, keep current, remove conflicting if current is "known"
            if(currentTagIndex !== -1 && !tagsToRemove.has(tagName) && !effectiveTags.includes(tagName)) {
               if(!tagsToRemove.has(conflictingTagName)) tagsToRemove.add(conflictingTagName);
            }
            continue;
          }

          // If currentTag has higher precedence (lower index), mark conflictingTag for removal
          if (currentTagIndex < conflictingTagIndex) {
            if (!tagsToRemove.has(conflictingTagName)) {
              tagsToRemove.add(conflictingTagName);
              console.warn(`Tag Conflict: '${tagName}' (precedence ${currentTagIndex}) takes precedence over '${conflictingTagName}' (precedence ${conflictingTagIndex}). '${conflictingTagName}' will be removed.`);
            }
          } else if (conflictingTagIndex < currentTagIndex) { // If conflictingTag has higher precedence
            if (!tagsToRemove.has(tagName)) {
              tagsToRemove.add(tagName);
              console.warn(`Tag Conflict: '${conflictingTagName}' (precedence ${conflictingTagIndex}) takes precedence over '${tagName}' (precedence ${currentTagIndex}). '${tagName}' will be removed.`);
              // No need to check other conflicts for tagName, as it's being removed
              break;
            }
          }
          // If indices are equal, it implies a setup error or the same tag, do nothing here.
        }
      }
    }
    // If the tag survived conflict checks so far (i.e., not added to tagsToRemove)
    if (!tagsToRemove.has(tagName) && !effectiveTags.includes(tagName)) {
      effectiveTags.push(tagName);
    }
  }

  // Second pass to construct the final list, excluding those marked for removal
  const finalEffectiveTags = spellTags.filter(tag => !tagsToRemove.has(tag));

  // Ensure the order from original spellTags is preserved for non-conflicting tags as much as possible,
  // then add any tags that were pushed to effectiveTags but might have been re-ordered by the set logic.
  // A simpler way is to filter the original list.
  const trulyEffectiveTags = spellTags.filter(tag => !tagsToRemove.has(tag));

  if (spellTags.length !== trulyEffectiveTags.length) {
      console.warn(`Original Tags: [${spellTags.join(', ')}], Effective Tags: [${trulyEffectiveTags.join(', ')}]`);
  }

  return trulyEffectiveTags;
};

/**
 * Get tag definition for a specific tag
 * @param tagName - Name of the tag
 * @returns Tag definition or undefined if not found
 */
export const getTagDefinition = (tagName: TagName): TagDefinition | undefined => {
  return TAG_DEFINITIONS[tagName];
};

/**
 * Check if two tags conflict with each other
 * @param tag1 - First tag name
 * @param tag2 - Second tag name
 * @returns True if tags conflict, false otherwise
 */
export const doTagsConflict = (tag1: TagName, tag2: TagName): boolean => {
  const tag1Def = TAG_DEFINITIONS[tag1];
  const tag2Def = TAG_DEFINITIONS[tag2];
  
  if (!tag1Def || !tag2Def) return false;
  
  return (tag1Def.conflictsWith?.includes(tag2) || tag2Def.conflictsWith?.includes(tag1)) ?? false;
};

/**
 * Get the precedence index of a tag (lower index = higher precedence)
 * @param tagName - Name of the tag
 * @returns Precedence index or -1 if not found
 */
export const getTagPrecedence = (tagName: TagName): number => {
  return tagPrecedenceList.indexOf(tagName);
}; 