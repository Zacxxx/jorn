# `game-core/persistence/SaveManager.ts`

## Purpose

The `SaveManager.ts` module is responsible for all aspects of game data persistence. Its primary role is to save the current game state to the browser's `localStorage` and load it back. Additionally, it provides functionalities for players to export their save data to a downloadable file and import save data from such a file. The module also includes utility functions for checking the existence and validity of save data, clearing it, creating backups, and determining the size of the save data.

## External Dependencies

*   **`../../constants`**:
    *   `LOCAL_STORAGE_KEY`: A constant string that defines the key used to store and retrieve the game's save data within the browser's `localStorage`.

## Key Interfaces

### `SaveExportResult`
Defines the structure of the result returned when attempting to export save data.
*   `success`: Boolean, indicating if the export operation was successful.
*   `message`: String providing feedback to the player (e.g., "No save data found to export.").
*   `type`: Literal `'success' | 'error'` categorizing the message.

### `SaveImportResult`
Defines the structure of the result returned when attempting to import save data.
*   `success`: Boolean, indicating if the import operation was successful.
*   `message`: String providing feedback to the player.
*   `type`: Literal `'success' | 'error'`.
*   `requiresRefresh?`: Optional boolean. If `true`, it indicates that the game page needs to be refreshed for the imported data to take full effect.

## Core Functionality

All primary functions are exported via the `SaveManagerUtils` object.

### `exportSaveData(): SaveExportResult`

Handles the process of exporting the current game save data to a downloadable JSON file.

1.  Retrieves the raw save data string from `localStorage` using `LOCAL_STORAGE_KEY`.
2.  If no data is found, returns `{ success: false, message: "No save data found...", type: 'error' }`.
3.  Creates a `Blob` object from the save data string with `type: 'application/json'`.
4.  Generates a temporary URL for the blob using `URL.createObjectURL()`.
5.  Programmatically creates an `<a>` (anchor) HTML element:
    *   Sets `a.href` to the blob's URL.
    *   Sets `a.download` to a filename like `jorn_save_YYYY-MM-DD.json`.
6.  Appends the anchor to the document, simulates a click (`a.click()`), and then removes the anchor.
7.  Revokes the object URL using `URL.revokeObjectURL()`.
8.  Returns `{ success: true, message: "Your game data has been downloaded.", type: 'success' }` or an error result if an exception occurs.

### `async importSaveData(): Promise<SaveImportResult>`

Manages the importation of save data from a user-selected JSON file.

1.  Programmatically creates an `<input type="file" accept=".json">` HTML element.
2.  Sets up an `onchange` event handler for the input element:
    *   When a file is selected, it reads the file's content as text using `file.text()`.
    *   Parses the text content as JSON using `JSON.parse()`.
    *   **Basic Validation:** Checks if the parsed content exists and has a `level` property of type `number`. If not, resolves the promise with an error message indicating an invalid save file format.
    *   If valid, stores the original `fileContent` (the raw JSON string) into `localStorage` under `LOCAL_STORAGE_KEY`.
    *   Resolves the promise with `{ success: true, message: "Game data imported...", type: 'success', requiresRefresh: true }`.
3.  Handles cases where no file is selected or the user cancels the file dialog, resolving with an appropriate error message.
4.  Catches errors during file reading or JSON parsing, resolving with an error.
5.  Simulates a click on the input element to open the file selection dialog.

### `hasSaveData(): boolean`

*   Checks if an item exists in `localStorage` for the `LOCAL_STORAGE_KEY` and if its value is not an empty string.
*   Returns `true` if save data is present, `false` otherwise.

### `getRawSaveData(): string | null`

*   Retrieves and returns the raw save data string directly from `localStorage` using `LOCAL_STORAGE_KEY`.
*   Returns `null` if no save data is found.

### `clearSaveData(): boolean`

*   Removes the game's save data from `localStorage` using `localStorage.removeItem(LOCAL_STORAGE_KEY)`.
*   Returns `true` if the operation was successful, `false` if an error occurred.

### `validateSaveData(saveData: string): boolean`

*   Takes a raw save data string as input.
*   Attempts to parse it using `JSON.parse()`.
*   Checks if the parsed object is valid (exists and has a `level` property of type `number`).
*   Returns `true` if the data appears to be in a valid format, `false` otherwise (including if parsing fails).

### `createSaveBackup(): string | null`

*   Retrieves the current raw save data using `getRawSaveData()`.
*   If no current save exists, returns `null`.
*   Creates a backup by storing the current save data into `localStorage` under a new key, which includes a timestamp (e.g., `JORN_GAME_SAVE_backup_1678886400000`).
*   Returns the `backupKey` string if successful, `null` if an error occurs.

### `getSaveDataSize(): number`

*   Retrieves the raw save data string.
*   If no data exists, returns `0`.
*   Otherwise, creates a new `Blob` from the save data string and returns its `size` property (in bytes).

## `SaveManagerUtils`

This object serves as the public API for the module:
```typescript
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
```
It provides a centralized interface for all save and load operations within the game.
