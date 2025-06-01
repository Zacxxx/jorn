import React from 'react';

interface SpriteAnimationProps {
  imageUrl: string;
  altText?: string;
  style?: React.CSSProperties; // Added style prop
}

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({ imageUrl, altText, style }) => {
  return (
    <img src={imageUrl} alt={altText || 'Sprite Animation'} style={style} /> // Applied style prop
  );
};

export default SpriteAnimation;
