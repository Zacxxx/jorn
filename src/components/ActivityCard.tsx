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

  // Enhanced card animation classes
  const cardBaseClasses = "backdrop-blur-md rounded-xl shadow-xl border transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl";
  const cardHoverClasses = "hover:border-opacity-80 hover:-translate-y-1";

  // Debug logging for camp card
  React.useEffect(() => {
    if (isCampCard) {
      console.log('Camp card rendered with background:', currentBackgroundImage);
    }
  }, [isCampCard, currentBackgroundImage]);

  return (
    <div
      className={`relative bg-gradient-to-br ${color} ${cardBaseClasses} ${cardHoverClasses} ${borderColor} p-1.5 cursor-pointer group overflow-hidden h-fit`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Background Illustration with Ambient Effects */}
      <div className={`absolute inset-0 ${isCampCard ? 'opacity-70' : 'opacity-0 group-hover:opacity-15'} transition-all duration-500`}>
        <div className={`w-full h-full ${isCampCard ? 'bg-amber-900/20' : `bg-gradient-to-br ${color.replace('/20', '/40')}`} rounded-xl overflow-hidden`}>
          {/* Unified image rendering logic */}
          <div className="relative w-full h-full">
            <img
              src={currentBackgroundImage} // Use currentBackgroundImage
              alt={`${title} background`}
              className={`w-full h-full object-cover transition-all duration-500 ${
                // Conditional styling based on isHovered and isCampCard
                isHovered ? (isCampCard ? 'opacity-90 scale-110 rotate-1' : 'opacity-80 scale-105') : 'opacity-60 scale-100'
              }`}
              style={{
                // Conditional filter effects
                filter: isHovered && isCampCard ? 'brightness(1.2) contrast(1.2) saturate(1.1)' : (isHovered ? 'brightness(1.1)' : 'brightness(0.8) contrast(0.9)'),
              }}
              onLoad={() => console.log('Background image loaded successfully!')}
              onError={(e) => {
                // Updated onError handler
                console.log('Failed to load background image:', currentBackgroundImage);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Ensure fallback icon illustration is shown
                const fallback = target.closest('.relative')?.querySelector('.fallback-icon-illustration') as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Conditional Camp Card Enhancements */}
            {isCampCard && (
              <>
                {/* Enhanced overlay with gradient animation */}
                <div className={`absolute inset-0 bg-gradient-to-t from-amber-900/50 via-transparent to-amber-900/30 transition-all duration-500 ${
                  isHovered ? 'opacity-50' : 'opacity-80'
                }`} />
                {/* Ambient glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 transition-opacity duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
              </>
            )}
            {/* Ambient background effect for non-camp cards */}
            {!isCampCard && (
              <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${color.replace('/20', '/30')} transition-opacity duration-500 ${
                isHovered ? 'opacity-10' : 'opacity-5'
              }`} />
            )}
          </div>
          
          {/* Enhanced Fallback icon illustration */}
          <div className="hidden w-full h-full fallback-icon-illustration">
            <div className="absolute top-0.5 right-0.5 w-6 h-6 opacity-30">
              <div className={`w-full h-full ${iconColor} scale-[1.5] transform rotate-12 transition-transform duration-300 group-hover:rotate-45`}>
                {icon}
              </div>
            </div>
            <div className="absolute bottom-0.5 left-0.5 w-4 h-4 opacity-20">
              <div className={`w-full h-full ${iconColor} scale-[1.5] transform -rotate-12 transition-transform duration-300 group-hover:-rotate-45`}>
                {icon}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content with Better Typography */}
      <div className={`relative z-10 ${isCampCard && isHovered ? 'drop-shadow-lg' : ''}`}>
        <div className="flex items-center space-x-1.5 mb-0.5">
          <div className={`w-3.5 h-3.5 bg-gradient-to-br ${color} border ${borderColor} rounded-sm flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${
            isCampCard && isHovered ? 'shadow-lg shadow-amber-500/30' : ''
          }`}>
            <div className={`w-2 h-2 ${iconColor} flex items-center justify-center transition-all duration-300`}>
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-semibold transition-all duration-300 truncate leading-none ${
              isCampCard && isHovered 
                ? 'text-white drop-shadow-md' 
                : 'text-slate-100 group-hover:text-white group-hover:scale-105'
            }`}>
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{shortTitle}</span>
            </h4>
          </div>
        </div>
        
        {/* Enhanced Compact Benefits - Single Line with Better Animations */}
        <div className="flex items-center space-x-2 mb-0.5">
          {benefits.slice(0, 2).map((benefit, index) => (
            <div key={index} className={`flex items-center text-xs transition-all duration-300 ${
              isCampCard && isHovered 
                ? 'text-slate-200 drop-shadow-sm' 
                : 'text-slate-400 group-hover:text-slate-300 group-hover:scale-105'
            }`}>
              <div className={`w-0.5 h-0.5 rounded-full ${iconColor} mr-1 opacity-60 flex-shrink-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150`}></div>
              <span className="truncate text-xs">{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* Enhanced Compact Action Footer with Better Interactions */}
        <div className="flex items-center justify-between border-t border-slate-600/20 pt-0.5">
          <div className={`text-xs ${iconColor} font-medium transition-all duration-300 ${
            isCampCard && isHovered 
              ? 'brightness-125 drop-shadow-sm scale-105' 
              : 'group-hover:brightness-110 group-hover:scale-105'
          }`}>
            Access
          </div>
          <div className={`text-xs ${iconColor} transition-all duration-300 ${
            isCampCard && isHovered 
              ? 'opacity-100 drop-shadow-sm scale-110 translate-x-1' 
              : 'opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:translate-x-1'
          }`}>
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard; 