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
    >
      {/* Background Illustration */}
      <div className={`absolute inset-0 ${isCampCard ? 'opacity-90' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}>
        <div className={`w-full h-full ${isCampCard ? 'bg-amber-900/30' : `bg-gradient-to-br ${color.replace('/20', '/40')}`} rounded-lg overflow-hidden`}>
          {isCampCard ? (
            // Special handling for camp card with gif
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onLoad={() => console.log('Camp background div rendered')}
            />
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
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-1.5">
          <div className={`w-5 h-5 bg-gradient-to-br ${color} border ${borderColor} rounded-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
            <div className={`w-3 h-3 ${iconColor} flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{shortTitle}</span>
            </h4>
          </div>
        </div>
        
        <p className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors mb-1.5 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* Compact Benefits Grid */}
        <div className="grid grid-cols-1 gap-0.5 mb-1.5">
          {benefits.slice(0, 2).map((benefit, index) => (
            <div key={index} className="flex items-center text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              <div className={`w-1 h-1 rounded-full ${iconColor} mr-2 opacity-60 flex-shrink-0`}></div>
              <span className="truncate">{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* Compact Action Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-600/20">
          <div className={`text-xs ${iconColor} font-medium group-hover:brightness-110 transition-all duration-200`}>
            Access
          </div>
          <div className={`text-xs ${iconColor} opacity-60 group-hover:opacity-100 transition-opacity duration-200`}>
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard; 