export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  player: {
    position: Position;
    isMoving: boolean;
    direction: Direction;
    animationFrame: number;
    health: number;
    maxHealth: number;
    speed: number;
  };
  camera: {
    position: Position;
    target: Position;
    smoothing: number;
    zoom: number;
    shake: Position;
  };
  grid: {
    width: number;
    height: number;
    tileSize: number;
  };
  world: {
    obstacles: Position[];
    items: WorldItem[];
    npcs: NPC[];
    effects: Effect[];
  };
  ui: {
    score: number;
    inventory: InventoryItem[];
    notifications: Notification[];
  };
}

export interface MovementDirection {
  x: number;
  y: number;
}

export interface WorldItem {
  id: string;
  position: Position;
  type: 'coin' | 'heart' | 'key' | 'chest' | 'gem' | 'potion';
  collected: boolean;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface NPC {
  id: string;
  position: Position;
  type: 'villager' | 'guard' | 'merchant' | 'enemy' | 'boss';
  direction: Direction;
  health: number;
  maxHealth: number;
  behavior: 'idle' | 'patrol' | 'chase' | 'flee';
  dialogues?: string[];
}

export interface Effect {
  id: string;
  position: Position;
  type: 'explosion' | 'sparkle' | 'smoke' | 'magic' | 'heal';
  duration: number;
  startTime: number;
  intensity: number;
}

export interface InventoryItem {
  id: string;
  type: string;
  quantity: number;
  icon: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  timestamp: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

export const DIRECTION_NAMES: Record<string, Direction> = {
  'w': 'up',
  'arrowup': 'up',
  's': 'down',
  'arrowdown': 'down',
  'a': 'left',
  'arrowleft': 'left',
  'd': 'right',
  'arrowright': 'right',
};

export interface GameConfig {
  GRID_WIDTH: number;
  GRID_HEIGHT: number;
  TILE_SIZE: number;
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  PLAYER_SPEED: number;
  CAMERA_SMOOTHING: number;
  CAMERA_DEAD_ZONE: number;
  CAMERA_LOOK_AHEAD: number;
  MAX_CAMERA_SPEED: number;
}
