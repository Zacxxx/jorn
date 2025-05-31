/**
 * Settings Manager Module
 * Handles game settings, preferences, and configuration
 */

export interface GameSettings {
  useLegacyFooter: boolean;
  debugMode: boolean;
  autoSave: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  combatLogLength: number;
  autoAdvanceDialogue: boolean;
  showDamageNumbers: boolean;
  confirmActions: boolean;
}

export interface SettingsContext {
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

const SETTINGS_STORAGE_KEY = 'jorn-game-settings';

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  useLegacyFooter: false,
  debugMode: false,
  autoSave: true,
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: 'normal',
  combatLogLength: 50,
  autoAdvanceDialogue: false,
  showDamageNumbers: true,
  confirmActions: true,
};

/**
 * Load settings from localStorage
 * @returns Loaded settings or defaults if none exist
 */
export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all settings exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return { ...DEFAULT_SETTINGS };
};

/**
 * Save settings to localStorage
 * @param settings - Settings to save
 * @returns True if save was successful
 */
export const saveSettings = (settings: GameSettings): boolean => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    return false;
  }
};

/**
 * Update a specific setting
 * @param key - Setting key to update
 * @param value - New value for the setting
 * @param context - Settings context
 * @returns Updated settings object
 */
export const updateSetting = <K extends keyof GameSettings>(
  key: K,
  value: GameSettings[K],
  context?: SettingsContext
): GameSettings => {
  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, [key]: value };
  
  const saveSuccess = saveSettings(newSettings);
  
  if (!saveSuccess && context) {
    context.showMessageModal(
      'Settings Error',
      'Failed to save settings. Changes may not persist.',
      'error'
    );
  }
  
  return newSettings;
};

/**
 * Reset all settings to defaults
 * @param context - Settings context
 * @returns Default settings
 */
export const resetSettings = (context?: SettingsContext): GameSettings => {
  const saveSuccess = saveSettings(DEFAULT_SETTINGS);
  
  if (context) {
    if (saveSuccess) {
      context.showMessageModal(
        'Settings Reset',
        'All settings have been reset to their default values.',
        'success'
      );
    } else {
      context.showMessageModal(
        'Settings Error',
        'Failed to reset settings. Please try again.',
        'error'
      );
    }
  }
  
  return { ...DEFAULT_SETTINGS };
};

/**
 * Export settings to a file
 * @param settings - Settings to export
 * @returns JSON string of settings
 */
export const exportSettings = (settings: GameSettings): string => {
  return JSON.stringify(settings, null, 2);
};

/**
 * Import settings from a JSON string
 * @param settingsJson - JSON string containing settings
 * @param context - Settings context
 * @returns Imported settings or null if import failed
 */
export const importSettings = (
  settingsJson: string,
  context?: SettingsContext
): GameSettings | null => {
  try {
    const parsed = JSON.parse(settingsJson);
    
    // Validate that the imported data has the correct structure
    const validatedSettings = validateSettings(parsed);
    
    if (validatedSettings) {
      const saveSuccess = saveSettings(validatedSettings);
      
      if (context) {
        if (saveSuccess) {
          context.showMessageModal(
            'Settings Imported',
            'Settings have been successfully imported.',
            'success'
          );
        } else {
          context.showMessageModal(
            'Import Error',
            'Settings imported but failed to save. Changes may not persist.',
            'error'
          );
        }
      }
      
      return validatedSettings;
    } else {
      if (context) {
        context.showMessageModal(
          'Import Error',
          'Invalid settings format. Please check your settings file.',
          'error'
        );
      }
      return null;
    }
  } catch (error) {
    if (context) {
      context.showMessageModal(
        'Import Error',
        'Failed to parse settings file. Please check the format.',
        'error'
      );
    }
    return null;
  }
};

/**
 * Validate settings object structure
 * @param settings - Settings object to validate
 * @returns Validated settings or null if invalid
 */
