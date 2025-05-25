import React, { useMemo } from 'react';

interface GridProps {
  width: number;
  height: number;
  tileSize: number;
  cameraPosition: { x: number; y: number };
  zoom: number;
}

export const Grid: React.FC<GridProps> = ({ width, height, tileSize, cameraPosition, zoom }) => {
  const tiles = useMemo(() => {
    const result = [];
    
    // Calculate visible area with zoom consideration
    const scaledTileSize = tileSize * zoom;
    const viewportWidth = 800;
    const viewportHeight = 600;
    
    const startX = Math.max(0, Math.floor((cameraPosition.x - scaledTileSize) / scaledTileSize));
    const endX = Math.min(width, Math.ceil((cameraPosition.x + viewportWidth + scaledTileSize) / scaledTileSize));
    const startY = Math.max(0, Math.floor((cameraPosition.y - scaledTileSize) / scaledTileSize));
    const endY = Math.min(height, Math.ceil((cameraPosition.y + viewportHeight + scaledTileSize) / scaledTileSize));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const isEven = (x + y) % 2 === 0;
        const isPath = (x % 6 === 0 || y % 6 === 0);
        const isIntersection = (x % 6 === 0 && y % 6 === 0);
        
        let tileClass = 'absolute transition-all duration-300';
        
        if (isIntersection) {
          tileClass += ' bg-yellow-200 border border-yellow-400';
        } else if (isPath) {
          tileClass += ' bg-yellow-100 border border-yellow-300';
        } else {
          tileClass += isEven ? ' bg-green-100 border border-green-200' : ' bg-green-200 border border-green-300';
        }

        // Add subtle pattern for visual interest
        const patternClass = (x + y) % 4 === 0 ? ' opacity-90' : ' opacity-100';

        result.push(
          <div
            key={`${x}-${y}`}
            className={tileClass + patternClass}
            style={{
              left: (x * tileSize - cameraPosition.x) * zoom,
              top: (y * tileSize - cameraPosition.y) * zoom,
              width: scaledTileSize,
              height: scaledTileSize,
              transform: `scale(${1 / zoom})`,
              transformOrigin: 'top left',
            }}
          />
        );
      }
    }
    
    return result;
  }, [width, height, tileSize, cameraPosition, zoom]);

  return <>{tiles}</>;
};
