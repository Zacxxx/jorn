import { useEffect, useState, useRef, useCallback } from 'react';
import { Position } from '../types/game';

interface UseCameraProps {
  target: Position;
  tileSize: number;
  viewportWidth: number;
  viewportHeight: number;
  gridWidth: number;
  gridHeight: number;
  smoothing?: number;
  deadZone?: number;
  lookAhead?: number;
  maxSpeed?: number;
  zoom?: number;
}

interface CameraState {
  position: Position;
  velocity: Position;
  shake: Position;
  zoom: number;
  targetZoom: number;
}

export const useCamera = ({
  target,
  tileSize,
  viewportWidth,
  viewportHeight,
  gridWidth,
  gridHeight,
  smoothing = 0.12,
  deadZone = 1.5,
  lookAhead = 2,
  maxSpeed = 8,
  zoom = 1
}: UseCameraProps) => {
  const [cameraState, setCameraState] = useState<CameraState>({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    shake: { x: 0, y: 0 },
    zoom: zoom,
    targetZoom: zoom
  });

  const targetRef = useRef<Position>(target);
  const lastTargetRef = useRef<Position>(target);
  const animationRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Camera shake function
  const shake = useCallback((intensity: number = 5, duration: number = 300) => {
    setCameraState(prev => ({
      ...prev,
      shake: {
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity
      }
    }));

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }

    shakeTimeoutRef.current = setTimeout(() => {
      setCameraState(prev => ({
        ...prev,
        shake: { x: 0, y: 0 }
      }));
    }, duration);
  }, []);

  // Zoom function
  const setZoom = useCallback((newZoom: number, smooth: boolean = true) => {
    setCameraState(prev => ({
      ...prev,
      targetZoom: Math.max(0.5, Math.min(3, newZoom)),
      zoom: smooth ? prev.zoom : Math.max(0.5, Math.min(3, newZoom))
    }));
  }, []);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    const animate = () => {
      setCameraState(prevState => {
        const currentTarget = targetRef.current;
        const lastTarget = lastTargetRef.current;
        
        // Calculate target velocity for look-ahead
        const targetVelocity = {
          x: currentTarget.x - lastTarget.x,
          y: currentTarget.y - lastTarget.y
        };
        
        // Apply look-ahead based on target movement
        const lookAheadTarget = {
          x: currentTarget.x + targetVelocity.x * lookAhead,
          y: currentTarget.y + targetVelocity.y * lookAhead
        };

        // Calculate viewport center
        const centerX = viewportWidth / (2 * prevState.zoom);
        const centerY = viewportHeight / (2 * prevState.zoom);

        // Calculate target position in pixels
        const targetPixelX = lookAheadTarget.x * tileSize + tileSize / 2;
        const targetPixelY = lookAheadTarget.y * tileSize + tileSize / 2;

        // Calculate ideal camera position
        let idealCameraX = targetPixelX - centerX;
        let idealCameraY = targetPixelY - centerY;

        // Apply dead zone with smooth transitions
        const currentCenterX = prevState.position.x + centerX;
        const currentCenterY = prevState.position.y + centerY;
        
        const deltaX = targetPixelX - currentCenterX;
        const deltaY = targetPixelY - currentCenterY;
        
        const deadZonePixels = deadZone * tileSize;
        
        // Smooth dead zone with easing
        const deadZoneFactorX = Math.max(0, (Math.abs(deltaX) - deadZonePixels) / deadZonePixels);
        const deadZoneFactorY = Math.max(0, (Math.abs(deltaY) - deadZonePixels) / deadZonePixels);
        
        if (deadZoneFactorX <= 0) {
          idealCameraX = prevState.position.x;
        } else {
          const easeX = 1 - Math.pow(1 - deadZoneFactorX, 3); // Cubic easing
          idealCameraX = prevState.position.x + deltaX * easeX;
        }
        
        if (deadZoneFactorY <= 0) {
          idealCameraY = prevState.position.y;
        } else {
          const easeY = 1 - Math.pow(1 - deadZoneFactorY, 3); // Cubic easing
          idealCameraY = prevState.position.y + deltaY * easeY;
        }

        // Clamp camera to grid boundaries
        const scaledViewportWidth = viewportWidth / prevState.zoom;
        const scaledViewportHeight = viewportHeight / prevState.zoom;
        const maxCameraX = Math.max(0, gridWidth * tileSize - scaledViewportWidth);
        const maxCameraY = Math.max(0, gridHeight * tileSize - scaledViewportHeight);

        idealCameraX = Math.max(0, Math.min(maxCameraX, idealCameraX));
        idealCameraY = Math.max(0, Math.min(maxCameraY, idealCameraY));

        // Calculate desired velocity
        const desiredVelocityX = (idealCameraX - prevState.position.x) * smoothing;
        const desiredVelocityY = (idealCameraY - prevState.position.y) * smoothing;

        // Apply velocity smoothing and max speed
        const newVelocityX = prevState.velocity.x + (desiredVelocityX - prevState.velocity.x) * 0.3;
        const newVelocityY = prevState.velocity.y + (desiredVelocityY - prevState.velocity.y) * 0.3;

        // Clamp velocity to max speed
        const velocityMagnitude = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
        let finalVelocityX = newVelocityX;
        let finalVelocityY = newVelocityY;

        if (velocityMagnitude > maxSpeed) {
          finalVelocityX = (newVelocityX / velocityMagnitude) * maxSpeed;
          finalVelocityY = (newVelocityY / velocityMagnitude) * maxSpeed;
        }

        // Apply velocity to position
        const newCameraX = prevState.position.x + finalVelocityX;
        const newCameraY = prevState.position.y + finalVelocityY;

        // Smooth zoom interpolation
        const newZoom = prevState.zoom + (prevState.targetZoom - prevState.zoom) * 0.1;

        // Update shake decay
        const newShake = {
          x: prevState.shake.x * 0.9,
          y: prevState.shake.y * 0.9
        };

        // Only update if there's meaningful change
        const threshold = 0.01;
        const positionChanged = Math.abs(newCameraX - prevState.position.x) > threshold || 
                              Math.abs(newCameraY - prevState.position.y) > threshold;
        const velocityChanged = Math.abs(finalVelocityX - prevState.velocity.x) > threshold || 
                              Math.abs(finalVelocityY - prevState.velocity.y) > threshold;
        const zoomChanged = Math.abs(newZoom - prevState.zoom) > 0.001;
        const shakeChanged = Math.abs(newShake.x) > 0.01 || Math.abs(newShake.y) > 0.01;

        if (!positionChanged && !velocityChanged && !zoomChanged && !shakeChanged) {
          return prevState;
        }

        lastTargetRef.current = currentTarget;

        return {
          position: { x: newCameraX, y: newCameraY },
          velocity: { x: finalVelocityX, y: finalVelocityY },
          shake: newShake,
          zoom: newZoom,
          targetZoom: prevState.targetZoom
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [tileSize, viewportWidth, viewportHeight, gridWidth, gridHeight, smoothing, deadZone, lookAhead, maxSpeed]);

  return {
    position: {
      x: cameraState.position.x + cameraState.shake.x,
      y: cameraState.position.y + cameraState.shake.y
    },
    zoom: cameraState.zoom,
    velocity: cameraState.velocity,
    shake,
    setZoom
  };
};
