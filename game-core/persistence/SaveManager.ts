import { LOCAL_STORAGE_KEY } from '../../constants';

/**
 * Save Manager Module
 * Handles game save/load functionality and data persistence
 */

export interface SaveExportResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
}

export interface SaveImportResult {
  success: boolean;
  message: string;
  type: 'success' | 'error';
  requiresRefresh?: boolean;
}

/**
 * Export save data to a downloadable file
 * @returns Result of the export operation
 */
export const exportSaveData = (): SaveExportResult => {
  const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!saveData) {
    return {
      success: false,
      message: "No save data found to export.",
      type: 'error'
    };
  }

  try {
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jorn_save_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Your game data has been downloaded.",
      type: 'success'
    };
  } catch (error) {
    console.error("Error exporting save data:", error);
    return {
      success: false,
      message: "Failed to export save data.",
      type: 'error'
    };
  }
};

/**
 * Import save data from a file
 * @returns Promise that resolves to the import result
 */
export const importSaveData = (): Promise<SaveImportResult> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      
      if (!file) {
        resolve({
          success: false,
          message: "No file selected.",
          type: 'error'
        });
        return;
      }

      try {
        const fileContent = await file.text();
        const parsedContent = JSON.parse(fileContent);
        
        // Basic validation - check if it looks like a valid save file
        if (!parsedContent || typeof parsedContent.level !== 'number') {
          resolve({
            success: false,
            message: "Invalid save file format.",
            type: 'error'
          });
          return;
        }

        // Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, fileContent);
        
        resolve({
          success: true,
          message: "Game data imported successfully. Please refresh the page to apply.",
          type: 'success',
          requiresRefresh: true
        });
      } catch (error) {
        console.error("Error importing save file:", error);
        resolve({
          success: false,
          message: "Could not read or parse the save file.",
          type: 'error'
        });
      }
    };

    // Handle case where user cancels file selection
    input.oncancel = () => {
      resolve({
        success: false,
        message: "File selection cancelled.",
        type: 'error'
      });
    };

    input.click();
  });
};

/**
 * Check if save data exists in localStorage
 * @returns True if save data exists
 */
export const hasSaveData = (): boolean => {
  const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saveData !== null && saveData.trim() !== '';
};

/**
 * Get raw save data from localStorage
 * @returns Save data string or null if not found
 */
export const getRawSaveData = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
};

/**
 * Clear save data from localStorage
 * @returns True if data was cleared successfully
 */
export const clearSaveData = (): boolean => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing save data:", error);
    return false;
  }
};

/**
 * Validate save data format
 * @param saveData - Raw save data string
 * @returns True if save data appears valid
 */
export const validateSaveData = (saveData: string): boolean => {
  try {
    const parsed = JSON.parse(saveData);
    return parsed && typeof parsed.level === 'number';
  } catch {
    return false;
  }
};

/**
 * Create a backup of current save data
 * @returns Backup save data string or null if failed
 */
export const createSaveBackup = (): string | null => {
  const currentSave = getRawSaveData();
  if (!currentSave) return null;

  try {
    const backupKey = `${LOCAL_STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, currentSave);
    return backupKey;
  } catch (error) {
    console.error("Error creating save backup:", error);
    return null;
  }
};

/**
 * Get save file size in bytes
 * @returns Size of save data in bytes, or 0 if no save exists
 */
export const getSaveDataSize = (): number => {
  const saveData = getRawSaveData();
  if (!saveData) return 0;
  
  return new Blob([saveData]).size;
};

/**
 * Save Manager utility functions
 */
export const SaveManagerUtils = {
  exportSaveData,
  importSaveData,
  hasSaveData,
  getRawSaveData,
  clearSaveData,
  validateSaveData,
  createSaveBackup,
  getSaveDataSize,
}; 