import React, { useCallback } from 'react';
import { Position, JornBattleConfig, UIElement, Size } from '../../../types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface ResizeHandlesProps {
  elementKey: string;
  selectedElement: string | null;
  isEditMode: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setResizeHandle: (handle: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setDragStart: (position: Position | null) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  elementKey,
  selectedElement,
  isEditMode,
  containerRef,
  setResizeHandle,
  setIsDragging,
  setIsResizing,
  setDragStart,
}) => {
  if (!isEditMode || selectedElement !== elementKey) return null;

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Ensure we're not in drag mode when starting resize
    setIsResizing(true);
    setResizeHandle(handle);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: (e.clientX - rect.left) / rect.width * 100,
        y: (e.clientY - rect.top) / rect.height * 100
      });
    }
  };

  return (
    <>
      {/* Corner handles */}
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
      <div
        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />

      {/* Edge handles */}
      <div
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white cursor-n-resize"
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      <div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white cursor-s-resize"
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      <div
        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white cursor-w-resize"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      <div
        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white cursor-e-resize"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />
    </>
  );
}; 