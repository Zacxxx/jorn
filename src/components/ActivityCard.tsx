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
}) => {
  const isCampCard = id === 'camp';
  const [isHovered, setIsHovered] = React.useState(false);

  // Debug logging for camp card
  React.useEffect(() => {
    if (isCampCard) {
      console.log('Camp card rendered with background:', backgroundImage);
    }
  }, [isCampCard, backgroundImage]);

  return (
    <div
      className={`relative bg-gradient-to-br ${color} backdrop-blur-sm rounded-lg border ${borderColor} p-2.5 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden h-fit`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Illustration */}
      <div className={`absolute inset-0 ${isCampCard ? 'opacity-70' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}>
        <div className={`w-full h-full ${isCampCard ? 'bg-amber-900/20' : `bg-gradient-to-br ${color.replace('/20', '/40')}`} rounded-lg overflow-hidden`}>
          {isCampCard ? (
            // Special handling for camp card with gif
            <div className="relative w-full h-full">
              <img 
                src={backgroundImage} 
                alt={`${title} background`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'opacity-90 scale-105' : 'opacity-60 scale-100'
                }`}
                style={{
                  filter: isHovered ? 'brightness(1.1) contrast(1.1)' : 'brightness(0.8) contrast(0.9)',
                }}
                onLoad={() => console.log('Camp gif loaded successfully!')}
                onError={(e) => {
                  console.log('Failed to load camp gif:', backgroundImage);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Overlay for better text readability */}
              <div className={`absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-amber-900/20 transition-opacity duration-300 ${
                isHovered ? 'opacity-60' : 'opacity-80'
              }`} />
            </div>
          ) : (
            // Regular image handling for other cards
            <img 
              src={backgroundImage} 
              alt={`${title} background`}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
          )}
          
          {/* Fallback icon illustration */}
          <div className="hidden w-full h-full">
            <div className="absolute top-2 right-2 w-16 h-16 opacity-30">
              <div className={`w-full h-full ${iconColor} scale-[4] transform rotate-12`}>
                {icon}
              </div>
            </div>
            <div className="absolute bottom-1 left-1 w-12 h-12 opacity-20">
              <div className={`w-full h-full ${iconColor} scale-[3] transform -rotate-12`}>
                {icon}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 ${isCampCard && isHovered ? 'drop-shadow-lg' : ''}`}>
        <div className="flex items-center space-x-2 mb-1.5">
          <div className={`w-5 h-5 bg-gradient-to-br ${color} border ${borderColor} rounded-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${
            isCampCard && isHovered ? 'shadow-lg shadow-amber-500/30' : ''
          }`}>
            <div className={`w-3 h-3 ${iconColor} flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold transition-colors truncate ${
              isCampCard && isHovered 
                ? 'text-white drop-shadow-md' 
                : 'text-slate-100 group-hover:text-white'
            }`}>
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{shortTitle}</span>
            </h4>
          </div>
        </div>
        
        <p className={`text-xs transition-colors mb-1.5 line-clamp-2 leading-relaxed ${
          isCampCard && isHovered 
            ? 'text-slate-100 drop-shadow-sm' 
            : 'text-slate-300 group-hover:text-slate-200'
        }`}>
          {description}
        </p>
        
        {/* Compact Benefits Grid */}
        <div className="grid grid-cols-1 gap-0.5 mb-1.5">
          {benefits.slice(0, 2).map((benefit, index) => (
            <div key={index} className={`flex items-center text-xs transition-colors ${
              isCampCard && isHovered 
                ? 'text-slate-200 drop-shadow-sm' 
                : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              <div className={`w-1 h-1 rounded-full ${iconColor} mr-2 opacity-60 flex-shrink-0`}></div>
              <span className="truncate">{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* Compact Action Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-600/20">
          <div className={`text-xs ${iconColor} font-medium transition-all duration-200 ${
            isCampCard && isHovered 
              ? 'brightness-125 drop-shadow-sm' 
              : 'group-hover:brightness-110'
          }`}>
            Access
          </div>
          <div className={`text-xs ${iconColor} transition-opacity duration-200 ${
            isCampCard && isHovered 
              ? 'opacity-100 drop-shadow-sm' 
              : 'opacity-60 group-hover:opacity-100'
          }`}>
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard; 