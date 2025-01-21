/* Path: frontend/tailwind.config.js */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        genshin: ['HYWenHei', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'pulse-fast': 'pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scale': 'scale 0.2s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        typewriter: 'typewriter 50ms ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.15' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        typewriter: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        glow: {
          '0%, 100%': { 
            'box-shadow': '0 0 15px rgba(139, 92, 246, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            'box-shadow': '0 0 25px rgba(139, 92, 246, 0.8)',
            transform: 'scale(1.02)'
          }
        }
      }
    },
  },
  plugins: [],
}