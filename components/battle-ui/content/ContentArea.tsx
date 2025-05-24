import React from 'react';
import { JornBattleConfig } from '../../../types';

interface ContentAreaProps {
  config: JornBattleConfig;
  isEditMode: boolean;
  selectedElement: string | null;
  isDragging: boolean;
  onElementSelect: (element: string) => void;
  onMouseDown: (e: React.MouseEvent, element: string) => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  config,
  isEditMode,
  selectedElement,
  isDragging,
  onElementSelect,
  onMouseDown,
  children,
  containerRef,
}) => {
  return (
    <div
      className={`absolute rounded-lg shadow-md overflow-hidden transition-all duration-200 ${isEditMode ? 'border-2 border-purple-400' : 'border border-slate-700/60'} ${isDragging && selectedElement === 'contentArea' ? 'cursor-move scale-[1.02] shadow-2xl' : ''} ${isEditMode && selectedElement === 'contentArea' ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-slate-900' : ''}`}
      style={{
        left: `${config.layout.contentArea.position.x}%`,
        top: `${config.layout.contentArea.position.y}%`,
        width: `${config.layout.contentArea.size.width}%`,
        height: `${config.layout.contentArea.size.height}%`,
        backgroundColor: config.menuStyle?.backgroundColor,
        borderColor: isEditMode ? undefined : config.messageBoxStyle?.borderColor,
        zIndex: config.layout.contentArea.zIndex
      }}
      onClick={() => isEditMode && onElementSelect('contentArea')}
      onMouseDown={(e) => isEditMode && onMouseDown(e, 'contentArea')}
    >
      <div className="h-full overflow-hidden">
        {children}
      </div>

      {isEditMode && selectedElement === 'contentArea' && (
        <div className="absolute inset-0 border-2 border-purple-500 bg-purple-500/10 pointer-events-none">
          <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded">
            Content Area ({config.layout.contentArea.size.width.toFixed(1)}% × {config.layout.contentArea.size.height.toFixed(1)}%)
          </div>
        </div>
      )}
      {/* Resize Handles are rendered by the parent using the useDragAndDrop hook data */}
    </div>
  );
}; 