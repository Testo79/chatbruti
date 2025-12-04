import React, { useState, useEffect } from 'react';

type Expression = 
  | 'idle' 
  | 'thinking' 
  | 'excited' 
  | 'confused' 
  | 'surprised'
  | 'serious'
  | 'listening';

interface FloatingAvatarProps {
  lastUserMessage?: string;
  isTyping?: boolean;
}

const FloatingAvatar: React.FC<FloatingAvatarProps> = ({ 
  lastUserMessage = '', 
  isTyping = false 
}) => {
  const [currentExpression, setCurrentExpression] = useState<Expression>('idle');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isTyping) {
      setCurrentExpression('thinking');
      return;
    }

    if (!lastUserMessage) {
      setCurrentExpression('idle');
      return;
    }

    const messageLower = lastUserMessage.toLowerCase();

    if (
      messageLower.includes('pourquoi') ||
      messageLower.includes('comment') ||
      messageLower.includes('explique') ||
      messageLower.includes('qu\'est-ce') ||
      messageLower.includes('définition')
    ) {
      setCurrentExpression('thinking');
    }
    else if (
      messageLower.includes('!') ||
      messageLower.includes('génial') ||
      messageLower.includes('super') ||
      messageLower.includes('cool') ||
      messageLower.includes('merci')
    ) {
      setCurrentExpression('excited');
    }
    else if (
      messageLower.includes('bizarre') ||
      messageLower.includes('wtf') ||
      messageLower.includes('quoi') ||
      messageLower.includes('sérieux') ||
      messageLower.includes('vraiment')
    ) {
      setCurrentExpression('confused');
    }
    else if (
      messageLower.includes('vraiment') ||
      messageLower.includes('incroyable') ||
      messageLower.includes('wow')
    ) {
      setCurrentExpression('surprised');
    }
    else if (
      messageLower.includes('important') ||
      messageLower.includes('grave') ||
      messageLower.includes('problème')
    ) {
      setCurrentExpression('serious');
    }
    else {
      setCurrentExpression('listening');
    }
  }, [lastUserMessage, isTyping]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Pixel art wizard - simplified 8-bit style
  const renderPixelWizard = () => {
    // Colors
    const hatColor = '#1a1a2e';
    const hatStarColor = '#50a0ff'; // Bleu
    const faceColor = '#f4d1ae';
    const beardColor = '#8b7355';
    const robeColor = '#6a4c93';
    const staffColor = '#8b7355';
    const gemColor = '#50a0ff'; // Bleu
    const eyeColor = '#000000';
    const eyeOpenColor = '#50a0ff'; // Bleu
    const mouthColor = '#000000';

    return (
      <svg 
        width="120" 
        height="160" 
        viewBox="0 0 100 140" 
        className="drop-shadow-2xl"
        style={{ 
          overflow: 'visible',
          imageRendering: 'pixelated'
        }}
      >
        {/* Pixel art wizard - drawn with rectangles for authentic pixel look */}
        
        {/* Hat - pixel art style */}
        <rect x="30" y="5" width="40" height="8" fill={hatColor} />
        <rect x="25" y="13" width="50" height="6" fill={hatColor} />
        <rect x="20" y="19" width="60" height="4" fill={hatColor} />
        {/* Hat star */}
        <rect x="48" y="7" width="4" height="4" fill={hatStarColor} />
        <rect x="46" y="9" width="8" height="2" fill={hatStarColor} />
        <rect x="48" y="11" width="4" height="2" fill={hatStarColor} />

        {/* Face - pixel art style */}
        <rect x="25" y="30" width="50" height="40" fill={faceColor} />
        {/* Face outline */}
        <rect x="25" y="30" width="50" height="2" fill="#000000" />
        <rect x="25" y="30" width="2" height="40" fill="#000000" />
        <rect x="73" y="30" width="2" height="40" fill="#000000" />
        <rect x="25" y="68" width="50" height="2" fill="#000000" />

        {/* Beard - pixel art style */}
        <rect x="20" y="55" width="60" height="20" fill={beardColor} />
        <rect x="20" y="55" width="60" height="2" fill="#000000" />
        <rect x="20" y="55" width="2" height="20" fill="#000000" />
        <rect x="78" y="55" width="2" height="20" fill="#000000" />
        <rect x="20" y="73" width="60" height="2" fill="#000000" />
        {/* Beard details */}
        <rect x="25" y="60" width="10" height="2" fill="#6b5a45" />
        <rect x="65" y="60" width="10" height="2" fill="#6b5a45" />
        <rect x="30" y="65" width="8" height="2" fill="#6b5a45" />
        <rect x="62" y="65" width="8" height="2" fill="#6b5a45" />

        {/* Eyes - pixel art style */}
        {isBlinking ? (
          <>
            {/* Closed eyes */}
            <rect x="35" y="42" width="12" height="2" fill={eyeColor} />
            <rect x="53" y="42" width="12" height="2" fill={eyeColor} />
          </>
        ) : (
          <>
            {currentExpression === 'thinking' ? (
              <>
                {/* Eyes looking up */}
                <rect x="35" y="38" width="12" height="8" fill={eyeOpenColor} />
                <rect x="35" y="38" width="12" height="2" fill={eyeColor} />
                <rect x="35" y="38" width="2" height="8" fill={eyeColor} />
                <rect x="45" y="38" width="2" height="8" fill={eyeColor} />
                <rect x="35" y="44" width="12" height="2" fill={eyeColor} />
                <rect x="38" y="40" width="6" height="4" fill={eyeColor} />
                
                <rect x="53" y="38" width="12" height="8" fill={eyeOpenColor} />
                <rect x="53" y="38" width="12" height="2" fill={eyeColor} />
                <rect x="53" y="38" width="2" height="8" fill={eyeColor} />
                <rect x="63" y="38" width="2" height="8" fill={eyeColor} />
                <rect x="53" y="44" width="12" height="2" fill={eyeColor} />
                <rect x="56" y="40" width="6" height="4" fill={eyeColor} />
              </>
            ) : currentExpression === 'excited' ? (
              <>
                {/* Star eyes */}
                <rect x="35" y="40" width="12" height="8" fill={hatStarColor} />
                <rect x="35" y="40" width="12" height="2" fill={eyeColor} />
                <rect x="35" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="45" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="35" y="46" width="12" height="2" fill={eyeColor} />
                <rect x="40" y="42" width="2" height="4" fill={eyeColor} />
                
                <rect x="53" y="40" width="12" height="8" fill={hatStarColor} />
                <rect x="53" y="40" width="12" height="2" fill={eyeColor} />
                <rect x="53" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="63" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="53" y="46" width="12" height="2" fill={eyeColor} />
                <rect x="58" y="42" width="2" height="4" fill={eyeColor} />
              </>
            ) : currentExpression === 'confused' ? (
              <>
                {/* Diagonal eyes */}
                <rect x="33" y="42" width="10" height="6" fill={eyeOpenColor} transform="rotate(-10 38 45)" />
                <rect x="57" y="40" width="10" height="6" fill={eyeOpenColor} transform="rotate(10 62 43)" />
                <rect x="35" y="44" width="6" height="2" fill={eyeColor} />
                <rect x="59" y="42" width="6" height="2" fill={eyeColor} />
              </>
            ) : currentExpression === 'surprised' ? (
              <>
                {/* Big round eyes */}
                <rect x="33" y="38" width="14" height="12" fill={eyeOpenColor} />
                <rect x="33" y="38" width="14" height="2" fill={eyeColor} />
                <rect x="33" y="38" width="2" height="12" fill={eyeColor} />
                <rect x="45" y="38" width="2" height="12" fill={eyeColor} />
                <rect x="33" y="48" width="14" height="2" fill={eyeColor} />
                <rect x="38" y="42" width="4" height="4" fill={eyeColor} />
                
                <rect x="53" y="38" width="14" height="12" fill={eyeOpenColor} />
                <rect x="53" y="38" width="14" height="2" fill={eyeColor} />
                <rect x="53" y="38" width="2" height="12" fill={eyeColor} />
                <rect x="65" y="38" width="2" height="12" fill={eyeColor} />
                <rect x="53" y="48" width="14" height="2" fill={eyeColor} />
                <rect x="58" y="42" width="4" height="4" fill={eyeColor} />
              </>
            ) : currentExpression === 'serious' ? (
              <>
                {/* Closed serious eyes */}
                <rect x="35" y="42" width="12" height="2" fill={eyeColor} />
                <rect x="53" y="42" width="12" height="2" fill={eyeColor} />
              </>
            ) : (
              <>
                {/* Normal eyes */}
                <rect x="35" y="40" width="12" height="8" fill={eyeOpenColor} />
                <rect x="35" y="40" width="12" height="2" fill={eyeColor} />
                <rect x="35" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="45" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="35" y="46" width="12" height="2" fill={eyeColor} />
                <rect x="38" y="42" width="6" height="4" fill={eyeColor} />
                
                <rect x="53" y="40" width="12" height="8" fill={eyeOpenColor} />
                <rect x="53" y="40" width="12" height="2" fill={eyeColor} />
                <rect x="53" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="63" y="40" width="2" height="8" fill={eyeColor} />
                <rect x="53" y="46" width="12" height="2" fill={eyeColor} />
                <rect x="56" y="42" width="6" height="4" fill={eyeColor} />
              </>
            )}
          </>
        )}

        {/* Mouth - pixel art style */}
        {currentExpression === 'excited' ? (
          <>
            {/* Smile */}
            <rect x="40" y="52" width="20" height="2" fill={mouthColor} />
            <rect x="42" y="54" width="16" height="2" fill={mouthColor} />
            <rect x="44" y="56" width="12" height="2" fill={mouthColor} />
          </>
        ) : currentExpression === 'surprised' ? (
          <>
            {/* O mouth */}
            <rect x="45" y="52" width="10" height="8" fill={mouthColor} />
            <rect x="47" y="54" width="6" height="4" fill={faceColor} />
          </>
        ) : currentExpression === 'serious' ? (
          <>
            {/* Straight line */}
            <rect x="40" y="54" width="20" height="2" fill={mouthColor} />
          </>
        ) : (
          <>
            {/* Normal mouth */}
            <rect x="42" y="54" width="16" height="2" fill={mouthColor} />
            <rect x="44" y="56" width="12" height="2" fill={mouthColor} />
          </>
        )}

        {/* Robe - pixel art style */}
        <rect x="15" y="75" width="70" height="50" fill={robeColor} />
        <rect x="15" y="75" width="70" height="2" fill="#000000" />
        <rect x="15" y="75" width="2" height="50" fill="#000000" />
        <rect x="83" y="75" width="2" height="50" fill="#000000" />
        <rect x="15" y="123" width="70" height="2" fill="#000000" />
        {/* Robe details */}
        <rect x="20" y="85" width="60" height="2" fill="#5a3c83" />
        <rect x="25" y="95" width="50" height="2" fill="#5a3c83" />
        <rect x="30" y="105" width="40" height="2" fill="#5a3c83" />

        {/* Belt */}
        <rect x="20" y="115" width="60" height="6" fill={hatStarColor} />
        <rect x="20" y="115" width="60" height="2" fill="#000000" />
        <rect x="20" y="119" width="60" height="2" fill="#000000" />
        <rect x="48" y="117" width="4" height="2" fill="#000000" />

        {/* Legs */}
        <rect x="25" y="123" width="20" height="15" fill="#4a3a2a" />
        <rect x="25" y="123" width="20" height="2" fill="#000000" />
        <rect x="25" y="123" width="2" height="15" fill="#000000" />
        <rect x="43" y="123" width="2" height="15" fill="#000000" />
        <rect x="25" y="136" width="20" height="2" fill="#000000" />
        
        <rect x="55" y="123" width="20" height="15" fill="#4a3a2a" />
        <rect x="55" y="123" width="20" height="2" fill="#000000" />
        <rect x="55" y="123" width="2" height="15" fill="#000000" />
        <rect x="73" y="123" width="2" height="15" fill="#000000" />
        <rect x="55" y="136" width="20" height="2" fill="#000000" />

        {/* Shoes */}
        <rect x="20" y="138" width="30" height="8" fill="#000000" />
        <rect x="50" y="138" width="30" height="8" fill="#000000" />

        {/* Staff - pixel art style */}
        <rect x="85" y="80" width="4" height="50" fill={staffColor} />
        <rect x="85" y="80" width="4" height="2" fill="#000000" />
        <rect x="85" y="80" width="2" height="50" fill="#000000" />
        <rect x="87" y="80" width="2" height="50" fill="#000000" />
        <rect x="85" y="128" width="4" height="2" fill="#000000" />
        {/* Gem on staff */}
        <rect x="83" y="78" width="8" height="6" fill={gemColor} />
        <rect x="83" y="78" width="8" height="2" fill="#000000" />
        <rect x="83" y="78" width="2" height="6" fill="#000000" />
        <rect x="89" y="78" width="2" height="6" fill="#000000" />
        <rect x="83" y="82" width="8" height="2" fill="#000000" />
        <rect x="85" y="80" width="4" height="2" fill="#ffffff" />
      </svg>
    );
  };

  return (
    <div
      className="fixed bottom-8 right-8 z-50 cursor-pointer transition-all duration-300 hover:scale-105 animate-float"
      title="🧙‍♂️ Maître Charlatan vous observe..."
    >
      {renderPixelWizard()}
    </div>
  );
};

export default FloatingAvatar;
