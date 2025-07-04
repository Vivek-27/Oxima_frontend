/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'inner-glow': 'inset 0 0 8px rgba(255, 255, 255, 0.3)'
      }
    }
  },
  plugins: []
};
