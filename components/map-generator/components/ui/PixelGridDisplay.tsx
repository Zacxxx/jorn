
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Place } from '../../types'; 

interface PixelGridDisplayProps {
  pixelGrid: string[][];
  pois: Place[]; 
  onPixelClick: (x: number, y: number) => void; 
  activePoiId: string | null; 
  placingPoiId: string | null; 
  hoveredPixel: { x: number; y: number } | null;
  onPixelHover: (coords: { x: number; y: number } | null) => void;
  isLoading?: boolean;
  pixelGridOpacity: number;
  style?: React.CSSProperties;
  gridDataWidth: number; 
  gridDataHeight: number; 
  imageOriginalWidth?: number; 
  imageOriginalHeight?: number; 
}

const POI_MARKER_SIZE_FACTOR = 0.7; 
const POI_FONT_SIZE_FACTOR = 0.4;  
const POI_ACTIVE_BORDER_COLOR = '#f59e0b'; // amber-500
const POI_DEFAULT_BG_COLOR = 'rgba(217, 119, 6, 0.7)'; // amber-600 with alpha
const POI_HOVER_BG_COLOR = 'rgba(180, 83, 9, 0.8)'; // amber-700 with alpha
const POI_TEXT_COLOR = '#FFFFFF';
const HOVER_CELL_BG = 'rgba(255, 255, 255, 0.25)';
const PLACING_VALID_BORDER = 'rgba(34, 197, 94, 0.9)'; // green-500
const PLACING_INVALID_BORDER = 'rgba(239, 68, 68, 0.9)'; // red-500
const PLACING_HIGHLIGHT_BG = 'rgba(74, 222, 128, 0.3)'; 

const TOOLTIP_BG_COLOR = 'rgba(30, 30, 30, 0.85)';
const TOOLTIP_TEXT_COLOR = '#FFFFFF';
const TOOLTIP_FONT_SIZE_FACTOR = 0.35;
const TOOLTIP_PADDING_X_FACTOR = 0.3;
const TOOLTIP_PADDING_Y_FACTOR = 0.15;
const TOOLTIP_OFFSET_Y_FACTOR = -0.8; // Negative to position above the POI marker cell


