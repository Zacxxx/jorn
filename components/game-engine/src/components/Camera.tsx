import React from 'react';

interface CameraProps {
  children: React.ReactNode;
  width: number;
  height: number;
  zoom: number;
}

export const Camera: React.FC<CameraProps> = ({ children, width, height, zoom }) => {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 border-4 border-yellow-600 rounded-xl shadow-2xl"
      style={{ width, height }}
    >
      {/* Game world container with zoom */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
      
      {/* Enhanced overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
        
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-yellow-400 opacity-60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-yellow-400 opacity-60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-yellow-400 opacity-60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-400 opacity-60" />
        
        {/* Scan lines effect */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: Math.floor(height / 4) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-white"
              style={{ top: i * 4 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
