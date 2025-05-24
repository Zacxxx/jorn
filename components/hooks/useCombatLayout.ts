import { useState, useCallback } from 'react';
import { JornBattleConfig, Position, Size, UIElementConfig as UIElement, BattleLayoutConfig as GridLayout } from '../../types';

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
    // Ensure presets provide all required fields from BattleLayoutConfig (defined as GridLayout here)
    // Add placeholders for playerStatus, enemyStatus, actionGrid, turnIndicator, combatLog, dynamicViewContainer if not in original presets
    const presets: { [key: string]: Partial<JornBattleConfig> & { layout: Partial<GridLayout> } } = {
      'classic': {
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 70 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 70 }, size: { width: 30, height: 30 }, visible: true, zIndex: 2 },
          contentArea: { position: { x: 30, y: 70 }, size: { width: 70, height: 30 }, visible: true, zIndex: 2 }, // was dynamicViewContainer?
          playerSprite: { position: { x: 75, y: 75 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
          enemySprites: [{ position: { x: 25, y: 30 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 }],
          // Add required placeholders for BattleLayoutConfig
          playerStatus: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          enemyStatus: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          actionGrid: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          turnIndicator: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          combatLog: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          dynamicViewContainer: { position: { x: 30, y: 70 }, size: { width: 70, height: 30 }, visible: true, zIndex: 2 }, // Assuming contentArea is dynamicViewContainer
        }
      },
      'wide': {
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 60 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 60 }, size: { width: 20, height: 40 }, visible: true, zIndex: 2 },
          contentArea: { position: { x: 20, y: 60 }, size: { width: 80, height: 40 }, visible: true, zIndex: 2 },
          playerSprite: { position: { x: 80, y: 75 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
          enemySprites: [{ position: { x: 20, y: 25 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 }],
          playerStatus: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          enemyStatus: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          actionGrid: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          turnIndicator: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          combatLog: { position: {x: 0, y: 0}, size: {width: 0, height: 0}, visible: false, zIndex: 0},
          dynamicViewContainer: { position: { x: 20, y: 60 }, size: { width: 80, height: 40 }, visible: true, zIndex: 2 },
        }
      },
      'mobile': {
        // canvasWidth: '100%', canvasHeight: '100%', // Example of overriding top-level props too
        layout: {
          battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 40 }, visible: true, zIndex: 1 },
          actionMenu: { position: { x: 0, y: 40 }, size: { width: 100, height: 30 }, visible: true, zIndex: 2 }, // Full width
          contentArea: { position: { x: 0, y: 70 }, size: { width: 100, height: 30 }, visible: true, zIndex: 2 }, // Full width
          playerSprite: { position: { x: 75, y: 30 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 },
          enemySprites: [
            { position: { x: 20, y: 20 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 0.8 },
            // Removed other enemy sprites for simplicity in mobile default, can be added by game logic
          ],
          playerStatus: { position: { x: 5, y: 5 }, size: {width: 90, height: 10}, visible: true, zIndex: 10},
          enemyStatus: { position: {x: 5, y: 15}, size: {width: 90, height: 10}, visible: true, zIndex: 10},
          actionGrid: { position: {x: 0, y: 40}, size: {width: 100, height: 30}, visible: false, zIndex: 5}, // Example, hidden, might be same as actionMenu
          turnIndicator: { position: {x: 45, y: 1}, size: {width: 10, height: 5}, visible: true, zIndex: 10},
          combatLog: { position: {x: 0, y: 70}, size: {width: 100, height: 30}, visible: false, zIndex: 5}, // Example, hidden, might be same as contentArea
          dynamicViewContainer: { position: { x: 0, y: 70 }, size: { width: 100, height: 30 }, visible: true, zIndex: 2 },
        }
      }
    };

    const presetConfig = presets[preset];
    if (presetConfig) {
      // Deep merge the preset into the current config
      setCurrentConfig(prev => ({
        ...prev,
        ...presetConfig,
        layout: {
          ...prev.layout, // Start with previous layout to keep all fields
          ...(presetConfig.layout || {}), // Override with preset layout fields
           // Ensure all required fields from BattleLayoutConfig are present, falling back to prev or a default UIElementConfig
          battleArea: presetConfig.layout?.battleArea || prev.layout.battleArea,
          actionMenu: presetConfig.layout?.actionMenu || prev.layout.actionMenu,
          contentArea: presetConfig.layout?.contentArea || prev.layout.contentArea,
          playerSprite: presetConfig.layout?.playerSprite || prev.layout.playerSprite,
          enemySprites: presetConfig.layout?.enemySprites || prev.layout.enemySprites,
          playerStatus: presetConfig.layout?.playerStatus || prev.layout.playerStatus || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
          enemyStatus: presetConfig.layout?.enemyStatus || prev.layout.enemyStatus || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
          actionGrid: presetConfig.layout?.actionGrid || prev.layout.actionGrid || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
          turnIndicator: presetConfig.layout?.turnIndicator || prev.layout.turnIndicator || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
          combatLog: presetConfig.layout?.combatLog || prev.layout.combatLog || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
          dynamicViewContainer: presetConfig.layout?.dynamicViewContainer || prev.layout.dynamicViewContainer || { position: {x:0,y:0}, size:{w:0,h:0}, zIndex:0, visible:false },
        } as GridLayout, // Assert that the final layout object matches BattleLayoutConfig (aliased as GridLayout)
      }));
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