import React from 'react';

interface SpriteAnimationProps {
  imageUrl: string;
  altText?: string;
  style?: React.CSSProperties;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({ 
  imageUrl, 
  altText = 'Sprite Animation', 
  style,
  className = '',
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-700/50 text-slate-400 text-xs ${className}`}
        style={style}
      >
        Failed to load
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={altText} 
      style={style}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default SpriteAnimation;
