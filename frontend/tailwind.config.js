/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Force Vite to reload Tailwind config
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef1ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f6ef7',
          700: '#4338ca',
          800: '#3730a3',
        },
        navy: {
          50: '#f0f3f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0b1c2d',
        },
        sidebar: '#14114a',
        brand: '#4f6ef7',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        sora: ['Cabinet Grotesk', 'sans-serif'],
        display: ['Cabinet Grotesk', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0,0,0,0.05), 0 0 3px rgba(0,0,0,0.02)',
        'card-hover': '0 12px 30px -4px rgba(79,110,247,0.12), 0 0 3px rgba(79,110,247,0.05)',
      },
    },
  },
  plugins: [],
}
