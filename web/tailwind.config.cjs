module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        jelly: {
          '0%': { transform: 'scale(1,1)' },
          '25%': { transform: 'scale(1.25,0.75)' },
          '50%': { transform: 'scale(0.75,1.25)' },
          '75%': { transform: 'scale(1.15,0.85)' },
          '100%': { transform: 'scale(1,1)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        jelly: 'jelly 0.5s ease',
        fadeInUp: 'fadeInUp 0.6s ease-out',
        shimmer: 'shimmer 1.6s linear infinite'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.20)',
      }
    },
  },
  plugins: [],
}
