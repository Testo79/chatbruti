import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-black border-t-4 border-black dark:border-white py-5 mt-8 w-full">
      <div className="container mx-auto px-4">
        <div className="text-center text-black dark:text-white font-pixel">
          <p className="mb-3 text-sm">
            <span className="text-pixel-accent dark:text-[#50a0ff]">[NUIT DE L'INFO 2025]</span> – 
            DEFI VIVERIS
          </p>
          <p className="text-xs mb-2">
            &gt; POKEMON GBA STYLE CHATBOT &lt;
          </p>
          <p className="text-xs text-pixel-accent dark:text-[#50a0ff]">
            [REPO] GITHUB.COM/NOM-EQUIPE/CHAT-RLATAN
          </p>
          <p className="text-xs mt-3 text-black dark:text-white">
            [LICENCE] MIT - LIBRE D'UTILISATION
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


