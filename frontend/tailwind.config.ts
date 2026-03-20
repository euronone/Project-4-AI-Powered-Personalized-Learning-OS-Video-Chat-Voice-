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
        'fade-in': 'fadeIn 0.45s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right': 'slideRight 0.35s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'count-up': 'countUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-up-1': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both',
        'slide-up-2': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        'slide-up-3': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        'slide-up-4': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        'slide-up-5': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both',
        'slide-up-6': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both',
        'slide-up-7': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both',
        'slide-up-8': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
