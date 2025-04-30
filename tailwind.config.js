/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Escaneia os arquivos para classes do Tailwind
  theme: {
    extend: {
      colors: {
        customBlue: '#052440', // Adiciona a cor personalizada ao tema
      },
    },
  },
  plugins: [],
};