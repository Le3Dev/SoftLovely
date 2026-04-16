module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        love: {
          50:  '#FFF8FA',
          100: '#FFF0F3',
          200: '#FFCCD5',
          300: '#FF8FA3',
          400: '#FF4D7A',
          500: '#E63264',
          600: '#C9184A',
          700: '#A4003D',
          800: '#7B0033',
          900: '#4A0020',
        },
      },
      animation: {
        'float':        'floatUp 3.5s ease-in-out infinite',
        'heartbeat':    'heartbeat 1.6s ease-in-out infinite',
        'fadeInUp':     'fadeInUp 0.7s ease both',
        'fadeInScale':  'fadeInScale 0.55s ease both',
        'slideInLeft':  'slideInLeft 0.65s ease both',
        'slideInRight': 'slideInRight 0.65s ease both',
        'glow':         'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-14px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%':       { transform: 'scale(1.22)' },
          '30%':       { transform: 'scale(1)' },
          '45%':       { transform: 'scale(1.14)' },
          '60%':       { transform: 'scale(1)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.88)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,24,74,0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(201,24,74,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