const validateSettings = (settings: any): GameSettings | null => {
  if (!settings || typeof settings !== 'object') {
    return null;
  }
  
  const validated: GameSettings = { ...DEFAULT_SETTINGS };
  
  // Validate each setting
  if (typeof settings.useLegacyFooter === 'boolean') {
    validated.useLegacyFooter = settings.useLegacyFooter;
  }
  
  if (typeof settings.debugMode === 'boolean') {
    validated.debugMode = settings.debugMode;
  }
  
  if (typeof settings.autoSave === 'boolean') {
    validated.autoSave = settings.autoSave;
  }
  
  if (typeof settings.soundEnabled === 'boolean') {
    validated.soundEnabled = settings.soundEnabled;
  }
  
  if (typeof settings.musicEnabled === 'boolean') {
    validated.musicEnabled = settings.musicEnabled;
  }
  
  if (['slow', 'normal', 'fast'].includes(settings.animationSpeed)) {
    validated.animationSpeed = settings.animationSpeed;
  }
  
  if (typeof settings.combatLogLength === 'number' && settings.combatLogLength > 0) {
    validated.combatLogLength = Math.min(200, Math.max(10, settings.combatLogLength));
  }
  
  if (typeof settings.autoAdvanceDialogue === 'boolean') {
    validated.autoAdvanceDialogue = settings.autoAdvanceDialogue;
  }
  
  if (typeof settings.showDamageNumbers === 'boolean') {
    validated.showDamageNumbers = settings.showDamageNumbers;
  }
  
  if (typeof settings.confirmActions === 'boolean') {
    validated.confirmActions = settings.confirmActions;
  }
  
  return validated;
};

/**
 * Get animation delay based on speed setting
 * @param speed - Animation speed setting
 * @returns Delay in milliseconds
 */
export const getAnimationDelay = (speed: GameSettings['animationSpeed']): number => {
  switch (speed) {
    case 'slow': return 2000;
    case 'fast': return 500;
    case 'normal':
    default: return 1000;
  }
};

/**
 * Check if a feature should be enabled based on settings
 * @param settings - Current settings
 * @param feature - Feature to check
 * @returns True if feature should be enabled
 */
export const isFeatureEnabled = (
  settings: GameSettings,
  feature: 'sound' | 'music' | 'animations' | 'debug' | 'autoSave'
): boolean => {
  switch (feature) {
    case 'sound': return settings.soundEnabled;
    case 'music': return settings.musicEnabled;
    case 'animations': return settings.animationSpeed !== 'fast'; // Fast = minimal animations
    case 'debug': return settings.debugMode;
    case 'autoSave': return settings.autoSave;
    default: return false;
  }
};

/**
 * Get settings summary for display
 * @param settings - Settings to summarize
 * @returns Human-readable settings summary
 */
export const getSettingsSummary = (settings: GameSettings): string => {
  const lines = [
    `Legacy Footer: ${settings.useLegacyFooter ? 'Enabled' : 'Disabled'}`,
    `Debug Mode: ${settings.debugMode ? 'Enabled' : 'Disabled'}`,
    `Auto Save: ${settings.autoSave ? 'Enabled' : 'Disabled'}`,
    `Sound: ${settings.soundEnabled ? 'Enabled' : 'Disabled'}`,
    `Music: ${settings.musicEnabled ? 'Enabled' : 'Disabled'}`,
    `Animation Speed: ${settings.animationSpeed}`,
    `Combat Log Length: ${settings.combatLogLength} entries`,
    `Auto Advance Dialogue: ${settings.autoAdvanceDialogue ? 'Enabled' : 'Disabled'}`,
    `Show Damage Numbers: ${settings.showDamageNumbers ? 'Enabled' : 'Disabled'}`,
    `Confirm Actions: ${settings.confirmActions ? 'Enabled' : 'Disabled'}`,
  ];
  
  return lines.join('\n');
};

/**
 * Settings Manager utility functions
 */
export const SettingsManagerUtils = {
  loadSettings,
  saveSettings,
  updateSetting,
  resetSettings,
  exportSettings,
  importSettings,
  getAnimationDelay,
  isFeatureEnabled,
  getSettingsSummary,
}; 