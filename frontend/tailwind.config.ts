import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf2ff',
          100: '#dce5ff',
          200: '#bfd0ff',
          300: '#96b1ff',
          400: '#6c8cf5',
          500: '#4468df',
          600: '#1f3c88',
          700: '#1b346f',
          800: '#172b59',
          900: '#132247',
        },
        surface: {
          0: '#ffffff',
          50: '#faf8f3',
          100: '#f2eee6',
          200: '#e5dfd4',
          300: '#d6cdbd',
          700: '#4b5872',
          800: '#2c3954',
          900: '#172033',
        },
        dark: {
          DEFAULT: '#0f172a',
          50: '#334155',
          100: '#1e293b',
          200: '#1e293b',
          300: '#0f172a',
          400: '#020617',
        },
        accent: {
          DEFAULT: '#1f3c88',
          hover: '#1b346f',
          light: '#4468df',
        },
        neon: {
          purple: '#6366f1',
          blue: '#3b82f6',
          green: '#16a34a',
          orange: '#d97706',
          pink: '#db2777',
        },
      },
      fontFamily: {
        sans: ['"Sora"', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-up': 'slideUp 0.45s ease-out',
        'slide-right': 'slideRight 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
