import { useState, useCallback, useEffect, useRef } from 'react';
import { Position, JornBattleConfig, Size, UIElement } from '../../types';

interface UseDragAndDropProps {
  config: JornBattleConfig;
  isEditMode: boolean;
  selectedElement: string | null;
  setSelectedElement: (elementKey: string | null) => void;
  updateElementPosition: (elementKey: string, newPosition: Position) => void;
  updateElementSize: (elementKey: string, newSize: Size) => void;
}

export const useDragAndDrop = ({ config, isEditMode, selectedElement, setSelectedElement, updateElementPosition, updateElementSize }: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const snapToGrid = useCallback((value: number) => {
    if (!config.editMode?.snapToGrid) return value;
    const gridSize = config.editMode.gridSize;
    // Prevent division by zero
    if (gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [config.editMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementKey: string) => {
    if (!isEditMode || e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedElement(elementKey);
    setDragStart({
      x: (e.clientX - rect.left) / rect.width * 100,
      y: (e.clientY - rect.top) / rect.height * 100
    });
    setIsDragging(true);
    setIsResizing(false); // Ensure we're not in resize mode when starting drag
    setResizeHandle(null);
  }, [isEditMode, containerRef, setSelectedElement, setDragStart, setIsDragging, setIsResizing, setResizeHandle]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !selectedElement || !dragStart) return;

    const currentMouseX = (e.clientX - rect.left) / rect.width * 100;
    const currentMouseY = (e.clientY - rect.top) / rect.height * 100;

    // Get current element - handle both UI elements and sprites
    let currentElement: UIElement | null = null;
    if (selectedElement.includes('Sprite')) {
      if (selectedElement === 'playerSprite') {
        currentElement = config.layout.playerSprite;
      } else if (selectedElement.startsWith('enemySprite-')) {
        const index = parseInt(selectedElement.split('-')[1]);
        currentElement = config.layout.enemySprites[index];
      }
    } else {
      currentElement = config.layout[selectedElement as keyof typeof config.layout] as UIElement;
    }
    
    if (!currentElement) return;

    if (isDragging) {
      // Handle dragging/moving
      const deltaX = currentMouseX - dragStart.x;
      const deltaY = currentMouseY - dragStart.y;

      let newX, newY;
      
      // Sprites use center-based positioning, UI elements use top-left positioning
      if (selectedElement.includes('Sprite')) {
        // For sprites: position is center, so bounds are different
        const halfWidth = currentElement.size.width / 2;
        const halfHeight = currentElement.size.height / 2;
        newX = snapToGrid(Math.max(halfWidth, Math.min(100 - halfWidth, currentElement.position.x + deltaX)));
        newY = snapToGrid(Math.max(halfHeight, Math.min(100 - halfHeight, currentElement.position.y + deltaY)));
      } else {
        // For UI elements: position is top-left corner
        newX = snapToGrid(Math.max(0, Math.min(100 - currentElement.size.width, currentElement.position.x + deltaX)));
        newY = snapToGrid(Math.max(0, Math.min(100 - currentElement.size.height, currentElement.position.y + deltaY)));
      }

      updateElementPosition(selectedElement, { x: newX, y: newY });
      setDragStart({ x: currentMouseX, y: currentMouseY });
    } else if (isResizing && resizeHandle) {
      // Handle resizing
      const deltaX = currentMouseX - dragStart.x;
      const deltaY = currentMouseY - dragStart.y;

      let newWidth = currentElement.size.width;
      let newHeight = currentElement.size.height;
      let newX = currentElement.position.x;
      let newY = currentElement.position.y;

      switch (resizeHandle) {
        case 'se': // Southeast
          newWidth = Math.max(10, Math.min(100 - currentElement.position.x, currentElement.size.width + deltaX));
          newHeight = Math.max(10, Math.min(100 - currentElement.position.y, currentElement.size.height + deltaY));
          break;
        case 'sw': // Southwest
          newWidth = Math.max(10, Math.min(currentElement.position.x + currentElement.size.width, currentElement.size.width - deltaX));
          newHeight = Math.max(10, Math.min(currentElement.position.y + currentElement.size.height, currentElement.size.height - deltaY));
          newX = Math.max(0, currentElement.position.x + (currentElement.size.width - newWidth));
          break;
        case 'ne': // Northeast
          newWidth = Math.max(10, Math.min(100 - currentElement.position.x, currentElement.size.width + deltaX));
          newHeight = Math.max(10, Math.min(currentElement.position.y + currentElement.size.height, currentElement.size.height - deltaY));
          newY = Math.max(0, currentElement.position.y + (currentElement.size.height - newHeight));
          break;
        case 'nw': // Northwest
          newWidth = Math.max(10, Math.min(currentElement.position.x + currentElement.size.width, currentElement.size.width - deltaX));
          newHeight = Math.max(10, Math.min(currentElement.position.y + currentElement.size.height, currentElement.size.height - deltaY));
          newX = Math.max(0, currentElement.position.x + (currentElement.size.width - newWidth));
          newY = Math.max(0, currentElement.position.y + (currentElement.size.height - newHeight));
          break;
        case 'n': // North
          newHeight = Math.max(10, Math.min(currentElement.position.y + currentElement.size.height, currentElement.size.height - deltaY));
          newY = Math.max(0, currentElement.position.y + (currentElement.size.height - newHeight));
          break;
        case 's': // South
          newHeight = Math.max(10, Math.min(100 - currentElement.position.y, currentElement.size.height + deltaY));
          break;
        case 'w': // West
          newWidth = Math.max(10, Math.min(currentElement.position.x + currentElement.size.width, currentElement.size.width - deltaX));
          newX = Math.max(0, currentElement.position.x + (currentElement.size.width - newWidth));
          break;
        case 'e': // East
          newWidth = Math.max(10, Math.min(100 - currentElement.position.x, currentElement.size.width + deltaX));
          break;
      }

      if (newX !== currentElement.position.x || newY !== currentElement.position.y) {
        updateElementPosition(selectedElement, { x: snapToGrid(newX), y: snapToGrid(newY) });
      }
      if (newWidth !== currentElement.size.width || newHeight !== currentElement.size.height) {
        updateElementSize(selectedElement, { width: snapToGrid(newWidth), height: snapToGrid(newHeight) });
      }
      
      setDragStart({ x: currentMouseX, y: currentMouseY });
    }
  }, [isDragging, isResizing, selectedElement, dragStart, resizeHandle, updateElementPosition, updateElementSize, snapToGrid, config.layout, containerRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragStart(null);
  }, []);

   const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditMode || !selectedElement) return;

    const step = e.shiftKey ? 0.5 : 2; // Fine vs coarse movement
    let currentElement: UIElement | null = null;
     if (selectedElement.includes('Sprite')) {
      if (selectedElement === 'playerSprite') {
        currentElement = config.layout.playerSprite;
      } else if (selectedElement.startsWith('enemySprite-')) {
        const index = parseInt(selectedElement.split('-')[1]);
        currentElement = config.layout.enemySprites[index];
      }
    } else {
      currentElement = config.layout[selectedElement as keyof typeof config.layout] as UIElement;
    }

    if (!currentElement) return;

    let newX = currentElement.position.x;
    let newY = currentElement.position.y;

    switch (e.key) {
      case 'ArrowLeft':
        newX = Math.max(0, currentElement.position.x - step);
        break;
      case 'ArrowRight':
        newX = Math.min(100 - currentElement.size.width, currentElement.position.x + step);
        break;
      case 'ArrowUp':
        newY = Math.max(0, currentElement.position.y - step);
        break;
      case 'ArrowDown':
        newY = Math.min(100 - currentElement.size.height, currentElement.position.y + step);
        break;
      default:
        return;
    }

    e.preventDefault();
    updateElementPosition(selectedElement, { x: snapToGrid(newX), y: snapToGrid(newY) });
  }, [isEditMode, selectedElement, config.layout, updateElementPosition, snapToGrid]);

  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      // Clear states when not in edit mode
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setDragStart(null);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditMode, handleMouseMove, handleMouseUp, handleKeyDown, setIsDragging, setIsResizing, setResizeHandle, setDragStart]);

  return {
    isDragging,
    isResizing,
    dragStart,
    resizeHandle,
    containerRef,
    handleMouseDown,
    handleMouseUp,
    handleKeyDown,
    snapToGrid,
    setDragStart,
    setIsDragging,
    setIsResizing,
    setResizeHandle
  };
}; 