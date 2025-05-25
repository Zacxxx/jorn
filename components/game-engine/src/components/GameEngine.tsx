import React, { useState, useCallback, useEffect } from 'react';
import { Camera } from './Camera';
import { Grid } from './Grid';
import { Player } from './Player';
import { WorldObjects } from './WorldObjects';
import { GameUI } from './GameUI';
import { useMovement } from '../hooks/useMovement';
import { useCamera } from '../hooks/useCamera';
import { Position, WorldItem, NPC, Direction, GameConfig } from '../types/game';

const GAME_CONFIG: GameConfig = {
  GRID_WIDTH: 60,
  GRID_HEIGHT: 45,
  TILE_SIZE: 48,
  VIEWPORT_WIDTH: 800,
  VIEWPORT_HEIGHT: 600,
  PLAYER_SPEED: 180,
  CAMERA_SMOOTHING: 0.12,
  CAMERA_DEAD_ZONE: 1.5,
  CAMERA_LOOK_AHEAD: 2.5,
  MAX_CAMERA_SPEED: 10,
};

// Enhanced world generation
const generateObstacles = (): Position[] => {
  const obstacles: Position[] = [];
  
  // Create interesting patterns
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(Math.random() * (GAME_CONFIG.GRID_WIDTH - 4)) + 2;
    const y = Math.floor(Math.random() * (GAME_CONFIG.GRID_HEIGHT - 4)) + 2;
    
    // Avoid spawn area
    if (x < 8 && y < 8) continue;
    
    obstacles.push({ x, y });
    
    // Sometimes create clusters
    if (Math.random() < 0.3) {
      const directions = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const clusterX = x + dir.x;
      const clusterY = y + dir.y;
      
      if (clusterX >= 2 && clusterX < GAME_CONFIG.GRID_WIDTH - 2 && 
          clusterY >= 2 && clusterY < GAME_CONFIG.GRID_HEIGHT - 2) {
        obstacles.push({ x: clusterX, y: clusterY });
      }
    }
  }
  
  // Add border walls
  for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
    obstacles.push({ x, y: 0 });
    obstacles.push({ x, y: GAME_CONFIG.GRID_HEIGHT - 1 });
  }
  for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
    obstacles.push({ x: 0, y });
    obstacles.push({ x: GAME_CONFIG.GRID_WIDTH - 1, y });
  }
  
  return obstacles;
};

const generateItems = (): WorldItem[] => {
  const items: WorldItem[] = [];
  const types: WorldItem['type'][] = ['coin', 'heart', 'key', 'chest', 'gem', 'potion'];
  const rarities: WorldItem['rarity'][] = ['common', 'rare', 'epic', 'legendary'];
  
  for (let i = 0; i < 35; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    let rarity: WorldItem['rarity'] = 'common';
    
    // Rarity distribution
    const rarityRoll = Math.random();
    if (rarityRoll < 0.05) rarity = 'legendary';
    else if (rarityRoll < 0.15) rarity = 'epic';
    else if (rarityRoll < 0.35) rarity = 'rare';
    
    const value = {
      common: { coin: 10, heart: 20, key: 30, chest: 50, gem: 25, potion: 15 },
      rare: { coin: 25, heart: 40, key: 60, chest: 100, gem: 50, potion: 30 },
      epic: { coin: 50, heart: 80, key: 120, chest: 200, gem: 100, potion: 60 },
      legendary: { coin: 100, heart: 150, key: 250, chest: 500, gem: 200, potion: 120 }
    };
    
    items.push({
      id: `item-${i}`,
      position: {
        x: Math.floor(Math.random() * (GAME_CONFIG.GRID_WIDTH - 4)) + 2,
        y: Math.floor(Math.random() * (GAME_CONFIG.GRID_HEIGHT - 4)) + 2
      },
      type,
      rarity,
      value: value[rarity][type],
      collected: false
    });
  }
  
  return items;
};

const generateNPCs = (): NPC[] => {
  const npcs: NPC[] = [];
  const types: NPC['type'][] = ['villager', 'guard', 'merchant', 'enemy'];
  const behaviors: NPC['behavior'][] = ['idle', 'patrol', 'chase'];
  
  for (let i = 0; i < 12; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const behavior = type === 'enemy' ? 'patrol' : behaviors[Math.floor(Math.random() * behaviors.length)];
    
    npcs.push({
      id: `npc-${i}`,
      position: {
        x: Math.floor(Math.random() * (GAME_CONFIG.GRID_WIDTH - 4)) + 2,
        y: Math.floor(Math.random() * (GAME_CONFIG.GRID_HEIGHT - 4)) + 2
      },
      type,
      direction: 'down',
      health: type === 'enemy' ? 50 : 100,
      maxHealth: type === 'enemy' ? 50 : 100,
      behavior
    });
  }
  
  return npcs;
};