const PixelGridDisplay: React.FC<PixelGridDisplayProps> = React.memo(({
  pixelGrid,
  pois, 
  onPixelClick, 
  activePoiId, 
  placingPoiId, 
  hoveredPixel, // This prop is from the parent, indicating generic cell hover
  onPixelHover, // Callback to parent for generic cell hover
  isLoading,
  pixelGridOpacity,
  style,
  gridDataWidth,
  gridDataHeight,
  imageOriginalWidth,
  imageOriginalHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Internal state for tracking the POI specifically hovered for tooltip display
  const [hoveredPoiForTooltip, setHoveredPoiForTooltip] = useState<{ poi: Place; cellX: number, cellY: number } | null>(null);


  const getPoiAtGridCell = useCallback((x: number, y: number): Place | undefined => {
    return pois.find(p => p.gridX === x && p.gridY === y);
  }, [pois]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading) return;
    if (!pixelGrid || pixelGrid.length === 0 || !gridDataWidth || !gridDataHeight) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const logicalWidth = rect.width;
    const logicalHeight = rect.height;

    const cellWidth = logicalWidth / gridDataWidth;
    const cellHeight = logicalHeight / gridDataHeight; 

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    ctx.imageSmoothingEnabled = false;

    // 1. Draw pixel grid background
    ctx.save();
    ctx.globalAlpha = pixelGridOpacity;
    for (let y = 0; y < gridDataHeight; y++) {
      for (let x = 0; x < gridDataWidth; x++) {
        if (pixelGrid[y] && pixelGrid[y][x]) {
          ctx.fillStyle = pixelGrid[y][x];
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }
    ctx.restore();

    // 2. Draw POI markers
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    pois.forEach(poi => {
      if (typeof poi.gridX === 'number' && typeof poi.gridY === 'number') {
        const markerX = (poi.gridX + 0.5) * cellWidth;
        const markerY = (poi.gridY + 0.5) * cellHeight;
        const markerRadius = Math.min(cellWidth, cellHeight) * POI_MARKER_SIZE_FACTOR / 2;

        ctx.beginPath();
        ctx.arc(markerX, markerY, markerRadius, 0, 2 * Math.PI);
        
        const isCurrentlyHoveredForTooltip = hoveredPoiForTooltip?.poi.id === poi.id;
        ctx.fillStyle = (isCurrentlyHoveredForTooltip && !placingPoiId) ? POI_HOVER_BG_COLOR : POI_DEFAULT_BG_COLOR;
        ctx.fill();

        if (poi.id === activePoiId && !placingPoiId) {
          ctx.strokeStyle = POI_ACTIVE_BORDER_COLOR;
          ctx.lineWidth = Math.max(1, markerRadius * 0.2);
          ctx.stroke();
        }
        
        const fontSize = markerRadius * POI_FONT_SIZE_FACTOR * 2;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = POI_TEXT_COLOR;
        ctx.fillText(poi.name.substring(0, 1).toUpperCase(), markerX, markerY + fontSize*0.1);
      }
    });

    // 3. Draw hover/placing highlights (on the cell itself)
    if (hoveredPixel) { // Use prop `hoveredPixel` for cell highlighting
      const existingPoiOnCell = getPoiAtGridCell(hoveredPixel.x, hoveredPixel.y);
      if (placingPoiId) {
        ctx.strokeStyle = existingPoiOnCell ? PLACING_INVALID_BORDER : PLACING_VALID_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(hoveredPixel.x * cellWidth, hoveredPixel.y * cellHeight, cellWidth, cellHeight);
        if (!existingPoiOnCell) {
            ctx.fillStyle = PLACING_HIGHLIGHT_BG;
            ctx.fillRect(hoveredPixel.x * cellWidth, hoveredPixel.y * cellHeight, cellWidth, cellHeight);
        }
      } else if (!existingPoiOnCell) { // Not placing, no POI at hover: generic cell hover
        ctx.fillStyle = HOVER_CELL_BG;
        ctx.fillRect(hoveredPixel.x * cellWidth, hoveredPixel.y * cellHeight, cellWidth, cellHeight);
      }
    }

    // 4. Draw POI Name Tooltip if a POI is specifically hovered
    if (hoveredPoiForTooltip && !placingPoiId) {
      const { poi, cellX, cellY } = hoveredPoiForTooltip;
      
      const tooltipFontSize = Math.min(cellWidth, cellHeight) * TOOLTIP_FONT_SIZE_FACTOR;
      ctx.font = `${tooltipFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom'; // Align text to bottom of tooltip box

      const poiName = poi.name;
      const textMetrics = ctx.measureText(poiName);
      const textWidth = textMetrics.width;
      
      const tooltipPaddingX = cellWidth * TOOLTIP_PADDING_X_FACTOR;
      const tooltipPaddingY = cellHeight * TOOLTIP_PADDING_Y_FACTOR;
      const tooltipWidth = textWidth + 2 * tooltipPaddingX;
      const tooltipHeight = tooltipFontSize + 2 * tooltipPaddingY;

      // Position tooltip above the POI cell's center
      let tooltipX = (cellX + 0.5) * cellWidth - tooltipWidth / 2;
      let tooltipY = (cellY) * cellHeight + (cellHeight * TOOLTIP_OFFSET_Y_FACTOR) - tooltipHeight;


      // Basic boundary adjustment
      if (tooltipX < 0) tooltipX = 0;
      if (tooltipX + tooltipWidth > logicalWidth) tooltipX = logicalWidth - tooltipWidth;
      if (tooltipY < 0) tooltipY = (cellY + 1) * cellHeight + cellHeight * 0.1; // If too high, flip below
      if (tooltipY + tooltipHeight > logicalHeight && tooltipY > (cellY + 1) * cellHeight) { // Check if flipping below also goes out
          tooltipY = logicalHeight - tooltipHeight;
      }


      // Draw tooltip background
      ctx.fillStyle = TOOLTIP_BG_COLOR;
      // Simple rect, could add rounded corners with more path commands
      ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

      // Draw tooltip text
      ctx.fillStyle = TOOLTIP_TEXT_COLOR;
      ctx.fillText(poiName, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight - tooltipPaddingY);
    }
    
  }, [
    pixelGrid, pois, isLoading, hoveredPixel, pixelGridOpacity, activePoiId, placingPoiId, 
    gridDataWidth, gridDataHeight, getPoiAtGridCell, hoveredPoiForTooltip 
  ]);


  const handleMouseEvent = (event: React.MouseEvent<HTMLCanvasElement>, isClick: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || !pixelGrid || pixelGrid.length === 0 || !gridDataWidth || !gridDataHeight) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const cellWidth = rect.width / gridDataWidth;
    const cellHeight = rect.height / gridDataHeight;
    
    const gridX = Math.floor(mouseX / cellWidth);
    const gridY = Math.floor(mouseY / cellHeight);

    if (gridX >= 0 && gridX < gridDataWidth && gridY >= 0 && gridY < gridDataHeight) {
      if (isClick) {
        onPixelClick(gridX, gridY); 
        setHoveredPoiForTooltip(null); // Clear POI-specific hover on click
      } else { // Hover
        onPixelHover({ x: gridX, y: gridY }); // Notify parent about general cell hover
        const poiOnCell = getPoiAtGridCell(gridX, gridY);
        if (poiOnCell && !placingPoiId) {
          if (hoveredPoiForTooltip?.poi.id !== poiOnCell.id) {
             setHoveredPoiForTooltip({ poi: poiOnCell, cellX: gridX, cellY: gridY });
          }
        } else {
          if (hoveredPoiForTooltip) {
             setHoveredPoiForTooltip(null);
          }
        }
      }
    } else { // Mouse out of bounds
      if (!isClick) {
        onPixelHover(null);
        setHoveredPoiForTooltip(null);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => handleMouseEvent(event, false);
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => handleMouseEvent(event, true);
  const handleMouseLeave = () => {
    onPixelHover(null);
    setHoveredPoiForTooltip(null);
  };

  if (isLoading) {
    return (
        <div className="w-full h-full flex justify-center items-center bg-amber-100/70 text-stone-600 text-lg font-medium" style={{...style, aspectRatio: (imageOriginalWidth && imageOriginalHeight) ? `${imageOriginalWidth}/${imageOriginalHeight}` : '1/1'}}>
            Processing pixel grid...
        </div>
    );
  }
  if (!pixelGrid || pixelGrid.length === 0 || !gridDataWidth || !gridDataHeight) {
     return <div className="w-full h-full flex justify-center items-center bg-gray-200 text-lg" style={{...style, aspectRatio: (imageOriginalWidth && imageOriginalHeight) ? `${imageOriginalWidth}/${imageOriginalHeight}` : '1/1'}}>Map data initializing...</div>;
  }

  const cursorStyle = placingPoiId ? (getPoiAtGridCell(hoveredPixel?.x ?? -1, hoveredPixel?.y ?? -1) ? 'not-allowed' : 'copy') : 'default';

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border-2 border-amber-400 shadow-inner bg-transparent"
      style={{ 
        imageRendering: 'pixelated',
        cursor: cursorStyle,
        ...style 
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick} 
      onMouseLeave={handleMouseLeave}
      aria-label={`Interactive Pixel Map. Grid dimensions: ${gridDataWidth} by ${gridDataHeight}. ${placingPoiId ? "Currently placing a Point of Interest. Click a cell to place." : "Hover over a Point of Interest marker to see its name. Click on a marker to see details, or an empty cell."}`}
      role="grid" 
    />
  );
});

export { PixelGridDisplay };
