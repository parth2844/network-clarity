/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        'first-party': '#22c55e',
        'third-party': '#eab308',
        'tracker': '#ef4444',
      },
    },
  },
  plugins: [],
}
