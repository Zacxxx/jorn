import { useCallback, useEffect, useState } from 'react';
import { Position, MovementDirection, DIRECTIONS, Direction, DIRECTION_NAMES } from '../types/game';

interface UseMovementProps {
  initialPosition: Position;
  gridWidth: number;
  gridHeight: number;
  obstacles: Position[];
  speed?: number;
  onMove?: (newPosition: Position, direction: Direction) => void;
  onCollectItem?: (position: Position) => void;
  onCollision?: (position: Position, obstacle: Position) => void;
}

export const useMovement = ({ 
  initialPosition, 
  gridWidth, 
  gridHeight, 
  obstacles,
  speed = 200,
  onMove,
  onCollectItem,
  onCollision
}: UseMovementProps) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<Direction>('down');
  const [animationFrame, setAnimationFrame] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);

  const isObstacle = useCallback((pos: Position) => {
    return obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y);
  }, [obstacles]);

  const isValidPosition = useCallback((pos: Position) => {
    return pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y < gridHeight;
  }, [gridWidth, gridHeight]);

  const movePlayer = useCallback((movementDirection: MovementDirection, newDirection: Direction) => {
    if (isMoving) return;

    const newPosition = {
      x: position.x + movementDirection.x,
      y: position.y + movementDirection.y
    };

    // Always update direction
    setDirection(newDirection);

    // Check bounds
    if (!isValidPosition(newPosition)) {
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), speed * 0.75);
      return;
    }

    // Check obstacles
    if (isObstacle(newPosition)) {
      const obstacle = obstacles.find(obs => obs.x === newPosition.x && obs.y === newPosition.y);
      if (obstacle) {
        onCollision?.(newPosition, obstacle);
      }
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), speed * 0.75);
      return;
    }

    // Valid move
    setIsMoving(true);
    setPosition(newPosition);
    
    // Enhanced animation with more frames
    setAnimationFrame(prev => (prev + 1) % 8);
    
    onMove?.(newPosition, newDirection);
    onCollectItem?.(newPosition);

    setTimeout(() => setIsMoving(false), speed);
  }, [isMoving, position, isObstacle, isValidPosition, onMove, onCollectItem, onCollision, speed]);

  // Smooth movement with key repeat handling
  useEffect(() => {
    const pressedKeys = new Set<string>();
    let moveInterval: NodeJS.Timeout | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      const directionName = DIRECTION_NAMES[event.key.toLowerCase()];
      if (!directionName) return;

      event.preventDefault();
      
      if (!pressedKeys.has(event.key.toLowerCase())) {
        pressedKeys.add(event.key.toLowerCase());
        
        // Immediate first move
        const movementDirection = DIRECTIONS[directionName.toUpperCase() as keyof typeof DIRECTIONS];
        movePlayer(movementDirection, directionName);
        
        // Set up repeat movement
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
          if (pressedKeys.has(event.key.toLowerCase())) {
            movePlayer(movementDirection, directionName);
          }
        }, speed + 50); // Slightly slower repeat
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const directionName = DIRECTION_NAMES[event.key.toLowerCase()];
      if (!directionName) return;

      pressedKeys.delete(event.key.toLowerCase());
      
      if (pressedKeys.size === 0 && moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [movePlayer, speed]);

  const takeDamage = useCallback((amount: number) => {
    setHealth(prev => Math.max(0, prev - amount));
  }, []);

  const heal = useCallback((amount: number) => {
    setHealth(prev => Math.min(maxHealth, prev + amount));
  }, [maxHealth]);

  return { 
    position, 
    isMoving, 
    direction, 
    animationFrame, 
    health,
    maxHealth,
    movePlayer,
    takeDamage,
    heal
  };
};
