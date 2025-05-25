import React from 'react';
import ActionButton from './ActionButton';
import { JornBattleConfig } from '../../../types';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface EditModeToolbarProps {
  selectedElement: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onOpenLayoutManager: () => void;
  onExitEditMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  config: JornBattleConfig;
  isDragging: boolean;
  isResizing: boolean;
}

export const EditModeToolbar: React.FC<EditModeToolbarProps> = ({
  selectedElement,
  onUndo,
  onRedo,
  onOpenLayoutManager,
  onExitEditMode,
  canUndo,
  canRedo,
  config,
  isDragging,
  isResizing,
}) => {
  return (
    <div className="absolute top-2 right-2 z-50 bg-slate-800/95 p-3 rounded-lg border border-slate-600 shadow-lg" style={{ fontSize: 'var(--font-ui)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-300">Layout Editor</span>
        <ActionButton
          onClick={onUndo}
          disabled={!canUndo}
          variant="secondary"
          className="!py-1 !px-2 !text-xs"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </ActionButton>
        <ActionButton
          onClick={onRedo}
          disabled={!canRedo}
          variant="secondary"
          className="!py-1 !px-2 !text-xs"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </ActionButton>
        <ActionButton
          onClick={onOpenLayoutManager}
          variant="secondary"
          className="!py-1 !px-2 !text-xs"
        >
          Manage
        </ActionButton>
        <ActionButton
          onClick={onExitEditMode}
          variant="primary"
          className="!py-1 !px-2 !text-xs"
        >
          Done
        </ActionButton>
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div>• Click: Select • Drag: Move • Resize handles: Scale</div>
        <div>• Arrow keys: Move • Shift+Arrow: Fine move • Ctrl+Z/Y: Undo/Redo</div>
        <div>• {selectedElement ? `Selected: ${selectedElement.includes('Sprite') ? selectedElement.replace('Sprite', ' Sprite').replace('-', ' ').replace(/([A-Z])/g, ' $1').trim() : selectedElement}` : 'No element selected'}</div>
        {selectedElement?.includes('Sprite') && (
          <div className="text-yellow-300 text-xs">
            🎭 Sprite selected - Use Yellow/Red rings to identify sprites
          </div>
        )}
        <div className="text-green-300 text-xs">
          Mode: {isDragging ? '📍 Dragging' : isResizing ? '📏 Resizing' : '🖱️ Ready'} | Canvas: {config.canvasWidth}%
        </div>
        {selectedElement?.includes('Sprite') && (
          <div className="text-cyan-300 text-xs">
            🎮 Sprite Position: {selectedElement === 'playerSprite'
              ? `${config.playerPosition.x.toFixed(1)}, ${config.playerPosition.y.toFixed(1)}`
              : selectedElement.startsWith('enemySprite-')
                ? `${config.enemyPositions[parseInt(selectedElement.split('-')[1])]?.x.toFixed(1) || 0}, ${config.enemyPositions[parseInt(selectedElement.split('-')[1])]?.y.toFixed(1) || 0}`
                : 'Unknown'}
          </div>
        )}
      </div>
    </div>
  );
}; 