/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#F7F9F8',
        'bg-surface': '#FFFFFF',
        'bg-elevated': '#EEF4F2',
        'bg-sunken': '#E8F0ED',
        
        'border-default': '#B0CEC4',
        'border-strong': '#8AB5A8',
        
        'text-primary': '#0F2420',
        'text-secondary': '#2D4A44',
        'text-muted': '#4A6B63',
        'text-ghost': '#6B9A92',
        
        'accent-teal': '#0D9488',
        'accent-teal-light': '#CCFBF1',
        'accent-blue': '#0891B2',
        'accent-blue-light': '#CFFAFE',
        'accent-green': '#16A34A',
        'accent-green-light': '#DCFCE7',
        
        'risk-high': '#DC2626',
        'risk-high-bg': '#FEF2F2',
        'risk-medium': '#D97706',
        'risk-medium-bg': '#FFFBEB',
        'risk-low': '#16A34A',
        'risk-low-bg': '#F0FDF4',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['Mary Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease-out',
        'pulse-ring': 'pulseRing 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'breathe': 'breathe 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'reveal': 'reveal 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13,148,136,0.2)' },
          '50%': { boxShadow: '0 0 0 6px rgba(13,148,136,0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to: { backgroundPosition: '200% center' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
