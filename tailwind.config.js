/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          void: '#050810',
          primary: '#0A0E17',
          secondary: '#111827',
          elevated: '#1F2937',
          border: '#374151',
        },
        accent: {
          cyan: '#00E5FF',
          teal: '#14B8A6',
          amber: '#F59E0B',
        },
        threat: {
          red: '#EF4444',
          glow: '#FF1744',
          orange: '#F97316',
        },
        status: {
          safe: '#10B981',
          warn: '#FBBF24',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scan-line': 'scanLine 4s linear infinite',
        'count-up': 'countUp 1s ease-out',
        'pin-drop': 'pinDrop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        'reveal': 'reveal 0.4s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scanLine: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        pinDrop: {
          '0%': { transform: 'scale(0) translateY(-20px)', opacity: '0' },
          '60%': { transform: 'scale(1.2) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        reveal: {
          '0%': { transform: 'scale(0.95)', opacity: '0', filter: 'blur(4px)' },
          '100%': { transform: 'scale(1)', opacity: '1', filter: 'blur(0)' },
        },
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
