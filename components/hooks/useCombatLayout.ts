import { useState, useCallback } from 'react';
import { JornBattleConfig, Position, Size, UIElement, GridLayout } from '../../types';

export const useCombatLayout = (initialConfig: JornBattleConfig) => {
  const [currentConfig, setCurrentConfig] = useState(initialConfig);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  const updateElementPosition = useCallback((elementKey: string, newPosition: Position) => {
    setCurrentConfig(prev => {
      const newConfig = { ...prev };
      // Deep copy layout structure
      newConfig.layout = JSON.parse(JSON.stringify(prev.layout));

      if (elementKey === 'actionMenu') {
        newConfig.layout.actionMenu.position = newPosition;
      } else if (elementKey === 'contentArea') {
        newConfig.layout.contentArea.position = newPosition;
      } else if (elementKey === 'battleArea') {
        newConfig.layout.battleArea.position = newPosition;
      } else if (elementKey === 'playerSprite') {
        newConfig.layout.playerSprite.position = newPosition;
        newConfig.playerPosition = newPosition; // Keep classic positioning in sync
      } else if (elementKey.startsWith('enemySprite-')) {
        const index = parseInt(elementKey.split('-')[1]);
        if (newConfig.layout.enemySprites[index]) {
          newConfig.layout.enemySprites[index].position = newPosition;
          newConfig.enemyPositions[index] = newPosition; // Keep classic positioning in sync
        }
      }
      return newConfig;
    }, []);
  }, []);

  const updateElementSize = useCallback((elementKey: string, newSize: Size) => {
    setCurrentConfig(prev => {
      const newConfig = { ...prev };
       // Deep copy layout structure
      newConfig.layout = JSON.parse(JSON.stringify(prev.layout));

      if (elementKey === 'actionMenu') {
        newConfig.layout.actionMenu.size = newSize;
      } else if (elementKey === 'contentArea') {
        newConfig.layout.contentArea.size = newSize;
      } else if (elementKey === 'battleArea') {
        newConfig.layout.battleArea.size = newSize;
      }
      return newConfig;
    });
  }, []);

  const applyPresetLayout = useCallback((preset: string) => {
    const presets: { [key: string]: Partial<JornBattleConfig> } = {
      'classic': {
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 70 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 70 }, size: { width: 30, height: 30 }, visible: true, zIndex: 2 },
          contentArea: { position: { x: 30, y: 70 }, size: { width: 70, height: 30 }, visible: true, zIndex: 2 },
          playerSprite: { position: { x: 75, y: 75 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
          enemySprites: [{ position: { x: 25, y: 30 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 }]
        }
      },
      'wide': {
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 60 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 60 }, size: { width: 20, height: 40 }, visible: true, zIndex: 2 },
          contentArea: { position: { x: 20, y: 60 }, size: { width: 80, height: 40 }, visible: true, zIndex: 2 },
          playerSprite: { position: { x: 80, y: 75 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
          enemySprites: [{ position: { x: 20, y: 25 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 }]
        }
      },
      'mobile': {
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 40 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 40 }, size: { width: 100, height: 30 }, visible: true, zIndex: 2 },
          contentArea: { position: { x: 0, y: 70 }, size: { width: 100, height: 30 }, visible: true, zIndex: 2 },
          playerSprite: { position: { x: 75, y: 30 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 },
          enemySprites: [
            { position: { x: 20, y: 20 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 },
            { position: { x: 10, y: 15 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 },
            { position: { x: 30, y: 18 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 }
          ]
        }
      }
    };

    const presetConfig = presets[preset];
    if (presetConfig) {
      setCurrentConfig(prev => ({ ...prev, ...presetConfig }));
    }
  }, []);
  
  return {
    currentConfig,
    setCurrentConfig,
    isEditMode,
    setIsEditMode,
    selectedElement,
    setSelectedElement,
    updateElementPosition,
    updateElementSize,
    applyPresetLayout,
  };
}; 