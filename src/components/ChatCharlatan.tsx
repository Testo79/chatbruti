import React, { useState, useEffect, useRef } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import BotAvatar, { AvatarExpression } from './BotAvatar';
import AIStatus from './AIStatus';
import { useAuth } from '../contexts/AuthContext';
import { 
  generateResponse, 
  getWelcomeMessage, 
  getTypingMessage,
  MoodMode
} from '../utils/chatEngine';
import type { ChatMessage as AIChatMessage } from '../services/aiService';
import { 
  createConversation, 
  updateConversationMessages
} from '../services/conversationService';

interface ChatCharlatanProps {
  onUserMessage?: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  initialMessages?: Message[];
  conversationId?: string | null;
}

const ChatCharlatan: React.FC<ChatCharlatanProps> = ({ 
  onUserMessage,
  onTypingChange,
  initialMessages,
  conversationId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [mood, setMood] = useState<MoodMode>('philosophe');
  const [avatarExpression, setAvatarExpression] = useState<AvatarExpression>('idle');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Mettre à jour le conversationId quand il change
  useEffect(() => {
    setCurrentConversationId(conversationId || null);
  }, [conversationId]);
  
  // Charger les messages initiaux ou le message de bienvenue
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      return; // Ne pas charger le message de bienvenue si on charge une conversation
    }
    
    // Si pas de messages initiaux et pas de conversationId, charger le message de bienvenue
    if (!conversationId) {
      const loadWelcome = async () => {
        const welcomeResponse = await getWelcomeMessage(mood);
        const welcomeMsg: Message = {
          id: '0',
          text: welcomeResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          expression: welcomeResponse.expression,
          isStreaming: true, // Activer le streaming pour le message de bienvenue
        };
        setMessages([welcomeMsg]);
        setAvatarExpression(welcomeResponse.expression);
        
        // Désactiver le streaming après que tout le texte soit affiché
        const estimatedTime = welcomeResponse.text.length * 30;
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === welcomeMsg.id ? { ...msg, isStreaming: false } : msg
          ));
        }, estimatedTime);
        
        // Retour à idle après la fin du streaming
        setTimeout(() => setAvatarExpression('idle'), estimatedTime + 1000);
      };
      loadWelcome();
    } else {
      // Si on a un conversationId mais pas de messages, réinitialiser
      setMessages([]);
    }
  }, [initialMessages, mood, conversationId]);
  
  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    if (!user || messages.length === 0) return;
    
    const saveMessages = async () => {
      // Ne pas sauvegarder le message de bienvenue seul
      if (messages.length === 1 && messages[0].sender === 'bot') return;
      
      // Ne pas sauvegarder si on vient juste de charger une conversation (éviter les boucles)
      if (initialMessages && initialMessages.length > 0 && messages.length === initialMessages.length) {
        return;
      }
      
      let convId = currentConversationId;
      
      // Créer une nouvelle conversation si nécessaire
      if (!convId) {
        const firstUserMessage = messages.find(m => m.sender === 'user');
        const title = firstUserMessage 
          ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
          : 'Nouvelle conversation';
        
        const newConv = await createConversation(user.id, title);
        convId = newConv.id;
        setCurrentConversationId(convId);
      }
      
      // Mettre à jour les messages de la conversation
      await updateConversationMessages(convId, messages);
    };
    
    // Debounce pour éviter trop de sauvegardes
    const timeoutId = setTimeout(saveMessages, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, user, currentConversationId, initialMessages]);
  
  const scrollToBottom = (force = false) => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;
    
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (force || isNearBottom) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  };
  
  // Auto-scroll pendant le streaming
  useEffect(() => {
    if (messages.some(m => m.isStreaming)) {
      const interval = setInterval(() => {
        scrollToBottom(true);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setAvatarExpression('thinking');
    
    if (onUserMessage) {
      onUserMessage(inputValue);
    }
    
    scrollToBottom(true);
    
    // Générer le message de typing
    const typingMsg = await getTypingMessage(mood);
    setTypingMessage(typingMsg);
    
    // Préparer l'historique de conversation pour l'IA
    const conversationHistory: AIChatMessage[] = messages
      .filter(m => m.sender === 'bot' || m.sender === 'user')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
    
    // Ajouter le message utilisateur actuel
    conversationHistory.push({
      role: 'user',
      content: inputValue,
    });
    
    try {
      const response = await generateResponse(inputValue, mood, conversationHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        expression: response.expression,
        isStreaming: true, // Activer le streaming pour ce message
      };
      
      setMessages(prev => [...prev, botMessage]);
      setAvatarExpression(response.expression);
      
      // Désactiver le streaming après que tout le texte soit affiché
      const estimatedTime = response.text.length * 30; // Temps estimé en ms
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessage.id ? { ...msg, isStreaming: false } : msg
        ));
      }, estimatedTime);
      
      // Retour à idle après la fin du streaming
      setTimeout(() => setAvatarExpression('idle'), estimatedTime + 1000);
      
      scrollToBottom(true);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        sender: 'bot',
        timestamp: new Date(),
        expression: 'confused',
      };
      setMessages(prev => [...prev, errorMessage]);
      setAvatarExpression('confused');
    } finally {
      setIsTyping(false);
      setTypingMessage('');
      if (onTypingChange) {
        onTypingChange(false);
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="bg-[#f5f5f5] dark:bg-[#1a1a1a] pixel-border overflow-hidden">
      {/* En-tête du chat avec avatar et sélecteur d'humeur */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b-4 border-black dark:border-white px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center">
            {/* Avatar animé principal */}
            <div className="mr-4">
              <BotAvatar 
                expression={avatarExpression} 
                size="medium" 
                animated={true}
              />
            </div>
            <div>
              <h3 className="text-black dark:text-white font-pixel text-base pixel-text">MAITRE CHARLATAN</h3>
              <p className="text-pixel-accent dark:text-[#50a0ff] text-sm font-pixel mb-1">
                &gt; IA ASSISTANT &lt;
              </p>
              <AIStatus />
            </div>
          </div>
          
          {/* Sélecteur d'humeur */}
          <div className="flex gap-3">
            <button
              onClick={() => setMood('philosophe')}
              className={`px-4 py-3 pixel-button text-sm font-pixel ${
                mood === 'philosophe' 
                  ? 'bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black' 
                  : 'bg-white dark:bg-[#1a1a1a] text-pixel-accent dark:text-[#50a0ff]'
              }`}
              title="Mode Philosophe"
            >
              PHILO
            </button>
            <button
              onClick={() => setMood('poete')}
              className={`px-4 py-3 pixel-button text-sm font-pixel ${
                mood === 'poete' 
                  ? 'bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black' 
                  : 'bg-white dark:bg-[#1a1a1a] text-pixel-accent dark:text-[#50a0ff]'
              }`}
              title="Mode Poète raté"
            >
              POETE
            </button>
            <button
              onClick={() => setMood('coach')}
              className={`px-4 py-3 pixel-button text-sm font-pixel ${
                mood === 'coach' 
                  ? 'bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black' 
                  : 'bg-white dark:bg-[#1a1a1a] text-pixel-accent dark:text-[#50a0ff]'
              }`}
              title="Mode Coach low-cost"
            >
              COACH
            </button>
          </div>
        </div>
      </div>
      
      {/* Zone de messages */}
      <div className="h-[500px] overflow-y-auto px-5 py-4 bg-white dark:bg-black">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Indicateur de typing avec avatar animé */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <BotAvatar 
                  expression="thinking" 
                  size="small" 
                  animated={true}
                />
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] pixel-border px-4 py-3">
                <p className="text-pixel-accent dark:text-[#50a0ff] text-sm font-pixel pixel-blink">
                  {typingMessage || '&gt; ANALYSE... &lt;'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Auto-scroll - toujours présent pour suivre les nouveaux messages */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de saisie */}
      <div className="bg-white dark:bg-[#1a1a1a] border-t-4 border-black dark:border-white px-5 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="&gt; QUESTION..."
            className="flex-1 pixel-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="pixel-button bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black px-5 py-3 text-sm font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </div>
        <p className="text-black dark:text-white text-xs font-pixel mt-3 text-center">
          [ENTREE] POUR ENVOYER
        </p>
      </div>
    </div>
  );
};

export default ChatCharlatan;
