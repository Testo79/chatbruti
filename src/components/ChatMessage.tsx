import React, { useState, useEffect, useRef } from 'react';
import BotAvatar, { AvatarExpression } from './BotAvatar';
import { playTypewriterSound } from '../utils/typewriterSound';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  expression?: AvatarExpression;
  isStreaming?: boolean; // Indique si le message est en cours de streaming
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef(0);
  
  useEffect(() => {
    // Si c'est un message bot et qu'il doit être streamé
    if (isBot && message.isStreaming && message.text) {
      setIsStreaming(true);
      charIndexRef.current = 0;
      setDisplayedText('');
      
      const streamText = () => {
        if (charIndexRef.current < message.text.length) {
          const nextChar = message.text[charIndexRef.current];
          setDisplayedText(prev => prev + nextChar);
          
          // Jouer le son pour certains caractères (pas pour les espaces)
          if (nextChar !== ' ' && nextChar !== '\n') {
            playTypewriterSound();
          }
          
          charIndexRef.current++;
          
          // Vitesse variable selon le caractère (plus rapide pour espaces/ponctuation)
          const delay = nextChar === ' ' || nextChar === '\n' ? 10 : 
                       nextChar === '.' || nextChar === '!' || nextChar === '?' ? 50 : 30;
          
          setTimeout(streamText, delay);
        } else {
          setIsStreaming(false);
          if (soundIntervalRef.current) {
            clearInterval(soundIntervalRef.current);
          }
        }
      };
      
      // Démarrer le streaming après un court délai
      setTimeout(streamText, 100);
      
      return () => {
        if (soundIntervalRef.current) {
          clearInterval(soundIntervalRef.current);
        }
      };
    } else {
      // Message normal, afficher tout le texte
      setDisplayedText(message.text);
      setIsStreaming(false);
    }
  }, [message.text, message.isStreaming, isBot]);
  
  return (
    <div className={`flex mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? 'mr-2' : 'ml-2'}`}>
          {isBot ? (
            <BotAvatar 
              expression={message.expression || 'idle'} 
              size="small" 
              animated={false}
            />
          ) : (
            <div className="w-12 h-12 pixel-border bg-pixel-accent dark:bg-[#50a0ff] flex items-center justify-center text-base font-pixel text-white dark:text-black">
              U
            </div>
          )}
        </div>
        
        {/* Message bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-3 pixel-border ${
            isBot 
              ? 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white' 
              : 'bg-pixel-accent dark:bg-[#50a0ff] text-white dark:text-black'
          }`}>
            <p className="text-xs font-pixel mb-2 opacity-75">
              {isBot ? 'CHARLATAN' : 'VOUS'}
            </p>
            <p className="text-sm font-pixel leading-relaxed whitespace-pre-wrap">
              {displayedText}
              {isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 pixel-blink">|</span>}
            </p>
          </div>
          <span className={`text-xs font-pixel text-black dark:text-white mt-2 ${isBot ? 'text-left' : 'text-right'}`}>
            [{message.timestamp.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}]
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;


