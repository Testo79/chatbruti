/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
      },
      colors: {
        // 3 couleurs maximum - Light mode
        'pixel-bg': '#ffffff',
        'pixel-bg-light': '#f5f5f5',
        'pixel-bg-surface': '#ffffff',
        'pixel-accent': '#2060b0', // Bleu unique
        // Dark mode colors (via dark: prefix)
        // Legacy colors (pour compatibilité)
        'nird-dark': '#000000',
        'nird-light': '#1a1a1a',
        'light-bg': '#ffffff',
        'light-surface': '#ffffff',
        'light-text': '#000000',
        // Dark mode (night) - via dark: prefix
        // Legacy colors (pour compatibilité)
        'nird-dark': '#1a1a2e',
        'nird-purple': '#8030d0',
        'nird-blue': '#3080d0',
        'nird-light': '#2a2a3e',
        'light-bg': '#f8f8d0',
        'light-surface': '#ffffff',
        'light-text': '#2d2d2d',
        'light-purple': '#8030d0',
      },
      boxShadow: {
        'pixel': '4px 4px 0 0 var(--pixel-shadow), 4px 4px 0 2px var(--bg-primary)',
        'pixel-sm': '2px 2px 0 0 var(--pixel-shadow), 2px 2px 0 1px var(--bg-primary)',
        'pixel-inset': 'inset 2px 2px 0 var(--bg-primary), inset -2px -2px 0 var(--pixel-shadow)',
      },
    },
  },
  plugins: [],
}


