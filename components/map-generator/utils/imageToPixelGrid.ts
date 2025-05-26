
import { MAX_GRID_DIMENSION } from '../types';

interface PixelGridResult {
  pixelGrid: string[][];
  gridWidth: number;
  gridHeight: number;
  imageOriginalWidth: number;
  imageOriginalHeight: number;
}

/**
 * Converts an image from a data URI to a pixel grid.
 * @param imageDataUrl The base64 data URI of the image.
 * @param targetGridWidth The desired width of the grid (e.g., 40). Height will be calculated based on aspect ratio.
 * @returns A promise that resolves to an object containing the pixel grid, its dimensions, and original image dimensions.
 */
export const imageToPixelGrid = (
  imageDataUrl: string,
  targetGridWidth: number = 40
): Promise<PixelGridResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const imageOriginalWidth = img.naturalWidth;
      const imageOriginalHeight = img.naturalHeight;

      if (imageOriginalWidth === 0 || imageOriginalHeight === 0) {
        reject(new Error("Image has zero dimensions."));
        return;
      }

      const aspectRatio = imageOriginalWidth / imageOriginalHeight;
      
      let gridWidth = Math.min(targetGridWidth, MAX_GRID_DIMENSION);
      let gridHeight = Math.round(gridWidth / aspectRatio);

      if (gridHeight > MAX_GRID_DIMENSION) {
        gridHeight = MAX_GRID_DIMENSION;
        gridWidth = Math.round(gridHeight * aspectRatio);
      }
      if (gridHeight === 0) gridHeight = 1; // Ensure at least 1 row
      if (gridWidth === 0) gridWidth = 1;   // Ensure at least 1 col


      const canvas = document.createElement('canvas');
      canvas.width = gridWidth;
      canvas.height = gridHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Failed to get 2D context from canvas.'));
        return;
      }

      // Draw the image scaled to the grid dimensions
      ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

      const pixelGrid: string[][] = [];
      try {
        for (let y = 0; y < gridHeight; y++) {
          const row: string[] = [];
          for (let x = 0; x < gridWidth; x++) {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];
            // const a = pixelData[3] / 255; // Alpha if needed
            row.push(`rgb(${r},${g},${b})`);
          }
          pixelGrid.push(row);
        }
        resolve({ pixelGrid, gridWidth, gridHeight, imageOriginalWidth, imageOriginalHeight });
      } catch (error) {
        console.error("Error processing image data:", error);
        reject(new Error('Failed to process image data for pixel grid.'));
      }
    };
    img.onerror = (error) => {
      console.error("Error loading image for pixel grid conversion:", error);
      reject(new Error('Failed to load image for pixel grid conversion.'));
    };
    img.src = imageDataUrl;
  });
};
