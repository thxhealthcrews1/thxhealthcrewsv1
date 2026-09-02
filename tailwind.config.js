/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
      animation: {
        'soft-float': 'soft-float 4.5s ease-in-out infinite',
        'letter-float': 'letter-float 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
