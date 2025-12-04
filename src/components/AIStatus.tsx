import React, { useEffect, useState } from 'react';
import { getAvailableProvider } from '../services/aiService';

const AIStatus: React.FC = () => {
  const [provider, setProvider] = useState<string>('...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const p = await getAvailableProvider();
        setProvider(p);
      } catch (error) {
        setProvider('local');
      } finally {
        setLoading(false);
      }
    };
    checkProvider();
  }, []);

  const getStatusInfo = () => {
    switch (provider) {
      case 'ollama':
        return {
          text: 'OLLAMA',
          color: 'text-pixel-accent dark:text-[#50a0ff]',
        };
      case 'openai':
        return {
          text: 'OPENAI',
          color: 'text-pixel-accent dark:text-[#50a0ff]',
        };
      case 'gemini':
        return {
          text: 'GEMINI',
          color: 'text-pixel-accent dark:text-[#50a0ff]',
        };
      case 'local':
      default:
        return {
          text: 'LOCAL',
          color: 'text-pixel-accent dark:text-[#50a0ff]',
        };
    }
  };

  const status = getStatusInfo();

  if (loading) {
    return (
      <div className="text-xs font-pixel text-pixel-accent dark:text-[#50a0ff] pixel-blink">
        [LOADING...]
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 pixel-border ${status.color} bg-white dark:bg-[#1a1a1a]`}>
      <span className="text-xs font-pixel">[{status.text}]</span>
    </div>
  );
};

export default AIStatus;