export const GameEngine: React.FC = () => {
  const [obstacles] = useState<Position[]>(generateObstacles());
  const [items, setItems] = useState<WorldItem[]>(generateItems());
  const [npcs, setNPCs] = useState<NPC[]>(generateNPCs());
  const [score, setScore] = useState(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [gameTime, setGameTime] = useState(0);

  // Game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleCollectItem = useCallback((position: Position) => {
    const item = items.find(item => 
      !item.collected && 
      item.position.x === position.x && 
      item.position.y === position.y
    );
    
    if (item) {
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, collected: true } : i
      ));
      setCollectedItems(prev => [...prev, item.id]);
      setScore(prev => prev + item.value);
      
      // Camera shake for rare items
      if (item.rarity === 'epic' || item.rarity === 'legendary') {
        cameraControls.shake(item.rarity === 'legendary' ? 8 : 5);
      }
    }
  }, [items]);

  const handleCollision = useCallback((position: Position, obstacle: Position) => {
    // Camera shake on collision
    cameraControls.shake(2, 150);
  }, []);

  const { 
    position: playerPosition, 
    isMoving, 
    direction, 
    animationFrame,
    health,
    maxHealth,
    takeDamage,
    heal
  } = useMovement({
    initialPosition: { x: 5, y: 5 },
    gridWidth: GAME_CONFIG.GRID_WIDTH,
    gridHeight: GAME_CONFIG.GRID_HEIGHT,
    obstacles,
    speed: GAME_CONFIG.PLAYER_SPEED,
    onCollectItem: handleCollectItem,
    onCollision: handleCollision,
  });

  const cameraControls = useCamera({
    target: playerPosition,
    tileSize: GAME_CONFIG.TILE_SIZE,
    viewportWidth: GAME_CONFIG.VIEWPORT_WIDTH,
    viewportHeight: GAME_CONFIG.VIEWPORT_HEIGHT,
    gridWidth: GAME_CONFIG.GRID_WIDTH,
    gridHeight: GAME_CONFIG.GRID_HEIGHT,
    smoothing: GAME_CONFIG.CAMERA_SMOOTHING,
    deadZone: GAME_CONFIG.CAMERA_DEAD_ZONE,
    lookAhead: GAME_CONFIG.CAMERA_LOOK_AHEAD,
    maxSpeed: GAME_CONFIG.MAX_CAMERA_SPEED,
  });

  // Keyboard shortcuts for camera controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'q':
          cameraControls.setZoom(cameraControls.zoom - 0.1);
          break;
        case 'e':
          cameraControls.setZoom(cameraControls.zoom + 0.1);
          break;
        case 'r':
          cameraControls.setZoom(1);
          break;
        case 'x':
          cameraControls.shake(10, 500);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cameraControls]);

  const gameStats = {
    score,
    position: playerPosition,
    itemsCollected: collectedItems.length,
    totalItems: items.length,
    direction,
    health,
    maxHealth,
    gameTime,
    zoom: cameraControls.zoom,
    velocity: cameraControls.velocity
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <GameUI stats={gameStats} />

      <Camera 
        width={GAME_CONFIG.VIEWPORT_WIDTH} 
        height={GAME_CONFIG.VIEWPORT_HEIGHT}
        zoom={cameraControls.zoom}
      >
        <Grid
          width={GAME_CONFIG.GRID_WIDTH}
          height={GAME_CONFIG.GRID_HEIGHT}
          tileSize={GAME_CONFIG.TILE_SIZE}
          cameraPosition={cameraControls.position}
          zoom={cameraControls.zoom}
        />
        
        <WorldObjects
          tileSize={GAME_CONFIG.TILE_SIZE}
          cameraPosition={cameraControls.position}
          zoom={cameraControls.zoom}
          obstacles={obstacles}
          items={items}
          npcs={npcs}
        />
        
        <Player
          position={playerPosition}
          tileSize={GAME_CONFIG.TILE_SIZE}
          cameraPosition={cameraControls.position}
          zoom={cameraControls.zoom}
          isMoving={isMoving}
          direction={direction}
          animationFrame={animationFrame}
          health={health}
          maxHealth={maxHealth}
        />
      </Camera>

      <div className="text-xs text-gray-400 max-w-2xl text-center space-y-1">
        <p>Enhanced Zelda-style engine with ultra-smooth camera, advanced collision detection, and rich gameplay</p>
        <p>Controls: WASD/Arrows to move | Q/E to zoom | R to reset zoom | X to shake camera</p>
        <p>Grid: {GAME_CONFIG.GRID_WIDTH}x{GAME_CONFIG.GRID_HEIGHT} | Tile: {GAME_CONFIG.TILE_SIZE}px | Viewport: {GAME_CONFIG.VIEWPORT_WIDTH}x{GAME_CONFIG.VIEWPORT_HEIGHT}px</p>
      </div>
    </div>
  );
};
