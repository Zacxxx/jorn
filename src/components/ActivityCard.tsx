import React from 'react';

interface ActivityCardProps {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  benefits: string[];
  color: string;
  borderColor: string;
  iconColor: string;
  backgroundImage: string;
  gifBackgroundImage?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  shortTitle,
  description,
  icon,
  onClick,
  benefits,
  color,
  borderColor,
  iconColor,
  backgroundImage,
  gifBackgroundImage,
}) => {
  const isCampCard = id === 'camp';
  const [isHovered, setIsHovered] = React.useState(false);
  const [gifLoaded, setGifLoaded] = React.useState(false);
  const [gifError, setGifError] = React.useState(false);
  const gifRef = React.useRef<HTMLImageElement>(null);

  // Create static preview image path from GIF path
  const getPreviewImagePath = (gifPath: string) => {
    return gifPath.replace('.gif', '.svg');
  };

  // Preload GIF when hovering starts
  React.useEffect(() => {
    if (isHovered && gifBackgroundImage && !gifLoaded && !gifError) {
      const img = new Image();
      img.onload = () => {
        setGifLoaded(true);
      };
      img.onerror = () => {
        setGifError(true);
      };
      img.src = gifBackgroundImage;
    }
  }, [isHovered, gifBackgroundImage, gifLoaded, gifError]);

  // Determine which background image to use
  const currentBackgroundImage = React.useMemo(() => {
    // Always show static preview by default
    if (!isHovered || !gifBackgroundImage) {
      return getPreviewImagePath(backgroundImage);
    }
    
    // Show GIF only if hovered and loaded successfully
    if (isHovered && gifLoaded && !gifError) {
      return gifBackgroundImage;
    }
    
    // Fallback to static preview
    return getPreviewImagePath(backgroundImage);
  }, [isHovered, backgroundImage, gifBackgroundImage, gifLoaded, gifError]);

  // Enhanced card animation classes - using transform-origin and z-index for contained scaling
  const cardBaseClasses = "backdrop-blur-md rounded-lg shadow-lg border transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden";
  const cardHoverClasses = "hover:border-opacity-80 hover:shadow-xl";

  return (
    <div className="relative w-full h-auto">
      {/* Container that maintains layout space */}
      <div
        className={`relative bg-gradient-to-br ${color} ${cardBaseClasses} ${cardHoverClasses} ${borderColor} p-3 h-full min-h-[120px] transform-gpu origin-center ${
          isHovered ? 'scale-105 z-20' : 'scale-100 z-10'
        }`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transformOrigin: 'center center',
          position: 'relative',
        }}
      >
        {/* Enhanced Background Illustration with Ambient Effects */}
        <div className={`absolute inset-0 ${
      isCampCard
      ? 'opacity-70'
      : (isHovered && gifLoaded && !gifError)
        ? 'opacity-70'
        : 'opacity-0 group-hover:opacity-20'
    } transition-all duration-500 rounded-lg overflow-hidden`}>
          <div className={`w-full h-full ${isCampCard ? 'bg-amber-900/20' : `bg-gradient-to-br ${color.replace('/20', '/40')}`} rounded-lg overflow-hidden`}>
            {/* Unified image rendering logic */}
            <div className="relative w-full h-full">
              {/* Static preview image - always visible */}
              <img
                src={getPreviewImagePath(backgroundImage)}
                alt={`${title} preview`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isHovered && gifLoaded && !gifError ? 'opacity-0' : 'opacity-60'
                } scale-100`}
                style={{
                  filter: 'brightness(0.8) contrast(0.9)',
                }}
              />
              
              {/* GIF image - only visible when hovered and loaded */}
              {gifBackgroundImage && (
                <img
                  ref={gifRef}
                  src={isHovered ? gifBackgroundImage : ''}
                  alt={`${title} animation`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    isHovered && gifLoaded && !gifError ? 'opacity-90 scale-110' : 'opacity-0'
                  }`}
                  style={{
                    filter: isHovered && gifLoaded ? 'brightness(1.2) contrast(1.2) saturate(1.1)' : 'brightness(0.8) contrast(0.9)',
                  }}
                  onLoad={() => setGifLoaded(true)}
                  onError={() => setGifError(true)}
                />
              )}
              
              {/* Loading indicator for GIF */}
              {isHovered && gifBackgroundImage && !gifLoaded && !gifError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Conditional Camp Card Enhancements */}
              {isCampCard && (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-t from-amber-900/50 via-transparent to-amber-900/30 transition-all duration-500 ${
                    isHovered ? 'opacity-50' : 'opacity-80'
                  }`} />
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`} />
                </>
              )}
              {/* Ambient background effect for non-camp cards */}
              {!isCampCard && (
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${color.replace('/20', '/30')} transition-opacity duration-500 ${
                  isHovered ? 'opacity-15' : 'opacity-5'
                }`} />
              )}
            </div>
            
            {/* Enhanced Fallback icon illustration */}
            <div className="hidden w-full h-full fallback-icon-illustration">
              <div className="absolute top-1 right-1 w-8 h-8 opacity-30">
                <div className={`w-full h-full ${iconColor} scale-[1.5] transform rotate-12 transition-transform duration-300 group-hover:rotate-45`}>
                  {icon}
                </div>
              </div>
              <div className="absolute bottom-1 left-1 w-6 h-6 opacity-20">
                <div className={`w-full h-full ${iconColor} scale-[1.5] transform -rotate-12 transition-transform duration-300 group-hover:-rotate-45`}>
                  {icon}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content with Better Typography and Spacing */}
        <div className={`relative z-10 h-full flex flex-col ${isCampCard && isHovered ? 'drop-shadow-lg' : ''}`}>
          {/* Header Section */}
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-6 h-6 bg-gradient-to-br ${color} border ${borderColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
              isCampCard && isHovered ? 'shadow-lg shadow-amber-500/30' : ''
            }`}>
              <div className={`w-4 h-4 ${iconColor} flex items-center justify-center transition-all duration-300`}>
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold transition-all duration-300 truncate leading-tight ${
                isCampCard && isHovered 
                  ? 'text-white drop-shadow-md' 
                  : 'text-slate-100 group-hover:text-white'
              }`}>
                <span className="hidden sm:inline">{title}</span>
                <span className="sm:hidden">{shortTitle}</span>
              </h4>
            </div>
          </div>
          
          {/* Benefits Section - More Compact */}
          <div className="flex-1 mb-2">
            <div className="space-y-1">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className={`flex items-center text-xs transition-all duration-300 ${
                  isCampCard && isHovered 
                    ? 'text-slate-200 drop-shadow-sm' 
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${iconColor} mr-2 opacity-60 flex-shrink-0 transition-all duration-300 group-hover:opacity-100`}></div>
                  <span className="truncate">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-600/30 pt-2 mt-auto">
            <div className={`text-sm ${iconColor} font-semibold transition-all duration-300 ${
              isCampCard && isHovered 
                ? 'brightness-125 drop-shadow-sm' 
                : 'group-hover:brightness-110'
            }`}>
              Access
            </div>
            <div className={`text-sm ${iconColor} transition-all duration-300 ${
              isCampCard && isHovered 
                ? 'opacity-100 drop-shadow-sm translate-x-1' 
                : 'opacity-60 group-hover:opacity-100 group-hover:translate-x-1'
            }`}>
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard; 