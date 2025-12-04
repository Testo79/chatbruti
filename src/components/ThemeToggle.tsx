import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-4 right-4 z-40
        w-14 h-14
        pixel-button
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        ${
          theme === 'dark'
            ? 'bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-white'
            : 'bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-white'
        }
      `}
      title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label="Toggle theme"
    >
      <span className="text-xl font-pixel">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
};

export default ThemeToggle;
