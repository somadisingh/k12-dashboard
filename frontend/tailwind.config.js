/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#111827',
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        page: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
