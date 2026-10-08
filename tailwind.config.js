/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vuihoc: {
          orange: '#FF6600',
          orangeDark: '#E55C00',
          pink: '#FF6584',
          yellow: '#FFB800',
          blue: '#2B82C9',
          green: '#10B981',
          purple: '#9333EA',
          bg: '#FFF8F0'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
