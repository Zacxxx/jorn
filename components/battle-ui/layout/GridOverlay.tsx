import React from 'react';
import { JornBattleConfig } from '../../../types';

interface GridOverlayProps {
  config: JornBattleConfig;
  isEditMode: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  config,
  isEditMode,
}) => {
  if (!isEditMode || !config.editMode?.showGrid) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.2) 1px, transparent 1px)`,
        backgroundSize: `${config.editMode.gridSize}px ${config.editMode.gridSize}px`
      }}
    />
  );
}; 