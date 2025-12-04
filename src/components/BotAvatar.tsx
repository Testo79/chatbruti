import React, { useEffect, useState } from 'react';

export type AvatarExpression = 
  | 'idle' 
  | 'thinking' 
  | 'laughing' 
  | 'smirking' 
  | 'confused' 
  | 'excited'
  | 'philosophical';

interface BotAvatarProps {
  expression?: AvatarExpression;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const BotAvatar: React.FC<BotAvatarProps> = ({ 
  expression = 'idle', 
  size = 'medium',
  animated = true 
}) => {
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isBlinking, setIsBlinking] = useState(false);

  // Effet de clignement aléatoire pour rendre vivant
  useEffect(() => {
    if (!animated) return;
    
    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% de chance de cligner
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, [animated]);

  // Mise à jour de l'expression
  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  const sizeClasses = {
    small: 'w-10 h-10 text-xl',
    medium: 'w-16 h-16 text-3xl',
    large: 'w-24 h-24 text-5xl',
  };

  const getExpressionEmoji = () => {
    switch (currentExpression) {
      case 'laughing':
        return '😂';
      case 'thinking':
        return '🤔';
      case 'smirking':
        return '😏';
      case 'confused':
        return '🤨';
      case 'excited':
        return '🤩';
      case 'philosophical':
        return '🧐';
      case 'idle':
      default:
        return '🧙‍♂️';
    }
  };

  const getAnimationClass = () => {
    if (!animated) return '';
    
    switch (currentExpression) {
      case 'laughing':
        return 'animate-bounce';
      case 'thinking':
        return 'animate-pulse';
      case 'excited':
        return 'animate-wiggle';
      case 'confused':
        return 'animate-tilt';
      default:
        return 'animate-float';
    }
  };

  return (
    <div className="relative inline-block">
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600
          flex items-center justify-center 
          shadow-lg
          transition-all duration-300
          ${getAnimationClass()}
          ${isBlinking ? 'scale-95' : 'scale-100'}
          hover:shadow-2xl hover:scale-110
        `}
      >
        <span className="filter drop-shadow-lg transition-transform duration-200">
          {getExpressionEmoji()}
        </span>
      </div>
      
      {/* Particules magiques autour de l'avatar */}
      {animated && currentExpression === 'excited' && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pixel-accent dark:bg-[#50a0ff] rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pixel-accent dark:bg-[#50a0ff] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </>
      )}
      
      {/* Effet de pensée */}
      {animated && currentExpression === 'thinking' && (
        <div className="absolute -top-2 -right-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotAvatar;

