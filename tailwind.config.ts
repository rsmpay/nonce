import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Vault - Background Layers
        obsidian: '#09090b',
        onyx: '#121215',
        glass: '#1c1c21',

        // Accent Colors - Liquid Gold
        gold: {
          DEFAULT: '#c9a227',
          dark: '#9e7b1a',
          light: '#f4e4a6',
        },

        // Neutral Scale - Steel
        steel: {
          100: '#e8e8ec',
          200: '#c4c4cc',
          300: '#9898a4',
          400: '#6b6b7a',
          500: '#45455a',
        },

        // Legacy mappings for compatibility
        primary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c9a227',
          600: '#c9a227',
          700: '#9e7b1a',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        background: '#09090b',
        surface: '#121215',
        'surface-light': '#1c1c21',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 1px 2px rgba(201, 162, 39, 0.1)',
        'gold-md': '0 4px 6px rgba(201, 162, 39, 0.1), 0 2px 4px rgba(201, 162, 39, 0.06)',
        'gold-lg': '0 10px 15px rgba(201, 162, 39, 0.1), 0 4px 6px rgba(201, 162, 39, 0.05)',
        'gold-glow': '0 0 20px rgba(201, 162, 39, 0.3)',
        'vault': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderColor: {
        'gold-hairline': 'rgba(201, 162, 39, 0.12)',
        'gold-subtle': 'rgba(201, 162, 39, 0.2)',
      },
      animation: {
        'vault-reveal': 'vault-reveal 0.3s ease-out',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
        'gold-shimmer': 'gold-shimmer 2s linear infinite',
      },
      keyframes: {
        'vault-reveal': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
