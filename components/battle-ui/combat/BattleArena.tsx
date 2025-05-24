import React from 'react';
import { JornBattleConfig } from '../../../types';

interface BattleArenaProps {
  config: JornBattleConfig;
  isEditMode: boolean;
  selectedElement: string | null;
  isDragging: boolean;
  onElementSelect: (element: string) => void;
  onMouseDown: (e: React.MouseEvent, element: string) => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>; // Pass the container ref down
}

export const BattleArena: React.FC<BattleArenaProps> = ({
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
      ref={containerRef} // Attach the ref here
      className={`absolute rounded-lg shadow-inner overflow-hidden transition-all duration-200 ${isEditMode ? 'border-2 border-blue-400' : 'border border-slate-700/60'} ${isDragging && selectedElement === 'battleArea' ? 'cursor-move scale-[1.02] shadow-2xl' : ''} ${isEditMode && selectedElement === 'battleArea' ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900' : ''}`}
      style={{
        left: `${config.layout.battleArea.position.x}%`,
        top: `${config.layout.battleArea.position.y}%`,
        width: `${config.layout.battleArea.size.width}%`,
        height: `${config.layout.battleArea.size.height}%`,
        zIndex: config.layout.battleArea.zIndex
      }}
      onClick={(e) => {
        if (isEditMode) {
          // Only select battle area if clicking on the background, not on sprites
          const target = e.target as HTMLElement;
          const isBackgroundClick = target === e.currentTarget ||
                                  target.closest('.absolute.inset-0') === e.currentTarget.querySelector('.absolute.inset-0');
          if (isBackgroundClick) {
            onElementSelect('battleArea');
          }
        }
      }}
      onMouseDown={(e) => {
        if (isEditMode) {
          // Only handle mouse down on background, not on sprites
          const target = e.target as HTMLElement;
          const isBackgroundClick = target === e.currentTarget ||
                                  target.closest('.absolute.inset-0') === e.currentTarget.querySelector('.absolute.inset-0');
          if (isBackgroundClick) {
            onMouseDown(e, 'battleArea');
          }
        }
      }}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${config.backgroundGradient?.from} ${config.backgroundGradient?.to}`}></div>

      {/* Character Sprites Container */}
      <div className="absolute inset-0">
        {children}
      </div>

      {isEditMode && selectedElement === 'battleArea' && (
        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 pointer-events-none">
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Battle Arena ({config.layout.battleArea.size.width.toFixed(1)}% × {config.layout.battleArea.size.height.toFixed(1)}%)
          </div>
        </div>
      )}
    </div >
  );
}; 