/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        page: {
          DEFAULT: '#ffffff',
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#f7f7f7',
          hover: '#efefef',
          dark: '#0d0d0d',
          'dark-hover': '#161616',
        },
        line: {
          DEFAULT: '#e5e5e5',
          dark: '#1f1f1f',
        },
        ink: {
          DEFAULT: '#111111',
          muted: '#666666',
          faint: '#999999',
          dark: '#f5f5f5',
          'dark-muted': '#a3a3a3',
          'dark-faint': '#737373',
        },
        accent: {
          DEFAULT: '#525252',
          dark: '#d4d4d4',
        },
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04)',
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
