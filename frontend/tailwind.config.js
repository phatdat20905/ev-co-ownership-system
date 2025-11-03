/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        card: '#ffffff',
        border: '#e5e7eb',
        primary: '#22c55e',
        secondary: '#3b82f6',
        accent: '#a855f7',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        'primary-foreground': '#ffffff',
      },
      boxShadow: {
        elegant: '0 10px 30px rgba(0,0,0,.08)'
      },
      transitionProperty: {
        smooth: 'all'
      }
    },
  },
  plugins: [],
}