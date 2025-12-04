import React from 'react';
import AuthButton from './AuthButton';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-[#1a1a1a] border-b-4 border-black dark:border-white pixel-border w-full">
      <div className="container mx-auto px-4 py-5">
        {/* Barre d'outils en haut */}
        <div className="flex justify-end items-center mb-4 pr-20">
          <AuthButton />
        </div>

        {/* Contenu principal du header */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-pixel text-black dark:text-white mb-4 pixel-text">
            [*] CHAT-RLATAN [*]
          </h1>
          <p className="text-sm md:text-base font-pixel text-pixel-accent dark:text-[#50a0ff] mb-4">
            &gt; POKEMON GBA STYLE CHATBOT &lt;
          </p>
          <div className="inline-block bg-pixel-accent dark:bg-[#50a0ff] text-white dark:text-black px-4 py-3 pixel-border font-pixel text-sm md:text-base">
            [ NUIT DE L'INFO 2025 ]
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


