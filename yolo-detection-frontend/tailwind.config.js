/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kku-gold': '#FFB81C',      // สีทอง มข.
        'kku-maroon': '#8B2332',    // สีแดงเลือดหมู มข.
      },
    },
  },
  plugins: [],
}